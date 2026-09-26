# AGENTS.md

> Single source of truth for any agent picking this project up. Optimised
> for **modification tasks**: when in doubt, change here-under before
> editing code.

## 0. Project at a glance

A single-page portfolio site for a Mobile & Frontend developer, themed
as a desktop OS (windows with traffic-lights, dock, terminal, spotlight,
CRT toggle). Single routing entry (`/`); everything else is `<NotFound>`.

- **Entry**: `index.html` → `src/main.tsx` → `src/App.tsx`
- **Page**: `src/pages/Index.tsx`
- **Config**: `portfolio.config.json` (typed via `src/lib/config.ts`)
- **Tokens**: `src/styles/tokens/**.json` → generated CSS/TS via
  `scripts/build-tokens.mjs`

---

## 1. Stack

Real versions live in `package.json`. Highlights:

| Layer            | Tech                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| Build            | Vite 5 (`@vitejs/plugin-react-swc`) + TS 5.8                                 |
| UI               | React 18.3 + TypeScript (strict **off**), Tailwind **v4** (CSS-first)         |
| Components       | shadcn/ui (Radix primitives) — see §7 for the edit rule                      |
| Routing          | React Router v6 (`/` + `*` → `NotFound`)                                      |
| Data layer       | TanStack Query (provider mounted but used minimally)                          |
| Animation / 3D   | Framer Motion 12, GSAP 3 + `ScrollTrigger`, Lenis 1, **R3F 8** + drei + post |
| Icons            | **Phosphor** (`@phosphor-icons/react`, dock), Lucide (UI primitives)         |
| Smooth scroll    | Lenis hooked into GSAP ticker (`src/hooks/useLenis.ts`)                       |
| Forms / schema   | react-hook-form 7 + Zod 3                                                     |
| i18n             | Custom `LanguageProvider` (NOT i18next at runtime — see §5)                  |
| Toasts           | shadcn `sonner` + Radix `toast`                                               |
| Tooling          | ESLint 9 flat config, Vitest 3, Lovable dev-tagger                            |

> **Skip**: TanStack Query has no real cache consumers in the portfolio.
> i18next packages are installed for migration, but the current
> translator is the flat object in `src/i18n/translations.ts` (see §5).
> `sharp` lives in `devDependencies` and is consumed only by
> `scripts/optimize-pexels.mjs` (off-build image preprocessing) — it
> is not a runtime dependency.
>
> Icons: Phosphor (`@phosphor-icons/react`) drives the Dock,
> Lucide handles UI primitives. `src/components/brand-icons.tsx`
> exists from an earlier iteration and is not currently wired into
> any rendered section — leave as historical / delete when convenient.

---

## 2. Commands

All run via `npm` (a `bun.lockb` also exists; the lockfile story is in §11).

| Command                         | What it does                                                        |
| ------------------------------- | ------------------------------------------------------------------- |
| `npm run dev`                   | `tokens` → `vite` on **port 8080** (`host: "::"`)                   |
| `npm run build`                 | `tokens` → `vite build` (production)                                |
| `npm run build:dev`             | `tokens` → `vite build --mode development`                          |
| `npm run preview`               | `vite preview`                                                      |
| `npm run tokens`                | Rebuild `src/styles/generated/*` from JSON sources                  |
| `npm run tokens:test`           | Vitest for the token pipeline (core + AA contrast tests)             |
| `npm run lint`                  | `eslint .` (flat config; ignores `dist`)                            |
| `npm run onboard`               | Interactive wizard that rewrites `portfolio.config.json`            |
| `npm test`                      | Vitest single run                                                   |
| `npm run test:watch`            | Vitest watch                                                        |

The **Vite plugin in `vite.config.ts`** also runs `scripts/build-tokens.mjs`
on dev startup AND on every save of a JSON under `src/styles/tokens/**`,
then calls `server.moduleGraph.invalidateAll()` so HMR picks up the
regenerated CSS. `tokens` is therefore a no-op re-run in dev but **is**
required before `build` because the `build` path lacks the watcher.

