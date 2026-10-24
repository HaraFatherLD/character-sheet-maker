// Design: classified case file. A manila folder with a tab on a dark desk, a ruled paper sheet in typewriter type, a paper-clipped photo,
// a rotated CLASSIFIED rubber stamp, caps form rows, black redaction bars as pure decoration (real values are never hidden) and an
// ability table with hatched bar fills. Paper content is 784 x 1170, blocks separated by 12px:
// head 100 / top 392 (422 with custom items) / summary <=138 / statement <=78 / table+skills flexible (>=216) / notes 118 (only with a backstory) / end 26.
// Optional fields this file cannot fit (likes, dislikes) are left out entirely. Every section title is an English caption plus the user's label.
import { h } from '../core/vnode.js';
import { FONT_MONO, cls, sheet, textField, fieldRow, customRows, tagList, statBars, skillList, artSlot, quoteBlock, sectionTitle } from './parts.js';

const META = { id: 'dossier', label: '기밀 문서', size: { w: 1000, h: 1414 }, defaultAccent: '#b3261e' };
const INK = '#1c1c1c';
const LABELS = { race: 'RACE 종족', role: 'ROLE 직무', age: 'AGE 나이', gender: 'SEX 성별', affiliation: 'UNIT 소속', height: 'HT. 키', birthday: 'D.O.B 생일' };
const CLIP = 'M14 60 L14 28 A8 8 0 0 1 30 28 L30 78 A12 12 0 0 1 6 78 L6 24 A14 14 0 0 1 34 24 L34 70';
const FIBER = 'repeating-linear-gradient(88deg,rgba(120,80,30,.06) 0 2px,rgba(0,0,0,0) 2px 7px)';

