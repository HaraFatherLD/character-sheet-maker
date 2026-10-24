// Design: holographic HUD. Dark grid background, angular clip-path panels, monospace labels, glowing stat bars.
// Fixed geometry: strip 24 / id panel 140 / row1 580 / row2 flexible / row3 200, all inside a 40px padding.
import { h } from '../core/vnode.js';
import { FONT_SANS, FONT_MONO, cls, sheet, textField, fieldRows, customRows, tagList, statBars, skillList, artSlot, iconSlot, quoteBlock } from './parts.js';

const META = { id: 'scifi', label: 'SF 홀로그램 HUD', size: { w: 1000, h: 1414 }, defaultAccent: '#2de2ff' };
const CUT = 'polygon(18px 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%,0 18px)';
const CUT_IN = 'polygon(17px 0,100% 0,100% calc(100% - 17px),calc(100% - 17px) 100%,0 100%,0 17px)';

const css = `
.cs-scifi{--ink:#cfeeff;display:flex;flex-direction:column;gap:14px;padding:40px;font-family:${FONT_SANS};font-size:17px;color:var(--ink);background:#050b16;
background:radial-gradient(ellipse at 15% 0%,color-mix(in srgb,var(--accent) 26%,transparent),transparent 55%),radial-gradient(ellipse at 90% 100%,rgba(120,80,255,.22),transparent 55%),repeating-linear-gradient(0deg,rgba(120,220,255,.05) 0 1px,transparent 1px 40px),repeating-linear-gradient(90deg,rgba(120,220,255,.05) 0 1px,transparent 1px 40px),linear-gradient(180deg,#06101f,#040913)}
.cs-scifi .cs-panel{position:relative;display:flex;min-height:0;padding:1px;clip-path:${CUT};background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 22%,transparent) 50%,var(--accent))}
.cs-scifi .cs-panel-in{position:relative;flex:1;min-width:0;min-height:0;overflow:hidden;padding:14px 20px;clip-path:${CUT_IN};background:linear-gradient(180deg,rgba(9,32,56,.97),rgba(4,14,27,.98))}
.cs-scifi .cs-section-title{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-family:${FONT_MONO};font-size:14px;line-height:20px;letter-spacing:.14em;color:var(--accent)}
.cs-scifi .cs-section-title::before{content:"";width:8px;height:8px;background:var(--accent);box-shadow:0 0 8px var(--accent)}
.cs-scifi .cs-section-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--accent),transparent)}
.cs-scifi .cs-strip{flex:none;height:24px;display:flex;justify-content:space-between;align-items:center;font-family:${FONT_MONO};font-size:13px;letter-spacing:.2em;color:var(--accent)}
.cs-scifi .cs-strip-bars{display:flex;gap:4px}
.cs-scifi .cs-strip-bars div{width:26px;height:8px;background:var(--accent);clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.cs-scifi .cs-strip-bars div:nth-child(n+3){opacity:.4}
.cs-scifi .cs-id{flex:none;height:140px}
.cs-scifi .cs-id .cs-panel-in{display:flex;align-items:center;gap:22px;padding:12px 24px}
.cs-scifi .cs-hex{flex:none;width:96px;height:96px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:linear-gradient(135deg,var(--accent),#3a2bd6);color:var(--accent-ink);font-family:${FONT_MONO};font-size:46px}
.cs-scifi .cs-id-text{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px}
.cs-scifi .cs-name-wrap{height:56px;display:flex;align-items:center}
.cs-scifi .cs-f-name{min-width:0;max-width:100%;font-size:46px;line-height:1.15;font-weight:700;letter-spacing:.04em;color:#fff;text-shadow:0 0 14px color-mix(in srgb,var(--accent) 60%,transparent)}
.cs-scifi .cs-f-name.cs-long{font-size:24px}
.cs-scifi .cs-f-title{font-family:${FONT_MONO};font-size:19px;line-height:1.3;color:var(--accent)}
.cs-scifi .cs-chips{display:flex;gap:10px;margin-top:4px}
.cs-scifi .cs-chips .cs-text{min-width:0;max-width:46%;padding:2px 14px;font-size:15px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;border:1px solid var(--accent);background:rgba(45,226,255,.08);clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.cs-scifi .cs-row1{flex:none;height:580px;display:flex;gap:14px}
.cs-scifi .cs-art-panel{flex:0 0 420px}
.cs-scifi .cs-art-panel .cs-panel-in{padding:0}
.cs-scifi .cs-art{position:absolute;inset:8px;background:#06182c}
.cs-scifi .cs-scan{position:absolute;inset:8px;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,0) 0 2px,rgba(80,220,255,.09) 2px 3px),linear-gradient(180deg,color-mix(in srgb,var(--accent) 14%,transparent),rgba(120,80,255,.14))}
.cs-scifi .cs-art-panel .cs-tags{position:absolute;left:20px;right:20px;bottom:20px;max-height:72px;overflow:hidden;gap:6px}
.cs-scifi .cs-tag{max-width:100%;padding:2px 10px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_MONO};font-size:14px;border:1px solid var(--accent);background:rgba(3,12,24,.78)}
.cs-scifi .cs-info-col{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:14px}
.cs-scifi .cs-quote-panel{flex:none;height:126px}
.cs-scifi .cs-quote-panel .cs-panel-in{padding-left:30px}
.cs-scifi .cs-quote-panel .cs-panel-in::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:3px;background:var(--accent);box-shadow:0 0 10px var(--accent)}
.cs-scifi .cs-quote{font-size:21px;line-height:1.4;font-style:italic;color:#fff}
.cs-scifi .cs-sum-panel{flex:1 1 0}
.cs-scifi .cs-f-summary,.cs-scifi .cs-f-backstory{font-size:17px;line-height:1.5}
.cs-scifi .cs-info-panel{flex:none;height:268px}
.cs-scifi .cs-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;margin-bottom:8px}
.cs-scifi .cs-grid .cs-f-affiliation{grid-column:1 / -1}
.cs-scifi .cs-info-panel .cs-row{gap:10px;font-size:16px;line-height:1.4;padding:3px 0;border-bottom:1px solid rgba(45,226,255,.18)}
.cs-scifi .cs-label{width:62px;flex:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_MONO};font-size:13px;color:var(--accent)}
.cs-scifi .cs-info-panel .cs-f-custom{padding:1px 0;font-size:14px;line-height:1.3}
.cs-scifi .cs-grid .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-scifi .cs-moods .cs-value{font-size:15px;line-height:1.35;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.cs-scifi .cs-row2{flex:1;min-height:0;display:flex;gap:14px}
.cs-scifi .cs-stat-panel{flex:0 0 420px}
.cs-scifi .cs-stat-panel:only-child{flex:1}
.cs-scifi .cs-stat-panel .cs-panel-in{display:flex;flex-direction:column}
.cs-scifi .cs-stats-bars{flex:1;display:flex;flex-direction:column}
.cs-scifi .cs-stat{height:34px;gap:12px;margin:auto 0}
.cs-scifi .cs-stat-label{width:86px;flex:none;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_MONO};font-size:15px;color:#8fd8ee}
.cs-scifi .cs-bar{height:12px;overflow:visible;border:1px solid color-mix(in srgb,var(--accent) 55%,transparent);background:repeating-linear-gradient(90deg,rgba(255,255,255,.08) 0 1px,rgba(45,226,255,.06) 1px 10%)}
.cs-scifi .cs-bar-fill{background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 35%,transparent),var(--accent));box-shadow:0 0 12px var(--accent)}
.cs-scifi .cs-stat-value{min-width:82px;font-family:${FONT_MONO};font-size:17px;color:var(--accent);text-shadow:0 0 8px var(--accent)}
.cs-scifi .cs-skill-panel{flex:1;min-width:0}
.cs-scifi .cs-skills{counter-reset:sk}
.cs-scifi .cs-skill{counter-increment:sk;position:relative;height:44px;padding:3px 0 3px 40px;overflow:hidden;border-bottom:1px solid rgba(45,226,255,.18)}
.cs-scifi .cs-skill::before{content:counter(sk,decimal-leading-zero);position:absolute;left:0;top:50%;transform:translateY(-50%);font-family:${FONT_MONO};font-size:18px;color:var(--accent)}
.cs-scifi .cs-skill-name,.cs-scifi .cs-skill-desc{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-scifi .cs-skill-name{font-size:17px;line-height:1.25;font-weight:700}
.cs-scifi .cs-skill-desc{font-size:14px;line-height:1.3;color:#8fb9cc}
.cs-scifi .cs-story-panel{flex:none;height:200px}
`;

