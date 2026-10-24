// Design: editorial fashion-magazine spread (1600x1000). Left page: full-bleed art with a fictional masthead, cover line and huge name.
// Right page: white interview layout with a pull quote, lede, two-column story, small-caps profile sidebar, thin stat bars, #tag line.
// The masthead is LUMEN. Section titles are an English caption plus the user's label; the profile grid also holds two custom items.
import { h } from '../core/vnode.js';
import { FONT_SANS, FONT_SERIF, FONT_MONO, cls, sheet, textField, fieldRows, customRows, tagList, statBars, artSlot, quoteBlock } from './parts.js';

const META = { id: 'magazine', label: '매거진 화보', size: { w: 1600, h: 1000 }, defaultAccent: '#e11d48' };

const css = `
.cs-magazine{font-family:${FONT_SERIF};font-size:15px;color:#111;background:#fff}
.cs-magazine .cs-cover{position:absolute;left:0;top:0;width:800px;height:1000px;overflow:hidden;background:#15151a}
.cs-magazine .cs-art{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,#3a3a48,#14141a 75%)}
.cs-magazine .cs-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,0) 28%,rgba(0,0,0,0) 40%,rgba(0,0,0,.9))}
.cs-magazine .cs-mast{position:absolute;left:44px;top:26px;width:712px;height:146px;overflow:hidden;white-space:nowrap;font-family:${FONT_SANS};font-size:140px;line-height:146px;font-weight:900;letter-spacing:-.045em;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.35)}
.cs-magazine .cs-issue{position:absolute;left:48px;right:48px;top:176px;display:flex;justify-content:space-between;padding-top:7px;border-top:2px solid #fff;font-family:${FONT_SANS};font-size:13px;line-height:18px;font-weight:700;letter-spacing:.32em;color:#fff}
.cs-magazine .cs-cover-text{position:absolute;left:48px;right:48px;bottom:44px;display:flex;flex-direction:column;justify-content:flex-end;gap:12px;color:#fff}
.cs-magazine .cs-chip{align-self:flex-start;padding:3px 12px;background:var(--accent);color:var(--accent-ink);font-family:${FONT_SANS};font-size:13px;line-height:20px;font-weight:900;letter-spacing:.26em}
.cs-magazine .cs-f-title{font-family:${FONT_SANS};font-size:28px;line-height:1.3;font-weight:700;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.cs-magazine .cs-name-wrap{max-height:280px;overflow:hidden}
.cs-magazine .cs-f-name{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;font-family:${FONT_SANS};font-weight:900;line-height:1;letter-spacing:-.05em;color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.45)}
.cs-magazine .cs-n1{font-size:136px;-webkit-line-clamp:2}
.cs-magazine .cs-n2{font-size:108px;-webkit-line-clamp:2}
.cs-magazine .cs-n3{font-size:76px;-webkit-line-clamp:2}
.cs-magazine .cs-n4{font-size:56px;-webkit-line-clamp:3}
.cs-magazine .cs-n5{font-size:44px;-webkit-line-clamp:3}
.cs-magazine .cs-meta{display:flex;align-items:center;gap:14px;padding-top:10px;border-top:2px solid #fff;font-family:${FONT_SANS};font-size:22px;line-height:30px;font-weight:700;letter-spacing:.12em}
.cs-magazine .cs-meta .cs-text{min-width:0;max-width:46%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-magazine .cs-sep{flex:none;color:var(--accent)}
.cs-magazine .cs-page{position:absolute;left:800px;top:0;width:800px;height:1000px;display:flex;flex-direction:column;gap:12px;padding:34px 52px 30px;background:#fff}
.cs-magazine .cs-page>*{flex:none}
.cs-magazine .cs-strip{height:34px;display:flex;justify-content:space-between;border-bottom:3px solid #111;font-family:${FONT_SANS};font-size:12px;line-height:18px;font-weight:900;letter-spacing:.3em;color:#777}
.cs-magazine .cs-strip span:first-child{color:var(--accent)}
.cs-magazine .cs-pull{position:relative;height:214px;padding-left:88px;overflow:hidden;border-bottom:1px solid #111}
.cs-magazine .cs-pull::before{content:"“";position:absolute;left:-2px;top:-10px;font-family:${FONT_SERIF};font-size:176px;line-height:1;font-weight:700;color:var(--accent)}
.cs-magazine .cs-pull::after{content:"”";position:absolute;right:4px;bottom:-66px;font-family:${FONT_SERIF};font-size:110px;line-height:1;font-weight:700;color:var(--accent);opacity:.28}
.cs-magazine .cs-quote{position:relative;z-index:1;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;font-family:${FONT_SANS};font-weight:900;letter-spacing:-.02em;color:#111}
.cs-magazine .cs-q1{font-size:42px;line-height:1.25;-webkit-line-clamp:4}
.cs-magazine .cs-q2{font-size:34px;line-height:1.28;-webkit-line-clamp:4}
.cs-magazine .cs-q3{font-size:28px;line-height:1.3;-webkit-line-clamp:5}
.cs-magazine .cs-q4{font-size:24px;line-height:1.32;-webkit-line-clamp:6}
.cs-magazine .cs-main{flex:1;min-height:0;display:grid;grid-template-columns:448px minmax(0,1fr);grid-template-rows:minmax(0,1fr);column-gap:20px}
.cs-magazine .cs-left{min-width:0;min-height:0;display:flex;flex-direction:column;gap:16px;overflow:hidden}
.cs-magazine .cs-left>*{flex:none}
.cs-magazine .cs-lede{padding-left:16px;border-left:4px solid var(--accent)}
.cs-magazine .cs-f-summary{font-size:17px;line-height:1.6;color:#222}
.cs-magazine .cs-story{position:relative;flex:1 1 0;min-height:0}
.cs-magazine .cs-cols{position:absolute;left:0;right:0;top:32px;bottom:0;-webkit-mask-image:linear-gradient(#000 calc(100% - 26px),rgba(0,0,0,0))}
.cs-magazine .cs-back{height:100%;columns:2;column-gap:24px;column-fill:auto;overflow:hidden;font-size:15px;line-height:1.6;text-align:justify;word-break:normal;color:#222}
.cs-magazine .cs-section-title{height:24px;padding-bottom:5px;margin-bottom:8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;border-bottom:1px solid #111;font-family:${FONT_SANS};font-size:12px;line-height:18px;font-weight:900;letter-spacing:.26em;text-transform:uppercase;color:#111}
.cs-magazine .cs-section-title .cs-en::after{content:" · "}
.cs-magazine .cs-side{min-width:0;min-height:0;display:flex;flex-direction:column;padding-left:20px;border-left:1px solid #111;overflow:hidden}
.cs-magazine .cs-profile{flex:1 1 0;min-height:0;overflow:hidden}
.cs-magazine .cs-statbox{flex:none;padding-top:10px}
.cs-magazine .cs-fgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:14px}
.cs-magazine .cs-fgrid .cs-f-affiliation{grid-column:1 / -1}
.cs-magazine .cs-fgrid .cs-row,.cs-magazine .cs-moods .cs-row{display:block;min-width:0;padding:5px 0;border-bottom:1px solid #d6d6d6}
.cs-magazine .cs-label{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_SANS};font-size:11px;line-height:15px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-variant:small-caps;color:var(--accent)}
.cs-magazine .cs-fgrid .cs-value{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_SANS};font-size:15px;line-height:21px;font-weight:700}
.cs-magazine .cs-moods .cs-value{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font-size:14px;line-height:20px}
.cs-magazine .cs-tight .cs-moods .cs-value{-webkit-line-clamp:1}
.cs-magazine .cs-stats-bars{display:flex;flex-direction:column;gap:4px}
.cs-magazine .cs-stats-bars>.cs-section-title{margin-bottom:4px}
.cs-magazine .cs-stat{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"l v" "b b";align-items:end;align-content:center;column-gap:8px;row-gap:3px;height:34px}
.cs-magazine .cs-stat-label{grid-area:l;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-family:${FONT_SANS};font-size:13px;line-height:18px;font-weight:700}
.cs-magazine .cs-stat-value{grid-area:v;min-width:0;font-family:${FONT_MONO};font-size:15px;line-height:18px;font-weight:700;color:var(--accent)}
.cs-magazine .cs-bar{grid-area:b;height:3px;background:#dcdcdc}
.cs-magazine .cs-bar-fill{background:#111}
.cs-magazine .cs-tagline{height:56px;padding-top:10px;overflow:hidden;border-top:1px solid #111}
.cs-magazine .cs-tags{display:block;max-height:44px;overflow:hidden;font-family:${FONT_SANS};font-size:15px;line-height:22px;font-weight:700}
.cs-magazine .cs-tag{display:inline-block;max-width:100%;margin-right:14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;vertical-align:top}
.cs-magazine .cs-tag::before{content:"#";color:var(--accent)}
`;

