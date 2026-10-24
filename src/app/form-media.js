// Form sections for the illustration, the icon and the export controls.
import { el, section, field } from './dom.js';
import { PRESETS, computeOutputSize } from '../core/size.js';

const PRESET_LABELS = { '1x': '1배 (기본 크기)', '2x': '2배', '3x': '3배', custom: '직접 입력 (가로 px)' };
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';

function fileInput(id, onFile) {
  const input = el('input', { type: 'file', id, accept: IMAGE_ACCEPT });
  input.addEventListener('change', () => {
    const [file] = input.files;
    input.value = '';
    if (file) onFile(file);
  });
  return input;
}

function artSection(ctx, reg) {
  const { state } = ctx;
  const fit = el('select', { id: 'art-fit' }, el('option', { value: 'cover' }, '채우기 (넘치는 부분은 잘림)'), el('option', { value: 'contain' }, '전체 보이기'));
  fit.addEventListener('change', () => { state.raw.art.fit = fit.value; ctx.commit(); });
  const slider = (id, key, text) => {
    const input = el('input', { type: 'range', id, min: 0, max: 100, step: 1 });
    input.addEventListener('input', () => { state.raw.art[key] = Number(input.value); ctx.commit(); });
    reg.sync.push(() => { input.value = String(state.data.art[key]); });
    return field(text, input);
  };
  reg.sync.push(() => { fit.value = state.data.art.fit; });
  const remove = el('button', { type: 'button', id: 'art-remove', class: 'btn' }, '일러스트 제거');
  remove.addEventListener('click', () => ctx.removeImage('art'));
  return section('일러스트',
    field('이미지 올리기 (JPEG/PNG/WebP, 20MB 이하)', fileInput('art-file', (file) => ctx.uploadImage('art', file))),
    field('맞춤 방식', fit), slider('art-focus-x', 'focusX', '가로 초점'), slider('art-focus-y', 'focusY', '세로 초점'), remove);
}

function iconSection(ctx) {
  const remove = el('button', { type: 'button', id: 'icon-remove', class: 'btn' }, '아이콘 제거');
  remove.addEventListener('click', () => ctx.removeImage('icon'));
  return section('아이콘',
    field('이미지 올리기 (없으면 이름의 첫 글자 엠블럼)', fileInput('icon-file', (file) => ctx.uploadImage('icon', file))), remove);
}

function exportControls(ctx, reg) {
  const { state } = ctx;
  const format = el('select', { id: 'export-format' }, el('option', { value: 'png' }, 'PNG'), el('option', { value: 'jpeg' }, 'JPEG'));
  const preset = el('select', { id: 'export-preset' }, PRESETS.map((p) => el('option', { value: p }, PRESET_LABELS[p])));
  const width = el('input', { type: 'number', id: 'export-width', min: 300, max: 6000, step: 1, placeholder: '가로 px' });
  const readout = el('output', { id: 'export-size', class: 'readout' });
  // ctx.baseSize() is the sheet size of the current design; auto-height designs report their rendered height.
  const update = () => {
    width.disabled = state.out.preset !== 'custom';
    const size = computeOutputSize(ctx.baseSize(), state.out.preset, state.out.customWidth);
    readout.textContent = `${size.width} × ${size.height} px`;
  };
  format.addEventListener('change', () => { state.out.format = format.value; });
  preset.addEventListener('change', () => { state.out.preset = preset.value; update(); });
  width.addEventListener('input', () => { state.out.customWidth = width.value; update(); });
  reg.sync.push(() => { format.value = state.out.format; preset.value = state.out.preset; width.value = state.out.customWidth; });
  reg.refresh.push(update);
  reg.afterRender.push(update);
  return [field('파일 형식', format), field('크기', preset), field('가로 픽셀', width), field('결과 크기', readout)];
}

function exportSection(ctx, reg) {
  const button = (id, text, handler, extra = '') => {
    const node = el('button', { type: 'button', id, class: `btn ${extra}`.trim() }, text);
    node.addEventListener('click', handler);
    return node;
  };
  return section('내보내기', ...exportControls(ctx, reg), el('div', { class: 'button-row' },
    button('btn-download-image', '이미지 다운로드', () => ctx.exportImage(), 'btn-primary'),
    button('btn-download-html', 'HTML 다운로드', () => ctx.exportHtmlFile()),
    button('btn-reset', '샘플로 초기화', () => ctx.resetSample(), 'btn-danger')));
}

/**
 * Sections for art, icon and export.
 * @param {object} ctx
 * @param {{sync: Function[], refresh: Function[], afterRender: Function[]}} reg
 * @returns {HTMLElement[]}
 */
export function buildMediaSections(ctx, reg) {
  return [artSection(ctx, reg), iconSection(ctx), exportSection(ctx, reg)];
}
