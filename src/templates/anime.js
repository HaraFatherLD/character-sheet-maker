// Design: pastel idol-style profile card. Soft gradient backdrop with sparkles, an offset-framed art panel, a speech-bubble
// quote, pill chips and rounded progress bars. Geometry: 184px header, then a 446px art/stats column and a flexible text column.
import { h } from '../core/vnode.js';
import { FONT_SANS, cls, sheet, textField, fieldRows, customRows, tagList, statBars, skillList, artSlot, iconSlot, quoteBlock, sectionLabel } from './parts.js';

const META = { id: 'anime', label: '애니 프로필', size: { w: 1000, h: 1414 }, defaultAccent: '#ff6fa5' };
const STAR = 'M12 0Q13 11 24 12Q13 13 12 24Q11 13 0 12Q11 11 12 0Z';

const css = `
.cs-anime{--ink:#5a3d72;--soft:#8a6ba3;z-index:0;display:flex;flex-direction:column;gap:12px;padding:40px;font-family:${FONT_SANS};font-size:17px;color:var(--ink);background-color:#fdeff8;
background-image:radial-gradient(ellipse at 6% 3%,rgba(255,255,255,.95),rgba(255,255,255,0) 38%),radial-gradient(ellipse at 98% 24%,rgba(170,225,255,.75),rgba(170,225,255,0) 40%),radial-gradient(ellipse at 2% 78%,rgba(255,205,230,.8),rgba(255,205,230,0) 42%),radial-gradient(ellipse at 96% 98%,rgba(205,190,255,.85),rgba(205,190,255,0) 45%),radial-gradient(circle,rgba(255,255,255,.8) 2.5px,rgba(255,255,255,0) 3.5px),linear-gradient(165deg,#ffe4f1,#efe3ff 40%,#dff0ff 74%,#e6fff0);
background-size:100% 100%,100% 100%,100% 100%,100% 100%,36px 36px,100% 100%}
.cs-anime .cs-spark{position:absolute;z-index:0;pointer-events:none}
.cs-anime .cs-sp1{right:74px;top:46px;width:62px;height:62px}.cs-anime .cs-sp2{right:152px;top:112px;width:30px;height:30px}.cs-anime .cs-sp3{right:40px;top:132px;width:24px;height:24px}
.cs-anime .cs-art-wrap .cs-spark{z-index:3}
.cs-anime .cs-sa1{left:-14px;top:-14px;width:46px;height:46px}.cs-anime .cs-sa2{right:2px;top:84px;width:26px;height:26px}.cs-anime .cs-sa3{left:-10px;bottom:130px;width:30px;height:30px}
.cs-anime .cs-head{position:relative;z-index:1;flex:none;height:184px;display:flex;flex-direction:column;justify-content:space-between}
.cs-anime .cs-kicker{align-self:flex-start;padding:3px 18px;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-size:14px;font-weight:800;letter-spacing:.2em;box-shadow:0 3px 0 rgba(255,140,190,.4)}
.cs-anime .cs-name-wrap{height:108px;display:flex;align-items:center}
.cs-anime .cs-f-name{min-width:0;max-width:100%;font-weight:900;color:color-mix(in srgb,var(--accent) 80%,#4b1f63);text-shadow:3px 0 0 #fff,-3px 0 0 #fff,0 3px 0 #fff,0 -3px 0 #fff,2px 2px 0 #fff,-2px 2px 0 #fff,2px -2px 0 #fff,-2px -2px 0 #fff,0 8px 14px color-mix(in srgb,var(--accent) 50%,transparent)}
.cs-anime .cs-n1,.cs-anime .cs-n2{margin-left:-8px;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cs-anime .cs-n1{font-size:80px;line-height:1.2}.cs-anime .cs-n2{font-size:56px;line-height:1.2}.cs-anime .cs-n3{font-size:38px;line-height:1.2}
.cs-anime .cs-subline{height:38px;display:flex;align-items:center;gap:10px}
.cs-anime .cs-subline .cs-text{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;border-radius:999px;font-size:20px;line-height:28px;font-weight:800}
.cs-anime .cs-subline .cs-text:empty{display:none}
.cs-anime .cs-f-title{max-width:48%;padding:4px 18px;color:var(--accent-ink);background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 55%,#fff));box-shadow:0 3px 0 rgba(255,120,170,.35)}
.cs-anime .cs-f-race,.cs-anime .cs-f-role{max-width:22%;padding:1px 14px;background:#fff;border:3px solid #8fd3ff}
.cs-anime .cs-f-role{border-color:#7fe0b4}
.cs-anime .cs-body{position:relative;z-index:1;flex:1;min-height:0;display:flex;gap:14px}
.cs-anime .cs-col-l{flex:0 0 446px;min-height:0;display:flex;flex-direction:column;gap:14px}
.cs-anime .cs-col-r{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:12px}
.cs-anime .cs-art-wrap{position:relative;flex:1;min-height:0}
.cs-anime .cs-art-wrap::before{content:"";position:absolute;left:16px;top:16px;right:0;bottom:0;border-radius:46px;transform:rotate(1.8deg);background:repeating-linear-gradient(135deg,var(--accent) 0 14px,color-mix(in srgb,var(--accent) 50%,#fff) 14px 28px)}
.cs-anime .cs-art{position:absolute;left:0;top:0;right:16px;bottom:16px;border:8px solid #fff;border-radius:44px;background:#dfe9ff;box-shadow:0 12px 26px rgba(130,80,150,.3)}
.cs-anime .cs-badge{position:absolute;right:0;bottom:0;width:96px;height:96px;border-radius:50%;border:6px solid #fff;background:linear-gradient(135deg,var(--accent),#ffb85c);color:var(--accent-ink);font-size:46px;box-shadow:0 6px 14px rgba(130,80,150,.35)}
.cs-anime .cs-card{position:relative;flex:none;min-width:0;min-height:0;overflow:hidden;padding:16px 22px;border:3px solid #fff;border-radius:30px;background:rgba(255,255,255,.86);box-shadow:0 8px 20px rgba(150,100,180,.16)}
.cs-anime .cs-section-title{width:fit-content;margin-bottom:10px;padding:2px 16px;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-size:15px;line-height:22px;font-weight:800;letter-spacing:.14em}
.cs-anime .cs-stat{height:40px;gap:10px}
.cs-anime .cs-stat-label{width:76px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:17px;font-weight:800;color:var(--soft)}
.cs-anime .cs-bar{height:18px;border-radius:999px;background:#f1e8fb;box-shadow:inset 0 2px 4px rgba(120,80,150,.28)}
.cs-anime .cs-bar-fill{border-radius:999px;background:linear-gradient(90deg,#ffc2dc,var(--accent));box-shadow:inset 0 3px 0 rgba(255,255,255,.4)}
.cs-anime .cs-stat:nth-child(3) .cs-bar-fill{background:linear-gradient(90deg,#b9e6ff,#4fb0ff)}.cs-anime .cs-stat:nth-child(4) .cs-bar-fill{background:linear-gradient(90deg,#c4f3d8,#3fcf92)}
.cs-anime .cs-stat:nth-child(5) .cs-bar-fill{background:linear-gradient(90deg,#ffe8ab,#ffb52e)}.cs-anime .cs-stat:nth-child(6) .cs-bar-fill{background:linear-gradient(90deg,#dccfff,#9a7bff)}
.cs-anime .cs-stat:nth-child(7) .cs-bar-fill{background:linear-gradient(90deg,#ffd2bb,#ff8c5a)}
.cs-anime .cs-stat-value{width:76px;min-width:0;white-space:nowrap;font-size:17px;font-weight:800;color:var(--ink)}
.cs-anime .cs-tags{flex:none;max-height:128px;overflow:hidden;gap:10px}
.cs-anime .cs-tag{max-width:100%;padding:5px 16px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;border-radius:999px;border:2px solid var(--accent);background:color-mix(in srgb,var(--accent) 22%,#fff);font-size:17px;line-height:1.3;font-weight:800}
.cs-anime .cs-tag:nth-child(4n+2){background:#d8efff;border-color:#59b8ff}.cs-anime .cs-tag:nth-child(4n+3){background:#d6f8e6;border-color:#3fcf92}.cs-anime .cs-tag:nth-child(4n){background:#fff0c9;border-color:#ffb52e}
.cs-anime .cs-bubble{position:relative;flex:none;padding:18px 24px;border:4px solid var(--accent);border-radius:34px;background:#fff;box-shadow:0 8px 0 rgba(255,140,190,.25)}
.cs-anime .cs-bubble::before{content:"";position:absolute;left:-32px;top:22px;border-top:15px solid transparent;border-bottom:15px solid transparent;border-right:28px solid var(--accent)}
.cs-anime .cs-bubble::after{content:"";position:absolute;left:-25px;top:27px;border-top:10px solid transparent;border-bottom:10px solid transparent;border-right:25px solid #fff}
.cs-anime .cs-quote{font-size:20px;line-height:28px;font-weight:700}
.cs-anime .cs-sum-card{flex:0 2 auto}
.cs-anime .cs-f-summary{font-size:16px;line-height:23px}
.cs-anime .cs-details{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}
.cs-anime .cs-details .cs-f-affiliation{grid-column:1 / -1}
.cs-anime .cs-details .cs-row{min-width:0;height:32px;align-items:center;gap:8px}
.cs-anime .cs-label{flex:none;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:1px 10px;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-size:13px;line-height:20px;font-weight:800;letter-spacing:.04em}
.cs-anime .cs-details .cs-label{max-width:58%}
.cs-anime .cs-details .cs-f-custom{height:28px}
.cs-anime .cs-details .cs-value{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-weight:700}
.cs-anime .cs-moods{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cs-anime .cs-moods .cs-row:only-child{grid-column:1 / -1}
.cs-anime .cs-moods .cs-row{min-width:0;flex-direction:column;align-items:flex-start;gap:6px;padding:12px 14px;border:3px solid #fff;border-radius:24px;background:rgba(255,255,255,.86);box-shadow:0 6px 16px rgba(150,100,180,.14)}
.cs-anime .cs-f-dislikes .cs-label{background:#59b8ff;color:#fff}
.cs-anime .cs-moods .cs-value{width:100%;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;font-size:16px;line-height:23px}
.cs-anime .cs-skill-card{flex:0 3 auto}
.cs-anime .cs-skills{counter-reset:sk;display:flex;flex-direction:column;gap:6px}
.cs-anime .cs-skills-head .cs-section-title{margin-bottom:4px}
.cs-anime .cs-skill{counter-increment:sk;position:relative;flex:none;height:52px;padding:4px 10px 4px 54px;overflow:hidden;border-radius:18px;background:linear-gradient(90deg,#fff0f7,#f1f6ff)}
.cs-anime .cs-skill::before{content:counter(sk);position:absolute;left:10px;top:9px;width:34px;height:34px;border-radius:50%;background:var(--accent);color:var(--accent-ink);font-size:17px;font-weight:800;line-height:34px;text-align:center}
.cs-anime .cs-skill-name,.cs-anime .cs-skill-desc{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-anime .cs-skill-name{font-size:17px;line-height:22px;font-weight:800}.cs-anime .cs-skill-desc{font-size:14px;line-height:20px;color:var(--soft)}
.cs-anime .cs-story{flex:1 1 0;min-height:96px;display:flex;flex-direction:column}
.cs-anime .cs-story .cs-text{flex:1;min-height:0;overflow:hidden;font-size:16px;line-height:24px;-webkit-mask-image:linear-gradient(#000 calc(100% - 28px),rgba(0,0,0,0))}
`;

