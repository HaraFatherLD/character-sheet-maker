// Design: watercolour storybook page (1000x1414). Cream paper with blurred pastel blots, an svg vine border, a ribbon title,
// a blob-framed portrait, a cloud quote bubble, a sticker strip for custom items, story text, heart-row stats and soft pastel notes.
// Fixed rows, flexible story. A hidden item drops its whole section, decoration included.
import { h } from '../core/vnode.js';
import { FONT_SERIF, sheet, textField, fieldRows, customRows, tagList, skillList, artSlot, quoteBlock, sectionLabel } from './parts.js';

const META = { id: 'storybook', label: '수채화 동화책', size: { w: 1000, h: 1414 }, defaultAccent: '#4f9d8a' };

const css = `
.cs-storybook{--ink:#4a3b2a;--deep:color-mix(in srgb,var(--accent) 62%,#3b2a1a);display:flex;flex-direction:column;gap:12px;padding:60px 64px;font-family:${FONT_SERIF};font-size:17px;color:var(--ink);background:radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--accent) 24%,transparent),transparent 34%),radial-gradient(ellipse at 90% 14%,rgba(246,190,160,.36),transparent 30%),radial-gradient(circle at 82% 46%,rgba(190,170,235,.24),transparent 28%),radial-gradient(ellipse at 8% 58%,rgba(247,227,161,.4),transparent 30%),radial-gradient(circle at 92% 90%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 32%),radial-gradient(ellipse at 18% 96%,rgba(246,190,160,.32),transparent 30%),radial-gradient(ellipse at 50% 50%,rgba(255,252,242,.7),rgba(251,243,226,0) 70%),#fbf3e2}
.cs-storybook>*{position:relative;z-index:1}
.cs-storybook .cs-blot,.cs-storybook .cs-vine{position:absolute;z-index:0;pointer-events:none}
.cs-storybook .cs-blot{filter:blur(14px);opacity:.55}
.cs-storybook .cs-b1{left:-70px;top:300px;width:380px;height:300px;border-radius:58% 42% 61% 39% / 46% 58% 42% 54%;background:radial-gradient(circle at 40% 40%,color-mix(in srgb,var(--accent) 40%,transparent),transparent 70%)}
.cs-storybook .cs-b2{right:-80px;top:520px;width:340px;height:380px;border-radius:44% 56% 40% 60% / 57% 43% 57% 43%;background:radial-gradient(circle at 50% 45%,rgba(190,170,235,.6),transparent 70%)}
.cs-storybook .cs-b3{left:120px;bottom:-90px;width:520px;height:260px;border-radius:52% 48% 60% 40% / 62% 44% 56% 38%;background:radial-gradient(circle at 45% 40%,rgba(246,190,160,.65),transparent 70%)}
.cs-storybook .cs-b4{right:60px;top:-70px;width:360px;height:240px;border-radius:40% 60% 52% 48% / 55% 45% 55% 45%;background:radial-gradient(circle at 50% 50%,rgba(247,227,161,.7),transparent 70%)}
.cs-storybook .cs-vine{left:0;top:0;width:1000px;height:1414px}
.cs-storybook .cs-f-title,.cs-storybook .cs-f-name,.cs-storybook .cs-quote{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
.cs-storybook .cs-head{flex:none;height:180px;display:flex;flex-direction:column;justify-content:center;gap:6px}
.cs-storybook .cs-ribbon{position:relative;flex:none;width:760px;height:84px;margin:0 auto}
.cs-storybook .cs-ribbon-bg{position:absolute;left:0;top:0;width:760px;height:84px;filter:drop-shadow(0 4px 5px rgba(90,60,30,.22))}
.cs-storybook .cs-ribbon-text{position:absolute;left:78px;right:78px;top:4px;height:54px;display:flex;align-items:center;justify-content:center;text-align:center}
.cs-storybook .cs-f-title{max-width:100%;font-style:italic;font-weight:700;letter-spacing:.03em;color:#3b2a1a}
.cs-storybook .cs-t1{font-size:30px;line-height:1.2;-webkit-line-clamp:1}
.cs-storybook .cs-t2{font-size:24px;line-height:1.1;-webkit-line-clamp:2}
.cs-storybook .cs-t3{font-size:18px;line-height:1.1;-webkit-line-clamp:2}
.cs-storybook .cs-name-wrap{flex:none;height:90px;display:flex;align-items:center;justify-content:center;text-align:center}
.cs-storybook .cs-f-name{max-width:100%;max-height:100%;font-style:italic;font-weight:700;letter-spacing:.02em;color:var(--deep);text-shadow:0 2px 0 rgba(255,255,255,.85),0 5px 14px color-mix(in srgb,var(--accent) 32%,transparent)}
.cs-storybook .cs-n1{font-size:72px;line-height:1.1;-webkit-line-clamp:2}
.cs-storybook .cs-n2{font-size:54px;line-height:1.1;-webkit-line-clamp:1}
.cs-storybook .cs-n3{font-size:40px;line-height:1.1;-webkit-line-clamp:2}
.cs-storybook .cs-n4{font-size:34px;line-height:1.1;-webkit-line-clamp:2}
.cs-storybook .cs-rowb{flex:none;height:400px;display:grid;grid-template-columns:392px minmax(0,1fr);column-gap:32px}
.cs-storybook .cs-art-wrap{position:relative;margin:12px;border-radius:56% 44% 52% 48% / 46% 54% 46% 54%;box-shadow:0 0 0 9px #fffaf0,0 0 0 12px color-mix(in srgb,var(--accent) 45%,transparent),0 16px 30px rgba(120,90,60,.28)}
.cs-storybook .cs-art{position:absolute;inset:0;border-radius:inherit;background:radial-gradient(ellipse at 50% 35%,#f3e8d2,#d9c9aa)}
.cs-storybook .cs-vignette{position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 24px 14px rgba(255,250,240,.92)}
.cs-storybook .cs-side{min-width:0;min-height:0;display:flex;flex-direction:column;gap:12px;padding-top:22px}
.cs-storybook .cs-cloud{position:relative;flex:none;height:230px;display:flex;align-items:center;justify-content:center;padding:28px 46px;border-radius:52% 48% 50% 50% / 56% 52% 48% 44%;background:#fffdf6;filter:drop-shadow(0 8px 10px rgba(120,90,60,.22))}
.cs-storybook .cs-cloud::before{content:"";position:absolute;z-index:0;left:46px;top:-20px;width:104px;height:70px;border-radius:50%;background:#fffdf6}
.cs-storybook .cs-cloud::after{content:"";position:absolute;z-index:0;right:56px;top:-26px;width:126px;height:80px;border-radius:50%;background:#fffdf6}
.cs-storybook .cs-dot{position:absolute;z-index:0;border-radius:50%;background:#fffdf6}
.cs-storybook .cs-d1{left:-26px;bottom:34px;width:20px;height:20px}
.cs-storybook .cs-d2{left:-42px;bottom:16px;width:11px;height:11px}
.cs-storybook .cs-quote{position:relative;z-index:1;min-width:0;max-width:100%;font-style:italic;text-align:center;color:#4a3b2a}
.cs-storybook .cs-q1{font-size:26px;line-height:1.4;-webkit-line-clamp:4}
.cs-storybook .cs-q2{font-size:21px;line-height:1.4;-webkit-line-clamp:5}
.cs-storybook .cs-q3{font-size:17px;line-height:1.3;-webkit-line-clamp:7}
.cs-storybook .cs-card{flex:1 1 0;min-height:0;overflow:hidden;padding:12px 22px;border-radius:34px 26px 38px 24px;background:rgba(255,253,246,.8);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 30%,transparent),0 8px 18px rgba(120,90,60,.12)}
.cs-storybook .cs-chips{display:flex;gap:10px;margin-bottom:6px}
.cs-storybook .cs-chips .cs-text{min-width:0;max-width:50%;padding:3px 14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:17px;line-height:22px;font-weight:700;border-radius:999px;color:var(--accent-ink);background:var(--accent)}
.cs-storybook .cs-chips .cs-f-role{background:color-mix(in srgb,var(--accent) 40%,#f2a98a)}
.cs-storybook .cs-fgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:18px}
.cs-storybook .cs-fgrid .cs-f-affiliation{grid-column:1 / -1}
.cs-storybook .cs-fgrid .cs-row{min-width:0;height:24px;gap:8px;font-size:16px;line-height:24px}
.cs-storybook .cs-label{font-size:13px;font-weight:700;letter-spacing:.06em;color:var(--deep)}
.cs-storybook .cs-fgrid .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-storybook .cs-customs{flex:none;height:34px;display:flex;gap:12px}
.cs-storybook .cs-customs .cs-row{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:8px;padding:0 18px;overflow:hidden;border-radius:999px;font-size:15px;line-height:34px;background:color-mix(in srgb,var(--accent) 14%,#fffdf6);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 28%,transparent)}
.cs-storybook .cs-customs .cs-label{flex:none;max-width:45%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-storybook .cs-customs .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-storybook .cs-tale{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:8px;overflow:hidden;padding:16px 30px 0;border-radius:44px 56px 40px 52px / 48px 44px 52px 42px;background:rgba(255,253,246,.74);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 24%,transparent),0 10px 26px rgba(120,90,60,.12)}
.cs-storybook .cs-lead{flex:none;font-size:24px;line-height:30px;font-style:italic;font-weight:700;color:var(--deep)}
.cs-storybook .cs-f-summary{flex:none;font-size:20px;line-height:1.6}
.cs-storybook .cs-more{flex:1 1 0;min-height:0;overflow:hidden;-webkit-mask-image:linear-gradient(#000 calc(100% - 28px),rgba(0,0,0,0))}
.cs-storybook .cs-f-backstory{font-size:17px;line-height:1.62;text-indent:1em;color:#5a4a38}
.cs-storybook .cs-run{margin-right:.7em;font-style:italic;font-weight:700;color:var(--deep)}
.cs-storybook .cs-run::after{content:"✿";margin-left:.45em;font-size:.8em;font-style:normal;color:var(--accent)}
.cs-storybook .cs-rowd{flex:none;height:200px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:28px}
.cs-storybook .cs-box{min-width:0;min-height:0;overflow:hidden}
.cs-storybook .cs-box:only-child{grid-column:1 / -1}
.cs-storybook .cs-section-title{display:flex;align-items:center;gap:8px;height:30px;white-space:nowrap;font-size:21px;line-height:30px;font-style:italic;font-weight:700;color:var(--deep)}
.cs-storybook .cs-section-title::before{content:"✿";font-size:18px;font-style:normal;color:var(--accent)}
.cs-storybook .cs-section-title::after{content:"";flex:1;height:0;border-top:3px dotted color-mix(in srgb,var(--accent) 55%,transparent)}
.cs-storybook .cs-stat{height:27px;gap:10px}
.cs-storybook .cs-stat-label{width:66px;flex:none;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:17px;font-weight:700}
.cs-storybook .cs-hearts{flex:1;display:flex;gap:2px;font-size:19px;line-height:1}
.cs-storybook .cs-on{color:var(--accent)}
.cs-storybook .cs-off{color:rgba(120,90,60,.22)}
.cs-storybook .cs-stat-value{min-width:72px;font-size:16px;font-weight:700;color:var(--deep)}
.cs-storybook .cs-skill{display:flex;align-items:baseline;gap:10px;height:27px;line-height:27px;overflow:hidden}
.cs-storybook .cs-skill::before{content:"★";font-size:15px;color:var(--accent)}
.cs-storybook .cs-skill-name{flex:none;max-width:42%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:17px;font-weight:700;color:var(--deep)}
.cs-storybook .cs-skill-desc{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;color:#6b5a46}
.cs-storybook .cs-notes{flex:none;height:66px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:16px}
.cs-storybook .cs-notes .cs-row{min-width:0;height:66px;overflow:hidden;gap:10px;padding:8px 20px;align-items:flex-start;border-radius:30px 22px 32px 20px;font-size:15px;line-height:1.4}
.cs-storybook .cs-notes .cs-row:only-child{grid-column:1 / -1}
.cs-storybook .cs-notes .cs-f-likes{background:rgba(247,200,180,.5)}
.cs-storybook .cs-notes .cs-f-dislikes{background:rgba(190,175,235,.4)}
.cs-storybook .cs-f-likes .cs-label::before{content:"♥ "}
.cs-storybook .cs-f-dislikes .cs-label::before{content:"✕ "}
.cs-storybook .cs-notes .cs-value{flex:1;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.cs-storybook .cs-tags{flex:none;max-height:38px;overflow:hidden;gap:8px;justify-content:center}
.cs-storybook .cs-tag{max-width:100%;padding:4px 16px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;line-height:22px;border-radius:999px;background:rgba(247,200,180,.55)}
.cs-storybook .cs-tag:nth-child(3n+2){background:rgba(190,175,235,.45)}
.cs-storybook .cs-tag:nth-child(3n){background:color-mix(in srgb,var(--accent) 28%,#fffdf6)}
`;

