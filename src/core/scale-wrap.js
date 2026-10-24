// Uniform scaling of the fixed-size designs: the sheet keeps its own layout size and is scaled by CSS inside a frame that
// takes the scaled size. The preview, the HTML export and the image export all go through here, so they agree.
import { h } from './vnode.js';

/**
 * True when `eff` (from effectiveSize) calls for a scale frame: a fixed layout shown at a width other than its own.
 * @param {{mode: string, scale: number}|null|undefined} eff
 * @returns {boolean}
 */
export function isScaled(eff) {
  return Boolean(eff) && eff.mode === 'scale' && eff.scale !== 1;
}

/**
 * Wrap a rendered sheet so a fixed layout appears at the user's chosen width. The sheet itself is returned unchanged
 * when nothing needs scaling (block designs reflow instead, and a design at its own width has scale 1).
 * @param {object} sheetVNode the VNode the template rendered
 * @param {{mode: string, w: number, h: number|null, scale: number, baseW: number, baseH: number|null}} eff
 *   the result of effectiveSize
 * @returns {object} VNode
 */
export function scaleWrap(sheetVNode, eff) {
  if (!isScaled(eff)) return sheetVNode;
  const scale = Number(eff.scale.toFixed(4));
  const inner = {
    width: `${eff.baseW}px`, height: `${eff.baseH}px`, transform: `scale(${scale})`, 'transform-origin': '0 0',
  };
  return h('div', { class: 'cs-scale-frame', style: { width: `${eff.w}px`, height: `${eff.h}px`, overflow: 'hidden' } },
    h('div', { class: 'cs-scale-inner', style: inner }, sheetVNode));
}
