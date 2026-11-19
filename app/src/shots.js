// Fixed scenes for screenshots: ?shot=editor shows the studio with a sample
// photo loaded; ?shot=cover shows the cover alone, full-bleed in the window.
// Query knobs: layout, grade, title, script, quote, tagline, badge, photo.
// window.__shotReady is set once the scene has painted.
import { state, render, loadSamples } from './main.js';

const SAMPLE_FILES = {
  'woman-car': 'woman-car.jpg',
  'man-rooftop': 'man-rooftop.jpg',
  'friends-neon': 'friends-neon.jpg',
  'ocean-drive': 'ocean-drive.jpg',
};

export async function runShot(shot, query, load) {
  const pick = (key, fallback) => query.get(key) || fallback;
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('badge')) state.badge = query.get('badge');
  if (query.get('title')) state.caption.title = query.get('title');
  if (query.get('script')) state.caption.script = query.get('script');
  if (query.get('quote')) state.caption.quote = query.get('quote');
  if (query.get('tagline')) state.caption.tagline = query.get('tagline');
  if (query.get('font')) state.titleFont = query.get('font');
  if (query.get('size')) state.size = query.get('size');
  // A single named photo goes first so panel one shows it; the rest follow.
  const first = SAMPLE_FILES[pick('photo', 'ocean-drive')] || 'ocean-drive.jpg';
  state.photos = [];
  try { await load(`samples/${first}`, first); } catch { /* fall through to samples */ }
  if (state.photos.length === 0) await loadSamples();
  else {
    for (const name of ['woman-car.jpg', 'man-rooftop.jpg', 'friends-neon.jpg', 'ocean-drive.jpg']) {
      if (name === first) continue;
      try { await load(`samples/${name}`, name); } catch { /* skip */ }
    }
  }
  state.slots = [];
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // Size the preview canvas to the window so a headless screenshot is the cover.
    const c = document.getElementById('preview');
    const w = window.innerWidth, h = window.innerHeight;
    const { renderCover } = await import('./cover.js');
    renderCover(c, state, w, h);
  } else {
    document.body.classList.add('shot-editor');
    render();
    // Scroll the right panel so FINE TUNE, the badge dropdown and
    // EXPORT ALL SIZES are all in view beside the preview.
    const rp = document.querySelector('.panel.right');
    const ft = document.getElementById('fineTuneH');
    if (rp && ft) rp.scrollTop = Math.max(0, ft.offsetTop - 8);
  }
  await document.fonts.ready.catch(() => {});
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
