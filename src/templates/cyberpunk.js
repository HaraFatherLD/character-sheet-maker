// Design: neon night-city dossier. Near-black backdrop with magenta/cyan glow, a skewed name plate with glitch text,
// slanted clip-path panels, scanlines, hazard stripes and glowing stat bars.
// Geometry inside a 44px/50px padding: HUD 34 / name plate 186 / main row flexible (462px text column + 408px art column) / footer 14.
import { h } from '../core/vnode.js';
import { FONT_SANS, FONT_MONO, cls, sheet, textField, fieldRows, customRows, tagList, statBars, skillList, artSlot, iconSlot, quoteBlock } from './parts.js';

const META = { id: 'cyberpunk', label: '사이버펑크 네온', size: { w: 1000, h: 1414 }, defaultAccent: '#ff2bd6' };
const SLANT = (s) => `polygon(${s}px 0,100% 0,calc(100% - ${s}px) 100%,0 100%)`;
const GLOW = (c) => `drop-shadow(0 0 7px ${c})`;

const css = `
.cs-cyberpunk{--cy:#19f0ff;--ink:#e9e6ff;z-index:0;display:flex;flex-direction:column;gap:14px;padding:44px 50px;font-family:${FONT_SANS};font-size:17px;color:var(--ink);
background:radial-gradient(ellipse at 92% 4%,color-mix(in srgb,var(--accent) 34%,transparent),transparent 52%),radial-gradient(ellipse at 4% 98%,rgba(25,240,255,.22),transparent 50%),repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 1px,transparent 1px 60px),repeating-linear-gradient(0deg,rgba(255,255,255,.03) 0 1px,transparent 1px 60px),linear-gradient(180deg,#0b0616,#06040d)}
.cs-cyberpunk::after{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.3) 0 1px,rgba(255,255,255,.03) 1px 3px)}
.cs-cyberpunk .cs-hud{flex:none;height:34px;display:flex;align-items:center;justify-content:space-between;font-family:${FONT_MONO};font-size:13px;letter-spacing:.2em;color:var(--cy);text-shadow:0 0 8px var(--cy)}
.cs-cyberpunk .cs-hud-r{display:flex;align-items:center;gap:18px}
.cs-cyberpunk .cs-tab{padding:4px 26px;transform:skewX(-20deg);background:var(--accent);box-shadow:0 0 14px var(--accent)}
.cs-cyberpunk .cs-tab span{display:block;transform:skewX(20deg);color:var(--accent-ink);font-weight:700;text-shadow:none}
.cs-cyberpunk .cs-warn{width:210px;height:16px;transform:skewX(-30deg);background:repeating-linear-gradient(-45deg,#ffe600 0 10px,#0a0a0a 10px 20px);box-shadow:0 0 10px rgba(255,230,0,.4)}
.cs-cyberpunk .cs-foot{flex:none;height:14px;transform:skewX(-30deg);background:repeating-linear-gradient(-45deg,var(--accent) 0 10px,#0a0a0a 10px 20px);box-shadow:0 0 12px color-mix(in srgb,var(--accent) 60%,transparent)}
.cs-cyberpunk .cs-plate{flex:none;height:186px;transform:skewX(-8deg);border:2px solid var(--accent);background:linear-gradient(100deg,color-mix(in srgb,var(--accent) 24%,#0a0614),#0a0614 62%);box-shadow:0 0 16px color-mix(in srgb,var(--accent) 60%,transparent),inset 0 0 28px color-mix(in srgb,var(--accent) 18%,transparent)}
.cs-cyberpunk .cs-plate-in{height:100%;transform:skewX(8deg);display:flex;align-items:center;gap:20px;padding:12px 44px;overflow:hidden}
.cs-cyberpunk .cs-text-col{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:4px}
.cs-cyberpunk .cs-name-wrap{height:92px;display:flex;align-items:center}
.cs-cyberpunk .cs-f-name{min-width:0;max-width:100%;font-weight:900;letter-spacing:.02em;color:#fff;text-shadow:-4px 0 0 rgba(25,240,255,.9),4px 0 0 color-mix(in srgb,var(--accent) 90%,transparent),0 0 24px var(--accent)}
.cs-cyberpunk .cs-n1,.cs-cyberpunk .cs-n2{margin-left:-8px;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cs-cyberpunk .cs-n1{font-size:76px;line-height:1.2}.cs-cyberpunk .cs-n2{font-size:52px;line-height:1.2}.cs-cyberpunk .cs-n3{font-size:32px;line-height:1.2}
.cs-cyberpunk .cs-title-line{display:flex;align-items:center;gap:10px;height:28px}
.cs-cyberpunk .cs-title-line::before{content:"//";font-family:${FONT_MONO};font-size:20px;color:var(--accent);text-shadow:0 0 8px var(--accent)}
.cs-cyberpunk .cs-f-title{flex:1;min-width:0;font-family:${FONT_MONO};font-size:20px;line-height:28px;letter-spacing:.06em;color:var(--cy);text-shadow:0 0 10px var(--cy)}
.cs-cyberpunk .cs-chips{display:flex;gap:18px;height:34px;align-items:center}
.cs-cyberpunk .cs-chip{min-width:0;max-width:46%;padding:3px 22px;transform:skewX(-14deg);border:1px solid var(--cy);background:rgba(25,240,255,.1);box-shadow:0 0 10px rgba(25,240,255,.35)}
.cs-cyberpunk .cs-chip:has(.cs-text:empty){display:none}
.cs-cyberpunk .cs-chip .cs-text{display:block;transform:skewX(14deg);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:16px;line-height:24px;color:#d9fbff}
.cs-cyberpunk .cs-icon-pw{flex:none;width:128px;height:128px;filter:${GLOW('color-mix(in srgb,var(--accent) 70%,transparent)')}}
.cs-cyberpunk .cs-icon-in{width:100%;height:100%;clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px));background:linear-gradient(135deg,var(--accent),#6a1fff);color:var(--accent-ink);font-size:68px;text-shadow:0 0 14px color-mix(in srgb,var(--accent-ink) 45%,transparent)}
.cs-cyberpunk .cs-main{flex:1;min-height:0;display:flex;gap:30px}
.cs-cyberpunk .cs-col-l{flex:0 0 462px;min-width:0;min-height:0;display:flex;flex-direction:column;gap:16px}
.cs-cyberpunk .cs-col-r{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:16px}
.cs-cyberpunk .cs-pw{flex:none;display:flex;min-width:0;min-height:0;filter:${GLOW('color-mix(in srgb,var(--accent) 65%,transparent)')}}
.cs-cyberpunk .cs-pw.cs-cy{filter:${GLOW('rgba(25,240,255,.6)')}}
.cs-cyberpunk .cs-panel{flex:1;display:flex;min-width:0;min-height:0;padding:2px;clip-path:${SLANT(16)};background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 25%,transparent) 48%,var(--cy))}
.cs-cyberpunk .cs-cy .cs-panel{background:linear-gradient(135deg,var(--cy),rgba(25,240,255,.2) 50%,var(--accent))}
.cs-cyberpunk .cs-panel-in{position:relative;flex:1;min-width:0;min-height:0;overflow:hidden;padding:14px 28px;clip-path:${SLANT(17)};background:linear-gradient(160deg,rgba(38,10,52,.97),rgba(8,5,20,.98))}
.cs-cyberpunk .cs-section-title{display:flex;align-items:center;gap:10px;margin-bottom:8px;font-family:${FONT_MONO};font-size:14px;line-height:20px;letter-spacing:.2em;color:var(--cy);text-shadow:0 0 8px var(--cy)}
.cs-cyberpunk .cs-section-title::before{content:"";flex:none;width:24px;height:10px;transform:skewX(-30deg);background:var(--accent);box-shadow:0 0 8px var(--accent)}
.cs-cyberpunk .cs-section-title::after{content:"";flex:1;height:2px;background:linear-gradient(90deg,var(--cy),transparent)}
.cs-cyberpunk .cs-quote-pw .cs-panel-in{padding-left:48px}
.cs-cyberpunk .cs-quote-pw .cs-panel-in::before{content:"";position:absolute;left:30px;top:14px;bottom:14px;width:4px;background:var(--cy);box-shadow:0 0 10px var(--cy)}
.cs-cyberpunk .cs-quote{font-size:20px;line-height:28px;font-weight:700;color:#fff;text-shadow:0 0 12px color-mix(in srgb,var(--accent) 60%,transparent)}
.cs-cyberpunk .cs-sum-pw{flex:0 2 auto}
.cs-cyberpunk .cs-f-summary{font-size:17px;line-height:25px;color:#dcd9f5}
.cs-cyberpunk .cs-det{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}
.cs-cyberpunk .cs-det .cs-row{min-width:0;height:30px;align-items:center;gap:10px;border-bottom:1px solid rgba(25,240,255,.2)}
.cs-cyberpunk .cs-det .cs-f-affiliation,.cs-cyberpunk .cs-det .cs-f-likes,.cs-cyberpunk .cs-det .cs-f-dislikes{grid-column:1 / -1}
.cs-cyberpunk .cs-det .cs-f-likes,.cs-cyberpunk .cs-det .cs-f-dislikes{height:46px}
.cs-cyberpunk .cs-label{flex:none;width:50px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_MONO};font-size:13px;letter-spacing:.06em;color:var(--cy)}
.cs-cyberpunk .cs-det .cs-f-custom{height:26px}
.cs-cyberpunk .cs-det .cs-f-custom .cs-label{width:64px}
.cs-cyberpunk .cs-det .cs-f-affiliation .cs-label,.cs-cyberpunk .cs-det .cs-f-likes .cs-label,.cs-cyberpunk .cs-det .cs-f-dislikes .cs-label{width:96px}
.cs-cyberpunk .cs-det .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:16px}
.cs-cyberpunk .cs-det .cs-f-likes .cs-value,.cs-cyberpunk .cs-det .cs-f-dislikes .cs-value{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;white-space:normal;font-size:15px;line-height:21px}
.cs-cyberpunk .cs-skill-pw{flex:0 3 auto}
.cs-cyberpunk .cs-skills{counter-reset:sk}
.cs-cyberpunk .cs-skill{counter-increment:sk;position:relative;height:50px;padding:3px 0 3px 46px;overflow:hidden;border-bottom:1px solid rgba(255,43,214,.25)}
.cs-cyberpunk .cs-skill::before{content:counter(sk,decimal-leading-zero);position:absolute;left:0;top:11px;height:26px;padding:0 6px;transform:skewX(-20deg);line-height:26px;font-family:${FONT_MONO};font-size:15px;font-weight:700;color:#18001c;background:var(--cy);box-shadow:0 0 10px var(--cy)}
.cs-cyberpunk .cs-skill-name,.cs-cyberpunk .cs-skill-desc{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-cyberpunk .cs-skill-name{font-size:17px;line-height:23px;font-weight:700;color:#fff}.cs-cyberpunk .cs-skill-desc{font-size:14px;line-height:20px;color:#b9b3d9}
.cs-cyberpunk .cs-story-pw{flex:1 1 0;min-height:96px}
.cs-cyberpunk .cs-story-pw .cs-panel-in{display:flex;flex-direction:column}
.cs-cyberpunk .cs-story-pw .cs-f-backstory{flex:1;min-height:0;overflow:hidden;font-size:16px;line-height:24px;color:#d3cfee;-webkit-mask-image:linear-gradient(#000 calc(100% - 26px),rgba(0,0,0,0))}
.cs-cyberpunk .cs-art-pw{flex:1 1 0}
.cs-cyberpunk .cs-art-pw .cs-panel{clip-path:${SLANT(34)}}
.cs-cyberpunk .cs-art-pw .cs-panel-in{padding:0;clip-path:${SLANT(35)}}
.cs-cyberpunk .cs-art-pw .cs-art{position:absolute;left:0;top:0;right:0;bottom:0;background:#14082a}
.cs-cyberpunk .cs-art-pw .cs-panel-in::after{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;background:linear-gradient(rgba(25,240,255,.22),rgba(25,240,255,.22)) 0 38%/100% 9px no-repeat,linear-gradient(color-mix(in srgb,var(--accent) 24%,transparent),color-mix(in srgb,var(--accent) 24%,transparent)) 0 62%/100% 5px no-repeat,repeating-linear-gradient(0deg,rgba(0,0,0,0) 0 2px,rgba(255,43,214,.08) 2px 3px),linear-gradient(180deg,rgba(255,43,214,.1),rgba(25,240,255,.1))}
.cs-cyberpunk .cs-art-pw .cs-tags{position:absolute;left:16px;right:44px;bottom:20px;max-height:70px;padding:2px 8px;overflow:hidden;gap:8px}
.cs-cyberpunk .cs-tag{max-width:100%;padding:3px 14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;transform:skewX(-14deg);font-size:15px;line-height:20px;color:#fff;background:rgba(8,4,20,.84);border:1px solid var(--accent);box-shadow:0 0 8px color-mix(in srgb,var(--accent) 60%,transparent)}
.cs-cyberpunk .cs-tag:nth-child(even){border-color:var(--cy);box-shadow:0 0 8px rgba(25,240,255,.5)}
.cs-cyberpunk .cs-stat-pw{flex:none}
.cs-cyberpunk .cs-stat{height:40px;gap:12px}
.cs-cyberpunk .cs-stat-label{width:62px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_MONO};font-size:14px;color:var(--cy)}
.cs-cyberpunk .cs-bar{height:14px;overflow:visible;transform:skewX(-24deg);border:1px solid color-mix(in srgb,var(--accent) 70%,transparent);background:rgba(255,255,255,.05)}
.cs-cyberpunk .cs-bar-fill{background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 35%,transparent),var(--accent));box-shadow:0 0 12px var(--accent)}
.cs-cyberpunk .cs-stat:nth-child(odd) .cs-bar-fill{background:linear-gradient(90deg,rgba(25,240,255,.3),var(--cy));box-shadow:0 0 12px var(--cy)}
.cs-cyberpunk .cs-stat-value{width:84px;min-width:0;white-space:nowrap;font-family:${FONT_MONO};font-size:16px;color:#fff;text-shadow:0 0 8px var(--accent)}
`;

