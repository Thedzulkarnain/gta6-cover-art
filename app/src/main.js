// VICE PRESS editor: wires the controls to the cover engine (./cover.js).
// Photos never leave the machine: FileReader / object URLs only, no upload.
import { GRADES, LAYOUTS, SIZES, TITLE_FONTS, drawCover, layoutById, sizeById } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const statusEl = $('status');
const SAMPLES = [
  { file: 'woman-car.jpg', name: 'Woman · red convertible' },
  { file: 'man-rooftop.jpg', name: 'Man · rooftop dusk' },
  { file: 'friends-neon.jpg', name: 'Friends · neon street' },
  { file: 'ocean-drive.jpg', name: 'Ocean Drive · sunset' },
];

const state = {
  layout: 'grid', grade: 'natural', ink: true, inkStrength: 0.7,
  outlines: true, halftone: 0.55,
  contrast: 0.06, saturation: 0.06, grain: 0.28, vignette: 0.50,
  badge: 'seal',
  title: 'SUNSET HEIST', script: 'Ocean Drive', tagline: 'ONE COAST · NO RULES · COMING SOON',
  quote: "★★★★★ 'A FEVER DREAM IN NEON'",
  titleFont: 'anton', size: 'wide',
  photos: [], photoNames: [], assignments: [], crops: [],
};
let selectedPanel = 0;
let rects = [];
let history = [], future = [];
let renderQueued = false;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image'));
    img.src = url;
  });
}

function snapshot() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, ink: state.ink, inkStrength: state.inkStrength,
    outlines: state.outlines, halftone: state.halftone,
    contrast: state.contrast, saturation: state.saturation, grain: state.grain, vignette: state.vignette,
    badge: state.badge,
    title: state.title, script: state.script,
    tagline: state.tagline, quote: state.quote, titleFont: state.titleFont, size: state.size,
    assignments: state.assignments, crops: state.crops,
  });
}
function pushHistory() {
  history.push(snapshot());
  if (history.length > 40) history.shift();
  future = [];
  updateUndoButtons();
}
function applySnapshot(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls();
  render();
}
function updateUndoButtons() {
  $('undo').disabled = history.length === 0;
  $('redo').disabled = future.length === 0;
}
$('undo').addEventListener('click', () => {
  if (!history.length) return;
  future.push(snapshot());
  applySnapshot(history.pop());
  updateUndoButtons();
});
$('redo').addEventListener('click', () => {
  if (!future.length) return;
  history.push(snapshot());
  applySnapshot(future.pop());
  updateUndoButtons();
});

function previewSize() {
  const s = sizeById(state.size);
  const scale = Math.min(1, 920 / Math.max(s.w, s.h));
  return { w: Math.round(s.w * scale), h: Math.round(s.h * scale) };
}

function render() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    const ps = document.body.classList.contains('shot-cover')
      ? { w: window.innerWidth, h: window.innerHeight }
      : previewSize();
    if (canvas.width !== ps.w || canvas.height !== ps.h) { canvas.width = ps.w; canvas.height = ps.h; }
    try {
      rects = drawCover(canvas, state) || [];
    } catch (err) {
      statusEl.textContent = 'Render failed: ' + err.message;
      return;
    }
    const n = state.photos.length;
    statusEl.textContent = n
      ? `${n} photo${n > 1 ? 's' : ''} ready. Panel ${selectedPanel + 1} selected — drag to move, scroll to zoom, then Export PNG.`
      : 'Add photos or load the samples to start.';
    document.querySelectorAll('.layout-thumb').forEach((el) => el.classList.toggle('active', el.dataset.layout === state.layout));
    document.querySelectorAll('.grade-swatch').forEach((el) => el.classList.toggle('active', el.dataset.grade === state.grade));
    document.querySelectorAll('.size-btn').forEach((el) => el.classList.toggle('active', el.dataset.size === state.size));
    document.querySelectorAll('.font-btn').forEach((el) => el.classList.toggle('active', el.dataset.font === state.titleFont));
  });
}
window.__render = render;

