import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCharacter, LABEL_KEYS, HIDEABLE_KEYS, BLOCK_KEYS, DEFAULT_LAYOUT, PALETTE_TOKENS } from '../src/core/schema.js';
import { sampleCharacter } from '../src/core/sample.js';

const seqId = () => { let n = 0; return () => `b-gen${++n}`; };
const norm = (patch) => normalizeCharacter({ ...sampleCharacter(), ...patch }, { genId: seqId() }).value;

test('AP-022 key lists match the spec', () => {
  assert.ok(!LABEL_KEYS.includes('name'));
  for (const k of ['age', 'backstory', 'tags', 'stats', 'skills', 'profile', 'custom']) assert.ok(LABEL_KEYS.includes(k), k);
  assert.ok(!HIDEABLE_KEYS.includes('name') && !HIDEABLE_KEYS.includes('art'));
  for (const k of ['title', 'quote', 'tags', 'stats', 'skills', 'icon', 'custom']) assert.ok(HIDEABLE_KEYS.includes(k), k);
  assert.deepEqual([...BLOCK_KEYS].sort(), ['backstory', 'dislikes', 'likes', 'profile', 'quote', 'skills', 'stats', 'summary', 'tags']);
  assert.deepEqual(DEFAULT_LAYOUT, { info: ['profile', 'quote'], main: ['summary', 'stats', 'skills', 'tags', 'likes', 'dislikes', 'backstory'] });
  assert.deepEqual(PALETTE_TOKENS, ['bg', 'panel', 'text', 'muted', 'accent', 'title', 'line', 'chip']);
});

const V2_KEYS = ['labels', 'hidden', 'customFields', 'customBlocks', 'layout', 'palettes'];
const v1Only = () => Object.fromEntries(Object.entries(sampleCharacter()).filter(([k]) => !V2_KEYS.includes(k)));

test('AP-022 v1 data migrates to v2 defaults', () => {
  const v = normalizeCharacter(v1Only(), { genId: seqId() }).value;
  assert.deepEqual(v.labels, {});
  assert.deepEqual(v.hidden, []);
  assert.deepEqual(v.customFields, []);
  assert.deepEqual(v.customBlocks, []);
  assert.deepEqual(v.layout, DEFAULT_LAYOUT);
  assert.deepEqual(v.palettes, {});
});

test('AP-022 labels keep only known keys, trimmed and cut to 20', () => {
  const v = norm({ labels: { age: '  연령  ', name: '이름X', stats: 's'.repeat(25), bogus: 'x', skills: '', tags: 5, custom: '기타' } });
  assert.deepEqual(v.labels, { age: '연령', stats: 's'.repeat(20), custom: '기타' });
  assert.deepEqual(norm({ labels: 'oops' }).labels, {});
});

test('AP-022 hidden keeps hideable keys once and never name or art', () => {
  assert.deepEqual(norm({ hidden: ['quote', 'name', 'art', 'quote', 'stats', 'zzz', 3] }).hidden, ['quote', 'stats']);
  assert.deepEqual(norm({ hidden: 'quote' }).hidden, []);
});

test('AP-022 custom fields are filtered, cut, capped and get valid unique ids', () => {
  const fields = [
    { id: 'c-1', label: '무기', value: '은빛 단검' },
    { id: 'c-1', label: '좌우명', value: '끝까지' },
    { id: 'BAD ID', label: 'L'.repeat(30), value: 'V'.repeat(70) },
    { label: '', value: '' }, 'x', null,
    ...Array.from({ length: 8 }, (_, i) => ({ id: `f${i}`, label: `항목${i}`, value: 'v' })),
  ];
  const v = norm({ customFields: fields });
  assert.equal(v.customFields.length, 8);
  assert.deepEqual(v.customFields[0], { id: 'c-1', label: '무기', value: '은빛 단검' });
  assert.equal(v.customFields[1].label, '좌우명');
  assert.notEqual(v.customFields[1].id, 'c-1');
  assert.deepEqual(v.customFields[2], { id: v.customFields[2].id, label: 'L'.repeat(20), value: 'V'.repeat(60) });
  const ids = v.customFields.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]{1,24}$/);
});

test('AP-022 custom blocks are normalised by kind and capped at 12', () => {
  const blocks = [
    { id: 'b-1', kind: 'text', title: '메모', body: '줄1\n줄2', items: ['ignored'] },
    { id: 'b-2', kind: 'list', title: '소지품', items: ['등불', '', '지도', ...Array.from({ length: 12 }, () => 'i'.repeat(70))] },
    { id: 'b-3', kind: 'poster', title: 'T', body: 'B' },
    { id: 'b-4', kind: 'text', title: '', body: '', items: [] },
    ...Array.from({ length: 12 }, (_, i) => ({ id: `x${i}`, kind: 'text', title: `t${i}`, body: '' })),
  ];
  const v = norm({ customBlocks: blocks });
  assert.equal(v.customBlocks.length, 12);
  assert.deepEqual(v.customBlocks[0], { id: 'b-1', kind: 'text', title: '메모', body: '줄1\n줄2', items: [] });
  assert.equal(v.customBlocks[1].items.length, 10);
  assert.deepEqual(v.customBlocks[1].items.slice(0, 2), ['등불', '지도']);
  assert.equal(v.customBlocks[1].items[2], 'i'.repeat(60));
  assert.equal(v.customBlocks[2].kind, 'text');
  assert.ok(v.customBlocks.some((b) => b.id === 'b-4'), 'empty blocks are kept (rev.4)');
});