const panel = (extra, ...kids) => h('div', { class: cls('cs-pw', extra) }, h('section', { class: 'cs-panel' }, h('div', { class: 'cs-panel-in' }, ...kids)));
/** A panel around `node` with an optional head title; null when `node` is absent, hidden or empty. */
const wrap = (extra, node, head = null) => (node ? panel(extra, head, node) : null);
/** Section title: a decorative English tag, then the editable label as its own text node. Null when the section is hidden. */
const title = (vm, key, sub) => (vm.isHidden(key) ? null : h('h3', { class: 'cs-section-title' }, h('span', { class: 'cs-sub' }, sub), vm.label(key)));
const chip = (vm, key) => {
  const node = textField(vm, key, 'span');
  return node ? h('span', { class: 'cs-chip' }, node) : null;
};

function plate(vm) {
  const n = Array.from(vm.name).length;
  const tier = n <= 8 ? 'cs-n1' : n <= 12 ? 'cs-n2' : 'cs-n3';
  const heading = textField(vm, 'title', 'div', 'cs-clamp-1');
  const icon = iconSlot(vm, 'cs-icon-in');
  const chips = [chip(vm, 'race'), chip(vm, 'role')].filter(Boolean);
  return h('header', { class: 'cs-plate' }, h('div', { class: 'cs-plate-in' },
    h('div', { class: 'cs-text-col' },
      h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls(tier === 'cs-n3' && 'cs-clamp-2', tier))),
      heading ? h('div', { class: 'cs-title-line' }, heading) : null,
      chips.length ? h('div', { class: 'cs-chips' }, chips) : null),
    icon ? h('div', { class: 'cs-icon-pw' }, icon) : null));
}

