// Sizes: the sheet width the user chose per design, the size that gives, and the size of the exported image.

/** Export presets in UI order. */
export const PRESETS = ['1x', '2x', '3x', 'custom'];
/** Longest allowed output side in px. */
export const MAX_SIDE = 6000;
/** Smallest allowed custom width in px. */
export const MIN_WIDTH = 300;
/** Narrowest sheet width the user may choose, in px. */
export const SHEET_WIDTH_MIN = 400;
/** Widest sheet width the user may choose, in px. */
export const SHEET_WIDTH_MAX = 2400;
/** Sheet width presets in UI order: the design's own width, 75% / 125% / 150% of it, or a typed width. */
export const WIDTH_PRESETS = ['base', '75', '125', '150', 'custom'];

const MULTIPLIERS = { '1x': 1, '2x': 2, '3x': 3 };
const WIDTH_RATIOS = { 75: 0.75, 125: 1.25, 150: 1.5 };

function parseWidth(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === '') return null;
  const n = Number(text);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/**
 * A chosen sheet width in whole px: `value` rounded when it is a finite number that is then within
 * SHEET_WIDTH_MIN..SHEET_WIDTH_MAX, else null. Out-of-range widths are refused, never clamped.
 * @param {unknown} value
 * @returns {number|null}
 */
export function toSheetWidth(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const width = Math.round(value);
  return width >= SHEET_WIDTH_MIN && width <= SHEET_WIDTH_MAX ? width : null;
}

/**
 * The size a design is drawn at once the user's width is applied. Fixed layouts (`size.h` is a number) keep their
 * proportions: `scale` is w / size.w and `baseW` / `baseH` are the layout's own size. Block layouts (`size.h` is null)
 * reflow at the chosen width: `h` is null, `minH` is the design's minimum height and `scale` is 1.
 * @param {{id: string, size: {w: number, h: number|null, minH?: number}}} template a registry template (or its META)
 * @param {unknown} [sheetWidths] normalised `{ [templateId]: px }`; anything unusable means "no override"
 * @returns {{mode: 'scale', w: number, h: number, scale: number, baseW: number, baseH: number}
 *   | {mode: 'reflow', w: number, h: null, minH: number, scale: 1, baseW: number, baseH: null}}
 */
export function effectiveSize(template, sheetWidths) {
  const { size } = template;
  const own = sheetWidths && typeof sheetWidths === 'object' && Object.hasOwn(sheetWidths, template.id);
  const w = (own ? toSheetWidth(sheetWidths[template.id]) : null) ?? size.w;
  if (typeof size.h !== 'number') return { mode: 'reflow', w, h: null, minH: size.minH, scale: 1, baseW: w, baseH: null };
  return { mode: 'scale', w, h: Math.round((size.h * w) / size.w), scale: w / size.w, baseW: size.w, baseH: size.h };
}

/**
 * The width a preset of the sheet-width control stands for.
 * @param {number} baseW the design's own width
 * @param {string} preset one of WIDTH_PRESETS; unknown values behave like 'base'
 * @returns {number|null} 'base' gives baseW; '75' / '125' / '150' give baseW times the ratio, rounded and then clamped
 *   to SHEET_WIDTH_MIN..SHEET_WIDTH_MAX; 'custom' gives null (the width is typed)
 */
export function presetWidth(baseW, preset) {
  if (preset === 'custom') return null;
  if (!Object.hasOwn(WIDTH_RATIOS, preset)) return baseW;
  return Math.max(SHEET_WIDTH_MIN, Math.min(SHEET_WIDTH_MAX, Math.round(baseW * WIDTH_RATIOS[preset])));
}

/**
 * Sheet size to export. Fixed-height designs return their own size; auto-height designs (`h === null`) use the
 * measured height of the rendered sheet, never less than `minH`.
 * @param {{w: number, h: number|null, minH?: number}} size an effective size (see effectiveSize) or a template size
 * @param {number} [measuredH] `scrollHeight` of the rendered sheet (ignored unless finite and positive)
 * @returns {{w: number, h: number}}
 */
export function resolveBaseSize(size, measuredH) {
  if (typeof size.h === 'number') return { w: size.w, h: size.h };
  const usable = typeof measuredH === 'number' && Number.isFinite(measuredH) && measuredH > 0;
  return { w: size.w, h: usable ? Math.max(size.minH, Math.ceil(measuredH)) : size.minH };
}

/**
 * Pixel size of the exported image. The long side never exceeds MAX_SIDE for any preset.
 * @param {{w: number, h: number}} base sheet size (use resolveBaseSize for auto-height designs)
 * @param {string} preset one of PRESETS; unknown values behave like '1x'
 * @param {unknown} [customWidth] only used by the 'custom' preset; unusable input falls back to 1x
 * @returns {{width: number, height: number, scale: number}}
 */
export function computeOutputSize(base, preset, customWidth) {
  const maxWidth = Math.floor((MAX_SIDE * base.w) / Math.max(base.w, base.h));
  let width = base.w * (MULTIPLIERS[preset] || 1);
  if (preset === 'custom') {
    const wanted = parseWidth(customWidth);
    // The 6000px long-side cap wins over the minimum width for extremely tall sheets (SPEC rev.4).
    if (wanted !== null) width = Math.max(Math.min(MIN_WIDTH, maxWidth), Math.min(maxWidth, wanted));
  } else if (width > maxWidth) {
    width = maxWidth;
  }
  return { width, height: Math.round((width * base.h) / base.w), scale: width / base.w };
}