test('AP-022 layout drops unknown and duplicate entries and re-adds missing ones', () => {
  const v = norm({
    customBlocks: [{ id: 'b-1', kind: 'text', title: '메모', body: 'x' }, { id: 'b-2', kind: 'text', title: '노트', body: 'y' }],
    layout: { info: ['stats', 'b-1', 'nope', 'stats', 'b-gone'], main: ['b-1', 'quote', 'summary'] },
  });
  assert.deepEqual(v.layout.info, ['stats', 'b-1', 'profile']);
  assert.deepEqual(v.layout.main, ['quote', 'summary', 'skills', 'tags', 'likes', 'dislikes', 'backstory', 'b-2']);
  // rev.4: a broken layout falls back to the default order and still re-adds the sample's custom blocks.
  const broken = norm({ layout: 'x' });
  assert.deepEqual(broken.layout, { info: DEFAULT_LAYOUT.info, main: [...DEFAULT_LAYOUT.main, ...broken.customBlocks.map((b) => b.id)] });
});

test('AP-022 palettes keep known templates and tokens with valid colours', () => {
  const palettes = JSON.parse('{"clean":{"bg":"#ABCDEF","text":"red","glow":"#000000","__proto__":{"bg":"#000000"}},"vertical":{"accent":"#112233"},"fantasy":{"bg":"#000000"},"__proto__":{"bg":"#000000"}}');
  const v = norm({ palettes });
  assert.deepEqual(v.palettes, { clean: { bg: '#abcdef' }, vertical: { accent: '#112233' } });
  assert.equal({}.bg, undefined);
});

test('AP-022 normalisation is deterministic with an injected id generator and never throws', () => {
  const raw = { ...sampleCharacter(), customFields: [{ label: 'a', value: 'b' }], customBlocks: [{ kind: 'list', title: 't', items: ['x'] }] };
  const a = normalizeCharacter(raw, { genId: seqId() }).value;
  const b = normalizeCharacter(raw, { genId: seqId() }).value;
  assert.deepEqual(a, b);
  assert.equal(a.customFields[0].id, 'b-gen1');
  assert.ok(a.layout.main.includes(a.customBlocks[0].id));
  assert.doesNotThrow(() => normalizeCharacter({ ...sampleCharacter(), customBlocks: [{ items: 'x' }], layout: { info: null, main: 7 } }));
});

test('AP-022 reserved or colliding ids are reissued across fields and blocks', () => {
  const v = norm({
    customFields: [{ id: 'stats', label: 'a', value: 'b' }, { id: 'same', label: 'c', value: 'd' }],
    customBlocks: [{ id: 'same', kind: 'text', title: 't', body: 'x' }, { id: 'constructor', kind: 'text', title: 'u', body: 'y' }, { id: 'profile', kind: 'list', title: 'v', items: ['z'] }],
  });
  const ids = [...v.customFields.map((f) => f.id), ...v.customBlocks.map((b) => b.id)];
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(!['stats', 'constructor', 'profile'].includes(id), id);
  assert.equal(v.customFields[1].id, 'same');
  assert.notEqual(v.customBlocks[0].id, 'same');
  assert.ok(HIDEABLE_KEYS.includes('profile'));
});

test('AP-022 whitespace-only content counts as empty and list blocks drop their body', () => {
  const v = norm({
    customFields: [{ label: '   ', value: '  ' }, { label: ' 키워드 ', value: ' 값 ' }],
    customBlocks: [{ kind: 'list', title: '  ', body: 'ignored', items: ['  ', ' a '] }, { kind: 'text', title: ' ', body: '   ' }],
  });
  assert.deepEqual(v.customFields.map((f) => [f.label, f.value]), [['키워드', '값']]);
  assert.equal(v.customBlocks.length, 2, 'whitespace-only blocks are kept as empty blocks (rev.4)');
  assert.deepEqual([v.customBlocks[0].title, v.customBlocks[0].body, v.customBlocks[0].items], ['', '', ['a']]);
  assert.deepEqual([v.customBlocks[1].title, v.customBlocks[1].body], ['', '']);
});

test('AP-022 a non-object layout still keeps every custom block (rev.4)', () => {
  for (const layout of [undefined, null, 'x', [], 7]) {
    const v = norm({ customBlocks: [{ id: 'b-1', kind: 'text', title: 'x', body: '' }], layout });
    assert.deepEqual(v.layout.info, ['profile', 'quote'], String(layout));
    assert.equal(v.layout.main.at(-1), 'b-1', String(layout));
    assert.equal(v.layout.main.length, 8, String(layout));
  }
});
