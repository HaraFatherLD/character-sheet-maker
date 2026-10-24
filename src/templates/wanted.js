// Design: old-west reward poster nailed to a plank wall. Torn parchment (clip-path), huge WANTED heading, sepia photo frame, giant name,
// accent reward band, a known-abilities list and a bounded record box. Paper content is 844 x 1278, blocks separated by 12px:
// heading 140 / dead-or-alive 44 / photo 420 / name 104 / alias 46 / reward 72 / info flexible (288) / quote 80.
// Optional fields this poster cannot fit (age, gender, height, birthday, likes, dislikes, skills) are left out entirely.
// The record box also holds the "known facts": at most two custom items on one line, plus a labelled backstory.
import { h } from '../core/vnode.js';
import { FONT_SERIF, cls, sheet, textField, fieldRow, customRows, tagList, statBars, artSlot, quoteBlock, sectionTitle } from './parts.js';

const META = { id: 'wanted', label: '현상수배 포스터', size: { w: 1000, h: 1414 }, defaultAccent: '#a3321f' };
const INK = '#2a170a';
const RED = 'color-mix(in srgb,var(--accent) 70%,#000)';
const RULE = 'color-mix(in srgb,var(--accent-ink) 55%,transparent)';

/** Torn paper outline: a deterministic jagged polygon (1-12px bites) so the CSS stays a static string. */
const TORN = (() => {
  let seed = 11;
  const jit = () => { seed = (seed * 48271) % 2147483647; return Math.round((1 + (seed % 110) / 10) * 10) / 10; };
  const ticks = Array.from({ length: 41 }, (_, i) => i * 2.5);
  const top = ticks.map((p) => `${p}% ${jit()}px`);
  const right = ticks.slice(1).map((p) => `calc(100% - ${jit()}px) ${p}%`);
  const bottom = ticks.slice(1).map((p) => `${100 - p}% calc(100% - ${jit()}px)`);
  const left = ticks.slice(1, 40).map((p) => `${jit()}px ${100 - p}%`);
  return `polygon(${[...top, ...right, ...bottom, ...left].join(',')})`;
})();

