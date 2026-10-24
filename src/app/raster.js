// Image export (Chrome): the sheet is serialised to XHTML, wrapped in an svg foreignObject, loaded as an image
// and drawn onto a canvas of the requested output size.
import { SVG_NS, XHTML_NS, toXhtml } from '../core/vnode.js';
import { COMMON_CSS } from '../core/common-css.js';

const ENCODE_TIMEOUT_MS = 30000;

function toBlobAsync(canvas, mime) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('image encoding timed out')), ENCODE_TIMEOUT_MS);
    canvas.toBlob((blob) => { clearTimeout(timer); resolve(blob); }, mime, 0.92);
  });
}

/**
 * The svg document string used for rasterising (pure, so it can be inspected).
 * @param {{render: Function, css: string, size: {w: number, h: number|null}}} template
 * @param {object} vm view model
 * @param {{width: number, height: number}} out output size in px
 * @param {{w: number, h: number}} [base] sheet size in px; auto-height designs must pass the resolved (measured) size
 * @returns {string}
 */
export function buildRasterSvg(template, vm, out, base = template.size) {
  const { w, h } = base;
  const css = `${COMMON_CSS}\n${template.css}`;
  if (css.includes(']]>')) throw new Error('css must not contain the CDATA terminator');
  const markup = toXhtml(template.render(vm));
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
 * Render the sheet to an image Blob. Rejects on any failure (load error, SecurityError, null blob).
 * @param {{render: Function, css: string, size: {w: number, h: number|null}}} template
 * @param {object} vm
 * @param {{width: number, height: number}} out
 * @param {'png'|'jpeg'} format
 * @param {{w: number, h: number}} [base] sheet size in px (see buildRasterSvg)
 * @returns {Promise<Blob>}
 */
export async function rasterize(template, vm, out, format, base = template.size) {
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
