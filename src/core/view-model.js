// View model: normalised data plus everything a template needs to draw, with no further validation required.
import { statDisplay } from './stats.js';
import { isImageSrc } from './vnode.js';
import { DEFAULT_LABELS, DEFAULT_LAYOUT, cloneLayout, isObject } from './schema-base.js';
import { resolvePalette } from './palettes.js';

/**
 * @typedef {Object} ViewModel
 * @property {string} template            template id from the data
 * @property {string} accentColor         '' means "use the template's defaultAccent"
 * @property {'percent'|'trpg'} statMode
 * @property {string} name  all 14 text fields (name title age gender race role affiliation height birthday quote likes dislikes summary backstory); '' when empty
 * @property {string[]} tags              0-8 trimmed tags
 * @property {{name: string, desc: string}[]} skills   0-6 skills
 * @property {{label: string, percent: number, score: number, value: number, max: number, text: string, ratio: number}[]} stats
 *   always 6; `text` is the display string for the current mode ("72" or "16 (+3)"), `ratio` is value/max in 0..1
 * @property {{src: string|null, fit: string, focusX: number, focusY: number, style: Record<string,string>}} art
 *   `src` is a validated data URL or null; `style` holds object-fit / object-position for the <img>
 * @property {{src: string|null, glyph: string}} icon  uploaded icon src or null; `glyph` is the emblem character
 * @property {Record<string, string>} labels   user-edited item names (only the keys the user changed)
 * @property {string[]} hidden                 keys the user switched off
 * @property {{id: string, label: string, value: string}[]} customFields  only entries with a value; empty when `custom` is hidden
 * @property {{id: string, kind: 'text'|'list', title: string, body: string, items: string[]}[]} customBlocks
 * @property {{info: string[], main: string[]}} layout  block order of the block-based designs
 * @property {(key: string) => string} label       the edited label of `key`, else its default label
 * @property {(key: string) => boolean} isHidden   true when the user switched `key` off
 * @property {(templateId: string) => Record<string, string>|null} paletteFor
 *   the eight resolved `--c-*` colours for `clean` / `vertical` (accent per SPEC rev.3), null for every other design
 */

function labelFor(labels, key) {
  if (Object.hasOwn(labels, key) && typeof labels[key] === 'string' && labels[key] !== '') return labels[key];
  return Object.hasOwn(DEFAULT_LABELS, key) ? DEFAULT_LABELS[key] : '';
}

/**
 * Build the view model for rendering.
 * @param {object} data normalised CharacterData
 * @param {{art?: string|null, icon?: string|null}} [images] data URLs; anything failing the src rule is treated as absent
 * @returns {ViewModel}
 */
export function buildViewModel(data, images) {
  const imgs = images || {};
  const stats = data.stats.map((stat) => {
    const shown = statDisplay(stat, data.statMode);
    return { ...stat, ...shown, ratio: shown.max ? Math.round((shown.value / shown.max) * 1000) / 1000 : 0 };
  });
  const art = {
    src: isImageSrc(imgs.art) ? imgs.art : null,
    fit: data.art.fit,
    focusX: data.art.focusX,
    focusY: data.art.focusY,
    style: { 'object-fit': data.art.fit, 'object-position': `${data.art.focusX}% ${data.art.focusY}%` },
  };
  const icon = { src: isImageSrc(imgs.icon) ? imgs.icon : null, glyph: Array.from(data.name.trim())[0] || '?' };
  const labels = isObject(data.labels) ? data.labels : {};
  const hidden = new Set(Array.isArray(data.hidden) ? data.hidden : []);
  const fields = Array.isArray(data.customFields) ? data.customFields : [];
  return {
    ...data,
    stats,
    art,
    icon,
    labels,
    hidden: [...hidden],
    customFields: hidden.has('custom') ? [] : fields.filter((field) => field.value !== ''),
    customBlocks: Array.isArray(data.customBlocks) ? data.customBlocks : [],
    layout: isObject(data.layout) ? data.layout : cloneLayout(DEFAULT_LAYOUT),
    label: (key) => labelFor(labels, key),
    isHidden: (key) => hidden.has(key),
    paletteFor: (templateId) => resolvePalette(templateId, data.palettes, data.accentColor),
  };
}