const css = `
.cs-wanted{font-family:${FONT_SERIF};color:${INK};background:repeating-linear-gradient(90deg,rgba(0,0,0,.5) 0 3px,rgba(0,0,0,0) 3px 166px),
repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 2px,rgba(0,0,0,.06) 2px 7px),linear-gradient(90deg,#4a3019,#5a3b1f 30%,#44291a 62%,#523520)}
.cs-wanted .cs-lift{position:absolute;inset:28px;filter:drop-shadow(5px 9px 8px rgba(0,0,0,.55))}
.cs-wanted .cs-paper{position:absolute;inset:0;display:flex;flex-direction:column;gap:12px;padding:44px 50px 36px;clip-path:${TORN};
background:radial-gradient(ellipse at 16% 10%,rgba(120,70,20,.22),rgba(120,70,20,0) 34%),radial-gradient(ellipse at 88% 82%,rgba(110,60,15,.26),rgba(110,60,15,0) 38%),
radial-gradient(circle at 80% 90%,rgba(0,0,0,0) 52px,rgba(100,55,15,.18) 54px,rgba(100,55,15,.1) 60px,rgba(0,0,0,0) 62px),
linear-gradient(180deg,rgba(0,0,0,0) 52%,rgba(80,45,10,.2) 52.2%,rgba(255,240,200,.3) 52.5%,rgba(0,0,0,0) 53%),
radial-gradient(ellipse at 50% 42%,rgba(255,240,190,.55),rgba(255,240,190,0) 62%),radial-gradient(ellipse at 50% 50%,rgba(90,50,10,0) 55%,rgba(90,50,10,.5) 100%),
repeating-linear-gradient(97deg,rgba(120,80,30,.06) 0 2px,rgba(0,0,0,0) 2px 9px),linear-gradient(165deg,#ead3a0,#dcbd80 55%,#cba466)}
.cs-wanted .cs-paper::before{content:"";position:absolute;inset:18px;border:3px double rgba(60,30,10,.75);pointer-events:none}
.cs-wanted .cs-nail{position:absolute;width:34px;height:34px;filter:drop-shadow(2px 3px 2px rgba(0,0,0,.5))}
.cs-wanted .cs-nail-tl{left:42px;top:42px}.cs-wanted .cs-nail-tr{right:42px;top:42px}
.cs-wanted .cs-nail-bl{left:42px;bottom:42px}.cs-wanted .cs-nail-br{right:42px;bottom:42px}
.cs-wanted .cs-wtitle{flex:none;height:140px;display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap;padding-left:.05em;
font-size:150px;line-height:140px;font-weight:900;letter-spacing:.05em;color:${INK};-webkit-text-stroke:3px ${INK};text-shadow:3px 4px 0 rgba(120,70,20,.35)}
.cs-wanted .cs-doa{flex:none;height:44px;display:flex;align-items:center;justify-content:center;gap:18px;overflow:hidden;white-space:nowrap}
.cs-wanted .cs-doa-rule{flex:1;min-width:20px;height:8px;border-top:3px solid ${INK};border-bottom:1px solid ${INK}}
.cs-wanted .cs-doa-ko{font-size:32px;line-height:44px;font-weight:900;letter-spacing:.12em;color:var(--accent)}
.cs-wanted .cs-doa-en{font-size:36px;line-height:44px;font-weight:900;letter-spacing:.24em}
.cs-wanted .cs-photo{position:relative;flex:none;align-self:center;width:600px;height:420px}
.cs-wanted .cs-art{position:absolute;inset:0;border:12px solid ${INK};background:#3a2410;box-shadow:0 0 0 3px #e9d4a0,0 0 0 6px ${INK},4px 6px 8px 0 rgba(50,25,5,.35)}
.cs-wanted .cs-art>*{filter:sepia(.9) contrast(1.08) brightness(.96)}
.cs-wanted .cs-glaze{position:absolute;inset:12px;pointer-events:none;box-shadow:inset 0 0 60px rgba(70,35,5,.6);background:linear-gradient(135deg,rgba(255,225,150,.16),rgba(90,45,10,.18))}
.cs-wanted .cs-name-wrap{flex:none;height:104px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.cs-wanted .cs-f-name{min-width:0;max-width:100%;text-align:center;font-size:108px;line-height:104px;font-weight:900;letter-spacing:.02em;color:${INK};-webkit-text-stroke:1.5px ${INK};text-shadow:2px 3px 0 rgba(120,70,20,.3)}
.cs-wanted .cs-f-name.cs-n2{font-size:88px}
.cs-wanted .cs-f-name.cs-n3{font-size:66px}
.cs-wanted .cs-f-name.cs-n4{font-size:45px}
.cs-wanted .cs-f-name.cs-n5{font-size:40px;line-height:44px}
.cs-wanted .cs-alias{flex:none;height:46px;display:flex;align-items:center;justify-content:center;gap:14px;overflow:hidden}
.cs-wanted .cs-alias-k{flex:none;font-size:20px;font-weight:700;letter-spacing:.14em;color:${RED}}
.cs-wanted .cs-f-title{min-width:0;max-width:700px;text-align:center;font-size:28px;line-height:34px;font-style:italic;font-weight:700;color:${RED}}
.cs-wanted .cs-f-title.cs-long{font-size:21px;line-height:22px}
.cs-wanted .cs-reward{flex:none;height:72px;display:flex;align-items:stretch;border:4px double ${INK};color:var(--accent-ink);overflow:hidden;
background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 88%,#000),color-mix(in srgb,var(--accent) 65%,#000));box-shadow:inset 0 0 0 2px rgba(255,236,190,.35),3px 4px 0 rgba(50,25,5,.35)}
.cs-wanted .cs-rw-lab,.cs-wanted .cs-rw-side{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 10px}
.cs-wanted .cs-rw-lab{width:210px;gap:2px;border-right:3px solid ${RULE}}
.cs-wanted .cs-rw-word{font-size:27px;line-height:30px;font-weight:900;letter-spacing:.2em;padding-left:.2em}
.cs-wanted .cs-aff{max-width:100%;min-width:0;justify-content:center;gap:6px;overflow:hidden;white-space:nowrap;font-size:14px;line-height:18px;letter-spacing:.04em}
.cs-wanted .cs-aff .cs-label{flex:none;max-width:45%;overflow:hidden;text-overflow:ellipsis;font-weight:900;opacity:.8}
.cs-wanted .cs-aff .cs-value{overflow:hidden;text-overflow:ellipsis}
.cs-wanted .cs-rw-main{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;padding:0 16px}
.cs-wanted .cs-f-role{max-width:100%;text-align:center;font-weight:900}
.cs-wanted .cs-r1{font-size:40px;line-height:44px}
.cs-wanted .cs-r2{font-size:31px;line-height:36px}
.cs-wanted .cs-r3{font-size:21px;line-height:24px}
.cs-wanted .cs-rw-side{width:200px;border-left:3px solid ${RULE}}
.cs-wanted .cs-rw-k{max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13px;line-height:16px;letter-spacing:.3em;opacity:.8}
.cs-wanted .cs-rw-side .cs-text{max-width:100%;text-align:center;font-size:20px;line-height:22px;font-weight:700}
.cs-wanted .cs-info{flex:1 1 0;min-height:0;display:flex;gap:20px}
.cs-wanted .cs-box{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden;border:3px solid ${INK};background:rgba(255,246,218,.38)}
.cs-wanted .cs-box-l{flex:0 0 392px}
.cs-wanted .cs-box-l:only-child{flex:1 1 auto}
.cs-wanted .cs-box-r{flex:1}
.cs-wanted .cs-section-title{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;height:34px;padding:0 14px;overflow:hidden;white-space:nowrap;font-size:17px;line-height:34px;font-weight:900;letter-spacing:.18em;color:#f4e4b8;background:${INK}}
.cs-wanted .cs-section-title .cs-en{min-width:0;overflow:hidden;text-overflow:ellipsis}
.cs-wanted .cs-section-title .cs-ko{flex:none;max-width:45%;overflow:hidden;text-overflow:ellipsis;font-size:15px;letter-spacing:.1em;color:#e0b878}
.cs-wanted .cs-box-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px 14px;overflow:hidden}
.cs-wanted .cs-abilities{flex:1;min-height:0;display:flex;flex-direction:column;padding-bottom:10px}
.cs-wanted .cs-abilities>.cs-section-title{margin-bottom:10px}
.cs-wanted .cs-stat{flex:1 1 0;min-height:0;max-height:42px;gap:10px;margin:0 14px;border-bottom:1px dotted rgba(60,30,10,.5)}
.cs-wanted .cs-stat-label{width:96px;flex:none;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:18px;font-weight:700}
.cs-wanted .cs-bar{height:14px;border:2px solid ${INK};background:repeating-linear-gradient(90deg,rgba(60,30,10,.1) 0 8px,rgba(0,0,0,0) 8px 16px)}
.cs-wanted .cs-bar-fill{background:repeating-linear-gradient(135deg,var(--accent) 0 5px,color-mix(in srgb,var(--accent) 70%,#000) 5px 10px)}
.cs-wanted .cs-stat-value{min-width:64px;font-size:18px;font-weight:900;color:${RED}}
.cs-wanted .cs-tags{flex:none;height:30px;align-items:flex-start;align-content:flex-start;gap:8px;overflow:hidden}
.cs-wanted .cs-box-l>.cs-tags{margin:0 14px 10px}
.cs-wanted .cs-box-l>.cs-tags:first-child{margin-top:10px}
.cs-wanted .cs-tag{max-width:100%;padding:2px 10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px;line-height:18px;font-weight:700;border:2px solid ${INK};background:rgba(255,246,218,.5)}
.cs-wanted .cs-f-summary{flex:none;font-size:17px;line-height:24px}
.cs-wanted .cs-f-summary.cs-roomy{font-size:19px;line-height:27px}
.cs-wanted .cs-back{flex:none;flex-direction:column;align-items:stretch;gap:2px}
.cs-wanted .cs-back .cs-label{font-size:13px;line-height:16px;font-weight:900;letter-spacing:.2em;color:${RED}}
.cs-wanted .cs-back .cs-value{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden;font-size:15px;line-height:21px;color:#4a2f18}
.cs-wanted .cs-back.cs-short .cs-value{-webkit-line-clamp:3}
.cs-wanted .cs-facts{flex:none;margin-top:auto;display:flex;gap:16px;padding-top:6px;border-top:1px dotted rgba(60,30,10,.5)}
.cs-wanted .cs-fact{flex:1 1 0;min-width:0;gap:8px;align-items:baseline;overflow:hidden;white-space:nowrap}
.cs-wanted .cs-fact .cs-label{flex:none;max-width:45%;overflow:hidden;text-overflow:ellipsis;font-size:13px;font-weight:900;letter-spacing:.12em;color:${RED}}
.cs-wanted .cs-fact .cs-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:16px;font-weight:700;font-style:italic}
.cs-wanted .cs-qstrip{position:relative;flex:none;height:80px;display:flex;align-items:center;justify-content:center;padding:0 56px;border-top:3px double ${INK};border-bottom:3px double ${INK}}
.cs-wanted .cs-qstrip::before,.cs-wanted .cs-qstrip::after{position:absolute;top:-2px;font-size:54px;line-height:1;color:var(--accent);opacity:.8}
.cs-wanted .cs-qstrip::before{content:"“";left:14px}
.cs-wanted .cs-qstrip::after{content:"”";right:14px}
.cs-wanted .cs-quote{font-size:19px;line-height:23px;font-style:italic;text-align:center;color:#3a2410}
`;

