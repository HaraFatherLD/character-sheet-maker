// Design: broadcast-overlay channel profile (1600x900, dark glass UI). Left: 480px "camera frame" art with a LIVE badge, a decorative
// viewer counter and a glass stats panel. Right: channel banner, about cards (custom items join them), then intro / content-corner cards / pinned chat bubble.
import { h } from '../core/vnode.js';
import { FONT_SANS, FONT_MONO, sheet, textField, fieldRows, customRows, tagList, statBars, skillList, artSlot, iconSlot, quoteBlock } from './parts.js';

const META = { id: 'streamer', label: '방송인 프로필', size: { w: 1600, h: 900 }, defaultAccent: '#ff5a7a' };

const css = `
.cs-streamer{display:flex;gap:28px;padding:32px;font-family:${FONT_SANS};font-size:16px;color:#ece8f7;background:radial-gradient(ellipse at 85% 0%,color-mix(in srgb,var(--accent) 30%,transparent),transparent 50%),radial-gradient(ellipse at 0% 100%,rgba(255,80,170,.14),transparent 45%),repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 34px),linear-gradient(160deg,#120e20,#0b0914)}
.cs-streamer .cs-cam{position:relative;flex:none;width:480px;height:836px;overflow:hidden;border-radius:20px;background:#0a0814;box-shadow:0 0 0 2px var(--accent),0 0 44px color-mix(in srgb,var(--accent) 45%,transparent)}
.cs-streamer .cs-art{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,#2b2346,#0b0914 75%)}
.cs-streamer .cs-scrim{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(6,4,14,.55),rgba(6,4,14,0) 20%,rgba(6,4,14,0) 52%,rgba(6,4,14,.82))}
.cs-streamer .cs-cb{position:absolute;width:30px;height:30px;pointer-events:none;border:0 solid rgba(255,255,255,.85)}
.cs-streamer .cs-cb1{left:10px;top:10px;border-top-width:3px;border-left-width:3px;border-top-left-radius:8px}
.cs-streamer .cs-cb2{right:10px;top:10px;border-top-width:3px;border-right-width:3px;border-top-right-radius:8px}
.cs-streamer .cs-cb3{left:10px;bottom:10px;border-bottom-width:3px;border-left-width:3px;border-bottom-left-radius:8px}
.cs-streamer .cs-cb4{right:10px;bottom:10px;border-bottom-width:3px;border-right-width:3px;border-bottom-right-radius:8px}
.cs-streamer .cs-live,.cs-streamer .cs-viewers{position:absolute;top:26px;display:flex;align-items:center;gap:8px;padding:5px 13px;border-radius:8px;background:rgba(10,8,20,.74);border:1px solid rgba(255,255,255,.18);font-size:15px;line-height:20px;font-weight:900;color:#fff}
.cs-streamer .cs-live{left:26px;letter-spacing:.16em}
.cs-streamer .cs-viewers{right:26px;font-family:${FONT_MONO};letter-spacing:.04em}
.cs-streamer .cs-rec{width:11px;height:11px;border-radius:50%;background:#ff2d55;box-shadow:0 0 10px #ff2d55}
.cs-streamer .cs-eye{width:19px;height:19px;color:#fff}
.cs-streamer .cs-statpanel{position:absolute;left:18px;right:18px;bottom:18px;height:252px;padding:14px 18px;overflow:hidden;border-radius:16px;background:rgba(14,10,28,.62);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(10px);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.cs-streamer .cs-stats-bars{display:flex;flex-direction:column}
.cs-streamer .cs-stat{height:31px;gap:10px}
.cs-streamer .cs-stat-label{width:60px;flex:none;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;font-weight:700;color:#d8d2ee}
.cs-streamer .cs-bar{height:10px;border-radius:999px;background:rgba(255,255,255,.1)}
.cs-streamer .cs-bar-fill{border-radius:999px;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 55%,#5b7cff),var(--accent) 55%,#ff7ad9);box-shadow:0 0 10px color-mix(in srgb,var(--accent) 55%,transparent)}
.cs-streamer .cs-stat-value{min-width:66px;font-family:${FONT_MONO};font-size:15px;font-weight:700;color:#fff}
.cs-streamer .cs-right{flex:1;min-width:0;height:836px;display:flex;flex-direction:column;gap:12px}
.cs-streamer .cs-banner{position:relative;flex:none;height:148px;display:flex;align-items:center;gap:24px;padding:12px 28px;overflow:hidden;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:radial-gradient(circle at 92% 20%,rgba(255,255,255,.14),transparent 30%),linear-gradient(110deg,color-mix(in srgb,var(--accent) 62%,#0e0b18),#1c1636 58%,color-mix(in srgb,var(--accent) 28%,#0e0b18));box-shadow:0 10px 30px rgba(0,0,0,.35)}
.cs-streamer .cs-banner::before{content:"";position:absolute;z-index:0;inset:0;pointer-events:none;background:repeating-linear-gradient(120deg,rgba(255,255,255,.04) 0 2px,transparent 2px 14px)}
.cs-streamer .cs-banner>*{position:relative;z-index:1}
.cs-streamer .cs-avatar{flex:none;width:100px;height:100px;border-radius:50%;border:4px solid #fff;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 60%,#ff7ad9));color:var(--accent-ink);font-size:46px;box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 50%,transparent),0 8px 22px rgba(0,0,0,.45)}
.cs-streamer .cs-bn-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.cs-streamer .cs-name-wrap{height:58px;display:flex;align-items:center}
.cs-streamer .cs-f-name{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;max-width:100%;max-height:100%;font-weight:900;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.4)}
.cs-streamer .cs-n1{font-size:48px;line-height:1.15;-webkit-line-clamp:1}
.cs-streamer .cs-n2{font-size:34px;line-height:1.15;-webkit-line-clamp:1}
.cs-streamer .cs-n3{font-size:26px;line-height:1.1;-webkit-line-clamp:2}
.cs-streamer .cs-f-title{font-size:20px;line-height:26px;font-weight:700;color:color-mix(in srgb,var(--accent) 35%,#fff)}
.cs-streamer .cs-chips{display:flex;gap:10px;height:28px}
.cs-streamer .cs-chips .cs-text{min-width:0;max-width:44%;padding:3px 14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;line-height:22px;font-weight:700;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.14)}
.cs-streamer .cs-about{flex:none;height:60px;display:flex;gap:10px}
.cs-streamer .cs-about .cs-row{flex:1 1 0;min-width:0;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;padding:6px 14px;overflow:hidden;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}
.cs-streamer .cs-about .cs-f-affiliation{flex:2.2 1 0}
.cs-streamer .cs-about .cs-f-custom{flex:1.4 1 0}
.cs-streamer .cs-about .cs-label{max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cs-streamer .cs-label{font-size:12px;line-height:16px;font-weight:700;letter-spacing:.14em;color:color-mix(in srgb,var(--accent) 45%,#cbbdff)}
.cs-streamer .cs-about .cs-value{max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:17px;line-height:24px;font-weight:700}
.cs-streamer .cs-body{flex:1;min-height:0;display:flex;gap:16px}
.cs-streamer .cs-intro,.cs-streamer .cs-corners{min-width:0;min-height:0;overflow:hidden;padding:16px 18px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 24px rgba(0,0,0,.25)}
.cs-streamer .cs-intro{flex:1.3 1 0;display:flex;flex-direction:column}
.cs-streamer .cs-corners{flex:1 1 0}
.cs-streamer .cs-section-title{flex:none;display:flex;align-items:center;gap:8px;height:26px;margin-bottom:8px;white-space:nowrap;font-size:15px;line-height:26px;font-weight:900;letter-spacing:.12em;color:#fff}
.cs-streamer .cs-section-title::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent)}
.cs-streamer .cs-kicker{font-family:${FONT_MONO};font-size:13px;letter-spacing:.16em;color:color-mix(in srgb,var(--accent) 55%,#fff)}
.cs-streamer .cs-kicker::after{content:"·";margin-left:8px;opacity:.7}
.cs-streamer .cs-f-summary{flex:none;margin-bottom:10px;font-size:17px;line-height:1.55;color:#f4f1fb}
.cs-streamer .cs-more{flex:1 1 0;min-height:0;overflow:hidden;-webkit-mask-image:linear-gradient(#000 calc(100% - 28px),rgba(0,0,0,0))}
.cs-streamer .cs-f-backstory{font-size:15px;line-height:1.6;color:#b9b2d3}
.cs-streamer .cs-more .cs-label{margin-bottom:4px}
.cs-streamer .cs-skills{display:flex;flex-direction:column;gap:8px}
.cs-streamer .cs-skills-head .cs-section-title{margin-bottom:0}
.cs-streamer .cs-skill{display:flex;flex-direction:column;gap:2px;padding:9px 14px;border-radius:12px;border-left:3px solid var(--accent);background:rgba(255,255,255,.07)}
.cs-streamer .cs-skill-name{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:17px;line-height:22px;font-weight:700;color:#fff}
.cs-streamer .cs-skill-desc{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;font-size:14px;line-height:1.4;color:#b9b2d3}
.cs-streamer .cs-dense .cs-skill-desc{-webkit-line-clamp:2}
.cs-streamer .cs-chat{flex:.9 1 0;min-width:0;min-height:0;display:flex;flex-direction:column;gap:10px;overflow:hidden}
.cs-streamer .cs-chat>*{flex:none}
.cs-streamer .cs-pin-head{display:flex;align-items:center;gap:8px;height:22px;font-size:12px;line-height:22px;font-weight:900;letter-spacing:.14em;color:color-mix(in srgb,var(--accent) 45%,#e5dcff)}
.cs-streamer .cs-pin-head::before{content:"";width:8px;height:8px;transform:rotate(45deg);background:var(--accent)}
.cs-streamer .cs-bubble{padding:12px 16px;border-radius:16px 16px 16px 4px;background:color-mix(in srgb,var(--accent) 22%,rgba(255,255,255,.06));border:1px solid color-mix(in srgb,var(--accent) 55%,transparent);box-shadow:0 8px 24px rgba(0,0,0,.28)}
.cs-streamer .cs-quote{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;font-weight:700;color:#fff}
.cs-streamer .cs-q1{font-size:22px;line-height:1.4;-webkit-line-clamp:4}
.cs-streamer .cs-q2{font-size:19px;line-height:1.4;-webkit-line-clamp:6}
.cs-streamer .cs-q3{font-size:16px;line-height:1.4;-webkit-line-clamp:10}
.cs-streamer .cs-notes{display:flex;flex-direction:column;gap:8px}
.cs-streamer .cs-notes .cs-row{flex-direction:column;align-items:flex-start;gap:1px;padding:8px 14px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12)}
.cs-streamer .cs-notes .cs-value{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;font-size:14px;line-height:1.4;color:#d8d2ee}
.cs-streamer .cs-tags{max-height:72px;overflow:hidden;gap:8px}
.cs-streamer .cs-tag{max-width:100%;padding:4px 14px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px;line-height:22px;font-weight:700;color:#fff;border-radius:999px;border:1px solid color-mix(in srgb,var(--accent) 60%,transparent);background:color-mix(in srgb,var(--accent) 18%,transparent)}
.cs-streamer .cs-tag::before{content:"#";color:color-mix(in srgb,var(--accent) 45%,#fff)}
`;

