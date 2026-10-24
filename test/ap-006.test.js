import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, toHtml, toXhtml, validateStyle } from '../src/core/vnode.js';
import { PNG } from './helpers.js';

test('AP-006 text and attribute values are escaped', () => {
  const html = toHtml(h('div', { class: 'a"b' }, '<script>alert(1)</script> & \'q\''));
  assert.equal(html, '<div class="a&quot;b">&lt;script&gt;alert(1)&lt;/script&gt; &amp; &#39;q&#39;</div>');
});

test('AP-006 nested children, arrays and empty values serialise predictably', () => {
  const html = toHtml(h('ul', null, [h('li', null, 'a'), null, false, h('li', null, 'b')], ''));
  assert.equal(html, '<ul><li>a</li><li>b</li></ul>');
  assert.equal(toHtml(h('p', null, 0)), '<p>0</p>');
});

test('AP-006 forbidden tags throw', () => {
  for (const tag of ['script', 'iframe', 'a', 'style', 'foreignObject', 'object', 'use']) {
    assert.throws(() => toHtml(h(tag, null, 'x')), Error, tag);
  }
});

test('AP-006 forbidden attributes throw', () => {
  for (const attr of ['onclick', 'onload', 'href', 'xlink:href', 'srcdoc', 'formaction']) {
    assert.throws(() => toHtml(h('div', { [attr]: 'x' })), Error, attr);
  }
});

test('AP-006 src accepts only base64 png/jpeg/webp data URLs', () => {
  assert.match(toHtml(h('img', { src: PNG, alt: 'a' })), /^<img src="data:image\/png;base64,[^"]+" alt="a">$/);
  for (const src of ['https://x/y.png', 'javascript:alert(1)', 'data:image/svg+xml;base64,AAAA', 'data:text/html;base64,AAAA', `${PNG}\n`, '']) {
    assert.throws(() => toHtml(h('img', { src })), Error, src);
  }
});

test('AP-006 style objects reject dangerous values', () => {
  assert.equal(toHtml(h('div', { style: { color: '#ff0000', 'object-position': '20% 80%' } })), '<div style="color:#ff0000;object-position:20% 80%"></div>');
  for (const value of ['url(x)', 'URL(x)', 'image-set(a 1x)', 'red;background:blue', 'a"b', "a'b", 'expression(alert(1))', 'a\\b', '<x>', 'a/*c*/', '@x', 'a{b}']) {
    assert.throws(() => toHtml(h('div', { style: { color: value } })), Error, value);
  }
});

test('AP-029 plain string attributes reject style-dangerous patterns too', () => {
  assert.throws(() => toHtml(h('rect', { fill: 'url(#x)' })), Error);
  assert.throws(() => toHtml(h('g', { transform: 'expression(1)' })), Error);
  assert.doesNotThrow(() => toHtml(h('rect', { fill: '#ff0000', transform: 'rotate(5)' })));
});

test('AP-006 style keys must be lower-case CSS properties or custom properties', () => {
  assert.equal(toHtml(h('div', { style: { '--accent': '#112233', width: 10 } })), '<div style="--accent:#112233;width:10"></div>');
  for (const key of ['Color', 'b@d', 'a;b', 'background:red', '--', '1abc', '']) {
    assert.throws(() => validateStyle({ [key]: 'red' }), Error, key);
  }
  assert.doesNotThrow(() => validateStyle({ 'object-fit': 'cover', '--accent': '#000000' }));
});

test('AP-006 toXhtml emits well-formed XML with namespaces and self-closing void tags', () => {
  const tree = h('div', { class: 'r' }, h('img', { src: PNG, alt: '<a>' }), h('br'), h('svg', { viewBox: '0 0 1 1' }, h('rect', { x: 0, y: 0, width: 1, height: 1 })));
  assert.equal(toXhtml(tree),
    `<div xmlns="http://www.w3.org/1999/xhtml" class="r"><img src="${PNG}" alt="&lt;a&gt;"/><br/><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect x="0" y="0" width="1" height="1"/></svg></div>`);
  assert.equal(toXhtml(h('p', null, 'a\u0001b\u001fc\td')), '<p xmlns="http://www.w3.org/1999/xhtml">abc\td</p>');
  assert.equal(toXhtml(h('div', null)), '<div xmlns="http://www.w3.org/1999/xhtml"/>');
  assert.throws(() => toXhtml(h('script', null, 'x')), Error);
  assert.throws(() => toXhtml(h('div', { onclick: 'x' })), Error);
  assert.throws(() => toXhtml(h('div', { style: { color: 'url(x)' } })), Error);
});

test('AP-006 svg children and void tags serialise correctly', () => {
  const svg = h('svg', { viewBox: '0 0 10 10', width: 10, height: 10 }, h('circle', { cx: 5, cy: 5, r: 4, fill: '#000' }), h('text', { x: 1, y: 9 }, '<b>'));
  assert.equal(toHtml(svg), '<svg viewBox="0 0 10 10" width="10" height="10"><circle cx="5" cy="5" r="4" fill="#000"></circle><text x="1" y="9">&lt;b&gt;</text></svg>');
  assert.equal(toHtml(h('p', null, 'a', h('br'), 'b', h('hr'))), '<p>a<br>b<hr></p>');
});
