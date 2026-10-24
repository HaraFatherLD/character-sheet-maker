import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCharacter, DEFAULT_STAT_LABELS, DEFAULT_LAYOUT } from '../src/core/schema.js';

// v2 fields that normalisation always fills in for v1-shaped input.
const V2_DEFAULTS = () => ({ labels: {}, hidden: [], customFields: [], customBlocks: [], layout: structuredClone(DEFAULT_LAYOUT), palettes: {}, artUrl: '', iconUrl: '', sheetWidths: {} });

const base = () => ({
  template: 'scifi', accentColor: '#3366ff', statMode: 'trpg',
  name: '세라 윈드', title: '바람의 기록자', age: '24', gender: '여성', race: '인간', role: '정찰병',
  affiliation: '하늘 항로 길드', height: '168cm', birthday: '3월 14일', quote: '바람이 길을 알려줄 거야.',
  likes: '지도, 차', dislikes: '좁은 곳', summary: '하늘 항로를 기록하는 정찰병.', backstory: '어린 시절 비행선에서 자랐다.',
  tags: ['침착함', '호기심'],
  stats: DEFAULT_STAT_LABELS.map((label, i) => ({ label, percent: 40 + i, score: 10 + i })),
  skills: [{ name: '순풍', desc: '아군의 이동을 돕는다.' }],
  art: { fit: 'contain', focusX: 20, focusY: 80 },
});

test('AP-002 non-object input is rejected without throwing', () => {
  for (const raw of [null, undefined, [], 'x', 1]) {
    let res;
    assert.doesNotThrow(() => { res = normalizeCharacter(raw); });
    assert.equal(res.ok, false);
    assert.equal(typeof res.error, 'string');
  }
});

test('AP-002 valid input round-trips unchanged', () => {
  assert.deepEqual(normalizeCharacter(base()).value, { ...base(), ...V2_DEFAULTS() });
});

test('AP-002 non-string text fields are rejected; missing text becomes empty', () => {
  for (const key of ['name', 'quote', 'backstory']) assert.equal(normalizeCharacter({ ...base(), [key]: 7 }).ok, false, key);
  const raw = base();
  delete raw.affiliation;
  assert.equal(normalizeCharacter(raw).value.affiliation, '');
  const nulled = normalizeCharacter({ ...base(), height: null, likes: undefined });
  assert.equal(nulled.ok, true);
  assert.equal(nulled.value.height, '');
  assert.equal(nulled.value.likes, '');
});

test('AP-002 stat numbers must be real numbers; numeric strings and non-objects use defaults', () => {
  const stats = [{ label: 'A', percent: '80', score: '15' }, 'bad', { label: 'C', percent: Infinity, score: -Infinity }];
  const res = normalizeCharacter({ ...base(), stats }).value.stats;
  assert.deepEqual(res[0], { label: 'A', percent: 50, score: 10 });
  assert.deepEqual(res[1], { label: DEFAULT_STAT_LABELS[1], percent: 50, score: 10 });
  assert.deepEqual(res[2], { label: 'C', percent: 50, score: 10 });
});

test('AP-002 text is cut by code points at the field limit', () => {
  const res = normalizeCharacter({ ...base(), name: '🐉'.repeat(50), backstory: '가'.repeat(1600) });
  assert.equal(res.value.name, '🐉'.repeat(40));
  assert.equal(res.value.backstory, '가'.repeat(1500));
});

test('AP-002 template, accent colour and stat mode fall back or normalise', () => {
  const res = normalizeCharacter({ ...base(), template: 'poster', accentColor: 'blue', statMode: 'dice' });
  assert.equal(res.value.template, 'fantasy');
  assert.equal(res.value.accentColor, '');
  assert.equal(res.value.statMode, 'percent');
  assert.equal(normalizeCharacter({ ...base(), accentColor: '#AbCdEf' }).value.accentColor, '#abcdef');
});