/** Size class `<prefix>N` where N counts how many `limits` the text (in code points) exceeds, plus one. */
const tier = (text, limits, prefix) => `${prefix}${1 + limits.filter((n) => Array.from(text).length > n).length}`;
const deco = (className, ...children) => h('div', { class: className, 'aria-hidden': 'true' }, ...children);

const eye = () => h('svg', { class: 'cs-eye', viewBox: '0 0 20 20', 'aria-hidden': 'true' },
  h('path', { d: 'M1.5 10C4.5 4.5 15.5 4.5 18.5 10C15.5 15.5 4.5 15.5 1.5 10Z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 }),
  h('circle', { cx: 10, cy: 10, r: 3, fill: 'currentColor' }));

/** Section heading: a decorative English kicker plus the editable label as its own text node. Null when `key` is hidden. */
const heading = (vm, key, kicker) => (vm.isHidden(key) ? null
  : h('h3', { class: 'cs-section-title' }, h('span', { class: 'cs-kicker' }, kicker), vm.label(key)));

function cam(vm) {
  const stats = statBars(vm, '', heading(vm, 'stats', 'STATS'));
  return h('section', { class: 'cs-cam' }, artSlot(vm), deco('cs-scrim'), [1, 2, 3, 4].map((n) => deco(`cs-cb cs-cb${n}`)),
    deco('cs-live', h('span', { class: 'cs-rec' }), 'LIVE'), deco('cs-viewers', eye(), h('span', null, '12,408')),
    stats ? h('div', { class: 'cs-statpanel' }, stats) : null);
}

function banner(vm) {
  const chips = [textField(vm, 'race', 'span'), textField(vm, 'role', 'span')].filter(Boolean);
  return h('header', { class: 'cs-banner' }, iconSlot(vm, 'cs-avatar'), h('div', { class: 'cs-bn-text' },
    h('div', { class: 'cs-name-wrap' }, textField(vm, 'name', 'h1', tier(vm.name, [14, 22], 'cs-n'))),
    textField(vm, 'title', 'div', 'cs-clamp-1'), chips.length ? h('div', { class: 'cs-chips' }, chips) : null));
}

/** Backstory: the marker wraps its editable label and the text; CSS alone cuts the text. */
function story(vm) {
  if (vm.isHidden('backstory') || !vm.backstory) return null;
  return h('div', { class: 'cs-more cs-f-backstory' }, h('div', { class: 'cs-label' }, vm.label('backstory')), h('p', { class: 'cs-text' }, vm.backstory));
}

function intro(vm) {
  const summary = textField(vm, 'summary', 'p', 'cs-clamp-6');
  const more = story(vm);
  if (!summary && !more) return null;
  return h('section', { class: 'cs-intro' }, summary ? heading(vm, 'summary', 'ABOUT') : null, summary, more);
}

function chat(vm) {
  const notes = fieldRows(vm, ['likes', 'dislikes']).filter(Boolean);
  const quote = quoteBlock(vm, tier(vm.quote, [28, 56], 'cs-q'));
  const pinned = quote ? [deco('cs-pin-head', 'PINNED MESSAGE'), h('div', { class: 'cs-bubble' }, quote)] : [];
  const parts = [...pinned, notes.length ? h('div', { class: 'cs-notes' }, notes) : null, tagList(vm)].filter(Boolean);
  return parts.length ? h('div', { class: 'cs-chat' }, parts) : null;
}

function render(vm) {
  const about = fieldRows(vm, ['age', 'gender', 'height', 'birthday', 'affiliation']).filter(Boolean);
  const cards = [...about, ...customRows(vm).slice(0, Math.max(2, Math.min(4, 7 - about.length)))];
  const skills = skillList(vm, vm.skills.length > 4 ? 'cs-dense' : '', heading(vm, 'skills', 'CORNERS'));
  return sheet(META, vm, cam(vm), h('div', { class: 'cs-right' }, banner(vm), cards.length ? h('div', { class: 'cs-about' }, cards) : null,
    h('div', { class: 'cs-body' }, intro(vm), skills ? h('section', { class: 'cs-corners' }, skills) : null, chat(vm))));
}

export default { ...META, css, render };
