// Form sections for item management (a usage toggle and an editable name per item) and the user's own items.
import { el, section } from './dom.js';
import { DEFAULT_LABELS, LABEL_KEYS, LIMITS } from '../core/schema.js';

/** Items the user can switch off or rename, in display order (name and art are fixed and not listed). */
const ITEM_ORDER = Object.freeze(['title', 'race', 'role', 'age', 'gender', 'affiliation', 'height', 'birthday', 'quote', 'summary',
  'likes', 'dislikes', 'backstory', 'tags', 'stats', 'skills', 'profile', 'custom', 'icon']);
const LABELLED = new Set(LABEL_KEYS);
const ICON_NAME = '아이콘';
const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Switch a key on or off in the raw character (`hidden` lists the switched-off keys).
 * @param {{hidden?: string[]}} raw
 * @param {string} key
 * @param {boolean} hidden true to switch the item off
 * @returns {void}
 */
export function setHidden(raw, key, hidden) {
  const rest = Array.isArray(raw.hidden) ? raw.hidden.filter((k) => k !== key) : [];
  raw.hidden = hidden ? [...rest, key] : rest;
}

/**
 * A fresh id for a user item or block: the prefix plus eight hex characters.
 * @param {string} prefix e.g. 'f' for fields, 'b' for blocks
 * @returns {string}
 */
export function newId(prefix) {
  const c = globalThis.crypto;
  const uuid = c && typeof c.randomUUID === 'function' ? c.randomUUID() : Math.random().toString(16).slice(2).padEnd(8, '0');
  return `${prefix}-${uuid.slice(0, 8)}`;
}

function itemRow(ctx, reg, key) {
  const { state } = ctx;
  const name = DEFAULT_LABELS[key] || ICON_NAME;
  const toggle = el('input', { type: 'checkbox', class: 'item-toggle', 'data-item': key, 'aria-label': `${name} 사용` });
  toggle.addEventListener('change', () => { setHidden(state.raw, key, !toggle.checked); ctx.commit(); });
  reg.refresh.push(() => { toggle.checked = !state.data.hidden.includes(key); });
  let field = el('span', { class: 'item-fixed' }, name);
  if (LABELLED.has(key)) {
    field = el('input', { type: 'text', class: 'item-name', 'data-label': key, maxlength: LIMITS.label, placeholder: name, 'aria-label': `${name} 항목명` });
    field.addEventListener('input', () => {
      state.raw.labels = { ...(isPlain(state.raw.labels) ? state.raw.labels : {}), [key]: field.value };
      ctx.commit();
    });
    reg.sync.push(() => { field.value = state.data.labels[key] ?? ''; });
  }
  return el('div', { class: 'item-row' }, el('label', { class: 'item-use' }, toggle, el('span', null, '사용')), field);
}

function customRow(ctx, item, index, rebuild) {
  const label = el('input', { type: 'text', maxlength: LIMITS.customFieldLabel, placeholder: '항목명', 'aria-label': `사용자 항목 ${index + 1} 이름`, value: item.label });
  const value = el('input', { type: 'text', maxlength: LIMITS.customFieldValue, placeholder: '내용', 'aria-label': `사용자 항목 ${index + 1} 내용`, value: item.value });
  label.addEventListener('input', () => { item.label = label.value; ctx.commit(); });
  value.addEventListener('input', () => { item.value = value.value; ctx.commit(); });
  const remove = el('button', { type: 'button', class: 'btn btn-small', 'aria-label': `사용자 항목 ${index + 1} 삭제` }, '삭제');
  remove.addEventListener('click', () => { ctx.state.raw.customFields.splice(index, 1); rebuild(); ctx.commit(); });
  return el('div', { class: 'custom-row' }, label, value, remove);
}

function customSection(ctx, reg) {
  const { state } = ctx;
  const list = el('div', { class: 'custom-list' });
  const add = el('button', { type: 'button', id: 'custom-add', class: 'btn' }, '+ 항목 추가');
  const rebuild = () => {
    list.replaceChildren(...state.raw.customFields.map((item, i) => customRow(ctx, item, i, rebuild)));
    add.disabled = state.raw.customFields.length >= LIMITS.customFields;
  };
  add.addEventListener('click', () => {
    if (state.raw.customFields.length >= LIMITS.customFields) return;
    state.raw.customFields.push({ id: newId('f'), label: '', value: '' });
    rebuild();
    ctx.commit();
  });
  reg.sync.push(() => { state.raw.customFields = state.data.customFields.map((f) => ({ ...f })); rebuild(); });
  return section('사용자 항목 (최대 8개)', el('p', { class: 'hint' }, '내용이 있는 항목만 시트의 프로필/정보 영역에 표시됩니다.'), list, add);
}

function itemsSection(ctx, reg) {
  const rows = ITEM_ORDER.map((key) => itemRow(ctx, reg, key));
  return section('항목 관리',
    el('p', { class: 'hint' }, '체크를 끄면 해당 항목이 시트에서 사라지고, 항목명을 적으면 시트의 이름표가 바뀝니다. 이름과 일러스트는 끌 수 없습니다.'),
    el('div', { class: 'item-list' }, rows));
}

/**
 * Sections for the user's own items and for item management.
 * @param {object} ctx
 * @param {{sync: Function[], refresh: Function[]}} reg
 * @returns {HTMLElement[]}
 */
export function buildItemSections(ctx, reg) {
  return [customSection(ctx, reg), itemsSection(ctx, reg)];
}
