// Design: 8-bit status screen. Dark navy sky with pixel stars, notched box-shadow window borders, segmented stat bars and
// monospace type throughout. Geometry: 176px identity window, then a 420px art/stats column and a flexible text column.
import { h } from '../core/vnode.js';
import { FONT_MONO, cls, sheet, textField, fieldRows, customRows, tagList, statBars, skillList, artSlot, iconSlot, quoteBlock } from './parts.js';

const META = { id: 'pixel', label: '픽셀 레트로', size: { w: 1000, h: 1414 }, defaultAccent: '#6cd34b' };
const HEART = ['.XX...XX.', 'XXXX.XXXX', 'XXXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....'];
const SKY = ['#ffffff', '#8da2ff', '#ffd84a', '#9fffe0'];
const BAR_COLORS = ['#ff5a6e', '#4aa8ff', 'var(--accent)', '#ffd84a', '#c77dff', '#ff9a3c'];

/** One box-shadow entry per filled cell, so a single 6px element draws a whole sprite. */
const dots = (rows, px, color) => rows.flatMap((row, y) => Array.from(row).flatMap((c, x) => (c === 'X' ? [`${x * px}px ${y * px}px 0 0 ${color}`] : []))).join(',');
const star = (i) => {
  const edge = i >= 30;
  const x = edge ? (i % 2 ? 14 + ((i * 7) % 20) : 966 + ((i * 5) % 20)) : ((i * 337 + 91) % 960) + 14;
  const y = edge ? ((i * 211 + 40) % 1360) + 20 : ((i * 571 + 53) % 1380) + 12;
  return `${x}px ${y}px 0 0 ${SKY[i % 4]}`;
};
const STARS = Array.from({ length: 46 }, (_, i) => star(i)).join(',');
/** A notched pixel border: four offset shadows leave the corner squares empty. */
const ring = (px, c) => `0 -${px}px 0 0 ${c},0 ${px}px 0 0 ${c},-${px}px 0 0 0 ${c},${px}px 0 0 0 ${c}`;
const seg = (c) => `repeating-linear-gradient(90deg,${c} 0 14px,rgba(0,0,0,0) 14px 18px)`;
const barRules = BAR_COLORS.map((c, i) => `.cs-pixel .cs-stat:nth-child(${i + 2}) .cs-bar-fill{background:${seg(c)}}`).join('\n');

