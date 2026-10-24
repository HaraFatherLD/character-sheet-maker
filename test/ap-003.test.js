import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageFile } from '../src/core/schema.js';

const TWENTY_MIB = 20 * 1024 * 1024;

test('AP-003 accepts jpeg, png and webp', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.equal(validateImageFile({ type, size: 5000 }).ok, true, type);
});

test('AP-003 rejects other or missing types', () => {
  for (const file of [{ type: 'image/gif', size: 10 }, { type: 'image/svg+xml', size: 10 }, { type: '', size: 10 }, { size: 10 }, null, undefined]) {
    const res = validateImageFile(file);
    assert.equal(res.ok, false, JSON.stringify(file));
    assert.equal(typeof res.error, 'string');
  }
});

test('AP-003 size boundary is 1 byte to 20 MiB inclusive', () => {
  assert.equal(validateImageFile({ type: 'image/png', size: TWENTY_MIB }).ok, true);
  assert.equal(validateImageFile({ type: 'image/png', size: TWENTY_MIB + 1 }).ok, false);
  assert.equal(validateImageFile({ type: 'image/png', size: 0 }).ok, false);
});
