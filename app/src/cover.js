// VICE PRESS cover engine: posterize + gradient-map grades + halftone + ink
// outlines, drawn on a plain 2D canvas. No network, no library, no Rockstar art.
// Every panel of every layout goes through the same pipeline, so any photo
// comes out reading as GTA-style key art.

export const GRADES = [
  { id: 'natural', name: 'Natural', natural: true, ramp: [[30, 18, 10], [120, 70, 40], [255, 150, 80], [255, 200, 130], [255, 240, 210]] },
  { id: 'sunset', name: 'Sunset', ramp: [[26, 8, 38], [122, 28, 96], [255, 46, 136], [255, 122, 60], [255, 224, 130]] },
  { id: 'neon', name: 'Neon', ramp: [[8, 4, 40], [90, 16, 120], [255, 0, 150], [0, 220, 255], [220, 255, 255]] },
  { id: 'golden', name: 'Golden', ramp: [[24, 14, 4], [110, 58, 10], [214, 122, 26], [255, 190, 80], [255, 244, 200]] },
  { id: 'miami', name: 'Miami', ramp: [[4, 26, 34], [10, 110, 120], [255, 45, 130], [255, 150, 190], [210, 250, 250]] },
  { id: 'vice', name: 'Vice Purple', ramp: [[14, 6, 34], [74, 22, 110], [150, 50, 200], [210, 110, 240], [240, 220, 255]] },
  { id: 'noir', name: 'Teal Noir', ramp: [[4, 10, 14], [10, 50, 58], [20, 110, 110], [120, 190, 170], [230, 245, 235]] },
  { id: 'bubblegum', name: 'Bubblegum', ramp: [[40, 8, 30], [150, 40, 110], [255, 110, 190], [255, 190, 220], [255, 245, 250]] },
  { id: 'mono', name: 'Mono Ink', ramp: [[10, 10, 12], [40, 40, 48], [110, 110, 120], [200, 200, 205], [250, 250, 248]] },
  { id: 'comic', name: 'Comic Ink', ramp: [[8, 8, 10], [35, 30, 35], [100, 90, 95], [180, 60, 55], [255, 244, 230]] },
];

export const SIZES = [
  { id: 'wide', name: '1920 × 1080', label: 'wide', w: 1920, h: 1080 },
  { id: 'portrait', name: '1080 × 1350', label: 'portrait', w: 1080, h: 1350 },
  { id: 'square', name: '1080 × 1080', label: 'square', w: 1080, h: 1080 },
  { id: 'story', name: '1080 × 1920', label: 'story', w: 1080, h: 1920 },
  { id: 'social', name: '1200 × 628', label: 'social', w: 1200, h: 628 },
];

