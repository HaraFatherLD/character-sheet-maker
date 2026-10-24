import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, toHtml, toXhtml } from '../src/core/vnode.js';
import { PNG } from './helpers.js';

test('AP-041 img src accepts validated https URLs, escaped in the output', () => {
  assert.equal(toHtml(h('img', { src: 'https://example.com/a.png?x=1&y=2', alt: 'a' })), '<img src="https://example.com/a.png?x=1&amp;y=2" alt="a">');
  assert.equal(toXhtml(h('img', { src: 'https://example.com/a.png' })), '<img xmlns="http://www.w3.org/1999/xhtml" src="https://example.com/a.png"/>');
  assert.doesNotThrow(() => toHtml(h('img', { src: PNG })));
});

test('AP-041 img src still rejects every other scheme or unnormalised URL', () => {
  const bad = ['http://example.com/a.png', 'javascript:alert(1)', 'https://user:pw@example.com/a.png', 'https://EXAMPLE.com/a.png',
    ' https://example.com/a.png', 'https://example.com/a b.png', 'data:image/svg+xml;base64,AAAA', '//example.com/a.png'];
  for (const src of bad) assert.throws(() => toHtml(h('img', { src })), Error, src);
});
