// Standalone HTML export: one document, no scripts. Pictures are embedded (default) or, on request, linked over https.
import { escapeHtml } from './escape.js';
import { isDataImageSrc, isHttpsImageSrc, isImageSrc, toHtml } from './vnode.js';
import { normalizeCharacter } from './schema.js';
import { buildViewModel } from './view-model.js';
import { COMMON_CSS } from './common-css.js';
import { effectiveSize } from './size.js';
import { isScaled, scaleWrap } from './scale-wrap.js';

const PAGE_CSS = 'html,body{margin:0;padding:0;background:#20232b}\n'
  + '.cs-stage{display:flex;justify-content:center;padding:12px 0}\n'
  + '.cs-stage .cs-sheet{flex:none;box-shadow:0 8px 40px rgba(0,0,0,.45)}';

/** Only written when the sheet is wrapped: the frame must not shrink inside the flex stage, and it carries the shadow. */
const FRAME_CSS = '.cs-scale-frame{flex:none}\n'
  + '.cs-stage .cs-scale-frame{box-shadow:0 8px 40px rgba(0,0,0,.45)}\n'
  + '@media print{.cs-stage .cs-scale-frame{box-shadow:none}}';

/** Content-Security-Policy per image mode: inline styles only and nothing else may load; `link` also lets https images in. */
const CSP = {
  embed: "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
  link: "default-src 'none'; style-src 'unsafe-inline'; img-src data: https:",
};
const IMAGE_SLOTS = [['art', '일러스트'], ['icon', '아이콘']];

/** Step-wise zoom so the sheet, at its effective width, fits narrow screens without scripts (largest step that fits the viewport). */
function fitCss({ w }) {
  const rules = [];
  for (let k = 19; k >= 1; k -= 1) {
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

function assemble(vm, template, sheet, mode, eff) {
  const title = vm.name ? `${vm.name} - 캐릭터 시트` : '캐릭터 시트';
  const css = [COMMON_CSS, PAGE_CSS, template.css, isScaled(eff) ? FRAME_CSS : '', fitCss(eff), printCss(eff)].filter(Boolean).join('\n');
  return `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n`
    + `<meta name="viewport" content="width=device-width, initial-scale=1">\n`
    + `<meta http-equiv="Content-Security-Policy" content="${CSP[mode]}">\n`
    + `<title>${escapeHtml(title)}</title>\n<style>\n${css}\n</style>\n</head>\n`
    + `<body>\n<div class="cs-stage">${sheet}</div>\n</body>\n</html>\n`;
}

/** First picture the mode cannot accept, as an error message; null when all are fine. `embed` takes data URLs only. */
function badImage(images, mode) {
  const accepts = mode === 'link' ? isImageSrc : isDataImageSrc;
  for (const [key, label] of IMAGE_SLOTS) {
    const src = images[key];
    if (src === null || src === undefined || accepts(src)) continue;
    if (isHttpsImageSrc(src)) return `${label} 이미지는 웹 주소라서 파일에 포함할 수 없습니다.`;
    return `${label} 이미지 형식이 올바르지 않습니다.`;
  }
  return null;
}

/**
 * Build the standalone HTML document for a character. Never throws. The sheet is drawn at the width the character
 * stores for this design: fixed layouts are scaled (see scaleWrap), block layouts reflow; the zoom steps for narrow
 * screens and the print page size follow the same effective size.
 * @param {unknown} data CharacterData (normalised again here, so raw storage data is fine)
 * @param {{art?: string|null, icon?: string|null}|null} images data URLs, plus validated https URLs in `link` mode;
 *   an invalid src, or a remote one in `embed` mode, is an error and is not ignored
 * @param {{id: string, render: Function, css: string, size: {w: number, h: number|null, minH?: number}}} template a registry template
 * @param {{imageMode?: 'embed'|'link'}} [options] `embed` (default, and what any unknown value means) needs embedded
 *   pictures and carries a CSP that allows data images only; `link` also keeps https pictures and allows them in the CSP
 * @returns {{ok: true, html: string} | {ok: false, error: string}}
 */
export function exportHtml(data, images, template, options) {
  try {
    const mode = options?.imageMode === 'link' ? 'link' : 'embed';
    const norm = normalizeCharacter(data);
    if (!norm.ok) return { ok: false, error: norm.error };
    const imgs = images || {};
    const problem = badImage(imgs, mode);
    if (problem) return { ok: false, error: problem };
    const vm = buildViewModel(norm.value, imgs);
    const eff = effectiveSize(template, vm.sheetWidths);
    return { ok: true, html: assemble(vm, template, toHtml(scaleWrap(template.render(vm), eff)), mode, eff) };
  } catch (error) {
    return { ok: false, error: `HTML을 만들지 못했습니다: ${error instanceof Error ? error.message : String(error)}` };
  }
}
