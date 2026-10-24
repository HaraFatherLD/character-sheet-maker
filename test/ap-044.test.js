import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCharacter } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';

const norm = (sheetWidths) => normalizeCharacter({ ...sampleCharacter(), sheetWidths }).value.sheetWidths;

test('AP-044 sheet widths keep known templates with in-range rounded numbers', () => {
  assert.deepEqual(norm({ fantasy: 1200, clean: 800.4, tcg: 400, magazine: 2400 }), { fantasy: 1200, clean: 800, tcg: 400, magazine: 2400 });
  assert.deepEqual(norm({ fantasy: 399, scifi: 2401, anime: '1200', pixel: NaN, grimoire: Infinity, nope: 1000, wanted: null }), {});
  assert.deepEqual(norm({ dossier: 399.6 }), { dossier: 400 }, 'rounding happens before the range check');
  for (const bad of ['x', [], 5, null]) assert.deepEqual(norm(bad), {}, String(bad));
});

test('AP-044 sheet widths are prototype-safe and migrate from older data', () => {
  const raw = JSON.parse('{"__proto__":{"fantasy":1200},"constructor":1000,"fantasy":900}');
  assert.deepEqual(norm(raw), { fantasy: 900 });
  assert.equal({}.fantasy, undefined);
  const old = sampleCharacter();
  delete old.sheetWidths;
  assert.deepEqual(normalizeCharacter(old).value.sheetWidths, {});
});