// ---- photos ---------------------------------------------------------------
function addPhotos(images, names) {
  images.forEach((img, k) => { state.photos.push(img); state.photoNames.push(names[k] || 'Photo ' + (state.photos.length)); });
  autoFill(false);
  renderThumbs();
  render();
}
async function loadSamples() {
  statusEl.textContent = 'Loading samples…';
  const images = [], names = [];
  for (const s of SAMPLES) {
    try { images.push(await loadImage('samples/' + s.file)); names.push(s.name); }
    catch { /* skip a missing sample */ }
  }
  state.photos = [];
  state.photoNames = [];
  addPhotos(images, names);
  statusEl.textContent = images.length + ' sample photos loaded.';
}
function autoFill(record = true) {
  const layout = layoutById(state.layout);
  const n = Math.max(1, state.photos.length);
  state.assignments = layout.panels.map((p, i) => (p.slot ?? i) % n);
  state.crops = layout.panels.map(() => ({ zoom: 1, ox: 0, oy: 0 }));
  selectedPanel = 0;
  if (record) pushHistory();
  render();
}
function renderThumbs() {
  const box = $('thumbs');
  box.innerHTML = '';
  state.photos.forEach((img, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = state.photoNames[i] + ' — click to put it in the selected panel';
    const t = document.createElement('canvas');
    t.width = 96; t.height = 64;
    const c = t.getContext('2d');
    const s = Math.max(96 / img.naturalWidth, 64 / img.naturalHeight);
    c.drawImage(img, (96 - img.naturalWidth * s) / 2, (64 - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
    b.appendChild(t);
    b.addEventListener('click', () => {
      pushHistory();
      state.assignments[selectedPanel] = i;
      render();
    });
    box.appendChild(b);
  });
}

$('addPhotos').addEventListener('click', () => $('fileInput').click());
$('fileInput').addEventListener('change', async (e) => {
  const files = [...e.target.files].filter((f) => f.type.startsWith('image/'));
  const images = [], names = [];
  for (const f of files) {
    try { images.push(await loadImage(URL.createObjectURL(f))); names.push(f.name); } catch { /* skip */ }
  }
  if (images.length) addPhotos(images, names);
  e.target.value = '';
});
$('loadSamples').addEventListener('click', loadSamples);
$('autoFill').addEventListener('click', () => autoFill(true));
const drop = $('dropzone');
['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', async (e) => {
  const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
  const images = [], names = [];
  for (const f of files) {
    try { images.push(await loadImage(URL.createObjectURL(f))); names.push(f.name); } catch { /* skip */ }
  }
  if (images.length) addPhotos(images, names);
});

// ---- canvas interaction: click to select, drag to move, scroll to zoom ----
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = (clientX - r.left) * (canvas.width / r.width);
  const y = (clientY - r.top) * (canvas.height / r.height);
  for (let i = rects.length - 1; i >= 0; i--) {
    const p = rects[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return i;
  }
  return -1;
}
function cropOf(i) {
  if (!state.crops[i]) state.crops[i] = { zoom: 1, ox: 0, oy: 0 };
  return state.crops[i];
}
let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  selectedPanel = i;
  dragging = { i, x: e.clientX, y: e.clientY, ox: cropOf(i).ox, oy: cropOf(i).oy, moved: false };
  canvas.setPointerCapture(e.pointerId);
  render();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const r = canvas.getBoundingClientRect();
  const crop = cropOf(dragging.i);
  const dx = (e.clientX - dragging.x) * (canvas.width / r.width);
  const dy = (e.clientY - dragging.y) * (canvas.height / r.height);
  const p = rects[dragging.i];
  if (p) {
    crop.ox = Math.max(-1, Math.min(1, dragging.ox + (dx / Math.max(1, p.w)) * 2));
    crop.oy = Math.max(-1, Math.min(1, dragging.oy + (dy / Math.max(1, p.h)) * 2));
  }
  if (Math.abs(dx) + Math.abs(dy) > 4) dragging.moved = true;
  render();
});
canvas.addEventListener('pointerup', () => {
  if (dragging && dragging.moved) pushHistory();
  dragging = null;
  syncZoomSlider();
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const crop = cropOf(selectedPanel);
  pushHistory();
  crop.zoom = Math.max(1, Math.min(2.5, crop.zoom * (e.deltaY < 0 ? 1.12 : 0.89)));
  syncZoomSlider();
  render();
}, { passive: false });

