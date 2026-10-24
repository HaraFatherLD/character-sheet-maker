// Form section "세부 색상" (shown only for the block-based designs): eight colour tokens, each with its own reset.
import { el, section } from './dom.js';
import { PALETTE_TOKENS } from '../core/schema.js';
import { PALETTE_TOKEN_LABELS, resolvePalette } from '../core/palettes.js';

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Change the current design's palette overrides in the raw character (palettes are stored per design) and commit. */
function editPalette(ctx, change) {
  const { raw, data } = ctx.state;
  const all = isPlain(raw.palettes) ? { ...raw.palettes } : {};
  const mine = isPlain(all[data.template]) ? { ...all[data.template] } : {};
  change(mine);
  if (Object.keys(mine).length > 0) all[data.template] = mine;
  else delete all[data.template];
  raw.palettes = all;
  ctx.commit();
}

function tokenRow(ctx, token) {
  const name = PALETTE_TOKEN_LABELS[token];
  const input = el('input', { type: 'color', class: 'palette-input', 'data-token': token, 'aria-label': `${name} 색` });
  input.addEventListener('input', () => editPalette(ctx, (mine) => { mine[token] = input.value; }));
  const reset = el('button', { type: 'button', class: 'btn btn-small', 'data-reset': token, 'aria-label': `${name} 기본값으로` }, '기본값');
  reset.addEventListener('click', () => editPalette(ctx, (mine) => { delete mine[token]; }));
  return { token, input, row: el('div', { class: 'palette-row' }, el('span', { class: 'palette-name' }, name), input, reset) };
}

/**
 * The "세부 색상" panel: one colour input per token, a "기본값" button per token and "모두 기본값". It is hidden unless the
 * current design has a palette (clean, vertical); the inputs always show the colour actually used.
 * @param {object} ctx
 * @param {{sync: Function[], refresh: Function[]}} reg
 * @returns {HTMLElement}
 */
export function buildColorSection(ctx, reg) {
  const { state } = ctx;
  const rows = PALETTE_TOKENS.map((token) => tokenRow(ctx, token));
  const resetAll = el('button', { type: 'button', id: 'palette-reset-all', class: 'btn' }, '모두 기본값');
  resetAll.addEventListener('click', () => editPalette(ctx, (mine) => { for (const key of Object.keys(mine)) delete mine[key]; }));
  const panel = section('세부 색상',
    el('p', { class: 'hint' }, '디자인마다 따로 저장됩니다. "강조"를 바꾸면 위의 강조 색보다 우선합니다.'),
    el('div', { class: 'palette-list' }, rows.map((r) => r.row)), resetAll);
  reg.refresh.push(() => {
    const palette = resolvePalette(state.data.template, state.data.palettes, state.data.accentColor);
    panel.hidden = palette === null;
    if (palette === null) return;
    for (const { token, input } of rows) {
      if (input.value !== palette[token]) input.value = palette[token];
    }
  });
  return panel;
}
