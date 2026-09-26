// scripts/build-tokens.mjs
//
// CLI entrypoint: load sources -> reduce to the token model -> write artifacts.
// ALL token logic lives in scripts/tokens-core.mjs (pure) and the filesystem
// boundary in scripts/tokens-sources.mjs — never import this file, import the
// core instead.
//
// Source of truth: src/styles/tokens/**.json  (DTCG-ish), see tokens.index.json.
//
// Emits three artifacts into src/styles/generated/:
//   tokens.css        :root + @theme inline + [data-theme=...]
//   tokens.ts         typed TS const  (raw triples)
//   tokens.flat.json  flat snapshot for inspection / docs
//
// Triggered by:
//   - the `tokens` npm script (wired into dev / build / build:dev)
//   - Vite watch-tokens plugin during dev
//   - Manual:  node scripts/build-tokens.mjs
//   - Unit tests: src/scripts/build-tokens.test.ts + token-contrast.test.ts
//
// Zero deps. Node 18+. Pure stdlib. ASCII-only to avoid parser surprises.

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildTokenModel, emitCSS, emitTS, emitFlat } from './tokens-core.mjs';
import { GENERATED_DIR, loadTokenSources } from './tokens-sources.mjs';

const onUnresolved = (key, raw) =>
  console.warn('[build-tokens] unresolved alias: ' + key + ' in "' + raw + '"');

const main = async () => {
  await mkdir(GENERATED_DIR, { recursive: true });

  const sources = await loadTokenSources();
  const model = buildTokenModel({ sources, onUnresolved });

  await writeFile(resolve(GENERATED_DIR, 'tokens.css'),       emitCSS(model),  'utf8');
  await writeFile(resolve(GENERATED_DIR, 'tokens.ts'),        emitTS(model),   'utf8');
  await writeFile(resolve(GENERATED_DIR, 'tokens.flat.json'), emitFlat(model), 'utf8');

  const themeKeys = Object.entries(model.themes)
    .map(([name, t]) => name + '=' + Object.keys(t).length)
    .join(' ');
  console.log('[build-tokens] OK ' + Object.keys(model.flat).length + ' tokens; themes: ' + themeKeys);
};

main().catch((e) => {
  console.error('[build-tokens] FAILED:', e);
  process.exit(1);
});
