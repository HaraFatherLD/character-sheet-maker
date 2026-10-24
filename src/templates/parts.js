// Shared VNode building blocks for every template. Each part emits the `cs-f-<key>` marker classes the tests and
// the layout checks rely on, returns null for an optional field that is empty or switched off by the user (null
// children are dropped by h()), and takes visible labels from `vm.label(key)` so the user's edits show up.
// `vm` is the ViewModel from src/core/view-model.js.
import { h } from '../core/vnode.js';
import { sampleArt } from '../core/sample-art.js';
import { TEXT_FIELDS } from '../core/schema.js';
import { accentInk } from '../core/color.js';
import { effectiveSize } from '../core/size.js';

export { FONT_SANS, FONT_SERIF, FONT_MONO } from '../core/common-css.js';

/** Fields whose marker must always be present (unless the user hides them), even when the value is empty. */
export const REQUIRED_KEYS = Object.freeze(['name', 'title', 'race', 'role', 'quote', 'summary']);
/** Default Korean label per text field key, e.g. FIELD_LABELS.age === '나이'. Prefer vm.label(key), which honours edits. */
export const FIELD_LABELS = Object.freeze(Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, f.label])));

/**
 * Join class names, skipping falsy ones.
 * @param {...(string|false|null|undefined)} names
 * @returns {string}
 */
export function cls(...names) {
  return names.filter(Boolean).join(' ');
}

/**
 * The sheet root every template must return: `div.cs-sheet.cs-<id>` with the size, `--accent` and `--accent-ink`
 * (`class` before `style`). Fixed designs get `width` + `height`; auto-height designs (`size.h === null`) get `width` +
 * `min-height` and never a `height`. Block-based designs (clean, vertical) also get all eight `--c-<token>` colours,
 * and their accent is the palette accent, then the user's accent colour, then the default. An auto-height design's `width`
 * is the width the user chose for it (`vm.sheetWidths`, see effectiveSize); a fixed design always keeps its own size and
 * the scale wrapper outside it (scaleWrap) does the resizing.
 * @param {{id: string, size: {w: number, h: number|null, minH?: number}, defaultAccent: string}} meta the template's own id/size/defaultAccent
 * @param {object} vm
 * @param {...unknown} children
 * @returns {object} VNode
 */
export function sheet(meta, vm, ...children) {
  const palette = vm.paletteFor(meta.id);
  const accent = palette ? palette.accent : vm.accentColor || meta.defaultAccent;
  const { w, h: fixedHeight, minH } = meta.size;
  const fixed = typeof fixedHeight === 'number';
  const style = {
    width: `${fixed ? w : effectiveSize(meta, vm.sheetWidths).w}px`,
    ...(fixed ? { height: `${fixedHeight}px` } : { 'min-height': `${minH}px` }),
    '--accent': accent,
    '--accent-ink': accentInk(accent),
  };
  if (palette) for (const [token, color] of Object.entries(palette)) style[`--c-${token}`] = color;
  return h('div', { class: `cs-sheet cs-${meta.id}`, style }, ...children);
}

/**
 * A text field wrapped in `tag` with the `cs-f-<key>` marker (value only, no label). Null when the user hid it
 * (never for `name`) or when it is optional and empty.
 * @param {object} vm
 * @param {string} key one of the 14 text field keys
 * @param {string} [tag='div']
 * @param {string} [extraClass]
 * @returns {object|null}
 */
export function textField(vm, key, tag = 'div', extraClass = '') {
  const value = vm[key];
  if (key !== 'name' && (vm.isHidden(key) || (!value && !REQUIRED_KEYS.includes(key)))) return null;
  return h(tag, { class: cls('cs-text', `cs-f-${key}`, extraClass) }, value);
}

/**
 * A labelled row `div.cs-row.cs-f-<key>` > `span.cs-label` + `span.cs-value`. Null when hidden, or optional and empty
 * (label included). The label is the user's edit if there is one, else `label` (a design's own wording), else the default.
 * @param {object} vm
 * @param {string} key
 * @param {string} label
 * @param {string} [extraClass]
 * @returns {object|null}
 */
export function fieldRow(vm, key, label, extraClass = '') {
  const value = vm[key];
  if (vm.isHidden(key) || (!value && !REQUIRED_KEYS.includes(key))) return null;
  const text = Object.hasOwn(vm.labels, key) ? vm.label(key) : label || vm.label(key);
  return h('div', { class: cls('cs-row', `cs-f-${key}`, extraClass) },
    h('span', { class: 'cs-label' }, text), h('span', { class: 'cs-value' }, value));
}

/**
 * Several fieldRow()s labelled with vm.label(); hidden and empty optional ones disappear.
 * @param {object} vm
 * @param {string[]} keys
 * @param {string} [extraClass] class for every row
 * @returns {Array<object|null>}
 */
