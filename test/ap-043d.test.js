import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IMAGE_LOAD_TIMEOUT_MS, fetchImageAsDataUrl } from '../src/app/url-image.js';
import { ART_URL, PNG_BYTES, fakeDecoding, fakeTimers, imageResponse, silenceWarnings, stubGlobals } from './app-helpers.js';
import { PNG } from './helpers.js';

const MIB = 1024 * 1024;

/** Run the conversion with fetch stubbed and decoding faked; returns the result and the decoding spy. */
async function convert(fetchStub, { maxSide = 2400, decodingOptions } = {}) {
  const decoding = fakeDecoding(decodingOptions);
  const restoreWarn = silenceWarnings();
  const restoreFetch = stubGlobals({ fetch: fetchStub });
  try {
    return { result: await fetchImageAsDataUrl(ART_URL, maxSide), decoding };
  } finally {
    restoreFetch();
    restoreWarn();
    decoding.restore();
  }
}

/** A valid 1x1 png header followed by padding up to `size` bytes (the pixels are never decoded in these tests). */
function paddedPng(size) {
  const bytes = new Uint8Array(size);
  bytes.set(PNG_BYTES);
  return bytes;
}

test('AP-043 a CORS-readable png becomes a data URL and the request has the specified shape', async () => {
  const seen = [];
  const timers = fakeTimers();
  let outcome;
  try {
    outcome = await convert(async (url, init) => { seen.push([url, init]); return imageResponse(PNG_BYTES, 'image/png; charset=binary'); });
  } finally {
    timers.restore();
  }
  assert.deepEqual(outcome.result, { ok: true, dataUrl: PNG, width: 1, height: 1 });
  assert.equal(seen.length, 1);
  assert.equal(seen[0][0], ART_URL);
  const { mode, credentials, referrerPolicy, signal } = seen[0][1];
  assert.deepEqual({ mode, credentials, referrerPolicy }, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' });
  assert.ok(signal instanceof AbortSignal);
  assert.ok(timers.cleared.includes(1), 'the 15 second timer is cleared once the download is over');
});

test('AP-043 jpeg, png and webp content types are accepted', async () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp', 'IMAGE/PNG']) {
    const { result } = await convert(async () => imageResponse(PNG_BYTES, type));
    assert.equal(result.ok, true, type);
  }
});

test('AP-043 a content type other than jpeg, png or webp is rejected before decoding', async () => {
  const rejected = ['text/html', 'image/gif', 'image/svg+xml', 'application/octet-stream', null];
  for (const type of rejected) {
    const { result, decoding } = await convert(async () => imageResponse(PNG_BYTES, type));
    assert.equal(result.ok, false, String(type));
    assert.equal(typeof result.error, 'string');
    assert.equal(decoding.calls.decode, 0, String(type));
  }
});

test('AP-043 an HTTP error, a network error and an empty body are rejected without throwing', async () => {
  const notFound = await convert(async () => imageResponse('not found', 'image/png', 404));
  assert.equal(notFound.result.ok, false);
  assert.match(notFound.result.error, /404/);
  const offline = await convert(async () => { throw new TypeError('Failed to fetch'); });
  assert.equal(offline.result.ok, false);
  const empty = await convert(async () => new Response(null, { status: 200, headers: { 'content-type': 'image/png' } }));
  assert.equal(empty.result.ok, false);
});

test('AP-043 reading stops as soon as the body passes 20 MiB', async () => {
  let pulled = 0;
  let cancelled = false;
  const chunk = new Uint8Array(MIB);
  const body = new ReadableStream({
    pull(controller) {
      pulled += 1;
      if (pulled > 40) controller.close();
      else controller.enqueue(chunk);
    },
    cancel() { cancelled = true; },
  });
  const { result, decoding } = await convert(async () => imageResponse(body));
  assert.equal(result.ok, false);
  assert.equal(cancelled, true, 'the stream is cancelled');
  assert.ok(pulled <= 23, `read ${pulled} MiB before giving up`);
  assert.equal(decoding.calls.decode, 0);
});

test('AP-043 the 20 MiB limit is exact', async () => {
  assert.equal((await convert(async () => imageResponse(paddedPng(20 * MIB)))).result.ok, true);
  assert.equal((await convert(async () => imageResponse(paddedPng(20 * MIB + 1)))).result.ok, false);
});

test('AP-043 a header that cannot be read or is over 50 megapixels is rejected before decoding', async () => {
  const huge = Buffer.from(PNG_BYTES);
  huge.writeUInt32BE(8000, 16);
  huge.writeUInt32BE(8000, 20);
  const tooBig = await convert(async () => imageResponse(huge));
  assert.equal(tooBig.result.ok, false);
  assert.equal(tooBig.decoding.calls.decode, 0);
  const unreadable = await convert(async () => imageResponse(new Uint8Array(64), 'image/webp'));
  assert.equal(unreadable.result.ok, false);
  assert.equal(unreadable.decoding.calls.decode, 0);
});

test('AP-043 the picture is shrunk to the longest side allowed for its slot', async () => {
  const { result, decoding } = await convert(async () => imageResponse(PNG_BYTES), { maxSide: 512, decodingOptions: { size: { width: 4000, height: 2000 } } });
  assert.equal(result.ok, true);
  assert.deepEqual([result.width, result.height], [512, 256]);
  assert.deepEqual([decoding.canvases[0].width, decoding.canvases[0].height], [512, 256]);
});

test('AP-043 a download still pending after 15 seconds is aborted and fails like any other load error', async () => {
  assert.equal(IMAGE_LOAD_TIMEOUT_MS, 15000);
  const timers = fakeTimers();
  const decoding = fakeDecoding();
  const restoreWarn = silenceWarnings();
  const never = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new DOMException('timed out', 'AbortError')));
  });
  const restoreFetch = stubGlobals({ fetch: never });
  try {
    const pending = fetchImageAsDataUrl(ART_URL, 2400);
    assert.equal(timers.timers.length, 1);
    assert.equal(timers.timers[0].delay, 15000);
    timers.fire();
    const result = await pending;
    assert.equal(result.ok, false);
    assert.equal(typeof result.error, 'string');
  } finally {
    restoreFetch();
    restoreWarn();
    decoding.restore();
    timers.restore();
  }
});