const nail = (pos) => h('svg', { class: `cs-nail cs-nail-${pos}`, viewBox: '0 0 34 34', 'aria-hidden': 'true' },
  h('circle', { cx: 17, cy: 17, r: 14, fill: '#2a1d12' }),
  h('circle', { cx: 17, cy: 17, r: 11, fill: '#6b5844', stroke: '#1d140c', 'stroke-width': 2 }),
  h('circle', { cx: 17, cy: 17, r: 7, fill: '#9a8769' }),
  h('circle', { cx: 14.5, cy: 14.5, r: 3, fill: '#efe3c8', opacity: 0.85 }));

const dead = () => h('div', { class: 'cs-doa', 'aria-hidden': 'true' }, h('span', { class: 'cs-doa-rule' }), h('span', { class: 'cs-doa-ko' }, '생사불문'),
  h('span', { class: 'cs-doa-en' }, 'DEAD OR ALIVE'), h('span', { class: 'cs-doa-rule' }));

const photo = (vm) => h('div', { class: 'cs-photo' }, artSlot(vm), h('div', { class: 'cs-glaze', 'aria-hidden': 'true' }));

const nameTier = (name) => { const n = Array.from(name).length; return n <= 7 ? 1 : n <= 9 ? 2 : n <= 12 ? 3 : n <= 18 ? 4 : 5; };

