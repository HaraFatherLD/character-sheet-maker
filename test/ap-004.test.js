import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trpgModifier, formatModifier, statDisplay } from '../src/core/stats.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';

test('AP-004 trpg modifier follows floor((score - 10) / 2)', () => {
  const expected = { 1: -5, 9: -1, 10: 0, 11: 0, 12: 1, 16: 3, 30: 10 };
  for (const [score, mod] of Object.entries(expected)) assert.equal(trpgModifier(Number(score)), mod, score);
});

test('AP-004 modifiers are formatted with an explicit sign', () => {
  assert.equal(formatModifier(3), '+3');
  assert.equal(formatModifier(0), '+0');
  assert.equal(formatModifier(-1), '-1');
});

test('AP-004 statDisplay returns mode-specific value, max and text', () => {
  const stat = { label: '힘', percent: 72, score: 16 };
  assert.deepEqual(statDisplay(stat, 'percent'), { value: 72, max: 100, text: '72' });
  assert.deepEqual(statDisplay(stat, 'trpg'), { value: 16, max: 30, text: '16 (+3)' });
  assert.deepEqual(statDisplay({ label: 'x', percent: 0, score: 8 }, 'trpg'), { value: 8, max: 30, text: '8 (-1)' });
});

test('AP-004 switching stat mode keeps both value sets', () => {
  const sample = sampleCharacter();
  const trpg = normalizeCharacter({ ...sample, statMode: 'trpg' }).value;
  const back = normalizeCharacter({ ...trpg, statMode: 'percent' }).value;
  assert.deepEqual(back.stats, sample.stats);
});