const spark = (name, fill) => h('svg', { class: `cs-spark ${name}`, viewBox: '0 0 24 24', 'aria-hidden': 'true' },
  h('path', { d: STAR, stroke: '#fff', 'stroke-width': 1.4, fill, style: fill ? undefined : { fill: 'var(--accent)' } }));
/** A card around its content (the last child); null when the content is absent, hidden or empty. */
const card = (extra, ...children) => (children.at(-1) ? h('section', { class: cls('cs-card', extra) }, ...children) : null);

function header(vm) {
  const n = Array.from(vm.name).length;
  const tier = n <= 9 ? 'cs-n1' : n <= 14 ? 'cs-n2' : 'cs-n3';
  const line = [textField(vm, 'title'), textField(vm, 'race', 'span'), textField(vm, 'role', 'span')].filter(Boolean);
  return h('header', { class: 'cs-head' },
    h('div', { class: 'cs-kicker', 'aria-hidden': 'true' }, 'CHARACTER PROFILE'),
    h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', cls(tier === 'cs-n3' && 'cs-clamp-2', tier))),
    line.length ? h('div', { class: 'cs-subline' }, line) : null);
}

/** Profile card: profile rows plus up to four compact custom rows; null when `profile` is hidden or no row is left. */
function profile(vm) {
  if (vm.isHidden('profile')) return null;
  const rows = [...fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation']), ...customRows(vm).slice(0, 4)].filter(Boolean);
  return card('', sectionLabel(vm, 'profile'), rows.length ? h('div', { class: 'cs-details' }, rows) : null);
}

/** Backstory card: the marker element holds the editable title and the text; null when hidden or empty. */
function story(vm) {
  if (!vm.backstory || vm.isHidden('backstory')) return null;
  return h('section', { class: 'cs-card cs-story cs-f-backstory' }, sectionLabel(vm, 'backstory'), h('p', { class: 'cs-text' }, vm.backstory));
}

function render(vm) {
  const moods = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  const quote = quoteBlock(vm, 'cs-clamp-6');
  return sheet(META, vm,
    spark('cs-sp1'), spark('cs-sp2', '#ffd36e'), spark('cs-sp3', '#8fd3ff'),
    header(vm),
    h('div', { class: 'cs-body' },
      h('div', { class: 'cs-col-l' },
        h('div', { class: 'cs-art-wrap' }, artSlot(vm), iconSlot(vm, 'cs-badge'), spark('cs-sa1', '#ffd36e'), spark('cs-sa2'), spark('cs-sa3', '#8fd3ff')),
        card('cs-stat-card', statBars(vm, '', sectionLabel(vm, 'stats'))),
        tagList(vm)),
      h('div', { class: 'cs-col-r' },
        quote ? h('div', { class: 'cs-bubble' }, quote) : null,
        card('cs-sum-card', sectionLabel(vm, 'summary'), textField(vm, 'summary', 'p', 'cs-clamp-8')),
        profile(vm),
        moods.length ? h('div', { class: 'cs-moods' }, moods) : null,
        card('cs-skill-card', skillList(vm, '', sectionLabel(vm, 'skills'))),
        story(vm))));
}

export default { ...META, css, render };