function syncZoomSlider() {
  $('panelZoom').value = String(Math.round(cropOf(selectedPanel).zoom * 100));
  $('zoomLabel').textContent = cropOf(selectedPanel).zoom.toFixed(2) + '×';
}
$('zoomMinus').addEventListener('click', () => { pushHistory(); cropOf(selectedPanel).zoom = Math.max(1, cropOf(selectedPanel).zoom / 1.15); syncZoomSlider(); render(); });
$('zoomPlus').addEventListener('click', () => { pushHistory(); cropOf(selectedPanel).zoom = Math.min(2.5, cropOf(selectedPanel).zoom * 1.15); syncZoomSlider(); render(); });
$('panelZoom').addEventListener('input', () => {
  cropOf(selectedPanel).zoom = Number($('panelZoom').value) / 100;
  syncZoomSlider();
  render();
});
$('panelZoom').addEventListener('change', pushHistory);
$('resetCrop').addEventListener('click', () => {
  pushHistory();
  state.crops[selectedPanel] = { zoom: 1, ox: 0, oy: 0 };
  syncZoomSlider();
  render();
});

// ---- right panel controls --------------------------------------------------
const layoutBox = $('layouts');
LAYOUTS.forEach((l) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'layout-thumb';
  b.dataset.layout = l.id;
  b.title = l.name;
  b.innerHTML = `<span class="lt-mini lt-${l.id}" aria-hidden="true"></span><span>${l.name}</span>`;
  b.addEventListener('click', () => { pushHistory(); state.layout = l.id; autoFill(false); });
  layoutBox.appendChild(b);
});
const gradeBox = $('grades');
GRADES.forEach((g) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'grade-swatch';
  b.dataset.grade = g.id;
  b.title = g.name;
  b.style.background = `linear-gradient(135deg, rgb(${g.ramp[1].join(',')}), rgb(${g.ramp[3].join(',')}))`;
  b.textContent = g.name;
  b.addEventListener('click', () => { pushHistory(); state.grade = g.id; render(); });
  gradeBox.appendChild(b);
});
$('inkToggle').addEventListener('change', (e) => { pushHistory(); state.ink = e.target.checked; render(); });
$('inkStrength').addEventListener('input', (e) => { state.inkStrength = Number(e.target.value) / 100; render(); });
$('inkStrength').addEventListener('change', pushHistory);
$('outlineToggle').addEventListener('change', (e) => { pushHistory(); state.outlines = e.target.checked; render(); });
$('halftone').addEventListener('input', (e) => { state.halftone = Number(e.target.value) / 100; render(); });
$('halftone').addEventListener('change', pushHistory);
$('titleInput').addEventListener('input', (e) => { state.title = e.target.value; render(); });
$('scriptInput').addEventListener('input', (e) => { state.script = e.target.value; render(); });
$('taglineInput').addEventListener('input', (e) => { state.tagline = e.target.value; render(); });
$('quoteInput').addEventListener('input', (e) => { state.quote = e.target.value; render(); });
['titleInput', 'scriptInput', 'taglineInput', 'quoteInput'].forEach((id) => $(id).addEventListener('change', pushHistory));
$('badgeSelect').addEventListener('change', (e) => { pushHistory(); state.badge = e.target.value; render(); });
// Fine-tune sliders: each 0..1, live re-render on input, one history entry on release.
function bindFine(id, key, labelId) {
  $(id).addEventListener('input', (e) => {
    state[key] = Number(e.target.value) / 100;
    $(labelId).textContent = state[key].toFixed(2);
    render();
  });
  $(id).addEventListener('change', pushHistory);
}
bindFine('contrastSlider', 'contrast', 'contrastVal');
bindFine('saturationSlider', 'saturation', 'saturationVal');
bindFine('grainSlider', 'grain', 'grainVal');
bindFine('vignetteSlider', 'vignette', 'vignetteVal');
const fontBox = $('titleFonts');
TITLE_FONTS.forEach((f) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'font-btn';
  b.dataset.font = f.id;
  b.textContent = f.name;
  b.addEventListener('click', () => { pushHistory(); state.titleFont = f.id; render(); });
  fontBox.appendChild(b);
});
const sizeBox = $('sizes');
SIZES.forEach((s) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'size-btn';
  b.dataset.size = s.id;
  b.innerHTML = `<b>${s.name}</b><span>${s.label}</span>`;
  b.addEventListener('click', () => { pushHistory(); state.size = s.id; render(); });
  sizeBox.appendChild(b);
});

