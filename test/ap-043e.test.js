import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMediaSections } from '../src/app/form-media.js';
import { ART_URL, fakeDecoding, fakeDom, makeFlow, pngFile, until } from './app-helpers.js';
import { PNG } from './helpers.js';

/** The art, icon and export sections built over a fake DOM and a real image flow. */
function buildForm() {
  const restoreDom = fakeDom();
  const { state, flow, lastStatus } = makeFlow();
  state.out = { format: 'png', preset: '1x', customWidth: '', imageMode: 'embed' };
  const ctx = {
    state,
    commit: () => {},
    baseSize: () => ({ w: 640, h: 960 }),
    uploadImage: flow.uploadImage,
    removeImage: flow.removeImage,
    applyImageUrl: flow.applyImageUrl,
    clearImageUrl: flow.clearImageUrl,
    exportImage: () => {},
    exportHtmlFile: () => {},
    resetSample: () => {},
  };
  const reg = { sync: [], refresh: [], afterRender: [] };
  const sections = buildMediaSections(ctx, reg);
  const byId = (id) => sections.map((section) => section.byId(id)).find(Boolean);
  return { state, lastStatus, byId, reg, restoreDom };
}

test('AP-043 the address boxes carry no maxlength, so a pasted long address is never cut', () => {
  const form = buildForm();
  try {
    for (const id of ['art-url', 'icon-url']) {
      const input = form.byId(id);
      assert.ok(input, id);
      assert.equal(input.getAttribute('maxlength'), null, id);
    }
  } finally {
    form.restoreDom();
  }
});

test('AP-043 an over-long pasted address is kept whole, refused with a message, and not stored', () => {
  const form = buildForm();
  try {
    const tooLong = `https://example.com/${'a'.repeat(2100)}`;
    const input = form.byId('art-url');
    input.type(tooLong);
    assert.equal(input.value, tooLong, 'the paste is not cut down to a shorter address that would still be valid');
    form.byId('art-url-apply').click();
    assert.equal(form.lastStatus().kind, 'error');
    assert.match(form.lastStatus().text, /2048/);
    assert.equal(form.state.data.artUrl, '');
    assert.equal(form.state.raw.artUrl, '');
    assert.equal(input.value, tooLong, 'the box keeps the text so that the user can fix it');
  } finally {
    form.restoreDom();
  }
});

test('AP-043 apply stores the normalised address and shows it; clear and the Enter key work', () => {
  const form = buildForm();
  try {
    const input = form.byId('art-url');
    input.type('  https://EXAMPLE.com/art.png  ');
    form.byId('art-url-apply').click();
    assert.equal(form.state.data.artUrl, ART_URL);
    assert.equal(input.value, ART_URL);
    form.byId('art-url-clear').click();
    assert.equal(form.state.data.artUrl, '');
    assert.equal(input.value, '');
    input.type(ART_URL);
    input.dispatch('keydown', { key: 'Enter' });
    assert.equal(form.state.data.artUrl, ART_URL);
  } finally {
    form.restoreDom();
  }
});

test('AP-043 an upload or a remove empties the address box', async () => {
  const form = buildForm();
  const decoding = fakeDecoding();
  try {
    const input = form.byId('art-url');
    input.type(ART_URL);
    form.byId('art-url-apply').click();
    assert.equal(input.value, ART_URL);
    const picker = form.byId('art-file');
    picker.files = [pngFile('A')];
    picker.dispatch('change');
    await until(() => input.value === '', 'the upload to empty the box');
    assert.equal(form.state.images.art, PNG);
    assert.equal(form.state.data.artUrl, '');
    input.type(ART_URL);
    form.byId('art-url-apply').click();
    form.byId('art-remove').click();
    assert.equal(input.value, '');
    assert.equal(form.state.images.art, null);
  } finally {
    decoding.restore();
    form.restoreDom();
  }
});

test('AP-043 the export area offers the image select, defaulting to include the pictures in the file', () => {
  const form = buildForm();
  try {
    form.reg.sync.forEach((fn) => fn());
    const select = form.byId('export-image-mode');
    const options = select.findAll((node) => node.tagName === 'OPTION').map((node) => [node.getAttribute('value'), node.children.join('')]);
    assert.deepEqual(options, [['embed', '파일에 포함'], ['link', '링크 유지']]);
    assert.equal(select.value, 'embed');
    select.value = 'link';
    select.dispatch('change');
    assert.equal(form.state.out.imageMode, 'link');
  } finally {
    form.restoreDom();
  }
});
