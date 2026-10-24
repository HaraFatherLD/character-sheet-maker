// Design "vertical" (세로형 모바일): one column, no side-by-side layout. Centered art, centered name block, the info
// blocks, then the main blocks, all full width with phone-sized type. Auto height; every colour is a --c-* token.
import { h } from '../core/vnode.js';
import { PALETTE_DEFAULTS } from '../core/palettes.js';
import { FONT_SANS, artSlot, cls, iconSlot, sheet, textField } from './parts.js';
import { areaNode, nameTier } from './blocks.js';

const META = { id: 'vertical', size: { w: 720, h: null, minH: 1280 }, defaultAccent: PALETTE_DEFAULTS.vertical.accent };

const CSS = `.cs-vertical{display:flex;flex-direction:column;gap:34px;padding:48px 40px 60px;background:var(--c-bg);color:var(--c-text);font-family:${FONT_SANS};font-size:24px;line-height:1.6}
.cs-vertical .cs-art-wrap{position:relative}
.cs-vertical .cs-art{position:relative;aspect-ratio:5 / 6;border-radius:40px;background:var(--c-chip);box-shadow:0 18px 44px color-mix(in srgb,var(--c-title) 18%,transparent)}
.cs-vertical .cs-art > img,.cs-vertical .cs-art > svg{position:absolute;top:0;left:0;width:100%;height:100%}
.cs-vertical .cs-icon-badge{position:absolute;right:22px;bottom:22px;width:104px;height:104px;border:5px solid var(--c-bg);border-radius:32px;background:var(--c-accent);color:var(--accent-ink);font-size:46px}
.cs-vertical .cs-head{text-align:center}
.cs-vertical .cs-name{font-size:60px;line-height:1.14;font-weight:800;color:var(--c-title)}
.cs-vertical .cs-name.cs-n2{font-size:48px}
.cs-vertical .cs-name.cs-n3{font-size:38px}
.cs-vertical .cs-name.cs-n4{font-size:32px;line-height:1.25}
.cs-vertical .cs-title{margin-top:10px;font-size:28px;font-weight:700;color:var(--c-accent)}
.cs-vertical .cs-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.cs-vertical .cs-chips:empty,.cs-vertical .cs-chip:empty{display:none}
.cs-vertical .cs-chip{padding:6px 22px;border-radius:999px;background:var(--c-accent);color:var(--accent-ink);font-size:22px;font-weight:700}
.cs-vertical .cs-area{display:flex;flex-direction:column;gap:22px}
.cs-vertical .cs-block{min-width:0;padding:30px 32px;border:1px solid var(--c-line);border-radius:30px;background:var(--c-panel)}
.cs-vertical .cs-block.cs-empty{display:none}
.cs-vertical .cs-quote{border-left:8px solid var(--c-accent);font-size:27px;font-style:italic;line-height:1.55;color:var(--c-title)}
.cs-vertical .cs-section-title{margin-bottom:16px;font-size:20px;font-weight:800;letter-spacing:.05em;color:var(--c-muted)}
.cs-vertical .cs-section-title::before{content:'';display:inline-block;width:11px;height:11px;margin-right:12px;border-radius:50%;background:var(--c-accent)}
.cs-vertical .cs-text,.cs-vertical .cs-block-text{white-space:pre-wrap;font-size:24px;line-height:1.7}
.cs-vertical .cs-rows{display:flex;flex-direction:column}
.cs-vertical .cs-row{gap:20px;padding:12px 0;border-bottom:1px dashed var(--c-line)}
.cs-vertical .cs-rows .cs-row:last-child{border-bottom:0}
.cs-vertical .cs-label{flex:0 0 5.2em;font-size:21px;font-weight:700;color:var(--c-muted)}
.cs-vertical .cs-value{font-weight:600}
.cs-vertical .cs-stats-bars{display:flex;flex-direction:column;gap:18px}
.cs-vertical .cs-stats-bars > .cs-section-title{margin-bottom:0}
.cs-vertical .cs-stat{gap:16px}
.cs-vertical .cs-stat-label{flex:0 0 3.6em;min-width:0;font-size:22px;font-weight:700}
.cs-vertical .cs-bar{height:14px;border-radius:999px;background:color-mix(in srgb,var(--c-text) 14%,transparent)}
.cs-vertical .cs-bar-fill{border-radius:999px;background:var(--c-accent)}
.cs-vertical .cs-stat-value{min-width:3.8em;font-size:22px;font-weight:700;color:var(--c-title)}
.cs-vertical .cs-skills{display:flex;flex-direction:column;gap:20px}
.cs-vertical .cs-skills-head .cs-section-title,.cs-vertical .cs-tags-head .cs-section-title{margin-bottom:0}
.cs-vertical .cs-skill{display:flex;flex-direction:column;gap:4px;min-width:0}
.cs-vertical .cs-skill-name{font-size:25px;font-weight:800;color:var(--c-title)}
.cs-vertical .cs-skill-desc{font-size:22px;color:var(--c-muted)}
.cs-vertical .cs-tags{gap:12px}
.cs-vertical .cs-tags-head{flex:0 0 100%}
.cs-vertical .cs-tag{padding:8px 20px;border-radius:999px;background:var(--c-chip);color:var(--c-text);font-size:22px;font-weight:700}
.cs-vertical .cs-block-list{display:flex;flex-direction:column;gap:12px}
.cs-vertical .cs-block-list li{position:relative;padding-left:32px;font-size:24px}
.cs-vertical .cs-block-list li::before{content:'';position:absolute;top:.62em;left:6px;width:12px;height:12px;border-radius:50%;background:var(--c-accent)}`;

function header(vm) {
  return h('header', { class: 'cs-head' },
    textField(vm, 'name', 'h1', cls('cs-name', nameTier(vm.name))),
    textField(vm, 'title', 'p', 'cs-title'),
    h('div', { class: 'cs-chips' }, textField(vm, 'race', 'span', 'cs-chip'), textField(vm, 'role', 'span', 'cs-chip')));
}

function render(vm) {
  return sheet(META, vm,
    h('div', { class: 'cs-art-wrap' }, artSlot(vm, 'cs-art-frame'), iconSlot(vm, 'cs-icon-badge')),
    header(vm), areaNode(vm, 'info'), areaNode(vm, 'main'));
}

export default { id: META.id, label: '세로형 모바일', size: META.size, defaultAccent: META.defaultAccent, css: CSS, render };