$('exportBtn').addEventListener('click', () => {
  const s = sizeById(state.size);
  const off = document.createElement('canvas');
  off.width = s.w; off.height = s.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) { statusEl.textContent = 'Export failed.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-press-${state.layout}-${s.w}x${s.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Exported ${s.w} × ${s.h} PNG — vice-press-${state.layout}-${s.w}x${s.h}.png`;
  }, 'image/png');
});

function downloadCanvas(off, filename) {
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(true);
    }, 'image/png');
  });
}
$('exportAllBtn').addEventListener('click', async () => {
  statusEl.textContent = 'Exporting all 5 sizes…';
  let done = 0;
  for (const s of SIZES) {
    const off = document.createElement('canvas');
    off.width = s.w; off.height = s.h;
    drawCover(off, state);
    if (await downloadCanvas(off, `vice-press-${state.layout}-${s.w}x${s.h}.png`)) done++;
    statusEl.textContent = `Exported ${done} of ${SIZES.length} sizes…`;
    await new Promise((r) => setTimeout(r, 350));
  }
  statusEl.textContent = `Exported all ${done} sizes — vice-press-${state.layout}-*.png`;
});

function syncControls() {
  $('inkToggle').checked = state.ink;
  $('inkStrength').value = String(Math.round(state.inkStrength * 100));
  $('outlineToggle').checked = state.outlines;
  $('halftone').value = String(Math.round(state.halftone * 100));
  $('contrastSlider').value = String(Math.round((state.contrast ?? 0.06) * 100));
  $('saturationSlider').value = String(Math.round((state.saturation ?? 0.06) * 100));
  $('grainSlider').value = String(Math.round((state.grain ?? 0.28) * 100));
  $('vignetteSlider').value = String(Math.round((state.vignette ?? 0.5) * 100));
  $('contrastVal').textContent = (state.contrast ?? 0.06).toFixed(2);
  $('saturationVal').textContent = (state.saturation ?? 0.06).toFixed(2);
  $('grainVal').textContent = (state.grain ?? 0.28).toFixed(2);
  $('vignetteVal').textContent = (state.vignette ?? 0.5).toFixed(2);
  $('badgeSelect').value = state.badge || 'seal';
  $('titleInput').value = state.title;
  $('scriptInput').value = state.script;
  $('taglineInput').value = state.tagline;
  $('quoteInput').value = state.quote || '';
  syncZoomSlider();
}

syncControls();
updateUndoButtons();

// Shot scenes for screenshots (?shot=cover / ?shot=editor), else the live app.
const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params.get('shot'), params, { state, loadImage, loadSamples, autoFill, render, renderThumbs, canvas, syncControls });
} else {
  render();
}
