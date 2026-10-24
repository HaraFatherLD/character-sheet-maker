// AP-011: no HTML-injection sinks in app code (recurses into src/).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SINK = /innerHTML|outerHTML|insertAdjacentHTML|document\.write|createContextualFragment|DOMParser/;

function listJs(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listJs(path);
    return path.endsWith('.js') ? [path] : [];
  });
}

const files = [...(existsSync('index.html') ? ['index.html'] : []), ...listJs('src')];
let hits = 0;
for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (SINK.test(line)) {
      hits++;
      console.log(`FAIL ${file}:${i + 1}  ${line.trim()}`);
    }
  });
}
if (files.length === 0) {
  console.log('FAIL no files to check');
  process.exit(1);
}
console.log(hits ? `${hits} sink(s) found` : `ok  ${files.length} files clean`);
process.exit(hits ? 1 : 0);
