// Design: parchment fantasy sheet. Gradient paper, ornamental double border, serif headings, hexagon stat radar.
// Layout is fixed-size: header, then a 396px left column (art, radar, tags) and a flexible right column.
import { h } from '../core/vnode.js';
import { FONT_SERIF, cls, sheet, textField, fieldRows, customRows, tagList, statRadar, skillList, artSlot, iconSlot, quoteBlock, sectionLabel } from './parts.js';

const META = { id: 'fantasy', label: '판타지 양피지', size: { w: 1000, h: 1414 }, defaultAccent: '#8b2f2f' };

const css = `
.cs-fantasy{--gold:#b8862b;--ink:#3a2412;display:flex;flex-direction:column;gap:16px;padding:70px 76px;font-family:${FONT_SERIF};font-size:19px;color:var(--ink);
background:radial-gradient(ellipse at 50% 36%,rgba(255,250,228,.8),rgba(255,250,228,0) 62%),radial-gradient(ellipse at 50% 50%,rgba(110,64,20,0) 52%,rgba(110,64,20,.42) 100%),repeating-linear-gradient(94deg,rgba(120,80,30,.05) 0 2px,rgba(0,0,0,0) 2px 9px),linear-gradient(160deg,#ecd4a0,#e2c387 55%,#d2ab67)}
.cs-fantasy::before{content:"";position:absolute;inset:22px;border:9px double var(--accent);pointer-events:none}
.cs-fantasy::after{content:"";position:absolute;inset:46px;border:1px solid rgba(90,56,24,.6);pointer-events:none}
.cs-fantasy .cs-corner{position:absolute;width:32px;height:32px;transform:rotate(45deg);background:#f1deb0;border:4px double var(--accent)}
.cs-fantasy .cs-c1{left:10px;top:10px}.cs-fantasy .cs-c2{right:10px;top:10px}
.cs-fantasy .cs-c3{left:10px;bottom:10px}.cs-fantasy .cs-c4{right:10px;bottom:10px}
.cs-fantasy .cs-head{flex:none;height:182px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;overflow:hidden}
.cs-fantasy .cs-f-title{max-width:100%;font-size:26px;font-style:italic;letter-spacing:.06em;line-height:1.3;color:var(--accent)}
.cs-fantasy .cs-name-wrap{width:100%;height:92px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.cs-fantasy .cs-f-name{max-width:100%;font-size:68px;line-height:1.1;font-weight:700;letter-spacing:.02em;text-shadow:0 2px 0 rgba(255,246,220,.9)}
.cs-fantasy .cs-f-name.cs-long{font-size:40px;line-height:1.15}
.cs-fantasy .cs-rule{width:74%;display:flex;align-items:center;gap:14px}
.cs-fantasy .cs-rule-line{flex:1;height:5px;border-top:1px solid var(--gold);border-bottom:1px solid var(--gold)}
.cs-fantasy .cs-gem{width:14px;height:14px;transform:rotate(45deg);background:var(--accent);border:2px solid var(--gold)}
.cs-fantasy .cs-meta{max-width:100%;display:flex;justify-content:center;gap:14px;font-size:24px;letter-spacing:.05em}
.cs-fantasy .cs-meta .cs-text{min-width:0;max-width:46%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-fantasy .cs-body{flex:1;min-height:0;display:flex;gap:40px}
.cs-fantasy .cs-col-l{width:396px;flex:none;min-height:0;display:flex;flex-direction:column;gap:14px}
.cs-fantasy .cs-col-r{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:space-between;gap:12px;overflow:hidden}
.cs-fantasy .cs-col-r>*{flex:none}
.cs-fantasy .cs-art-wrap{position:relative;flex:1;min-height:120px}
.cs-fantasy .cs-art{position:absolute;inset:0;border:7px double #6f4719;background:#1d2b46;box-shadow:0 0 0 3px rgba(255,246,220,.75),0 8px 20px rgba(70,40,10,.35)}
.cs-fantasy .cs-seal{position:absolute;right:-16px;bottom:-16px;width:92px;height:92px;border-radius:50%;border:4px double rgba(255,232,196,.85);
background:radial-gradient(circle at 34% 30%,#e0705f,var(--accent) 58%,#401010);box-shadow:0 5px 12px rgba(40,10,10,.5);color:var(--accent-ink);font-size:42px}
.cs-fantasy .cs-block{flex:none}
.cs-fantasy .cs-section-title{font-size:21px;line-height:1.3;letter-spacing:.24em;text-align:center;font-weight:700;color:var(--accent);padding-bottom:4px;margin-bottom:6px;border-bottom:1px solid var(--gold)}
.cs-fantasy .cs-section-title::before,.cs-fantasy .cs-section-title::after{content:"◆";font-size:11px;margin:0 10px;vertical-align:middle;color:var(--gold)}
.cs-fantasy .cs-stats-radar{display:flex;flex-direction:column;align-items:center;gap:6px;color:#7a5a2c}
.cs-fantasy .cs-stats-radar>.cs-section-title{align-self:stretch;margin-bottom:0}
.cs-fantasy .cs-radar{width:286px}
.cs-fantasy .cs-stat-list{width:100%;display:grid;grid-template-columns:1fr 1fr;column-gap:20px;font-size:18px;color:var(--ink)}
.cs-fantasy .cs-stat{gap:8px;line-height:1.5;border-bottom:1px dotted rgba(90,56,24,.5)}
.cs-fantasy .cs-stat-label{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-fantasy .cs-stat-value{min-width:0;font-weight:700;color:var(--accent)}
.cs-fantasy .cs-tags{flex:none;max-height:104px;overflow:hidden;gap:8px}
.cs-fantasy .cs-tag{max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:3px 12px;font-size:16px;border:1px solid var(--accent);border-radius:999px;background:rgba(255,248,222,.5)}
.cs-fantasy .cs-quote-box{position:relative;padding:12px 18px 12px 56px;border-left:4px solid var(--accent);background:rgba(255,248,222,.45)}
.cs-fantasy .cs-quote-box::before{content:"“";position:absolute;left:14px;top:-6px;font-size:70px;line-height:1;color:var(--accent);opacity:.75}
.cs-fantasy .cs-quote{font-size:23px;line-height:1.45;font-style:italic}
.cs-fantasy .cs-f-summary{font-size:19px;line-height:1.5}
.cs-fantasy .cs-details .cs-row{gap:12px;padding:3px 2px;font-size:18px;line-height:1.4;border-bottom:1px dotted rgba(90,56,24,.5)}
.cs-fantasy .cs-label{width:84px;flex:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;font-weight:700;letter-spacing:.12em;color:var(--accent)}
.cs-fantasy .cs-details .cs-f-custom{padding:1px 2px;font-size:16px;line-height:1.3}
.cs-fantasy .cs-details .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-fantasy .cs-moods{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cs-fantasy .cs-moods .cs-row{flex-direction:column;gap:2px;padding:6px 10px;border:1px solid rgba(90,56,24,.35);background:rgba(255,248,222,.4)}
.cs-fantasy .cs-moods .cs-label{width:auto}
.cs-fantasy .cs-moods .cs-value{font-size:17px;line-height:1.4;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.cs-fantasy .cs-skill{display:flex;flex-direction:column;padding:4px 0;border-bottom:1px dotted rgba(90,56,24,.5)}
.cs-fantasy .cs-skill-name{font-size:19px;font-weight:700;line-height:1.3;color:var(--accent);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-fantasy .cs-skill-desc{font-size:16px;line-height:1.4;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-fantasy .cs-story{flex:1 1 0;min-height:118px;overflow:hidden;-webkit-mask-image:linear-gradient(#000 calc(100% - 34px),rgba(0,0,0,0))}
.cs-fantasy .cs-f-backstory{font-size:18px;line-height:1.5;text-align:justify}
`;