// Panels are normalized rects (0..1 of the cover). title.zone: 'band' draws a
// solid title block, 'overlay-top'/'overlay-bottom' draw over the photo.
export const LAYOUTS = [
  { id: 'grid', name: 'Grid', panels: [
    { x: 0.0, y: 0.0, w: 0.36, h: 0.66, slot: 0 },
    { x: 0.38, y: 0.0, w: 0.2, h: 0.205, slot: 1 },
    { x: 0.38, y: 0.225, w: 0.2, h: 0.205, slot: 2 },
    { x: 0.38, y: 0.45, w: 0.2, h: 0.21, slot: 3 },
    { x: 0.60, y: 0.0, w: 0.40, h: 0.66, slot: 1 },
    { x: 0.0, y: 0.68, w: 0.11, h: 0.32, slot: 2 },
    { x: 0.12, y: 0.68, w: 0.11, h: 0.32, slot: 3 },
    { x: 0.24, y: 0.68, w: 0.11, h: 0.32, slot: 0 },
    { x: 0.36, y: 0.68, w: 0.11, h: 0.32, slot: 1 },
  ], title: { zone: 'band', x: 0.48, y: 0.68, w: 0.52, h: 0.29 }, badge: { x: 0.02, y: 0.03 } },
  { id: 'polaroid', name: 'Polaroid', bg: { stops: [[0, '#6a1fb8'], [0.55, '#c2187a'], [1, '#ff2e88']], halftone: true }, panels: [
    { x: 0.08, y: 0.05, w: 0.28, h: 0.32, slot: 0, tilt: -0.07, frame: true },
    { x: 0.64, y: 0.05, w: 0.28, h: 0.32, slot: 1, tilt: 0.05, frame: true },
    { x: 0.03, y: 0.60, w: 0.28, h: 0.32, slot: 2, tilt: -0.05, frame: true },
    { x: 0.36, y: 0.60, w: 0.28, h: 0.32, slot: 3, tilt: 0.06, frame: true },
    { x: 0.69, y: 0.60, w: 0.28, h: 0.32, slot: 0, tilt: -0.04, frame: true },
  ], title: { zone: 'band', x: 0.0, y: 0.41, w: 1.0, h: 0.16 }, badge: { x: 0.05, y: 0.03 } },
  { id: 'strip', name: '5-Strip', panels: [0, 1, 2, 3, 4].map((i) => (
    { x: 0.004 + i * 0.1992, y: 0.0, w: 0.196, h: 1.0, slot: 0, slice: i })), title: { zone: 'overlay-mid', x: 0.0, y: 0.38, w: 1.0, h: 0.24 }, badge: { x: 0.02, y: 0.02 } },
  { id: 'comic', name: 'Comic Strip', panels: [0, 1, 2, 3].map((i) => (
    { x: 0.005 + i * 0.249, y: 0.05, w: 0.242, h: 0.57, slot: i })), title: { zone: 'band', x: 0.0, y: 0.64, w: 1.0, h: 0.33 }, badge: { x: 0.02, y: 0.07 } },
  { id: 'magazine', name: 'Magazine', panels: [
    { x: 0.0, y: 0.0, w: 1.0, h: 1.0, slot: 0 },
  ], title: { zone: 'overlay-top', x: 0.0, y: 0.0, w: 1.0, h: 0.22 }, badge: { x: 0.85, y: 0.24 } },
  { id: 'mosaic', name: 'Mosaic', panels: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
    { x: 0.004 + (i % 3) * 0.332, y: 0.004 + Math.floor(i / 3) * 0.246, w: 0.328, h: 0.238, slot: i % 4 })), title: { zone: 'band', x: 0.0, y: 0.75, w: 1.0, h: 0.22 }, badge: { x: 0.02, y: 0.02 } },
  { id: 'diptych', name: 'Diptych', panels: [
    { x: 0.0, y: 0.0, w: 0.495, h: 0.74, slot: 0 },
    { x: 0.505, y: 0.0, w: 0.495, h: 0.74, slot: 1 },
  ], title: { zone: 'band', x: 0.0, y: 0.76, w: 1.0, h: 0.21 }, badge: { x: 0.44, y: 0.03 } },
  { id: 'fullbleed', name: 'Full-Bleed', panels: [
    { x: 0.0, y: 0.0, w: 1.0, h: 1.0, slot: 0 },
  ], title: { zone: 'overlay-bottom', x: 0.0, y: 0.62, w: 1.0, h: 0.35 }, badge: { x: 0.03, y: 0.04 } },
];

export const TITLE_FONTS = [
  { id: 'anton', name: 'Anton', stack: 'Anton, "Arial Narrow", Impact, sans-serif' },
  { id: 'condensed', name: 'Condensed', stack: '"Arial Narrow", "Helvetica Neue Condensed", "Franklin Gothic Medium", sans-serif' },
  { id: 'impact', name: 'Impact', stack: 'Impact, "Arial Black", "Arial Narrow", sans-serif' },
];

export function gradeById(id) { return GRADES.find((g) => g.id === id) || GRADES[0]; }
export function layoutById(id) { return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0]; }
export function sizeById(id) { return SIZES.find((s) => s.id === id) || SIZES[0]; }
export function fontById(id) { return TITLE_FONTS.find((f) => f.id === id) || TITLE_FONTS[0]; }

const panelCache = new Map();
function cacheKey(img, w, h, crop, slice, grade, ink, inkStrength, outlines, halftone, contrast, saturation, grain, vignette) {
  return [img.src || img.currentSrc || 'img', w, h, crop.zoom.toFixed(2), crop.ox.toFixed(2), crop.oy.toFixed(2),
    slice ?? '-', grade.id, ink ? 1 : 0, inkStrength.toFixed(2), outlines ? 1 : 0, halftone.toFixed(2),
    (contrast ?? 0).toFixed(2), (saturation ?? 0).toFixed(2), (grain ?? 0).toFixed(2), (vignette ?? 0).toFixed(2)].join('|');
}

