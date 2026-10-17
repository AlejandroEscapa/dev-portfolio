# AGENTS.md

> Single source of truth for any agent picking this project up. Optimised
> for **modification tasks**: when in doubt, change here-under before
> editing code.

## 0. Project at a glance

A single-page portfolio site for a Mobile & Frontend developer, themed
as a desktop OS (windows with traffic-lights, left side-rail dock,
terminal, spotlight, CRT toggle). Single routing entry (`/`); everything else is `<NotFound>`.

- **Entry**: `index.html` → `src/main.tsx` → `src/App.tsx`
- **Page**: `src/pages/Index.tsx`
- **Config**: `portfolio.config.json` (typed via `src/lib/config.ts`)
- **Tokens**: `src/styles/tokens/**.json` → generated CSS/TS via
  `scripts/build-tokens.mjs`
- **Deploy**: Vercel (GitHub integration) auto-deploys `main` →
  `https://aoe-dev.vercel.app`. That URL is the canonical/og:url used by
  the meta tags and JSON-LD in `index.html` — update both if it changes.

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
| Icons            | **Lucide** (dock actions + UI primitives), `simple-icons` (brand marks)      |
| Smooth scroll    | Lenis hooked into GSAP ticker (`src/hooks/useLenis.ts`)                       |
| Forms / schema   | react-hook-form 7 + Zod 3                                                     |
| i18n             | Custom `LanguageProvider` (NOT i18next at runtime — see §5)                  |
| Toasts           | shadcn `sonner` + Radix `toast`                                               |
| Tooling          | ESLint 9 flat config, Vitest 3, Lovable dev-tagger                            |

> **Skip**: TanStack Query has no real cache consumers in the portfolio.
> The runtime translator is the flat object in `src/i18n/translations.ts`
> (see §5); `i18next` and `react-i18next` were uninstalled in Fase 0 of the
> Next Level plan (reinstall only if that migration is ever wanted).
> `sharp` lives in `devDependencies` and is consumed only by
> `scripts/optimize-pexels.mjs` (off-build image preprocessing) — it
> is not a runtime dependency.
>
> Icons: Lucide drives the Dock's action glyphs; official brand marks
> come from the `simple-icons` npm package — EXCEPT LinkedIn, removed
> from simple-icons in v11 (trademark): its last published path is
> kept as an in-repo constant in `src/components/brand-icons.tsx`,
> which is also imported by `Contact.tsx`. `@phosphor-icons/react` was
> uninstalled in Fase 0: Lucide + `simple-icons` cover every glyph.

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

Para un tema **oculto** (el ámbar CRT de §5) los mismos tres pasos, pero
registrándolo en `SECRET_THEMES` en vez de `THEMES`: así no aparece ni en
el menú del dock ni en Spotlight, y su única puerta es `sudo theme
<name>` en la terminal.

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

Scoped override (typed-titles round, extended 2026-10-13): card titles
(`.cardTitle` in Projects + Trayectoria, `.mobileCardTitle`) and the
detail's project title (`.detailName`) render in `--font-sans` (product
voice). Section h2 headings keep Fraunces at `text-h1` — Contact was
downsized from `text-display` to `text-h1` for coherence. Eyebrows
(`section_label`), pills, window titles and stats bars are `font-mono`;
Plex Mono tops at 500, so mono text never uses 600+ (synthetic bold).
The nine sheet sections carry the same header recipe: mono
`section_label` with its page-order numerator (`01`–`09`), visible
`text-h1` h2 and a `mt-2` muted subline. Hero is the cover (no numeral)
and `Certifications` is the proof inside `03 - AI workflow`, so neither
gets a header of its own; `Trayectoria` keeps its pinned display title
but adds the label + subline. Do not extend the sans override without
asking.

### `prefers-reduced-motion`

Always respected in: `.crt-*`, `.terminal-fog` (`transform: none`,
`backdrop-filter: none`), `Trayectoria.tsx` (the GSAP horizontal-scroll
effect is skipped when the media query matches), `lib/theme-transition.ts`
(the theme swap falls back to the instant one) and `fx/Magnetic` (renders
its child with no listeners at all).
Honour this in any new animation.

---

## 5. Theming

- 4 **public** themes: **indigo** (default), **catppuccin**, **dracula**,
  **tokyo-night** — the ones `THEMES` lists.
