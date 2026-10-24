import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, getTemplate } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { toHtml } from '../src/core/vnode.js';
import { TEMPLATE_IDS } from './helpers.js';

const SIZES = {
  fantasy: [1000, 1414], scifi: [1000, 1414], anime: [1000, 1414], pixel: [1000, 1414], cyberpunk: [1000, 1414],
  grimoire: [1414, 1000], tcg: [750, 1050], wanted: [1000, 1414], dossier: [1000, 1414], magazine: [1600, 1000],
  storybook: [1000, 1414], streamer: [1600, 900], clean: [1000, null], vertical: [720, null],
};
const AUTO_HEIGHT = new Set(['clean', 'vertical']);

test('AP-007 registry lists exactly the fourteen templates in order', () => {
  assert.deepEqual(TEMPLATES.map((t) => t.id), TEMPLATE_IDS);
  const labels = TEMPLATES.map((t) => t.label);
  assert.equal(new Set(labels).size, 14);
  for (const label of labels) assert.ok(typeof label === 'string' && label.length > 0);
  assert.equal(getTemplate('nope').id, 'fantasy');
  assert.equal(getTemplate('__proto__').id, 'fantasy');
});

test('AP-007 sizes and CSS follow the contract', () => {
  for (const t of TEMPLATES) {
    assert.deepEqual([t.size.w, t.size.h], SIZES[t.id], t.id);
    if (AUTO_HEIGHT.has(t.id)) assert.ok(Number.isInteger(t.size.minH) && t.size.minH > 0, `${t.id} minH`);
    assert.match(t.defaultAccent, /^#[0-9a-f]{6}$/, t.id);
    assert.ok(t.css.includes(`.cs-${t.id}`), `${t.id} css scope`);
    for (const bad of ['url(', '@import', 'http:', 'https:', 'expression', '</style']) {
      assert.ok(!t.css.toLowerCase().includes(bad), `${t.id} css contains ${bad}`);
    }
  }
});

test('AP-007 each template renders a sized root with the right classes', () => {
  const vm = buildViewModel(sampleCharacter(), { art: null, icon: null });
  for (const t of TEMPLATES) {
    const html = toHtml(t.render(vm));
    const root = html.match(/^<div class="([^"]*)" style="([^"]*)"/);
    assert.ok(root, `${t.id} root must be a div with class and style`);
    const classes = root[1].split(/\s+/);
    assert.ok(classes.includes('cs-sheet') && classes.includes(`cs-${t.id}`), `${t.id} classes`);
    assert.ok(root[2].includes(`width:${t.size.w}px`), `${t.id} width style`);
    if (AUTO_HEIGHT.has(t.id)) {
      assert.ok(root[2].includes(`min-height:${t.size.minH}px`), `${t.id} min-height style`);
      assert.ok(!/(^|;)height:/.test(root[2]), `${t.id} must not fix its height`);
    } else {
      assert.ok(root[2].includes(`height:${t.size.h}px`), `${t.id} height style`);
    }
    assert.ok(/--accent:#[0-9a-f]{6}/.test(root[2]), `${t.id} accent variable`);
  }
});

test('AP-030 templates avoid names and colours that collide with real brands or works', async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  for (const file of readdirSync('src/templates').filter((f) => f.endsWith('.js'))) {
    assert.ok(!readFileSync(`src/templates/${file}`, 'utf8').includes('PERSONA'), file);
  }
  assert.notEqual(getTemplate('streamer').defaultAccent, '#9146ff');
});
