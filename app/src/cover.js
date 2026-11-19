// VICE PRESS — cover art engine. Plain canvas 2D, no network, no libraries.
// A cover is one render: graded photos in panels, then the title block,
// the palm divider, the tagline strip, the film footer and the badge.

export const GRADES = [
  { id: 'natural', name: 'Natural', poster: false, ramp: null, warm: 0.22 },
  { id: 'sunset', name: 'Sunset', poster: true, levels: 5, ramp: ['#1d1033', '#7b2d5e', '#e2583e', '#ff9e4f', '#ffe9a8'] },
  { id: 'neon', name: 'Neon', poster: true, levels: 5, ramp: ['#12002e', '#5b0a6e', '#d81e8f', '#22d3ee', '#f5f3ff'] },
  { id: 'golden', name: 'Golden', poster: true, levels: 5, ramp: ['#241505', '#6b3a0d', '#c47a1e', '#f2b544', '#ffe9b0'] },
  { id: 'miami', name: 'Miami', poster: true, levels: 5, ramp: ['#04222b', '#0e7d7b', '#2dd4bf', '#f472b6', '#fdf2f8'] },
  { id: 'vice-purple', name: 'Vice Purple', poster: true, levels: 5, ramp: ['#1a0b2e', '#5b21b6', '#a855f7', '#e9d5ff', '#fdf4ff'] },
  { id: 'teal-noir', name: 'Teal Noir', poster: true, levels: 4, ramp: ['#02141a', '#0f3d46', '#177e8c', '#a7f3d0'] },
  { id: 'bubblegum', name: 'Bubblegum', poster: true, levels: 5, ramp: ['#3b0a2a', '#be185d', '#f472b6', '#fbcfe8', '#fff1f2'] },
  { id: 'mono-ink', name: 'Mono Ink', poster: true, levels: 4, ramp: ['#0a0a0a', '#404040', '#a3a3a3', '#f5f5f5'] },
  { id: 'comic-ink', name: 'Comic Ink', poster: true, levels: 4, ramp: ['#14060a', '#7f1d3a', '#f97316', '#fef08a'] },
];

export const LAYOUTS = [
  { id: 'grid', name: 'Grid' },
  { id: 'polaroid', name: 'Polaroid' },
  { id: 'five-strip', name: '5-Strip' },
  { id: 'comic', name: 'Comic Strip' },
  { id: 'magazine', name: 'Magazine' },
  { id: 'mosaic', name: 'Mosaic' },
  { id: 'diptych', name: 'Diptych' },
  { id: 'full-bleed', name: 'Full-Bleed' },
];

