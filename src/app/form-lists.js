// Form sections for the six stat rows and the skill rows (max 6).
import { el, section } from './dom.js';
import { LIMITS } from '../core/schema.js';

function statInputs(ctx, index, repaintValues) {
  const { state } = ctx;
  const label = el('input', { type: 'text', class: 'stat-label', maxlength: LIMITS.statLabel, 'aria-label': `능력치 ${index + 1} 이름` });
  const value = el('input', { type: 'number', class: 'stat-value', step: 1, 'aria-label': `능력치 ${index + 1} 값` });
  label.addEventListener('input', () => { state.raw.stats[index].label = label.value; ctx.commit(); });
  value.addEventListener('input', () => {
    const key = state.raw.statMode === 'trpg' ? 'score' : 'percent';
    state.raw.stats[index][key] = value.value.trim() === '' ? Number.NaN : Number(value.value);
    ctx.commit();
  });
  value.addEventListener('change', repaintValues);
  return { label, value };
}

function statsSection(ctx, reg) {
  const { state } = ctx;
  let paintedMode = null;
  const repaintValues = () => {
    const trpg = state.data.statMode === 'trpg';
    rows.forEach(({ value }, i) => {
      value.min = trpg ? '1' : '0';
      value.max = trpg ? '30' : '100';
      value.value = String(trpg ? state.data.stats[i].score : state.data.stats[i].percent);
    });
    paintedMode = state.data.statMode;
  };
  const rows = state.raw.stats.map((_, i) => statInputs(ctx, i, repaintValues));
  reg.sync.push(() => { rows.forEach(({ label }, i) => { label.value = state.data.stats[i].label; }); repaintValues(); });
  reg.refresh.push(() => { if (paintedMode !== state.data.statMode) repaintValues(); });
  const caption = el('p', { class: 'hint' }, '퍼센트(0-100)와 TRPG 점수(1-30)는 각각 따로 저장되어, 표기 방식을 바꿔도 값이 유지됩니다.');
  return section('능력치 (6개)', caption, el('div', { class: 'stat-rows' }, rows.map(({ label, value }) => el('div', { class: 'stat-row' }, label, value))));
}

function skillRow(ctx, skill, index, rebuild) {
  const name = el('input', { type: 'text', maxlength: LIMITS.skillName, placeholder: '스킬 이름', 'aria-label': `스킬 ${index + 1} 이름`, value: skill.name });
  const desc = el('input', { type: 'text', maxlength: LIMITS.skillDesc, placeholder: '설명', 'aria-label': `스킬 ${index + 1} 설명`, value: skill.desc });
  name.addEventListener('input', () => { skill.name = name.value; ctx.commit(); });
  desc.addEventListener('input', () => { skill.desc = desc.value; ctx.commit(); });
  const remove = el('button', { type: 'button', class: 'btn btn-small', 'aria-label': `스킬 ${index + 1} 삭제` }, '삭제');
  remove.addEventListener('click', () => { ctx.state.raw.skills.splice(index, 1); rebuild(); ctx.commit(); });
  return el('div', { class: 'skill-row' }, name, desc, remove);
}

function skillsSection(ctx, reg) {
  const { state } = ctx;
  const list = el('div', { class: 'skill-list' });
  const add = el('button', { type: 'button', id: 'skill-add', class: 'btn' }, '스킬 추가');
  const rebuild = () => {
    list.replaceChildren(...state.raw.skills.map((skill, i) => skillRow(ctx, skill, i, rebuild)));
    add.disabled = state.raw.skills.length >= LIMITS.skills;
  };
  add.addEventListener('click', () => {
    if (state.raw.skills.length >= LIMITS.skills) return;
    state.raw.skills.push({ name: '', desc: '' });
    rebuild();
    ctx.commit();
  });
  reg.sync.push(() => { state.raw.skills = state.data.skills.map((s) => ({ ...s })); rebuild(); });
  return section('스킬 (최대 6개)', list, add);
}

/**
 * Sections for stats and skills.
 * @param {object} ctx
 * @param {{sync: Function[], refresh: Function[]}} reg
 * @returns {HTMLElement[]}
 */
export function buildListSections(ctx, reg) {
  return [statsSection(ctx, reg), skillsSection(ctx, reg)];
}
