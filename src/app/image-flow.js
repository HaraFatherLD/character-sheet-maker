// Where the two pictures (illustration and icon) come from. An uploaded file, kept in memory only, always wins over the
// stored https address. This module owns uploads, the address buttons, the load-error fallback of the preview and the
// conversion that file exports need; app.js only wires it up.
import { validateImageUrl } from '../core/image-url.js';
import { ART_MAX_SIDE, ICON_MAX_SIDE, loadImageFile } from './images.js';
import { IMAGE_LOAD_TIMEOUT_MS, fetchImageAsDataUrl } from './url-image.js';

/** Status shown when the preview cannot load a remote picture (blocked by the site, missing, or not an image). */
export const URL_LOAD_FAIL = '이 이미지는 원본 사이트가 외부 사용을 허용하지 않거나 열 수 없습니다. 파일로 업로드해 주세요';
/** Status shown, and the download stops, when a remote picture cannot be embedded in the file. */
export const EMBED_FAIL = "원본 사이트가 외부 저장을 허용하지 않아 포함할 수 없습니다. '링크 유지'를 선택하거나 파일로 업로드해 주세요";
/** Status shown, and the download stops, when the pictures were changed while a remote one was being converted. */
export const SOURCE_CHANGED = '내보내는 동안 이미지가 바뀌어 중단했습니다. 다시 시도해 주세요';

const KINDS = ['art', 'icon'];
const LABELS = { art: '일러스트', icon: '아이콘' };
const MAX_SIDE = { art: ART_MAX_SIDE, icon: ICON_MAX_SIDE };
const urlKey = (kind) => `${kind}Url`;
/** The stored https address of a slot, or null. */
const stored = (state, kind) => state.data[urlKey(kind)] || null;
/** Everything that decides which pictures a file gets: both uploads, then both stored addresses. */
const sourcesOf = (state) => [state.images.art, state.images.icon, stored(state, 'art'), stored(state, 'icon')];

/** Pictures for the preview: the upload, else the stored address unless the preview already failed to load it. */
function previewImages(state) {
  const pick = (kind) => {
    const url = stored(state, kind);
    return state.images[kind] || (url === state.failed[kind] ? null : url);
  };
  return { art: pick('art'), icon: pick('icon') };
}

/** Pictures for a "link" HTML file: the upload, else the stored address, whether or not the preview could load it. */
function linkImages(state) {
  return { art: state.images.art || stored(state, 'art'), icon: state.images.icon || stored(state, 'icon') };
}

/**
 * Pictures for files that carry them (embedded HTML, PNG/JPEG): remote ones are fetched and converted first. The slots
 * are read once, before the first await. If the user changes a picture while a conversion runs, the result would mix old
 * and new pictures, so it is dropped (null, status shown).
 */
async function embeddedImages({ state, setStatus }) {
  const before = sourcesOf(state);
  const images = { art: before[0], icon: before[1] };
  const urls = { art: before[2], icon: before[3] };
  for (const kind of KINDS) {
    if (images[kind] || !urls[kind]) continue;
    const converted = await fetchImageAsDataUrl(urls[kind], MAX_SIDE[kind]);
    if (!converted.ok) {
      console.warn(`${kind} image could not be embedded: ${converted.error}`);
      setStatus(EMBED_FAIL, 'error');
      return null;
    }
    images[kind] = converted.dataUrl;
  }
  if (sourcesOf(state).some((value, i) => value !== before[i])) {
    setStatus(SOURCE_CHANGED, 'error');
    return null;
  }
  return images;
}

/**
 * Take an uploaded file for a slot; the stored address of that slot is dropped (an upload beats an address). Every
 * action that changes a slot takes a new token, and a result is applied only while its token is still the latest, so
 * the last action wins: an upload that finishes after a newer action on the slot is discarded without a word.
 */
async function uploadImage({ state, setStatus, commit, tokens }, kind, file) {
  tokens[kind] += 1;
  const token = tokens[kind];
  setStatus('이미지를 불러오는 중입니다…');
  const result = await loadImageFile(file, MAX_SIDE[kind]);
  if (token !== tokens[kind]) return false;
  if (!result.ok) {
    setStatus(`${result.error} 기존 ${LABELS[kind]}은(는) 그대로 유지됩니다.`, 'error');
    return false;
  }
  state.images[kind] = result.dataUrl;
  state.raw[urlKey(kind)] = '';
  state.failed[kind] = '';
  setStatus(`${LABELS[kind]} 이미지를 적용했습니다 (${result.width}×${result.height}px).`, 'ok');
  commit();
  return true;
}

/** Remove whatever picture the slot has: the upload and the stored address. An upload still in flight is cancelled. */
function removeImage({ state, setStatus, commit, tokens }, kind) {
  tokens[kind] += 1;
  state.images[kind] = null;
  state.raw[urlKey(kind)] = '';
  state.failed[kind] = '';
  setStatus(`${LABELS[kind]} 이미지를 제거했습니다.`, 'ok');
  commit();
}

