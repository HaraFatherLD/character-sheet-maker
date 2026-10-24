import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHEET_WIDTH_MIN, effectiveSize, toSheetWidth } from '../src/core/size.js';
import { buildRasterSvg } from '../src/app/raster.js';
import { exportHtml } from '../src/core/export-html.js';
import { buildViewModel } from '../src/core/view-model.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';
import { TEMPLATES, getTemplate } from '../src/templates/index.js';
import { toHtml } from '../src/core/vnode.js';
import { unsafeReasons } from './helpers.js';

const NO_IMAGES = { art: null, icon: null };
const dataFor = (id, width) => ({ ...sampleCharacter(), template: id, sheetWidths: { [id]: width } });
const vmFor = (id, width) => buildViewModel(normalizeCharacter(dataFor(id, width)).value, NO_IMAGES);

test('AP-049 toSheetWidth rounds first and refuses (never clamps) out-of-range or non-number widths', () => {
  assert.equal(toSheetWidth(SHEET_WIDTH_MIN), 400);
  assert.equal(toSheetWidth(399.6), 400);
  assert.equal(toSheetWidth(2400.4), 2400);
  for (const bad of [399, 2401, 2400.5, '1200', null, undefined, Number.NaN, Infinity, {}]) assert.equal(toSheetWidth(bad), null, String(bad));
});

test('AP-049 only block designs reflow their root width; fixed designs keep their layout size', () => {
  for (const template of TEMPLATES) {
    const { w, h, minH } = template.size;
    const root = toHtml(template.render(vmFor(template.id, 1200)));
    const expected = h === null ? `width:1200px;min-height:${minH}px;` : `width:${w}px;height:${h}px;`;
    assert.ok(root.startsWith('<div class="cs-sheet cs-') && root.includes(` style="${expected}`), template.id);
  }
});

test('AP-049 every design exports at its chosen width: wrapper only for scaled fixed layouts, page size follows', () => {
  for (const template of TEMPLATES) {
    const res = exportHtml(dataFor(template.id, 1200), NO_IMAGES, template);
    assert.equal(res.ok, true, template.id);
    const eff = effectiveSize(template, { [template.id]: 1200 });
    assert.equal(res.html.includes('class="cs-scale-frame"'), eff.mode === 'scale', template.id);
    assert.equal(res.html.includes('.cs-scale-frame{flex:none}'), eff.mode === 'scale', `${template.id} frame css`);
    assert.ok(res.html.includes(`@page{size:${eff.w}px ${eff.h ?? eff.minH}px;`), template.id);
    assert.deepEqual(unsafeReasons(res.html), [], template.id);
  }
  const narrow = exportHtml(dataFor('magazine', 2400), NO_IMAGES, getTemplate('magazine')).html;
  assert.ok(narrow.includes('@media (max-width:239px){.cs-stage{zoom:0.05}}'), 'a 2400px sheet can still shrink to a phone');
});

test('AP-049 the raster svg draws the wrapped sheet and its viewBox is the sheet size, not the output size', () => {
  const fantasy = getTemplate('fantasy');
  const svg = buildRasterSvg(fantasy, vmFor('fantasy', 1200), { width: 2400, height: 3394 }, { w: 1200, h: 1697 });
  assert.ok(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="3394" viewBox="0 0 1200 1697">'));
  assert.ok(svg.includes('<foreignObject x="0" y="0" width="1200" height="1697">'));
  assert.ok(svg.includes('class="cs-scale-frame" style="width:1200px;height:1697px;overflow:hidden"'));
  assert.ok(svg.includes('transform:scale(1.2);transform-origin:0 0'));
  assert.ok(buildRasterSvg(fantasy, vmFor('fantasy', 1200), { width: 1200, height: 1697 }).includes('viewBox="0 0 1200 1697"'), 'default base');
  const plain = buildRasterSvg(fantasy, vmFor('fantasy', 1000), { width: 1000, height: 1414 });
  assert.ok(plain.includes('viewBox="0 0 1000 1414"') && !plain.includes('cs-scale-frame'));
});

test('AP-049 block designs are rasterised at the chosen width with the measured height', () => {
  const clean = getTemplate('clean');
  const svg = buildRasterSvg(clean, vmFor('clean', 800), { width: 1600, height: 3000 }, { w: 800, h: 1500 });
  assert.ok(svg.includes('viewBox="0 0 800 1500"') && svg.includes('<foreignObject x="0" y="0" width="800" height="1500">'));
  assert.ok(svg.includes('width:800px;min-height:1000px;') && !svg.includes('cs-scale-frame'));
  assert.ok(buildRasterSvg(clean, vmFor('clean', 800), { width: 800, height: 1000 }).includes('viewBox="0 0 800 1000"'), 'minimum height');
});
