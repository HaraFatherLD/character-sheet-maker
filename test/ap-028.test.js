import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readImageSize, isImageTooLarge } from '../src/core/image-size.js';

const be32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const be16 = (n) => [(n >>> 8) & 255, n & 255];
const le16 = (n) => [n & 255, (n >>> 8) & 255];
const le24 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255];
const ascii = (s) => [...s].map((c) => c.charCodeAt(0));

const png = (w, h) => new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...be32(13), ...ascii('IHDR'), ...be32(w), ...be32(h), 8, 6, 0, 0, 0]);
const jpeg = (w, h, sof = 0xc0) => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...be16(16), ...ascii('JFIF'), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0,
  0xff, sof, ...be16(17), 8, ...be16(h), ...be16(w), 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1]);
const riff = (chunk, payload) => new Uint8Array([...ascii('RIFF'), ...le24(payload.length + 12), 0, ...ascii('WEBP'), ...ascii(chunk), ...le24(payload.length), 0, ...payload]);
const vp8 = (w, h) => riff('VP8 ', [0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, ...le16(w), ...le16(h), 0, 0]);
const vp8l = (w, h) => {
  const bits = ((w - 1) & 0x3fff) | (((h - 1) & 0x3fff) << 14);
  return riff('VP8L', [0x2f, bits & 255, (bits >>> 8) & 255, (bits >>> 16) & 255, (bits >>> 24) & 255, 0, 0]);
};
const vp8x = (w, h) => riff('VP8X', [0x10, 0, 0, 0, ...le24(w - 1), ...le24(h - 1)]);

test('AP-028 reads PNG and JPEG dimensions', () => {
  assert.deepEqual(readImageSize(png(1920, 1080)), { w: 1920, h: 1080 });
  assert.deepEqual(readImageSize(png(8000, 8000)), { w: 8000, h: 8000 });
  assert.deepEqual(readImageSize(jpeg(640, 480)), { w: 640, h: 480 });
  assert.deepEqual(readImageSize(jpeg(3000, 4000, 0xc2)), { w: 3000, h: 4000 });
});

test('AP-028 reads all three WebP flavours', () => {
  assert.deepEqual(readImageSize(vp8(800, 600)), { w: 800, h: 600 });
  assert.deepEqual(readImageSize(vp8l(1024, 768)), { w: 1024, h: 768 });
  assert.deepEqual(readImageSize(vp8x(5000, 3000)), { w: 5000, h: 3000 });
});

test('AP-028 truncated or unknown bytes give null without throwing', () => {
  const cases = [new Uint8Array([]), png(10, 10).slice(0, 20), jpeg(10, 10).slice(0, 25), vp8(10, 10).slice(0, 26),
    new Uint8Array(Array.from({ length: 64 }, (_, i) => (i * 37) & 255)), new Uint8Array([0xff, 0xd8, 0xff, 0xd9])];
  for (const bytes of cases) {
    let res;
    assert.doesNotThrow(() => { res = readImageSize(bytes); });
    assert.equal(res, null);
  }
});

test('AP-028 the decode limit is 50 megapixels inclusive', () => {
  assert.equal(isImageTooLarge({ w: 10000, h: 5000 }), false);
  assert.equal(isImageTooLarge({ w: 10000, h: 5001 }), true);
  assert.equal(isImageTooLarge({ w: 8000, h: 8000 }), true);
  assert.equal(isImageTooLarge({ w: 0, h: 0 }), true);
});

test('AP-028 non-integer or missing dimensions count as too large', () => {
  for (const size of [{ w: 10.5, h: 10 }, { w: NaN, h: 10 }, { w: 10 }, {}, null, { w: -1, h: 10 }]) {
    assert.equal(isImageTooLarge(size), true, JSON.stringify(size));
  }
});
