// Output size for image export.

/** Export presets in UI order. */
export const PRESETS = ['1x', '2x', '3x', 'custom'];
/** Longest allowed output side in px. */
export const MAX_SIDE = 6000;
/** Smallest allowed custom width in px. */
export const MIN_WIDTH = 300;

const MULTIPLIERS = { '1x': 1, '2x': 2, '3x': 3 };

function parseWidth(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === '') return null;
  const n = Number(text);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/**
 * Sheet size to export. Fixed-height designs return their own size; auto-height designs (`size.h === null`) use the
 * measured height of the rendered sheet, never less than `size.minH`.
 * @param {{w: number, h: number|null, minH?: number}} size template size
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
