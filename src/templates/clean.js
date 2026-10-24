// Design "clean" (깔끔한 양식): airy cards on a soft background. Art at the left (about 40%), the header and the info
// blocks at the right, the main blocks stacked full width below. Auto height; every colour is one of the --c-* tokens.
import { h } from '../core/vnode.js';
import { PALETTE_DEFAULTS } from '../core/palettes.js';
import { FONT_SANS, artSlot, cls, iconSlot, sheet, textField } from './parts.js';
import { areaNode, nameTier } from './blocks.js';

const META = { id: 'clean', size: { w: 1000, h: null, minH: 1000 }, defaultAccent: PALETTE_DEFAULTS.clean.accent };

const CSS = `.cs-clean{display:flex;flex-direction:column;gap:30px;padding:52px 52px 56px;background:var(--c-bg);color:var(--c-text);font-family:${FONT_SANS};font-size:18px;line-height:1.6}
.cs-clean .cs-top{display:flex;align-items:stretch;gap:40px}
.cs-clean .cs-art-col{display:flex;flex:0 0 40%;min-width:0}
.cs-clean .cs-art{position:relative;flex:1;min-height:560px;border-radius:30px;background:var(--c-chip);box-shadow:0 14px 34px color-mix(in srgb,var(--c-title) 14%,transparent)}
.cs-clean .cs-art > img,.cs-clean .cs-art > svg{position:absolute;top:0;left:0;width:100%;height:100%}
.cs-clean .cs-head-col{display:flex;flex:1;flex-direction:column;gap:24px;min-width:0}
.cs-clean .cs-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}
.cs-clean .cs-head-text{flex:1;min-width:0}
.cs-clean .cs-name{font-size:50px;line-height:1.14;font-weight:800;letter-spacing:-.01em;color:var(--c-title)}
.cs-clean .cs-name.cs-n2{font-size:40px}
.cs-clean .cs-name.cs-n3{font-size:32px}
.cs-clean .cs-name.cs-n4{font-size:26px;line-height:1.25}
.cs-clean .cs-title{margin-top:8px;font-size:21px;font-weight:700;color:var(--c-accent)}
.cs-clean .cs-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.cs-clean .cs-chips:empty,.cs-clean .cs-chip:empty{display:none}
.cs-clean .cs-chip{padding:4px 16px;border-radius:999px;background:var(--c-accent);color:var(--accent-ink);font-size:16px;font-weight:700}
.cs-clean .cs-icon-badge{flex:none;width:78px;height:78px;border-radius:24px;background:var(--c-accent);color:var(--accent-ink);font-size:36px}
.cs-clean .cs-area{display:flex;flex-direction:column;gap:18px;min-width:0}
.cs-clean .cs-block{min-width:0;padding:24px 28px;border:1px solid var(--c-line);border-radius:24px;background:var(--c-panel);box-shadow:0 6px 18px color-mix(in srgb,var(--c-title) 6%,transparent)}
.cs-clean .cs-block.cs-empty{display:none}
.cs-clean .cs-quote{border-left:6px solid var(--c-accent);font-size:21px;font-style:italic;line-height:1.55;color:var(--c-title)}
.cs-clean .cs-section-title{margin-bottom:14px;font-size:15px;font-weight:800;letter-spacing:.06em;color:var(--c-muted)}
.cs-clean .cs-section-title::before{content:'';display:inline-block;width:8px;height:8px;margin-right:9px;border-radius:50%;background:var(--c-accent)}
.cs-clean .cs-text,.cs-clean .cs-block-text{white-space:pre-wrap;font-size:18px;line-height:1.7}
.cs-clean .cs-rows{display:flex;flex-direction:column}
.cs-clean .cs-row{gap:16px;padding:9px 0;border-bottom:1px dashed var(--c-line)}
.cs-clean .cs-rows .cs-row:last-child{border-bottom:0}
.cs-clean .cs-label{flex:0 0 5.4em;font-size:15px;font-weight:700;color:var(--c-muted)}
.cs-clean .cs-value{font-weight:600}
.cs-clean .cs-stats-bars{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 40px}
.cs-clean .cs-area-info .cs-stats-bars{grid-template-columns:minmax(0,1fr)}
.cs-clean .cs-stats-bars > .cs-section-title{grid-column:1 / -1;margin-bottom:0}
.cs-clean .cs-stat{gap:12px}
.cs-clean .cs-stat-label{flex:0 0 4.2em;min-width:0;font-size:16px;font-weight:700}
.cs-clean .cs-bar{height:10px;border-radius:999px;background:color-mix(in srgb,var(--c-text) 12%,transparent)}
.cs-clean .cs-bar-fill{border-radius:999px;background:var(--c-accent)}
.cs-clean .cs-stat-value{min-width:3.6em;font-size:16px;font-weight:700;color:var(--c-title)}
.cs-clean .cs-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 32px}
.cs-clean .cs-skills-head{grid-column:1 / -1}
.cs-clean .cs-skills-head .cs-section-title,.cs-clean .cs-tags-head .cs-section-title{margin-bottom:0}
.cs-clean .cs-skill{display:flex;flex-direction:column;gap:2px;min-width:0}
.cs-clean .cs-skill-name{font-size:18px;font-weight:800;color:var(--c-title)}
.cs-clean .cs-skill-desc{font-size:16px;color:var(--c-muted)}
.cs-clean .cs-tags{gap:10px}
.cs-clean .cs-tags-head{flex:0 0 100%}
.cs-clean .cs-tag{padding:6px 16px;border-radius:999px;background:var(--c-chip);color:var(--c-text);font-size:16px;font-weight:700}
.cs-clean .cs-block-list{display:flex;flex-direction:column;gap:8px}
.cs-clean .cs-block-list li{position:relative;padding-left:24px;font-size:18px}
.cs-clean .cs-block-list li::before{content:'';position:absolute;top:.62em;left:4px;width:9px;height:9px;border-radius:50%;background:var(--c-accent)}`;

function header(vm) {
  return h('header', { class: 'cs-head' },
    h('div', { class: 'cs-head-text' },
      textField(vm, 'name', 'h1', cls('cs-name', nameTier(vm.name))),
      textField(vm, 'title', 'p', 'cs-title'),
      h('div', { class: 'cs-chips' }, textField(vm, 'race', 'span', 'cs-chip'), textField(vm, 'role', 'span', 'cs-chip'))),
    iconSlot(vm, 'cs-icon-badge'));
}

function render(vm) {
  return sheet(META, vm,
    h('div', { class: 'cs-top' },
      h('div', { class: 'cs-art-col' }, artSlot(vm, 'cs-art-frame')),
      h('div', { class: 'cs-head-col' }, header(vm), areaNode(vm, 'info'))),
    areaNode(vm, 'main'));
}

export default { id: META.id, label: '깔끔한 양식', size: META.size, defaultAccent: META.defaultAccent, css: CSS, render };
