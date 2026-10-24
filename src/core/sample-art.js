// Original built-in illustration: a lighthouse keeper with a lantern, drawn from basic shapes only.
// Oversized background rects let the picture fill any slot shape (the svg viewport clips them).
import { h } from './vnode.js';

const rect = (x, y, width, height, fill, opacity) => h('rect', { x, y, width, height, fill, opacity });
const dot = (cx, cy, r, fill, opacity) => h('circle', { cx, cy, r, fill, opacity });
const shape = (d, fill, opacity) => h('path', { d, fill, opacity });

function sky() {
  const stars = [[40, 50], [95, 120], [150, 40], [210, 95], [255, 30], [350, 190], [30, 200], [120, 210], [190, 160], [380, 60]];
  return [
    rect(-1000, -1000, 2400, 1500, '#14213d'),
    rect(-1000, 110, 2400, 150, '#1f3a68', 0.55),
    rect(-1000, 250, 2400, 160, '#2a4f7c', 0.5),
    dot(300, 120, 82, '#f4e9c8', 0.12),
    dot(300, 120, 50, '#f4e9c8'),
    ...stars.map(([x, y], i) => dot(x, y, i % 3 === 0 ? 2.4 : 1.6, '#fff7d6', 0.9)),
  ];
}

function lighthouse() {
  return [
    h('polygon', { points: '316,241 -300,190 -300,300', fill: '#ffe08a', opacity: 0.12 }),
    h('polygon', { points: '316,241 800,190 800,300', fill: '#ffe08a', opacity: 0.1 }),
    h('polygon', { points: '268,430 362,430 392,480 238,480', fill: '#2b2d42' }),
    h('polygon', { points: '298,250 334,250 340,430 292,430', fill: '#e9e4d4' }),
    h('polygon', { points: '296,300 336,300 338,325 294,325', fill: '#d96a5b' }),
    h('polygon', { points: '294,365 338,365 340,390 292,390', fill: '#d96a5b' }),
    h('rect', { x: 306, y: 230, width: 20, height: 20, fill: '#ffe08a' }),
    h('polygon', { points: '300,230 332,230 316,208', fill: '#33415c' }),
    dot(316, 240, 34, '#ffe08a', 0.18),
  ];
}

function sea() {
  const wave = (y, opacity) => h('polyline', { points: `-40,${y} 40,${y - 8} 120,${y} 200,${y - 8} 280,${y} 360,${y - 8} 440,${y}`, fill: 'none', stroke: '#8fb8de', 'stroke-width': 3, opacity });
  return [rect(-1000, 420, 2400, 1000, '#0f2a43'), wave(450, 0.55), wave(490, 0.4), wave(530, 0.3)];
}

function keeper() {
  const skin = '#f2d5b8';
  const hair = '#e9edf5';
  return [
    dot(263, 408, 70, '#ffcf5a', 0.1),
    dot(263, 408, 42, '#ffcf5a', 0.2),
    shape('M112 560 Q140 340 200 300 Q260 340 288 560 Z', '#2e4a6b'),
    shape('M162 560 Q178 390 200 340 Q222 390 238 560 Z', '#e8d9b5'),
    h('line', { x1: 238, y1: 365, x2: 258, y2: 396, stroke: '#2e4a6b', 'stroke-width': 11 }),
    h('rect', { x: 252, y: 394, width: 22, height: 30, fill: '#ffcf5a' }),
    h('rect', { x: 250, y: 388, width: 26, height: 6, fill: '#33415c' }),
    shape('M166 268 Q150 330 170 392 Q178 332 180 284 Z', hair),
    shape('M234 268 Q250 330 230 392 Q222 332 220 284 Z', hair),
    dot(200, 272, 33, skin),
    shape('M165 274 Q163 224 200 224 Q239 224 235 276 Q222 248 200 250 Q180 250 165 274 Z', hair),
    dot(189, 279, 3, '#2b2d42'),
    dot(211, 279, 3, '#2b2d42'),
    h('path', { d: 'M192 292 Q200 297 208 292', fill: 'none', stroke: '#b5654f', 'stroke-width': 2 }),
    h('path', { d: 'M168 306 Q200 328 232 306 L230 324 Q200 346 170 324 Z', style: { fill: 'var(--accent)' } }),
  ];
}

/**
 * The built-in illustration as an inline svg VNode that fills its slot (viewBox 400x560).
 * @returns {object} VNode
 */
export function sampleArt() {
  return h('svg', { viewBox: '0 0 400 560', 'aria-hidden': 'true', style: { width: '100%', height: '100%', display: 'block' } },
    ...sky(), ...lighthouse(), ...sea(), ...keeper());
}