function nameBlock(vm) {
  const tier = nameTier(vm.name);
  return h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls(tier === 5 ? 'cs-clamp-2' : 'cs-clamp-1', `cs-n${tier}`)));
}

/** Title bar: an English caption (decoration) plus the user's label for `key` as its own text node. Null when `key` is hidden. */
const heading = (vm, key, en) => (vm.isHidden(key) ? null
  : h('h3', { class: 'cs-section-title' }, h('span', { class: 'cs-en', 'aria-hidden': 'true' }, en), h('span', { class: 'cs-ko' }, vm.label(key))));

/** The a.k.a. line; null (so the info area grows) when the title is hidden. */
function alias(vm) {
  const long = Array.from(vm.title).length > 24;
  const title = textField(vm, 'title', 'div', long ? 'cs-clamp-2 cs-long' : 'cs-clamp-1');
  return title ? h('div', { class: 'cs-alias' }, h('span', { class: 'cs-alias-k' }, 'a.k.a.'), title) : null;
}

/** Accent band: fixed REWARD word (+ labelled affiliation), the role as the "amount", and the race with its label. */
function reward(vm) {
  const n = Array.from(vm.role).length;
  const race = textField(vm, 'race', 'span', 'cs-clamp-2');
  return h('div', { class: 'cs-reward' },
    h('div', { class: 'cs-rw-lab' }, h('span', { class: 'cs-rw-word' }, 'REWARD'), fieldRow(vm, 'affiliation', vm.label('affiliation'), 'cs-aff')),
    h('div', { class: 'cs-rw-main' }, textField(vm, 'role', 'div', n <= 9 ? 'cs-r1' : n <= 12 ? 'cs-r2' : 'cs-r3 cs-clamp-2')),
    race ? h('div', { class: 'cs-rw-side' }, h('span', { class: 'cs-rw-k' }, vm.label('race')), race) : null);
}

/** Left box: the stats marker holds the title bar (caption + the user's label) and the rows; tags sit below. */
function abilityBox(vm) {
  const stats = statBars(vm, 'cs-abilities', heading(vm, 'stats', 'KNOWN ABILITIES'));
  const tags = tagList(vm);
  return stats || tags ? h('section', { class: 'cs-box cs-box-l' }, stats, tags) : null;
}

/** Right box: summary, a labelled backstory and the custom "known facts" line. Fewer lines are kept when more of them are shown. */
function recordBox(vm) {
  const facts = customRows(vm, 'cs-fact').slice(0, 2);
  const back = fieldRow(vm, 'backstory', vm.label('backstory'), facts.length ? 'cs-back cs-short' : 'cs-back');
  const roomy = facts.length ? 'cs-clamp-6 cs-roomy' : 'cs-clamp-8 cs-roomy';
  const summary = textField(vm, 'summary', 'p', back ? (facts.length ? 'cs-clamp-3' : 'cs-clamp-4') : roomy);
  if (!summary && !back && !facts.length) return null;
  return h('section', { class: 'cs-box cs-box-r' }, sectionTitle('CRIMES / RECORD'),
    h('div', { class: 'cs-box-body' }, summary, back, facts.length ? h('div', { class: 'cs-facts' }, facts) : null));
}

function info(vm) {
  const boxes = [abilityBox(vm), recordBox(vm)].filter(Boolean);
  return boxes.length ? h('div', { class: 'cs-info' }, boxes) : null;
}

/**
 * Render the wanted poster.
 * @param {object} vm ViewModel from src/core/view-model.js
 * @returns {object} VNode
 */
function render(vm) {
  const quote = quoteBlock(vm, 'cs-clamp-3');
  return sheet(META, vm,
    h('div', { class: 'cs-lift' }, h('div', { class: 'cs-paper' },
      h('div', { class: 'cs-wtitle' }, 'WANTED'), dead(), photo(vm), nameBlock(vm), alias(vm), reward(vm), info(vm),
      quote ? h('div', { class: 'cs-qstrip' }, quote) : null)),
    ['tl', 'tr', 'bl', 'br'].map(nail));
}

export default { ...META, css, render };