---

## 3. Path aliases

| Alias  | Target    | Where declared                                   |
| ------ | --------- | ------------------------------------------------ |
| `@/*`  | `./src/*` | `tsconfig.json`, `vite.config.ts`, `vitest.config.ts` |

Vite also `dedupe`s `react`, `react-dom`, `react/jsx-runtime`,
`@tanstack/react-query`, `@tanstack/query-core` to avoid duplicates in
`three`/drei/postprocessing dependency trees.

---

## 4. Design system & token pipeline *(CRITICAL)*

**The pipeline is the absolute single source of truth.** Never hardcode
a colour, typography value, radius, or nav-height in component code.

### Source files (`src/styles/tokens/`)

Loaded by `scripts/build-tokens.mjs` in this order (see
`tokens.index.json`):

1. `primitives/colors.json` — palette scales + status colours
2. `semantic/colors.json` — semantic tokens as raw HSL triples
3. `semantic/layout.json` — radius scale, `--section-gap`, `--nav-height`
4. `semantic/typography.json` — font families + display scale + tracking
5. `semantic/motion.json` — durations (`--duration-*`) + `--ease-out-expo`
6. `themes/{indigo,catppuccin,dracula,tokyo-night}.json` — per-theme
   deltas

### Format (DTCG-ish)

- Primitive palette: nested keys become dot-paths
  (`palette.indigo.500`).
- Semantic values: `{ "$value": "..." }` objects.
- Aliases: `{palette.indigo.500}` are resolved against the flattened
  primitive context before emission.

### Emitted artifacts (`src/styles/generated/`)

| File                  | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `tokens.css`          | `:root` block + `@theme inline` + per-theme `[data-theme="X"]`  |
| `tokens.ts`           | Typed `TOKENS_DEFAULT` + `TOKENS_THEMES` (raw triples, no wrap)  |
| `tokens.flat.json`    | Flat diff snapshot — for inspection / docs                        |

`src/index.css` imports `tokens.css` first. Tailwind v4 utilities like
`bg-primary` work because `@theme inline` registers `--color-primary:
hsl(var(--primary))` — **the underlying CSS vars still hold raw HSL
triples**, never wrapped values.

Pipeline modules (the engine is separate from its I/O):
`scripts/tokens-core.mjs` is the pure engine — flatten, alias resolution,
model reduction, the emit policy and the contrast math, no filesystem and no
logging; `scripts/tokens-sources.mjs` is the filesystem boundary (where the
sources live + the load order from `tokens.index.json`);
`scripts/build-tokens.mjs` is the thin CLI that wires them together and
writes the artifacts. Tests import the core and the loader, never the CLI.

Emit policy: colour aliases become `hsl(var(--X))` wrappers in `@theme
inline`, while every token whose key starts with a namespace we own
(`radius-`, `font-`, `text-`, `tracking-`) is copied **verbatim**, because
Tailwind generates those utilities from our values instead of its defaults.
Font requests stay minimal: `Fraunces` is variable (wght 100-900 + opsz) and
only the weights actually used are requested in `index.html`.

### How to add a new theme

1. Create `src/styles/tokens/themes/<name>.json` with shape:
   `{ "overrides": { "primary": "290 80% 60%", ... } }`
2. Add `"<name>"` to the `ThemeId` union in `src/lib/themes.ts`
3. Add `"themes/<name>.json"` to the `sources` array in
   `tokens.index.json`
4. Refresh — `useTheme.setTheme("<name>")` is now a valid call.

### Layout variables to know

- `--nav-height` (default `60px`) — drives the
  `.viewport-content = 100vh − var(--nav-height)` utility.
- `--hero-pad-top` (default `32px`) — sticky offset for the 3D window.
- `--radius-{xs,sm,md,lg}` (`4px`, `8px`, `12px`, `16px`) — monotonic
  radius scale; Tailwind's `rounded-{xs,sm,md,lg}` come from these values,
  so they are emitted verbatim into `@theme inline`. Rule: inner radius =
  outer radius − padding.