function lerpRamp(ramp, t) {
  const x = Math.max(0, Math.min(1, t)) * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(x));
  const f = x - i;
  const a = ramp[i], b = ramp[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

// Posterize one panel: draw the cropped photo, quantize it to flat bands,
// gradient-map it, optionally Sobel-outline it, then halftone + grain.
// The Natural grade skips posterize/halftone/outlines: it only gets the warm
// photographic grade (contrast, saturation, warmth) + grain + vignette.
export function processPanel(img, pw, ph, crop, slice, grade, ink, inkStrength, outlines, halftone, contrast, saturation, grain, vignette) {
  const key = cacheKey(img, pw, ph, crop, slice, grade, ink, inkStrength, outlines, halftone, contrast, saturation, grain, vignette);
  const hit = panelCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(pw)); c.height = Math.max(2, Math.round(ph));
  const ctx = c.getContext('2d');
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (slice !== undefined && slice !== null) {
    const sw = iw / 5;
    ctx.drawImage(img, slice * sw, 0, sw, ih, 0, 0, c.width, c.height);
  } else {
    const base = Math.max(c.width / iw, c.height / ih);
    const z = crop.zoom || 1;
    const dw = iw * base * z, dh = ih * base * z;
    const dx = (c.width - dw) / 2 + (crop.ox || 0) * Math.max(0, (dw - c.width) / 2);
    const dy = (c.height - dh) / 2 + (crop.oy || 0) * Math.max(0, (dh - c.height) / 2);
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  const imageData = ctx.getImageData(0, 0, c.width, c.height);
  const d = imageData.data;
  const n = c.width * c.height;
  const lum = new Float32Array(n);
  // Fine tune first: contrast around mid-grey, then saturation around luminance.
  const cf = 1 + (contrast || 0) * 0.8;
  const sf = 1 + (saturation || 0);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    let r = (d[o] - 128) * cf + 128, g = (d[o + 1] - 128) * cf + 128, b = (d[o + 2] - 128) * cf + 128;
    const l0 = 0.299 * r + 0.587 * g + 0.114 * b;
    r = l0 + (r - l0) * sf; g = l0 + (g - l0) * sf; b = l0 + (b - l0) * sf;
    d[o] = Math.max(0, Math.min(255, r));
    d[o + 1] = Math.max(0, Math.min(255, g));
    d[o + 2] = Math.max(0, Math.min(255, b));
    lum[i] = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
  }
  // Sobel edge strength, computed on the luminance before posterizing.
  // Natural grade stays photographic, so it never gets ink outlines.
  let edge = null;
  if (outlines && !grade.natural) {
    edge = new Float32Array(n);
    const W = c.width;
    for (let y = 1; y < c.height - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const gx = -lum[i - W - 1] - 2 * lum[i - 1] - lum[i + W - 1] + lum[i - W + 1] + 2 * lum[i + 1] + lum[i + W + 1];
        const gy = -lum[i - W - 1] - 2 * lum[i - W] - lum[i - W + 1] + lum[i + W - 1] + 2 * lum[i + W] + lum[i + W + 1];
        edge[i] = Math.sqrt(gx * gx + gy * gy);
      }
    }
  }
  if (grade.natural) {
    // Photographic warm grade: boost reds, hold greens, pull blues back.
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      d[o] = Math.max(0, Math.min(255, d[o] * 1.07));
      d[o + 1] = Math.max(0, Math.min(255, d[o + 1] * 1.01));
      d[o + 2] = Math.max(0, Math.min(255, d[o + 2] * 0.93));
    }
  } else {
    const levels = 5;
    const ramp = grade.ramp;
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      const q = Math.round((lum[i] / 255) * (levels - 1)) / (levels - 1); // flat band
      const rc = lerpRamp(ramp, q);
      const pr = Math.round(d[o] / 64) * 64, pg = Math.round(d[o + 1] / 64) * 64, pb = Math.round(d[o + 2] / 64) * 64;
      const mix = ink ? inkStrength : 0;
      d[o] = pr + (rc[0] - pr) * mix;
      d[o + 1] = pg + (rc[1] - pg) * mix;
      d[o + 2] = pb + (rc[2] - pb) * mix;
      if (edge && edge[i] > 90) { d[o] = 22; d[o + 1] = 8; d[o + 2] = 30; }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  // Halftone dots: dot size grows where the picture is dark.
  if (!grade.natural && halftone > 0.02) {
    const spacing = Math.max(4, (14 - halftone * 9) * (c.width / 900 + 0.4));
    ctx.fillStyle = 'rgba(18,6,28,0.5)';
    for (let y = spacing / 2; y < c.height; y += spacing) {
      for (let x = spacing / 2; x < c.width; x += spacing) {
        const li = lum[Math.min(n - 1, Math.floor(y) * c.width + Math.floor(x))] / 255;
        const r = (1 - li) * spacing * 0.42;
        if (r > 0.7) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
      }
    }
  }
  // Grain + vignette, driven by the fine-tune sliders.
  const grainCount = Math.round((grain ?? 0.28) * 800);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let k = 0; k < grainCount; k++) ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1.4, 1.4);
  const vg = ctx.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.35,
    c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(10,2,20,${((vignette ?? 0.5) * 0.55).toFixed(3)})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, c.width, c.height);
  if (panelCache.size > 48) panelCache.clear();
  panelCache.set(key, c);
  return c;
}

