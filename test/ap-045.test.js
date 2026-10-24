import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectiveSize, resolveBaseSize, SHEET_WIDTH_MIN, SHEET_WIDTH_MAX } from '../src/core/size.js';
import { getTemplate } from '../src/templates/index.js';

const eff = (id, widths = {}) => effectiveSize(getTemplate(id), widths);

test('AP-045 limits', () => {
  assert.equal(SHEET_WIDTH_MIN, 400);
  assert.equal(SHEET_WIDTH_MAX, 2400);
});

test('AP-045 fixed layouts scale uniformly', () => {
  assert.deepEqual(eff('fantasy', { fantasy: 1200 }), { mode: 'scale', w: 1200, h: 1697, scale: 1.2, baseW: 1000, baseH: 1414 });
  const tcg = eff('tcg', { tcg: 400 });
  assert.deepEqual([tcg.mode, tcg.w, tcg.h, tcg.baseW, tcg.baseH], ['scale', 400, 560, 750, 1050]);
  assert.ok(Math.abs(tcg.scale - 400 / 750) < 1e-9);
  assert.deepEqual(eff('magazine', { magazine: 2400 }), { mode: 'scale', w: 2400, h: 1500, scale: 1.5, baseW: 1600, baseH: 1000 });
  assert.deepEqual(eff('fantasy'), { mode: 'scale', w: 1000, h: 1414, scale: 1, baseW: 1000, baseH: 1414 });
  assert.deepEqual(eff('fantasy', { scifi: 1200 }), eff('fantasy'), 'other templates do not leak');
});

test('AP-045 block layouts reflow at the chosen width', () => {
  assert.deepEqual(eff('clean', { clean: 800 }), { mode: 'reflow', w: 800, h: null, minH: 1000, scale: 1, baseW: 800, baseH: null });
  assert.deepEqual(eff('vertical'), { mode: 'reflow', w: 720, h: null, minH: 1280, scale: 1, baseW: 720, baseH: null });
});

test('AP-045 resolveBaseSize accepts the effective size', () => {
  assert.deepEqual(resolveBaseSize(eff('fantasy', { fantasy: 1200 }), 99999), { w: 1200, h: 1697 });
  assert.deepEqual(resolveBaseSize(eff('clean', { clean: 800 }), 1900.2), { w: 800, h: 1901 });
  assert.deepEqual(resolveBaseSize(eff('clean', { clean: 800 }), 500), { w: 800, h: 1000 });
});