- 1 **hidden** theme: **amber** (CRT phosphor). It lives in the pipeline
  like any other, but it is only in `SECRET_THEMES`: the dock menu and
  Spotlight never show it. The only door is `sudo theme amber` in the CLI
  (`theme amber`, without sudo, answers "unknown theme").
- Stored on `<html>` as `[data-theme="<id>"]`. Indigo is the default
  *and is the absence of the attribute*; never set
  `data-theme="indigo"`.
- Persistence: `localStorage["portfolio-theme"]`.
- Toggle UX: `ThemeMenu` (`src/components/theme-switcher/ThemeMenu.tsx`)
  in the dock rail opens a popover with the public themes; `cli theme
  <name>` swaps themes from the CLI terminal; Spotlight groups a "Theme: …"
  entry per public theme.
- **Cinematic switch (Fase 1.5):** `useTheme().setTheme(theme, origin?)` is
  the single owner of the change. It applies `data-theme` *and* persists it
  inside a View Transition callback (`src/lib/theme-transition.ts`), so the
  wipe circle is inherited by all three entry points and the choice sticks
  even when the caller unmounts in the same commit (the dock popover closing
  on pick). The wipe is born at the dock rail and degrades to the instant
  swap without `document.startViewTransition` or under reduced motion.
  The `::view-transition-*` pseudo-element rules live at the end of
  `src/index.css`.
- Source: `src/lib/themes.ts` (`THEMES`, `SECRET_THEMES`, `ThemeId`,
  `isThemeId`, `isSecretTheme`, `DEFAULT_THEME`, `THEME_STORAGE_KEY`).

---

## 6. i18n

Implemented by **a custom flat-object system** (`i18next` is not
installed — see §1):

- `src/context/LanguageContext.tsx` — `LanguageProvider`, `useLanguage()`.
- `src/i18n/translations.ts` — single `Record<Lang, { [key: string]:
  string }>` for `Lang = "en" | "es"`.
- `t(key)` returns the string for the active lang; if missing, **it
  returns the literal key as a string** (silent fallback). Missing keys
  therefore won't throw at render time but will surface visibly.
- Persistence: `localStorage["portfolio-lang"]`. The `LanguageProvider`
  also syncs `document.documentElement.lang` with the active language
  (screen readers + crawlers read the DOM, not React state).
  Toggle: dock language icon (animated flip), CLI `lang` not implemented
  — use Spotlight shortcut `@gh`/`@li` etc. or just click the dock icon.
- Key naming convention (always check before adding):
  - `nav.*` — top-nav labels
  - `hero.*`, `about.*`, `tech.*`, `trayectoria.*`,
    `projects.*` (incl. `projects.highlight_*`, `projects.category_*`,
    and the `projects.thread_*` copy for detail threads),
    `contributions.*`, `certifications.*`, `sidequests.*`, `stats.*`,
    `education.*`, `contact.*`, `footer.*`, `cursor.*` (cursor state
    labels), `aria.*`

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
3. `HeroShowcase` — left: sticky 3D figure (lazy `HeroScene`, GLB
   figure on a holo pedestal — see 3D components below), no window
   frame; right: stacked sheet blocks Welcome (`<Hero>`) + About
   (`<TechBento>`). Both right-side blocks are `viewport-content`
   (i.e. `100vh − --nav-height`) so they line up with the sticky
   3D column. Mobile falls back to a vertical stack with the 3D at
   `55vh` non-sticky.
4. `Projects` — sheet section (id `projects`). Two
   view modes (`carousel` | `detail`) with a 420ms cross-fade via
   `isExiting` + `viewFlip/entering/exiting` CSS animation. Filter
   chips sit visually below the cards thanks to DOM order swap
   (`column-reverse` style); see comment in `Projects.tsx`.
   **Detail view composition** (design log in
   `ALTERNATIVAS-DETALLE-PROYECTO.md`): thin header with ONLY the back
   button; the project title lives in the info column
   (`.detailName`, `--font-sans` 1.6rem → 2rem ≥768px — one notch below
   the old centered header it replaced, because sans reads bigger at
   equal size); media fills its fixed box with
   `object-fit: cover` for BOTH kinds (videos crop their baked 16:9
   bars; the web capture zooms); specs + actions are ONE bento mosaic
   (`.specBento`, 2-col grid + dense flow — CTA width = wide when the
   spec cells pair up, half when sharing a row; repo CTA carries the
   real GitHub mark); a one-line additive fact strip (APIs, features)
   sits at the bottom of the window, capped to a single row.
