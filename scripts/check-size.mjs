// AP-NFR-SIZE: every source file must be at most 300 lines (recurses into src/).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const LIMIT = 300;
const EXTS = new Set(['.js', '.mjs', '.html', '.css']);

function listFiles(dir, recurse) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return recurse ? listFiles(path, true) : [];
    return EXTS.has(extname(name)) ? [path] : [];
  });
}

const files = [...listFiles('.', false), ...listFiles('src', true), ...listFiles('test', false), ...listFiles('scripts', false)];
let failed = 0;
for (const path of files) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
  const ok = lines <= LIMIT;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${String(lines).padStart(4)}  ${path}`);
}
process.exit(failed ? 1 : 0);