function block(node, extra) {
  return node ? h('section', { class: cls('cs-block', extra) }, node) : null;
}

function header(vm) {
  const race = textField(vm, 'race', 'span');
  const role = textField(vm, 'role', 'span');
  return h('header', { class: 'cs-head' },
    textField(vm, 'title', 'div', 'cs-clamp-1'),
    h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls('cs-clamp-2', Array.from(vm.name).length > 12 && 'cs-long'))),
    h('div', { class: 'cs-rule', 'aria-hidden': 'true' }, h('div', { class: 'cs-rule-line' }), h('div', { class: 'cs-gem' }), h('div', { class: 'cs-rule-line' })),
    race || role ? h('div', { class: 'cs-meta' }, race, race && role ? h('span', { class: 'cs-dot' }, '·') : null, role) : null);
}

/** Profile rows plus up to three compact custom rows; null when `profile` is hidden or no row is left. */
function details(vm) {
  if (vm.isHidden('profile')) return null;
  const rows = [...fieldRows(vm, ['age', 'gender', 'affiliation', 'height', 'birthday']), ...customRows(vm).slice(0, 3)].filter(Boolean);
  return rows.length ? h('div', { class: 'cs-details' }, rows) : null;
}

/** Backstory section: the marker element holds the editable title and the text; null when hidden or empty. */
function story(vm) {
  if (!vm.backstory || vm.isHidden('backstory')) return null;
  return h('section', { class: 'cs-block cs-story cs-f-backstory' }, sectionLabel(vm, 'backstory'), h('p', { class: 'cs-text' }, vm.backstory));
}

function render(vm) {
  const moods = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  const quote = quoteBlock(vm, 'cs-clamp-3');
  return sheet(META, vm,
    ['c1', 'c2', 'c3', 'c4'].map((n) => h('div', { class: `cs-corner cs-${n}`, 'aria-hidden': 'true' })),
    header(vm),
    h('div', { class: 'cs-body' },
      h('div', { class: 'cs-col-l' },
        h('div', { class: 'cs-art-wrap' }, artSlot(vm), iconSlot(vm, 'cs-seal')),
        block(statRadar(vm, '', sectionLabel(vm, 'stats'))),
        tagList(vm)),
      h('div', { class: 'cs-col-r' },
        quote ? h('div', { class: 'cs-quote-box' }, quote) : null,
        textField(vm, 'summary', 'p', 'cs-clamp-4'),
        details(vm),
        moods.length ? h('div', { class: 'cs-moods' }, moods) : null,
        block(skillList(vm, '', sectionLabel(vm, 'skills'))),
        story(vm))));
}

export default { ...META, css, render };