export const SIZES = [
  { id: 'wide', name: 'Wide 1920×1080', w: 1920, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { id: 'square', name: 'Square 1080×1080', w: 1080, h: 1080 },
  { id: 'story', name: 'Story 1080×1920', w: 1080, h: 1920 },
  { id: 'social', name: 'Social 1200×628', w: 1200, h: 628 },
];

export const TITLE_FONTS = {
  anton: '"Anton", "Arial Narrow", Impact, sans-serif',
  condensed: '"Arial Narrow", "Helvetica Neue", Impact, sans-serif',
  impact: 'Impact, "Arial Narrow", sans-serif',
};

const gradeById = (id) => GRADES.find((g) => g.id === id) || GRADES[0];

// Panels are fractions of the cover. Title zones are fractions too.
export function layoutSpec(layout) {
  const F = (x, y, w, h, rot = 0) => ({ x, y, w, h, rot });
  switch (layout) {
    case 'polaroid':
      return {
        panels: [F(0.06, 0.03, 0.40, 0.34, -3), F(0.54, 0.03, 0.40, 0.34, 3), F(0.04, 0.60, 0.29, 0.30, -2), F(0.355, 0.60, 0.29, 0.30, 1.5), F(0.67, 0.60, 0.29, 0.30, 3)],
        title: { x: 0.05, y: 0.40, w: 0.90, h: 0.18, align: 'center' }, bg: 'polaroid', frame: true,
      };
    case 'five-strip':
      return { panels: [F(0, 0, 1, 1)], title: { x: 0.05, y: 0.38, w: 0.90, h: 0.24, align: 'center', band: true }, bg: 'dark', strips: 5 };
    case 'comic':
      return { panels: [F(0.015, 0.04, 0.235, 0.60), F(0.26, 0.04, 0.235, 0.60), F(0.505, 0.04, 0.235, 0.60), F(0.75, 0.04, 0.235, 0.60)], title: { x: 0.05, y: 0.68, w: 0.90, h: 0.24, align: 'center' }, bg: 'dark' };
    case 'magazine':
      return { panels: [F(0, 0, 1, 1)], title: { x: 0.05, y: 0.04, w: 0.90, h: 0.22, align: 'center', masthead: true }, bg: 'dark' };
    case 'mosaic':
      return { panels: [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => F(0.01 + c * 0.33, 0.01 + r * 0.27, 0.31, 0.25))), title: { x: 0.05, y: 0.83, w: 0.90, h: 0.12, align: 'center', band: true }, bg: 'dark' };
    case 'diptych':
      return { panels: [F(0.01, 0.01, 0.48, 0.80), F(0.51, 0.01, 0.48, 0.80)], title: { x: 0.05, y: 0.83, w: 0.90, h: 0.12, align: 'center', band: true }, bg: 'dark' };
    case 'full-bleed':
      return { panels: [F(0, 0, 1, 1)], title: { x: 0.05, y: 0.68, w: 0.90, h: 0.20, align: 'left', band: true }, bg: 'dark' };
    case 'grid':
    default:
      return {
        panels: [F(0, 0, 0.42, 0.68), F(0.42, 0, 0.20, 0.227), F(0.42, 0.227, 0.20, 0.227), F(0.42, 0.453, 0.20, 0.227), F(0.62, 0, 0.38, 0.45), F(0, 0.68, 0.207, 0.20), F(0.207, 0.68, 0.207, 0.20), F(0.414, 0.68, 0.207, 0.20)],
        title: { x: 0.63, y: 0.68, w: 0.36, h: 0.20, align: 'left' }, bg: 'dark',
      };
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }
function hexRgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rampColor(ramp, t) {
  const x = Math.max(0, Math.min(0.999, t)) * (ramp.length - 1);
  const i = Math.floor(x), f = x - i;
  const a = hexRgb(ramp[i]), b = hexRgb(ramp[Math.min(ramp.length - 1, i + 1)]);
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
}

// Grade one photo into a small offscreen canvas. Cached per photo + grade.
const gradeCache = new Map();
export function gradedPhoto(photo, gradeId, tune) {
  const key = `${photo._vpKey || photo.src || 'img' }|${gradeId}|${tune.contrast}|${tune.saturation}`;
  if (gradeCache.has(key)) return gradeCache.get(key);
  const grade = gradeById(gradeId);
  const w = 720, h = Math.max(2, Math.round((720 * photo.naturalHeight) / Math.max(1, photo.naturalWidth)));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (!grade.poster) {
    // Natural: warm sunset grade, photographic. Slight warmth + contrast + saturation.
    ctx.filter = `saturate(${(1.14 + tune.saturation).toFixed(2)}) contrast(${(1.07 + tune.contrast).toFixed(2)}) sepia(0.16) brightness(1.03)`;
    ctx.drawImage(photo, 0, 0, w, h);
    ctx.filter = 'none';
    ctx.fillStyle = `rgba(255, 122, 40, ${grade.warm * 0.35})`;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.filter = `saturate(${(1.05 + tune.saturation).toFixed(2)}) contrast(${(1.05 + tune.contrast).toFixed(2)})`;
    ctx.drawImage(photo, 0, 0, w, h);
    ctx.filter = 'none';
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    const levels = grade.levels || 5;
    for (let i = 0; i < d.length; i += 4) {
      const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      const q = Math.floor(lum * levels) / Math.max(1, levels - 1);
      const col = rampColor(grade.ramp, Math.min(1, q));
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2];
    }
    ctx.putImageData(img, 0, 0);
  }
  if (gradeCache.size > 24) gradeCache.clear();
  gradeCache.set(key, c);
  return c;
}