function fitFont(ctx, text, maxWidth, startSize, stack, weight, minSize = 14) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${stack}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= Math.max(1, Math.round(size * 0.04));
    ctx.font = `${weight} ${size}px ${stack}`;
  }
  return size;
}

export function drawStarburst(ctx, cx, cy, r, text1, text2) {
  const points = 16;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const ang = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd21f';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.strokeStyle = '#1c0a24';
  ctx.stroke();
  ctx.fillStyle = '#1c0a24';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(r * 0.42)}px Anton, "Arial Narrow", Impact, sans-serif`;
  ctx.fillText(text1, 0, -r * 0.16);
  ctx.font = `700 ${Math.round(r * 0.2)}px Anton, "Arial Narrow", Impact, sans-serif`;
  ctx.fillText(text2, 0, r * 0.28);
  ctx.restore();
}

// Small palm silhouette (gold with a dark outline, so it reads on any ground)
// with a half-sun: the divider strip that sits just above the tagline.
function drawPalm(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  const tx = s * 0.18, ty = -s * 0.92;
  const fronds = [];
  for (let k = -2; k <= 2; k++) {
    const a = -Math.PI / 2 + k * 0.5;
    fronds.push([tx, ty, tx + Math.cos(a) * s * 0.28, ty + Math.sin(a) * s * 0.28 - s * 0.08,
      tx + Math.cos(a) * s * 0.46, ty + Math.sin(a) * s * 0.42 + s * 0.12]);
  }
  for (const [w, col] of [[s * 0.17, '#1c0a24'], [s * 0.09, '#ffd21f']]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1, w);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 0.08, -s * 0.55, tx, ty);
    ctx.stroke();
    ctx.beginPath();
    for (const [x0, y0, x1, y1, x2, y2] of fronds) {
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawPalmStrip(ctx, cx, y, zw, zh) {
  const s = zh * 0.065;
  const spacing = zw / 10;
  // half-sun in the middle, palms flanking it
  const r = zh * 0.04;
  ctx.save();
  ctx.translate(cx, y);
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = '#ffd21f';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.strokeStyle = '#1c0a24';
  ctx.stroke();
  ctx.restore();
  for (let k = 1; k <= 4; k++) {
    drawPalm(ctx, cx - k * spacing, y, s);
    drawPalm(ctx, cx + k * spacing, y, s);
  }
}

function drawStar(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(ang) * rad, y = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// Round pink seal: three stars over two lines of text.
export function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2e88';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = '#c2187a';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1.5, r * 0.03);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  for (let k = -1; k <= 1; k++) drawStar(ctx, k * r * 0.42, -r * 0.42, r * 0.16);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(r * 0.22)}px Anton, "Arial Narrow", Impact, sans-serif`;
  ctx.fillText('ORIGINAL', 0, r * 0.08);
  ctx.fillText('COVER ART', 0, r * 0.38);
  ctx.restore();
}

