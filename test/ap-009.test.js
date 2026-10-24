import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportHtml } from '../src/core/export-html.js';
import { TEMPLATES, getTemplate } from '../src/templates/index.js';
import { sampleCharacter } from '../src/core/sample.js';
import { PNG, PAYLOADS, unsafeReasons } from './helpers.js';

const NO_IMAGES = { art: null, icon: null };

test('AP-009 export is a complete standalone document', () => {
  const res = exportHtml(sampleCharacter(), NO_IMAGES, getTemplate('fantasy'));
  assert.equal(res.ok, true);
  assert.match(res.html, /^<!doctype html>/i);
  assert.match(res.html, /<meta charset="utf-8">/i);
  assert.match(res.html, /<meta name="viewport"[^>]*width=device-width/i);
  assert.match(res.html, /<style>[\s\S]*\.cs-fantasy[\s\S]*@media print[\s\S]*<\/style>/);
  assert.match(res.html, new RegExp(`<title>${sampleCharacter().name} - 캐릭터 시트</title>`));
});

test('AP-009 every template exports without external resources', () => {
  for (const t of TEMPLATES) {
    const res = exportHtml(sampleCharacter(), { art: PNG, icon: PNG }, t);
    assert.equal(res.ok, true, t.id);
    const lower = res.html.toLowerCase();
    for (const bad of ['<script', '<link', '@import', 'url(', 'http:', 'https:']) assert.ok(!lower.includes(bad), `${t.id}: ${bad}`);
    for (const m of res.html.matchAll(/\ssrc="([^"]*)"/g)) assert.match(m[1], /^data:image\/(png|jpeg|webp);base64,/, t.id);
    assert.deepEqual(unsafeReasons(res.html), [], t.id);
  }
});

test('AP-009 the title is escaped', () => {
  for (const p of PAYLOADS) {
    const { html } = exportHtml({ ...sampleCharacter(), name: p }, NO_IMAGES, getTemplate('anime'));
    const title = html.match(/<title>([^]*?)<\/title>/)[1];
    assert.ok(!/[<>"]/.test(title), p);
    assert.deepEqual(unsafeReasons(html), [], p);
  }
});

test('AP-009 URLs typed by the user stay plain text and do not break the invariants', () => {
  const t = getTemplate('magazine');
  const res = exportHtml({ ...sampleCharacter(), quote: 'see https://example.com src=x url(y)' }, NO_IMAGES, t);
  assert.equal(res.ok, true);
  assert.deepEqual(unsafeReasons(res.html), []);
  assert.ok(res.html.includes('https://example.com'));
  const css = res.html.match(/<style>([\s\S]*?)<\/style>/)[1].toLowerCase();
  for (const bad of ['url(', '@import', 'http:', 'https:']) assert.ok(!css.includes(bad), bad);
});

test('AP-009 invalid images or data are refused without throwing', () => {
  const bad = [{ art: 'javascript:alert(1)', icon: null }, { art: null, icon: 'data:image/svg+xml;base64,AAAA' }, { art: 'https://x/y.png', icon: null }];
  for (const images of bad) {
    let res;
    assert.doesNotThrow(() => { res = exportHtml(sampleCharacter(), images, getTemplate('tcg')); });
    assert.equal(res.ok, false, JSON.stringify(images));
    assert.equal(typeof res.error, 'string');
  }
  assert.equal(exportHtml(null, NO_IMAGES, getTemplate('tcg')).ok, false);
});
