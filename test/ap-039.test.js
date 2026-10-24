import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateImageUrl } from '../src/core/image-url.js';

test('AP-039 accepts https URLs and returns the normalised href', () => {
  assert.deepEqual(validateImageUrl('https://example.com/a.png'), { ok: true, value: 'https://example.com/a.png' });
  assert.deepEqual(validateImageUrl('  https://EXAMPLE.com/a b.png?x=1&y=2  '.replace(' b', '%20b')), { ok: true, value: 'https://example.com/a%20b.png?x=1&y=2' });
  assert.equal(validateImageUrl('https://cdn.example.org/img/photo.jpg#frag').ok, true);
});

test('AP-039 rejects every non-https or malformed URL without throwing', () => {
  const bad = ['http://example.com/a.png', 'javascript:alert(1)', 'data:image/png;base64,AAAA', 'blob:https://x/1', 'file:///C:/a.png',
    'ftp://x/a.png', '//example.com/a.png', '/a.png', 'example.com/a.png', 'https://', 'https://user:pw@example.com/a.png',
    'https://exa mple.com/a.png', 'https://example.com/a\n.png', 'https://example.com/\u0000.png', '', '   ',
    `https://example.com/${'a'.repeat(2040)}`, null, undefined, 42, {}, ['https://example.com/a.png']];
  for (const input of bad) {
    let res;
    assert.doesNotThrow(() => { res = validateImageUrl(input); });
    assert.equal(res.ok, false, JSON.stringify(input)?.slice(0, 60));
    assert.equal(typeof res.error, 'string');
  }
});

test('AP-039 the 2048 character limit applies after trimming', () => {
  const base = 'https://example.com/';
  const exact = base + 'a'.repeat(2048 - base.length);
  assert.equal(validateImageUrl(exact).ok, true);
  assert.equal(validateImageUrl(`  ${exact}  `).ok, true);
  assert.equal(validateImageUrl(exact + 'a').ok, false);
});
