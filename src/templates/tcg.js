// Design: collectible trading card. A metallic accent frame around a dark bevelled face: name plate with a level gem, art window,
// type line, rules text box, 3x2 stat boxes and a rarity star row, all under a faint holographic sheen.
// Face content is 658 x 962: head 66 / art 372 / type 34 / text box flexible (314) / stats 112 / foot 24, separated by 8px.
// Optional fields this card cannot fit (age, gender, height, birthday, likes, dislikes, backstory) are left out entirely.
// The foot line (like the illustrator line of a real card) carries the affiliation and at most two custom items.
import { h } from '../core/vnode.js';
import { FONT_SANS, FONT_SERIF, cls, sheet, textField, fieldRows, customRows, tagList, statBars, skillList, artSlot, iconSlot, quoteBlock, sectionLabel } from './parts.js';

const META = { id: 'tcg', label: '트레이딩 카드', size: { w: 750, h: 1050 }, defaultAccent: '#e0a02a' };
const EDGE = 'color-mix(in srgb,var(--accent) 55%,#2a1c06)';
const GOLD = 'color-mix(in srgb,var(--accent) 55%,#fff)';
const PLATE = 'linear-gradient(180deg,#fcf6e2,#e6d9b4)';
const BEVEL = 'inset 0 0 0 1px rgba(255,255,255,.85),inset 0 -4px 8px rgba(130,95,30,.25),0 3px 0 rgba(0,0,0,.45)';

