import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as imageFlow from '../src/app/image-flow.js';
import { IMAGE_LOAD_TIMEOUT_MS } from '../src/app/url-image.js';
import {
  ART_URL, ICON_URL, OTHER_PNG, PNG_BYTES, fakeDecoding, fakeImg, fakeRoot, fakeTimers, imageResponse, makeFlow,
  pngFile, silenceWarnings, stubGlobals,
} from './app-helpers.js';
import { PNG } from './helpers.js';

// The texts the user sees, spelled out so that a change of wording is noticed.
const LOAD_FAIL_TEXT = '이 이미지는 원본 사이트가 외부 사용을 허용하지 않거나 열 수 없습니다. 파일로 업로드해 주세요';
const EMBED_FAIL_TEXT = "원본 사이트가 외부 저장을 허용하지 않아 포함할 수 없습니다. '링크 유지'를 선택하거나 파일로 업로드해 주세요";
const CHANGED_TEXT = '내보내는 동안 이미지가 바뀌어 중단했습니다. 다시 시도해 주세요';

/** Run `body` with fetch stubbed and image decoding faked; the globals are always put back. */
async function withNetwork(fetchStub, body) {
  const decoding = fakeDecoding();
  const restoreWarn = silenceWarnings();
  const restoreFetch = stubGlobals({ fetch: fetchStub });
  try {
    return await body();
  } finally {
    restoreFetch();
    restoreWarn();
    decoding.restore();
  }
}

/** Run `body` with the timers faked; the test fires them by hand. */
function withTimers(body) {
  const timers = fakeTimers();
  try {
    body(timers);
  } finally {
    timers.restore();
  }
}

test('AP-043 embeddedImages converts a stored address to a data URL and keeps an upload as it is', async () => {
  const { state, flow } = makeFlow();
  flow.applyImageUrl('art', ART_URL);
  state.images.icon = OTHER_PNG;
  const fetched = [];
  const images = await withNetwork(async (url) => { fetched.push(url); return imageResponse(PNG_BYTES); }, () => flow.embeddedImages());
  assert.deepEqual(images, { art: PNG, icon: OTHER_PNG });
  assert.deepEqual(fetched, [ART_URL]);
});

test('AP-043 embeddedImages needs no network when nothing is remote', async () => {
  const { state, flow } = makeFlow();
  state.images.art = PNG;
  const images = await withNetwork(async () => { throw new Error('fetch must not be called'); }, () => flow.embeddedImages());
  assert.deepEqual(images, { art: PNG, icon: null });
});

test('AP-043 a failed conversion stops the export with the exact message', async () => {
  const failures = [
    async () => imageResponse('<html></html>', 'text/html'),
    async () => imageResponse('not found', 'image/png', 404),
    async () => { throw new TypeError('Failed to fetch'); },
  ];
  for (const failing of failures) {
    const { flow, lastStatus } = makeFlow();
    flow.applyImageUrl('icon', ICON_URL);
    assert.equal(await withNetwork(failing, () => flow.embeddedImages()), null);
    assert.deepEqual(lastStatus(), { text: EMBED_FAIL_TEXT, kind: 'error' });
  }
  assert.equal(imageFlow.EMBED_FAIL, EMBED_FAIL_TEXT);
});

test('AP-043 SOURCE_CHANGED is the exported abort text', () => {
  assert.equal(imageFlow.SOURCE_CHANGED, CHANGED_TEXT);
});

test('AP-043 changing a picture while a conversion runs aborts the export instead of mixing pictures', async () => {
  const swapAddress = (flow) => async () => { flow.applyImageUrl('art', 'https://example.com/other.png'); return imageResponse(PNG_BYTES); };
  const { flow, lastStatus } = makeFlow();
  flow.applyImageUrl('art', ART_URL);
  assert.equal(await withNetwork(swapAddress(flow), () => flow.embeddedImages()), null);
  assert.deepEqual(lastStatus(), { text: CHANGED_TEXT, kind: 'error' });

  const second = makeFlow();
  second.flow.applyImageUrl('art', ART_URL);
  const addUpload = async () => { second.state.images.icon = OTHER_PNG; return imageResponse(PNG_BYTES); };
  assert.equal(await withNetwork(addUpload, () => second.flow.embeddedImages()), null);
  assert.deepEqual(second.lastStatus(), { text: CHANGED_TEXT, kind: 'error' });
});

test('AP-043 editing other content during a conversion does not abort it', async () => {
  const { state, flow } = makeFlow();
  flow.applyImageUrl('art', ART_URL);
  const editName = async () => { state.data = { ...state.data, name: '바뀐 이름' }; return imageResponse(PNG_BYTES); };
  assert.deepEqual(await withNetwork(editName, () => flow.embeddedImages()), { art: PNG, icon: null });
});

test('AP-043 both addresses are read before the first await, so a late edit cannot mix them', async () => {
  const { state, flow, lastStatus } = makeFlow();
  flow.applyImageUrl('art', ART_URL);
  flow.applyImageUrl('icon', ICON_URL);
  const fetched = [];
  const editIcon = async (url) => {
    fetched.push(url);
    if (fetched.length === 1) state.data = { ...state.data, iconUrl: 'https://cdn.example.org/other.webp' };
    return imageResponse(PNG_BYTES);
  };
  assert.equal(await withNetwork(editIcon, () => flow.embeddedImages()), null);
  assert.deepEqual(fetched, [ART_URL, ICON_URL]);
  assert.equal(lastStatus().text, CHANGED_TEXT);
});

