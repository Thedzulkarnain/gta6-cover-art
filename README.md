# VICE PRESS — GTA 6-style cover art studio

![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/thedzulkarnain/gta6-cover-art/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/thedzulkarnain/gta6-cover-art/reward.svg)

VICE PRESS turns your photos and a caption into GTA 6-style multi-panel cover art, entirely offline in the browser. Add photos (or load the four samples), pick one of 8 layouts, grade it with the photographic Natural grade or one of 9 posterized gradient-map grades (Sunset, Neon, Golden, Miami, Vice Purple, Teal Noir, Bubblegum, Mono Ink, Comic Ink), tune Poster Ink, halftone, comic outlines and the fine-tune sliders (contrast, saturation, grain, vignette), write your title, script subtitle, review quote and tagline, pick a Seal or Starburst badge, then export a PNG in 5 post sizes — or all 5 at once with EXPORT ALL SIZES: 1920×1080 wide, 1080×1350 portrait, 1080×1080 square, 1080×1920 story, and 1200×628 social.

How it works: every panel is posterized to flat comic-book color bands (or kept photographic with the Natural grade's warm sunset grade), gradient-mapped to the chosen grade, outlined with Sobel edge detection, and finished with halftone dots, grain and a vignette. The cover gets the full movie-poster treatment: a 5-star review quote above the title, a 3D extruded gradient title, a palm-tree divider strip, and a film footer with a monogram, credit line and barcode. Click a panel to select it, drag to move the photo inside it, scroll (or use the Panel Zoom slider) to zoom, and Reset Crop to start over. Undo and redo cover every edit. Photos never leave your machine — there is no upload, no server, and no watermark.

Run it locally with `node serve.ts`, then open http://localhost:8080. The lettering uses Anton and Pacifico, vendored under the SIL Open Font License (see `app/fonts/`). No Rockstar Games logo, artwork, or font is used anywhere.
