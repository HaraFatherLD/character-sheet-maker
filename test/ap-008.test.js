import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { statDisplay } from '../src/core/stats.js';
import { escapeHtml } from '../src/core/escape.js';
import { toHtml } from '../src/core/vnode.js';
import { PNG, PAYLOADS, TEXT_FIELD_KEYS, unsafeReasons } from './helpers.js';

const render = (t, data, images = { art: null, icon: null }) => toHtml(t.render(buildViewModel(normalizeCharacter(data).value, images)));

const setters = [
  ...TEXT_FIELD_KEYS.map((key) => [key, (d, p) => { d[key] = p; }]),
  ['tags[0]', (d, p) => { d.tags[0] = p; }],
  ['stats[0].label', (d, p) => { d.stats[0].label = p; }],
  ['skills[0].name', (d, p) => { d.skills[0].name = p; }],
  ['skills[0].desc', (d, p) => { d.skills[0].desc = p; }],
];

test('AP-008 every template escapes every field for every payload', () => {
  for (const t of TEMPLATES) {
    for (const [label, set] of setters) {
      for (const p of PAYLOADS) {
        const data = sampleCharacter();
        set(data, p);
        for (const images of [{ art: null, icon: null }, { art: PNG, icon: PNG }]) {
          const reasons = unsafeReasons(render(t, data, images));
          assert.deepEqual(reasons, [], `${t.id} / ${label} / ${p}`);
        }
      }
    }
  }
});

test('AP-008 required fields are shown by every template in both stat modes', () => {
  for (const mode of ['percent', 'trpg']) {
    const data = { ...sampleCharacter(), statMode: mode };
    const norm = normalizeCharacter(data).value;
    for (const t of TEMPLATES) {
      const html = render(t, data, { art: PNG, icon: null });
      for (const key of ['name', 'title', 'race', 'role', 'quote', 'summary']) {
        assert.ok(html.includes(escapeHtml(norm[key])), `${t.id} ${mode}: missing ${key}`);
        assert.ok(html.includes(`cs-f-${key}`), `${t.id}: missing cs-f-${key} marker`);
      }
      for (const key of ['stats', 'art']) assert.ok(html.includes(`cs-f-${key}`), `${t.id}: missing cs-f-${key} marker`);
      for (const stat of norm.stats) {
        assert.ok(html.includes(`>${escapeHtml(stat.label)}<`), `${t.id}: stat label ${stat.label} as its own text node`);
        const text = escapeHtml(statDisplay(stat, mode).text);
        assert.ok(html.includes(`>${text}<`), `${t.id} ${mode}: stat text "${text}" as its own text node`);
      }
      assert.ok(html.includes(PNG), `${t.id}: art image`);
    }
  }
});

test('AP-008 empty optional fields leave no row behind, filled ones get a marked row', () => {
  const optional = ['age', 'gender', 'affiliation', 'height', 'birthday', 'likes', 'dislikes', 'backstory'];
  for (const t of TEMPLATES) {
    const empty = sampleCharacter();
    for (const key of optional) empty[key] = '';
    empty.tags = [];
    empty.skills = [];
    const emptyHtml = render(t, empty);
    for (const key of [...optional, 'tags', 'skills']) assert.ok(!emptyHtml.includes(`cs-f-${key}`), `${t.id}: empty ${key} still rendered`);
    const filled = sampleCharacter();
    for (const key of optional) filled[key] = `값-${key}`;
    const filledHtml = render(t, filled);
    const shown = optional.filter((key) => filledHtml.includes(`cs-f-${key}`));
    for (const key of shown) assert.ok(filledHtml.includes(`값-${key}`), `${t.id}: ${key} marker without value`);
  }
});

test('AP-008 without an uploaded image the art slot shows the built-in illustration', () => {
  for (const t of TEMPLATES) {
    const html = render(t, sampleCharacter());
    assert.ok(html.includes('cs-f-art'), `${t.id}: art slot marker`);
    assert.ok(html.includes('<svg'), `${t.id}: built-in svg illustration`);
  }
});
