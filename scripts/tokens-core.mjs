// scripts/tokens-core.mjs
//
// Pure token engine — NO filesystem, NO paths, NO logging side effects.
// The CLI (`scripts/build-tokens.mjs`) owns reading the JSON sources and
// writing the artifacts; everything about *what the tokens mean* lives here.
//
// Source of truth: src/styles/tokens/**.json  (DTCG-ish).
//   - primitives/colors.json       palette scales + status colors
//   - semantic/colors.json         semantic tokens (raw HSL triples)
//   - semantic/layout.json         radius scale, vertical rhythm, nav-height
//   - semantic/typography.json     font families + display scale + tracking
//   - themes/<name>.json           per-theme deltas  (overrides)
//
// Emitted artifacts (written by the CLI):
//   src/styles/generated/tokens.css        :root + @theme inline + [data-theme=...]
//   src/styles/generated/tokens.ts         typed TS const  (raw triples)
//   src/styles/generated/tokens.flat.json  flat snapshot for inspection / docs
//
// Zero deps. Node 18+. Pure stdlib. ASCII-only to avoid parser surprises.

export const DEFAULT_THEME = 'indigo';

// ----- flatten / alias resolution -----

// Strict flatten: leaves are objects with $value (DTCG-ish) OR strings/numbers.
// Skips $-prefixed metadata keys. Preserves nested keys as dot-paths so that
// palette.indigo.500, status.destructive, etc. are reachable as alias targets.
export const flatten = (src, out = {}, prefix = '') => {
  for (const [k, v] of Object.entries(src)) {
    if (k.startsWith('$')) continue;
    const key = prefix ? prefix + '.' + k : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && v.$value === undefined) {
      flatten(v, out, key);
    } else {
      out[key] = v;
    }
  }
  return out;
};

// Resolve {a.b.c} aliases against ctx. Idempotent (loop until no change).
// `onUnresolved` is an injectable sink so this stays side-effect free: the CLI
// wires it to console.warn, tests leave it silent.
export const resolveAliases = (raw, ctx, onUnresolved) => {
  if (typeof raw !== 'string') return raw;
  let prev = null, cur = raw;
  while (prev !== cur) {
    prev = cur;
    cur = cur.replace(/\{([a-z0-9._-]+)\}/gi, (m, key) => {
      const v = ctx[key];
      if (v === undefined) {
        if (onUnresolved) onUnresolved(key, raw);
        return m;
      }
      return typeof v === 'string' ? v : JSON.stringify(v);
    });
  }
  return cur;
};

// ----- model -----

const stringLeaves = (flat) => {
  const ctx = {};
  for (const [k, v] of Object.entries(flat)) {
    if (typeof v === 'string') ctx[k] = v;
    else if (v && typeof v === 'object' && typeof v.$value === 'string') ctx[k] = v.$value;
  }
  return ctx;
};

const themeNameFromPath = (p) => {
  const m = /^themes\/(.+)\.json$/.exec(p);
  return m ? m[1] : null;
};

/**
 * Reduce the ordered, already-parsed token sources into the model the emitters
 * consume.
 *
 * @param sources     [{ path, data }] in load order (primitives first, then
 *                    semantic, then themes) — mirrors tokens.index.json.
 * @param defaultTheme name of the theme whose block is omitted from the CSS and
 *                    whose values ARE the `:root` defaults.
 * @param onUnresolved optional sink for unresolved alias keys.
 * @returns { flat, themes } where `flat` is key -> resolved string (semantic
 *          only, dotted primitive keys excluded) and `themes` is
 *          name -> full flattened map (defaults + that theme's overrides).
 */
