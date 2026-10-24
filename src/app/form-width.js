// Form controls "시트 가로 폭" (inside the design panel): a preset, a number box for a typed width, a reset button and
// the resulting size. The width is stored per design in raw.sheetWidths, and the controls always show the current
// design's stored width, so switching designs switches what they display.
import { el, field } from './dom.js';
import { SHEET_WIDTH_MAX, SHEET_WIDTH_MIN, WIDTH_PRESETS, effectiveSize, presetWidth, toSheetWidth } from '../core/size.js';
import { getTemplate } from '../templates/index.js';

const PRESET_LABELS = { base: '기본', 75: '75%', 125: '125%', 150: '150%', custom: '직접 입력' };
const RANGE_MESSAGE = `가로 폭은 ${SHEET_WIDTH_MIN}~${SHEET_WIDTH_MAX} 사이의 숫자로 입력해 주세요.`;
const isPlain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Store the current design's width in the raw character (null removes it: the design's own width) and commit. */
function storeWidth(ctx, width) {
  const { raw, data } = ctx.state;
  const next = isPlain(raw.sheetWidths) ? { ...raw.sheetWidths } : {};
  if (width === null) delete next[data.template];
  else next[data.template] = width;
  raw.sheetWidths = next;
  ctx.commit();
}

/** The preset that describes a stored width: 'base' without one, the matching percentage, otherwise 'custom'. */
function presetOf(baseW, stored) {
  if (stored === undefined) return 'base';
  const match = WIDTH_PRESETS.find((p) => p !== 'base' && p !== 'custom' && presetWidth(baseW, p) === stored);
  return match ?? 'custom';
}

/** "1200 × 1697 px", or "800 px × 자동" for the designs whose height follows their content. */
function sizeText(eff) {
  return eff.mode === 'scale' ? `${eff.w} × ${eff.h} px` : `${eff.w} px × 자동`;
}

/** The five controls, not yet wired to anything. */
function createParts() {
  const options = WIDTH_PRESETS.map((p) => el('option', { value: p }, PRESET_LABELS[p]));
  return {
    preset: el('select', { id: 'sheet-width-preset' }, options),
    input: el('input', { type: 'number', id: 'sheet-width', min: SHEET_WIDTH_MIN, max: SHEET_WIDTH_MAX, step: 1, inputmode: 'numeric' }),
    message: el('p', { class: 'hint hint-error', id: 'sheet-width-message', role: 'alert', hidden: true }),
    reset: el('button', { type: 'button', id: 'sheet-width-reset', class: 'btn' }, '기본 폭'),
    readout: el('output', { id: 'sheet-width-size', class: 'readout' }),
  };
}

/** Returns the function that repaints the controls from the current design's stored width. */
function makeShow(state, parts, typing, warn) {
  const { preset, input, readout } = parts;
  return () => {
    const id = state.data.template;
    const template = getTemplate(id);
    const stored = Object.hasOwn(state.data.sheetWidths, id) ? state.data.sheetWidths[id] : undefined;
    const eff = effectiveSize(template, state.data.sheetWidths);
    const kind = typing.has(id) ? 'custom' : presetOf(template.size.w, stored);
    preset.value = kind;
    input.disabled = kind !== 'custom';
    if (document.activeElement !== input) { input.value = String(eff.w); warn(''); } // never rewrite the box while it is typed in
    readout.textContent = sizeText(eff);
  };
}

/** Listeners: the preset stores a preset width (or deletes the key), the box stores a valid typed width, reset deletes the key. */
function wire(ctx, parts, { typing, warn, show }) {
  const { state } = ctx;
  const { preset, input, reset } = parts;
  preset.addEventListener('change', () => {
    const id = state.data.template;
    if (preset.value === 'custom') {
      typing.add(id);
      show();
      input.focus();
      input.select();
      return;
    }
    typing.delete(id);
    warn('');
    storeWidth(ctx, preset.value === 'base' ? null : presetWidth(getTemplate(id).size.w, preset.value));
  });
  input.addEventListener('input', () => {
    typing.add(state.data.template);
    const text = input.value.trim();
    const width = toSheetWidth(text === '' ? Number.NaN : Number(text));
    if (width === null) { warn(RANGE_MESSAGE); return; }
    warn('');
    storeWidth(ctx, width);
  });
  // Leaving the box with an out-of-range value puts the stored width back, so the box never disagrees with the data.
  input.addEventListener('blur', () => {
    const text = input.value.trim();
    if (toSheetWidth(text === '' ? Number.NaN : Number(text)) === null) show();
  });
  reset.addEventListener('click', () => {
    typing.delete(state.data.template);
    warn('');
    input.blur();
    storeWidth(ctx, null);
  });
}

/**
 * The "시트 가로 폭" controls: preset select, number input (enabled only for "직접 입력"), "기본 폭" button, size readout.
 * A typed width outside 400-2400 shows a message and is not stored.
 * @param {object} ctx controller: { state, commit }
 * @param {{sync: Function[], refresh: Function[]}} reg
 * @returns {HTMLElement[]}
 */
export function buildWidthControls(ctx, reg) {
  const parts = createParts();
  const typing = new Set(); // designs where the user chose "직접 입력" (a typed width may equal a preset and must stay typed)
  const warn = (text) => { parts.message.textContent = text; parts.message.hidden = text === ''; };
  const show = makeShow(ctx.state, parts, typing, warn);
  wire(ctx, parts, { typing, warn, show });
  reg.sync.push(() => { typing.clear(); warn(''); });
  reg.refresh.push(show);
  return [
    el('h3', { class: 'panel-subtitle' }, '시트 가로 폭'),
    el('p', { class: 'hint' }, '고정 레이아웃은 비율을 유지해 확대·축소되고, 깔끔한 양식·세로형은 폭에 맞춰 다시 배치됩니다.'),
    field('폭 선택', parts.preset),
    field(`직접 입력 (${SHEET_WIDTH_MIN}~${SHEET_WIDTH_MAX} px)`, parts.input),
    parts.message,
    el('div', { class: 'inline' }, parts.reset, parts.readout),
  ];
}
