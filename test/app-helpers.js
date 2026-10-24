// Stubs for testing the browser-side modules in Node: an app-shaped state wired to the real image flow, fake image
// decoding (createImageBitmap + canvas), fetch responses, fake timers and a minimal fake DOM.
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { createImageFlow } from '../src/app/image-flow.js';
import { PNG } from './helpers.js';

export const ART_URL = 'https://example.com/art.png';
export const ICON_URL = 'https://cdn.example.org/icon.webp';
/** A second valid data URL, standing for "another picture". */
export const OTHER_PNG = 'data:image/png;base64,iVBORw0KGgo=';
/** The bytes of the 1x1 png fixture: a real header, so the header-size guard reads 1x1. */
export const PNG_BYTES = Buffer.from(PNG.split(',')[1], 'base64');

/** Set globals for one test; the returned function puts the previous values back. */
export function stubGlobals(values) {
  const saved = Object.keys(values).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true, enumerable: true });
  }
  return () => {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  };
}

/** Silence console.warn (the failure paths log on purpose); the returned function restores it. */
export function silenceWarnings() {
  const original = console.warn;
  console.warn = () => {};
  return () => { console.warn = original; };
}

/** Wait, without sleeping, until `condition()` is true. */
export async function until(condition, label = 'condition') {
  for (let i = 0; i < 500; i += 1) {
    if (condition()) return;
    await new Promise((resolve) => setImmediate(resolve));
  }
  throw new Error(`timed out waiting for ${label}`);
}

/** A response like fetch gives; `type` null leaves the content-type header out. */
export function imageResponse(body, type = 'image/png', status = 200) {
  return new Response(body, { status, headers: type === null ? {} : { 'content-type': type } });
}

/** An uploaded file; `tag` tells the fake canvas which data URL it should produce. */
export function pngFile(tag) {
  return Object.assign(new Blob([PNG_BYTES], { type: 'image/png' }), { tag });
}

/** The state shape of app.js (raw, data, images, failed, out) wired to the real image flow, with recorders for the stubs. */
export function makeFlow() {
  const state = {
    raw: structuredClone(sampleCharacter()),
    data: sampleCharacter(),
    images: { art: null, icon: null },
    failed: { art: '', icon: '' },
    out: {},
  };
  const log = { status: [], commits: 0, renders: 0 };
  const setStatus = (text, kind = 'info') => { log.status.push({ text, kind }); };
  const commit = () => {
    const result = normalizeCharacter(state.raw);
    if (result.ok) state.data = result.value;
    log.commits += 1;
  };
  const flow = createImageFlow({ state, setStatus, commit, render: () => { log.renders += 1; } });
  return { state, log, flow, lastStatus: () => log.status[log.status.length - 1] };
}

/** Capture setTimeout/clearTimeout instead of waiting: `fire(i)` runs the i-th callback as if its delay had passed. */
export function fakeTimers() {
  const timers = [];
  const cleared = [];
  const restore = stubGlobals({
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); return timers.length; },
    clearTimeout: (id) => { cleared.push(id); },
  });
  return { timers, cleared, restore, fire: (index = 0) => timers[index].callback() };
}

/**
 * Fake image decoding for loadImageFile: createImageBitmap plus a canvas. With `deferred`, every decode waits until its
 * entry in `pending` is called, which keeps an upload "in flight". The data URL a file turns into comes from `urls[file.tag]`.
 */
export function fakeDecoding({ deferred = false, urls = {}, size = { width: 1, height: 1 } } = {}) {
  const pending = [];
  const canvases = [];
  const calls = { decode: 0 };
  const createImageBitmap = (blob) => {
    calls.decode += 1;
    const bitmap = { ...size, blob, close() {} };
    if (!deferred) return Promise.resolve(bitmap);
    return new Promise((resolve) => { pending.push(() => resolve(bitmap)); });
  };
  const createElement = () => {
    const canvas = { width: 0, height: 0, source: null };
    canvas.getContext = () => ({ drawImage(source) { canvas.source = source; } });
    canvas.toDataURL = () => urls[canvas.source.blob.tag] ?? PNG;
    canvases.push(canvas);
    return canvas;
  };
  return { pending, canvases, calls, restore: stubGlobals({ createImageBitmap, document: { createElement } }) };
}

/** A preview <img> for watchPreview: records its listeners; flip `complete` / `isConnected` to model the browser. */
export function fakeImg(src, { complete = false } = {}) {
  const img = {
    complete,
    isConnected: true,
    handlers: {},
    options: {},
    getAttribute: (name) => (name === 'src' ? src : null),
    addEventListener(type, handler, options) { img.handlers[type] = handler; img.options[type] = options; },
  };
  return img;
}

/** A preview root whose querySelectorAll('img') returns the given images. */
export const fakeRoot = (...imgs) => ({ querySelectorAll: () => imgs });

/** The few DOM features dom.js and form-media.js use; `type()` mimics typing or pasting, which maxlength cuts. */
export class FakeNode {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.attrs = new Map();
    this.children = [];
    this.listeners = new Map();
    this.value = '';
  }

  setAttribute(name, value) { this.attrs.set(name, String(value)); }

  getAttribute(name) { return this.attrs.has(name) ? this.attrs.get(name) : null; }

  append(...items) { this.children.push(...items); }

  addEventListener(type, listener) { this.listeners.set(type, [...(this.listeners.get(type) || []), listener]); }

  dispatch(type, event = {}) {
    for (const listener of this.listeners.get(type) || []) listener({ preventDefault() {}, ...event });
  }

  click() { this.dispatch('click'); }

  type(text) {
    const max = this.getAttribute('maxlength');
    this.value = max === null ? text : text.slice(0, Number(max));
  }

  findAll(predicate, found = []) {
    if (predicate(this)) found.push(this);
    for (const child of this.children) if (child instanceof FakeNode) child.findAll(predicate, found);
    return found;
  }

  byId(id) { return this.findAll((node) => node.getAttribute('id') === id)[0] ?? null; }
}

/** Install the fake DOM globals (document.createElement, Node); returns the restore function. */
export function fakeDom() {
  return stubGlobals({ document: { createElement: (tag) => new FakeNode(tag) }, Node: FakeNode });
}
