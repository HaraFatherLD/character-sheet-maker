// Image upload pipeline: validate -> read header size -> decode -> downscale -> data URL. A failure never touches the previous image.
import { validateImageFile } from '../core/schema.js';
import { isImageSrc } from '../core/vnode.js';
import { isImageTooLarge, readImageSize } from '../core/image-size.js';

/** Longest side kept for the main illustration (px). */
export const ART_MAX_SIDE = 2400;
/** Longest side kept for the icon (px). */
export const ICON_MAX_SIDE = 512;
/** Leading bytes read to find the pixel size (JPEG metadata segments can be large). */
const HEADER_BYTES = 1024 * 1024;

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, done: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/**
 * Size after shrinking so the long side is at most `maxSide` (never enlarges).
 * @param {number} width
 * @param {number} height
 * @param {number} maxSide
 * @returns {{width: number, height: number}}
 */
export function fitSize(width, height, maxSide) {
  const longSide = Math.max(width, height);
  if (longSide <= maxSide) return { width, height };
  const scale = maxSide / longSide;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Read the pixel size from the file header before any decoding; reject unreadable or oversized (> 50 megapixel) images. */
async function checkDimensions(file) {
  let size = null;
  try {
    size = readImageSize(new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer()));
  } catch (error) {
    console.warn('image header could not be read', error);
  }
  if (size === null) return { ok: false, error: '이미지 크기를 읽을 수 없습니다.' };
  if (isImageTooLarge(size)) return { ok: false, error: `이미지 해상도가 너무 큽니다 (${size.w}×${size.h}px). 5천만 화소 이하의 이미지를 사용해 주세요.` };
  return { ok: true };
}

/**
 * Validate, check the header size, decode and downscale an uploaded file. PNG/WebP become PNG, JPEG stays JPEG (quality 0.92).
 * @param {File} file
 * @param {number} maxSide
 * @returns {Promise<{ok: true, dataUrl: string, width: number, height: number} | {ok: false, error: string}>}
 */
export async function loadImageFile(file, maxSide) {
  const check = validateImageFile(file);
  if (!check.ok) return check;
  const dimensions = await checkDimensions(file);
  if (!dimensions.ok) return dimensions;
  let decoded = null;
  try {
    decoded = await decode(file);
    const size = fitSize(decoded.width, decoded.height, maxSide);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(decoded.source, 0, 0, size.width, size.height);
    const dataUrl = canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.92);
    if (!isImageSrc(dataUrl)) throw new Error('image encoding failed');
    return { ok: true, dataUrl, width: size.width, height: size.height };
  } catch (error) {
    console.warn('image load failed', error);
    return { ok: false, error: '이미지를 읽을 수 없습니다. 다른 파일을 선택해 주세요.' };
  } finally {
    if (decoded) decoded.done();
  }
}
