// Form sections for the illustration, the icon and the export controls.
import { el, section, field } from './dom.js';
import { PRESETS, computeOutputSize } from '../core/size.js';

const PRESET_LABELS = { '1x': '1배 (기본 크기)', '2x': '2배', '3x': '3배', custom: '직접 입력 (가로 px)' };
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';
const SLOT_LABELS = { art: '일러스트', icon: '아이콘' };

function fileInput(id, onFile) {
  const input = el('input', { type: 'file', id, accept: IMAGE_ACCEPT });
  input.addEventListener('change', () => {
    const [file] = input.files;
    input.value = '';
    if (file) onFile(file);
  });
  return input;
}

/**
 * The address box with [적용] / [지우기] for one picture slot. `show()` copies the stored address into the box; call it
 * after anything that changes the stored address from outside the box (upload, remove). Reset is covered by reg.sync.
 */
function urlField(ctx, reg, kind) {
  // No maxlength: a browser silently cuts pasted text to it, and the cut address can still be a valid one. A too long
  // address is refused with a message by validateImageUrl instead.
  const input = el('input', {
    type: 'text', id: `${kind}-url`, inputmode: 'url', autocomplete: 'off', spellcheck: 'false',
    placeholder: 'https://…', 'aria-label': `${SLOT_LABELS[kind]} 이미지 주소`,
  });
  const apply = el('button', { type: 'button', id: `${kind}-url-apply`, class: 'btn' }, '적용');
  const clear = el('button', { type: 'button', id: `${kind}-url-clear`, class: 'btn' }, '지우기');
  const show = () => { input.value = ctx.state.data[`${kind}Url`]; };
  apply.addEventListener('click', () => { if (ctx.applyImageUrl(kind, input.value)) show(); });
  clear.addEventListener('click', () => { ctx.clearImageUrl(kind); show(); });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); apply.click(); }
  });
  reg.sync.push(show);
  return { show, node: field('이미지 주소 (https:// 로 시작)', el('div', { class: 'url-row' }, input, apply, clear)) };
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
  const url = urlField(ctx, reg, 'art');
  const remove = el('button', { type: 'button', id: 'art-remove', class: 'btn' }, '일러스트 제거');
  remove.addEventListener('click', () => { ctx.removeImage('art'); url.show(); });
  const upload = fileInput('art-file', async (file) => { if (await ctx.uploadImage('art', file)) url.show(); });
  return section('일러스트',
    field('이미지 올리기 (JPEG/PNG/WebP, 20MB 이하)', upload), url.node,
    field('맞춤 방식', fit), slider('art-focus-x', 'focusX', '가로 초점'), slider('art-focus-y', 'focusY', '세로 초점'), remove);
}

function iconSection(ctx, reg) {
  const url = urlField(ctx, reg, 'icon');
  const remove = el('button', { type: 'button', id: 'icon-remove', class: 'btn' }, '아이콘 제거');
  remove.addEventListener('click', () => { ctx.removeImage('icon'); url.show(); });
  const upload = fileInput('icon-file', async (file) => { if (await ctx.uploadImage('icon', file)) url.show(); });
  return section('아이콘', field('이미지 올리기 (없으면 이름의 첫 글자 엠블럼)', upload), url.node, remove);
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

/** "이미지: 파일에 포함 / 링크 유지" for HTML files (PNG/JPEG always carry their pictures). */
function imageModeControls(ctx, reg) {
  const { state } = ctx;
  const mode = el('select', { id: 'export-image-mode' }, el('option', { value: 'embed' }, '파일에 포함'), el('option', { value: 'link' }, '링크 유지'));
  mode.addEventListener('change', () => { state.out.imageMode = mode.value; });
  reg.sync.push(() => { mode.value = state.out.imageMode; });
  return [field('이미지', mode), el('p', { class: 'hint' }, 'HTML 저장에만 적용됩니다. PNG/JPEG 저장은 항상 그림을 파일에 포함합니다.')];
}

function exportSection(ctx, reg) {
  const button = (id, text, handler, extra = '') => {
    const node = el('button', { type: 'button', id, class: `btn ${extra}`.trim() }, text);
    node.addEventListener('click', handler);
    return node;
  };
  return section('내보내기', ...exportControls(ctx, reg), ...imageModeControls(ctx, reg), el('div', { class: 'button-row' },
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
  return [artSection(ctx, reg), iconSection(ctx, reg), exportSection(ctx, reg)];
}