const css = `
.cs-dossier{font-family:${FONT_MONO};font-size:17px;color:${INK};text-shadow:0 0 1px rgba(0,0,0,.25);
background:repeating-linear-gradient(45deg,rgba(255,255,255,.018) 0 2px,rgba(0,0,0,0) 2px 7px),radial-gradient(ellipse at 50% 38%,#3d464f,#1b2025 82%)}
.cs-dossier .cs-folder{position:absolute;left:30px;top:74px;width:940px;height:1312px;border-radius:8px 22px 14px 14px;background:${FIBER},linear-gradient(172deg,#e8cf96,#d8b57a 55%,#c99f60);
box-shadow:0 14px 30px rgba(0,0,0,.55),inset 0 0 0 2px rgba(255,255,255,.2),inset 0 -8px 16px rgba(110,70,20,.3)}
.cs-dossier .cs-tab{position:absolute;left:62px;top:32px;width:350px;height:60px;display:flex;align-items:flex-start;justify-content:space-between;padding:10px 22px 0;
border-radius:16px 16px 0 0;background:${FIBER},linear-gradient(180deg,#efd9a4,#e7ce95 55%);box-shadow:inset 0 2px 0 rgba(255,255,255,.4),inset 2px 0 0 rgba(255,255,255,.2)}
.cs-dossier .cs-tab-k{font-size:20px;line-height:26px;font-weight:700;letter-spacing:.18em;color:#3a2a10}
.cs-dossier .cs-tab-n{font-size:16px;line-height:26px;font-weight:700;letter-spacing:.06em;color:var(--accent)}
.cs-dossier .cs-back{position:absolute;left:66px;top:104px;width:876px;height:1246px;background:#e9e4d0;transform:rotate(.6deg);box-shadow:0 2px 6px rgba(0,0,0,.25)}
.cs-dossier .cs-paper{position:absolute;isolation:isolate;left:62px;top:108px;width:876px;height:1244px;display:flex;flex-direction:column;gap:12px;padding:40px 46px 34px;box-shadow:0 6px 16px rgba(0,0,0,.3);
background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 27px,rgba(70,110,170,.13) 27px 28px),radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.8),rgba(255,255,255,0) 60%),linear-gradient(180deg,#fdfbf3,#f2eedd)}
.cs-dossier .cs-doc-head{flex:none;height:100px;display:flex;flex-direction:column;justify-content:space-between;padding-right:400px;overflow:hidden}
.cs-dossier .cs-doc-title{font-size:30px;line-height:36px;font-weight:700;letter-spacing:.14em;white-space:nowrap}
.cs-dossier .cs-doc-sub{font-size:15px;line-height:20px;letter-spacing:.08em;white-space:nowrap}
.cs-dossier .cs-barcode{width:230px;height:24px;background:repeating-linear-gradient(90deg,#151515 0 2px,rgba(0,0,0,0) 2px 5px,#151515 5px 6px,rgba(0,0,0,0) 6px 10px,#151515 10px 13px,rgba(0,0,0,0) 13px 15px)}
.cs-dossier .cs-paper::after{content:"CONFIDENTIAL";position:absolute;left:0;right:0;top:760px;z-index:-1;text-align:center;white-space:nowrap;pointer-events:none;
font-size:110px;line-height:1;font-weight:700;letter-spacing:.08em;color:var(--accent);opacity:.07;transform:rotate(-24deg);text-shadow:none}
.cs-dossier .cs-stamp{position:absolute;right:34px;top:34px;width:340px;display:flex;flex-direction:column;align-items:center;padding:6px 0 4px;white-space:nowrap;
border:5px double var(--accent);border-radius:8px;color:var(--accent);opacity:.78;transform:rotate(-8deg);text-shadow:none;
-webkit-mask-image:repeating-linear-gradient(100deg,#000 0 14px,rgba(0,0,0,.7) 14px 17px,#000 17px 40px)}
.cs-dossier .cs-stamp-en{font-size:42px;line-height:48px;font-weight:700;letter-spacing:.08em}
.cs-dossier .cs-stamp-ko{font-size:26px;line-height:30px;font-weight:700;letter-spacing:.5em;padding-left:.5em}
.cs-dossier .cs-section-title,.cs-dossier .cs-row .cs-label{display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:.12em}
.cs-dossier .cs-section-title{flex:none;height:22px;overflow:hidden;white-space:nowrap;font-size:14px;line-height:22px}
.cs-dossier .cs-section-title .cs-ko{min-width:0;overflow:hidden;text-overflow:ellipsis}
.cs-dossier .cs-section-title::after,.cs-dossier .cs-row .cs-label::after{content:"";flex:1;max-width:72px;height:12px;background:#151515}
.cs-dossier .cs-sec{display:flex;flex-direction:column;gap:6px;min-width:0;min-height:0;overflow:hidden}
.cs-dossier .cs-top{flex:none;height:392px;display:flex;gap:24px}
.cs-dossier .cs-top-x{height:422px}
.cs-dossier .cs-photo-col{position:relative;flex:0 0 300px}
.cs-dossier .cs-photo{position:absolute;left:12px;top:24px;width:276px;height:360px;padding:12px 12px 44px;background:#f8f6ee;transform:rotate(-3deg);box-shadow:0 8px 16px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.15)}
.cs-dossier .cs-art{width:100%;height:304px;border:1px solid #3a3a3a;background:#2a2a2a}
.cs-dossier .cs-art>*{filter:grayscale(.65) contrast(1.05)}
.cs-dossier .cs-cap{position:absolute;left:12px;right:12px;bottom:12px;height:20px;overflow:hidden;white-space:nowrap;font-size:13px;line-height:20px;letter-spacing:.1em;color:#333}
.cs-dossier .cs-clip{position:absolute;left:38px;top:-34px;width:34px;height:86px;transform:rotate(5deg);filter:drop-shadow(1px 2px 1px rgba(0,0,0,.35))}
.cs-dossier .cs-clip path{fill:none;stroke-linecap:round;stroke-linejoin:round}
.cs-dossier .cs-clip-a{stroke:#555b66;stroke-width:4}
.cs-dossier .cs-clip-b{stroke:#d5d9e0;stroke-width:1.5;transform:translate(-.9px,-.9px)}
.cs-dossier .cs-id-col{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:6px;overflow:hidden}
.cs-dossier .cs-name-wrap{flex:none;height:62px;display:flex;align-items:center;border-bottom:2px solid ${INK}}
.cs-dossier .cs-f-name{min-width:0;max-width:100%;font-size:52px;line-height:58px;font-weight:700}
.cs-dossier .cs-f-name.cs-n2{font-size:40px;line-height:56px}
.cs-dossier .cs-f-name.cs-n3{font-size:30px;line-height:40px}
.cs-dossier .cs-f-name.cs-n4{font-size:22px;line-height:26px}
.cs-dossier .cs-f-title{flex:none;font-size:19px;line-height:24px;font-style:italic}
.cs-dossier .cs-rows{flex:none;display:flex;flex-direction:column}
.cs-dossier .cs-row{height:30px;align-items:center;gap:8px;border-bottom:1px dashed rgba(0,0,0,.45)}
.cs-dossier .cs-row .cs-label{width:176px;overflow:hidden;white-space:nowrap;font-size:13px}
.cs-dossier .cs-row:nth-child(3n+2) .cs-label::after{max-width:46px}
.cs-dossier .cs-row:nth-child(3n) .cs-label::after{max-width:30px}
.cs-dossier .cs-row .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:18px;line-height:28px}
.cs-dossier .cs-extra{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:16px}
.cs-dossier .cs-extra .cs-row .cs-label{width:96px}
.cs-dossier .cs-sum{flex:none}
.cs-dossier .cs-f-summary{flex:none;font-size:16px;line-height:22px}
.cs-dossier .cs-f-summary.cs-roomy{font-size:18px;line-height:26px}
.cs-dossier .cs-stmt{flex:none}
.cs-dossier .cs-quote{flex:none;font-size:17px;line-height:25px;font-style:italic;color:#2a2a2a}
.cs-dossier .cs-bottom{flex:1 1 0;min-height:0;display:flex;gap:24px;overflow:hidden}
.cs-dossier .cs-stat-col{flex:1}
.cs-dossier .cs-skill-col{flex:0 0 320px}
.cs-dossier .cs-skill-col:only-child{flex:1 1 auto}
.cs-dossier .cs-stats-bars{flex:1 1 0;min-height:0;display:flex;flex-direction:column}
.cs-dossier .cs-stats-bars>.cs-section-title{height:30px;padding-bottom:6px;border-bottom:2px solid ${INK}}
.cs-dossier .cs-stat{flex:1 1 0;min-height:0;max-height:48px;gap:12px;border-bottom:1px solid rgba(0,0,0,.55)}
.cs-dossier .cs-stat-label{width:104px;flex:none;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;font-weight:700;letter-spacing:.04em}
.cs-dossier .cs-bar{height:16px;border:1px solid ${INK};background:repeating-linear-gradient(90deg,rgba(0,0,0,.16) 0 1px,rgba(0,0,0,0) 1px 10%)}
.cs-dossier .cs-bar-fill{background:repeating-linear-gradient(135deg,var(--accent) 0 4px,color-mix(in srgb,var(--accent) 55%,#fff) 4px 6px)}
.cs-dossier .cs-stat-value{width:84px;flex:none;min-width:0;font-size:16px;font-weight:700}
.cs-dossier .cs-tags{flex:none;height:26px;align-items:flex-start;align-content:flex-start;gap:6px;overflow:hidden}
.cs-dossier .cs-tag{max-width:100%;padding:1px 8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13px;line-height:18px;border:1px solid ${INK};background:#fffdf0}
.cs-dossier .cs-skills{flex:none;display:flex;flex-direction:column;gap:2px}
.cs-dossier .cs-skills-head{margin-bottom:4px}
.cs-dossier .cs-skill{display:flex;flex-direction:column;height:33px;min-width:0;overflow:hidden;padding-left:10px;border-left:4px solid var(--accent)}
.cs-dossier .cs-skill-name{flex:none;height:16px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px;line-height:16px;font-weight:700}
.cs-dossier .cs-skill-desc{flex:none;height:15px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:12px;line-height:15px;color:#444}
.cs-dossier .cs-notes{flex:none;height:118px}
.cs-dossier .cs-notes-text{flex:none;font-size:15px;line-height:21px}
.cs-dossier .cs-end{flex:none;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;letter-spacing:.34em;color:#444;border-top:2px dashed rgba(0,0,0,.45)}
`;

