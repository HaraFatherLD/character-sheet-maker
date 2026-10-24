// Design: gothic grimoire as an open two-page spread. Stitched dark leather cover with rivets, aged dark parchment pages,
// a gutter shadow, gold double frames with svg corner flourishes, a drop-cap summary, and a gold radar with a rune list.
// Geometry (1414x1000, 44px cover): two 663px pages with 38px/42px/44px padding, i.e. 579 x 830 of content each.
// Section titles are the user's labels and sit inside the stats / skills / backstory marker; the detail grid also holds two custom items.
import { h } from '../core/vnode.js';
import { FONT_SERIF, cls, sheet, textField, fieldRows, customRows, tagList, statRadar, skillList, artSlot, iconSlot, quoteBlock, sectionLabel } from './parts.js';

const META = { id: 'grimoire', label: '고딕 마도서', size: { w: 1414, h: 1000 }, defaultAccent: '#7b4bd6' };
const GOLD = '#d6b062';
const PAPER = 'radial-gradient(ellipse at 30% 18%,rgba(255,226,160,.12),rgba(0,0,0,0) 55%),radial-gradient(ellipse at 70% 85%,rgba(120,70,20,.2),rgba(0,0,0,0) 50%),radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 58%,rgba(10,4,0,.5) 100%),repeating-linear-gradient(92deg,rgba(255,230,170,.018) 0 2px,rgba(0,0,0,0) 2px 8px),linear-gradient(160deg,#4a3822,#3a2b1a 55%,#2e2214)';
const rivet = (x, y) => `radial-gradient(circle at ${x} ${y},#f1d58a 0 4px,#8a6a2c 5px 7px,rgba(0,0,0,0) 8px)`;
const RIVETS = [rivet('26px', '26px'), rivet('calc(100% - 26px)', '26px'), rivet('26px', 'calc(100% - 26px)'), rivet('calc(100% - 26px)', 'calc(100% - 26px)')].join(',');