export const buildTokenModel = ({ sources, defaultTheme = DEFAULT_THEME, onUnresolved } = {}) => {
  const merged = {};
  for (const source of sources ?? []) flatten(source.data, merged);

  // Alias context: every string leaf, primitives included (palette.X is an
  // alias *target* only and never leaks into the emitted artifacts).
  const ctx = stringLeaves(merged);

  // Semantic flat: tokens whose top-level value is a { $value: ... } object.
  const flat = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v && typeof v === 'object' && '$value' in v) {
      flat[k] = resolveAliases(v.$value, ctx, onUnresolved);
    }
  }

  // Themes: clone the flat baseline, then apply each theme file's overrides.
  // Theme names come from the sources themselves — no hardcoded roster, so
  // adding a theme file (plus its tokens.index.json entry) is the whole recipe.
  const themes = { [defaultTheme]: { ...flat } };
  for (const source of sources ?? []) {
    const name = themeNameFromPath(source.path);
    if (!name) continue;
    if (!themes[name]) themes[name] = { ...flat };
    for (const [k, v] of Object.entries(source.data.overrides ?? {})) {
      const raw = typeof v === 'object' && v && '$value' in v ? v.$value : v;
      themes[name][k] = resolveAliases(raw, ctx, onUnresolved);
    }
  }

  return { flat, themes };
};

// ----- emit policy -----

// Keys that get a Tailwind v4 `--color-X: hsl(var(--X))` alias in @theme inline.
export const COLOR_ALIASES = [
  'background','foreground','card','card-foreground','popover','popover-foreground',
  'primary','primary-foreground','secondary','secondary-foreground',
  'muted','muted-foreground','accent','accent-foreground',
  'destructive','destructive-foreground','border','input','ring',
];
export const SIDEBAR_ALIASES = [
  'sidebar-background','sidebar-foreground','sidebar-primary','sidebar-primary-foreground',
  'sidebar-accent','sidebar-accent-foreground','sidebar-border','sidebar-ring',
];

// Tailwind v4 namespaces whose *values* we own. Anything matching a prefix is
// copied verbatim into @theme inline so Tailwind generates the matching
// utilities (rounded-*, text-*, tracking-*, font-*) from our tokens instead of
// from its own defaults. Adding a namespace is one string here — the emitters
// never name an individual token.
export const THEME_INLINE_PREFIXES = ['radius-', 'font-', 'text-', 'tracking-'];

// :root carries every non-dotted token EXCEPT the inline-only font families
// (which belong in @theme inline as raw values).
const ROOT_ONLY_SKIP_PREFIXES = ['font-'];

const toVarName = (key) => '--' + key;

const isEmittedToken = (k, v) =>
  !k.includes('.') && typeof v === 'string';

// ----- emitters -----

