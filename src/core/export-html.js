// Standalone HTML export: one document, no scripts, no external resources.
import { escapeHtml } from './escape.js';
import { isImageSrc, toHtml } from './vnode.js';
import { normalizeCharacter } from './schema.js';
import { buildViewModel } from './view-model.js';
import { COMMON_CSS } from './common-css.js';

const PAGE_CSS = 'html,body{margin:0;padding:0;background:#20232b}\n'
  + '.cs-stage{display:flex;justify-content:center;padding:12px 0}\n'
  + '.cs-stage .cs-sheet{flex:none;box-shadow:0 8px 40px rgba(0,0,0,.45)}';

/** Step-wise zoom so the fixed-size sheet fits narrow screens without scripts (largest step that fits the viewport). */
function fitCss({ w }) {
  const rules = [];
  for (let k = 19; k >= 4; k -= 1) {
    rules.push(`@media (max-width:${Math.ceil((w * (k + 1)) / 20) - 1}px){.cs-stage{zoom:${k / 20}}}`);
  }
  return rules.join('\n');
}

function printCss({ w, h, minH }) {
  // Auto-height designs have no fixed page height; their minimum height is the best page size we can name.
  return `@page{size:${w}px ${h ?? minH}px;margin:0}\n@media print{html,body{background:none}`
    + '.cs-stage{zoom:1!important;display:block;padding:0}.cs-stage .cs-sheet{box-shadow:none}'
    + '.cs-sheet{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';
}

function assemble(vm, template, sheet) {
  const title = vm.name ? `${vm.name} - 캐릭터 시트` : '캐릭터 시트';
  const css = [COMMON_CSS, PAGE_CSS, template.css, fitCss(template.size), printCss(template.size)].join('\n');
  return `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n`
    + `<meta name="viewport" content="width=device-width, initial-scale=1">\n`
    + `<title>${escapeHtml(title)}</title>\n<style>\n${css}\n</style>\n</head>\n`
    + `<body>\n<div class="cs-stage">${sheet}</div>\n</body>\n</html>\n`;
}

function badImage(images) {
  for (const [key, label] of [['art', '일러스트'], ['icon', '아이콘']]) {
    const src = images[key];
    if (src !== null && src !== undefined && !isImageSrc(src)) return `${label} 이미지 형식이 올바르지 않습니다.`;
  }
  return null;
}

/**
 * Build the standalone HTML document for a character. Never throws.
 * @param {unknown} data CharacterData (normalised again here, so raw storage data is fine)
 * @param {{art?: string|null, icon?: string|null}|null} images validated data URLs or null; an invalid src is an error, not ignored
 * @param {{render: Function, css: string, size: {w: number, h: number}}} template a registry template
 * @returns {{ok: true, html: string} | {ok: false, error: string}}
 */
export function exportHtml(data, images, template) {
  try {
    const norm = normalizeCharacter(data);
    if (!norm.ok) return { ok: false, error: norm.error };
    const imgs = images || {};
    const problem = badImage(imgs);
    if (problem) return { ok: false, error: problem };
    const vm = buildViewModel(norm.value, imgs);
    return { ok: true, html: assemble(vm, template, toHtml(template.render(vm))) };
  } catch (error) {
    return { ok: false, error: `HTML을 만들지 못했습니다: ${error instanceof Error ? error.message : String(error)}` };
  }
}
