import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportHtml } from '../src/core/export-html.js';
import { TEMPLATES, getTemplate } from '../src/templates/index.js';
import { sampleCharacter } from '../src/core/sample.js';
import { PNG, unsafeReasons } from './helpers.js';

const URL_ART = 'https://example.com/art.png';
const URL_ICON = 'https://cdn.example.org/icon.webp';
const cspOf = (html) => (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/g) || []);

test('AP-042 embed mode (default) carries a data-only CSP and refuses remote images', () => {
  const res = exportHtml(sampleCharacter(), { art: PNG, icon: null }, getTemplate('clean'));
  assert.equal(res.ok, true);
  const csp = cspOf(res.html);
  assert.equal(csp.length, 1);
  assert.ok(csp[0].includes("default-src 'none'") && csp[0].includes("style-src 'unsafe-inline'") && csp[0].includes('img-src data:"'), csp[0]);
  const remote = exportHtml(sampleCharacter(), { art: URL_ART, icon: null }, getTemplate('clean'));
  assert.equal(remote.ok, false);
  assert.equal(typeof remote.error, 'string');
  assert.equal(exportHtml(sampleCharacter(), { art: URL_ART, icon: null }, getTemplate('clean'), { imageMode: 'weird' }).ok, false, 'unknown mode behaves like embed');
});

test('AP-042 link mode keeps validated https images for every template', () => {
  for (const t of TEMPLATES) {
    const res = exportHtml(sampleCharacter(), { art: URL_ART, icon: URL_ICON }, t, { imageMode: 'link' });
    assert.equal(res.ok, true, t.id);
    assert.ok(res.html.includes(`src="${URL_ART}"`), `${t.id}: art url`);
    const csp = cspOf(res.html);
    assert.equal(csp.length, 1, t.id);
    assert.ok(csp[0].includes('img-src data: https:'), t.id);
    assert.deepEqual(unsafeReasons(res.html.replace(/src="https:\/\/[^"]+"/g, `src="${PNG}"`)), [], t.id);
  }
});

test('AP-042 https appears only inside img src and the CSP meta', () => {
  const res = exportHtml(sampleCharacter(), { art: URL_ART, icon: URL_ICON }, getTemplate('fantasy'), { imageMode: 'link' });
  const stripped = res.html
    .replace(/<meta http-equiv="Content-Security-Policy" content="[^"]*">/g, '')
    .replace(/src="https:\/\/[^"]+"/g, 'src=""');
  for (const bad of ['https:', 'http:', '<script', '<link', '@import', 'url(']) assert.ok(!stripped.toLowerCase().includes(bad), bad);
});

test('AP-042 link mode still rejects unsafe image values', () => {
  for (const art of ['http://example.com/a.png', 'javascript:alert(1)', 'https://user:pw@example.com/a.png', '"><script>alert(1)</script>']) {
    let res;
    assert.doesNotThrow(() => { res = exportHtml(sampleCharacter(), { art, icon: null }, getTemplate('anime'), { imageMode: 'link' }); });
    assert.equal(res.ok, false, art);
  }
});
