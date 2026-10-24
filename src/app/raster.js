// Image export (Chrome): the sheet is serialised to XHTML, wrapped in an svg foreignObject, loaded as an image
// and drawn onto a canvas of the requested output size.
import { SVG_NS, XHTML_NS, toXhtml } from '../core/vnode.js';
import { COMMON_CSS } from '../core/common-css.js';
import { assertRasterImages } from '../core/raster-guard.js';
import { effectiveSize, resolveBaseSize } from '../core/size.js';
import { scaleWrap } from '../core/scale-wrap.js';

const ENCODE_TIMEOUT_MS = 30000;

function toBlobAsync(canvas, mime) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('image encoding timed out')), ENCODE_TIMEOUT_MS);
    canvas.toBlob((blob) => { clearTimeout(timer); resolve(blob); }, mime, 0.92);
  });
}

/**
 * The svg document string used for rasterising (pure, so it can be inspected). The sheet is the same wrapped tree the
 * preview and the HTML export draw (scaleWrap of the template's render at the character's width). The viewBox and the
 * foreignObject have the sheet size `base` and width/height have the output size, so the browser lays the sheet out at
 * its real size and draws it scaled up or down as vector content (sharp at any output size).
 * @param {{id: string, render: Function, css: string, size: {w: number, h: number|null, minH?: number}}} template
 * @param {object} vm view model (its `sheetWidths` decide the sheet width)
 * @param {{width: number, height: number}} out output size in px
 * @param {{w: number, h: number}} [base] sheet size in px: resolveBaseSize of the effective size, so auto-height designs
 *   pass the measured height; without it the effective size at its minimum height is used
 * @returns {string}
 */
export function buildRasterSvg(template, vm, out, base) {
  const eff = effectiveSize(template, vm.sheetWidths);
  const { w, h } = base || resolveBaseSize(eff);
  const css = `${COMMON_CSS}\n${template.css}`;
  if (css.includes(']]>')) throw new Error('css must not contain the CDATA terminator');
  const markup = toXhtml(scaleWrap(template.render(vm), eff));
  return `<svg xmlns="${SVG_NS}" width="${out.width}" height="${out.height}" viewBox="0 0 ${w} ${h}">`
    + `<foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="${XHTML_NS}">`
    + `<style><![CDATA[${css}]]></style>${markup}</div></foreignObject></svg>`;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('the sheet image could not be loaded'));
    image.src = url;
  });
}

/**
 * Render the sheet to an image Blob. Rejects on any failure (load error, SecurityError, null blob), and at once when a
 * picture is not an embedded data URL.
 * @param {{id: string, render: Function, css: string, size: {w: number, h: number|null, minH?: number}}} template
 * @param {object} vm
 * @param {{width: number, height: number}} out
 * @param {'png'|'jpeg'} format
 * @param {{w: number, h: number}} [base] sheet size in px (see buildRasterSvg)
 * @returns {Promise<Blob>}
 */
export async function rasterize(template, vm, out, format, base) {
  // An svg used as an image cannot load anything from the network: a remote picture would silently draw as a blank.
  const guard = assertRasterImages({ art: vm.art?.src, icon: vm.icon?.src });
  if (!guard.ok) throw new Error(guard.error);
  const svg = buildRasterSvg(template, vm, out, base);
  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  const canvas = document.createElement('canvas');
  canvas.width = out.width;
  canvas.height = out.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas is not available');
  if (format === 'jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, out.width, out.height);
  }
  context.drawImage(image, 0, 0, out.width, out.height);
  const blob = await toBlobAsync(canvas, format === 'jpeg' ? 'image/jpeg' : 'image/png');
  if (!blob) throw new Error('the browser returned no image data');
  return blob;
}
