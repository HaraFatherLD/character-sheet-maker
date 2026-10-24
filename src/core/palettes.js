// Default palettes of the two block-based designs (clean, vertical) and the merge with a user's overrides.
import { PALETTE_TEMPLATES, PALETTE_TOKENS } from './schema-base.js';

/** Default colour per token for each block-based design (lower-case `#rrggbb`). */
export const PALETTE_DEFAULTS = Object.freeze({
  clean: Object.freeze({ bg: '#f3f6fb', panel: '#ffffff', text: '#2a3547', muted: '#667790', accent: '#3f5bd9', title: '#111a2e', line: '#e1e7f1', chip: '#e6ecfe' }),
  vertical: Object.freeze({ bg: '#12141d', panel: '#1d2130', text: '#e6e9f4', muted: '#a1a9c2', accent: '#ff9466', title: '#ffffff', line: '#2f3550', chip: '#2b3150' }),
});

/** Korean name of each token for the editor. */
export const PALETTE_TOKEN_LABELS = Object.freeze({
  bg: '바탕', panel: '블록 배경', text: '본문 글자', muted: '보조 글자', accent: '강조', title: '이름·제목 글자', line: '구분선·테두리', chip: '태그 배경',
});

const HEX = /^#[0-9a-fA-F]{6}$/;
const isColor = (v) => typeof v === 'string' && HEX.test(v);

/**
 * All eight tokens of a block-based design: the user's palette value, else the design default. The accent token is
 * the palette accent, then the user's global accent colour, then the default (SPEC rev.3).
 * @param {string} templateId only `clean` and `vertical` have a palette
 * @param {unknown} palettes `data.palettes` (normalised, but re-checked here)
 * @param {string} [accentColor] `data.accentColor` ('' when unset)
 * @returns {Record<string, string>|null} null for designs without a palette
 */
export function resolvePalette(templateId, palettes, accentColor) {
  if (!PALETTE_TEMPLATES.includes(templateId)) return null;
  const defaults = PALETTE_DEFAULTS[templateId];
  const hasOwnPalette = palettes !== null && typeof palettes === 'object' && Object.hasOwn(palettes, templateId);
  const user = hasOwnPalette && palettes[templateId] !== null && typeof palettes[templateId] === 'object' ? palettes[templateId] : {};
  const userColor = (token) => (Object.hasOwn(user, token) && isColor(user[token]) ? user[token].toLowerCase() : null);
  const tokens = {};
  for (const token of PALETTE_TOKENS) tokens[token] = userColor(token) || defaults[token];
  if (userColor('accent') === null && isColor(accentColor)) tokens.accent = accentColor.toLowerCase();
  return tokens;
}
