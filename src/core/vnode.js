// VNode tree: templates return plain data, never HTML strings. Serializers validate against whitelists.
import { escapeHtml, escapeXml } from './escape.js';
import { validateImageUrl } from './image-url.js';

/** Tags a template may use. */
export const ALLOWED_TAGS = new Set(('div span p h1 h2 h3 h4 ul ol li img section header footer figure figcaption '
  + 'strong em small br hr svg path circle rect line polygon polyline g text').split(' '));
/** Attributes a template may use. */
export const ALLOWED_ATTRS = new Set(('class style src alt viewBox d cx cy r x y x1 y1 x2 y2 width height points fill '
  + 'stroke stroke-width opacity transform text-anchor font-size rx ry aria-hidden role').split(' '));
/** Tags that live in the SVG namespace. */
export const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'g', 'text']);
export const XHTML_NS = 'http://www.w3.org/1999/xhtml';
export const SVG_NS = 'http://www.w3.org/2000/svg';

const VOID_TAGS = new Set(['img', 'br', 'hr']);
const IMAGE_SRC = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const STYLE_KEY = /^(--[a-z][a-z0-9-]*|[a-z][a-z-]*)$/;
const STYLE_FORBIDDEN = ['url(', 'image-set(', 'expression', '/*', '@', ';', '{', '}', '<', '>', '"', "'", '\\'];
/** Free-text attributes: only escaped on output, so the style-pattern check skips them (src has its own strict rule). */
const TEXT_ATTRS = new Set(['class', 'alt']);

function flatten(list, out) {
  for (const child of list) {
    if (Array.isArray(child)) flatten(child, out);
    else if (typeof child === 'string') { if (child !== '') out.push(child); }
    else if (typeof child === 'number') out.push(String(child));
    else if (child && typeof child === 'object') out.push(child);
    else if (child !== null && child !== undefined && typeof child !== 'boolean') throw new TypeError('invalid vnode child');
  }
  return out;
}

/**
 * Build a VNode. Children may be strings, numbers, VNodes or (nested) arrays; null/undefined/booleans/'' are dropped.
 * Nothing is validated here; the serializers do that.
 * @param {string} tag
 * @param {Record<string, unknown>|null} [attrs] style must be an object, never a string
 * @param {...unknown} children
 * @returns {{tag: string, attrs: Record<string, unknown>, children: Array<string|object>}}
 */
export function h(tag, attrs, ...children) {
  return { tag, attrs: attrs || {}, children: flatten(children, []) };
}

/**
 * True for a base64 png/jpeg/webp data URL: a picture that travels inside the document.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isDataImageSrc(value) {
  return typeof value === 'string' && IMAGE_SRC.test(value);
}

/**
 * True for an https address already in the form `validateImageUrl` returns (trimmed, normalised, no credentials). A
 * value the URL parser would rewrite is refused, so what was checked is exactly what gets serialised.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isHttpsImageSrc(value) {
  if (typeof value !== 'string') return false;
  const checked = validateImageUrl(value);
  return checked.ok && checked.value === value;
}

/**
 * True for a base64 png/jpeg/webp data URL or a validated https URL: the only values an `src` attribute may hold.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isImageSrc(value) {
  return isDataImageSrc(value) || isHttpsImageSrc(value);
}

const hasForbidden = (text) => {
  const lower = text.toLowerCase();
  return STYLE_FORBIDDEN.some((bad) => lower.includes(bad));
};

/**
 * Validate a style object and serialise it as `prop:value;prop:value`. Throws on any unsafe key or value.
 * @param {Record<string, string|number>} style
 * @returns {string}
 */
export function validateStyle(style) {
  if (style === null || typeof style !== 'object' || Array.isArray(style)) throw new TypeError('style must be an object');
  const parts = [];
  for (const [key, raw] of Object.entries(style)) {
    if (!STYLE_KEY.test(key)) throw new Error(`invalid style property: ${key}`);
    if (!(typeof raw === 'string' || (typeof raw === 'number' && Number.isFinite(raw)))) throw new Error(`invalid style value for ${key}`);
    const value = String(raw);
    if (hasForbidden(value)) throw new Error(`forbidden style value for ${key}`);
    parts.push(`${key}:${value}`);
  }
  return parts.join(';');
}

function attrValue(name, value) {
  if (name === 'style') return validateStyle(value);
  if (name === 'src') {
    if (!isImageSrc(value)) throw new Error('src must be a base64 png/jpeg/webp data URL or a normalised https URL');
    return value;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(`non-finite number for ${name}`);
  const text = String(value);
  if (!TEXT_ATTRS.has(name) && hasForbidden(text)) throw new Error(`forbidden attribute value for ${name}`);
  return text;
}

/**
 * Validated `[name, value]` pairs for a node's attributes (null/undefined/false skipped, empty style skipped).
 * @param {Record<string, unknown>|undefined} attrs
 * @returns {Array<[string, string]>}
 */
export function attrPairs(attrs) {
  const pairs = [];
  for (const [name, value] of Object.entries(attrs || {})) {
    if (!ALLOWED_ATTRS.has(name)) throw new Error(`attribute not allowed: ${name}`);
    if (value === null || value === undefined || value === false) continue;
    const text = attrValue(name, value);
    if (name === 'style' && text === '') continue;
    pairs.push([name, text]);
  }
  return pairs;
}

/**
 * Throw unless `node` is a well-formed VNode with a whitelisted tag.
 * @param {unknown} node
 * @returns {void}
 */
export function assertVNode(node) {
  if (!node || typeof node !== 'object' || typeof node.tag !== 'string' || !Array.isArray(node.children)) throw new TypeError('invalid vnode');
  if (!ALLOWED_TAGS.has(node.tag)) throw new Error(`tag not allowed: ${node.tag}`);
  if (VOID_TAGS.has(node.tag) && node.children.length) throw new Error(`<${node.tag}> cannot have children`);
}

function renderNode(node, xml, root) {
  const esc = xml ? escapeXml : escapeHtml;
  if (typeof node === 'string') return esc(node);
  assertVNode(node);
  const pairs = attrPairs(node.attrs);
  if (xml && node.tag === 'svg') pairs.unshift(['xmlns', SVG_NS]);
  else if (xml && root) pairs.unshift(['xmlns', XHTML_NS]);
  const attrs = pairs.map(([name, value]) => ` ${name}="${esc(value)}"`).join('');
  const open = `<${node.tag}${attrs}`;
  if (VOID_TAGS.has(node.tag)) return xml ? `${open}/>` : `${open}>`;
  if (xml && node.children.length === 0) return `${open}/>`;
  const inner = node.children.map((child) => renderNode(child, xml, false)).join('');
  return `${open}>${inner}</${node.tag}>`;
}

/**
 * Serialise a VNode to HTML. Text and attribute values are escaped; anything off the whitelists throws.
 * @param {object|string} node
 * @returns {string}
 */
export function toHtml(node) {
  return renderNode(node, false, true);
}

/**
 * Serialise a VNode to well-formed XHTML for the raster path (self-closing empty elements, xmlns on the root and on svg).
 * @param {object|string} node
 * @returns {string}
 */
export function toXhtml(node) {
  return renderNode(node, true, true);
}