// Film footer strip at the very bottom: monogram box, tiny capitals credit
// line (it carries the current title), and a drawn barcode on the right.
function drawFooter(ctx, W, H, state) {
  const fh = Math.max(22, Math.round(H * 0.03));
  const y = H - fh;
  ctx.fillStyle = '#0d0518';
  ctx.fillRect(0, y, W, fh);
  const pad = Math.max(8, W * 0.01);
  const mono = fh * 0.72;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1, fh * 0.04);
  ctx.strokeRect(pad, y + (fh - mono) / 2, mono, mono);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(mono * 0.5)}px Anton, "Arial Narrow", Impact, sans-serif`;
  ctx.fillText('VP', pad + mono / 2, y + fh / 2 + 1);
  const bw = Math.max(48, W * 0.085), bh = fh * 0.68;
  const bx = W - pad - bw, by = y + (fh - bh) / 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#0d0518';
  const bars = [3, 1, 2, 1, 4, 1, 1, 3, 2, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 3, 2, 1, 1];
  const unit = Math.max(1, bw / 90);
  let bx2 = bx + 3;
  for (const wdt of bars) {
    ctx.fillRect(bx2, by + 2, wdt * unit, bh - 4);
    bx2 += (wdt + 1) * unit;
    if (bx2 > bx + bw - 4) break;
  }
  const title = (state.title || 'VICE PRESS').toUpperCase();
  const text = `${title} - A VICE PRESS COVER STUDIO PICTURE - STARRING YOU - SHOT ON YOUR OWN CAMERA - GRADED BY HAND - LETTERING AND SEAL ORIGINAL - CAT. VP-SS-0626`;
  const tx = pad + mono + pad, tw = bx - pad - tx;
  const size = fitFont(ctx, text, tw, Math.round(fh * 0.5), '"Arial Narrow", "Helvetica Neue", sans-serif', 700, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px "Arial Narrow", "Helvetica Neue", sans-serif`;
  ctx.fillText(text, tx, y + fh / 2 + 1);
}