const css = `
.cs-grimoire{--gold:${GOLD};--gold2:#8a6a2c;--ink:#eadcb8;z-index:0;display:flex;padding:44px;font-family:${FONT_SERIF};font-size:18px;color:var(--ink);
background:radial-gradient(ellipse at 50% 40%,rgba(120,70,40,.35),rgba(0,0,0,0) 65%),repeating-linear-gradient(45deg,rgba(255,255,255,.018) 0 2px,rgba(0,0,0,0) 2px 6px),repeating-linear-gradient(-45deg,rgba(0,0,0,.05) 0 2px,rgba(0,0,0,0) 2px 7px),linear-gradient(145deg,#33201a,#1c110e 60%,#140b09)}
.cs-grimoire::before{content:"";position:absolute;left:14px;top:14px;right:14px;bottom:14px;border:2px dashed rgba(214,176,98,.35);border-radius:10px;pointer-events:none}
.cs-grimoire::after{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;background:${RIVETS}}
.cs-grimoire .cs-book{position:relative;flex:1;min-width:0;min-height:0;display:flex;box-shadow:0 18px 40px rgba(0,0,0,.65)}
.cs-grimoire .cs-book::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:70px;margin-left:-35px;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,0) 48.5%,rgba(0,0,0,.8) 50%,rgba(0,0,0,0) 51.5%),linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.62) 50%,rgba(0,0,0,0))}
.cs-grimoire .cs-page{position:relative;flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:14px;padding:38px 42px 44px;overflow:hidden;background:${PAPER}}
.cs-grimoire .cs-page-l{border-radius:8px 0 0 8px;box-shadow:-2px 0 0 #6f5a37,-4px 0 0 #231a0f,-6px 0 0 #6f5a37}
.cs-grimoire .cs-page-r{border-radius:0 8px 8px 0;box-shadow:2px 0 0 #6f5a37,4px 0 0 #231a0f,6px 0 0 #6f5a37}
.cs-grimoire .cs-page::before{content:"";position:absolute;left:16px;top:16px;right:16px;bottom:16px;border:1px solid rgba(214,176,98,.6);pointer-events:none}
.cs-grimoire .cs-page::after{content:"";position:absolute;left:21px;top:21px;right:21px;bottom:21px;border:1px solid rgba(214,176,98,.28);pointer-events:none}
.cs-grimoire .cs-cn{position:absolute;width:46px;height:46px;pointer-events:none}
.cs-grimoire .cs-cn-tl{left:11px;top:11px}.cs-grimoire .cs-cn-tr{right:11px;top:11px;transform:scaleX(-1)}
.cs-grimoire .cs-cn-bl{left:11px;bottom:11px;transform:scaleY(-1)}.cs-grimoire .cs-cn-br{right:11px;bottom:11px;transform:scale(-1,-1)}
.cs-grimoire .cs-folio{position:absolute;left:0;right:0;bottom:24px;text-align:center;font-size:14px;line-height:16px;letter-spacing:.3em;color:rgba(214,176,98,.7)}
.cs-grimoire .cs-banner{flex:none;height:150px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center}
.cs-grimoire .cs-name-wrap{width:100%;height:68px;display:flex;align-items:center;justify-content:center}
.cs-grimoire .cs-f-name{min-width:0;max-width:100%;font-weight:700;letter-spacing:.04em;color:#f0d68c;text-shadow:0 2px 0 #3a2410,0 0 18px rgba(230,195,106,.35)}
.cs-grimoire .cs-n1,.cs-grimoire .cs-n2{padding:0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cs-grimoire .cs-n1{font-size:54px;line-height:1.2}.cs-grimoire .cs-n2{font-size:40px;line-height:1.2}.cs-grimoire .cs-n3{font-size:28px;line-height:1.2}
.cs-grimoire .cs-fleuron{flex:none;width:240px;height:14px}
.cs-grimoire .cs-f-title{max-width:100%;font-size:21px;line-height:28px;font-style:italic;letter-spacing:.05em;color:#cdb98c}
.cs-grimoire .cs-meta{display:flex;justify-content:center;align-items:center;gap:14px;max-width:100%;height:26px;font-size:18px;letter-spacing:.14em;color:var(--gold)}
.cs-grimoire .cs-meta .cs-text{min-width:0;max-width:44%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-grimoire .cs-dot{flex:none;width:6px;height:6px;transform:rotate(45deg);background:var(--gold)}
.cs-grimoire .cs-art-frame{position:relative;flex:1;min-height:0;border:2px solid var(--gold);background:linear-gradient(135deg,#2a1d10,#1b130a);box-shadow:0 0 0 4px rgba(10,5,0,.6),0 0 0 5px var(--gold2),0 10px 24px rgba(0,0,0,.5)}
.cs-grimoire .cs-art-frame::before{content:"";position:absolute;z-index:2;left:50%;top:-13px;width:14px;height:14px;margin-left:-7px;transform:rotate(45deg);background:var(--accent);border:2px solid var(--gold)}
.cs-grimoire .cs-art{position:absolute;left:10px;top:10px;right:10px;bottom:10px;border:1px solid var(--gold2);background:#14213d}
.cs-grimoire .cs-art-frame .cs-tags{position:absolute;left:96px;right:22px;bottom:22px;max-height:58px;overflow:hidden;gap:6px}
.cs-grimoire .cs-tag{max-width:100%;padding:2px 12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;line-height:20px;font-style:italic;color:var(--ink);background:rgba(14,8,4,.84);border:1px solid var(--gold)}
.cs-grimoire .cs-seal{position:absolute;left:-14px;bottom:-12px;width:84px;height:84px;border-radius:50%;border:3px solid #e6c36a;background:radial-gradient(circle at 34% 30%,color-mix(in srgb,var(--accent) 65%,#fff),var(--accent) 58%,#1a0a2a);box-shadow:0 0 0 3px rgba(10,5,0,.7),0 6px 14px rgba(0,0,0,.6);color:var(--accent-ink);font-size:40px}
.cs-grimoire .cs-block{flex:none;min-height:0}
.cs-grimoire .cs-section-title{display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:18px;line-height:26px;font-weight:700;letter-spacing:.2em;color:var(--gold)}
.cs-grimoire .cs-section-title::before{content:"";flex:none;width:8px;height:8px;transform:rotate(45deg);background:var(--gold)}
.cs-grimoire .cs-section-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--gold),rgba(214,176,98,0))}
.cs-grimoire .cs-stats-radar{display:grid;grid-template-columns:288px 1fr;gap:0 16px;align-items:center;color:#c9a95f}
.cs-grimoire .cs-stats-radar>.cs-section-title{grid-column:1 / -1}
.cs-grimoire .cs-radar{width:288px}
.cs-grimoire .cs-stat-list{display:flex;flex-direction:column;gap:3px;color:var(--ink)}
.cs-grimoire .cs-stat{height:36px;gap:10px;border-bottom:1px dotted rgba(214,176,98,.5)}
.cs-grimoire .cs-stat::before{content:"";flex:none;width:8px;height:8px;transform:rotate(45deg);background:var(--gold)}
.cs-grimoire .cs-stat-label{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:19px}
.cs-grimoire .cs-stat-value{min-width:0;white-space:nowrap;font-size:19px;font-weight:700;color:var(--gold)}
.cs-grimoire .cs-quote-box{flex:none;position:relative;padding:12px 24px 12px 58px;border-top:1px solid var(--gold2);border-bottom:1px solid var(--gold2);background:linear-gradient(90deg,rgba(214,176,98,.14),rgba(214,176,98,0))}
.cs-grimoire .cs-quote-box::before{content:"“";position:absolute;left:12px;top:-2px;font-size:72px;line-height:1;color:var(--gold)}
.cs-grimoire .cs-quote{font-size:20px;line-height:28px;font-style:italic;color:#f4e6c4}
.cs-grimoire .cs-sum-wrap{flex:0 2 auto;min-height:0;max-height:182px;overflow:hidden}
.cs-grimoire .cs-drop{font-size:17px;line-height:26px;color:#e6d8b4}
.cs-grimoire .cs-drop::first-letter{float:left;margin:3px 10px 0 0;font-size:64px;line-height:.82;font-weight:700;color:var(--gold);text-shadow:0 0 12px rgba(214,176,98,.4)}
.cs-grimoire .cs-det{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:3px 22px;padding:7px 0;border-top:1px solid rgba(214,176,98,.4);border-bottom:1px solid rgba(214,176,98,.4)}
.cs-grimoire .cs-det .cs-row{min-width:0;height:28px;align-items:center;gap:10px}
.cs-grimoire .cs-det .cs-f-affiliation,.cs-grimoire .cs-det .cs-f-likes,.cs-grimoire .cs-det .cs-f-dislikes{grid-column:1 / -1}
.cs-grimoire .cs-det .cs-f-likes,.cs-grimoire .cs-det .cs-f-dislikes{height:46px}
.cs-grimoire .cs-label{flex:none;width:48px;font-size:14px;letter-spacing:.1em;color:var(--gold)}
.cs-grimoire .cs-det .cs-f-affiliation .cs-label,.cs-grimoire .cs-det .cs-f-likes .cs-label,.cs-grimoire .cs-det .cs-f-dislikes .cs-label{width:96px}
.cs-grimoire .cs-det .cs-f-custom .cs-label{width:auto;max-width:96px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-grimoire .cs-det .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:17px}
.cs-grimoire .cs-det .cs-f-likes .cs-value,.cs-grimoire .cs-det .cs-f-dislikes .cs-value{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;white-space:normal;font-size:15px;line-height:21px;font-style:italic}
.cs-grimoire .cs-skill-block{flex:0 3 auto;overflow:hidden}
.cs-grimoire .cs-skill{position:relative;height:48px;padding:2px 0 2px 26px;overflow:hidden;border-bottom:1px dotted rgba(214,176,98,.45)}
.cs-grimoire .cs-skill::before{content:"";position:absolute;left:4px;top:19px;width:9px;height:9px;transform:rotate(45deg);border:1px solid var(--gold);background:var(--accent)}
.cs-grimoire .cs-skill-name,.cs-grimoire .cs-skill-desc{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-grimoire .cs-skill-name{font-size:18px;line-height:24px;font-weight:700;color:#f0d68c}.cs-grimoire .cs-skill-desc{font-size:15px;line-height:20px;font-style:italic;color:#c9b88f}
.cs-grimoire .cs-story{flex:1 1 0;min-height:84px;display:flex;flex-direction:column;overflow:hidden}
.cs-grimoire .cs-story .cs-back{flex:1;min-height:0;overflow:hidden;font-size:16px;line-height:24px;color:#dccfae;-webkit-mask-image:linear-gradient(#000 calc(100% - 26px),rgba(0,0,0,0))}
`;

