// VICE PRESS art engine — draws a GTA-style multi-panel cover onto any canvas.
// Everything is plain Canvas 2D: no network, no library, no WebGL. A cover is built
// from a set of photos, a layout (where the panels sit), a grade (how the photos
// are coloured), and a caption (quote, title, script subtitle, tagline).

export const GRADES = [
  { id: 'natural', name: 'Natural', levels: 0, ramp: null, warm: 0.22 },
  { id: 'sunset', name: 'Sunset', levels: 5, ramp: [[38, 16, 54], [122, 42, 96], [226, 84, 96], [255, 158, 92], [255, 226, 160]] },
  { id: 'neon', name: 'Neon', levels: 5, ramp: [[16, 8, 44], [96, 20, 110], [214, 44, 150], [64, 210, 224], [190, 250, 250]] },
  { id: 'golden', name: 'Golden', levels: 5, ramp: [[34, 20, 8], [104, 62, 22], [188, 122, 40], [244, 178, 84], [255, 232, 170]] },
  { id: 'miami', name: 'Miami', levels: 5, ramp: [[8, 44, 52], [16, 110, 122], [236, 84, 140], [255, 150, 170], [210, 250, 240]] },
  { id: 'vicepurple', name: 'Vice Purple', levels: 5, ramp: [[24, 10, 52], [74, 34, 120], [146, 74, 190], [198, 130, 230], [240, 210, 255]] },
  { id: 'tealnoir', name: 'Teal Noir', levels: 4, ramp: [[6, 14, 18], [16, 52, 60], [30, 104, 110], [90, 170, 168], [190, 230, 224]] },
  { id: 'bubblegum', name: 'Bubblegum', levels: 5, ramp: [[60, 20, 60], [150, 60, 120], [236, 110, 170], [255, 170, 205], [255, 235, 244]] },
  { id: 'monoink', name: 'Mono Ink', levels: 4, ramp: [[10, 10, 12], [70, 70, 78], [150, 150, 158], [215, 215, 220], [250, 250, 250]] },
  { id: 'comicink', name: 'Comic Ink', levels: 4, ramp: [[20, 10, 30], [90, 30, 70], [220, 80, 110], [255, 180, 110], [255, 240, 200]] },
];

export const LAYOUTS = [
  { id: 'grid', name: 'Grid' },
  { id: 'polaroid', name: 'Polaroid' },
  { id: 'strip5', name: '5-Strip' },
  { id: 'comic', name: 'Comic Strip' },
  { id: 'magazine', name: 'Magazine' },
  { id: 'mosaic', name: 'Mosaic' },
  { id: 'diptych', name: 'Diptych' },
  { id: 'fullbleed', name: 'Full-Bleed' },
];

export const SIZES = [
  { id: 'wide', name: 'Wide 1920 × 1080', w: 1920, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: 'square', name: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: 'story', name: 'Story 1080 × 1920', w: 1080, h: 1920 },
  { id: 'social', name: 'Social 1200 × 628', w: 1200, h: 628 },
];

export const TITLE_FONTS = {
  anton: '"Anton", "Arial Narrow", Impact, sans-serif',
  condensed: '"Arial Narrow", "Helvetica Neue", Impact, sans-serif',
  impact: 'Impact, "Arial Narrow", sans-serif',
};

const GAP = 0.008; // gap between panels, as a fraction of cover width

function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