/** Decorative case number derived from the name (digits only). */
function caseNo(name) {
  const n = Array.from(name).reduce((acc, ch) => (acc * 31 + ch.codePointAt(0)) % 1000003, 7);
  return `${2000 + (n % 99)}-${String(n % 10000).padStart(4, '0')}`;
}

/** Section title: an English caption (decoration) plus the user's label for `key` as its own text node. Null when `key` is hidden. */
const heading = (vm, key, en) => (vm.isHidden(key) ? null
  : h('h3', { class: 'cs-section-title' }, h('span', { class: 'cs-en', 'aria-hidden': 'true' }, en), h('span', { class: 'cs-ko' }, vm.label(key))));

/** A titled section; null when none of `nodes` rendered (hidden or empty), so no title is left behind. `head` may be null. */
const sec = (extra, head, ...nodes) => (nodes.some(Boolean) ? h('section', { class: cls('cs-sec', extra) }, head, ...nodes) : null);
const nameTier = (name) => { const n = Array.from(name).length; return n <= 8 ? 1 : n <= 11 ? 2 : n <= 15 ? 3 : 4; };

const clip = () => h('svg', { class: 'cs-clip', viewBox: '0 0 40 100', 'aria-hidden': 'true' },
  h('path', { d: CLIP, class: 'cs-clip-a' }), h('path', { d: CLIP, class: 'cs-clip-b' }));

