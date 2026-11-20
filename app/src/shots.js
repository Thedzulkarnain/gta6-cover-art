// Fixed scenes for screenshots. `?shot=cover` shows the cover alone, filling the
// window; `?shot=editor` shows the full studio with a sample photo loaded.
// Query knobs: layout, grade, title, script, tagline, quote, badge.
// window.__shotReady is set once the scene has painted, so a headless browser
// knows when to take the screenshot.
export async function runShot(shot, query, api) {
  const cfg = {
    layout: query.get('layout') || 'grid',
    grade: query.get('grade') || 'natural',
    title: query.get('title') || 'SUNSET HEIST',
    script: query.get('script') || 'Ocean Drive',
    tagline: query.get('tagline') || 'ONE COAST · NO RULES · COMING SOON',
    quote: query.get('quote') || "★★★★★ 'A FEVER DREAM IN NEON'",
    badge: query.get('badge') || 'seal',
  };
  await api.loadSamples();
  api.setConfig(cfg);
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    api.sizeCanvasToWindow();
    api.setConfig(cfg);
  }
  if (shot === 'editor') document.body.classList.add('shot-editor');
  if (document.fonts) {
    try { await document.fonts.ready; } catch { /* fonts are optional */ }
  }
  api.setConfig(cfg);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