/** Size class `<prefix>N` where N counts how many `limits` the text (in code points) exceeds, plus one. */
const tier = (text, limits, prefix) => `${prefix}${1 + limits.filter((n) => Array.from(text).length > n).length}`;
const deco = (className, ...children) => h('div', { class: className, 'aria-hidden': 'true' }, ...children);

/** Section title: an English caption (decoration) plus the user's label for `key` as its own text node. Null when `key` is hidden. */
const heading = (vm, key, en) => (vm.isHidden(key) ? null
  : h('h3', { class: 'cs-section-title' }, h('span', { class: 'cs-en', 'aria-hidden': 'true' }, en), h('span', { class: 'cs-ko' }, vm.label(key))));

function cover(vm) {
  const race = textField(vm, 'race', 'span');
  const role = textField(vm, 'role', 'span');
  return h('section', { class: 'cs-cover' }, artSlot(vm), deco('cs-shade'), deco('cs-mast', 'LUMEN'),
    deco('cs-issue', h('span', null, 'ISSUE 07'), h('span', null, '캐릭터 화보 특집')),
    h('div', { class: 'cs-cover-text' },
      h('span', { class: 'cs-chip' }, 'COVER STORY'),
      textField(vm, 'title', 'div', 'cs-clamp-2'),
      h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', tier(vm.name, [5, 9, 15, 25], 'cs-n'))),
      race || role ? h('div', { class: 'cs-meta' }, race, race && role ? h('span', { class: 'cs-sep', 'aria-hidden': 'true' }, '/') : null, role) : null));
}