function sobelEdges(src, threshold) {
  const w = src.width, h = src.height;
  const sctx = src.getContext('2d');
  const img = sctx.getImageData(0, 0, w, h), d = img.data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const octx = out.getContext('2d');
  const oimg = octx.createImageData(w, h), od = oimg.data;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
    const gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
    const mag = Math.sqrt(gx * gx + gy * gy);
    if (mag > threshold) { od[i * 4] = 20; od[i * 4 + 1] = 8; od[i * 4 + 2] = 30; od[i * 4 + 3] = 235; }
  }
  octx.putImageData(oimg, 0, 0);
  return out;
}

function drawPhotoInto(ctx, graded, panel, slot, px, py, pw, ph) {
  const iw = graded.width, ih = graded.height;
  const zoom = slot?.zoom || 1;
  const scale = Math.max(pw / iw, ph / ih) * zoom;
  const dw = iw * scale, dh = ih * scale;
  const dx = px + (pw - dw) / 2 + (slot?.dx || 0) * pw * 0.2;
  const dy = py + (ph - dh) / 2 + (slot?.dy || 0) * ph * 0.2;
  ctx.drawImage(graded, dx, dy, dw, dh);
}

function halftone(ctx, x, y, w, h, density, lumFn) {
  const gap = Math.max(6, 26 - density * 18);
  ctx.save();
  for (let yy = y + gap / 2; yy < y + h; yy += gap) {
    for (let xx = x + gap / 2; xx < x + w; xx += gap) {
      const l = lumFn ? lumFn(xx, yy) : 0.5;
      const r = Math.max(0.4, gap * 0.32 * (1 - l) + gap * 0.08);
      ctx.fillStyle = 'rgba(10, 5, 20, 0.28)';
      ctx.beginPath(); ctx.arc(xx, yy, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

let noiseCanvas = null;
function grain(ctx, w, h, amount) {
  if (!noiseCanvas) {
    noiseCanvas = document.createElement('canvas'); noiseCanvas.width = 160; noiseCanvas.height = 160;
    const nctx = noiseCanvas.getContext('2d');
    const img = nctx.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) { const v = 100 + Math.random() * 155; img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255; }
    nctx.putImageData(img, 0, 0);
  }
  ctx.save(); ctx.globalAlpha = amount * 0.35; ctx.globalCompositeOperation = 'overlay';
  const pat = ctx.createPattern(noiseCanvas, 'repeat');
  ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); ctx.restore();
}

function vignette(ctx, w, h, amount) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,0,20,${0.55 * amount})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

function fitFont(ctx, text, maxW, startPx, fontStack, weight = '') {
  let px = startPx;
  while (px > 12) {
    ctx.font = `${weight} ${px}px ${fontStack}`;
    if (ctx.measureText(text).width <= maxW) break;
    px -= 2;
  }
  return px;
}

function drawTitleText(ctx, caption, zone, W, titleFont) {
  const { x, y, w, h } = zone;
  const cx = x + (zone.align === 'left' ? 0 : zone.align === 'right' ? w : w / 2);
  ctx.textAlign = zone.align === 'left' ? 'left' : zone.align === 'right' ? 'right' : 'center';
  ctx.textBaseline = 'alphabetic';
  // Sizes are capped by the zone height so quote, title and script stack
  // without ever overlapping: quote on top, title in the middle, script below.
  const title = (caption.title || 'VICE PRESS').toUpperCase();
  const qpx = Math.max(10, Math.min(Math.round(W * 0.013), h * 0.14));
  const spx = Math.max(12, Math.min(Math.round(W * 0.028), h * 0.24));
  const tpx = Math.min(fitFont(ctx, title, w * 0.98, Math.round(W * 0.075), TITLE_FONTS[titleFont] || TITLE_FONTS.anton), h * 0.46);
  const total = (caption.quote ? qpx * 1.5 : 0) + tpx + (caption.script ? spx * 1.35 : 0);
  let cursor = y + Math.max(0, (h - total) * 0.3) + qpx;
  // Review quote: five gold stars + quote in small capitals.
  if (caption.quote) {
    ctx.font = `700 ${qpx}px "Arial Narrow", Arial, sans-serif`;
    ctx.fillStyle = '#ffd34d';
    ctx.fillText(caption.quote, cx, cursor);
    cursor += qpx * 0.5 + tpx * 0.82;
  } else {
    cursor += tpx * 0.82;
  }
  // Title: 3D extruded, sunset gradient, dark outline.
  const grad = ctx.createLinearGradient(cx - w / 2, cursor - tpx, cx + w / 2, cursor);
  grad.addColorStop(0, '#ffe259'); grad.addColorStop(0.45, '#ff7e3d'); grad.addColorStop(0.75, '#ff2e88'); grad.addColorStop(1, '#b537f2');
  ctx.font = `${tpx}px ${TITLE_FONTS[titleFont] || TITLE_FONTS.anton}`;
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#2a0a3d';
  ctx.fillText(title, cx + tpx * 0.07, cursor + tpx * 0.07);
  ctx.strokeStyle = '#1c0530'; ctx.lineWidth = Math.max(2, tpx * 0.09);
  ctx.strokeText(title, cx, cursor);
  ctx.fillStyle = grad;
  ctx.fillText(title, cx, cursor);
  cursor += spx * 0.55;
  // Script subtitle: white neon script with pink glow.
  if (caption.script) {
    ctx.font = `${spx}px Pacifico, cursive`;
    ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = spx * 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption.script, cx, cursor + spx * 0.9);
    ctx.shadowBlur = 0;
  }
}

