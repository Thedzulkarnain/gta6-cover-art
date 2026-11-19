// VICE PRESS — the hand-in program for the gta6-cover-art-01 bounty.
// Node 22, standard library only. It copies this folder's app/ and
// screenshots/ into the output directory (MAKEFUN_OUTPUT_DIR, or /output)
// and writes /output/dossier.json with the vendored make.fun library, so
// the judge can read the entry's sources and screenshots in one file.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   node serve.ts   # then open http://localhost:8080 to try the studio

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's caps: text_max_bytes shapes the dossier text; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots or
// one over 256 KiB; more than 993 app entries, 48 MiB of app files, or
// an app path over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
