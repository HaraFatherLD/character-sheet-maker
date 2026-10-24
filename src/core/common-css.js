// CSS shared by the live preview, the HTML export and the raster export, plus the shared system font stacks.
// Everything except .cs-sheet itself sits inside :where() (specificity 0) so template CSS always wins.

/** Sans-serif system stack (no web fonts). */
export const FONT_SANS = '"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
/** Serif system stack (no web fonts). */
export const FONT_SERIF = '"Batang","AppleMyungjo","Noto Serif KR",serif';
/** Monospace system stack (no web fonts). */
export const FONT_MONO = 'Consolas,"D2Coding",monospace';

const CLAMPS = [1, 2, 3, 4, 5, 6, 8, 10]
  .map((n) => `.cs-sheet .cs-clamp-${n}{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${n};overflow:hidden}`)
  .join('\n');

/** Base rules for `.cs-sheet`, the structural part classes and the `.cs-clamp-N` utilities. */
export const COMMON_CSS = `.cs-sheet{position:relative;overflow:hidden;box-sizing:border-box}
.cs-sheet *::before,.cs-sheet *::after{box-sizing:border-box}
:where(.cs-sheet){font-family:${FONT_SANS};line-height:1.4;color:#222;word-break:keep-all;overflow-wrap:anywhere;-webkit-text-size-adjust:none;text-size-adjust:none}
:where(.cs-sheet *){box-sizing:border-box;margin:0;padding:0}
:where(.cs-sheet ul,.cs-sheet ol){list-style:none}
:where(.cs-sheet h1,.cs-sheet h2,.cs-sheet h3,.cs-sheet h4){font-size:inherit;font-weight:inherit}
:where(.cs-sheet img,.cs-sheet svg){display:block}
:where(.cs-sheet .cs-art){position:relative;overflow:hidden}
:where(.cs-sheet .cs-art > img,.cs-sheet .cs-art > svg){width:100%;height:100%}
:where(.cs-sheet .cs-icon){display:flex;align-items:center;justify-content:center;overflow:hidden}
:where(.cs-sheet .cs-icon > img){width:100%;height:100%;object-fit:cover}
:where(.cs-sheet .cs-emblem){font-weight:700;line-height:1}
:where(.cs-sheet .cs-row){display:flex;gap:8px;align-items:baseline}
:where(.cs-sheet .cs-label){flex:none}
:where(.cs-sheet .cs-value){min-width:0}
:where(.cs-sheet .cs-tags){display:flex;flex-wrap:wrap;gap:8px}
:where(.cs-sheet .cs-stat){display:flex;align-items:center;gap:10px}
:where(.cs-sheet .cs-stat-label){flex:none;min-width:3em}
:where(.cs-sheet .cs-bar){flex:1;min-width:0;height:12px;overflow:hidden;background:rgba(0,0,0,.18)}
:where(.cs-sheet .cs-bar-fill){height:100%;background:var(--accent)}
:where(.cs-sheet .cs-stat-value){flex:none;min-width:3.5em;text-align:right}
:where(.cs-sheet .cs-radar){width:100%;height:auto;overflow:visible}
${CLAMPS}`;