function drawPalm(ctx, x, y, s, color) {
  // A palm silhouette: curved trunk, five fronds drooping from the crown.
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2, -12, 7, -20); ctx.stroke();
  const crown = [7, -20];
  for (let a = 0; a < 5; a++) {
    const ang = (-175 + a * 38) * Math.PI / 180;
    const tipX = crown[0] + Math.cos(ang) * 20, tipY = crown[1] + Math.sin(ang) * 9 + 7;
    ctx.beginPath(); ctx.moveTo(crown[0], crown[1]);
    ctx.quadraticCurveTo(crown[0] + Math.cos(ang) * 12, crown[1] + Math.sin(ang) * 4 - 3, tipX, tipY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPalmStrip(ctx, W, y, h) {
  const g = ctx.createLinearGradient(0, y, W, y);
  g.addColorStop(0, '#ff7e3d'); g.addColorStop(0.5, '#ff2e88'); g.addColorStop(1, '#7b2ff7');
  ctx.fillStyle = g; ctx.fillRect(0, y, W, h);
  // Half sun.
  ctx.fillStyle = '#ffe259';
  ctx.beginPath(); ctx.arc(W * 0.5, y + h, h * 1.4, Math.PI, 0); ctx.fill();
  ctx.fillStyle = 'rgba(20, 4, 40, 0.9)';
  const n = Math.max(3, Math.floor(W / (h * 6)));
  for (let i = 0; i < n; i++) drawPalm(ctx, (i + 0.5) * (W / n), y + h * 0.92, h / 26, 'rgba(20,4,40,0.9)');
}

function drawFooter(ctx, W, H, title) {
  const fh = Math.max(18, H * 0.045), y = H - fh;
  ctx.fillStyle = '#0a0614'; ctx.fillRect(0, y, W, fh);
  ctx.fillStyle = '#f5f0ff';
  const px = Math.max(9, Math.round(W * 0.0095));
  ctx.font = `700 ${px}px "Arial Narrow", Arial, sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  // Monogram box.
  const box = fh * 0.62;
  ctx.fillStyle = '#ff2e88'; ctx.fillRect(W * 0.012, y + (fh - box) / 2, box, box);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.font = `900 ${Math.round(box * 0.55)}px Arial, sans-serif`;
  ctx.fillText('VP', W * 0.012 + box / 2, y + fh / 2 + 1);
  ctx.fillStyle = '#f5f0ff'; ctx.textAlign = 'left';
  ctx.font = `700 ${px}px "Arial Narrow", Arial, sans-serif`;
  const line = `${(title || 'VICE PRESS').toUpperCase()} - A VICE PRESS COVER STUDIO PICTURE - STARRING YOU - SHOT ON YOUR OWN CAMERA - GRADED BY HAND - CAT. VP-SS-0626`;
  const maxW = W * 0.78 - (W * 0.012 + box + W * 0.01);
  let shown = line;
  while (shown.length > 4 && ctx.measureText(shown).width > maxW) shown = shown.slice(0, -4);
  ctx.fillText(shown, W * 0.012 + box + W * 0.01, y + fh / 2 + 1);
  // Drawn barcode, right.
  const bw = W * 0.09, bx = W - bw - W * 0.012, bh = fh * 0.6;
  let bx2 = bx, seed = 7;
  ctx.fillStyle = '#ffffff';
  while (bx2 < bx + bw) {
    seed = (seed * 31 + 17) % 97;
    const wbar = 1 + (seed % 4) * (W / 900);
    if (seed % 3 !== 0) ctx.fillRect(bx2, y + (fh - bh) / 2, wbar, bh);
    bx2 += wbar + (W / 900);
  }
}

function drawBadge(ctx, W, H, badge, pos) {
  if (!badge || badge === 'none') return;
  const s = Math.min(W, H) * 0.11;
  const cx = pos === 'left' ? W * 0.07 : W * 0.93, cy = H * 0.075;
  ctx.save(); ctx.translate(cx, cy);
  if (badge === 'seal') {
    ctx.fillStyle = '#ff2e88'; ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffe9f4'; ctx.lineWidth = Math.max(2, s * 0.04);
    ctx.beginPath(); ctx.arc(0, 0, s * 0.40, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ffe259'; ctx.font = `${Math.round(s * 0.22)}px Arial, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★★★', 0, -s * 0.18);
    ctx.fillStyle = '#ffffff'; ctx.font = `700 ${Math.round(s * 0.11)}px Arial, sans-serif`;
    ctx.fillText('ORIGINAL', 0, s * 0.08); ctx.fillText('COVER ART', 0, s * 0.24);
  } else {
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    for (let i = 0; i < 28; i++) {
      const r = i % 2 === 0 ? s / 2 : s * 0.34, a = (i / 28) * Math.PI * 2;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1c0530'; ctx.font = `900 ${Math.round(s * 0.13)}px Arial, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('NEW', 0, -s * 0.12); ctx.fillText('SUMMER', 0, s * 0.06); ctx.fillText('2026', 0, s * 0.24);
  }
  ctx.restore();
}

// The main render. state.photos are Image elements; state.slots map panels to photos.
export function renderCover(canvas, state, W, H) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const spec = layoutSpec(state.layout);
  const footerH = Math.max(18, H * 0.045);
  const tagH = Math.max(16, H * 0.038);
  const palmH = Math.max(12, H * 0.028);
  const artH = H - footerH - tagH - palmH;
  ctx.fillStyle = '#12081f'; ctx.fillRect(0, 0, W, H);
  if (spec.bg === 'polaroid') {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#7b2ff7'); g.addColorStop(0.55, '#c026d3'); g.addColorStop(1, '#ff2e88');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, artH);
    halftone(ctx, 0, 0, W, artH, 0.35);
  }
  const grade = gradeById(state.grade);
  const photos = state.photos || [];
  spec.panels.forEach((p, i) => {
    const px = p.x * W, py = p.y * artH, pw = p.w * W, ph = p.h * artH;
    const slot = (state.slots || [])[i] || {};
    const photo = photos[(slot.photo ?? i) % Math.max(1, photos.length)] || photos[0];
    ctx.save();
    if (p.rot) { ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate((p.rot * Math.PI) / 180); ctx.translate(-pw / 2, -ph / 2); }
    else ctx.translate(px, py);
    if (spec.frame) { ctx.fillStyle = '#ffffff'; ctx.fillRect(-pw * 0.04, -ph * 0.05, pw * 1.08, ph * 1.14); }
    ctx.beginPath(); ctx.rect(0, 0, pw, ph); ctx.clip();
    if (photo) {
      if (spec.strips) {
        // One photo, sliced into vertical strips with black gaps.
        const graded = gradedPhoto(photo, state.grade, state.tune);
        const n = spec.strips, gap = Math.max(3, W * 0.006), sw = (pw - gap * (n - 1)) / n;
        for (let sIdx = 0; sIdx < n; sIdx++) {
          ctx.save(); ctx.beginPath(); ctx.rect(sIdx * (sw + gap), 0, sw, ph); ctx.clip();
          const off = (sIdx - (n - 1) / 2) * pw * 0.06;
          drawPhotoInto(ctx, graded, null, { zoom: 1.15, dx: off / pw, dy: 0 }, 0, 0, pw, ph);
          ctx.restore();
        }
      } else {
        const graded = gradedPhoto(photo, state.grade, state.tune);
        drawPhotoInto(ctx, graded, null, slot, 0, 0, pw, ph);
        if (state.outlines && grade.poster) {
          const edges = sobelEdges(graded, 90 - (state.ink?.strength || 0.5) * 40);
          ctx.globalAlpha = 0.85; ctx.drawImage(edges, 0, 0, pw, ph); ctx.globalAlpha = 1;
        }
        if (state.halftone > 0.02) halftone(ctx, 0, 0, pw, ph, state.halftone);
      }
    } else {
      ctx.fillStyle = '#2a1544'; ctx.fillRect(0, 0, pw, ph);
      ctx.fillStyle = '#8b7bb0'; ctx.font = `${Math.round(pw * 0.05)}px Arial, sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('ADD A PHOTO', pw / 2, ph / 2);
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = Math.max(2, W * 0.002);
    if (p.rot) { ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate((p.rot * Math.PI) / 180); ctx.translate(-pw / 2, -ph / 2); ctx.strokeRect(0, 0, pw, ph); }
    else ctx.strokeRect(px, py, pw, ph);
    ctx.restore();
  });
  // Title block (scaled into the art area).
  const tz = { x: spec.title.x * W, y: spec.title.y * artH, w: spec.title.w * W, h: spec.title.h * artH, align: spec.title.align };
  if (spec.title.band) { ctx.fillStyle = 'rgba(8,2,18,0.72)'; ctx.fillRect(tz.x - W * 0.02, tz.y - artH * 0.02, tz.w + W * 0.04, tz.h + artH * 0.04); }
  if (spec.title.masthead) { ctx.fillStyle = 'rgba(8,2,18,0.45)'; ctx.fillRect(0, 0, W, tz.h + artH * 0.06); }
  drawTitleText(ctx, state.caption, tz, W, state.titleFont);
  // Palm divider, tagline, footer.
  drawPalmStrip(ctx, W, artH, palmH);
  ctx.fillStyle = '#000000'; ctx.fillRect(0, artH + palmH, W, tagH);
  ctx.fillStyle = '#ffd34d'; ctx.font = `700 ${Math.max(11, Math.round(tagH * 0.52))}px "Arial Narrow", Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText((state.caption.tagline || '').toUpperCase(), W / 2, artH + palmH + tagH / 2);
  drawFooter(ctx, W, H, state.caption.title);
  drawBadge(ctx, W, H, state.badge, (state.layout === 'polaroid' || state.layout === 'five-strip') ? 'left' : 'right');
  // Grain + vignette over the whole cover.
  grain(ctx, W, H, state.tune.grain ?? 0.28);
  vignette(ctx, W, H, state.tune.vignette ?? 0.5);
  return canvas;
}

export function defaultCaption() {
  return { quote: "★★★★★ 'A FEVER DREAM IN NEON'", title: 'SUNSET HEIST', script: 'Ocean Drive', tagline: 'ONE COAST · NO RULES · COMING SOON' };
}