- `--section-gap` / `--section-gap-sm` — single owner of the vertical
  rhythm between sections (consumed by `.section-y`).

### Custom utility classes (in `src/index.css` `@layer utilities`)

Visual primitives: `.text-gradient`, `.text-gradient-primary`,
`.text-gradient-accent`, `.glass`, `.glass-strong`, `.mesh-bg`,
`.grid-bg`, `.glow-primary`, `.glow-accent`, `.hover-glow`, `.bg-noise`,
`.liquid-glass`, `.liquid-glass-strong`.

Interaction: `.tech-chip` (hover shine sweep via `::before`),
`.dock-item-active`, `.dock-item-active-dot`.

Layout: `.section-px` (single source of truth for global horizontal
padding — components nested inside MUST NOT add their own `px-*`),
`.viewport-content`, `.hero-showcase`.

CRT: `.crt-scanlines`, `.crt-vignette` — gated by `body.crt-on`,
auto-disabled under `prefers-reduced-motion`.

Terminal fog: `.terminal-fog`, `.terminal-fog-blur` — z-25 stack
positioned so the dock (z-30) and terminal panel (z-40) stay sharp.

### Typography (current active scale)

| Token         | Family                                          | Usage                  |
| ------------- | ----------------------------------------------- | ---------------------- |
| `--font-display` | `"Fraunces", Georgia, serif`                 | All headings (`h1-h6`) |
| `--font-sans`    | `"IBM Plex Sans", system-ui, sans-serif`     | Body UI, paragraphs, `h3-h6` |
| `--font-mono`    | `"IBM Plex Mono", ui-monospace, monospace`   | Terminal, CLI, labels  |

Loaded via the Google Fonts `<link>` in `index.html` (single request,
all three families).

### `prefers-reduced-motion`

Always respected in: `.crt-*`, `.terminal-fog` (`transform: none`,
`backdrop-filter: none`), and `Trayectoria.tsx` (the GSAP
horizontal-scroll effect is skipped when the media query matches).
Honour this in any new animation.

---

## 5. Theming

- 4 themes: **indigo** (default), **catppuccin**, **dracula**,
  **tokyo-night**.
- Stored on `<html>` as `[data-theme="<id>"]`. Indigo is the default
  *and is the absence of the attribute*; never set
  `data-theme="indigo"`.
- Persistence: `localStorage["portfolio-theme"]`.
- Toggle UX: `ThemeSwitcher` in the dock opens a popover with all
  themes; `cli theme <name>` swaps themes from the CLI terminal;
  Spotlight groups a "Theme: …" entry per theme.
- Source: `src/lib/themes.ts` (`THEMES`, `ThemeId`, `DEFAULT_THEME`,
  `THEME_STORAGE_KEY`).

---

## 6. i18n

Implemented by **a custom flat-object system**, not the installed
i18next:

- `src/context/LanguageContext.tsx` — `LanguageProvider`, `useLanguage()`.
- `src/i18n/translations.ts` — single `Record<Lang, { [key: string]:
  string }>` for `Lang = "en" | "es"`.
- `t(key)` returns the string for the active lang; if missing, **it
  returns the literal key as a string** (silent fallback). Missing keys
  therefore won't throw at render time but will surface visibly.
- Persistence: `localStorage["portfolio-lang"]`. Toggle: dock language
  icon (animated flip), CLI `lang` not implemented — use Spotlight
  shortcut `@gh`/`@li` etc. or just click the dock icon.
- Key naming convention (always check before adding):
  - `nav.*` — top-nav labels
  - `hero.*`, `about.*`, `tech.*`, `trayectoria.*`,
    `projects.*` (incl. `projects.highlight_*`, `projects.category_*`),
    `education.*`, `contact.*`, `aria.*`

When adding a key: add an entry to **both** `en` and `es` blocks to
keep symmetry.

---

## 7. shadcn/ui: the edit rule, with one exception

