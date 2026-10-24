import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTemplate } from '../src/templates/index.js';
import { buildViewModel } from '../src/core/view-model.js';
import { sampleCharacter } from '../src/core/sample.js';
import { normalizeCharacter } from '../src/core/schema.js';
import { toHtml } from '../src/core/vnode.js';
import { PAYLOADS, hasClass, classIndex, unsafeReasons } from './helpers.js';

const NEW = ['clean', 'vertical'];
const BLOCKS = [
  { id: 'b-memo', kind: 'text', title: '메모', body: '첫째 줄\n둘째 줄' },
  { id: 'b-bag', kind: 'list', title: '소지품', items: ['작은 등불', '낡은 항해 지도'] },
];
const render = (id, patch) => toHtml(getTemplate(id).render(buildViewModel(normalizeCharacter({ ...sampleCharacter(), customBlocks: BLOCKS, ...patch }).value, { art: null, icon: null })));

/** Splits markup into the info area and the main area (info comes first in both designs). */
function areas(html) {
  const info = classIndex(html, 'cs-area-info');
  const main = classIndex(html, 'cs-area-main');
  assert.ok(info >= 0 && main > info, 'info area must precede main area');
  return { info: html.slice(info, main), main: html.slice(main) };
}

test('AP-026 block order follows the layout inside each area', () => {
  const layout = { info: ['quote', 'b-bag', 'profile'], main: ['stats', 'b-memo', 'summary', 'skills', 'tags', 'likes', 'dislikes', 'backstory'] };
  for (const id of NEW) {
    const { info, main } = areas(render(id, { layout }));
    const pos = (part, name) => classIndex(part, name);
    assert.ok(pos(info, 'cs-f-quote') < pos(info, 'cs-b-b-bag') && pos(info, 'cs-b-b-bag') < pos(info, 'cs-f-profile'), `${id}: info order`);
    assert.ok(pos(main, 'cs-f-stats') < pos(main, 'cs-b-b-memo') && pos(main, 'cs-b-b-memo') < pos(main, 'cs-f-summary'), `${id}: main order`);
    assert.ok(pos(main, 'cs-f-summary') < pos(main, 'cs-f-backstory'), `${id}: main tail order`);
    assert.equal(pos(main, 'cs-f-quote'), -1, `${id}: quote must not be in main`);
  }
});

test('AP-026 moving a block to the other area moves it in the output', () => {
  for (const id of NEW) {
    const before = areas(render(id, {}));
    assert.ok(hasClass(before.main, 'cs-f-stats') && !hasClass(before.info, 'cs-f-stats'), `${id}: stats starts in main`);
    const after = areas(render(id, { layout: { info: ['profile', 'quote', 'stats'], main: ['summary'] } }));
    assert.ok(hasClass(after.info, 'cs-f-stats') && !hasClass(after.main, 'cs-f-stats'), `${id}: stats moved to info`);
  }
});

test('AP-026 custom text and list blocks render their content', () => {
  for (const id of NEW) {
    const html = render(id, {});
    assert.ok(hasClass(html, 'cs-b-custom'), id);
    assert.ok(html.includes('메모') && html.includes('첫째 줄\n둘째 줄'), `${id}: text block keeps line breaks`);
    assert.ok(getTemplate(id).css.includes('pre-wrap'), `${id}: css preserves line breaks`);
    assert.ok(/<li[^>]*>작은 등불<\/li>/.test(html) && html.includes('낡은 항해 지도'), `${id}: list items`);
  }
});

test('AP-026 custom block text is escaped and hidden blocks are skipped', () => {
  for (const id of NEW) {
    for (const p of PAYLOADS) {
      const html = render(id, { customBlocks: [{ id: 'b-x', kind: 'list', title: p.slice(0, 30), body: '', items: [p.slice(0, 60)] }, { id: 'b-y', kind: 'text', title: 't', body: p }] });
      assert.deepEqual(unsafeReasons(html), [], `${id} / ${p}`);
    }
    const hidden = render(id, { hidden: ['summary', 'stats'] });
    assert.ok(!hasClass(hidden, 'cs-f-summary') && !hasClass(hidden, 'cs-f-stats'), `${id}: hidden blocks`);
  }
});

test('AP-026 palette tokens become CSS variables with defaults for invalid values', () => {
  for (const id of NEW) {
    const html = render(id, { palettes: { [id]: { bg: '#123456', text: 'nothex', chip: '#ABCDEF' } } });
    const style = html.match(/^<div class="[^"]*" style="([^"]*)"/)[1];
    assert.ok(style.includes('--c-bg:#123456'), `${id}: bg`);
    assert.ok(style.includes('--c-chip:#abcdef'), `${id}: chip`);
    assert.match(style, /--c-text:#[0-9a-f]{6}/, `${id}: text default`);
    for (const token of ['bg', 'panel', 'text', 'muted', 'accent', 'title', 'line', 'chip']) assert.ok(style.includes(`--c-${token}:#`), `${id}: ${token}`);
    const other = render(id === 'clean' ? 'vertical' : 'clean', { palettes: { [id]: { bg: '#123456' } } });
    assert.ok(!other.includes('--c-bg:#123456'), 'palettes are per template');
  }
});

test('AP-026 empty custom blocks stay in the data but are not rendered (rev.4)', () => {
  for (const id of NEW) {
    const html = render(id, { customBlocks: [...BLOCKS, { id: 'b-empty', kind: 'text', title: '', body: '' }] });
    assert.ok(!hasClass(html, 'cs-b-b-empty'), id);
    assert.ok(hasClass(html, 'cs-b-b-memo'), id);
  }
});