export const emitCSS = ({ flat, themes, defaultTheme = DEFAULT_THEME }) => {
  const lines = [
    '/* Generated by scripts/build-tokens.mjs -- DO NOT EDIT. */',
    '/* Source: src/styles/tokens/**.json  (DTCG-ish). */',
    '',
  ];

  // :root -- all flat semantic + layout + typography tokens.
  // Dotted keys (palette.indigo.500) are primitives -- alias targets only --
  // and must NOT leak into :root as --palette-indigo-500.
  const rootBlock = [':root {'];
  for (const k of Object.keys(flat).sort()) {
    if (!isEmittedToken(k, flat[k])) continue;
    if (ROOT_ONLY_SKIP_PREFIXES.some((p) => k.startsWith(p))) continue;
    rootBlock.push('  ' + toVarName(k) + ': ' + flat[k] + ';');
  }
  rootBlock.push('}');

  // @theme inline -- Tailwind v4: color aliases + every namespace we own.
  // Color aliases use the `hsl(var(--X))` wrap so Tailwind utilities
  // (bg-primary, text-foreground, ...) get a valid CSS color even though the
  // underlying vars store raw HSL triples (alpha-placeholder convention).
  const themeInline = ['@theme inline {'];
  for (const t of COLOR_ALIASES) {
    if (flat[t] !== undefined) themeInline.push('  --color-' + t + ': hsl(var(--' + t + '));');
  }
  for (const t of SIDEBAR_ALIASES) {
    if (flat[t] !== undefined) themeInline.push('  --color-' + t + ': hsl(var(--' + t + '));');
  }
  for (const k of Object.keys(flat).sort()) {
    if (!isEmittedToken(k, flat[k])) continue;
    if (!THEME_INLINE_PREFIXES.some((p) => k.startsWith(p))) continue;
    themeInline.push('  ' + toVarName(k) + ': ' + flat[k] + ';');
  }
  themeInline.push('}');

  // [data-theme="..."] -- non-default themes only. Diff against flat defaults
  // so we ONLY emit keys that actually changed (keeps blocks small + diffable).
  const themeBlocks = Object.entries(themes)
    .filter(([name]) => name !== defaultTheme)
    .map(([name, tFlat]) => {
      const inner = Object.entries(tFlat)
        .filter(([k, v]) => {
          if (k.startsWith('font-')) return false;
          if (k.includes('.')) return false;
          if (typeof v !== 'string') return false;
          return v !== flat[k]; // only emit if theme overrides flat
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => '  ' + toVarName(k) + ': ' + v + ';')
        .join('\n');
      return '[data-theme="' + name + '"] {\n' + inner + '\n}';
    })
    .filter((s) => s.includes('\n  ')); // drop empty blocks

  lines.push(rootBlock.join('\n'), '', themeInline.join('\n'));
  if (themeBlocks.length) lines.push('', themeBlocks.join('\n\n'), '');
  return lines.join('\n');
};

// TS emit: per-key raw triple + per-theme override map. Indices are camelCase
// so consumers don't need to escape kebab-case. The regex matches BOTH
// letter and digit after the dash so tokens like `mesh-1` become valid
// identifiers (`mesh1`) instead of leaking the literal `mesh-1` into TS.
export const toCamel = (kebab) => kebab.replace(/-([a-z0-9])/gi, (_, c) => c.toUpperCase());

export const emitTS = ({ flat, themes }) => {
  const lines = [
    '// Generated by scripts/build-tokens.mjs -- DO NOT EDIT.',
    '// Source: src/styles/tokens/**.json  (DTCG-ish).',
    '',
    '/** Raw HSL triples + dimension strings, NO hsl() wrapper.',
    ' *  Consumers compose with hsl(var(--token) / <alpha>) for alpha modifiers. */',
    'export const TOKENS_DEFAULT = {',
  ];
  for (const k of Object.keys(flat).sort()) {
    // Skip primitives (palette.indigo.500 etc.) -- those are alias sources
    // already baked into semantic values via the resolver. Including them
    // would emit invalid TS identifiers ('palette.indigo.500' has dots).
    if (!isEmittedToken(k, flat[k])) continue;
    lines.push('  ' + toCamel(k) + ': ' + JSON.stringify(flat[k]) + ',');
  }
  lines.push('} as const;', '', '');
  lines.push('/** Per-theme override maps. Indigo is empty (defaults from TOKENS_DEFAULT). */');
  lines.push('export const TOKENS_THEMES = {');
  for (const [name, tokens] of Object.entries(themes)) {
    lines.push('  ' + JSON.stringify(name) + ': {');
    for (const k of Object.keys(tokens).sort()) {
      if (!isEmittedToken(k, tokens[k])) continue;
      // Skip keys that did not actually change from the flat defaults -- keeps
      // theme maps lean and also avoids serialization of dynamic {} entries.
      if (tokens[k] === flat[k]) continue;
      lines.push('    ' + toCamel(k) + ': ' + JSON.stringify(tokens[k]) + ',');
    }
    lines.push('  },');
  }
  lines.push('} as const;', '');
  return lines.join('\n');
};

export const emitFlat = ({ flat, themes }) =>
  JSON.stringify({ default: flat, themes }, null, 2) + '\n';

// ----- contrast math (used by src/scripts/token-contrast.test.ts) -----

/** Parse a raw HSL triple like "230 15% 65%" into [h, s, l] numbers. */
export const parseHslTriple = (triple) => {
  const m = String(triple).trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) throw new Error('not a raw HSL triple: "' + triple + '"');
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};

/** HSL triple -> [r, g, b] in 0..1 (sRGB, no gamma applied yet). */
export const hslToRgb = (triple) => {
  const [h, s, l] = parseHslTriple(triple);
  const sat = s / 100;
  const light = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
};

/** WCAG relative luminance of an HSL triple. */
export const relativeLuminance = (triple) => {
  const chan = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const [r, g, b] = hslToRgb(triple).map(chan);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio between two HSL triples (1..21). */
export const hslContrast = (a, b) => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};
