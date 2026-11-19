// VICE PRESS — studio UI. Loads photos, wires every control to the live
// preview, and exports PNGs at five sizes. All work happens on this machine.
import { GRADES, LAYOUTS, SIZES, TITLE_FONTS, layoutSpec, renderCover, defaultCaption } from './cover.js';
import { runShot } from './shots.js';

const SAMPLES = ['woman-car.jpg', 'man-rooftop.jpg', 'friends-neon.jpg', 'ocean-drive.jpg'];
const $ = (id) => document.getElementById(id);
const canvas = $('preview');

export const state = {
  layout: 'grid',
  grade: 'natural',
  ink: { on: false, strength: 0.5 },
  outlines: false,
  halftone: 0,
  tune: { contrast: 0.06, saturation: 0.06, grain: 0.28, vignette: 0.50 },
  caption: defaultCaption(),
  titleFont: 'anton',
  badge: 'seal',
  size: 'wide',
  photos: [],
  slots: [],
  selected: 0,
};

let undoStack = [], redoStack = [];
function snapshot() {
  return JSON.stringify({ layout: state.layout, grade: state.grade, ink: state.ink, outlines: state.outlines, halftone: state.halftone, tune: state.tune, caption: state.caption, titleFont: state.titleFont, badge: state.badge, size: state.size, slots: state.slots });
}
function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 60) undoStack.shift(); redoStack = []; }
function applySnapshot(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls(); render();
}
function undo() { if (!undoStack.length) return; redoStack.push(snapshot()); applySnapshot(undoStack.pop()); }
function redo() { if (!redoStack.length) return; undoStack.push(snapshot()); applySnapshot(redoStack.pop()); }

export function render() {
  const size = SIZES.find((s) => s.id === state.size) || SIZES[0];
  // Preview keeps the chosen aspect ratio, capped for the screen.
  const scale = Math.min(1, 880 / Math.max(size.w, size.h));
  renderCover(canvas, state, Math.round(size.w * scale), Math.round(size.h * scale));
  const n = layoutSpec(state.layout).panels.length;
  while (state.slots.length < n) state.slots.push({ photo: state.slots.length, zoom: 1, dx: 0, dy: 0 });
  $('panelZoom').value = String((state.slots[state.selected]?.zoom || 1));
}

function loadImage(src, key) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { img._vpKey = key || src; resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

export async function loadPhoto(src, key) {
  const img = await loadImage(src, key);
  state.photos.push(img);
  renderThumbs(); render();
  return img;
}

export async function loadSamples() {
  pushUndo();
  state.photos = [];
  for (const name of SAMPLES) {
    try { await loadPhoto(`samples/${name}`, name); } catch { /* a missing sample skips */ }
  }
  state.slots = [];
  render();
}

function renderThumbs() {
  const box = $('thumbs'); box.innerHTML = '';
  state.photos.forEach((img, i) => {
    const t = document.createElement('img');
    t.src = img.src; t.alt = `Photo ${i + 1}`; t.className = 'thumb';
    t.onclick = () => { pushUndo(); state.slots[state.selected] = { ...(state.slots[state.selected] || {}), photo: i }; render(); };
    box.appendChild(t);
  });
  $('photoCount').textContent = state.photos.length ? `${state.photos.length} photo${state.photos.length > 1 ? 's' : ''} loaded` : 'No photos yet';
}

function autoFill() {
  pushUndo();
  const n = layoutSpec(state.layout).panels.length;
  state.slots = Array.from({ length: n }, (_, i) => ({ photo: i % Math.max(1, state.photos.length), zoom: 1, dx: 0, dy: 0 }));
  render();
}

function buildPickers() {
  const lay = $('layouts'); lay.innerHTML = '';
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.className = 'pick layout-pick'; b.textContent = l.name; b.dataset.id = l.id;
    b.onclick = () => { pushUndo(); state.layout = l.id; state.selected = 0; syncControls(); render(); };
    lay.appendChild(b);
  });
  const gr = $('grades'); gr.innerHTML = '';
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.className = 'pick grade-pick'; b.textContent = g.name; b.dataset.id = g.id;
    b.style.background = g.ramp ? `linear-gradient(135deg, ${g.ramp.join(', ')})` : 'linear-gradient(135deg, #ff9e4f, #ff2e88, #7b2ff7)';
    b.onclick = () => {
      pushUndo(); state.grade = g.id;
      state.outlines = g.id === 'comic-ink'; state.ink.on = g.id === 'comic-ink';
      $('outlines').checked = state.outlines; $('posterInk').checked = state.ink.on;
      syncControls(); render();
    };
    gr.appendChild(b);
  });
  const sz = $('sizes'); sz.innerHTML = '';
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.className = 'pick size-pick'; b.textContent = s.name; b.dataset.id = s.id;
    b.onclick = () => { state.size = s.id; syncControls(); render(); };
    sz.appendChild(b);
  });
  const tf = $('titleFonts'); tf.innerHTML = '';
  Object.keys(TITLE_FONTS).forEach((id) => {
    const b = document.createElement('button');
    b.className = 'pick font-pick'; b.textContent = id === 'anton' ? 'Anton' : id === 'condensed' ? 'Condensed' : 'Impact'; b.dataset.id = id;
    b.onclick = () => { pushUndo(); state.titleFont = id; syncControls(); render(); };
    tf.appendChild(b);
  });
}