`src/components/ui/` contains **both** true shadcn primitives AND a
handful of custom app-specific helpers. The rule is:

- **Pure shadcn primitives** (`button.tsx`, `dialog.tsx`, `card.tsx`,
  `toast.tsx`, `command.tsx`, `sidebar.tsx`, `sheet.tsx`, …): do **not**
  hand-edit. Add new ones via `npx shadcn@latest add <component>`.
  `components.json` config (style: default, RSC: false, baseColor:
  slate, cssVariables: true) is the CLI source of truth.
- **Custom UI helpers** living in the same folder: `SectionContainer.tsx` —
  these ARE hand-edited app code despite their location. When in doubt, the
  presence of a co-located `.test.tsx` or a non-Radix export pattern is a
  strong "hand-edit OK" signal.

UI alias: `@/components/ui`.

---

## 8. Application architecture

### Page composition (`src/pages/Index.tsx`)

Real order top → bottom:

1. `ImageBackground` — pexels photo with responsive `srcSet` (640/1280/1920/2560).
   The `<link rel="preload" as="image" imagesrcset=…>` in
   `index.html` primes the LCP fetch.
2. `Nav` — fixed top, hidden until scroll past `#projects`,
   active-section tracking via rAF-light scroll listener.
3. `HeroShowcase` — left: sticky 3D window (lazy `HeroScene`, GLB
   figure on a holo pedestal — see 3D components below); right:
   stacked `WindowChrome` Welcome (`<Hero>`) + About
   (`<TechBento>`). Both right-side windows are `viewport-content`
   (i.e. `100vh − --nav-height`) so they line up with the sticky
   3D column. Mobile falls back to a vertical stack with the 3D at
   `55vh` non-sticky.
4. `Projects` — `<WindowChrome title="~/projects — ls -la">`. Two
   view modes (`carousel` | `detail`) with a 420ms cross-fade via
   `isExiting` + `viewFlip/entering/exiting` CSS animation. Filter
   chips sit visually below the cards thanks to DOM order swap
   (`column-reverse` style); see comment in `Projects.tsx`.
5. `Trayectoria` — desktop = GSAP horizontal-scrolling timeline
   (pin + scrub, alt cards above/below the axis, axes + connector
   dots, scroll progress `current / total`); mobile = vertical
   timeline. `<a>` CTA card at the rightmost end of the desktop
   track.
6. `Education` — `<WindowChrome title="~/education.txt">`.
7. `Contact` — `<WindowChrome title="~/contact — mail">` — form is
   a `mailto:` launcher (no backend).

### Glue components (`App.tsx`)

`App.tsx` mounts (in this order):
`<QueryClientProvider>` → `<TooltipProvider>` → `<Toaster>`/`<Sonner>`
→ `<BootSequence>` → `<BrowserRouter>` (Index + NotFound) →
`<Spotlight>` → `<CliTerminal>` → `<Dock>` → `<CrtOverlay>` →
`<CRTToggle>`. State: spot­light `open` lives in `App`, terminal
`open` also in `App`. The Dock receives callbacks for both.

### Section components (`src/components/sections/`)

Real list (no longer matches the AGENTS.md in old branches):

- `Hero.tsx` — minimal heading + 2 CTAs.
- `HeroShowcase.tsx` — 2fr-left / 3fr-right grid w/ sticky 3D.
- `About.tsx` — heading + `<TechBento>` only (no bio paragraph in the
  visible layout; bio copy lives in `translations.ts` under `about.*`
  for future use).
- `TechBento.tsx` — inline `CATEGORIES` array; each item is `{ name,
  svg: "/icons/X.svg" | null, iconLucide: LucideIcon | null }`. Asymmetric
  bento: Frontend and Tools span both columns (DOM order is load-bearing —
  see the `featured` comment), category titles are mono labels, the top
  border is the only accent cue. No shine sweep (utility removed).
