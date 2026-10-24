// DOM helpers. Nodes are only ever built with createElement / createElementNS / setAttribute / text nodes /
// style.setProperty; there is no markup parsing anywhere in the app.
import { SVG_NS, SVG_TAGS, assertVNode, attrPairs } from '../core/vnode.js';

/**
 * Build a DOM tree from a VNode. Shares validation (tag/attribute whitelists, style and src rules) with toHtml.
 * Remote (https) pictures are requested with CORS, without cookies and without a referrer, like the export does.
 * @param {object|string} node VNode or text
 * @param {Document} doc
 * @param {boolean} [inSvg=false] internal: true while inside an svg subtree
 * @returns {Node}
 */
export function toDom(node, doc, inSvg = false) {
  if (typeof node === 'string') return doc.createTextNode(node);
  assertVNode(node);
  const svg = inSvg || node.tag === 'svg';
  const element = svg && SVG_TAGS.has(node.tag) ? doc.createElementNS(SVG_NS, node.tag) : doc.createElement(node.tag);
  const pairs = attrPairs(node.attrs);
  if (node.tag === 'img' && pairs.some(([name, value]) => name === 'src' && value.startsWith('https:'))) {
    // Same request shape as the export's fetch, so a preview that works can also be embedded. These must be set
    // before `src`, which starts the request.
    element.crossOrigin = 'anonymous';
    element.referrerPolicy = 'no-referrer';
  }
  for (const [name, value] of pairs) {
    if (name !== 'style') element.setAttribute(name, value);
  }
  if (node.attrs && node.attrs.style) {
    for (const [prop, value] of Object.entries(node.attrs.style)) element.style.setProperty(prop, String(value));
  }
  for (const child of node.children) element.appendChild(toDom(child, doc, svg));
  return element;
}

/**
 * Create a UI element. `attrs.on` maps event names to listeners; false/null/undefined attributes are skipped.
 * @param {string} tag
 * @param {Record<string, unknown>|null} [attrs]
 * @param {...unknown} children strings, Nodes or (nested) arrays
 * @returns {HTMLElement}
 */
export function el(tag, attrs, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'on') {
      for (const [type, listener] of Object.entries(value)) node.addEventListener(type, listener);
    } else {
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }
  const items = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
  node.append(...items.map((c) => (c instanceof Node ? c : String(c))));
  return node;
}

/**
 * A titled form panel.
 * @param {string} title
 * @param {...unknown} children
 * @returns {HTMLElement}
 */
export function section(title, ...children) {
  return el('section', { class: 'panel' }, el('h2', { class: 'panel-title' }, title), ...children);
}

/**
 * A labelled control; single form controls are wrapped in a <label>, composite ones in a <div>.
 * @param {string} text
 * @param {HTMLElement} control
 * @returns {HTMLElement}
 */
export function field(text, control) {
  const wrapper = /^(INPUT|SELECT|TEXTAREA)$/.test(control.tagName) ? 'label' : 'div';
  return el(wrapper, { class: 'field' }, el('span', { class: 'field-label' }, text), control);
}
