// Application controller: state, live preview, autosave and exports. The pictures live in image-flow.js.
import { normalizeCharacter } from '../core/schema.js';
import { sampleCharacter } from '../core/sample.js';
import { buildViewModel } from '../core/view-model.js';
import { COMMON_CSS } from '../core/common-css.js';
import { exportHtml } from '../core/export-html.js';
import { computeOutputSize, effectiveSize, resolveBaseSize } from '../core/size.js';
import { scaleWrap } from '../core/scale-wrap.js';
import { safeFilename } from '../core/filename.js';
import { getTemplate } from '../templates/index.js';
import { toDom } from './dom.js';
import { buildForm } from './form.js';
import { createImageFlow } from './image-flow.js';
import { rasterize } from './raster.js';
import { downloadBlob, downloadText } from './download.js';

const STORAGE_KEY = 'character-sheet-maker:v1';
const IMAGE_FAIL = '이미지 저장에 실패했습니다. HTML 다운로드를 이용해 주세요';
const HTML_FAIL = 'HTML 저장에 실패했습니다.';
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
  images: { art: null, icon: null }, // uploaded pictures as data URLs (memory only; they beat the stored addresses)
  failed: { art: '', icon: '' }, // stored addresses the preview could not load (the built-in art is shown meanwhile)
  out: { format: 'png', preset: '1x', customWidth: '', imageMode: 'embed' },
};
const styleElement = document.head.appendChild(document.createElement('style'));
let appliedCss = '';
let renderTimer = 0;
let exporting = false; // one export at a time: a second click while the first still converts would download twice
let form = null;
const flow = createImageFlow({ state, setStatus, commit, render: renderPreview });

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
 * Sheet size used for the preview frame, the size readout, the raster viewBox and the output size. It starts from the
 * size the user's width gives (effectiveSize): fixed designs return that size as it is; auto-height designs use the
 * rendered sheet's scrollHeight (unaffected by the preview scale) at the chosen width.
 */
function measuredBase() {
  const eff = effectiveSize(getTemplate(state.data.template), state.data.sheetWidths);
  const node = $('sheet-mount').firstElementChild;
  return resolveBaseSize(eff, node ? node.scrollHeight : undefined);
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
    const vm = buildViewModel(state.data, flow.previewImages());
    const tree = toDom(scaleWrap(template.render(vm), effectiveSize(template, state.data.sheetWidths)), document);
    if (appliedCss !== template.id) {
      styleElement.textContent = `${COMMON_CSS}\n${template.css}`;
      appliedCss = template.id;
    }
    $('sheet-mount').replaceChildren(tree);
    flow.watchPreview($('sheet-mount'));
  } catch (error) {
    console.warn('preview render failed', error);
    setStatus('미리보기를 그리지 못했습니다.', 'error');
  }
  fitPreview();
  if (form) form.afterRender();
}

function scheduleRender() {
  clearTimeout(renderTimer);
  // Big uploads and remote pictures (requested again whenever their <img> is rebuilt) are drawn once per pause in typing.
  const heavy = (state.images.art || '').length + (state.images.icon || '').length > HEAVY_IMAGE_CHARS;
  const remote = state.data.artUrl !== '' || state.data.iconUrl !== '';
  if (heavy || remote) renderTimer = setTimeout(renderPreview, 90);
  else renderPreview();
}

function commit() {
  const result = normalizeCharacter(state.raw);
  if (result.ok) state.data = result.value;
  if (form) form.refresh();
  scheduleRender();
  saveNow();
}

const baseName = () => (state.data.name ? `캐릭터시트_${state.data.name}` : '캐릭터시트');

async function exportImage() {
  if (exporting) return;
  exporting = true;
  setStatus('이미지를 만드는 중입니다…');
  try {
    const images = await flow.embeddedImages(); // PNG/JPEG always carry their pictures, whatever the HTML option says
    if (!images) return; // the status already explains why
    const template = getTemplate(state.data.template);
    const { format, preset, customWidth } = state.out;
    clearTimeout(renderTimer);
    renderPreview(); // the measured height must belong to the current data (a delayed render may still be pending)
    const base = measuredBase();
    const out = computeOutputSize(base, preset, customWidth);
    const blob = await rasterize(template, buildViewModel(state.data, images), out, format, base);
    downloadBlob(blob, safeFilename(baseName(), format === 'jpeg' ? 'jpg' : 'png'));
    setStatus(`이미지를 저장했습니다 (${out.width} × ${out.height}px).`, 'ok');
  } catch (error) {
    console.warn('image export failed', error);
    setStatus(IMAGE_FAIL, 'error');
  } finally {
    exporting = false;
  }
}

async function exportHtmlFile() {
  if (exporting) return;
  exporting = true;
  const imageMode = state.out.imageMode === 'link' ? 'link' : 'embed';
  setStatus('HTML 파일을 만드는 중입니다…');
  try {
    const images = imageMode === 'link' ? flow.linkImages() : await flow.embeddedImages();
    if (!images) return; // the status already explains why
    const result = exportHtml(state.data, images, getTemplate(state.data.template), { imageMode });
    if (!result.ok) {
      setStatus(result.error, 'error');
      return;
    }
    downloadText(result.html, safeFilename(baseName(), 'html'));
    setStatus('HTML 파일을 저장했습니다.', 'ok');
  } catch (error) {
    console.warn('html export failed', error);
    setStatus(HTML_FAIL, 'error');
  } finally {
    exporting = false;
  }
}

function resetSample() {
  state.raw = structuredClone(sampleCharacter());
  flow.reset();
  commit();
  form.sync();
  setStatus('샘플 캐릭터로 초기화했습니다.', 'ok');
}

function init() {
  const ctx = {
    state, commit, setStatus, baseSize: measuredBase, exportImage, exportHtmlFile, resetSample,
    uploadImage: flow.uploadImage, removeImage: flow.removeImage, applyImageUrl: flow.applyImageUrl, clearImageUrl: flow.clearImageUrl,
  };
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