function drawCaption(ctx, W, H, zone, state) {
  const { title, script, tagline } = state;
  const zx = zone.x * W, zy = zone.y * H, zw = zone.w * W, zh = zone.h * H;
  const font = fontById(state.titleFont);
  const pad = Math.min(zw, zh) * 0.06 + 8;
  if (zone.zone === 'band') {
    const g = ctx.createLinearGradient(zx, zy, zx, zy + zh);
    g.addColorStop(0, '#2b0a3d'); g.addColorStop(0.55, '#c2187a'); g.addColorStop(1, '#ff7a3c');
    ctx.fillStyle = g;
    ctx.fillRect(zx, zy, zw, zh);
    // halftone dots along the top edge of the band
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    const sp = Math.max(7, zh * 0.09);
    for (let x = zx + sp; x < zx + zw; x += sp) { ctx.beginPath(); ctx.arc(x, zy + sp * 0.5, sp * 0.18, 0, Math.PI * 2); ctx.fill(); }
  } else {
    const g = ctx.createLinearGradient(0, zy, 0, zy + zh);
    if (zone.zone === 'overlay-top') { g.addColorStop(0, 'rgba(10,2,22,0.72)'); g.addColorStop(1, 'rgba(10,2,22,0)'); }
    else if (zone.zone === 'overlay-mid') { g.addColorStop(0, 'rgba(10,2,22,0)'); g.addColorStop(0.5, 'rgba(10,2,22,0.55)'); g.addColorStop(1, 'rgba(10,2,22,0)'); }
    else { g.addColorStop(0, 'rgba(10,2,22,0)'); g.addColorStop(1, 'rgba(10,2,22,0.78)'); }
    ctx.fillStyle = g;
    ctx.fillRect(zx, zy, zw, zh);
  }
  const cx = zx + zw / 2;
  // 5-star review quote above the title.
  if (state.quote) {
    const qSize = fitFont(ctx, state.quote.toUpperCase(), zw * 0.9, Math.max(11, zh * 0.085), 'Anton, "Arial Narrow", Impact, sans-serif', 700);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd21f';
    ctx.font = `700 ${qSize}px Anton, "Arial Narrow", Impact, sans-serif`;
    ctx.fillText(state.quote.toUpperCase(), cx, zy + zh * 0.12);
    ctx.restore();
  }
  const titleText = (title || 'VICE PRESS').toUpperCase();
  const titleSize = fitFont(ctx, titleText, zw - pad * 2, Math.min(zh * 0.40, zw * 0.16), font.stack, 900);
  const titleY = zy + zh * 0.38;
  const grad = ctx.createLinearGradient(0, zy + zh * 0.08, 0, zy + zh * 0.62);
  grad.addColorStop(0, '#ffe95e'); grad.addColorStop(0.45, '#ff9a3c'); grad.addColorStop(0.75, '#ff2e88'); grad.addColorStop(1, '#b45cff');
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  // 3D extrusion: a dark offset copy behind the gradient title.
  const off = Math.max(2, titleSize * 0.06);
  ctx.fillStyle = '#2a0a3d';
  ctx.font = `900 ${titleSize}px ${font.stack}`;
  ctx.fillText(titleText, cx + off, titleY + off);
  ctx.strokeStyle = '#1c0a24';
  ctx.lineWidth = Math.max(2, titleSize * 0.09);
  ctx.strokeText(titleText, cx, titleY);
  ctx.fillStyle = grad;
  ctx.fillText(titleText, cx, titleY);
  ctx.restore();
  if (script) {
    const sSize = fitFont(ctx, script, zw * 0.8, Math.min(zh * 0.16, 56), 'Pacifico, cursive', 400);
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = sSize * 0.35;
    ctx.font = `${sSize}px Pacifico, cursive`;
    ctx.fillText(script, cx, zy + zh * 0.61);
    ctx.restore();
  }
  // Palm-tree divider strip just above the tagline.
  drawPalmStrip(ctx, cx, zy + zh * 0.75, zw, zh);
  if (tagline) {
    const tSize = fitFont(ctx, tagline.toUpperCase(), zw * 0.86, Math.min(zh * 0.11, 26), font.stack, 700);
    const tw = ctx.measureText(tagline.toUpperCase()).width + tSize * 1.1;
    const th = tSize * 1.4;
    const ty = zy + zh - th - Math.max(4, zh * 0.03);
    ctx.fillStyle = '#0d0518';
    ctx.fillRect(cx - tw / 2, ty, tw, th);
    ctx.fillStyle = '#ffe95e';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${tSize}px ${font.stack}`;
    ctx.fillText(tagline.toUpperCase(), cx, ty + th / 2 + 1);
  }
}

// Draw the whole cover onto canvas at its own size. state.photos are Image
// objects (or null); state.assignments maps panel -> photo index; state.crops
// maps panel -> {zoom, ox, oy}. Returns the list of panel rects in pixels,
// so the editor can hit-test clicks and drags.
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, W, H);
  if (layout.bg) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    for (const [t, c] of layout.bg.stops) g.addColorStop(t, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (layout.bg.halftone) {
      const sp = Math.max(14, W * 0.022);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      for (let y = sp / 2; y < H; y += sp) {
        for (let x = sp / 2; x < W; x += sp) {
          ctx.beginPath(); ctx.arc(x, y, Math.max(1.5, sp * 0.11), 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  }
  const rects = [];
  layout.panels.forEach((p, i) => {
    const px = p.x * W, py = p.y * H, pw = p.w * W, ph = p.h * H;
    rects.push({ x: px, y: py, w: pw, h: ph, panel: i });
    const photoIdx = state.assignments && state.assignments[i] !== undefined
      ? state.assignments[i] : (p.slot ?? 0) % Math.max(1, state.photos.length);
    const img = state.photos[photoIdx];
    const crop = (state.crops && state.crops[i]) || { zoom: 1, ox: 0, oy: 0 };
    ctx.save();
    if (p.tilt) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate(p.tilt);
      ctx.translate(-pw / 2, -ph / 2);
    } else {
      ctx.translate(px, py);
    }
    if (p.frame) {
      ctx.fillStyle = '#fdf8ef';
      ctx.fillRect(-pw * 0.04, -ph * 0.05, pw * 1.08, ph * 1.16);
    }
    if (img) {
      const fw = p.frame ? pw : pw, fh = p.frame ? ph : ph;
      const panel = processPanel(img, Math.max(2, Math.round(fw)), Math.max(2, Math.round(fh)),
        crop, p.slice ?? null, grade, state.ink, state.inkStrength, state.outlines, state.halftone,
        state.contrast, state.saturation, state.grain, state.vignette);
      ctx.drawImage(panel, 0, 0, fw, fh);
    } else {
      ctx.fillStyle = '#2a1238';
      ctx.fillRect(0, 0, pw, ph);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(6, 6, pw - 12, ph - 12);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `700 ${Math.max(11, pw * 0.07)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('+ ADD PHOTO', pw / 2, ph / 2);
    }
    ctx.restore();
    // crisp black gutter around each panel (framed panels carry their own
    // white frame, so they skip the gutter entirely)
    if (p.frame) return;
    ctx.strokeStyle = '#0d0518';
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
  });
  drawCaption(ctx, W, H, layout.title, state);
  const b = layout.badge;
  const br = Math.min(W, H) * 0.075;
  if (state.badge === 'seal') drawSeal(ctx, b.x * W + br, b.y * H + br, br);
  else if (state.badge !== 'none') drawStarburst(ctx, b.x * W + br, b.y * H + br, br, 'NEW', 'SUMMER 2026');
  drawFooter(ctx, W, H, state);
  return rects;
}
