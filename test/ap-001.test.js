import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter } from '../src/core/schema.js';

test('AP-001 sample character is already normalised and rich', () => {
  const sample = sampleCharacter();
  const res = normalizeCharacter(sample);
  assert.equal(res.ok, true);
  assert.deepEqual(res.value, sample);
  for (const key of ['name', 'title', 'race', 'role', 'quote', 'summary', 'backstory']) {
    assert.ok(sample[key].length > 0, `sample ${key} must not be empty`);
  }
  assert.ok(sample.tags.length >= 3);
  assert.ok(sample.skills.length >= 2);
  assert.equal(sample.stats.length, 6);
});

test('AP-001 sampleCharacter returns a fresh object on every call', () => {
  const first = sampleCharacter();
  first.name = 'changed';
  first.tags.push('x');
  first.stats[0].percent = 0;
  const second = sampleCharacter();
  assert.notEqual(second.name, 'changed');
  assert.ok(!second.tags.includes('x'));
  assert.notEqual(second.stats[0], first.stats[0], 'stats must be fresh objects');
  assert.deepEqual(second.stats[0], sampleCharacter().stats[0]);
});
