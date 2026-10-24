// Download file names that are safe on Windows, macOS and Linux.

const FORBIDDEN = /[\\/:*?"<>|\u0000-\u001f]/g;
const RESERVED = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
const MAX_CODE_POINTS = 100;
const FALLBACK = 'character-sheet';

/**
 * Build `<base>.<ext>` with forbidden characters removed, Windows reserved names suffixed with `_`,
 * the base capped at 100 code points and an empty base replaced by "character-sheet".
 * @param {unknown} base
 * @param {string} ext extension without the dot
 * @returns {string}
 */
export function safeFilename(base, ext) {
  let name = String(base ?? '').replace(FORBIDDEN, '').replace(/^\s+/, '').replace(/[\s.]+$/, '');
  if (RESERVED.test(name)) name += '_';
  const points = Array.from(name);
  if (points.length > MAX_CODE_POINTS) name = points.slice(0, MAX_CODE_POINTS).join('');
  return `${name || FALLBACK}.${ext}`;
}