/** Size class `<prefix>N` where N counts how many `limits` the text (in code points) exceeds, plus one. */
const tier = (text, limits, prefix) => `${prefix}${1 + limits.filter((n) => Array.from(text).length > n).length}`;
const deco = (className, ...children) => h('div', { class: className, 'aria-hidden': 'true' }, ...children);
const tint = (pct, base = '#fffaf0') => `color-mix(in srgb, var(--accent) ${pct}%, ${base})`;
const round1 = (v) => Math.round(v * 10) / 10;

/** Points of a gentle sine vine along one edge; `flip` swaps x/y for the vertical edges. */
function track(base, from, to, flip) {
  const pts = [];
  for (let t = from; t <= to; t += 12) pts.push([t, round1(base + Math.sin(t / 34) * 8)]);
  return flip ? pts.map(([a, b]) => [b, a]) : pts;
}

const leaf = (x, y, deg, fill) => h('path', { d: 'M0 0C6-9 18-9 26 0C18 9 6 9 0 0Z', transform: `translate(${x} ${y}) rotate(${deg})`, style: { fill }, opacity: 0.85 });
const flower = ([x, y, k]) => h('g', { transform: `translate(${x} ${y}) scale(${k})` },
  [0, 72, 144, 216, 288].map((a) => h('circle', { cx: round1(Math.cos((a * Math.PI) / 180) * 11), cy: round1(Math.sin((a * Math.PI) / 180) * 11), r: 8, style: { fill: tint(45, '#ffd9c9') }, opacity: 0.9 })),
  h('circle', { cx: 0, cy: 0, r: 5.5, style: { fill: '#f7d774' } }));