const panel = (extra, ...children) => h('section', { class: cls('cs-panel', extra) }, h('div', { class: 'cs-panel-in' }, ...children));
const wrap = (extra, node) => (node ? panel(extra, node) : null);
const group = (className, nodes) => (nodes.length ? h('div', { class: className }, nodes) : null);
/** Section title: the editable label as its own text node plus a decorative English tag. Null when the section is hidden. */
const title = (vm, key, sub) => (vm.isHidden(key) ? null : h('h3', { class: 'cs-section-title' }, vm.label(key), h('span', { class: 'cs-sub' }, sub)));

function identity(vm) {
  const long = Array.from(vm.name).length > 14;
  const chips = [textField(vm, 'race', 'span'), textField(vm, 'role', 'span')].filter(Boolean);
  return panel('cs-id', iconSlot(vm, 'cs-hex'), h('div', { class: 'cs-id-text' },
    h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls('cs-clamp-2', long && 'cs-long'))),
    textField(vm, 'title', 'div', 'cs-clamp-1'),
    group('cs-chips', chips)));
}

/** Profile + up to four compact custom rows in the grid, likes/dislikes below. Null when nothing is left to show. */
function infoPanel(vm) {
  const rows = vm.isHidden('profile') ? [] : [...fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation']), ...customRows(vm).slice(0, 4)].filter(Boolean);
  const moods = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  if (rows.length + moods.length === 0) return null;
  return panel('cs-info-panel', rows.length ? title(vm, 'profile', '// PROFILE') : null, group('cs-grid', rows), group('cs-moods', moods));
}

/** Backstory panel: the marker element holds the editable title and the text; null when hidden or empty. */
function story(vm) {
  if (!vm.backstory || vm.isHidden('backstory')) return null;
  return panel('cs-story-panel', h('div', { class: 'cs-f-backstory' }, title(vm, 'backstory', '// LOG'), h('p', { class: 'cs-text cs-clamp-5' }, vm.backstory)));
}

function render(vm) {
  const summary = textField(vm, 'summary', 'p', 'cs-clamp-4');
  return sheet(META, vm,
    h('div', { class: 'cs-strip', 'aria-hidden': 'true' }, h('span', null, 'CHARACTER FILE // 캐릭터 파일'),
      h('div', { class: 'cs-strip-bars' }, [1, 2, 3, 4].map(() => h('div')))),
    identity(vm),
    h('div', { class: 'cs-row1' },
      panel('cs-art-panel', artSlot(vm), h('div', { class: 'cs-scan' }), tagList(vm)),
      h('div', { class: 'cs-info-col' },
        wrap('cs-quote-panel', quoteBlock(vm, 'cs-clamp-3')),
        summary ? panel('cs-sum-panel', title(vm, 'summary', '// SUMMARY'), summary) : null,
        infoPanel(vm))),
    h('div', { class: 'cs-row2' },
      wrap('cs-stat-panel', statBars(vm, '', title(vm, 'stats', '// STATS'))),
      wrap('cs-skill-panel', skillList(vm, '', title(vm, 'skills', '// SKILLS')))),
    story(vm));
}

export default { ...META, css, render };
