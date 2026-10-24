import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertRasterImages } from '../src/core/raster-guard.js';
import { PNG } from './helpers.js';

test('AP-043 raster only accepts embedded images', () => {
  assert.equal(assertRasterImages({ art: PNG, icon: null }).ok, true);
  assert.equal(assertRasterImages({ art: null, icon: null }).ok, true);
  for (const images of [{ art: 'https://example.com/a.png', icon: null }, { art: PNG, icon: 'https://example.com/i.png' }, { art: 'javascript:1', icon: null }, null, undefined]) {
    const res = assertRasterImages(images);
    assert.equal(res.ok, false, JSON.stringify(images));
    assert.equal(typeof res.error, 'string');
  }
});
