import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildForm } from '../src/app/form.js';
import { fakeDom, makeFlow, FakeNode } from './app-helpers.js';

/** Build the whole real form over the fake DOM, the way app.js does. */
function wholeForm() {
  const restoreDom = fakeDom();
  const { state, flow } = makeFlow();
  state.out = { format: 'png', preset: '1x', customWidth: '', imageMode: 'embed' };
  const ctx = {
    state,
    commit: () => {},
    setStatus: () => {},
    baseSize: () => ({ w: 1000, h: 1414 }),
    uploadImage: flow.uploadImage,
    removeImage: flow.removeImage,
    applyImageUrl: flow.applyImageUrl,
    clearImageUrl: flow.clearImageUrl,
    exportImage: () => {},
    exportHtmlFile: () => {},
    resetSample: () => {},
  };
  const root = new FakeNode('div');
  const api = buildForm(root, ctx);
  return { root, api, restoreDom };
}

// The fake DOM keeps text as plain string children, so collect them recursively.
const textOf = (node) => (node.children ?? []).map((c) => (typeof c === 'string' ? c : textOf(c))).join('').trim();

test('AP-049 the helper really reads headings (guards against a vacuous check)', () => {
  const { root, restoreDom } = wholeForm();
  try {
    const h2 = root.findAll((n) => n.tagName?.toLowerCase?.() === 'h2').map(textOf);
    assert.ok(h2.includes('디자인') && h2.includes('내보내기'), h2.join(','));
  } finally {
    restoreDom();
  }
});

test('AP-049 the sheet-width controls are mounted inside the design panel of the real form', () => {
  const { root, restoreDom } = wholeForm();
  try {
    const titles = root.findAll((n) => n.tagName?.toLowerCase?.() === 'h3' && textOf(n) === '시트 가로 폭');
    assert.equal(titles.length, 1, 'exactly one "시트 가로 폭" heading in the whole form');
    // The fake DOM has no parentNode, so find the panel whose direct children include the "디자인" heading.
    const isDesignHeading = (c) => c instanceof FakeNode && c.tagName.toLowerCase() === 'h2' && textOf(c) === '디자인';
    const panel = root.findAll((n) => (n.children ?? []).some(isDesignHeading))[0];
    assert.ok(panel, 'design panel');
    assert.equal(panel.findAll((n) => n === titles[0]).length, 1, 'the width controls live in the design panel');
  } finally {
    restoreDom();
  }
});
