// VICE PRESS wiring: photos, panels, controls, undo/redo, exports, shot scenes.
// The art itself lives in cover.js; this file only owns state and the page.
import { renderCover, GRADES, LAYOUTS, SIZES, panelAt } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = ['woman-car.jpg', 'man-rooftop.jpg', 'friends-neon.jpg', 'ocean-drive.jpg'];

const canvas = document.getElementById('preview');
const statusEl = document.getElementById('status');
const thumbsEl = document.getElementById('thumbs');

export const state = {
  photos: [],
  crops: [],
  layout: 'grid',
  grade: 'natural',
  ink: false,
  inkStrength: 0.7,
  outlines: false,
  halftone: 0.4,
  fine: { contrast: 0.06, saturation: 0.06, grain: 0.28, vignette: 0.5 },
  caption: {
    quote: "★★★★★ 'A FEVER DREAM IN NEON'",
    title: 'SUNSET HEIST',
    script: 'Ocean Drive',
    tagline: 'ONE COAST · NO RULES · COMING SOON',
  },
  titleFont: 'anton',
  badge: 'seal',
  size: 'wide',
  selectedPanel: 0,
};

let history = [];
let future = [];
let shotMode = false;

function snapshot() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, ink: state.ink, inkStrength: state.inkStrength,
    outlines: state.outlines, halftone: state.halftone, fine: state.fine,
    caption: state.caption, titleFont: state.titleFont, badge: state.badge, size: state.size,
    crops: state.crops, selectedPanel: state.selectedPanel,
  });
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > 60) history.shift();
  future = [];
}

function applySnapshot(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  state.fine = s.fine;
  state.caption = s.caption;
  state.crops = s.crops;
  syncControls();
  redraw();
}

function undo() {
  if (!history.length) return;
  future.push(snapshot());
  applySnapshot(history.pop());
}
function redo() {
  if (!future.length) return;
  history.push(snapshot());
  applySnapshot(future.pop());
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function ensureCrops() {
  while (state.crops.length < 12) state.crops.push({ x: 0, y: 0, zoom: 1 });
}

export function redraw() {
  ensureCrops();
  renderCover(canvas, state);
}

function renderThumbs() {
  thumbsEl.innerHTML = '';
  state.photos.forEach((img, i) => {
    const el = document.createElement('img');
    el.src = img.src;
    el.alt = `Photo ${i + 1}`;
    if (i === 0) el.classList.add('first');
    el.addEventListener('click', () => {
      pushHistory();
      const [first] = state.photos.splice(i, 1);
      state.photos.unshift(first);
      renderThumbs();
      redraw();
    });
    thumbsEl.appendChild(el);
  });
}

async function addFiles(files) {
  const list = [...files].filter((f) => f.type.startsWith('image/'));
  for (const file of list) {
    const img = await loadImage(URL.createObjectURL(file));
    state.photos.push(img);
  }
  if (list.length) { renderThumbs(); redraw(); status('Added ' + list.length + ' photo(s).'); }
}

async function loadSamples() {
  state.photos = [];
  for (const name of SAMPLES) {
    try { state.photos.push(await loadImage('samples/' + name)); } catch { /* skip a missing sample */ }
  }
  renderThumbs();
  redraw();
  return state.photos.length;
}

function autoFill() {
  pushHistory();
  // Rotate the photo order so every panel shows a different shot where possible.
  if (state.photos.length > 1) state.photos.push(state.photos.shift());
  renderThumbs();
  redraw();
}

function status(msg) { statusEl.textContent = msg; }

function download(canvasEl, name) {
  return new Promise((resolve) => {
    canvasEl.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      resolve();
    }, 'image/png');
  });
}

function renderAt(w, h) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  renderCover(off, state);
  return off;
}

async function exportPng() {
  const size = SIZES.find((s) => s.id === state.size) || SIZES[0];
  await download(renderAt(size.w, size.h), `vice-press-${size.id}-${size.w}x${size.h}.png`);
  status(`Saved vice-press-${size.id}-${size.w}x${size.h}.png`);
}

async function exportAll() {
  for (const size of SIZES) {
    await download(renderAt(size.w, size.h), `vice-press-${size.id}-${size.w}x${size.h}.png`);
    await new Promise((r) => setTimeout(r, 250));
  }
  status('Saved all 5 sizes.');
}

// ---- Controls ----
function buildPickers() {
  const layoutGrid = document.getElementById('layoutGrid');
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.name;
    b.dataset.layout = l.id;
    b.addEventListener('click', () => { pushHistory(); state.layout = l.id; syncControls(); redraw(); });
    layoutGrid.appendChild(b);
  });
  const gradeGrid = document.getElementById('gradeGrid');
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.name;
    b.dataset.grade = g.id;
    b.addEventListener('click', () => {
      pushHistory();
      state.grade = g.id;
      if (g.id === 'comicink') { state.outlines = true; state.ink = true; }
      syncControls();
      redraw();
    });
    gradeGrid.appendChild(b);
  });
  const sizeRow = document.getElementById('sizeRow');
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = s.name;
    b.dataset.size = s.id;
    b.addEventListener('click', () => { state.size = s.id; syncControls(); });
    sizeRow.appendChild(b);
  });
}

function bind(id, fn) { document.getElementById(id).addEventListener('input', (e) => fn(e.target)); }
function bindChange(id, fn) { document.getElementById(id).addEventListener('change', (e) => fn(e.target)); }

