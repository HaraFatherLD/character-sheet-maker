// Application controller: state, live preview, autosave, uploads and exports.
import { normalizeCharacter } from '../core/schema.js';
import { sampleCharacter } from '../core/sample.js';
import { buildViewModel } from '../core/view-model.js';
import { COMMON_CSS } from '../core/common-css.js';
import { exportHtml } from '../core/export-html.js';
import { computeOutputSize, resolveBaseSize } from '../core/size.js';
import { safeFilename } from '../core/filename.js';
import { getTemplate } from '../templates/index.js';
import { toDom } from './dom.js';
import { buildForm } from './form.js';
import { ART_MAX_SIDE, ICON_MAX_SIDE, loadImageFile } from './images.js';
import { rasterize } from './raster.js';
import { downloadBlob, downloadText } from './download.js';

const STORAGE_KEY = 'character-sheet-maker:v1';
const IMAGE_FAIL = '이미지 저장에 실패했습니다. HTML 다운로드를 이용해 주세요';
const IMAGE_LABELS = { art: '일러스트', icon: '아이콘' };
const HEAVY_IMAGE_CHARS = 400000;
const $ = (id) => document.getElementById(id);

function loadInitial() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text === null) return { data: sampleCharacter(), note: '' };
    const result = normalizeCharacter(JSON.parse(text));
    if (result.ok) return { data: result.value, note: '저장된 내용을 불러왔습니다.' };
  } catch (error) {
    console.warn('saved data could not be read', error);
  }
  return { data: sampleCharacter(), note: '저장된 데이터를 읽을 수 없어 샘플로 시작했습니다.' };
}

const initial = loadInitial();
const state = {
  raw: structuredClone(initial.data),
  data: initial.data,
  images: { art: null, icon: null },
  out: { format: 'png', preset: '1x', customWidth: '' },
};
const styleElement = document.head.appendChild(document.createElement('style'));
let appliedCss = '';
let renderTimer = 0;
let form = null;

function setStatus(text, kind = 'info') {
  const node = $('status');
  node.textContent = text;
  node.dataset.kind = kind;
}

function saveNow() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  } catch (error) {
    console.warn('autosave failed', error);
    setStatus('자동 저장에 실패했습니다. 브라우저 저장소를 사용할 수 없습니다.', 'error');
  }
}

/**
 * Sheet size used for the preview frame, the size readout, the raster viewBox and the output size. Fixed designs
 * return their own size; auto-height designs use the rendered sheet's scrollHeight (unaffected by the preview scale).
 */
function measuredBase() {
  const { size } = getTemplate(state.data.template);
  const node = $('sheet-mount').firstElementChild;
  return resolveBaseSize(size, node ? node.scrollHeight : undefined);
}

function fitPreview() {
  const size = measuredBase();
  const available = $('preview-viewport').clientWidth;
  const scale = available > 0 ? Math.min(1, available / size.w) : 1;
  const inner = $('preview-scale');
  inner.style.width = `${size.w}px`;
  inner.style.height = `${size.h}px`;
  inner.style.transform = `scale(${scale})`;
  $('preview-frame').style.width = `${Math.round(size.w * scale)}px`;
  $('preview-frame').style.height = `${Math.round(size.h * scale)}px`;
}

function renderPreview() {
  const template = getTemplate(state.data.template);
  try {
    const tree = toDom(template.render(buildViewModel(state.data, state.images)), document);
    if (appliedCss !== template.id) {
      styleElement.textContent = `${COMMON_CSS}\n${template.css}`;
      appliedCss = template.id;
    }
    $('sheet-mount').replaceChildren(tree);
  } catch (error) {
    console.warn('preview render failed', error);
    setStatus('미리보기를 그리지 못했습니다.', 'error');
  }
  fitPreview();
  if (form) form.afterRender();
}

function scheduleRender() {
  clearTimeout(renderTimer);
  const heavy = (state.images.art || '').length + (state.images.icon || '').length > HEAVY_IMAGE_CHARS;
  if (heavy) renderTimer = setTimeout(renderPreview, 90);
  else renderPreview();
}

function commit() {
  const result = normalizeCharacter(state.raw);
  if (result.ok) state.data = result.value;
  if (form) form.refresh();
  scheduleRender();
  saveNow();
}

async function uploadImage(kind, file) {
  setStatus('이미지를 불러오는 중입니다…');
  const result = await loadImageFile(file, kind === 'art' ? ART_MAX_SIDE : ICON_MAX_SIDE);
  if (!result.ok) {
    setStatus(`${result.error} 기존 ${IMAGE_LABELS[kind]}은(는) 그대로 유지됩니다.`, 'error');
    return;
  }
  state.images[kind] = result.dataUrl;
  setStatus(`${IMAGE_LABELS[kind]} 이미지를 적용했습니다 (${result.width}×${result.height}px).`, 'ok');
  scheduleRender();
}

function removeImage(kind) {
  state.images[kind] = null;
  setStatus(`${IMAGE_LABELS[kind]} 이미지를 제거했습니다.`, 'ok');
  scheduleRender();
}

const baseName = () => (state.data.name ? `캐릭터시트_${state.data.name}` : '캐릭터시트');

async function exportImage() {
  const template = getTemplate(state.data.template);
  const { format, preset, customWidth } = state.out;
  setStatus('이미지를 만드는 중입니다…');
  try {
    clearTimeout(renderTimer);
    renderPreview(); // the measured height must belong to the current data (a delayed render may still be pending)
    const base = measuredBase();
    const out = computeOutputSize(base, preset, customWidth);
    const blob = await rasterize(template, buildViewModel(state.data, state.images), out, format, base);
    downloadBlob(blob, safeFilename(baseName(), format === 'jpeg' ? 'jpg' : 'png'));
    setStatus(`이미지를 저장했습니다 (${out.width} × ${out.height}px).`, 'ok');
  } catch (error) {
    console.warn('image export failed', error);
    setStatus(IMAGE_FAIL, 'error');
  }
}

function exportHtmlFile() {
  const result = exportHtml(state.data, state.images, getTemplate(state.data.template));
  if (!result.ok) {
    setStatus(result.error, 'error');
    return;
  }
  downloadText(result.html, safeFilename(baseName(), 'html'));
  setStatus('HTML 파일을 저장했습니다.', 'ok');
}

function resetSample() {
  state.raw = structuredClone(sampleCharacter());
  state.images = { art: null, icon: null };
  commit();
  form.sync();
  setStatus('샘플 캐릭터로 초기화했습니다.', 'ok');
}

function init() {
  const ctx = { state, commit, setStatus, baseSize: measuredBase, uploadImage, removeImage, exportImage, exportHtmlFile, resetSample };
  form = buildForm($('form-root'), ctx);
  form.sync();
  renderPreview();
  let lastWidth = 0;
  new ResizeObserver(() => {
    const width = $('preview-viewport').clientWidth;
    if (width !== lastWidth) { lastWidth = width; fitPreview(); }
  }).observe($('preview-viewport'));
  if (initial.note) setStatus(initial.note);
}

init();
