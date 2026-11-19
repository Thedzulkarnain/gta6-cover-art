// Fixed scenes for screenshots: ?shot=editor shows the app with photos loaded;
// ?shot=cover shows the exported cover alone, full frame.
// Query params: layout, grade, title, script, tagline, size, titleFont,
// ink (0/1), outlines (0/1), halftone (0-100), photos (comma-separated sample
// files, e.g. woman-car.jpg,man-rooftop.jpg). window.__shotReady is set once
// the cover has been painted, so a headless screenshot can wait on it.
const SAMPLE_FILES = ['woman-car.jpg', 'man-rooftop.jpg', 'friends-neon.jpg', 'ocean-drive.jpg'];

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

export async function runShot(shot, query, api) {
  const { state, loadImage, render, canvas, syncControls } = api;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('title') !== null) state.title = query.get('title');
  if (query.get('script') !== null) state.script = query.get('script');
  if (query.get('tagline') !== null) state.tagline = query.get('tagline');
  if (query.get('quote') !== null) state.quote = query.get('quote');
  if (query.get('badge')) state.badge = query.get('badge');
  if (query.get('contrast') !== null) state.contrast = Number(query.get('contrast')) / 100;
  if (query.get('saturation') !== null) state.saturation = Number(query.get('saturation')) / 100;
  if (query.get('grain') !== null) state.grain = Number(query.get('grain')) / 100;
  if (query.get('vignette') !== null) state.vignette = Number(query.get('vignette')) / 100;
  if (query.get('size')) state.size = query.get('size');
  if (query.get('titleFont')) state.titleFont = query.get('titleFont');
  if (query.get('ink') !== null) state.ink = query.get('ink') !== '0';
  if (query.get('inkStrength') !== null) state.inkStrength = Number(query.get('inkStrength')) / 100;
  if (query.get('outlines') !== null) state.outlines = query.get('outlines') !== '0';
  if (query.get('halftone') !== null) state.halftone = Number(query.get('halftone')) / 100;

  const wanted = (query.get('photos') || SAMPLE_FILES.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
  const names = {
    'woman-car.jpg': 'Woman · red convertible', 'man-rooftop.jpg': 'Man · rooftop dusk',
    'friends-neon.jpg': 'Friends · neon street', 'ocean-drive.jpg': 'Ocean Drive · sunset',
  };
  state.photos = [];
  state.photoNames = [];
  for (const f of wanted) {
    try { state.photos.push(await loadImage('samples/' + f)); state.photoNames.push(names[f] || f); }
    catch { /* skip */ }
  }
  api.autoFill(false);
  if (api.renderThumbs) api.renderThumbs();
  syncControls();
  try {
    await Promise.all([
      document.fonts.load('90px Anton'), document.fonts.load('40px Pacifico'),
      document.fonts.load('700 40px "Arial Narrow"'), document.fonts.ready,
    ]);
  } catch { /* fall back to system fonts */ }
  render();
  // The render runs on the next animation frame and posterizes every panel;
  // wait for two frames plus a beat so the paint is complete.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await wait(900);
  render();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await wait(400);
  if (shot === 'editor') {
    // The right panel scrolls in place: bring EXPORT ALL (and the badge
    // dropdown + fine sliders above it) into the 720px frame.
    const right = document.querySelector('.panel.right');
    const btn = document.getElementById('exportAllBtn');
    if (right && btn) {
      const r = right.getBoundingClientRect(), b = btn.getBoundingClientRect();
      if (b.bottom > r.bottom || b.top < r.top) right.scrollTop += (b.bottom - r.bottom) + 10;
    }
  }
  window.__shotReady = true;
}