/** Backstory: the section itself is the marker, so the user's label and the two-column text both sit inside it. Null when hidden or empty. */
function story(vm) {
  if (vm.isHidden('backstory') || !vm.backstory) return null;
  return h('section', { class: 'cs-story cs-f-backstory' }, heading(vm, 'backstory', 'STORY'),
    h('div', { class: 'cs-cols' }, h('p', { class: 'cs-text cs-back' }, vm.backstory)));
}

/** Profile (hidden together with its info rows and custom items when `profile` is off), likes/dislikes, and the stats with their title inside the marker. */
function sidebar(vm) {
  const head = heading(vm, 'profile', 'PROFILE');
  const extra = head ? customRows(vm).slice(0, 2) : [];
  const info = head ? [...fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation']), ...extra].filter(Boolean) : [];
  const moods = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  const profile = info.length || moods.length ? h('div', { class: cls('cs-profile', extra.length && 'cs-tight') }, head,
    info.length ? h('div', { class: 'cs-fgrid' }, info) : null, moods.length ? h('div', { class: 'cs-moods' }, moods) : null) : null;
  const stats = statBars(vm, '', heading(vm, 'stats', 'STATS'));
  return h('div', { class: 'cs-side' }, profile, stats ? h('section', { class: 'cs-statbox' }, stats) : null);
}

function render(vm) {
  const tags = tagList(vm);
  const quote = quoteBlock(vm, tier(vm.quote, [34, 60, 90], 'cs-q'));
  const summary = textField(vm, 'summary', 'p', 'cs-clamp-8');
  return sheet(META, vm, cover(vm), h('div', { class: 'cs-page' },
    deco('cs-strip', h('span', null, 'INTERVIEW'), h('span', null, 'LUMEN · NO.07')),
    quote ? h('div', { class: 'cs-pull' }, quote) : null,
    h('div', { class: 'cs-main' },
      h('div', { class: 'cs-left' }, summary ? h('div', { class: 'cs-lede' }, summary) : null, story(vm)),
      sidebar(vm)),
    tags ? h('footer', { class: 'cs-tagline' }, tags) : null));
}

export default { ...META, css, render };
