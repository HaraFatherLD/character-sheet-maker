import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeFilename } from '../src/core/filename.js';

test('AP-010 keeps ordinary Korean names', () => {
  assert.equal(safeFilename('캐릭터시트_세라 윈드', 'png'), '캐릭터시트_세라 윈드.png');
});

test('AP-010 strips forbidden and control characters, trims spaces and trailing dots', () => {
  assert.equal(safeFilename('a\\b/c:d*e?f"g<h>i|j', 'jpg'), 'abcdefghij.jpg');
  assert.equal(safeFilename('x\u0000y\u001fz', 'png'), 'xyz.png');
  assert.equal(safeFilename('  시트.. ', 'html'), '시트.html');
});

test('AP-010 suffixes Windows reserved names', () => {
  for (const n of ['CON', 'aux', 'Com3', 'LPT1']) assert.equal(safeFilename(n, 'png'), `${n}_.png`);
  assert.equal(safeFilename('CONAN', 'png'), 'CONAN.png');
});

test('AP-010 caps at 100 code points and falls back when empty', () => {
  assert.equal(safeFilename('가'.repeat(150), 'png'), '가'.repeat(100) + '.png');
  for (const b of ['', '  ', '...', '|<>', null, undefined]) assert.equal(safeFilename(b, 'png'), 'character-sheet.png');
});
