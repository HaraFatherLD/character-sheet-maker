// Normalisers for the v2 additions to CharacterData: labels, hidden items, custom fields and blocks, layout, palettes.
// Lookups use Map/Set only (never plain-object indexing), so ids such as "constructor" cannot reach prototype members.
import {
  BLOCK_KEYS, DEFAULT_LAYOUT, HIDEABLE_KEYS, ID_PATTERN, LABEL_KEYS, LIMITS, PALETTE_TEMPLATES, PALETTE_TOKENS,
  cloneLayout, cutText, isObject, own,
} from './schema-base.js';

const HIDEABLE = new Set(HIDEABLE_KEYS);
const BUILT_IN_BLOCKS = new Set(BLOCK_KEYS);
const RESERVED_IDS = new Set([...BLOCK_KEYS, ...HIDEABLE_KEYS, 'name', 'art', 'custom', 'constructor', 'prototype', '__proto__', 'tostring', 'valueof', 'hasownproperty']);
const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_ID_TRIES = 20;
const str = (value) => (typeof value === 'string' ? value : '');

/**
 * Default id generator: `b-` plus eight characters of a random UUID.
 * @returns {string}
 */
export function defaultGenId() {
  const c = globalThis.crypto;
  const uuid = c && typeof c.randomUUID === 'function' ? c.randomUUID() : Math.random().toString(16).slice(2).padEnd(8, '0');
  return `b-${uuid.slice(0, 8)}`;
}

/** Returns `issue(candidate)`: the candidate when it is valid, unreserved and unused, else a generated id (null after 20 failures). */
function idIssuer(genId) {
  const used = new Set();
  const usable = (id) => typeof id === 'string' && ID_PATTERN.test(id) && !RESERVED_IDS.has(id) && !used.has(id);
  return (candidate) => {
    let id = candidate;
    for (let tries = 0; !usable(id); tries += 1) {
      if (tries >= MAX_ID_TRIES) return null;
      try { id = genId(); } catch { id = null; } // a failing generator counts as one more failed try
    }
    used.add(id);
    return id;
  };
}

function normLabels(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const key of LABEL_KEYS) {
    const value = own(raw, key);
    const text = typeof value === 'string' ? cutText(value.trim(), LIMITS.label) : '';
    if (text !== '') out[key] = text;
  }
  return out;
}

function normHidden(raw) {
  const seen = new Set();
  for (const key of Array.isArray(raw) ? raw : []) {
    if (typeof key === 'string' && HIDEABLE.has(key)) seen.add(key);
  }
  return [...seen];
}

function normCustomFields(raw, issue) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject)
    .map((f) => ({ id: own(f, 'id'), label: str(own(f, 'label')).trim(), value: str(own(f, 'value')).trim() }))
    .filter((f) => f.label !== '' || f.value !== '')
    .map((f) => ({ ...f, label: cutText(f.label, LIMITS.customFieldLabel), value: cutText(f.value, LIMITS.customFieldValue) }))
    .slice(0, LIMITS.customFields)
    .map((f) => ({ ...f, id: issue(f.id) }))
    .filter((f) => f.id !== null);
}

function normItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((v) => typeof v === 'string').map((v) => v.trim()).filter((v) => v !== '')
    .map((v) => cutText(v, LIMITS.blockItem)).slice(0, LIMITS.blockItems);
}

function normBlock(raw) {
  const kind = own(raw, 'kind') === 'list' ? 'list' : 'text';
  return {
    id: own(raw, 'id'),
    kind,
    title: cutText(str(own(raw, 'title')).trim(), LIMITS.blockTitle),
    body: kind === 'list' ? '' : cutText(str(own(raw, 'body')).trim(), LIMITS.blockBody),
    items: kind === 'text' ? [] : normItems(own(raw, 'items')),
  };
}

function normCustomBlocks(raw, issue) {
  if (!Array.isArray(raw)) return [];
  // Empty blocks are kept (SPEC rev.4); the renderer skips them.
  return raw.filter(isObject).map(normBlock)
    .slice(0, LIMITS.customBlocks)
    .map((b) => ({ ...b, id: issue(b.id) }))
    .filter((b) => b.id !== null);
}

/** Unknown/duplicate ids go and missing built-in and custom blocks are re-added, also for a non-object layout (SPEC rev.4). */
function normLayout(input, blocks) {
  const raw = isObject(input) ? input : {};
  const valid = new Set(blocks.map((b) => b.id));
  const seen = new Set();
  const scan = (list) => {
    const kept = [];
    for (const id of Array.isArray(list) ? list : []) {
      if (typeof id === 'string' && (BUILT_IN_BLOCKS.has(id) || valid.has(id)) && !seen.has(id)) { seen.add(id); kept.push(id); }
    }
    return kept;
  };
  const layout = { info: scan(own(raw, 'info')), main: scan(own(raw, 'main')) };
  for (const area of ['info', 'main']) {
    for (const id of DEFAULT_LAYOUT[area]) {
      if (!seen.has(id)) { seen.add(id); layout[area].push(id); }
    }
  }
  for (const block of blocks) {
    if (!seen.has(block.id)) { seen.add(block.id); layout.main.push(block.id); }
  }
  return layout;
}

function normPalettes(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const templateId of PALETTE_TEMPLATES) {
    const source = own(raw, templateId);
    if (!isObject(source)) continue;
    const tokens = {};
    for (const token of PALETTE_TOKENS) {
      const color = own(source, token);
      if (typeof color === 'string' && HEX.test(color)) tokens[token] = color.toLowerCase();
    }
    if (Object.keys(tokens).length > 0) out[templateId] = tokens;
  }
  return out;
}

/**
 * Normalise the v2 fields of a raw character object. Custom fields get their ids first, then custom blocks.
 * @param {object} raw a plain object (checked by the caller)
 * @param {() => string} genId id generator used to reissue invalid, reserved or duplicate ids
 * @returns {{labels: object, hidden: string[], customFields: object[], customBlocks: object[], layout: {info: string[], main: string[]}, palettes: object}}
 */
export function normalizeExtras(raw, genId) {
  const issue = idIssuer(genId);
  const customFields = normCustomFields(own(raw, 'customFields'), issue);
  const customBlocks = normCustomBlocks(own(raw, 'customBlocks'), issue);
  return {
    labels: normLabels(own(raw, 'labels')),
    hidden: normHidden(own(raw, 'hidden')),
    customFields,
    customBlocks,
    layout: normLayout(own(raw, 'layout'), customBlocks),
    palettes: normPalettes(own(raw, 'palettes')),
  };
}