const css = `
.cs-pixel{--bd:#eef1ff;--panel:#10163f;--dim:#9aa7ff;z-index:0;display:flex;flex-direction:column;gap:24px;padding:46px;font-family:${FONT_MONO};font-size:16px;color:#e8ecff;
background:repeating-linear-gradient(0deg,rgba(255,255,255,.028) 0 2px,rgba(0,0,0,0) 2px 4px),linear-gradient(180deg,#0b1030,#070a1f 55%,#04050f)}
.cs-pixel::before{content:"";position:absolute;z-index:-1;left:0;top:0;width:4px;height:4px;box-shadow:${STARS}}
.cs-pixel .cs-win{position:relative;min-width:0;min-height:0;overflow:hidden;padding:16px 20px;background:var(--panel);box-shadow:${ring(6, 'var(--bd)')},inset 0 0 0 4px var(--panel),inset 0 0 0 6px #4452c8,12px 12px 0 0 #02030b}
.cs-pixel .cs-section-title{margin-bottom:12px;font-size:17px;line-height:22px;font-weight:700;letter-spacing:.1em;color:#ffd84a;text-shadow:2px 2px 0 #3a2a00}
.cs-pixel .cs-sub{margin-right:.6em}
.cs-pixel .cs-section-title::before{content:"▶";margin-right:10px;color:var(--accent);text-shadow:none}
.cs-pixel .cs-id{flex:none;height:176px;display:flex;align-items:center;gap:24px;padding:16px 124px 16px 20px}
.cs-pixel .cs-heart{position:absolute;right:78px;top:64px;width:6px;height:6px;box-shadow:${dots(HEART, 6, '#ff4d6a')}}
.cs-pixel .cs-pic{flex:none;width:112px;height:112px;background:var(--accent);color:var(--accent-ink);font-size:62px;box-shadow:${ring(4, '#fff')}}
.cs-pixel .cs-id-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.cs-pixel .cs-name-wrap{height:66px;display:flex;align-items:center}
.cs-pixel .cs-f-name{min-width:0;max-width:100%;font-weight:700;color:#fff;text-shadow:4px 4px 0 #5b2ea6}
.cs-pixel .cs-n1,.cs-pixel .cs-n2{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px 4px 0}
.cs-pixel .cs-n1{font-size:54px;line-height:1.1}.cs-pixel .cs-n2{font-size:34px;line-height:1.2}.cs-pixel .cs-n3{font-size:26px;line-height:1.2}
.cs-pixel .cs-title-line{display:flex;align-items:center;gap:10px;height:28px}
.cs-pixel .cs-title-line::before{content:"";flex:none;width:10px;height:10px;background:var(--accent)}
.cs-pixel .cs-f-title{flex:1;min-width:0;font-size:20px;line-height:28px;color:var(--accent)}
.cs-pixel .cs-chips{display:flex;gap:18px;height:34px;align-items:center;padding-left:3px}
.cs-pixel .cs-chips .cs-text{min-width:0;max-width:46%;padding:3px 14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:16px;line-height:22px;background:#1c2566;box-shadow:${ring(3, '#8aa0ff')}}
.cs-pixel .cs-chips .cs-f-role{box-shadow:${ring(3, '#ffb05a')}}
.cs-pixel .cs-chips .cs-text:empty{display:none}
.cs-pixel .cs-body{flex:1;min-height:0;display:flex;gap:24px}
.cs-pixel .cs-col-l{flex:0 0 420px;min-height:0;display:flex;flex-direction:column;gap:24px}
.cs-pixel .cs-col-r{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:22px}
.cs-pixel .cs-art-box{position:relative;flex:1;min-height:0}
.cs-pixel .cs-art{position:absolute;left:0;top:0;right:0;bottom:0;padding:0;background:#0b1236;image-rendering:pixelated}
.cs-pixel .cs-art img,.cs-pixel .cs-art svg{image-rendering:pixelated}
.cs-pixel .cs-art svg *{shape-rendering:crispEdges}
.cs-pixel .cs-grid{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;box-shadow:inset 0 0 0 4px var(--panel),inset 0 0 0 6px #4452c8;background:repeating-linear-gradient(0deg,rgba(0,0,0,.2) 0 1px,rgba(0,0,0,0) 1px 4px),repeating-linear-gradient(90deg,rgba(0,0,0,.2) 0 1px,rgba(0,0,0,0) 1px 4px)}
.cs-pixel .cs-stat-win{flex:none}
.cs-pixel .cs-stat{height:44px;gap:12px}
.cs-pixel .cs-stat-label{width:70px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;font-weight:700;color:var(--dim)}
.cs-pixel .cs-bar{height:24px;background:repeating-linear-gradient(90deg,#222c6e 0 14px,#070a20 14px 18px);box-shadow:${ring(3, '#070a20')}}
${barRules}
.cs-pixel .cs-stat-value{width:84px;min-width:0;white-space:nowrap;font-size:16px;font-weight:700;color:#fff}
.cs-pixel .cs-tagbox{flex:none}
.cs-pixel .cs-tags{max-height:156px;overflow:hidden;gap:12px;padding:5px 4px}
.cs-pixel .cs-tags-head{flex:0 0 100%}
.cs-pixel .cs-tags-head .cs-section-title{margin-bottom:0}
.cs-pixel .cs-tag{max-width:100%;padding:3px 12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;line-height:22px;color:var(--accent-ink);background:var(--accent);box-shadow:${ring(3, '#fff')}}
.cs-pixel .cs-tag:nth-child(3n){background:#4aa8ff;color:#06102a}.cs-pixel .cs-tag:nth-child(3n+1){background:#ffd84a;color:#06102a}
.cs-pixel .cs-quote-win{flex:none;padding:16px 24px 28px 56px}
.cs-pixel .cs-quote-win::before{content:"“";position:absolute;left:18px;top:6px;font-size:54px;line-height:1;color:var(--accent)}
.cs-pixel .cs-quote-win::after{content:"▼";position:absolute;right:18px;bottom:8px;font-size:14px;line-height:1;color:var(--accent)}
.cs-pixel .cs-quote{font-size:18px;line-height:26px;color:#fff}
.cs-pixel .cs-sum-win{flex:0 2 auto}
.cs-pixel .cs-f-summary{font-size:16px;line-height:24px;color:#dfe5ff}
.cs-pixel .cs-data-win{flex:none}
.cs-pixel .cs-data{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px}
.cs-pixel .cs-data .cs-row{min-width:0;height:30px;align-items:center;gap:10px;border-bottom:2px dotted #3a4796}
.cs-pixel .cs-data .cs-f-affiliation,.cs-pixel .cs-data .cs-f-likes,.cs-pixel .cs-data .cs-f-dislikes{grid-column:1 / -1}
.cs-pixel .cs-data .cs-f-likes,.cs-pixel .cs-data .cs-f-dislikes{height:46px}
.cs-pixel .cs-label{flex:none;width:52px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px;font-weight:700;color:var(--accent)}
.cs-pixel .cs-data .cs-f-custom{height:26px}
.cs-pixel .cs-data .cs-f-custom .cs-label{width:64px}
.cs-pixel .cs-data .cs-f-affiliation .cs-label,.cs-pixel .cs-data .cs-f-likes .cs-label,.cs-pixel .cs-data .cs-f-dislikes .cs-label{width:100px}
.cs-pixel .cs-data .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#fff}
.cs-pixel .cs-data .cs-f-likes .cs-value,.cs-pixel .cs-data .cs-f-dislikes .cs-value{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;white-space:normal;font-size:15px;line-height:21px}
.cs-pixel .cs-skill-win{flex:0 3 auto}
.cs-pixel .cs-skills{counter-reset:sk}
.cs-pixel .cs-skill{counter-increment:sk;position:relative;height:52px;padding:2px 0 2px 38px;overflow:hidden;border-bottom:2px dotted #3a4796}
.cs-pixel .cs-skill::before{content:counter(sk);position:absolute;left:0;top:13px;width:26px;height:26px;line-height:26px;text-align:center;font-size:15px;font-weight:700;color:var(--accent-ink);background:var(--accent)}
.cs-pixel .cs-skill-name,.cs-pixel .cs-skill-desc{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-pixel .cs-skill-name{font-size:17px;line-height:26px;font-weight:700;color:#ffd84a}.cs-pixel .cs-skill-desc{font-size:14px;line-height:22px;color:var(--dim)}
.cs-pixel .cs-log-win{flex:1 1 0;min-height:96px;display:flex;flex-direction:column}
.cs-pixel .cs-log-win .cs-text{flex:1;min-height:0;overflow:hidden;font-size:15px;line-height:23px;color:#cfd6ff;-webkit-mask-image:linear-gradient(#000 calc(100% - 26px),rgba(0,0,0,0))}
`;

