// Per-template v2 audit: labels inside markers, hide support, custom rows. Usage: node scripts/audit-v2.mjs [id ...]
import { TEMPLATES } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter, HIDEABLE_KEYS } from '../src/core/schema.js';
import { toHtml } from '../src/core/vnode.js';
import { hasClass, classIndex } from '../test/helpers.js';

const LABELED = ['age', 'gender', 'affiliation', 'height', 'birthday', 'likes', 'dislikes', 'backstory', 'skills', 'stats'];
const CF = [{ id: 'c-1', label: '무기', value: '은빛 단검' }, { id: 'c-2', label: '좌우명', value: '끝까지 비춘다' }];
const render = (t, d) => toHtml(t.render(buildViewModel(normalizeCharacter(d).value, { art: null, icon: null })));
const count = (h, n) => (h.match(new RegExp(`class="(?:[^"]*\\s)?${n}(?:\\s[^"]*)?"`, 'g')) || []).length;

function audit(t) {
  const issues = [];
  const labels = Object.fromEntries(LABELED.map((k) => [k, `라벨${k.toUpperCase()}`]));
  const html = render(t, { ...sampleCharacter(), labels, customFields: CF });
  for (const k of LABELED) {
    const at = classIndex(html, `cs-f-${k}`);
    if (at >= 0 && !html.slice(at, at + 1500).includes(`>${labels[k]}<`)) issues.push(`label:${k}`);
  }
  if (!hasClass(html, 'cs-f-stats')) issues.push('stats-missing');
  if (render(t, { ...sampleCharacter(), labels: { stats: '스테이터스X' } }).includes('>능력치<')) issues.push('default-stats-label');
  for (const k of HIDEABLE_KEYS) {
    if (hasClass(render(t, { ...sampleCharacter(), customFields: CF, hidden: [k] }), `cs-f-${k}`)) issues.push(`hide:${k}`);
  }
  const rows = count(html, 'cs-f-custom');
  if (rows < 2) issues.push(`custom-rows:${rows}`);
  return issues;
}

const only = process.argv.slice(2);
let bad = 0;
for (const t of TEMPLATES.filter((x) => !only.length || only.includes(x.id))) {
  const issues = audit(t);
  if (issues.length) bad++;
  console.log(t.id.padEnd(10), issues.join(' ') || 'OK');
}
process.exit(bad ? 1 : 0);