function syncControls() {
  document.querySelectorAll('#layoutGrid button').forEach((b) => b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('#gradeGrid button').forEach((b) => b.classList.toggle('active', b.dataset.grade === state.grade));
  document.querySelectorAll('#sizeRow button').forEach((b) => b.classList.toggle('active', b.dataset.size === state.size));
  document.getElementById('inkToggle').checked = state.ink;
  document.getElementById('inkStrength').value = state.inkStrength;
  document.getElementById('outlinesToggle').checked = state.outlines;
  document.getElementById('halftone').value = state.halftone;
  document.getElementById('fineContrast').value = state.fine.contrast;
  document.getElementById('fineSaturation').value = state.fine.saturation;
  document.getElementById('fineGrain').value = state.fine.grain;
  document.getElementById('fineVignette').value = state.fine.vignette;
  document.getElementById('capQuote').value = state.caption.quote;
  document.getElementById('capTitle').value = state.caption.title;
  document.getElementById('capScript').value = state.caption.script;
  document.getElementById('capTagline').value = state.caption.tagline;
  document.getElementById('titleFont').value = state.titleFont;
  document.getElementById('badge').value = state.badge;
  document.getElementById('panelZoom').value = (state.crops[state.selectedPanel] || { zoom: 1 }).zoom;
}

function wireControls() {
  buildPickers();
  document.getElementById('addPhotos').addEventListener('click', () => document.getElementById('fileInput').click());
  document.getElementById('fileInput').addEventListener('change', (e) => addFiles(e.target.files));
  document.getElementById('loadSamples').addEventListener('click', loadSamples);
  document.getElementById('autoFill').addEventListener('click', autoFill);
  const dz = document.getElementById('dropzone');
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('over'); addFiles(e.dataTransfer.files); });
  document.getElementById('exportPng').addEventListener('click', exportPng);
  document.getElementById('exportAll').addEventListener('click', exportAll);
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('redoBtn').addEventListener('click', redo);
  document.getElementById('resetCrop').addEventListener('click', () => {
    pushHistory();
    state.crops[state.selectedPanel] = { x: 0, y: 0, zoom: 1 };
    syncControls();
    redraw();
  });
  bind('panelZoom', (t) => {
    ensureCrops();
    state.crops[state.selectedPanel].zoom = Number(t.value);
    redraw();
  });
  bindChange('inkToggle', (t) => { pushHistory(); state.ink = t.checked; redraw(); });
  bind('inkStrength', (t) => { state.inkStrength = Number(t.value); redraw(); });
  bindChange('outlinesToggle', (t) => { pushHistory(); state.outlines = t.checked; redraw(); });
  bind('halftone', (t) => { state.halftone = Number(t.value); redraw(); });
  bind('fineContrast', (t) => { state.fine.contrast = Number(t.value); redraw(); });
  bind('fineSaturation', (t) => { state.fine.saturation = Number(t.value); redraw(); });
  bind('fineGrain', (t) => { state.fine.grain = Number(t.value); redraw(); });
  bind('fineVignette', (t) => { state.fine.vignette = Number(t.value); redraw(); });
  bind('capQuote', (t) => { state.caption.quote = t.value; redraw(); });
  bind('capTitle', (t) => { state.caption.title = t.value; redraw(); });
  bind('capScript', (t) => { state.caption.script = t.value; redraw(); });
  bind('capTagline', (t) => { state.caption.tagline = t.value; redraw(); });
  bindChange('titleFont', (t) => { pushHistory(); state.titleFont = t.value; redraw(); });
  bindChange('badge', (t) => { pushHistory(); state.badge = t.value; redraw(); });

  // Drag to move the photo inside a panel, scroll to zoom it.
  let dragging = false;
  let lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const hit = panelAt(state, fx, fy);
    if (hit >= 0) {
      state.selectedPanel = hit;
      document.getElementById('panelZoom').value = (state.crops[hit] || { zoom: 1 }).zoom;
    }
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    ensureCrops();
    const rect = canvas.getBoundingClientRect();
    const crop = state.crops[state.selectedPanel];
    crop.x = Math.max(-1, Math.min(1, crop.x + ((e.clientX - lastX) / rect.width) * 2));
    crop.y = Math.max(-1, Math.min(1, crop.y + ((e.clientY - lastY) / rect.height) * 2));
    lastX = e.clientX; lastY = e.clientY;
    redraw();
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    ensureCrops();
    const crop = state.crops[state.selectedPanel];
    crop.zoom = Math.max(1, Math.min(3, crop.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
    document.getElementById('panelZoom').value = crop.zoom;
    redraw();
  }, { passive: false });
}

// Shot scenes hand the app a fixed configuration and a canvas sized to the window.
export const shotApi = {
  loadSamples,
  setConfig(cfg) {
    pushHistory();
    if (cfg.layout) state.layout = cfg.layout;
    if (cfg.grade) state.grade = cfg.grade;
    if (cfg.title) state.caption.title = cfg.title;
    if (cfg.script) state.caption.script = cfg.script;
    if (cfg.tagline) state.caption.tagline = cfg.tagline;
    if (cfg.quote) state.caption.quote = cfg.quote;
    if (cfg.badge) state.badge = cfg.badge;
    if (cfg.grade === 'comicink') { state.outlines = true; state.ink = true; }
    syncControls();
    redraw();
  },
  sizeCanvasToWindow() {
    canvas.width = Math.max(320, Math.round(window.innerWidth));
    canvas.height = Math.max(320, Math.round(window.innerHeight));
  },
};

wireControls();
syncControls();

// Load the vendored fonts, then paint. Fonts change the title, so repaint after they arrive.
if (document.fonts) {
  document.fonts.load('400 80px Anton').catch(() => {});
  document.fonts.load('400 40px Pacifico').catch(() => {});
  document.fonts.ready.then(() => redraw()).catch(() => {});
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  shotMode = true;
  runShot(shot, params, shotApi).catch((err) => { status('Shot failed: ' + err.message); });
} else {
  loadSamples();
}
