// Image dimensions from the first bytes of a PNG, JPEG or WebP file. Pure: nothing is decoded, nothing throws.

/** Largest accepted pixel count (width x height). */
export const MAX_PIXELS = 50_000_000;

const u16be = (b, i) => (b[i] << 8) | b[i + 1];
const u32be = (b, i) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const u16le = (b, i) => b[i] | (b[i + 1] << 8);
const u24le = (b, i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const ascii = (b, i, n) => String.fromCharCode(...b.subarray(i, i + n));
const dims = (w, h) => (w > 0 && h > 0 ? { w, h } : null);

/** Frame-header markers of a JPEG (baseline, extended, progressive, lossless and arithmetic variants). */
const JPEG_SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

function pngSize(b) {
  const signature = b.length >= 24 && u32be(b, 0) === 0x89504e47 && u32be(b, 4) === 0x0d0a1a0a;
  return signature && ascii(b, 12, 4) === 'IHDR' ? dims(u32be(b, 16), u32be(b, 20)) : null;
}

function jpegSize(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xff) { i += 1; continue; } // fill byte
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) { i += 2; continue; } // markers without a length
    if (marker === 0xd9 || marker === 0xda) return null; // end of image / scan data before any frame header
    if (JPEG_SOF.has(marker)) return i + 9 <= b.length ? dims(u16be(b, i + 7), u16be(b, i + 5)) : null;
    const length = u16be(b, i + 2);
    if (length < 2) return null;
    i += 2 + length;
  }
  return null;
}

function webpSize(b) {
  if (b.length < 25 || ascii(b, 0, 4) !== 'RIFF' || ascii(b, 8, 4) !== 'WEBP') return null;
  const kind = ascii(b, 12, 4);
  if (kind === 'VP8 ') return b.length >= 30 && b[23] === 0x9d && b[24] === 0x01 && b[25] === 0x2a ? dims(u16le(b, 26) & 0x3fff, u16le(b, 28) & 0x3fff) : null;
  if (kind === 'VP8X') return b.length >= 30 ? dims(u24le(b, 24) + 1, u24le(b, 27) + 1) : null;
  if (kind === 'VP8L' && b[20] === 0x2f) {
    const bits = (b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24)) >>> 0;
    return dims((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
  }
  return null;
}

/**
 * Pixel size from the header bytes of a PNG (IHDR), JPEG (SOFn) or WebP (VP8, VP8L, VP8X) file.
 * @param {Uint8Array|ArrayBuffer} bytes at least the start of the file (a JPEG may need a few hundred KB of headers)
 * @returns {{w: number, h: number}|null} null when the format is unknown, truncated or unreadable
 */
export function readImageSize(bytes) {
  try {
    const b = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
    if (!(b instanceof Uint8Array)) return null;
    return pngSize(b) || jpegSize(b) || webpSize(b);
  } catch {
    return null;
  }
}

/**
 * True when the size is unusable (not positive integers) or has more than 50,000,000 pixels.
 * @param {{w?: number, h?: number}|null|undefined} size
 * @returns {boolean}
 */
export function isImageTooLarge(size) {
  if (size === null || typeof size !== 'object') return true;
  const { w, h } = size;
  if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) return true;
  return w * h > MAX_PIXELS;
}
