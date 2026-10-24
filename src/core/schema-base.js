// Constants and tiny helpers shared by the schema modules, the view model, the templates and the editor.
// This is a leaf module (it imports nothing), so every other module can depend on it without import cycles.

/** The fourteen design ids, in registry order. */
export const TEMPLATE_IDS = Object.freeze(['fantasy', 'scifi', 'anime', 'pixel', 'cyberpunk', 'grimoire', 'tcg', 'wanted', 'dossier', 'magazine', 'storybook', 'streamer', 'clean', 'vertical']);
/** Labels used when a stat label is missing; also fixes the stat count at six. */
export const DEFAULT_STAT_LABELS = Object.freeze(['힘', '민첩', '체력', '지능', '지혜', '매력']);
/** The 14 free-text fields in display order: key, Korean label, max length in code points, multiline form control. */
export const TEXT_FIELDS = Object.freeze([
  { key: 'name', label: '이름', max: 40, multiline: false },
  { key: 'title', label: '별칭/칭호', max: 60, multiline: false },
  { key: 'age', label: '나이', max: 20, multiline: false },
  { key: 'gender', label: '성별', max: 20, multiline: false },
  { key: 'race', label: '종족', max: 30, multiline: false },
  { key: 'role', label: '직업/역할', max: 30, multiline: false },
  { key: 'affiliation', label: '소속', max: 40, multiline: false },
  { key: 'height', label: '키', max: 20, multiline: false },
  { key: 'birthday', label: '생일', max: 20, multiline: false },
  { key: 'quote', label: '대사', max: 120, multiline: true },
  { key: 'likes', label: '좋아하는 것', max: 120, multiline: true },
  { key: 'dislikes', label: '싫어하는 것', max: 120, multiline: true },
  { key: 'summary', label: '소개', max: 300, multiline: true },
  { key: 'backstory', label: '배경 이야기', max: 1500, multiline: true },
]);
/** Limits for structured fields (counts, and lengths in code points). */
export const LIMITS = Object.freeze({
  tags: 8, tagLength: 16, statLabel: 12, skills: 6, skillName: 30, skillDesc: 120,
  label: 20, customFields: 8, customFieldLabel: 20, customFieldValue: 60,
  customBlocks: 12, blockTitle: 30, blockBody: 600, blockItems: 10, blockItem: 60,
});

const TEXT_KEYS = TEXT_FIELDS.map((f) => f.key).filter((key) => key !== 'name');

/** Items whose name the user may edit (everything shown with a label; never `name`). */
export const LABEL_KEYS = Object.freeze([...TEXT_KEYS, 'tags', 'stats', 'skills', 'profile', 'custom']);
/** Items the user may switch off (`name` and `art` are fixed). */
export const HIDEABLE_KEYS = Object.freeze([...TEXT_KEYS, 'tags', 'stats', 'skills', 'icon', 'custom', 'profile']);
/** Built-in sections of the block-based designs. */
export const BLOCK_KEYS = Object.freeze(['profile', 'quote', 'summary', 'likes', 'dislikes', 'tags', 'stats', 'skills', 'backstory']);
/** Block order and area of a fresh character. */
export const DEFAULT_LAYOUT = Object.freeze({
  info: Object.freeze(['profile', 'quote']),
  main: Object.freeze(['summary', 'stats', 'skills', 'tags', 'likes', 'dislikes', 'backstory']),
});
/** Colour tokens of the block-based designs; each becomes `--c-<token>` on the sheet root. */
export const PALETTE_TOKENS = Object.freeze(['bg', 'panel', 'text', 'muted', 'accent', 'title', 'line', 'chip']);
/** Designs that carry their own palette. */
export const PALETTE_TEMPLATES = Object.freeze(['clean', 'vertical']);
/** Keys whose marker element must contain the (possibly edited) label as a text node. */
export const LABELED_KEYS = Object.freeze(['age', 'gender', 'affiliation', 'height', 'birthday', 'likes', 'dislikes', 'backstory', 'skills', 'stats']);
/** Default label per key: the 14 text fields plus tags, stats, skills, profile and custom. */
export const DEFAULT_LABELS = Object.freeze({
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, f.label])),
  tags: '태그', stats: '능력치', skills: '스킬', profile: '프로필', custom: '추가 정보',
});
/** Shape of a valid custom field / block id. */
export const ID_PATTERN = /^[a-z0-9-]{1,24}$/;

/**
 * True for a plain (non-null, non-array) object.
 * @param {unknown} v
 * @returns {boolean}
 */
export const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Own-property read: never walks the prototype chain.
 * @param {object} obj
 * @param {string} key
 * @returns {unknown}
 */
export const own = (obj, key) => (Object.hasOwn(obj, key) ? obj[key] : undefined);

/**
 * A mutable copy of a layout (info and main arrays copied).
 * @param {{info: readonly string[], main: readonly string[]}} layout
 * @returns {{info: string[], main: string[]}}
 */
export function cloneLayout(layout) {
  return { info: [...layout.info], main: [...layout.main] };
}

/**
 * Cut a string to `max` code points (not UTF-16 units).
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
export function cutText(text, max) {
  if (text.length <= max) return text;
  const points = Array.from(text);
  return points.length <= max ? text : points.slice(0, max).join('');
}