/** A window around `node` with an optional head title; null when `node` is absent, hidden or empty. */
const win = (extra, node, head = null) => (node ? h('section', { class: cls('cs-win', extra) }, head, node) : null);
/** Section title: a decorative English tag, then the editable label as its own text node. Null when the section is hidden. */
const title = (vm, key, sub) => (vm.isHidden(key) ? null : h('h3', { class: 'cs-section-title' }, h('span', { class: 'cs-sub' }, sub), vm.label(key)));

function identity(vm) {
  const n = Array.from(vm.name).length;
  const tier = n <= 10 ? 'cs-n1' : n <= 17 ? 'cs-n2' : 'cs-n3';
  const heading = textField(vm, 'title', 'div', 'cs-clamp-1');
  const chips = [textField(vm, 'race', 'span'), textField(vm, 'role', 'span')].filter(Boolean);
  return h('section', { class: 'cs-win cs-id' }, iconSlot(vm, 'cs-pic'),
    h('div', { class: 'cs-id-text' },
      h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls(tier === 'cs-n3' && 'cs-clamp-2', tier))),
      heading ? h('div', { class: 'cs-title-line' }, heading) : null,
      chips.length ? h('div', { class: 'cs-chips' }, chips) : null),
    h('div', { class: 'cs-heart', 'aria-hidden': 'true' }));
}

/** Data window: profile rows, up to four compact custom rows, then likes/dislikes. Null when nothing is left to show. */
function dataWindow(vm) {
  const profile = vm.isHidden('profile') ? [] : [...fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation']), ...customRows(vm).slice(0, 4)].filter(Boolean);
  const moods = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  if (profile.length + moods.length === 0) return null;
  return win('cs-data-win', h('div', { class: 'cs-data' }, [...profile, ...moods]), profile.length ? title(vm, 'profile', 'DATA') : null);
}

/** Backstory window: the marker element holds the editable title and the text; null when hidden or empty. */
function story(vm) {
  if (!vm.backstory || vm.isHidden('backstory')) return null;
  return h('section', { class: 'cs-win cs-log-win cs-f-backstory' }, title(vm, 'backstory', 'LOG'), h('p', { class: 'cs-text' }, vm.backstory));
}

function render(vm) {
  const quote = quoteBlock(vm, 'cs-clamp-5');
  const tags = tagList(vm, '', title(vm, 'tags', 'ITEMS'));
  return sheet(META, vm,
    identity(vm),
    h('div', { class: 'cs-body' },
      h('div', { class: 'cs-col-l' },
        h('div', { class: 'cs-art-box' }, artSlot(vm, 'cs-win'), h('div', { class: 'cs-grid', 'aria-hidden': 'true' })),
        win('cs-stat-win', statBars(vm, '', title(vm, 'stats', 'STATUS'))),
        tags ? h('div', { class: 'cs-tagbox' }, tags) : null),
      h('div', { class: 'cs-col-r' },
        quote ? h('section', { class: 'cs-win cs-quote-win' }, quote) : null,
        win('cs-sum-win', textField(vm, 'summary', 'p', 'cs-clamp-8'), title(vm, 'summary', 'INFO')),
        dataWindow(vm),
        win('cs-skill-win', skillList(vm, '', title(vm, 'skills', 'SKILLS'))),
        story(vm))));
}

export default { ...META, css, render };
