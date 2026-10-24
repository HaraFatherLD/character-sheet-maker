// Colour helpers: relative luminance and the readable "ink" colour for text drawn on an accent background.

const HEX = /^#[0-9a-fA-F]{6}$/;
const INK_DARK = '#111111';
const INK_LIGHT = '#ffffff';

const linear = (channel) => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/**
 * WCAG relative luminance (0 = black, 1 = white) of a `#rrggbb` colour; anything else counts as black.
 * @param {string} hex
 * @returns {number}
 */
export function relativeLuminance(hex) {
  if (typeof hex !== 'string' || !HEX.test(hex)) return 0;
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * `#111111` or `#ffffff`, whichever contrasts more with the accent colour (for text on accent backgrounds).
 * @param {string} accent `#rrggbb`
 * @returns {'#111111'|'#ffffff'}
 */
export function accentInk(accent) {
  const luminance = relativeLuminance(accent);
  return contrast(luminance, relativeLuminance(INK_DARK)) >= contrast(luminance, 1) ? INK_DARK : INK_LIGHT;
}
