// The input form. Controls write into ctx.state.raw and call ctx.commit(); text controls are never rewritten while
// the user types (only reg.sync, used after reset/restore, assigns their values).
import { el, section, field } from './dom.js';
import { TEXT_FIELDS } from '../core/schema.js';
import { TEMPLATES, getTemplate } from '../templates/index.js';
import { buildListSections } from './form-lists.js';
import { buildMediaSections } from './form-media.js';
import { buildItemSections } from './form-items.js';
import { buildBlockSection } from './form-blocks.js';
import { buildColorSection } from './form-colors.js';

function designSection(ctx, reg) {
  const buttons = TEMPLATES.map((template) => el('button', {
    type: 'button', class: 'design-btn', 'data-template': template.id,
    on: { click: () => { ctx.state.raw.template = template.id; ctx.commit(); } },
  }, template.label));
  reg.refresh.push(() => {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.template === ctx.state.data.template));
  });
  return section('디자인', el('div', { class: 'design-grid', role: 'group', 'aria-label': '디자인 선택' }, buttons));
}

function looksSection(ctx, reg) {
  const { state } = ctx;
  const color = el('input', { type: 'color', id: 'accent', 'aria-label': '강조 색', on: { input: () => { state.raw.accentColor = color.value; ctx.commit(); } } });
  const reset = el('button', { type: 'button', id: 'accent-default', class: 'btn', on: { click: () => { state.raw.accentColor = ''; ctx.commit(); } } }, '디자인 기본 색');
  const modes = [['percent', '퍼센트'], ['trpg', 'TRPG']].map(([mode, text]) => el('button', {
    type: 'button', class: 'seg-btn', 'data-mode': mode, id: `stat-mode-${mode}`,
    on: { click: () => { state.raw.statMode = mode; ctx.commit(); } },
  }, text));
  reg.refresh.push(() => {
    color.value = state.data.accentColor || getTemplate(state.data.template).defaultAccent;
    for (const button of modes) button.setAttribute('aria-pressed', String(button.dataset.mode === state.data.statMode));
  });
  return section('색상 · 능력치 방식',
    field('강조 색', el('div', { class: 'inline' }, color, reset)),
    field('능력치 표기', el('div', { class: 'seg', role: 'group', 'aria-label': '능력치 표기 방식' }, modes)));
}

function textControl(ctx, reg, { key, label, max, multiline }) {
  const attrs = { id: `f-${key}`, maxlength: max, 'data-field': key };
  const control = multiline ? el('textarea', { ...attrs, rows: key === 'backstory' ? 6 : 2 }) : el('input', { ...attrs, type: 'text' });
  control.addEventListener('input', () => { ctx.state.raw[key] = control.value; ctx.commit(); });
  reg.sync.push(() => { control.value = ctx.state.data[key]; });
  return field(`${label} (${max}자)`, control);
}

function tagsControl(ctx, reg) {
  const input = el('input', { type: 'text', id: 'f-tags', maxlength: 200, placeholder: '쉼표로 구분 (최대 8개, 각 16자)' });
  input.addEventListener('input', () => { ctx.state.raw.tags = input.value.split(','); ctx.commit(); });
  reg.sync.push(() => { input.value = ctx.state.data.tags.join(', '); });
  return field('태그', input);
}

function profileSection(ctx, reg) {
  return section('캐릭터 정보', ...TEXT_FIELDS.map((spec) => textControl(ctx, reg, spec)), tagsControl(ctx, reg));
}

/**
 * Build the whole form into `root`.
 * @param {HTMLElement} root
 * @param {object} ctx controller: { state, commit, setStatus, baseSize, uploadImage, removeImage, exportImage, exportHtmlFile, resetSample }
 * @returns {{refresh: () => void, sync: () => void, afterRender: () => void}} refresh updates state-derived UI; sync also assigns
 *   every control value; afterRender runs after each preview render (things that depend on the rendered height)
 */
export function buildForm(root, ctx) {
  const reg = { sync: [], refresh: [], afterRender: [] };
  root.append(designSection(ctx, reg), looksSection(ctx, reg), buildColorSection(ctx, reg), profileSection(ctx, reg),
    ...buildItemSections(ctx, reg), buildBlockSection(ctx, reg), ...buildListSections(ctx, reg), ...buildMediaSections(ctx, reg));
  const refresh = () => reg.refresh.forEach((fn) => fn());
  return {
    refresh,
    sync: () => { reg.sync.forEach((fn) => fn()); refresh(); },
    afterRender: () => reg.afterRender.forEach((fn) => fn()),
  };
}
