import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCharacter } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';

test('AP-040 artUrl and iconUrl keep only valid https URLs', () => {
  const v = normalizeCharacter({ ...sampleCharacter(), artUrl: ' https://example.com/art.png ', iconUrl: 'https://cdn.example.org/i.webp' }).value;
  assert.equal(v.artUrl, 'https://example.com/art.png');
  assert.equal(v.iconUrl, 'https://cdn.example.org/i.webp');
  for (const bad of ['http://example.com/a.png', 'javascript:alert(1)', 'data:image/png;base64,AAAA', 7, null, {}]) {
    const r = normalizeCharacter({ ...sampleCharacter(), artUrl: bad, iconUrl: bad });
    assert.equal(r.ok, true, String(bad));
    assert.equal(r.value.artUrl, '');
    assert.equal(r.value.iconUrl, '');
  }
});

test('AP-040 older saved data migrates to empty URLs', () => {
  const old = sampleCharacter();
  delete old.artUrl;
  delete old.iconUrl;
  const v = normalizeCharacter(old).value;
  assert.equal(v.artUrl, '');
  assert.equal(v.iconUrl, '');
});
