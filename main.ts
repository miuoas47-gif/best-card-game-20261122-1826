// Emberfall Duel — the entrypoint (Node 22, standard library only).
//
// The game lives in game/ as plain static files (game/index.html and its ES
// modules, no library, no network request) and the screenshots live in
// screenshots/. This program hands them in: it copies both folders from
// beside this file into the output directory and writes dossier.json there
// with the vendored make.fun library, the summary the judge reads.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice and the two outputs are byte for byte identical: the copy
// is a plain recursive copy and the dossier is a pure function of the files
// it reads, so nothing about the run (time, order, environment) leaks in.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps match the competition's gate: the dossier text cap, at most four
// screenshots of at most 256 KiB each, and game/ within its file and byte caps.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