function vine() {
  const sides = [track(36, 70, 930, false), track(1378, 70, 930, false), track(36, 70, 1344, true), track(964, 70, 1344, true)];
  const lines = sides.map((pts) => h('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', style: { stroke: 'var(--accent)' }, 'stroke-width': 3, opacity: 0.5 }));
  const leaves = sides.flatMap((pts, s) => pts.filter((_, i) => i % 6 === 3).map(([x, y], k) => leaf(x, y, (s > 1 ? 90 : 0) + (k % 2 ? 40 : -40), k % 3 ? '#a9cf9c' : tint(60, '#c9e3b8'))));
  const flowers = [[40, 40, 1.1], [960, 40, 1.1], [40, 1374, 1.1], [960, 1374, 1.1], [500, 34, 0.9], [500, 1380, 0.9]].map(flower);
  return h('svg', { class: 'cs-vine', viewBox: '0 0 1000 1414', 'aria-hidden': 'true' }, lines, leaves, flowers);
}

function ribbon(vm) {
  const title = textField(vm, 'title', 'div', tier(vm.title, [14, 36], 'cs-t'));
  if (!title) return null;
  const fold = { fill: tint(75, '#3b2a1a') };
  const bg = h('svg', { class: 'cs-ribbon-bg', viewBox: '0 0 760 84', 'aria-hidden': 'true' },
    h('polygon', { points: '0,20 64,20 64,72 0,72 22,46', style: { fill: tint(55) } }),
    h('polygon', { points: '760,20 696,20 696,72 760,72 738,46', style: { fill: tint(55) } }),
    h('polygon', { points: '50,58 64,72 64,58', style: fold }), h('polygon', { points: '710,58 696,72 696,58', style: fold }),
    h('path', { d: 'M50 6Q380-6 710 6L710 58Q380 70 50 58Z', style: { fill: tint(26), stroke: 'var(--accent)' }, 'stroke-width': 2 }));
  return h('div', { class: 'cs-ribbon' }, bg, h('div', { class: 'cs-ribbon-text' }, title));
}