function rampColor(ramp, t) {
  const n = ramp.length - 1;
  const pos = Math.max(0, Math.min(1, t)) * n;
  const i = Math.min(n - 1, Math.floor(pos));
  const f = pos - i;
  const a = ramp[i], b = ramp[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

// Draw one photo into a fresh offscreen canvas at panel size, graded.
// `crop` is { x, y, zoom }: x/y shift the photo inside its frame, zoom scales it.
function gradePhoto(img, w, h, crop, grade, fine, outlines, inkStrength) {
  const pw = Math.max(2, Math.round(w));
  const ph = Math.max(2, Math.round(h));
  const off = document.createElement('canvas');
  off.width = pw;
  off.height = ph;
  const c = off.getContext('2d');
  c.fillStyle = '#241430';
  c.fillRect(0, 0, pw, ph);
  if (!img) return off;
  // A sliced layout (5-Strip) draws one photo across all its strips: each strip
  // shows its own fifth of the picture instead of the whole picture squeezed in.
  const sliceCount = crop?.sliceCount || 1;
  const sliceIndex = crop?.sliceIndex || 0;
  const effW = pw * sliceCount;
  const zoom = (crop?.zoom ?? 1);
  const base = Math.max(effW / img.naturalWidth, ph / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * base;
  const dh = img.naturalHeight * base;
  const dx = (effW - dw) / 2 - sliceIndex * pw + (crop?.x ?? 0) * pw * 0.4;
  const dy = (ph - dh) / 2 + (crop?.y ?? 0) * ph * 0.4;
  if (grade.id === 'natural') {
    const sat = 1 + 0.14 + (fine?.saturation ?? 0);
    const con = 1 + 0.08 + (fine?.contrast ?? 0);
    c.filter = `saturate(${sat.toFixed(2)}) contrast(${con.toFixed(2)}) sepia(${grade.warm})`;
    c.drawImage(img, dx, dy, dw, dh);
    c.filter = 'none';
    // warm sunset wash, stronger at the bottom
    const wash = c.createLinearGradient(0, ph * 0.4, 0, ph);
    wash.addColorStop(0, 'rgba(255,120,60,0)');
    wash.addColorStop(1, 'rgba(255,110,60,0.16)');
    c.fillStyle = wash;
    c.fillRect(0, 0, pw, ph);
    return off;
  }
  // Posterized grades: draw plain, then quantize + gradient-map the pixels.
  c.drawImage(img, dx, dy, dw, dh);
  const image = c.getImageData(0, 0, pw, ph);
  const d = image.data;
  const levels = grade.levels || 5;
  const lum = new Float32Array(pw * ph);
  for (let i = 0; i < pw * ph; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    lum[i] = l;
    const step = Math.min(1, Math.floor(l * levels) / (levels - 1));
    const col = rampColor(grade.ramp, step);
    d[i * 4] = col[0];
    d[i * 4 + 1] = col[1];
    d[i * 4 + 2] = col[2];
  }
  if (outlines) {
    // Sobel edge detection on the luminance: dark ink where the picture changes fast.
    const strength = inkStrength ?? 0.7;
    for (let y = 1; y < ph - 1; y++) {
      for (let x = 1; x < pw - 1; x++) {
        const at = (xx, yy) => lum[yy * pw + xx];
        const gx = -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)
          + at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
        const gy = -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)
          + at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
        const edge = Math.sqrt(gx * gx + gy * gy);
        if (edge > 0.55) {
          const i = (y * pw + x) * 4;
          const k = Math.min(1, (edge - 0.55) * 2.2) * strength;
          d[i] *= (1 - k);
          d[i + 1] *= (1 - k);
          d[i + 2] *= (1 - k);
        }
      }
    }
  }
  // Fine-tune contrast / saturation on the posterized pixels.
  const con = 1 + (fine?.contrast ?? 0);
  const sat = 1 + (fine?.saturation ?? 0);
  if (con !== 1 || sat !== 1) {
    for (let i = 0; i < pw * ph; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      const grey = 0.299 * r + 0.587 * g + 0.114 * b;
      d[i * 4] = clamp(((r - 128) * con + 128 - grey) * sat + grey);
      d[i * 4 + 1] = clamp(((g - 128) * con + 128 - grey) * sat + grey);
      d[i * 4 + 2] = clamp(((b - 128) * con + 128 - grey) * sat + grey);
    }
  }
  c.putImageData(image, 0, 0);
  return off;
}

function clamp(v) { return Math.max(0, Math.min(255, v)); }

let noiseCanvas = null;
function grainTile() {
  if (noiseCanvas) return noiseCanvas;
  noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 128;
  noiseCanvas.height = 128;
  const c = noiseCanvas.getContext('2d');
  const img = c.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.floor(Math.random() * 40);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  return noiseCanvas;
}

function halftone(ctx, x, y, w, h, density) {
  if (!density || density <= 0) return;
  const spacing = Math.max(6, 16 - density * 11);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = 'rgba(10, 6, 18, 0.16)';
  for (let yy = y + spacing / 2; yy < y + h; yy += spacing) {
    for (let xx = x + spacing / 2; xx < x + w; xx += spacing) {
      ctx.beginPath();
      ctx.arc(xx, yy, Math.max(0.7, spacing * 0.16), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function vignette(ctx, x, y, w, h, amount) {
  if (!amount || amount <= 0) return;
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.32, x + w / 2, y + h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${(0.42 * amount).toFixed(2)})`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

// Panel rectangles for each layout. Fractions of the content area (above the footer).
// Returns { panels: [{x,y,w,h,rot,photo}], title: {x,y,w,h}, bg: 'dark'|'gradient'|'photo' }
function layoutGeometry(layout, W, H) {
  const fh = 0.045; // footer height fraction
  const ch = 1 - fh; // content height fraction
  const g = GAP;
  switch (layout) {
    case 'polaroid':
      return { bg: 'gradient', footer: fh, panels: [
        { x: 0.07, y: 0.02, w: 0.40, h: 0.30, rot: -0.05, photo: 0 },
        { x: 0.53, y: 0.02, w: 0.40, h: 0.30, rot: 0.05, photo: 1 },
        { x: 0.04, y: 0.63, w: 0.29, h: 0.27, rot: -0.03, photo: 2 },
        { x: 0.36, y: 0.63, w: 0.29, h: 0.27, rot: 0.04, photo: 3 },
        { x: 0.68, y: 0.63, w: 0.29, h: 0.27, rot: -0.05, photo: 0 },
      ], title: { x: 0.05, y: 0.345, w: 0.90, h: 0.26 } };
    case 'strip5':
      return { bg: 'dark', footer: fh, panels: [0, 1, 2, 3, 4].map((i) => ({
        x: i * 0.2 + g / 2, y: 0, w: 0.2 - g, h: ch, rot: 0, photo: 0,
      })), title: { x: 0.04, y: 0.36, w: 0.92, h: 0.28 } };
    case 'comic':
      return { bg: 'dark', footer: fh, panels: [0, 1, 2, 3].map((i) => ({
        x: i * 0.25 + g / 2, y: 0.01, w: 0.25 - g, h: 0.52, rot: 0, photo: i,
      })), title: { x: 0.04, y: 0.56, w: 0.92, h: 0.37 } };
    case 'magazine':
      return { bg: 'dark', footer: fh, panels: [
        { x: 0, y: 0, w: 1, h: ch, rot: 0, photo: 0 },
      ], title: { x: 0.04, y: 0.02, w: 0.92, h: 0.30 } };
    case 'mosaic':
      return { bg: 'dark', footer: fh, panels: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
        x: (i % 3) * (1 / 3) + g / 2, y: Math.floor(i / 3) * (ch / 3) + g / 2,
        w: 1 / 3 - g, h: ch / 3 - g, rot: 0, photo: i % 4,
      })), title: { x: 0.06, y: 0.36, w: 0.88, h: 0.26 } };
    case 'diptych':
      return { bg: 'dark', footer: fh, panels: [
        { x: 0, y: 0, w: 0.5 - g / 2, h: ch, rot: 0, photo: 0 },
        { x: 0.5 + g / 2, y: 0, w: 0.5 - g / 2, h: ch, rot: 0, photo: 1 },
      ], title: { x: 0.04, y: 0.60, w: 0.92, h: 0.33 } };
    case 'fullbleed':
      return { bg: 'dark', footer: fh, panels: [
        { x: 0, y: 0, w: 1, h: ch, rot: 0, photo: 0 },
      ], title: { x: 0.04, y: 0.58, w: 0.92, h: 0.35 } };
    case 'grid':
    default:
      return { bg: 'dark', footer: fh, panels: [
        { x: 0, y: 0, w: 0.40, h: 0.60, rot: 0, photo: 0 },
        { x: 0.41, y: 0, w: 0.19, h: 0.195, rot: 0, photo: 1 },
        { x: 0.41, y: 0.205, w: 0.19, h: 0.195, rot: 0, photo: 2 },
        { x: 0.41, y: 0.41, w: 0.19, h: 0.19, rot: 0, photo: 3 },
        { x: 0.61, y: 0, w: 0.39, h: 0.38, rot: 0, photo: 1 },
        { x: 0, y: 0.61, w: 0.245, h: 0.34, rot: 0, photo: 2 },
        { x: 0.255, y: 0.61, w: 0.245, h: 0.34, rot: 0, photo: 3 },
        { x: 0.51, y: 0.61, w: 0.235, h: 0.34, rot: 0, photo: 0 },
        { x: 0.755, y: 0.61, w: 0.245, h: 0.34, rot: 0, photo: 1 },
      ], title: { x: 0.61, y: 0.39, w: 0.39, h: 0.21 } };
  }
}

function fitFont(ctx, text, maxWidth, startSize, family, weight = '') {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`.trim();
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`.trim();
  }
  return size;
}

function drawTitleText(ctx, text, cx, y, maxWidth, maxSize, family) {
  const size = fitFont(ctx, text, maxWidth, maxSize, family);
  // 3D extrusion: dark purple copy offset down-right, then the gradient title.
  const grad = ctx.createLinearGradient(0, y - size, 0, y + size * 0.25);
  grad.addColorStop(0, '#ffe9a8');
  grad.addColorStop(0.45, '#ffb347');
  grad.addColorStop(0.75, '#ff5e7a');
  grad.addColorStop(1, '#c94bff');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#2a0a3e';
  ctx.fillText(text, cx + size * 0.07, y + size * 0.07);
  ctx.fillStyle = grad;
  ctx.strokeStyle = 'rgba(20,4,32,0.9)';
  ctx.lineWidth = Math.max(1.5, size * 0.045);
  ctx.strokeText(text, cx, y);
  ctx.fillText(text, cx, y);
  return size;
}

function drawPalmStrip(ctx, x, y, w, h) {
  // A thin strip of palm silhouettes and a half-sun, drawn with paths.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#12061f';
  ctx.fillRect(x, y, w, h);
  const sunX = x + w * 0.5;
  const sunR = h * 1.15;
  const sun = ctx.createLinearGradient(0, y, 0, y + h);
  sun.addColorStop(0, '#ffd166');
  sun.addColorStop(1, '#ff5e7a');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, y + h, sunR, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(18,6,31,0.85)';
  for (let i = 0; i < 3; i++) {
    const cx = x + w * (0.16 + i * 0.34);
    const s = h * (0.85 + (i % 2) * 0.2);
    ctx.beginPath();
    ctx.moveTo(cx, y + h);
    ctx.lineTo(cx + s * 0.06, y + h - s);
    ctx.lineTo(cx + s * 0.12, y + h);
    ctx.closePath();
    ctx.fill();
    for (let f = -2; f <= 2; f++) {
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.06, y + h - s);
      ctx.quadraticCurveTo(cx + s * 0.06 + f * s * 0.22, y + h - s * 0.72, cx + s * 0.06 + f * s * 0.34, y + h - s * 0.52);
      ctx.quadraticCurveTo(cx + s * 0.06 + f * s * 0.2, y + h - s * 0.62, cx + s * 0.06, y + h - s);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBadge(ctx, badge, x, y, size) {
  if (!badge || badge === 'none') return;
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  if (badge === 'seal') {
    ctx.fillStyle = '#ff4d8d';
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = Math.max(2, size * 0.04);
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = `bold ${size * 0.13}px sans-serif`;
    ctx.fillText('★ ★ ★', 0, -size * 0.08);
    ctx.font = `bold ${size * 0.10}px sans-serif`;
    ctx.fillText('ORIGINAL', 0, size * 0.10);
    ctx.fillText('COVER ART', 0, size * 0.22);
  } else {
    // Starburst: spiky yellow star with dark text.
    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = '#1a0b2e';
    ctx.lineWidth = Math.max(2, size * 0.03);
    ctx.beginPath();
    const spikes = 12;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? size * 0.5 : size * 0.36;
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1a0b2e';
    ctx.textAlign = 'center';
    ctx.font = `bold ${size * 0.11}px sans-serif`;
    ctx.fillText('NEW', 0, -size * 0.02);
    ctx.fillText('SUMMER', 0, size * 0.11);
    ctx.fillText('2026', 0, size * 0.24);
  }
  ctx.restore();
}

function drawFooter(ctx, W, H, title) {
  const fh = H * 0.045;
  const y = H - fh;
  ctx.fillStyle = '#0b0614';
  ctx.fillRect(0, y, W, fh);
  ctx.fillStyle = '#ffd166';
  const box = fh * 0.72;
  ctx.fillRect(W * 0.012, y + (fh - box) / 2, box, box);
  ctx.fillStyle = '#0b0614';
  ctx.font = `bold ${box * 0.42}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VP', W * 0.012 + box / 2, y + fh / 2 + box * 0.03);
  ctx.textBaseline = 'alphabetic';
  const line = `${(title || 'VICE PRESS').toUpperCase()} — A VICE PRESS COVER STUDIO PICTURE — STARRING YOU — SHOT ON YOUR OWN CAMERA — GRADED BY HAND — LETTERING AND SEAL ORIGINAL — CAT. VP-SS-0626`;
  ctx.fillStyle = '#e8e0f0';
  const size = fitFont(ctx, line, W * 0.78, fh * 0.42, 'sans-serif');
  ctx.textAlign = 'center';
  ctx.fillText(line, W * 0.5, y + fh / 2 + size * 0.36);
  // Drawn barcode at the far right.
  let bx = W * 0.925;
  ctx.fillStyle = '#fff';
  ctx.fillRect(bx - W * 0.004, y + fh * 0.16, W * 0.062, fh * 0.68);
  ctx.fillStyle = '#0b0614';
  let seed = 7;
  while (bx < W * 0.985) {
    seed = (seed * 31 + 17) % 97;
    const bw = W * 0.0016 * (1 + (seed % 4));
    if (seed % 3 !== 0) ctx.fillRect(bx, y + fh * 0.2, bw, fh * 0.6);
    bx += bw + W * 0.0016;
  }
}

function drawTitleBlock(ctx, zone, W, caption, titleFont, badge) {
  const { x, y, w, h } = zone;
  const family = TITLE_FONTS[titleFont] || TITLE_FONTS.anton;
  const quote = (caption.quote || '').trim();
  const title = (caption.title || 'VICE PRESS').toUpperCase();
  const script = (caption.script || '').trim();
  const tagline = (caption.tagline || '').trim();
  const pad = w * 0.03;
  let cy = y + h * 0.10;
  // Review quote: five gold stars + small capitals.
  if (quote) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd166';
    const qSize = Math.max(9, h * 0.085);
    ctx.font = `bold ${qSize}px sans-serif`;
    ctx.fillText(quote, x + w / 2, cy + qSize * 0.4);
    cy += h * 0.14;
  }
  // Title with 3D extrusion.
  const titleSize = drawTitleText(ctx, title, x + w / 2, cy + h * 0.30, w - pad * 2, h * 0.34, family);
  cy += h * 0.34;
  // Script subtitle in neon pink script.
  if (script) {
    ctx.textAlign = 'center';
    const sSize = fitFont(ctx, script, w * 0.9, h * 0.17, '"Pacifico", cursive');
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#ff4d8d';
    ctx.shadowBlur = sSize * 0.45;
    ctx.fillText(script, x + w / 2, cy + sSize * 0.55);
    ctx.shadowBlur = 0;
    cy += h * 0.20;
  }
  // Palm divider + tagline strip.
  const stripH = Math.max(10, h * 0.115);
  const tagY = y + h - stripH * 2.1;
  drawPalmStrip(ctx, x + pad, tagY, w - pad * 2, stripH);
  if (tagline) {
    ctx.fillStyle = '#0b0614';
    ctx.fillRect(x + pad, tagY + stripH, w - pad * 2, stripH);
    ctx.fillStyle = '#ffd166';
    const tSize = fitFont(ctx, tagline, w - pad * 4, stripH * 0.62, 'sans-serif');
    ctx.font = `bold ${tSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(tagline, x + w / 2, tagY + stripH * 1.72);
  }
  return titleSize;
}

/** Renders the whole cover onto `canvas` (which sets the output size). */
export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const grade = gradeById(state.grade);
  const geo = layoutGeometry(state.layout, W, H);
  const fine = state.fine || {};
  // Background.
  if (geo.bg === 'gradient') {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#5b2a86');
    bg.addColorStop(0.55, '#c94b8d');
    bg.addColorStop(1, '#ff7a5c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    halftone(ctx, 0, 0, W, H * (1 - geo.footer), 0.5);
  } else {
    ctx.fillStyle = '#160a24';
    ctx.fillRect(0, 0, W, H);
  }
  const photos = state.photos || [];
  const crops = state.crops || [];
  // Panels.
  geo.panels.forEach((p, i) => {
    const px = p.x * W, py = p.y * H, pw = p.w * W, ph = p.h * H;
    const img = photos.length ? photos[p.photo % photos.length] : null;
    const crop = state.layout === 'strip5'
      ? { ...(crops[i] || {}), sliceCount: geo.panels.length, sliceIndex: i }
      : crops[i];
    const graded = gradePhoto(img, pw, ph, crop, grade, fine, state.outlines, state.inkStrength);
    ctx.save();
    if (p.rot) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate(p.rot);
      ctx.translate(-pw / 2, -ph / 2);
    } else {
      ctx.translate(px, py);
    }
    if (state.layout === 'polaroid') {
      // White snapshot border around each tilted photo.
      ctx.fillStyle = '#fdf8ef';
      ctx.fillRect(-pw * 0.03, -ph * 0.03, pw * 1.06, ph * 1.14);
      ctx.drawImage(graded, 0, 0, pw, ph);
    } else {
      ctx.drawImage(graded, 0, 0, pw, ph);
    }
    // Halftone dots over posterized grades (and Comic Ink especially).
    if (grade.id !== 'natural') halftone(ctx, 0, 0, pw, ph, state.halftone ?? 0.4);
    if (grade.id === 'comicink') halftone(ctx, 0, 0, pw, ph, Math.max(state.halftone ?? 0.4, 0.55));
    vignette(ctx, 0, 0, pw, ph, fine.vignette ?? 0.5);
    // Thin frame so panels read as separate shots.
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.strokeRect(0, 0, pw, ph);
    ctx.restore();
    // Selected-panel marker is drawn by the editor, not the export.
  });
  // Title block (on top of panels for strip / magazine / full-bleed styles).
  const tz = { x: geo.title.x * W, y: geo.title.y * H, w: geo.title.w * W, h: geo.title.h * H };
  if (state.layout === 'strip5' || state.layout === 'magazine' || state.layout === 'fullbleed' || state.layout === 'diptych' || state.layout === 'mosaic') {
    ctx.fillStyle = 'rgba(10,4,20,0.42)';
    ctx.fillRect(tz.x - W * 0.01, tz.y - H * 0.01, tz.w + W * 0.02, tz.h + H * 0.02);
  }
  drawTitleBlock(ctx, tz, W, state.caption || {}, state.titleFont || 'anton');
  // Badge, top-left of the cover.
  drawBadge(ctx, state.badge, W * 0.025, H * 0.025, W * 0.115);
  // Grain over everything, then the film footer.
  const grainAmt = fine.grain ?? 0.28;
  if (grainAmt > 0) {
    ctx.save();
    ctx.globalAlpha = grainAmt * 0.5;
    const tile = grainTile();
    ctx.fillStyle = ctx.createPattern(tile, 'repeat');
    ctx.fillRect(0, 0, W, H * (1 - geo.footer));
    ctx.restore();
  }
  drawFooter(ctx, W, H, (state.caption || {}).title);
}

export function panelAt(state, fx, fy) {
  // Which panel (if any) sits under fractional cover coordinates fx/fy?
  const geo = layoutGeometry(state.layout, 1000, 1000);
  for (let i = geo.panels.length - 1; i >= 0; i--) {
    const p = geo.panels[i];
    if (fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h) return i;
  }
  return -1;
}