const stamp = () => h('span', { class: 'cs-stamp', 'aria-hidden': 'true' }, h('span', { class: 'cs-stamp-en' }, 'CLASSIFIED'), h('span', { class: 'cs-stamp-ko' }, '기밀'));

const docHead = (no) => h('header', { class: 'cs-doc-head' }, h('div', { class: 'cs-doc-title' }, 'PERSONNEL FILE'),
  h('div', { class: 'cs-doc-sub' }, `인물 기록부 · CASE NO. ${no}`), h('div', { class: 'cs-barcode', 'aria-hidden': 'true' }));

const photoCol = (vm, no) => h('div', { class: 'cs-photo-col' },
  h('div', { class: 'cs-photo' }, artSlot(vm), h('div', { class: 'cs-cap' }, `SUBJECT NO.${no}`), clip()));

/** Name, alias and the form rows. `extra` (custom item rows, at most two) share one line at the end of the form. */
function identity(vm, extra) {
  const tier = nameTier(vm.name);
  return h('div', { class: 'cs-id-col' },
    sectionTitle('NAME 성명'),
    h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls(tier === 4 ? 'cs-clamp-2' : 'cs-clamp-1', `cs-n${tier}`))),
    heading(vm, 'title', 'ALIAS'),
    textField(vm, 'title', 'div', 'cs-clamp-2'),
    h('div', { class: 'cs-rows' }, Object.keys(LABELS).map((key) => fieldRow(vm, key, LABELS[key])), extra.length ? h('div', { class: 'cs-extra' }, extra) : null));
}

/** Ability table (the stats marker holds its own title) with the tags below, and the skill column (title inside the skills marker). */
function bottom(vm) {
  const left = sec('cs-stat-col', null, statBars(vm, '', heading(vm, 'stats', 'ABILITY INDEX')), tagList(vm));
  const right = sec('cs-skill-col', null, skillList(vm, '', heading(vm, 'skills', 'SKILLS')));
  return left || right ? h('div', { class: 'cs-bottom' }, left, right) : null;
}

/** File notes: the section itself is the backstory marker, so the user's label and the text both sit inside it. Null when hidden or empty. */
function notes(vm) {
  if (vm.isHidden('backstory') || !vm.backstory) return null;
  return h('section', { class: 'cs-sec cs-notes cs-f-backstory' }, heading(vm, 'backstory', 'FILE NOTES'), h('p', { class: 'cs-text cs-notes-text cs-clamp-4' }, vm.backstory));
}

/**
 * Render the classified dossier.
 * @param {object} vm ViewModel from src/core/view-model.js
 * @returns {object} VNode
 */
function render(vm) {
  const no = caseNo(vm.name);
  const extra = customRows(vm).slice(0, 2);
  const hasNotes = !vm.isHidden('backstory') && Boolean(vm.backstory);
  return sheet(META, vm,
    h('div', { class: 'cs-folder' }),
    h('div', { class: 'cs-tab' }, h('span', { class: 'cs-tab-k' }, 'CASE FILE'), h('span', { class: 'cs-tab-n' }, `No.${no}`)),
    h('div', { class: 'cs-back' }),
    h('div', { class: 'cs-paper' },
      docHead(no),
      h('div', { class: cls('cs-top', extra.length && 'cs-top-x') }, photoCol(vm, no), identity(vm, extra)),
      sec('cs-sum', heading(vm, 'summary', 'SUMMARY'), textField(vm, 'summary', 'p', hasNotes ? 'cs-clamp-5' : 'cs-clamp-8 cs-roomy')),
      sec('cs-stmt', heading(vm, 'quote', 'STATEMENT'), quoteBlock(vm, 'cs-clamp-2')),
      bottom(vm),
      notes(vm),
      h('footer', { class: 'cs-end' }, 'END OF FILE'),
      stamp()));
}

export default { ...META, css, render };
