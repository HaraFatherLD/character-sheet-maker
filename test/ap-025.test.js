import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { escapeHtml } from '../src/core/escape.js';
import { toHtml } from '../src/core/vnode.js';
import { PAYLOADS, hasClass, unsafeReasons } from './helpers.js';

const render = (t, data) => toHtml(t.render(buildViewModel(normalizeCharacter(data).value, { art: null, icon: null })));
const FIELDS = [
  { id: 'c-1', label: '무기', value: '은빛 단검' },
  { id: 'c-2', label: '좌우명', value: '끝까지 비춘다' },
  { id: 'c-3', label: '빈칸항목', value: '' },
];
const countClass = (html, name) => (html.match(new RegExp(`class="(?:[^"]*\\s)?${name}(?:\\s[^"]*)?"`, 'g')) || []).length;

test('AP-025 the first two custom fields appear in every template', () => {
  for (const t of TEMPLATES) {
    const html = render(t, { ...sampleCharacter(), customFields: FIELDS });
    assert.ok(countClass(html, 'cs-f-custom') >= 2, `${t.id}: at least two custom rows`);
    for (const text of ['무기', '은빛 단검', '좌우명', '끝까지 비춘다']) assert.ok(html.includes(text), `${t.id}: ${text}`);
    assert.ok(!html.includes('빈칸항목'), `${t.id}: empty-valued field must not render`);
  }
});

test('AP-025 hiding custom removes every custom row', () => {
  for (const t of TEMPLATES) {
    const html = render(t, { ...sampleCharacter(), customFields: FIELDS, hidden: ['custom'] });
    assert.equal(countClass(html, 'cs-f-custom'), 0, t.id);
    assert.ok(!html.includes('은빛 단검'), t.id);
  }
});

test('AP-025 custom field labels and values are escaped', () => {
  for (const t of TEMPLATES) {
    for (const p of PAYLOADS) {
      const html = render(t, { ...sampleCharacter(), customFields: [{ id: 'c-1', label: p.slice(0, 20), value: p }] });
      assert.deepEqual(unsafeReasons(html), [], `${t.id} / ${p}`);
      assert.ok(html.includes(escapeHtml(p)), `${t.id}: escaped value present`);
      assert.ok(hasClass(html, 'cs-f-custom'), t.id);
    }
  }
});
