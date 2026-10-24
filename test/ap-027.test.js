import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accentInk } from '../src/core/color.js';
import { TEMPLATES } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { toHtml } from '../src/core/vnode.js';

test('AP-027 accentInk picks the higher-contrast text colour', () => {
  assert.equal(accentInk('#ffffff'), '#111111');
  assert.equal(accentInk('#000000'), '#ffffff');
  assert.equal(accentInk('#ffff00'), '#111111');
  assert.equal(accentInk('#1a237e'), '#ffffff');
  assert.equal(accentInk('#8b2f2f'), '#ffffff');
});

test('AP-027 every template exposes --accent-ink, also for white and black accents', () => {
  for (const accent of ['', '#ffffff', '#000000']) {
    for (const t of TEMPLATES) {
      const vm = buildViewModel(normalizeCharacter({ ...sampleCharacter(), accentColor: accent }).value, { art: null, icon: null });
      const style = toHtml(t.render(vm)).match(/^<div class="[^"]*" style="([^"]*)"/)[1];
      assert.match(style, /--accent-ink:#(111111|ffffff)/, `${t.id} ${accent}`);
      if (accent === '#ffffff') assert.ok(style.includes('--accent-ink:#111111'), t.id);
    }
  }
});

test('AP-027 new templates derive the ink from the palette accent first', () => {
  for (const id of ['clean', 'vertical']) {
    const t = TEMPLATES.find((x) => x.id === id);
    const vm = buildViewModel(normalizeCharacter({ ...sampleCharacter(), accentColor: '#000000', palettes: { [id]: { accent: '#ffffff' } } }).value, { art: null, icon: null });
    const style = toHtml(t.render(vm)).match(/^<div class="[^"]*" style="([^"]*)"/)[1];
    assert.ok(style.includes('--accent-ink:#111111'), id);
    assert.ok(style.includes('--c-accent:#ffffff'), id);
  }
});

test('AP-027 without a palette accent the user accent colour drives --c-accent and the ink', () => {
  for (const id of ['clean', 'vertical']) {
    const t = TEMPLATES.find((x) => x.id === id);
    const vm = buildViewModel(normalizeCharacter({ ...sampleCharacter(), accentColor: '#ffffff' }).value, { art: null, icon: null });
    const style = toHtml(t.render(vm)).match(/^<div class="[^"]*" style="([^"]*)"/)[1];
    assert.ok(style.includes('--c-accent:#ffffff'), id);
    assert.ok(style.includes('--accent-ink:#111111'), id);
  }
});

test('AP-027 new templates keep --accent equal to --c-accent', () => {
  for (const id of ['clean', 'vertical']) {
    const t = TEMPLATES.find((x) => x.id === id);
    const vm = buildViewModel(normalizeCharacter({ ...sampleCharacter(), palettes: { [id]: { accent: '#3355aa' } } }).value, { art: null, icon: null });
    const style = toHtml(t.render(vm)).match(/^<div class="[^"]*" style="([^"]*)"/)[1];
    assert.ok(style.includes('--c-accent:#3355aa') && /(^|;)--accent:#3355aa/.test(style), id);
  }
});