- `Trayectoria.tsx` + `Trayectoria.module.css` — see above.
- `Projects.tsx` + `projects/{ProjectsCarousel,ProjectCard,ProjectCategoryChips,ProjectDetail,MobileProjectList}.tsx` +
  `projects/projects.module.css`.
- `Education.tsx`, `Contact.tsx` — content sections.
- (`HeroShowcase.tsx` lives in this folder but is not strictly a
  section — see glue components above.)

### 3D components (`src/components/three/`)

- `Scene.tsx` — reusable `<Canvas>` wrapper (`camera`, `dpr`,
  `frameloop` props; WebGL2 + WebGL fallback).
- `HeroScene.tsx` — the hero 3D window content, **lazy-loaded** via
  `React.lazy` from `HeroShowcase` (the whole three/fiber/drei/
  postprocessing tree lives in a separate chunk). "Holographic
  capsule" presentation of the hero GLB — design contract in
  `PROPUESTAS-3D-HERO.md`. Owns the render policy: frameloop
  `never` when the hero is out of viewport (IntersectionObserver),
  `demand` for static fallback paths, `always` otherwise + Bloom/
  Vignette (skipped on the fallback path).
- `HoloFigure.tsx` — GLB figure (useGLTF + self-hosted Draco decoder
  in `public/draco/`), pedestal with accent-emissive ring,
  GSAP materialisation (scan-ring sweep + fade/rise, rooted in
  `gsap.context`), turntable + mouse parallax, hover → rim-light
  kick. All motion gated by a `motion` flag
  (`!prefersReducedMotion && !shouldUseFallback`).
- `Icon3D.tsx` + `TechStack3D.tsx` — 3D tech icons (historical, no
  consumers).

Theme colours inside the 3D scene come from `useCssColor`
(`src/hooks/useCssColor.ts`) — MutationObserver on `data-theme`
reading raw HSL triples and emitting comma-separated `hsl(h, s%, l%)`
(THREE.Color's parser rejects the modern space-separated syntax —
materials silently fall back to white if you change this).

`useDeviceTier` is consumed by `HeroScene`: `shouldUseFallback`
(mobile, reduced motion, or low GPU tier) → static pose
(`frameloop="demand"`), no postprocessing, no float/materialisation.
Mid/high tiers get the full experience.

### Window chrome (`src/components/window/`)

`WindowChrome` exposes `title`, `id`, `defaultOpen`, `fullHeight`,
and a `className`. Three traffic-light buttons: **close** removes the
window entirely (clicking a small "open" pill restores it),
**minimize** collapses height to 0 (or fades children when
`fullHeight`), **maximize** un-minimizes. Used as the wrapping shell
around every major window.

### Shell chrome

| File                              | Trigger                       | Hook / context                                          |
| --------------------------------- | ----------------------------- | ------------------------------------------------------- |
| `boot/BootSequence.tsx`           | First visit only              | `useBootSequence(N, 120ms)`; LS key `portfolio-booted`  |
| `cli/CliTerminal.tsx`             | Dock terminal icon            | `useTerminalHistory` + `executeCommand` (`src/lib/cli-commands.ts`) |
| `spotlight/Spotlight.tsx`         | `⌘K` / `Ctrl+K`              | `useSpotlightToggle` + `getSpotlightItems({ setTheme })` |
| `dock/Dock.tsx`                   | Always (bottom-fixed)         | `useDockHover` (magnify-on-hover)                       |
| `crt/CrtOverlay.tsx`+`CRTToggle`  | Top-right toggle              | Body class `crt-on` (scanlines + vignette)              |
| `Nav.tsx`                         | Always (top-fixed)            | Scroll + resize listeners, hides itself before `#projects` |
| `background/ImageBackground.tsx`  | Mounted once                  | Responsive `<img>` w/ srcSet/sizes                      |

CLI commands are a single switch in `src/lib/cli-commands.ts`
(`help`, `whoami`, `projects`, `skills`, `experience`, `education`,
`contact`, `theme [name]`, `clear`/`cls`, `history`, `ls`, `pwd`,
`date`, `banner`, `neofetch`, `sudo`, `rm`, `exit`). To add a command:
extend that switch and add help-line text in the `HELP` const.