/** A page block around a part whose own marker element already holds the section label (stats, skills). Null when the part is. */
const wrap = (node, extra) => (node ? h('section', { class: cls('cs-block', extra) }, node) : null);
const folio = (text) => h('div', { class: 'cs-folio', 'aria-hidden': 'true' }, text);

function corner(pos) {
  const line = (d, width, opacity) => h('path', { d, fill: 'none', stroke: GOLD, 'stroke-width': width, opacity });
  return h('svg', { class: `cs-cn cs-cn-${pos}`, viewBox: '0 0 46 46', 'aria-hidden': 'true' },
    line('M5 41V12Q5 5 12 5H41', 2), line('M12 33V18Q12 12 18 12H33', 1, 0.7),
    h('circle', { cx: 18, cy: 18, r: 2.6, fill: GOLD }),
    h('polygon', { points: '41,2 44,5 41,8 38,5', fill: GOLD }), h('polygon', { points: '2,41 5,38 8,41 5,44', fill: GOLD }));
}
const corners = () => ['tl', 'tr', 'bl', 'br'].map(corner);

const fleuron = () => h('svg', { class: 'cs-fleuron', viewBox: '0 0 240 14', 'aria-hidden': 'true' },
  h('line', { x1: 0, y1: 7, x2: 100, y2: 7, stroke: GOLD, 'stroke-width': 1 }), h('line', { x1: 140, y1: 7, x2: 240, y2: 7, stroke: GOLD, 'stroke-width': 1 }),
  h('polygon', { points: '120,0 128,7 120,14 112,7', fill: GOLD }), h('circle', { cx: 104, cy: 7, r: 2, fill: GOLD }), h('circle', { cx: 136, cy: 7, r: 2, fill: GOLD }));