/** Detail panel: profile rows, up to four compact custom rows, then likes/dislikes. Null when nothing is left to show. */
function detailPanel(vm) {
  const profile = vm.isHidden('profile') ? [] : [...fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation']), ...customRows(vm).slice(0, 4)].filter(Boolean);
  const moods = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  if (profile.length + moods.length === 0) return null;
  return panel('cs-cy cs-det-pw', profile.length ? title(vm, 'profile', 'PROFILE //') : null, h('div', { class: 'cs-det' }, [...profile, ...moods]));
}

/** Backstory panel: the marker element holds the editable title and the text; null when hidden or empty. */
function story(vm) {
  if (!vm.backstory || vm.isHidden('backstory')) return null;
  return panel('cs-cy cs-story-pw', h('div', { class: 'cs-f-backstory' }, title(vm, 'backstory', 'LOG //'), h('p', { class: 'cs-text' }, vm.backstory)));
}

function render(vm) {
  return sheet(META, vm,
    h('div', { class: 'cs-hud', 'aria-hidden': 'true' }, h('div', { class: 'cs-tab' }, h('span', null, 'SYS//PROFILE.DAT')),
      h('div', { class: 'cs-hud-r' }, h('span', null, 'NEON GRID ONLINE'), h('div', { class: 'cs-warn' }))),
    plate(vm),
    h('div', { class: 'cs-main' },
      h('div', { class: 'cs-col-l' },
        wrap('cs-quote-pw', quoteBlock(vm, 'cs-clamp-5')),
        wrap('cs-sum-pw', textField(vm, 'summary', 'p', 'cs-clamp-7'), title(vm, 'summary', 'SUMMARY //')),
        detailPanel(vm),
        wrap('cs-skill-pw', skillList(vm, '', title(vm, 'skills', 'SKILLS //'))),
        story(vm)),
      h('div', { class: 'cs-col-r' },
        panel('cs-art-pw', artSlot(vm), tagList(vm)),
        wrap('cs-cy cs-stat-pw', statBars(vm, '', title(vm, 'stats', 'STATS //'))))),
    h('div', { class: 'cs-foot', 'aria-hidden': 'true' }));
}

export default { ...META, css, render };