const css = `
.cs-tcg{font-family:${FONT_SANS};font-size:15px;color:#2a2112;background:radial-gradient(ellipse at 50% 28%,color-mix(in srgb,var(--accent) 20%,#1f1a2a),#0a0910 78%)}
.cs-tcg .cs-card{position:absolute;left:8px;top:8px;width:734px;height:1034px;border-radius:38px;
background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 40%,#fff),var(--accent) 24%,color-mix(in srgb,var(--accent) 58%,#000) 50%,var(--accent) 74%,color-mix(in srgb,var(--accent) 45%,#fff));
box-shadow:inset 0 0 0 2px rgba(255,255,255,.55),inset 0 0 0 5px color-mix(in srgb,var(--accent) 45%,#000),0 8px 26px rgba(0,0,0,.6)}
.cs-tcg .cs-face{position:absolute;left:22px;top:22px;right:22px;bottom:22px;display:flex;flex-direction:column;gap:8px;padding:10px 12px;border:4px solid;
border-color:rgba(255,255,255,.7) rgba(0,0,0,.55) rgba(0,0,0,.55) rgba(255,255,255,.7);border-radius:18px;
background:radial-gradient(ellipse at 50% 0%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 55%),linear-gradient(180deg,#252131,#120f19);
box-shadow:0 0 0 2px rgba(0,0,0,.5),0 0 0 4px rgba(255,255,255,.28),inset 0 0 24px rgba(0,0,0,.6)}
.cs-tcg .cs-head,.cs-tcg .cs-type{flex:none;display:flex;align-items:center;border:2px solid ${EDGE};background:${PLATE};box-shadow:${BEVEL}}
.cs-tcg .cs-head{height:66px;gap:12px;padding:5px 10px 5px 16px;border-radius:14px}
.cs-tcg .cs-head-text{flex:1;min-width:0}
.cs-tcg .cs-name-wrap{height:34px;display:flex;align-items:center}
.cs-tcg .cs-f-name{min-width:0;max-width:100%;font-family:${FONT_SERIF};font-size:30px;line-height:34px;font-weight:700;letter-spacing:.02em;color:#2a1c06}
.cs-tcg .cs-f-name.cs-n2{font-size:22px;line-height:30px}
.cs-tcg .cs-f-name.cs-n3{font-size:15px;line-height:17px;letter-spacing:0}
.cs-tcg .cs-f-title{height:17px;font-size:12.5px;line-height:17px;font-style:italic;letter-spacing:.03em;color:color-mix(in srgb,var(--accent) 55%,#3a2808)}
.cs-tcg .cs-gem{flex:none;width:52px;height:52px;border-radius:50%;color:var(--accent-ink);font-size:28px;text-shadow:none;
background:radial-gradient(circle at 34% 28%,color-mix(in srgb,var(--accent) 35%,#fff),var(--accent) 52%,color-mix(in srgb,var(--accent) 55%,#000));
box-shadow:0 0 0 2px #fcf6e2,0 0 0 4px ${EDGE},inset 0 -5px 9px rgba(0,0,0,.35),inset 0 4px 6px rgba(255,255,255,.55)}
.cs-tcg .cs-art-wrap{position:relative;flex:none;height:372px}
.cs-tcg .cs-art{position:absolute;inset:0;border-radius:10px;background:#0c0a12;box-shadow:0 0 0 2px #0b0910,0 0 0 4px ${GOLD},0 0 0 6px #0b0910}
.cs-tcg .cs-art-fx{position:absolute;inset:0;border-radius:10px;pointer-events:none;box-shadow:inset 0 0 38px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.22)}
.cs-tcg .cs-tags{position:absolute;left:12px;right:12px;bottom:12px;height:24px;align-items:flex-start;align-content:flex-start;gap:6px;overflow:hidden}
.cs-tcg .cs-tag{max-width:100%;padding:1px 10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:12px;line-height:18px;color:#fff;border:1px solid ${GOLD};border-radius:999px;background:rgba(12,10,18,.74)}
.cs-tcg .cs-type{height:34px;justify-content:space-between;gap:10px;padding:0 14px;border-radius:9px}
.cs-tcg .cs-type-text{flex:1;min-width:0;display:flex;align-items:center;gap:8px;font-family:${FONT_SERIF};font-size:17px;line-height:28px;font-weight:700;color:#2a1c06}
.cs-tcg .cs-type-text .cs-text{min-width:0;max-width:46%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-tcg .cs-dot{flex:none;color:color-mix(in srgb,var(--accent) 60%,#4a2a00)}
.cs-tcg .cs-set{flex:none;width:22px;height:22px;color:var(--accent)}
.cs-tcg .cs-text-box{flex:1 1 0;min-height:0;display:flex;flex-direction:column;justify-content:space-between;gap:6px;padding:8px 14px;overflow:hidden;border:2px solid ${EDGE};border-radius:12px;
background:linear-gradient(180deg,#f7f0da,#e8dcbb);box-shadow:inset 0 0 0 1px rgba(255,255,255,.8),inset 0 0 18px rgba(140,105,40,.25)}
.cs-tcg .cs-f-summary{flex:none;font-size:15px;line-height:21px}
.cs-tcg .cs-f-summary.cs-roomy{font-size:17px;line-height:25px}
.cs-tcg .cs-skills{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:4px 14px}
.cs-tcg .cs-skills-head{grid-column:1 / -1}
.cs-tcg .cs-section-title{display:flex;align-items:center;gap:8px;height:14px;overflow:hidden;white-space:nowrap;font-size:11px;line-height:14px;font-weight:700;letter-spacing:.22em;color:color-mix(in srgb,var(--accent) 50%,#3a2808)}
.cs-tcg .cs-section-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,currentColor,transparent);opacity:.5}
.cs-tcg .cs-skill{display:flex;flex-direction:column;height:46px;min-width:0;overflow:hidden;padding-left:9px;border-left:3px solid var(--accent)}
.cs-tcg .cs-skill-name{flex:none;height:16px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13.5px;line-height:16px;font-weight:700;color:color-mix(in srgb,var(--accent) 50%,#3a2808)}
.cs-tcg .cs-skill-desc{flex:none;height:30px;overflow:hidden;font-size:12px;line-height:15px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
.cs-tcg .cs-flavor{position:relative;flex:none;padding:5px 0 0 26px;border-top:1px solid rgba(110,80,30,.4)}
.cs-tcg .cs-flavor::before{content:"“";position:absolute;left:2px;top:-2px;font-family:${FONT_SERIF};font-size:42px;line-height:1;color:var(--accent)}
.cs-tcg .cs-quote{font-size:14px;line-height:19px;font-style:italic;color:#4a3a1c}
.cs-tcg .cs-stats-grid{flex:none;height:112px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:14px repeat(2,minmax(0,1fr));gap:4px 6px}
.cs-tcg .cs-stats-grid>.cs-section-title{grid-column:1 / -1;color:${GOLD}}
.cs-tcg .cs-stat{position:relative;justify-content:space-between;gap:8px;min-width:0;padding:0 11px 9px;border:1px solid color-mix(in srgb,var(--accent) 60%,transparent);border-radius:9px;
background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.04));box-shadow:inset 0 1px 0 rgba(255,255,255,.22)}
.cs-tcg .cs-stat-label{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13px;letter-spacing:.06em;color:${GOLD}}
.cs-tcg .cs-stat-value{flex:none;min-width:0;font-family:${FONT_SERIF};font-size:21px;font-weight:700;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.cs-tcg .cs-bar{position:absolute;left:11px;right:11px;bottom:6px;flex:none;height:5px;border-radius:3px;background:rgba(0,0,0,.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.cs-tcg .cs-bar-fill{border-radius:3px;background:linear-gradient(90deg,${GOLD},var(--accent))}
.cs-tcg .cs-foot{flex:none;height:24px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 6px;color:${GOLD}}
.cs-tcg .cs-stars{flex:none;width:108px;height:18px}
.cs-tcg .cs-info{flex:1;min-width:0;display:flex;justify-content:flex-end;gap:14px}
.cs-tcg .cs-info .cs-row{flex:0 1 auto;min-width:0;gap:6px;overflow:hidden;white-space:nowrap;font-size:12px;line-height:24px;letter-spacing:.04em}
.cs-tcg .cs-info .cs-label{max-width:6em;overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:700;color:${GOLD}}
.cs-tcg .cs-info .cs-value{overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.72)}
.cs-tcg .cs-sheen{position:absolute;left:8px;top:8px;width:734px;height:1034px;border-radius:38px;pointer-events:none;
background:linear-gradient(115deg,rgba(255,255,255,0) 16%,rgba(255,255,255,.1) 28%,rgba(110,255,220,.13) 36%,rgba(255,130,225,.13) 44%,rgba(255,236,120,.14) 52%,rgba(120,160,255,.13) 60%,rgba(255,255,255,.08) 70%,rgba(255,255,255,0) 82%),
repeating-linear-gradient(115deg,rgba(255,255,255,.04) 0 2px,rgba(255,255,255,0) 2px 8px)}
`;