function leftPage(vm) {
  const n = Array.from(vm.name).length;
  const tier = n <= 9 ? 'cs-n1' : n <= 13 ? 'cs-n2' : 'cs-n3';
  const race = textField(vm, 'race', 'span');
  const role = textField(vm, 'role', 'span');
  return h('div', { class: 'cs-page cs-page-l' }, corners(),
    h('header', { class: 'cs-banner' },
      h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls(tier === 'cs-n3' && 'cs-clamp-2', tier))),
      fleuron(),
      textField(vm, 'title', 'div', 'cs-clamp-1'),
      h('div', { class: 'cs-meta' }, race, race && role ? h('span', { class: 'cs-dot', 'aria-hidden': 'true' }) : null, role)),
    h('div', { class: 'cs-art-frame' }, artSlot(vm), tagList(vm), iconSlot(vm, 'cs-seal')),
    wrap(statRadar(vm, '', sectionLabel(vm, 'stats'))),
    folio('— I —'));
}

/** Backstory block: the section itself is the marker, so the user's label and the text both sit inside it. Null when hidden or empty. */
function story(vm) {
  if (vm.isHidden('backstory') || !vm.backstory) return null;
  return h('section', { class: 'cs-block cs-story cs-f-backstory' }, sectionLabel(vm, 'backstory'), h('p', { class: 'cs-text cs-back' }, vm.backstory));
}

function rightPage(vm) {
  const quote = quoteBlock(vm, 'cs-clamp-4');
  const summary = textField(vm, 'summary', 'p', 'cs-drop');
  const rows = [...fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation', 'likes', 'dislikes']), ...customRows(vm).slice(0, 2)].filter(Boolean);
  return h('div', { class: 'cs-page cs-page-r' }, corners(),
    quote ? h('div', { class: 'cs-quote-box' }, quote) : null,
    summary ? h('div', { class: 'cs-sum-wrap' }, summary) : null,
    rows.length ? h('div', { class: 'cs-det' }, rows) : null,
    wrap(skillList(vm, '', sectionLabel(vm, 'skills')), 'cs-skill-block'),
    story(vm),
    folio('— II —'));
}

function render(vm) {
  return sheet(META, vm, h('div', { class: 'cs-book' }, leftPage(vm), rightPage(vm)));
}

export default { ...META, css, render };
