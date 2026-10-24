import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeOutputSize, PRESETS } from '../src/core/size.js';

const A4 = { w: 1000, h: 1414 };
const WIDE = { w: 1600, h: 900 };
const CARD = { w: 750, h: 1050 };
const wh = (r) => [r.width, r.height];

test('AP-005 presets', () => {
  assert.deepEqual(PRESETS, ['1x', '2x', '3x', 'custom']);
  assert.deepEqual(wh(computeOutputSize(A4, '1x')), [1000, 1414]);
  assert.deepEqual(wh(computeOutputSize(A4, '2x')), [2000, 2828]);
  assert.deepEqual(wh(computeOutputSize(A4, '3x')), [3000, 4242]);
  assert.deepEqual(wh(computeOutputSize(WIDE, '3x')), [4800, 2700]);
  assert.deepEqual(wh(computeOutputSize(CARD, '2x')), [1500, 2100]);
});

test('AP-005 custom width keeps ratio and clamps the long side to 6000', () => {
  assert.deepEqual(wh(computeOutputSize(A4, 'custom', 1500)), [1500, 2121]);
  assert.deepEqual(wh(computeOutputSize(A4, 'custom', 9999)), [4243, 6000]);
  assert.deepEqual(wh(computeOutputSize(WIDE, 'custom', 9999)), [6000, 3375]);
  assert.deepEqual(wh(computeOutputSize(A4, 'custom', 100)), [300, 424]);
  assert.deepEqual(wh(computeOutputSize(A4, 'custom', ' 1200.4 ')), [1200, 1697]);
});

test('AP-005 unusable custom input falls back to 1x', () => {
  for (const v of ['', null, undefined, 'abc', Infinity, NaN, '  ']) {
    assert.deepEqual(wh(computeOutputSize(A4, 'custom', v)), [1000, 1414], String(v));
  }
});

test('AP-005 scale and unknown preset', () => {
  assert.equal(computeOutputSize(A4, '2x').scale, 2);
  assert.equal(computeOutputSize(WIDE, 'custom', 800).scale, 0.5);
  assert.deepEqual(wh(computeOutputSize(A4, 'huge')), [1000, 1414]);
});

test('AP-005 presets also cap the long side at 6000 (auto-height sheets can be tall)', async () => {
  const TALL = { w: 720, h: 2600 };
  assert.deepEqual(wh(computeOutputSize(TALL, '2x')), [1440, 5200]);
  assert.deepEqual(wh(computeOutputSize(TALL, '3x')), [1661, 5998]);
  assert.deepEqual(wh(computeOutputSize(A4, '3x')), [3000, 4242]);
});

test('AP-005 resolveBaseSize uses the measured height for auto-height templates', async () => {
  const { resolveBaseSize } = await import('../src/core/size.js');
  assert.deepEqual(resolveBaseSize({ w: 1000, h: 1414 }, 9999), { w: 1000, h: 1414 });
  assert.deepEqual(resolveBaseSize({ w: 720, h: null, minH: 1280 }, 1850.2), { w: 720, h: 1851 });
  assert.deepEqual(resolveBaseSize({ w: 720, h: null, minH: 1280 }, 900), { w: 720, h: 1280 });
  for (const bad of [0, -5, NaN, undefined, null, Infinity]) {
    assert.deepEqual(resolveBaseSize({ w: 1000, h: null, minH: 1000 }, bad), { w: 1000, h: 1000 }, String(bad));
  }
});

test('AP-005 the 6000 cap wins over the 300 minimum width for extremely tall sheets (rev.4)', () => {
  const HUGE = { w: 720, h: 20000 };
  assert.deepEqual(wh(computeOutputSize(HUGE, 'custom', 100)), [216, 6000]);
  assert.deepEqual(wh(computeOutputSize(HUGE, 'custom', 5000)), [216, 6000]);
  assert.deepEqual(wh(computeOutputSize(HUGE, '2x')), [216, 6000]);
});
