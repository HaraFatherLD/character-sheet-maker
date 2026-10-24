// CharacterData schema: normalisation of untrusted input (localStorage, forms) and image-file validation.
import { DEFAULT_STAT_LABELS, LIMITS, TEMPLATE_IDS, TEXT_FIELDS, cutText, isObject, own } from './schema-base.js';
import { defaultGenId, normalizeExtras } from './schema-custom.js';
import { validateImageUrl } from './image-url.js';

export {
  TEMPLATE_IDS, DEFAULT_STAT_LABELS, TEXT_FIELDS, LIMITS, cutText, LABEL_KEYS, HIDEABLE_KEYS, BLOCK_KEYS, DEFAULT_LAYOUT,
  PALETTE_TOKENS, PALETTE_TEMPLATES, LABELED_KEYS, DEFAULT_LABELS,
} from './schema-base.js';

/** Accepted upload MIME types and the size ceiling (20 MiB). */
export const IMAGE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp']);
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function normInt(value, min, max, fallback) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normStat(raw, fallbackLabel) {
  if (!isObject(raw)) return { label: fallbackLabel, percent: 50, score: 10 };
  const label = own(raw, 'label');
  return {
    label: typeof label === 'string' ? cutText(label, LIMITS.statLabel) : fallbackLabel,
    percent: normInt(own(raw, 'percent'), 0, 100, 50),
    score: normInt(own(raw, 'score'), 1, 30, 10),
  };
}

function normTags(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t) => typeof t === 'string').map((t) => cutText(t.trim(), LIMITS.tagLength)).filter(Boolean).slice(0, LIMITS.tags);
}

function normSkills(raw) {
  if (!Array.isArray(raw)) return [];
  const str = (v) => (typeof v === 'string' ? v : '');
  return raw.filter(isObject)
    .map((s) => ({ name: str(own(s, 'name')), desc: str(own(s, 'desc')) }))
    .filter((s) => s.name !== '' || s.desc !== '')
    .slice(0, LIMITS.skills)
    .map((s) => ({ name: cutText(s.name, LIMITS.skillName), desc: cutText(s.desc, LIMITS.skillDesc) }));
}

function normArt(raw) {
  const art = isObject(raw) ? raw : {};
  return { fit: own(art, 'fit') === 'contain' ? 'contain' : 'cover', focusX: normInt(own(art, 'focusX'), 0, 100, 50), focusY: normInt(own(art, 'focusY'), 0, 100, 30) };
}

/** A stored image address: the normalised https URL, or '' when it is missing or invalid (never an error). */
function normUrl(raw) {
  const checked = validateImageUrl(raw);
  return checked.ok ? checked.value : '';
}

function normStructure(raw) {
  const accent = own(raw, 'accentColor');
  const template = own(raw, 'template');
  return {
    template: TEMPLATE_IDS.includes(template) ? template : 'fantasy',
    accentColor: typeof accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(accent) ? accent.toLowerCase() : '',
    statMode: own(raw, 'statMode') === 'trpg' ? 'trpg' : 'percent',
  };
}

/**
 * Turn untrusted input into valid CharacterData (v1 data gets the v2 defaults). Never throws; builds a fresh
 * object from whitelisted keys.
 * @param {unknown} raw
 * @param {{genId?: () => string}} [options] `genId` replaces the random id generator (tests, determinism)
 * @returns {{ok: true, value: object} | {ok: false, error: string}}
 */
export function normalizeCharacter(raw, options = {}) {
  try {
    if (!isObject(raw)) return { ok: false, error: '캐릭터 데이터 형식이 올바르지 않습니다.' };
    const value = normStructure(raw);
    for (const { key, label, max } of TEXT_FIELDS) {
      const text = own(raw, key);
      if (text !== undefined && text !== null && typeof text !== 'string') return { ok: false, error: `${label} 값은 문자열이어야 합니다.` };
      value[key] = cutText(text ?? '', max);
    }
    const stats = own(raw, 'stats');
    value.tags = normTags(own(raw, 'tags'));
    value.stats = DEFAULT_STAT_LABELS.map((label, i) => normStat(Array.isArray(stats) ? stats[i] : undefined, label));
    value.skills = normSkills(own(raw, 'skills'));
    value.art = normArt(own(raw, 'art'));
    value.artUrl = normUrl(own(raw, 'artUrl'));
    value.iconUrl = normUrl(own(raw, 'iconUrl'));
    const genId = isObject(options) && typeof options.genId === 'function' ? options.genId : defaultGenId;
    return { ok: true, value: Object.assign(value, normalizeExtras(raw, genId)) };
  } catch {
    return { ok: false, error: '캐릭터 데이터를 읽을 수 없습니다.' };
  }
}

/**
 * Check an uploaded file's MIME type and size before decoding it.
 * @param {{type?: string, size?: number}|null|undefined} file
 * @returns {{ok: true} | {ok: false, error: string}}
 */
export function validateImageFile(file) {
  if (!isObject(file)) return { ok: false, error: '파일을 선택해 주세요.' };
  if (!IMAGE_TYPES.includes(file.type)) return { ok: false, error: 'JPEG, PNG, WebP 이미지만 사용할 수 있습니다.' };
  if (typeof file.size !== 'number' || !(file.size >= 1)) return { ok: false, error: '비어 있는 파일입니다.' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: '이미지는 20MB 이하여야 합니다.' };
  return { ok: true };
}