4b. Bloque IA único — sección llana (id `ai-workbench` en `Index.tsx`):
   método (`AIWorkbench`) + prueba (`Certifications`, ancla interna
   `certifications` para Spotlight). `Formacion` queda solo con `Education`.
   Ningún `SectionContainer` interior lleva el id de su sección.

   **Hoja continua (edición nocturna):** las ventanas murieron — 9 secciones
   seguidas sin `WindowChrome` (borrado con su test), separadas solo por
   `<SectionDivider>` (filete sencillo, sin folio numérico ni texto; cada sección aporta su propia etiqueta de contexto).
   El único ritmo es `.section-y`. Stats va subordinado
   (`mx-auto max-w-5xl`): infografía dentro del ejemplar, no gemela.
   Guiños editoriales (`.rule-double`, `.folio`, `.photo-credit`,
   `.dropcap` en `src/index.css`). `Trayectoria` y `Projects` conservan
   su lógica interna (pin GSAP, carousel 3D) sin marco.
5. `Trayectoria` — estructura especial con horizontal-scroll pineado por
   GSAP (sin marco, como todo lo demás). Desktop = GSAP horizontal-scrolling timeline
   (pin + scrub, alt cards above/below the axis, axes + connector
   dots, scroll progress `current / total`); mobile = vertical
   timeline. `<a>` CTA card at the rightmost end of the desktop
   track.
6. `Contributions` — sheet section (id `contributions`).
   Ledger of open-source contributions rendered as
   git-log lines; each row is an expandable accordion revealing the full
   war story in a single column (mobile-safe).
7. `Education` — dentro de la sección `formacion` (ancla interna
   `education`; `certifications` vive en el bloque IA). Formal
   education only (the standalone IBM credential card was removed), in
   a 2-col grid; credentials live in Certifications now.
8. `Certifications` — dentro del bloque IA (id `certifications`).
   Credential cards pulled out of the
   Trayectoria/Education timelines into their own window, 2-col grid.
9. `SideQuests` — sheet section (id `sidequests`).
   Sober mono list of out-of-building projects.
10. `Stats` — sheet section (id `stats`), subordinada `max-w-5xl`.
    neofetch-style compacta with ASCII bars (`statBar`) instead
    of invented metrics.
11. `Contact` — sheet section (id `contact`) — form is
    a `mailto:` launcher (no backend). The personal data rows (location,
    email, social marks) moved OUT into the footer.
12. `Footer` (`src/components/Footer.tsx`) — editorial 3-zone footer,
    no window chrome: identity block + quick nav + social marks, then a
    hairline with © line, signature and the site's single status dot
    (`footer.status`), coloured with the `success` token. No phone
    number anywhere on the page. The page ends on it, after Contact.

### Glue components (`App.tsx`)

`App.tsx` mounts (in this order):
`<QueryClientProvider>` → `<TooltipProvider>` → `<Toaster>`/`<Sonner>`
→ `<BootSequence>` → `<BrowserRouter>` (Index + NotFound) →
`<Spotlight>` → `<CliTerminal>` → `<Dock>` → `<CrtOverlay>` →
`<CRTToggle>`. State: spot­light `open` lives in `App`, terminal
`open` also in `App`. The Dock receives callbacks for both.

### Section components (`src/components/sections/`)

Real list (no longer matches the AGENTS.md in old branches):

- `Hero.tsx` — minimal heading + 2 CTAs. The title (decrypt) and the
  CTA row enter on the boot signal, never via `whileInView`: the
  chronology is owned by `src/lib/boot-state.ts` (`isBooted()` read
  synchronously in the first render, `BOOTED_EVENT` for the rest).
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
- `Education.tsx`, `Contact.tsx` — content sections (the contact data
  itself lives in `src/components/Footer.tsx`, rendered by `Index.tsx`
  after Contact — see the page composition above).
- `Contributions.tsx` — git-log ledger window; `ContributionRow` is the
  `data-cursor="open"` accordion row that expands the full story.
- `Certifications.tsx` — 2-col credential grid moved out of the
  timelines; `valid_until` dates resolve a `{year}` template (no i18n
  interpolation at runtime).
- `SideQuests.tsx` — sober mono list of side projects; titles come from
  `data/sidequests.ts` (each stores an i18n key).