test('AP-002 tags are trimmed, filtered, cut to 16 and capped at 8', () => {
  const tags = ['  용감함  ', '', '   ', 3, 'x'.repeat(20), 'a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const res = normalizeCharacter({ ...base(), tags });
  assert.deepEqual(res.value.tags, ['용감함', 'x'.repeat(16), 'a', 'b', 'c', 'd', 'e', 'f']);
  assert.deepEqual(normalizeCharacter({ ...base(), tags: 'oops' }).value.tags, []);
});

test('AP-002 stats always become exactly six clamped entries', () => {
  const defaults = DEFAULT_STAT_LABELS.map((label) => ({ label, percent: 50, score: 10 }));
  assert.deepEqual(normalizeCharacter({ ...base(), stats: [] }).value.stats, defaults);
  assert.deepEqual(normalizeCharacter({ ...base(), stats: 'x' }).value.stats, defaults);
  const three = normalizeCharacter({ ...base(), stats: [{ label: 'A', percent: 1, score: 2 }, {}, null] }).value.stats;
  assert.equal(three.length, 6);
  assert.deepEqual(three[0], { label: 'A', percent: 1, score: 2 });
  assert.deepEqual(three[1], { label: DEFAULT_STAT_LABELS[1], percent: 50, score: 10 });
  assert.deepEqual(three[5], defaults[5]);
  const nine = Array.from({ length: 9 }, () => ({ label: 'L', percent: 10, score: 5 }));
  assert.equal(normalizeCharacter({ ...base(), stats: nine }).value.stats.length, 6);
  const odd = normalizeCharacter({ ...base(), stats: [{ label: 5, percent: 72.6, score: 99 }, { label: 'x'.repeat(20), percent: -3, score: 0 }, { label: 'N', percent: NaN, score: 'abc' }] }).value.stats;
  assert.deepEqual(odd[0], { label: DEFAULT_STAT_LABELS[0], percent: 73, score: 30 });
  assert.deepEqual(odd[1], { label: 'x'.repeat(12), percent: 0, score: 1 });
  assert.deepEqual(odd[2], { label: 'N', percent: 50, score: 10 });
});

test('AP-002 skills are capped at six and empty or invalid entries dropped', () => {
  const skills = [{ name: '', desc: '' }, 'bad', null, ...Array.from({ length: 8 }, (_, i) => ({ name: `S${i}`, desc: 'd' }))];
  const res = normalizeCharacter({ ...base(), skills });
  assert.equal(res.value.skills.length, 6);
  assert.deepEqual(res.value.skills[0], { name: 'S0', desc: 'd' });
  assert.deepEqual(normalizeCharacter({ ...base(), skills: [{ name: 'n'.repeat(40), desc: 'd'.repeat(200) }] }).value.skills[0],
    { name: 'n'.repeat(30), desc: 'd'.repeat(120) });
  assert.deepEqual(normalizeCharacter({ ...base(), skills: {} }).value.skills, []);
});

test('AP-002 art settings are validated and clamped', () => {
  assert.deepEqual(normalizeCharacter({ ...base(), art: { fit: 'stretch', focusX: 150, focusY: -10 } }).value.art, { fit: 'cover', focusX: 100, focusY: 0 });
  assert.deepEqual(normalizeCharacter({ ...base(), art: 'x' }).value.art, { fit: 'cover', focusX: 50, focusY: 30 });
  assert.deepEqual(normalizeCharacter({ ...base(), art: { fit: 'contain', focusX: 33.4, focusY: 'a' } }).value.art, { fit: 'contain', focusX: 33, focusY: 30 });
});

test('AP-002 unknown and prototype keys are dropped without pollution; input untouched', () => {
  const raw = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"x":1},"extra":1,"name":"이름","stats":[{"__proto__":{"evil":1},"label":"A","percent":5,"score":5}]}');
  const snap = JSON.stringify(raw);
  const res = normalizeCharacter(raw);
  assert.equal(res.ok, true);
  assert.equal(Object.getPrototypeOf(res.value), Object.prototype);
  assert.equal({}.polluted, undefined);
  assert.equal({}.evil, undefined);
  assert.ok(!Object.hasOwn(res.value, 'extra'));
  assert.ok(!Object.hasOwn(res.value, 'constructor'));
  assert.deepEqual(Object.keys(res.value.stats[0]).sort(), ['label', 'percent', 'score']);
  assert.equal(JSON.stringify(raw), snap);
});