Spotlight items: add to `src/lib/spotlight-items.ts` via
`getSpotlightItems({ setTheme })`. Group labels: `Sections`, `Social`,
`Themes`, `Actions`.

---

## 9. Animation, scroll & 3D

- **GSAP + ScrollTrigger**: registered once globally in
  `src/lib/gsap.ts`. Always import `gsap` / `ScrollTrigger` from this
  barrel — never re-import from `gsap/` directly, or the plugin won't
  be registered when consumed downstream.
- **Lenis**: `useLenis()` initialised in `Index.tsx`. Hooks the Lenis
  RAF into the GSAP ticker (`gsap.ticker.add`) so ScrollTrigger
  refreshes stay in sync. Disables lag smoothing
  (`gsap.ticker.lagSmoothing(0)`).
- **Framer Motion**: used for component-level micro-animations
  (TrafficLights, Spotlight dialog, dock icon flip
  via `data-motion="enabled"`).
- **`useDeviceTier`** (`src/hooks/useDeviceTier.ts`): combines
  `(max-width: 767px)` + `prefers-reduced-motion` + a WebGL renderer
  sniff (regex on `WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL`
  → `low`/`mid`/`high`). Single boolean `shouldUseFallback` swaps
  between 3D/sticky paths and mobile equivalents.

---

## 10. Data

- `src/data/projects.ts` — 3 projects (GameVision = Android TFM 9/10,
  MatchVision = iOS TFM 9/10, Casa Húmedo = Next.js startup demo).
  Helper `groupTechByCategory(techTags)` rolls tags into 7 categories:
  `language`, `framework`, `architecture`, `backend`, `styling`,
  `integration`, `context`. Order in `CATEGORY_ORDER` array = display
  order.
- `src/data/trayectoria.ts` — 9 timeline items spanning 2019→2026.
  Two variants: `milestone` (single-paragraph) and `experience`
  (bullet list). Categories: `experience`, `education`,
  `certification`, `internship`.

---

## 11. TypeScript & ESLint quirks

- **Strict mode is OFF**:
  `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`,
  `noFallthroughCasesInSwitch: false`.
- **Unused checks are OFF**: `noUnusedLocals: false`,
  `noUnusedParameters: false`, plus
  `@typescript-eslint/no-unused-vars: "off"`.
- Imports: `allowImportingTsExtensions: true`,
  `moduleResolution: "bundler"`, jsx `react-jsx`.
- ESLint flat config (`eslint.config.js`): typescript-eslint
  recommended + react-hooks + react-refresh (warns on files that
  export only non-components, with `allowConstantExport: true`).

Don't try to "fix" this — the loose config is intentional for fast
iteration; surface tightening as a separate refactor change.

---

## 12. Testing

- Test files: `src/**/*.{test,spec}.{ts,tsx}` (jsdom, Vitest globals).
- `vitest.config.ts` re-uses the `@/*` alias and React SWC plugin.
- `src/test/setup.ts`:
  - imports `@testing-library/jest-dom`
  - stubs `window.matchMedia` with a full `MediaQueryList` shape
  - stubs `window.IntersectionObserver` (no-op)
- Co-located tests exist for:
  `WindowChrome`, `useTerminalHistory`, `useTheme`, `cli-commands`,
  `spotlight-items`, `data/projects` (`projects.test.ts`),
  `data/trayectoria` (`trayectoria.test.ts`),
  `src/scripts/build-tokens.test.ts`,
  `src/scripts/token-contrast.test.ts` (WCAG AA guard for muted text).
- Coverage guidance: any new data-shaping helper (`groupTechByCategory`,
  command dispatch, theme overlay, spotlight filter) gets a co-located
  `.test.ts` BEFORE the implementation lands.

---

## 13. Lockfiles

Both **`bun.lockb`** and **`package-lock.json`** are checked in. Use
`npm` for installs to stay aligned with `package.json` scripts.

