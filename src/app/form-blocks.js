// Form section "블록 배치" (shown only for the block-based designs): order, area, usage and the user's own blocks.
import { el, section } from './dom.js';
import { BLOCK_KEYS, DEFAULT_LABELS, LIMITS, PALETTE_TEMPLATES } from '../core/schema.js';
import { newId, setHidden } from './form-items.js';

const AREAS = Object.freeze([['info', '정보 영역'], ['main', '본문 영역']]);
const BUILT_IN = new Set(BLOCK_KEYS);
const BLOCK_DESIGNS = new Set(PALETTE_TEMPLATES);
const NO_TITLE = '(제목 없음)';

function button(text, label, onClick, disabled = false) {
  const node = el('button', { type: 'button', class: 'btn btn-small', 'aria-label': label, disabled }, text);
  node.addEventListener('click', onClick);
  return node;
}

/** Apply `change` to a copy of the effective (normalised) layout, store it in the raw character and commit. */
function relayout(ctx, change) {
  const layout = structuredClone(ctx.state.data.layout);
  change(layout);
  ctx.state.raw.layout = layout;
  ctx.commit();
}

function shift(layout, area, id, delta) {
  const list = layout[area];
  const from = list.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
}

function transfer(layout, area, id) {
  layout[area] = layout[area].filter((x) => x !== id);
  layout[area === 'info' ? 'main' : 'info'].push(id);
}

function removeBlock(ctx, id, rebuild) {
  ctx.state.raw.customBlocks = ctx.state.raw.customBlocks.filter((b) => b.id !== id);
  relayout(ctx, (layout) => {
    layout.info = layout.info.filter((x) => x !== id);
    layout.main = layout.main.filter((x) => x !== id);
  });
  rebuild();
}

function addBlock(ctx, kind, rebuild) {
  const { raw } = ctx.state;
  if (raw.customBlocks.length >= LIMITS.customBlocks) return;
  const block = { id: newId('b'), kind, title: kind === 'list' ? '새 목록 블록' : '새 텍스트 블록', body: '', items: [] };
  raw.customBlocks.push(block);
  relayout(ctx, (layout) => layout.main.push(block.id));
  rebuild();
}

function useToggle(ctx, id, title) {
  const input = el('input', { type: 'checkbox', 'data-block-use': id, 'aria-label': `${title} 사용` });
  input.checked = !ctx.state.data.hidden.includes(id);
  input.addEventListener('change', () => { setHidden(ctx.state.raw, id, !input.checked); ctx.commit(); });
  return el('label', { class: 'item-use' }, input, el('span', null, '사용'));
}

/** Inline editor of a custom block; edits go straight into the raw block object (no list rebuild while typing). */
function customEditor(ctx, block, nameNode) {
  const title = el('input', { type: 'text', maxlength: LIMITS.blockTitle, value: block.title, placeholder: '블록 제목', 'aria-label': '블록 제목' });
  title.addEventListener('input', () => { block.title = title.value; nameNode.textContent = title.value.trim() || NO_TITLE; ctx.commit(); });
  const isList = block.kind === 'list';
  const body = el('textarea', {
    rows: isList ? 5 : 4,
    maxlength: isList ? LIMITS.blockItems * (LIMITS.blockItem + 1) : LIMITS.blockBody,
    placeholder: isList ? '한 줄에 항목 하나 (최대 10개, 각 60자)' : '본문 (줄바꿈이 그대로 표시됩니다)',
    'aria-label': isList ? '목록 항목' : '블록 본문',
  }, isList ? (block.items || []).join('\n') : block.body || '');
  body.addEventListener('input', () => {
    if (isList) block.items = body.value.split('\n');
    else block.body = body.value;
    ctx.commit();
  });
  return el('div', { class: 'block-editor' }, title, body);
}

function blockRow(ctx, rebuild, area, id, index, count) {
  const { state } = ctx;
  const custom = BUILT_IN.has(id) ? null : state.raw.customBlocks.find((b) => b.id === id);
  if (!BUILT_IN.has(id) && !custom) return null;
  const title = custom ? custom.title.trim() || NO_TITLE : state.data.labels[id] || DEFAULT_LABELS[id];
  const nameNode = el('span', { class: 'block-name' }, title);
  const target = area === 'info' ? '본문' : '정보';
  const moved = (change) => () => { relayout(ctx, change); rebuild(); };
  const actions = el('div', { class: 'block-actions' },
    button('↑', `${title} 위로`, moved((l) => shift(l, area, id, -1)), index === 0),
    button('↓', `${title} 아래로`, moved((l) => shift(l, area, id, 1)), index === count - 1),
    button('영역 이동', `${title} 블록을 ${target} 영역으로 이동`, moved((l) => transfer(l, area, id))),
    custom ? button('삭제', `${title} 블록 삭제`, () => removeBlock(ctx, id, rebuild)) : useToggle(ctx, id, title));
  return el('div', { class: 'block-row', 'data-block': id }, el('div', { class: 'block-head' }, nameNode, actions), custom ? customEditor(ctx, custom, nameNode) : null);
}

/**
 * The "블록 배치" panel. It lists the blocks of the effective layout (state.data.layout) per area and is hidden unless the
 * current design is block-based (clean, vertical).
 * @param {object} ctx
 * @param {{sync: Function[], refresh: Function[]}} reg
 * @returns {HTMLElement}
 */
export function buildBlockSection(ctx, reg) {
  const { state } = ctx;
  const lists = new Map(AREAS.map(([area]) => [area, el('div', { class: 'block-list', 'data-area': area })]));
  const addText = button('+ 텍스트 블록', '텍스트 블록 추가', () => addBlock(ctx, 'text', rebuild));
  const addList = button('+ 목록 블록', '목록 블록 추가', () => addBlock(ctx, 'list', rebuild));
  const panel = section('블록 배치',
    el('p', { class: 'hint' }, '블록의 순서와 영역을 바꾸고, 내 블록(최대 12개)을 추가하세요. 정보 영역은 일러스트 옆(또는 이름 아래), 본문 영역은 그 아래에 쌓입니다.'),
    AREAS.flatMap(([area, title]) => [el('h3', { class: 'block-group-title' }, title), lists.get(area)]),
    el('div', { class: 'button-row' }, addText, addList));
  function rebuild() {
    const live = new Set(state.data.customBlocks.map((b) => b.id));
    state.raw.customBlocks = state.raw.customBlocks.filter((b) => live.has(b.id));
    for (const [area] of AREAS) {
      const ids = state.data.layout[area];
      lists.get(area).replaceChildren(...ids.map((id, i) => blockRow(ctx, rebuild, area, id, i, ids.length)).filter(Boolean));
    }
    addText.disabled = state.raw.customBlocks.length >= LIMITS.customBlocks;
    addList.disabled = addText.disabled;
  }
  reg.sync.push(() => { state.raw.customBlocks = state.data.customBlocks.map((b) => ({ ...b, items: [...b.items] })); rebuild(); });
  reg.refresh.push(() => {
    panel.hidden = !BLOCK_DESIGNS.has(state.data.template);
    for (const input of panel.querySelectorAll('input[data-block-use]')) input.checked = !state.data.hidden.includes(input.dataset.blockUse);
  });
  return panel;
}
