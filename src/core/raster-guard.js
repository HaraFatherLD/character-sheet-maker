// Guard for the PNG/JPEG export: the sheet is drawn from an svg image, which cannot load anything from the network.
import { isObject, own } from './schema-base.js';
import { isDataImageSrc } from './vnode.js';

const SLOTS = [['art', '일러스트'], ['icon', '아이콘']];

/**
 * Check that every picture handed to the rasteriser is embedded (a base64 data URL) or absent. A remote address would
 * silently draw as a blank, so the caller must convert it to a data URL first.
 * @param {{art?: unknown, icon?: unknown}|null|undefined} images
 * @returns {{ok: true} | {ok: false, error: string}}
 */
export function assertRasterImages(images) {
  if (!isObject(images)) return { ok: false, error: '이미지 정보가 올바르지 않습니다.' };
  for (const [key, label] of SLOTS) {
    const src = own(images, key);
    if (src !== null && src !== undefined && !isDataImageSrc(src)) {
      return { ok: false, error: `${label} 이미지가 파일에 포함되어 있지 않아 이미지로 저장할 수 없습니다.` };
    }
  }
  return { ok: true };
}