---

## 14. Public assets

Source-of-truth for the following, located in `public/`:

- Pexels background sizes: `pexels-{640,1280,1920,2560}.webp` —
  referenced from `ImageBackground` (srcSet) and preloaded from
  `index.html`.
- Tech stack icons: `icons/*.svg` (C, Python, PHP, JS, TS, HTML, CSS,
  React, Vue, Next.js, Tailwind, GSAP, Three.js, Flutter, Node, Laravel,
  NestJS, MySQL, PostgreSQL, Firebase, Supabase, Docker, Git, Make,
  Swagger). All rendered at `18×18` in `TechBento` chips.
- Project media: `gamevision-demo.mp4`, `matchvision-demo.mp4`,
  `casahumedo-preview.png`.
- Hero 3D model: `3d/zoro-fanko-pop-draco.glb` (Draco-compressed,
  ~1.2 MB, 264k tris) — the ONLY file served to the browser. The
  16 MB source `3d/zoro_fanko_pophigh-poly.glb` stays in the repo as
  reference; never import it. Draco decoder is self-hosted in
  `draco/` (no CDN). Regenerate the compressed asset from the source
  with `npx @gltf-transform/cli` (`dedup`, `prune`, `optimize
  --compress draco --texture-compress webp`).
- `cv.pdf` — resume. **Currently 404s** (TODO — Dock "Resume" item
  flashes "Downloading…" then fails silently).
- `logo1.svg` — favicon + OG image.
- `robots.txt` — fully open (Googlebot/Bingbot/Twitterbot/facebookexternalhit/*).
  Don't lock it down without a reason.

---

## 15. Don'ts (single list of regressions to avoid)

1. **Don't hardcode colours**, font families, radius, or
   `--nav-height` in component CSS / inline styles. Add a token to
   `src/styles/tokens/semantic/*.json` (or `themes/*` for theme-specific
   values), re-run `npm run tokens`.
2. **Don't hand-edit** anything under `src/styles/generated/`.
3. **Don't hand-edit true shadcn primitives** in `src/components/ui/`
   (see §7 for the carve-out list).
4. **Don't introduce a `tailwind.config.ts`**. Tailwind v4 uses a
   CSS-first config (theme tokens, custom utilities, `@theme inline`,
   keyframes all live in `src/index.css` and the JSON sources under
   `src/styles/tokens/**`). Any new animation / colour / breakpoint
   goes in `src/index.css` (or the token JSON pipeline that feeds it),
   never in a `tailwind.config.ts`. This WILL be suggested by every
   agent that doesn't read §4 — ignore it.
5. **Don't mount another `<BootSequence>`** or duplicate Lenis
   initialisation; both are owned by the App page singleton.
6. **Don't add i18n keys to only one locale** — always edit both `en`
   and `es` blocks together.
7. **Don't use `window.matchMedia` directly in components**; use
   `useMediaQuery` or `useReducedMotion` so SSR / Vitest stubs aren't
   broken.
8. **Don't use `state`-only `gsap.context(...)` cleanup boots** — wrap
   every GSAP effect in `.context()` rooted on a real `section`/track
   ref, so React strict-mode double-mount + HMR re-runs don't leak
   pinned ScrollTriggers.
9. **Don't add new external font weight requests** — the Google Fonts
   `<link>` already covers 400/500/600/700 of all three families.
10. **Don't ship a "Use anywhere" global state** — preference state
    (theme, lang, CRT, boot-seen) is intentionally per-key
    `localStorage`. Avoid adding a global preferences store until that's
    a real ask.
11. **`useDeviceTier` has a single sanctioned consumer: `HeroScene`.**
    The hero 3D (branch `3d-design`) wired it in as the fallback gate —
    that decision is made and recorded in `PROPUESTAS-3D-HERO.md`. Any
    NEW heavy effect may reuse it, but don't spread it across small
    components casually; it creates a WebGL context just to sniff the
    GPU string.