function syncControls() {
  document.querySelectorAll('#layouts .pick').forEach((b) => b.classList.toggle('active', b.dataset.id === state.layout));
  document.querySelectorAll('#grades .pick').forEach((b) => b.classList.toggle('active', b.dataset.id === state.grade));
  document.querySelectorAll('#sizes .pick').forEach((b) => b.classList.toggle('active', b.dataset.id === state.size));
  document.querySelectorAll('#titleFonts .pick').forEach((b) => b.classList.toggle('active', b.dataset.id === state.titleFont));
  $('quote').value = state.caption.quote; $('title').value = state.caption.title;
  $('scriptSub').value = state.caption.script; $('tagline').value = state.caption.tagline;
  $('posterInk').checked = !!state.ink.on; $('inkStrength').value = String(state.ink.strength);
  $('outlines').checked = !!state.outlines; $('halftone').value = String(state.halftone);
  $('contrast').value = String(state.tune.contrast); $('saturation').value = String(state.tune.saturation);
  $('grain').value = String(state.tune.grain); $('vignette').value = String(state.tune.vignette);
  $('badge').value = state.badge;
}

function bindControls() {
  $('addPhotos').onclick = () => $('fileInput').click();
  $('fileInput').onchange = async (e) => {
    pushUndo();
    for (const f of e.target.files) {
      const url = URL.createObjectURL(f);
      try { await loadPhoto(url, f.name); } catch { /* skip unreadable files */ }
    }
    e.target.value = '';
  };
  $('loadSamples').onclick = loadSamples;
  $('autoFill').onclick = autoFill;
  $('undoBtn').onclick = undo; $('redoBtn').onclick = redo;
  $('resetCrop').onclick = () => { pushUndo(); state.slots[state.selected] = { photo: state.slots[state.selected]?.photo ?? 0, zoom: 1, dx: 0, dy: 0 }; render(); };
  $('panelZoom').oninput = (e) => { state.slots[state.selected] = { ...(state.slots[state.selected] || {}), zoom: Number(e.target.value) }; render(); };
  const captionField = (id, key) => { $(id).oninput = (e) => { state.caption[key] = e.target.value; render(); }; };
  captionField('quote', 'quote'); captionField('title', 'title'); captionField('scriptSub', 'script'); captionField('tagline', 'tagline');
  $('badge').onchange = (e) => { pushUndo(); state.badge = e.target.value; render(); };
  $('posterInk').onchange = (e) => { pushUndo(); state.ink.on = e.target.checked; state.outlines = e.target.checked && state.grade === 'comic-ink'; render(); };
  $('inkStrength').oninput = (e) => { state.ink.strength = Number(e.target.value); render(); };
  $('outlines').onchange = (e) => { pushUndo(); state.outlines = e.target.checked; render(); };
  $('halftone').oninput = (e) => { state.halftone = Number(e.target.value); render(); };
  const tuneField = (id, key) => { $(id).oninput = (e) => { state.tune[key] = Number(e.target.value); render(); }; };
  tuneField('contrast', 'contrast'); tuneField('saturation', 'saturation'); tuneField('grain', 'grain'); tuneField('vignette', 'vignette');
  $('exportPng').onclick = () => exportOne(state.size);
  $('exportAll').onclick = exportAll;
  // Drag to move, scroll to zoom, click to select a panel.
  let dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    const r = canvas.getBoundingClientRect();
    const spec = layoutSpec(state.layout);
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    // Panels live in the art area (the top ~89% of the cover, above the
    // palm strip, tagline and footer), so rescale fy into that area first.
    const fyArt = fy / 0.89;
    const idx = spec.panels.findIndex((p) => fx >= p.x && fx <= p.x + p.w && fyArt >= p.y && fyArt <= p.y + p.h);
    if (idx >= 0) { state.selected = idx; syncControls(); render(); }
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const slot = state.slots[state.selected] || (state.slots[state.selected] = { photo: 0, zoom: 1, dx: 0, dy: 0 });
    slot.dx = Math.max(-1, Math.min(1, (slot.dx || 0) + (e.clientX - lastX) / 120));
    slot.dy = Math.max(-1, Math.min(1, (slot.dy || 0) + (e.clientY - lastY) / 120));
    lastX = e.clientX; lastY = e.clientY; render();
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const slot = state.slots[state.selected] || (state.slots[state.selected] = { photo: 0, zoom: 1, dx: 0, dy: 0 });
    slot.zoom = Math.max(0.6, Math.min(3, (slot.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.92)));
    render();
  }, { passive: false });
  // Drop zone.
  const dz = $('dropZone');
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', async (e) => {
    e.preventDefault(); dz.classList.remove('over'); pushUndo();
    for (const f of e.dataTransfer.files) {
      if (!f.type.startsWith('image/')) continue;
      try { await loadPhoto(URL.createObjectURL(f), f.name); } catch { /* skip */ }
    }
  });
}

export function exportCanvas(sizeId) {
  const size = SIZES.find((s) => s.id === sizeId) || SIZES[0];
  const c = document.createElement('canvas');
  renderCover(c, state, size.w, size.h);
  return c;
}

function download(canvasEl, name) {
  const a = document.createElement('a');
  a.href = canvasEl.toDataURL('image/png');
  a.download = name;
  a.click();
}

export function exportOne(sizeId) {
  const size = SIZES.find((s) => s.id === sizeId) || SIZES[0];
  download(exportCanvas(size.id), `vice-press-${state.layout}-${size.id}.png`);
}

export function exportAll() {
  SIZES.forEach((s, i) => setTimeout(() => download(exportCanvas(s.id), `vice-press-${state.layout}-${s.id}.png`), i * 250));
}

buildPickers();
bindControls();
syncControls();
render();

const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params.get('shot'), params, loadPhoto).catch((err) => { console.error(err); window.__shotReady = true; });
}
