// scripts/tokens-sources.mjs
//
// Filesystem boundary for the token pipeline: knows WHERE the token sources
// live and in what order they load (tokens.index.json), and nothing else.
// The CLI writes the artifacts, the unit tests read the same sources through
// this module — so the load order is owned in exactly one place.

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const TOKENS_DIR = resolve(HERE, '..', 'src', 'styles', 'tokens');
export const GENERATED_DIR = resolve(HERE, '..', 'src', 'styles', 'generated');

export const readJSON = (file) => readFile(file, 'utf8').then(JSON.parse);

export const readIndex = () => readJSON(resolve(TOKENS_DIR, 'tokens.index.json'));

/**
 * Load every token source listed in tokens.index.json, in load order
 * (primitives before semantic, themes last), as [{ path, data }].
 */
export const loadTokenSources = async () => {
  const index = await readIndex();
  const sources = [];
  for (const path of index.sources ?? []) {
    sources.push({ path, data: await readJSON(resolve(TOKENS_DIR, path)) });
  }
  return sources;
};