export function fieldRows(vm, keys, extraClass = '') {
  return keys.map((key) => fieldRow(vm, key, vm.label(key), extraClass));
}

/**
 * The user's custom items, one row each: `div.cs-row.cs-f-custom` > `span.cs-label` + `span.cs-value` (same shape as
 * fieldRow). vm.customFields already holds only items with a value and is empty when `custom` is hidden.
 * Put these in the profile/info area of a design.
 * @param {object} vm
 * @param {string} [extraClass]
 * @returns {object[]} possibly empty
 */
export function customRows(vm, extraClass = '') {
  return vm.customFields.map((field) => h('div', { class: cls('cs-row', 'cs-f-custom', extraClass) },
    field.label ? h('span', { class: 'cs-label' }, field.label) : null, h('span', { class: 'cs-value' }, field.value)));
}

/**
 * Tag chips `ul.cs-tags.cs-f-tags` > `li.cs-tag`. Null when hidden or empty. `head`, when given, becomes the first
 * child inside the marker as `li.cs-tags-head` (use it to put a section label inside the marker element).
 * @param {object} vm
 * @param {string} [extraClass]
 * @param {object|null} [head] e.g. sectionLabel(vm, 'tags')
 * @returns {object|null}
 */
export function tagList(vm, extraClass = '', head = null) {
  if (vm.isHidden('tags') || vm.tags.length === 0) return null;
  return h('ul', { class: cls('cs-tags cs-f-tags', extraClass) },
    head ? h('li', { class: 'cs-tags-head' }, head) : null, vm.tags.map((tag) => h('li', { class: 'cs-tag' }, tag)));
}

const statPercent = (stat) => Math.round(stat.ratio * 1000) / 10;

/**
 * Horizontal stat bars `div.cs-stats.cs-stats-bars.cs-f-stats` > 6 x `div.cs-stat` (label span, `.cs-bar` > `.cs-bar-fill`, value span).
 * Label and value are separate spans, so each is its own text node. Null when hidden. `head`, when given, is the first
 * child inside the marker (use sectionLabel(vm, 'stats') so the section label sits inside the marker element).
 * @param {object} vm
 * @param {string} [extraClass]
 * @param {object|null} [head]
 * @returns {object|null}
 */
export function statBars(vm, extraClass = '', head = null) {
  if (vm.isHidden('stats')) return null;
  return h('div', { class: cls('cs-stats cs-stats-bars cs-f-stats', extraClass) }, head, vm.stats.map((stat) => h('div', { class: 'cs-stat' },
    h('span', { class: 'cs-stat-label' }, stat.label),
    h('div', { class: 'cs-bar' }, h('div', { class: 'cs-bar-fill', style: { width: `${statPercent(stat)}%` } })),
    h('span', { class: 'cs-stat-value' }, stat.text))));
}

const radarPoint = (index, scale) => {
  const angle = ((-90 + index * 60) * Math.PI) / 180;
  return [Math.round(Math.cos(angle) * 100 * scale * 10) / 10, Math.round(Math.sin(angle) * 100 * scale * 10) / 10];
};
const toPoints = (list) => list.map(([x, y]) => `${x},${y}`).join(' ');
const SIX = [0, 1, 2, 3, 4, 5];

function radarLabel(stat, index) {
  const [x, y] = radarPoint(index, 1.16);
  const anchor = x < -5 ? 'end' : x > 5 ? 'start' : 'middle';
  const text = Array.from(stat.label).slice(0, 4).join('');
  return h('text', { x, y: y + (y > 5 ? 12 : y < -5 ? -2 : 5), 'text-anchor': anchor, 'font-size': 15, fill: 'currentColor' }, text);
}

/**
 * Hexagon radar `div.cs-stats.cs-stats-radar.cs-f-stats` > `svg.cs-radar` (grid, axes, shape, short vertex labels)
 * + `ul.cs-stat-list` > `li.cs-stat` (label span, value span). The shape is filled with `var(--accent)`; grid uses
 * currentColor. Null when hidden. `head`, when given, is the first child inside the marker.
 * @param {object} vm
 * @param {string} [extraClass]
 * @param {object|null} [head]
 * @returns {object|null}
 */
