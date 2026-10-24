import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scaleWrap } from '../src/core/scale-wrap.js';
import { effectiveSize } from '../src/core/size.js';
import { exportHtml } from '../src/core/export-html.js';
import { getTemplate } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';
import { h, toHtml } from '../src/core/vnode.js';
import { unsafeReasons } from './helpers.js';

const NO_IMAGES = { art: null, icon: null };

test('AP-046 scaleWrap wraps only when the scale is not 1', () => {
  const sheet = h('div', { class: 'cs-sheet' }, 'x');
  const fantasy = getTemplate('fantasy');
  assert.equal(toHtml(scaleWrap(sheet, effectiveSize(fantasy, {}))), '<div class="cs-sheet">x</div>');
  assert.equal(toHtml(scaleWrap(sheet, effectiveSize(fantasy, { fantasy: 1200 }))),
    '<div class="cs-scale-frame" style="width:1200px;height:1697px;overflow:hidden">'
    + '<div class="cs-scale-inner" style="width:1000px;height:1414px;transform:scale(1.2);transform-origin:0 0">'
    + '<div class="cs-sheet">x</div></div></div>');
  const tcg = toHtml(scaleWrap(sheet, effectiveSize(getTemplate('tcg'), { tcg: 400 })));
  assert.ok(tcg.includes('transform:scale(0.5333)'), tcg);
  assert.equal(toHtml(scaleWrap(sheet, effectiveSize(getTemplate('clean'), { clean: 800 }))), '<div class="cs-sheet">x</div>', 'reflow never wraps');
});

test('AP-046 exported fixed-layout sheets carry the wrapper and page size', () => {
  const data = { ...sampleCharacter(), sheetWidths: { fantasy: 1200 } };
  const res = exportHtml(data, NO_IMAGES, getTemplate('fantasy'));
  assert.equal(res.ok, true);
  assert.ok(res.html.includes('class="cs-scale-frame" style="width:1200px;height:1697px;overflow:hidden"'));
  assert.ok(res.html.includes('@page{size:1200px 1697px'), 'print page uses the effective size');
  assert.deepEqual(unsafeReasons(res.html), []);
  const plain = exportHtml(sampleCharacter(), NO_IMAGES, getTemplate('fantasy'));
  assert.ok(!plain.html.includes('cs-scale-frame'));
});

test('AP-046 block layouts render at the chosen width without a wrapper', () => {
  const data = normalizeCharacter({ ...sampleCharacter(), sheetWidths: { clean: 800 } }).value;
  const html = toHtml(getTemplate('clean').render(buildViewModel(data, NO_IMAGES)));
  assert.match(html, /^<div class="[^"]*cs-clean[^"]*" style="width:800px;min-height:1000px;/);
  const res = exportHtml(data, NO_IMAGES, getTemplate('clean'));
  assert.ok(!res.html.includes('cs-scale-frame'));
  assert.ok(res.html.includes('@page{size:800px 1000px'));
});
