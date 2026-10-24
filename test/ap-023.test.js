import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { escapeHtml } from '../src/core/escape.js';
import { toHtml } from '../src/core/vnode.js';
import { PAYLOADS, hasClass, classIndex, unsafeReasons } from './helpers.js';

const render = (t, data) => toHtml(t.render(buildViewModel(normalizeCharacter(data).value, { art: null, icon: null })));
// Keys whose rows or sections always carry a visible label when they are shown.
const LABELED = ['age', 'gender', 'affiliation', 'height', 'birthday', 'likes', 'dislikes', 'backstory', 'skills', 'stats'];

test('AP-023 every shown labelled item uses the edited label in all templates', () => {
  const labels = Object.fromEntries(LABELED.map((k) => [k, `라벨${k.toUpperCase()}`]));
  for (const t of TEMPLATES) {
    const html = render(t, { ...sampleCharacter(), labels });
    assert.ok(hasClass(html, 'cs-f-stats'), `${t.id}: stats shown`);
    for (const key of LABELED) {
      const at = classIndex(html, `cs-f-${key}`);
      if (at < 0) continue;
      // The label must sit inside the marked element, i.e. shortly after its opening tag.
      assert.ok(html.slice(at, at + 1500).includes(`>${labels[key]}<`), `${t.id}: ${key} label not inside its marker`);
    }
  }
});

test('AP-023 the default label disappears once it is edited', () => {
  for (const t of TEMPLATES) {
    const html = render(t, { ...sampleCharacter(), labels: { stats: '스테이터스X' } });
    assert.ok(html.includes('스테이터스X'), t.id);
    assert.ok(!html.includes('>능력치<'), `${t.id}: default stats label still rendered as text`);
  }
});

test('AP-023 edited labels are escaped', () => {
  for (const t of TEMPLATES) {
    for (const p of PAYLOADS) {
      const html = render(t, { ...sampleCharacter(), labels: { stats: p, age: p, skills: p } });
      assert.deepEqual(unsafeReasons(html), [], `${t.id} / ${p}`);
      assert.ok(html.includes(escapeHtml(p.slice(0, 20).trim())), `${t.id}: escaped label present`);
    }
  }
});
