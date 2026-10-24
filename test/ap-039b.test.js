import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageUrl, MAX_URL_LENGTH } from '../src/core/image-url.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';
import { h, toHtml } from '../src/core/vnode.js';

// Each Hangul syllable becomes %XX%XX%XX (9 characters) in a normalised URL, so a short typed address can grow a lot.
const BASE = 'https://example.com/';

test('AP-039 an address within 2048 characters as typed but longer once normalised is rejected', () => {
  const typed = BASE + '가'.repeat(300);
  assert.ok(typed.length <= MAX_URL_LENGTH, 'typed length');
  assert.ok(new URL(typed).href.length > MAX_URL_LENGTH, 'normalised length');
  const res = validateImageUrl(typed);
  assert.equal(res.ok, false);
  assert.equal(typeof res.error, 'string');
});

test('AP-039 the limit on the normalised form is exact', () => {
  const edge = BASE + '가'.repeat(225); // 2045 characters once normalised
  assert.equal(new URL(edge).href.length, 2045);
  assert.equal(validateImageUrl(`${edge}aaa`).ok, true, 'exactly 2048');
  assert.equal(validateImageUrl(`${edge}aaaa`).ok, false, '2049');
});

test('AP-039 every accepted value validates to itself, so a stored address survives a reload', () => {
  for (const input of [`${BASE}a.png`, '  https://EXAMPLE.com/한글.png?q=값#조각 ', `${BASE}${'가'.repeat(225)}`]) {
    const first = validateImageUrl(input);
    assert.equal(first.ok, true, input);
    assert.deepEqual(validateImageUrl(first.value), first, input);
  }
});

test('AP-039 an over-long normalised address is dropped by the schema and refused by vnode', () => {
  const long = BASE + '가'.repeat(300);
  const v = normalizeCharacter({ ...sampleCharacter(), artUrl: long, iconUrl: long }).value;
  assert.equal(v.artUrl, '');
  assert.equal(v.iconUrl, '');
  assert.throws(() => toHtml(h('img', { src: new URL(long).href })), Error);
});