- `Stats.tsx` — neofetch-style compact window; bars come from
  `statBar` in `data/stats.ts` (`█`/`░` glyphs, no real metrics).
- (`HeroShowcase.tsx` lives in this folder but is not strictly a
  section — see glue components above.)

### FX components (`src/components/fx/`)

Third-party effects copied from shadcn registries and adapted:
`DecryptedText` (hero h1), `ShimmerButton` (hero CTAs — the luminous
spark/indicator was removed at the user's request; the buttons keep
only highlight + backdrop), `Noise` (film-grain overlay on the
background image, mounted in `Index.tsx`).
In-repo primitives (no registry origin): `Reveal` + `RevealStagger`
(the shared below-the-fold reveals; `amount: "some"`, never a
proportional threshold, or a container taller than the viewport would
never reveal), `TerminalCursor` — **replaced `CursorHalo` in ronda 2**
(the old file and its test were deleted). Same event-delegation
contract (`mouseover`/`mouseout` on `document` reading
`closest("[data-cursor]")`), values now `view | open | text`
(`text` = I-beam bar over form fields). Three layers: dot (6px),
ring (88px, rest `scale 0.32`) with crosshair ticks, and the
`open`-state corner brackets. Mounted state is opt-in via
`features.terminalCursor`, fine-pointer only; the native cursor is
hidden by `cursor: none` on `html[data-custom-cursor="on"]` (set on
mount, cleared on unmount) — rule lives in `src/index.css`, so the
native cursor survives any unmount), and `Magnetic` (proximity magnet
for the hero CTAs; geometry in `src/lib/magnetic.ts`, so the `.tsx` exports
only the component). `ElectricBorder.tsx` and
`magic-card.tsx` were deleted in Fase 0 — already zero consumers (the
user rejected both: ElectricBorder on Contact, MagicCard on TechBento —
TechBento tiles use the inline `specular` glass recipe). Rules for anything added here:
imports from `framer-motion` (never `motion/react`), colours ONLY
via semantic tokens/props (see `useCssColor` for canvas-driven
colour), `prefers-reduced-motion` must degrade gracefully, and
provenance goes in `src/lib/fx-attributions.ts`. Registries are
declared in `components.json` (`@aceternity`, `@magicui`,
`@reactbits`); note `shadcn add` may try to install deps with bun —
temporarily rename `bun.lockb` to force npm, and strip anything it
adds beyond `package.json` (`motion`, `next-themes` were removed).

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

### Window chrome — ELIMINADO (hoja continua)

`src/components/window/` se borró con su test: la página ya no tiene
ventanas. Si algún día vuelve un marco, se reintroduce desde git,
no se reinventa.

### Shell chrome

| File                              | Trigger                       | Hook / context                                          |
| --------------------------------- | ----------------------------- | ------------------------------------------------------- |
| `boot/BootSequence.tsx`           | First visit only              | `useBootSequence(N, 120ms)`; `lib/boot-state.ts` (single owner of the flag + event) |
| `cli/CliTerminal.tsx`             | Dock terminal icon            | `useTerminalHistory` + `executeCommand` (`src/lib/cli-commands.ts`) |
| `spotlight/Spotlight.tsx`         | `⌘K` / `Ctrl+K`              | `useSpotlightToggle` + `getSpotlightItems({ setTheme })` |
| `dock/Dock.tsx`                   | Always (LEFT vertical rail, collapsed 52px by default; chevron expands to 184px) | `useDockHover("y")` (glyph magnify-on-hover, 3px nudge — never the button) |
| `crt/CrtOverlay.tsx`+`CRTToggle`  | Top-right toggle              | Body class `crt-on` (scanlines + vignette)              |
| `Nav.tsx`                         | Always (top-fixed)            | Scroll + resize listeners, hides itself before `#projects`; one link per numbered section (`#formacion`, not the inner `#education`) |
| `background/ImageBackground.tsx`  | Mounted once                  | Responsive `<img>` w/ srcSet/sizes                      |

CLI commands are a single switch in `src/lib/cli-commands.ts`
(`help`, `whoami`, `projects`, `skills`, `experience`, `education`,
`contact`, `theme [name]`, `clear`, `history`, `neofetch`, `ls`,
`pwd`, `date`, `banner`, `sudo`). To add a command:
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
  via `data-motion="enabled"`, `Magnetic` via motion values + spring).