/** Stats as rows of ten hearts; the editable section label sits inside the marker, label and value stay own text nodes. */
function hearts(vm) {
  if (vm.isHidden('stats')) return null;
  return h('div', { class: 'cs-stats cs-stats-hearts cs-f-stats' }, sectionLabel(vm, 'stats'), vm.stats.map((stat) => {
    const on = Math.max(0, Math.min(10, Math.round(stat.ratio * 10)));
    return h('div', { class: 'cs-stat' }, h('span', { class: 'cs-stat-label' }, stat.label),
      h('span', { class: 'cs-hearts', 'aria-hidden': 'true' }, Array.from({ length: 10 }, (_, i) => h('span', { class: i < on ? 'cs-on' : 'cs-off' }, '♥'))),
      h('span', { class: 'cs-stat-value' }, stat.text));
  }));
}

function card(vm) {
  const chips = [textField(vm, 'race', 'span'), textField(vm, 'role', 'span')].filter(Boolean);
  const info = fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation']).filter(Boolean);
  if (!chips.length && !info.length) return null;
  return h('div', { class: 'cs-card' }, chips.length ? h('div', { class: 'cs-chips' }, chips) : null,
    info.length ? h('div', { class: 'cs-fgrid' }, info) : null);
}

function cloud(vm) {
  const quote = quoteBlock(vm, tier(vm.quote, [36, 72], 'cs-q'));
  return quote ? h('div', { class: 'cs-cloud' }, quote, deco('cs-dot cs-d1'), deco('cs-dot cs-d2')) : null;
}

