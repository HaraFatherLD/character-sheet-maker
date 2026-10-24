import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ART_URL, ICON_URL, OTHER_PNG, fakeDecoding, makeFlow, pngFile, until } from './app-helpers.js';
import { PNG } from './helpers.js';

// Last action wins: a result that comes back after a newer action on the same slot must not undo that action.

/** Start an upload that stays in flight until `release()` is called. */
async function startUpload(flow, decoding, kind, tag) {
  const index = decoding.pending.length;
  const result = flow.uploadImage(kind, pngFile(tag));
  await until(() => decoding.pending.length > index, 'the upload to reach decoding');
  return { result, release: () => decoding.pending[index]() };
}

/** Run `body` with decoding held back: file A decodes to PNG and file B to OTHER_PNG. */
async function inFlight(body) {
  const made = makeFlow();
  const decoding = fakeDecoding({ deferred: true, urls: { A: PNG, B: OTHER_PNG } });
  try {
    await body({ ...made, decoding });
  } finally {
    decoding.restore();
  }
}

test('AP-043 an address applied while an upload is in flight is not cleared when the upload finishes', () => inFlight(async ({ state, flow, lastStatus, decoding }) => {
  const upload = await startUpload(flow, decoding, 'art', 'A');
  assert.equal(flow.applyImageUrl('art', ART_URL), true);
  upload.release();
  assert.equal(await upload.result, false, 'the upload was superseded');
  assert.equal(state.data.artUrl, ART_URL);
  assert.equal(state.images.art, null);
  assert.match(lastStatus().text, /주소를 적용했습니다/, 'the upload does not overwrite the status either');
}));

test('AP-043 an upload started after an address wins over it', () => inFlight(async ({ state, flow, decoding }) => {
  flow.applyImageUrl('art', ART_URL);
  const upload = await startUpload(flow, decoding, 'art', 'B');
  upload.release();
  assert.equal(await upload.result, true);
  assert.equal(state.images.art, OTHER_PNG);
  assert.equal(state.data.artUrl, '');
}));

test('AP-043 removing the picture while an upload is in flight leaves the slot empty', () => inFlight(async ({ state, flow, decoding }) => {
  const upload = await startUpload(flow, decoding, 'art', 'A');
  flow.removeImage('art');
  upload.release();
  assert.equal(await upload.result, false);
  assert.equal(state.images.art, null);
}));

test('AP-043 resetting while an upload is in flight keeps the upload off the reset sample', () => inFlight(async ({ state, flow, decoding }) => {
  const upload = await startUpload(flow, decoding, 'art', 'A');
  flow.reset();
  upload.release();
  assert.equal(await upload.result, false);
  assert.equal(state.images.art, null);
}));

test('AP-043 of two uploads on one slot the newer one stays, whichever finishes first', () => inFlight(async ({ state, flow, decoding }) => {
  const older = await startUpload(flow, decoding, 'art', 'A');
  const newer = await startUpload(flow, decoding, 'art', 'B');
  newer.release();
  assert.equal(await newer.result, true);
  older.release();
  assert.equal(await older.result, false);
  assert.equal(state.images.art, OTHER_PNG);
}));

test('AP-043 slots are independent: an address on the illustration does not cancel an icon upload', () => inFlight(async ({ state, flow, decoding }) => {
  const upload = await startUpload(flow, decoding, 'icon', 'A');
  flow.applyImageUrl('art', ART_URL);
  upload.release();
  assert.equal(await upload.result, true);
  assert.equal(state.images.icon, PNG);
  assert.equal(state.data.artUrl, ART_URL);
  assert.equal(state.data.iconUrl, '');
}));

test('AP-043 a refused address or a cleared address does not cancel an upload in flight', () => inFlight(async ({ state, flow, decoding }) => {
  flow.applyImageUrl('icon', ICON_URL);
  const upload = await startUpload(flow, decoding, 'icon', 'A');
  assert.equal(flow.applyImageUrl('icon', 'http://example.com/not-https.png'), false);
  flow.clearImageUrl('icon');
  upload.release();
  assert.equal(await upload.result, true);
  assert.equal(state.images.icon, PNG);
}));