test('AP-043 a failed preview load shows the built-in picture and keeps the stored address', () => {
  const { state, log, flow, lastStatus } = makeFlow();
  flow.applyImageUrl('art', ART_URL);
  const img = fakeImg(ART_URL);
  withTimers(() => {
    flow.watchPreview(fakeRoot(img));
    assert.equal(img.options.error.once, true);
    img.handlers.error();
  });
  assert.deepEqual(lastStatus(), { text: LOAD_FAIL_TEXT, kind: 'error' });
  assert.equal(imageFlow.URL_LOAD_FAIL, LOAD_FAIL_TEXT);
  assert.equal(log.renders, 1);
  assert.equal(state.data.artUrl, ART_URL);
  assert.equal(state.raw.artUrl, ART_URL);
  assert.equal(flow.previewImages().art, null);
  assert.equal(flow.linkImages().art, ART_URL);
  img.handlers.error();
  assert.equal(log.renders, 1, 'a repeated event changes nothing');
  flow.applyImageUrl('art', ART_URL);
  assert.equal(flow.previewImages().art, ART_URL, 'applying the address again tries again');
});

test('AP-043 a load error of a replaced address is ignored', () => {
  const { log, flow } = makeFlow();
  flow.applyImageUrl('art', ART_URL);
  const img = fakeImg(ART_URL);
  withTimers(() => flow.watchPreview(fakeRoot(img)));
  flow.applyImageUrl('art', 'https://example.com/b.png');
  img.handlers.error();
  assert.equal(log.renders, 0);
  assert.equal(flow.previewImages().art, 'https://example.com/b.png');
});

test('AP-043 a picture still loading after 15 seconds fails like a load error', () => {
  assert.equal(IMAGE_LOAD_TIMEOUT_MS, 15000);
  const { log, flow, lastStatus } = makeFlow();
  flow.applyImageUrl('art', ART_URL);
  const img = fakeImg(ART_URL);
  withTimers((timers) => {
    flow.watchPreview(fakeRoot(img));
    assert.equal(timers.timers.length, 1);
    assert.equal(timers.timers[0].delay, 15000);
    img.complete = true;
    timers.fire();
    assert.equal(log.renders, 0, 'loaded in time: nothing happens');
    img.complete = false;
    img.isConnected = false;
    timers.fire();
    assert.equal(log.renders, 0, 'replaced by a newer render: skipped');
    img.isConnected = true;
    timers.fire();
  });
  assert.deepEqual(lastStatus(), { text: LOAD_FAIL_TEXT, kind: 'error' });
  assert.equal(log.renders, 1);
  assert.equal(flow.previewImages().art, null);
  assert.equal(flow.linkImages().art, ART_URL);
});

test('AP-043 only pending https pictures are watched', () => {
  const { flow } = makeFlow();
  const done = fakeImg(ART_URL, { complete: true });
  const data = fakeImg(PNG);
  withTimers((timers) => {
    flow.watchPreview(fakeRoot(done, data));
    assert.equal(timers.timers.length, 0);
  });
  assert.equal(done.options.error.once, true);
  assert.deepEqual(data.handlers, {});
});

test('AP-043 an upload beats an address, applying an address releases the upload, and a bad address changes nothing', async () => {
  const { state, flow, lastStatus } = makeFlow();
  const decoding = fakeDecoding();
  try {
    assert.equal(await flow.uploadImage('art', pngFile('A')), true);
    assert.equal(state.images.art, PNG);
    assert.equal(flow.applyImageUrl('art', 'http://example.com/a.png'), false);
    assert.equal(lastStatus().kind, 'error');
    assert.equal(state.images.art, PNG, 'a refused address keeps the upload');
    assert.equal(flow.applyImageUrl('art', ART_URL), true);
    assert.equal(state.images.art, null, 'the upload was released');
    assert.equal(flow.previewImages().art, ART_URL);
    assert.equal(await flow.uploadImage('art', pngFile('A')), true);
    assert.equal(state.data.artUrl, '', 'the upload cleared the address');
    assert.equal(state.raw.artUrl, '');
    assert.equal(flow.previewImages().art, PNG);
    assert.equal(flow.linkImages().art, PNG);
  } finally {
    decoding.restore();
  }
});

test('AP-043 clear keeps an upload, remove drops both, reset drops uploads and remembered failures', () => {
  const { state, flow } = makeFlow();
  state.images.art = PNG;
  flow.clearImageUrl('art');
  assert.equal(state.images.art, PNG);
  flow.applyImageUrl('icon', ICON_URL);
  flow.removeImage('icon');
  assert.deepEqual([state.data.iconUrl, state.images.icon], ['', null]);
  state.failed.art = ART_URL;
  flow.reset();
  assert.deepEqual([state.images, state.failed], [{ art: null, icon: null }, { art: '', icon: '' }]);
});
