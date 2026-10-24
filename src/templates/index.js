// Template registry: the fourteen designs in display order.
import { TEMPLATE_IDS } from '../core/schema.js';
import fantasy from './fantasy.js';
import scifi from './scifi.js';
import anime from './anime.js';
import pixel from './pixel.js';
import cyberpunk from './cyberpunk.js';
import grimoire from './grimoire.js';
import tcg from './tcg.js';
import wanted from './wanted.js';
import dossier from './dossier.js';
import magazine from './magazine.js';
import storybook from './storybook.js';
import streamer from './streamer.js';
import clean from './clean.js';
import vertical from './vertical.js';

/**
 * @typedef {Object} Template
 * @property {string} id         one of TEMPLATE_IDS
 * @property {string} label      Korean display name
 * @property {{w: number, h: number|null, minH?: number}} size  sheet size in px (h null = auto height, minH is then the minimum)
 * @property {string} defaultAccent  lower-case #rrggbb
 * @property {string} css        static CSS scoped under `.cs-<id>`
 * @property {(vm: object) => object} render  returns the root VNode `div.cs-sheet.cs-<id>`
 */

/** @type {Template[]} */
export const TEMPLATES = [fantasy, scifi, anime, pixel, cyberpunk, grimoire, tcg, wanted, dossier, magazine, storybook, streamer, clean, vertical];

if (TEMPLATES.map((t) => t.id).join() !== TEMPLATE_IDS.join()) {
  throw new Error('TEMPLATES must match TEMPLATE_IDS in src/core/schema.js (same ids, same order)');
}

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

/**
 * Look up a template; unknown ids (including '__proto__') fall back to fantasy.
 * @param {unknown} id
 * @returns {Template}
 */
export function getTemplate(id) {
  return BY_ID.get(id) || fantasy;
}
