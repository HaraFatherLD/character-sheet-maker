// Block renderer shared by the two block-based designs (clean, vertical): turns layout ids into block VNodes.
// Every block is a direct child of its area container and carries `cs-f-<key>` (built-in sections) or
// `cs-b-custom cs-b-<id>` (the user's own blocks). Built-in blocks put their section label inside the marker element.
import { h } from '../core/vnode.js';
import { BLOCK_KEYS } from '../core/schema.js';
import { cls, customRows, fieldRows, quoteBlock, sectionLabel, skillList, statBars, tagList } from './parts.js';

/** Rows of the profile block; race and role live in the header only. */
const PROFILE_KEYS = ['age', 'gender', 'affiliation', 'height', 'birthday'];

const card = (key, extra, ...children) => h('section', { class: cls('cs-block', `cs-f-${key}`, extra) }, ...children);

/** Size class for the name by length (code points), so long names shrink instead of wrapping into a tower. */
export function nameTier(name) {
  const length = Array.from(name).length;
  return length <= 8 ? 'cs-n1' : length <= 14 ? 'cs-n2' : length <= 24 ? 'cs-n3' : 'cs-n4';
}

function profileBlock(vm) {
  if (vm.isHidden('profile')) return null;
  const rows = [...fieldRows(vm, PROFILE_KEYS), ...customRows(vm)].filter(Boolean);
  return rows.length === 0 ? null : card('profile', '', sectionLabel(vm, 'profile'), h('div', { class: 'cs-rows' }, rows));
}

/** A heading + paragraph card. Required ones (summary) keep their marker when empty and collapse via `cs-empty`. */
function textBlock(key, required) {
  return (vm) => {
    const value = vm[key];
    if (vm.isHidden(key) || (!value && !required)) return null;
    return card(key, !value && 'cs-empty', sectionLabel(vm, key), h('p', { class: 'cs-text' }, value));
  };
}

function customBlock(block) {
  // Empty blocks stay in the data so editing never loses them, but they draw nothing (SPEC rev.4).
  if (!block.title && !block.body && block.items.length === 0) return null;
  const head = block.title ? h('h3', { class: 'cs-section-title' }, block.title) : null;
  let body = null;
  if (block.kind === 'list') {
    body = block.items.length > 0 ? h('ul', { class: 'cs-block-list' }, block.items.map((item) => h('li', null, item))) : null;
  } else if (block.body) {
    body = h('p', { class: 'cs-block-text' }, block.body);
  }
  return h('section', { class: cls('cs-block cs-b-custom', `cs-b-${block.id}`) }, head, body);
}

const BUILT_IN = new Map([
  ['profile', profileBlock],
  ['quote', (vm) => quoteBlock(vm, cls('cs-block', !vm.quote && 'cs-empty'))],
  ['summary', textBlock('summary', true)],
  ['likes', textBlock('likes', false)],
  ['dislikes', textBlock('dislikes', false)],
  ['tags', (vm) => tagList(vm, 'cs-block', sectionLabel(vm, 'tags'))],
  ['stats', (vm) => statBars(vm, 'cs-block', sectionLabel(vm, 'stats'))],
  ['skills', (vm) => skillList(vm, 'cs-block', sectionLabel(vm, 'skills'))],
  ['backstory', textBlock('backstory', false)],
]);
if (BLOCK_KEYS.some((key) => !BUILT_IN.has(key))) throw new Error('blocks.js must render every key in BLOCK_KEYS');

/**
 * An area container `div.cs-area.cs-area-<name>` holding the blocks of `vm.layout[name]` in order. Hidden or empty
 * built-in blocks and ids without a custom block are skipped.
 * @param {object} vm view model
 * @param {'info'|'main'} name
 * @returns {object} VNode
 */
export function areaNode(vm, name) {
  const custom = new Map(vm.customBlocks.map((block) => [block.id, block]));
  const nodes = vm.layout[name].map((id) => {
    if (BUILT_IN.has(id)) return BUILT_IN.get(id)(vm);
    return custom.has(id) ? customBlock(custom.get(id)) : null;
  });
  return h('div', { class: `cs-area cs-area-${name}` }, nodes);
}