/** Points of a five-pointed star centred on (cx, cy). */
function starPoints(cx, cy, outer, inner) {
  const dot = (i) => {
    const angle = ((-90 + i * 36) * Math.PI) / 180;
    const r = i % 2 ? inner : outer;
    return `${Math.round((cx + Math.cos(angle) * r) * 10) / 10},${Math.round((cy + Math.sin(angle) * r) * 10) / 10}`;
  };
  return Array.from({ length: 10 }, (_, i) => dot(i)).join(' ');
}

/** Rarity row: 1-5 lit stars, scaled from the average stat ratio (purely decorative). */
function rarity(vm) {
  const avg = vm.stats.reduce((sum, stat) => sum + stat.ratio, 0) / vm.stats.length;
  const lit = Math.max(1, Math.min(5, Math.round(avg * 5)));
  const points = starPoints(10, 10.5, 9, 3.8);
  return h('svg', { class: 'cs-stars', viewBox: '0 0 108 20', 'aria-hidden': 'true' },
    [0, 1, 2, 3, 4].map((i) => h('polygon', { points, transform: `translate(${i * 22} 0)`, fill: 'currentColor', opacity: i < lit ? 1 : 0.28 })));
}

const setMark = () => h('svg', { class: 'cs-set', viewBox: '0 0 24 24', 'aria-hidden': 'true' },
  h('polygon', { points: '12,1 23,12 12,23 1,12', fill: 'currentColor' }), h('polygon', { points: starPoints(12, 12.4, 6.5, 2.7), fill: '#fcf6e2' }));

const nameTier = (name) => { const n = Array.from(name).length; return n <= 16 ? 1 : n <= 24 ? 2 : 3; };

function head(vm) {
  const tier = nameTier(vm.name);
  return h('header', { class: 'cs-head' },
    h('div', { class: 'cs-head-text' },
      h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls(tier === 3 ? 'cs-clamp-2' : 'cs-clamp-1', `cs-n${tier}`))),
      textField(vm, 'title', 'div', 'cs-clamp-1')),
    iconSlot(vm, 'cs-gem'));
}

/** Race and role on one plate; the dot only between two shown parts, and no plate at all when both are hidden. */
function typeLine(vm) {
  const race = textField(vm, 'race', 'span');
  const role = textField(vm, 'role', 'span');
  if (!race && !role) return null;
  return h('div', { class: 'cs-type' }, h('div', { class: 'cs-type-text' }, race, race && role ? h('span', { class: 'cs-dot' }, '·') : null, role), setMark());
}

/** Summary gets more lines (and a bigger font when there are no skills) as the skill grid needs fewer rows (index = rows of 2 skills). The last entry leaves room for the skills label. */
const SUMMARY_CLAMP = ['cs-clamp-8 cs-roomy', 'cs-clamp-6', 'cs-clamp-5', 'cs-clamp-3'];

/** The rules box: summary, skills (label inside the skills marker) and the flavor quote. Null when all three are hidden or empty. */
function textBox(vm) {
  const rows = vm.isHidden('skills') ? 0 : Math.ceil(vm.skills.length / 2);
  const quote = quoteBlock(vm, 'cs-clamp-2');
  const parts = [textField(vm, 'summary', 'p', SUMMARY_CLAMP[rows]), skillList(vm, '', sectionLabel(vm, 'skills')), quote ? h('div', { class: 'cs-flavor' }, quote) : null].filter(Boolean);
  return parts.length ? h('section', { class: 'cs-text-box' }, parts) : null;
}

/** Rarity stars, then the affiliation (with its label) and up to two custom items as compact rows. */
function foot(vm) {
  const items = [...fieldRows(vm, ['affiliation']), ...customRows(vm).slice(0, 2)].filter(Boolean);
  return h('footer', { class: 'cs-foot' }, rarity(vm), items.length ? h('div', { class: 'cs-info' }, items) : null);
}

/**
 * Render the trading card.
 * @param {object} vm ViewModel from src/core/view-model.js
 * @returns {object} VNode
 */
function render(vm) {
  return sheet(META, vm,
    h('div', { class: 'cs-card' }, h('div', { class: 'cs-face' },
      head(vm),
      h('div', { class: 'cs-art-wrap' }, artSlot(vm), h('div', { class: 'cs-art-fx', 'aria-hidden': 'true' }), tagList(vm)),
      typeLine(vm), textBox(vm), statBars(vm, 'cs-stats-grid', sectionLabel(vm, 'stats')), foot(vm))),
    h('div', { class: 'cs-sheen', 'aria-hidden': 'true' }));
}

export default { ...META, css, render };