- **View Transitions API**: only for the theme switch
  (`src/lib/theme-transition.ts`). Feature-detected, reduced-motion aware,
  and never a requirement: if the API is missing or the transition is
  skipped, the theme change has already been applied. Duration/easing come
  from `--duration-slow` / `--ease-out-expo` (`EASE_OUT_EXPO_CSS` in
  `src/lib/motion.ts` is the CSS-string form of the easing, for WAAPI).
- **`useDeviceTier`** (`src/hooks/useDeviceTier.ts`): combines
  `(max-width: 767px)` + `prefers-reduced-motion` + a WebGL renderer
  sniff (regex on `WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL`
  → `low`/`mid`/`high`). Single boolean `shouldUseFallback` gates the
  hero 3D fallback (see §8 3D components); it has no other consumers.

---

## 10. Data

- `src/data/projects.ts` — 3 projects (GameVision = Android TFM 9/10,
  MatchVision = iOS TFM 9/10, Casa Húmedo = Next.js startup demo).
  Helper `groupTechByCategory(techTags)` rolls tags into 7 categories:
  `language`, `framework`, `architecture`, `backend`, `styling`,
  `integration`, `context`. Order in `CATEGORY_ORDER` array = display
  order. Optional `apis?: string[]` / `features?: string[]` per project
  feed the detail's additive strip — they must hold facts NO other
  surface shows (never tech already covered by techTags). Optional
  `threadKey?: string` per project carries the i18n key of the detail's
  THE THREAD cell (`projects.thread_*`); every project has one, and
  its test asserts the key resolves in BOTH locales.
- `src/data/trayectoria.ts` — timeline items spanning 2019→2026.
  Three variants: `milestone` (single-paragraph), `experience`
  (bullet list) and `bridge` (the ronda-2 "El Puente" CTA card,
  category `bridge` too). Categories: `experience`, `education`,
  `certification`, `internship`, `bridge`. Note: `certification`
  items are chronology events only since ronda 2 — their dedicated
  display moved to the `Certifications` section/data.
- `src/data/contributions.ts` — the contributions ledger (one entry
  per war story, copy in `en`/`es` via i18n keys). Qualitative by
  design: no invented metrics.
- `src/data/certifications.ts` — credential cards (issuer, year,
  URL, `valid_until` if any) feeding `Certifications.tsx`.
- `src/data/sidequests.ts` — side quests list; each `title` field
  stores an i18n key (`sidequests.<id>_title`), resolved with
  `t()`.
- `src/data/stats.ts` — neofetch-style rows + the `statBar(value, max)`
  helper (ASCII `█`/`░` bars, 16 cells). Purely stylistic values, no
  real-time metrics.

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
  `section/SectionDivider`, `useTerminalHistory`, `useTheme`, `cli-commands`,
  `spotlight-items`, `data/projects` (`projects.test.ts`),
  `data/trayectoria` (`trayectoria.test.ts`),
  `fx/Reveal` (+ `Reveal.viewport.test.tsx`), `fx/TerminalCursor`,
  `fx/Magnetic` (+ `lib/magnetic` for the geometry),
  `lib/theme-transition` (wipe, origin resolution, fallbacks),
  `lib/themes` (public vs hidden split),
  `sections/Hero`, `projects/ProjectCard`, `lib/boot-state`,
  `i18n/translations` (en/es symmetry), `scripts/public-assets.test.ts`
  (every referenced public asset exists),
  `src/scripts/build-tokens.test.ts`,
  `src/scripts/token-contrast.test.ts` (WCAG AA guard for muted text,
  covering the five themes including the hidden one).
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
- `og.png` — 1200×630 social share card (name + tagline + logo on a
  brand gradient). Referenced by the OG/Twitter meta and the JSON-LD
  block in `index.html` as an ABSOLUTE URL
  (`https://aoe-dev.vercel.app/og.png`). Generated one-off with `sharp`
  (SVG background + composite of `logo1.png` resized to 170×170);
  regenerate if the logo, name or tagline change.
- `logo1.svg` — favicon only. Do NOT use it as `og:image`: social
  platforms don't render SVG.
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
   `<link>` already covers every weight actually loaded: Plex Sans
   400/500/600/700, Plex Mono **400/500 only** (any mono text at ≥600
   renders synthetic bold — fix the component, not the link), Fraunces
   variable 100-900.
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
