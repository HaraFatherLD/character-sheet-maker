import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter, HIDEABLE_KEYS } from '../src/core/schema.js';
import { toHtml } from '../src/core/vnode.js';
import { PNG, hasClass } from './helpers.js';

const withCustom = () => ({ ...sampleCharacter(), customFields: [{ id: 'c-1', label: '무기', value: '은빛 단검' }] });
const render = (t, data) => toHtml(t.render(buildViewModel(normalizeCharacter(data).value, { art: PNG, icon: PNG })));
const ALWAYS = ['title', 'race', 'role', 'quote', 'summary', 'stats'];

test('AP-024 hiding a key removes its marker in every template', () => {
  for (const t of TEMPLATES) {
    for (const key of HIDEABLE_KEYS) {
      const html = render(t, { ...withCustom(), hidden: [key] });
      assert.ok(!hasClass(html, `cs-f-${key}`), `${t.id}: hidden ${key} still rendered`);
      assert.ok(hasClass(html, 'cs-f-name') && hasClass(html, 'cs-f-art'), `${t.id}: name/art must stay (${key})`);
      for (const other of ALWAYS.filter((k) => k !== key)) assert.ok(hasClass(html, `cs-f-${other}`), `${t.id}: ${other} lost when hiding ${key}`);
    }
  }
});

test('AP-024 name and art cannot be hidden', () => {
  for (const t of TEMPLATES) {
    const html = render(t, { ...withCustom(), hidden: ['name', 'art'] });
    assert.ok(hasClass(html, 'cs-f-name') && hasClass(html, 'cs-f-art'), t.id);
  }
});

test('AP-024 hiding everything hideable still leaves a valid sheet', () => {
  for (const t of TEMPLATES) {
    const html = render(t, { ...withCustom(), hidden: [...HIDEABLE_KEYS] });
    for (const key of HIDEABLE_KEYS) assert.ok(!hasClass(html, `cs-f-${key}`), `${t.id}: ${key}`);
    assert.match(html, /^<div class="[^"]*cs-sheet/, t.id);
  }
});
