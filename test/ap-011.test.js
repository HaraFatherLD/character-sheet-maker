import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SCRIPTS = resolve('scripts');
const run = (script, cwd) => spawnSync(process.execPath, [join(SCRIPTS, script)], { cwd, encoding: 'utf8' }).status;

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'csm-'));
  for (const sub of ['src/core', 'test', 'scripts']) mkdirSync(join(dir, sub), { recursive: true });
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>x</title>\n');
  for (const [path, body] of Object.entries(files)) writeFileSync(join(dir, path), body);
  return dir;
}

test('AP-011 sink checker fails on each forbidden API and passes on clean code', () => {
  for (const line of ['el.innerHTML = s;', 'el.outerHTML = s;', "el.insertAdjacentHTML('beforeend', s);", 'document.write(s);']) {
    const dir = fixture({ 'src/core/bad.js': `${line}\n` });
    try { assert.equal(run('check-no-html-sink.mjs', dir), 1, line); } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  const clean = fixture({ 'src/core/ok.js': 'el.textContent = s;\n' });
  try { assert.equal(run('check-no-html-sink.mjs', clean), 0); } finally { rmSync(clean, { recursive: true, force: true }); }
});

test('AP-011 size checker counts like wc -l: 301 lines fail, 300 pass', () => {
  const long = fixture({ 'src/core/long.js': 'x\n'.repeat(301) });
  try { assert.equal(run('check-size.mjs', long), 1); } finally { rmSync(long, { recursive: true, force: true }); }
  for (const body of ['x\n'.repeat(300), 'x\n'.repeat(299) + 'x']) {
    const ok = fixture({ 'src/core/ok.js': body });
    try { assert.equal(run('check-size.mjs', ok), 0); } finally { rmSync(ok, { recursive: true, force: true }); }
  }
});

test('AP-011 the real repository passes both checks', () => {
  assert.equal(run('check-no-html-sink.mjs', resolve('.')), 0);
  assert.equal(run('check-size.mjs', resolve('.')), 0);
});
