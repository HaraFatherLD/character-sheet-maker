// Remote picture -> data URL: the conversion behind "include pictures in the file" and the PNG/JPEG export.
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '../core/schema.js';
import { loadImageFile } from './images.js';

/** How long a remote picture may take, download included, before it counts as a load error (ms). */
export const IMAGE_LOAD_TIMEOUT_MS = 15000;
const fail = (error) => ({ ok: false, error });

/** Read a response body, giving up as soon as it passes `limit` bytes (cross-origin pages cannot see Content-Length). */
async function readLimited(response, limit) {
  if (!response.body) {
    const blob = await response.blob();
    return blob.size <= limit ? blob : null;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return new Blob(chunks);
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
}

/**
 * Download an https picture with CORS (no cookies, no referrer), check its type (JPEG/PNG/WebP) and size (20 MiB), then
 * run it through the same header-size guard, downscale and data-URL conversion as an uploaded file. The download is
 * aborted after 15 seconds, which fails like any other load error. Never rejects.
 * @param {string} url a validated https address
 * @param {number} maxSide longest side kept, in px
 * @returns {Promise<{ok: true, dataUrl: string, width: number, height: number} | {ok: false, error: string}>}
 */
export async function fetchImageAsDataUrl(url, maxSide) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_LOAD_TIMEOUT_MS);
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal });
    if (!response.ok) return fail(`이미지를 받지 못했습니다 (HTTP ${response.status}).`);
    const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!IMAGE_TYPES.includes(type)) return fail('JPEG, PNG, WebP 이미지만 사용할 수 있습니다.');
    const body = await readLimited(response, MAX_IMAGE_BYTES);
    clearTimeout(timer); // the network part is over; decoding is local
    if (body === null) return fail('이미지는 20MB 이하여야 합니다.');
    return await loadImageFile(body.slice(0, body.size, type), maxSide);
  } catch (error) {
    console.warn('remote image could not be fetched', error);
    return fail('이미지를 가져오지 못했습니다.');
  } finally {
    clearTimeout(timer);
  }
}
