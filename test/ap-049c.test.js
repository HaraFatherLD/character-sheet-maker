import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWidthControls } from '../src/app/form-width.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';
import { fakeDom } from './app-helpers.js';

/** The width controls over a fake DOM, wired like app.js: a control writes into state.raw and commit() normalises and refreshes. */
function build() {
  const restoreDom = fakeDom();
  const state = { raw: structuredClone(sampleCharacter()) };
  state.data = normalizeCharacter(state.raw).value;
  const reg = { sync: [], refresh: [] };
  const refresh = () => reg.refresh.forEach((fn) => fn());
  const nodes = buildWidthControls({ state, commit: () => { state.data = normalizeCharacter(state.raw).value; refresh(); } }, reg);
  const byId = (id) => nodes.map((node) => node.byId?.(id)).find(Boolean);
  const input = byId('sheet-width');
  for (const name of ['focus', 'select', 'blur']) input[name] = () => {};
  const sync = () => { reg.sync.forEach((fn) => fn()); refresh(); };
  const pick = (value) => { byId('sheet-width-preset').value = value; byId('sheet-width-preset').dispatch('change'); };
  const type = (text) => { input.value = text; input.dispatch('input'); };
  const view = () => ({
    preset: byId('sheet-width-preset').value, disabled: input.disabled, box: input.value, size: byId('sheet-width-size').textContent,
  });
  return {
    state, sync, pick, type, view, restoreDom, message: byId('sheet-width-message'), reset: byId('sheet-width-reset'),
    show: (template) => { state.raw.template = template; state.data = normalizeCharacter(state.raw).value; refresh(); },
  };
}

test('AP-049 the width controls start at the design width and follow the preset', () => {
  const form = build();
  try {
    form.sync();
    assert.deepEqual(form.view(), { preset: 'base', disabled: true, box: '1000', size: '1000 × 1414 px' });
    form.pick('125');
    assert.deepEqual(form.state.raw.sheetWidths, { fantasy: 1250 });
    assert.deepEqual(form.view(), { preset: '125', disabled: true, box: '1250', size: '1250 × 1768 px' });
    form.pick('75');
    assert.equal(form.state.raw.sheetWidths.fantasy, 750);
    form.pick('base');
    assert.deepEqual(form.state.raw.sheetWidths, {}, 'the key is deleted, not set to the base width');
    assert.deepEqual(form.view(), { preset: 'base', disabled: true, box: '1000', size: '1000 × 1414 px' });
  } finally {
    form.restoreDom();
  }
});

test('AP-049 a typed width is stored when valid; an invalid one shows a message and is not stored', () => {
  const form = build();
  try {
    form.sync();
    form.pick('custom');
    assert.equal(form.view().disabled, false, 'the box is enabled only for custom');
    assert.deepEqual(form.state.raw.sheetWidths, {}, 'choosing custom stores nothing yet');
    form.type('800');
    assert.deepEqual(form.state.raw.sheetWidths, { fantasy: 800 });
    assert.equal(form.view().size, '800 × 1131 px');
    for (const bad of ['', '399', '2401', 'abc']) {
      form.type(bad);
      assert.equal(form.message.hidden, false, `message for "${bad}"`);
      assert.match(form.message.textContent, /400~2400/);
      assert.deepEqual(form.state.raw.sheetWidths, { fantasy: 800 }, `"${bad}" is not stored`);
    }
    form.type('1250');
    assert.equal(form.message.hidden, true);
    assert.equal(form.view().size, '1250 × 1768 px');
    assert.equal(form.view().preset, 'custom', 'a typed width that equals a preset stays typed');
    assert.equal(form.view().disabled, false);
  } finally {
    form.restoreDom();
  }
});

test('AP-049 the reset button deletes the key and each design shows its own stored width', () => {
  const form = build();
  try {
    form.sync();
    form.state.raw.sheetWidths = { fantasy: 1200, clean: 800 };
    form.show('fantasy');
    assert.deepEqual(form.view(), { preset: 'custom', disabled: false, box: '1200', size: '1200 × 1697 px' });
    form.show('clean');
    assert.equal(form.view().size, '800 px × 자동', 'block designs reflow, so the height is automatic');
    form.show('vertical');
    assert.deepEqual(form.view(), { preset: 'base', disabled: true, box: '720', size: '720 px × 자동' });
    form.show('clean');
    form.reset.click();
    assert.deepEqual(form.state.raw.sheetWidths, { fantasy: 1200 }, 'only the current design is reset');
    assert.equal(form.view().size, '1000 px × 자동');
    form.sync();
    assert.equal(form.message.hidden, true);
  } finally {
    form.restoreDom();
  }
});
