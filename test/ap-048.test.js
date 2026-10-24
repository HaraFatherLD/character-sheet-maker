import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presetWidth, WIDTH_PRESETS } from '../src/core/size.js';

test('AP-048 width presets are rounded and clamped', () => {
  assert.deepEqual(WIDTH_PRESETS, ['base', '75', '125', '150', 'custom']);
  assert.equal(presetWidth(1000, 'base'), 1000);
  assert.equal(presetWidth(1000, '75'), 750);
  assert.equal(presetWidth(1000, '125'), 1250);
  assert.equal(presetWidth(1414, '150'), 2121);
  assert.equal(presetWidth(1600, '150'), 2400, 'clamped to the maximum');
  assert.equal(presetWidth(750, '75'), 563);
  assert.equal(presetWidth(500, '75'), 400, 'clamped to the minimum');
  assert.equal(presetWidth(1000, 'custom'), null);
  assert.equal(presetWidth(1000, 'weird'), 1000);
});