export function statRadar(vm, extraClass = '', head = null) {
  if (vm.isHidden('stats')) return null;
  const ring = (scale) => h('polygon', { points: toPoints(SIX.map((i) => radarPoint(i, scale))), fill: 'none', stroke: 'currentColor', 'stroke-width': 1, opacity: 0.35 });
  const axis = (i) => { const [x, y] = radarPoint(i, 1); return h('line', { x1: 0, y1: 0, x2: x, y2: y, stroke: 'currentColor', 'stroke-width': 1, opacity: 0.25 }); };
  const corners = vm.stats.map((stat, i) => radarPoint(i, Math.max(stat.ratio, 0.04)));
  const svg = h('svg', { class: 'cs-radar', viewBox: '-170 -135 340 275', 'aria-hidden': 'true' },
    [1, 0.66, 0.33].map(ring), SIX.map(axis),
    h('polygon', { points: toPoints(corners), class: 'cs-radar-shape', style: { fill: 'var(--accent)', stroke: 'var(--accent)' }, 'stroke-width': 2, opacity: 0.6 }),
    corners.map(([x, y]) => h('circle', { cx: x, cy: y, r: 4, style: { fill: 'var(--accent)' } })),
    vm.stats.map(radarLabel));
  const list = h('ul', { class: 'cs-stat-list' }, vm.stats.map((stat) => h('li', { class: 'cs-stat' },
    h('span', { class: 'cs-stat-label' }, stat.label), h('span', { class: 'cs-stat-value' }, stat.text))));
  return h('div', { class: cls('cs-stats cs-stats-radar cs-f-stats', extraClass) }, head, svg, list);
}

/**
 * Skill list `ul.cs-skills.cs-f-skills` > `li.cs-skill` > `span.cs-skill-name` + `span.cs-skill-desc`. Null when hidden
 * or empty. `head`, when given, becomes the first child inside the marker as `li.cs-skills-head`.
 * @param {object} vm
 * @param {string} [extraClass]
 * @param {object|null} [head] e.g. sectionLabel(vm, 'skills')
 * @returns {object|null}
 */
export function skillList(vm, extraClass = '', head = null) {
  if (vm.isHidden('skills') || vm.skills.length === 0) return null;
  return h('ul', { class: cls('cs-skills cs-f-skills', extraClass) }, head ? h('li', { class: 'cs-skills-head' }, head) : null,
    vm.skills.map((skill) => h('li', { class: 'cs-skill' },
      h('span', { class: 'cs-skill-name' }, skill.name), h('span', { class: 'cs-skill-desc' }, skill.desc))));
}

/**
 * The illustration slot `div.cs-art.cs-f-art`: the uploaded image as `<img>` (object-fit/object-position from the
 * user's settings) or the built-in svg illustration. The common CSS sizes the child to 100% x 100%. Never hidden.
 * @param {object} vm
 * @param {string} [extraClass]
 * @returns {object}
 */
export function artSlot(vm, extraClass = '') {
  const content = vm.art.src ? h('img', { src: vm.art.src, alt: '캐릭터 일러스트', style: vm.art.style }) : sampleArt();
  return h('div', { class: cls('cs-art cs-f-art', extraClass) }, content);
}

/**
 * The icon slot `div.cs-icon.cs-f-icon`: the uploaded icon or an emblem (`span.cs-emblem`, first character of the name).
 * Only use it when the design has an icon spot. Null when the user hid the icon.
 * @param {object} vm
 * @param {string} [extraClass]
 * @returns {object|null}
 */
export function iconSlot(vm, extraClass = '') {
  if (vm.isHidden('icon')) return null;
  const content = vm.icon.src ? h('img', { src: vm.icon.src, alt: '아이콘' }) : h('span', { class: 'cs-emblem' }, vm.icon.glyph);
  return h('div', { class: cls('cs-icon cs-f-icon', extraClass) }, content);
}

/**
 * The quote `p.cs-quote.cs-f-quote` (present even when empty; decorate with ::before/::after in CSS). Null when hidden.
 * @param {object} vm
 * @param {string} [extraClass]
 * @returns {object|null}
 */
export function quoteBlock(vm, extraClass = '') {
  if (vm.isHidden('quote')) return null;
  return h('p', { class: cls('cs-quote cs-f-quote', extraClass) }, vm.quote);
}

/**
 * A section heading `h3.cs-section-title` with fixed text. For labels the user can edit use sectionLabel().
 * @param {string} text
 * @param {string} [extraClass]
 * @returns {object}
 */
export function sectionTitle(text, extraClass = '') {
  return h('h3', { class: cls('cs-section-title', extraClass) }, text);
}

/**
 * A section heading `h3.cs-section-title` whose text is `vm.label(key)` as its own text node (the user's edit or the
 * default label). Null when `key` is hidden.
 * @param {object} vm
 * @param {string} key a LABEL_KEYS key such as 'stats', 'skills', 'profile', 'backstory'
 * @param {string} [extraClass]
 * @returns {object|null}
 */
export function sectionLabel(vm, key, extraClass = '') {
  if (vm.isHidden(key)) return null;
  return sectionTitle(vm.label(key), extraClass);
}