/**
 * Store a typed address for a slot and release the upload of that slot (an upload still in flight is cancelled).
 * Returns false, and changes nothing, for a bad address.
 */
function applyImageUrl({ state, setStatus, commit, tokens }, kind, text) {
  const checked = validateImageUrl(text);
  if (!checked.ok) {
    setStatus(`${checked.error} 기존 ${LABELS[kind]}은(는) 그대로 유지됩니다.`, 'error');
    return false;
  }
  tokens[kind] += 1;
  state.raw[urlKey(kind)] = checked.value;
  state.images[kind] = null; // an upload would hide the address
  state.failed[kind] = '';
  setStatus(`${LABELS[kind]} 주소를 적용했습니다.`, 'ok');
  commit();
  return true;
}

/** Forget the stored address of the slot (an upload, if any or still in flight, stays). */
function clearImageUrl({ state, setStatus, commit }, kind) {
  state.raw[urlKey(kind)] = '';
  state.failed[kind] = '';
  setStatus(`${LABELS[kind]} 주소를 지웠습니다.`, 'ok');
  commit();
}

/** Drop uploads and remembered load failures; uploads still in flight must not land on the reset sample. */
function reset({ state, tokens }) {
  for (const kind of KINDS) tokens[kind] += 1;
  state.images = { art: null, icon: null };
  state.failed = { art: '', icon: '' };
}

/** A remote picture failed to load: show the built-in art instead (the address stays stored) and tell the user. */
function onLoadError({ state, setStatus, render }, src) {
  let changed = false;
  for (const kind of KINDS) {
    if (!state.images[kind] && stored(state, kind) === src && state.failed[kind] !== src) {
      state.failed[kind] = src;
      changed = true;
    }
  }
  if (!changed) return; // a stale event from an element that has already been replaced
  setStatus(URL_LOAD_FAIL, 'error');
  render();
}

/**
 * A picture element still loading when the timeout ends fails the same way as a load error. An element that has been
 * replaced by a newer render is skipped: its successor has its own timer, so a restarted load is never failed early.
 */
function armLoadTimeout(env, img, src) {
  setTimeout(() => {
    if (img.isConnected && !img.complete) onLoadError(env, src);
  }, IMAGE_LOAD_TIMEOUT_MS);
}

/** After each preview render: remote pictures that fail to load, or are still loading after the timeout, fall back. */
function watchPreview(env, root) {
  for (const img of root.querySelectorAll('img')) {
    const src = img.getAttribute('src');
    if (src === null || !src.startsWith('https:')) continue;
    img.addEventListener('error', () => onLoadError(env, src), { once: true });
    if (!img.complete) armLoadTimeout(env, img, src);
  }
}

/**
 * @typedef {Object} ImageFlow
 * @property {() => {art: string|null, icon: string|null}} previewImages upload > stored address (unless it failed) > null
 * @property {() => {art: string|null, icon: string|null}} linkImages upload > stored address, for "link" HTML
 * @property {() => Promise<{art: string|null, icon: string|null}|null>} embeddedImages data URLs only; null (status shown) when a remote picture cannot be converted or the pictures changed meanwhile
 * @property {(root: ParentNode) => void} watchPreview attach load-error handling to the freshly rendered preview
 * @property {(kind: 'art'|'icon', file: File) => Promise<boolean>} uploadImage false when refused or superseded by a newer action on the slot
 * @property {(kind: 'art'|'icon') => void} removeImage
 * @property {(kind: 'art'|'icon', text: string) => boolean} applyImageUrl
 * @property {(kind: 'art'|'icon') => void} clearImageUrl
 * @property {() => void} reset drop uploads and remembered load failures (used by "reset to sample")
 */

/**
 * Create the picture controller.
 * @param {{state: object, setStatus: (text: string, kind?: string) => void, commit: () => void, render: () => void}} ctx
 *   `state.raw`/`state.data` hold the addresses (`artUrl`, `iconUrl`), `state.images` the uploads (data URLs) and
 *   `state.failed` the addresses the preview could not load; `commit` normalises, saves and redraws; `render` redraws only
 * @returns {ImageFlow}
 */
export function createImageFlow(ctx) {
  const env = { ...ctx, tokens: { art: 0, icon: 0 } }; // per-slot action counters: the latest action on a slot wins
  const { state } = env;
  return {
    previewImages: () => previewImages(state),
    linkImages: () => linkImages(state),
    embeddedImages: () => embeddedImages(env),
    watchPreview: (root) => watchPreview(env, root),
    uploadImage: (kind, file) => uploadImage(env, kind, file),
    removeImage: (kind) => removeImage(env, kind),
    applyImageUrl: (kind, text) => applyImageUrl(env, kind, text),
    clearImageUrl: (kind) => clearImageUrl(env, kind),
    reset: () => reset(env),
  };
}