/** The user's own items as a strip of up to three stickers under the portrait row (the profile area). */
function customs(vm) {
  const rows = customRows(vm).slice(0, 3);
  return rows.length ? h('div', { class: 'cs-customs' }, rows) : null;
}

/** Backstory: the marker holds the editable label (a run-in head) and the text; CSS alone cuts the text. */
function backstory(vm) {
  if (vm.isHidden('backstory') || !vm.backstory) return null;
  return h('div', { class: 'cs-more' }, h('p', { class: 'cs-text cs-f-backstory' }, h('span', { class: 'cs-run' }, vm.label('backstory')), vm.backstory));
}

function tale(vm) {
  const summary = textField(vm, 'summary', 'p', 'cs-clamp-5');
  const more = backstory(vm);
  if (!summary && !more) return null;
  return h('section', { class: 'cs-tale' }, deco('cs-lead', '옛날 옛적에…'), summary, more);
}

function statsBox(vm) {
  const stats = hearts(vm);
  return stats ? h('section', { class: 'cs-box' }, stats) : null;
}

function skillsBox(vm) {
  const skills = skillList(vm, '', sectionLabel(vm, 'skills'));
  return skills ? h('section', { class: 'cs-box' }, skills) : null;
}

function render(vm) {
  const notes = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  const boxes = [statsBox(vm), skillsBox(vm)].filter(Boolean);
  return sheet(META, vm, [1, 2, 3, 4].map((n) => deco(`cs-blot cs-b${n}`)), vine(),
    h('header', { class: 'cs-head' }, ribbon(vm), h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', tier(vm.name, [9, 15, 30], 'cs-n')))),
    h('div', { class: 'cs-rowb' }, h('div', { class: 'cs-art-wrap' }, artSlot(vm), deco('cs-vignette')),
      h('div', { class: 'cs-side' }, cloud(vm), card(vm))),
    customs(vm), tale(vm), boxes.length ? h('div', { class: 'cs-rowd' }, boxes) : null,
    notes.length ? h('div', { class: 'cs-notes' }, notes) : null, tagList(vm));
}

export default { ...META, css, render };
