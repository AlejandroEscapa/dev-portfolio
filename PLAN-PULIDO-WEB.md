# Plan de pulido premium — rama `pulido-web`

**Fecha:** 2026-09-26
**Base:** `new-design` @ `911e665` (incluye el fix de lint/type parity)
**Rama de trabajo:** `pulido-web`
**Alcance aprobado:** tier 1 — sistema de diseño, ritmo, detalle y borrado de Passions. Sin features nuevas, sin refactors estructurales, sin cambios de arquitectura.
**Estado:** aprobado. Registro de ejecución al final del documento.

---

## 1. Tesis de diseño — «Editorial OS»

Se mantiene la esencia: shell de escritorio (ventanas con traffic lights, dock, terminal, spotlight, CRT), fondo fotográfico, 4 temas y i18n ES/EN. Lo que cambia es la **fidelidad y la contención**: de cosplay skeuomorph maximalista a **instrumento de precisión editorial**.

- **Un trabajo por pieza de chrome**: menú superior = estado + secciones · dock = apps/acciones · spotlight = comandos · terminal = logs. (Resuelve la redundancia de paradigmas del audit sin borrar la metáfora.)
- **Un solo momento tipográfico**: el serif display aparece en titulares grandes, nunca en UI ni en labels.
- **Contención**: un accent, hairlines en vez de bordes gruesos, negativo generoso, sin gradientes decorativos repetidos.
- **Motion**: menos y mejor — 3 momentos coreografiados en lugar de `whileInView` en todo.

### Sistema tipográfico

| Token | Familia | Uso |
| --- | --- | --- |
| `--font-display` | `Instrument Serif` | titulares display / h1–h2 (display face: peso 400 + italic) |
| `--font-sans` | `IBM Plex Sans` | UI, párrafos, h3–h6 |
| `--font-mono` | `IBM Plex Mono` | terminal, CLI, labels técnicos, títulos de ventana |

Las tres están en Google Fonts → se mantiene **un único `<link>`** en `index.html` (se reemplazan familias, no se añaden pesos: sigue cumpliendo §15.9 de `AGENTS.md`). Alternativa documentada si se quiere un aire más «fashion»: `Switzer`/`Satoshi` (Fontshare, segundo host).

## 2. Diagnóstico medido (lo que se arregla)

| Métrica | Valor | Problema |
| --- | --- | --- |
| Literales `hsl(<n>…)` fuera del pipeline | **145** | bypass del sistema de tokens |
| Literales `#hex` | **27** | idem |
| Utilidades `rounded-*` literales | **117** | la escala de radios existe y se ignora |
| `clamp()` distintos | **12** | cada sección inventa su escala; no hay escala tipográfica |
| Usos de `text-muted-foreground` | **59** | `230 15% 65%` sobre `230 35% 5%` ≈ **4.2:1** → falla AA |
| Recetas de «glass» | **6** | `.glass`, `.glass-strong`, `.liquid-glass`, `.liquid-glass-strong`, `.profile-card`, modules |
| Dueños del ritmo vertical | **3** | `WindowChrome my-8` + chrome `p-4 md:p-6` + `SectionContainer py-12` (+ `min-h-[60vh]`) |
| Tipografía actual | Space Grotesk + Inter + Courier Prime | exactamente lo que la skill `frontend-design` prohíbe |
| `prefers-color-scheme` | **0** | sin tema claro |

**Defectos confirmados:**

- `nav.experience` → `#experience` **no existe** (Trayectoria renderiza `id="trayectoria"`): link muerto y `activeSection` nunca lo marca.
- **5 errores** de `npx tsc --noEmit -p tsconfig.app.json` (2 en `SectionContainer.tsx:39,41`, 2 en `Projects.tsx:102,104`, 1 en `PassionCard.tsx:69`).
- `id="trayectoria"` duplicado en dos `<section>` (`Trayectoria.tsx:169` y `:194`) — verificar en runtime.

## 3. Fase 1 — Fundación de tokens (todo por el pipeline)

**`semantic/typography.json`** — las tres familias + escala explícita `text-display / h1 / h2 / h3 / body / body-sm / caption / label` + tracking nombrado (`tracking-display`, `tracking-heading`, `tracking-mono`, `tracking-label`). Hoy `h1-h6` llevan `-0.04em` fijo y cada sección inventa su `clamp()`.

**`semantic/layout.json`** — escala armónica de radios (sustituye el `calc(1rem − 8px)` actual y la base `radius` sin consumidores) y `section-gap` + `section-gap-sm` como **dueño único del ritmo vertical**. Regla documentada: *radio interior = exterior − padding*.

**`semantic/colors.json`** — `muted-foreground` a contraste AA (≥4.5:1) en los 4 temas; tokens de superficie (`surface-glass*`) para que las 6 recetas de glass colapsen a **2**; tokens `icon-*` para los 4 hues literales del dock.

**Pipeline** — `scripts/build-tokens.mjs` emite lo nuevo y `src/scripts/build-tokens.test.ts` se extiende **primero** (test-first, §12 de `AGENTS.md`). Los `traffic lights` (`#ff5f57`/`#febc2e`/`#28c840`) se quedan literales y comentados: convención macOS, no marca.

## 4. Fase 2 — Barrido de literales (theme-awareness)

Sustituir los 145 + 27 por `hsl(var(--…))` en: `src/index.css` (`::selection` indigo fijo, `.glass*`, `.hover-glow`, `.liquid-glass*`, `.text-gradient` blanco→gris, `.terminal-fog`, `.dock-item-active` cian fijo, `.bg-noise`) · `Dock.tsx` + `DockItem.tsx` (cyan 190, blue 210, green 140, purple 280) · `Hero.tsx` (sombras hover 248/190) · `projects.module.css` · `Trayectoria.module.css` · `BrowserPreview.tsx` · `PhoneVideo.tsx` · `useFluidGradient.ts`.

**Efecto buscado:** en Dracula / Tokyo-Night el dock, el hover y el `::selection` dejan de ser violeta/cian indigo.

## 5. Fase 3 — Ritmo y espaciado (un solo dueño)

`.section-px` sigue siendo el dueño horizontal; se añade `.section-y` (consume `--section-gap`) como dueño vertical. `WindowChrome` deja de imponer `my-8` y `SectionContainer` deja de imponer `py-12` + `min-h-[60vh]` por defecto: el ritmo se declara una vez por sección. `Index.tsx` deja de parchear con `my-0` (hoy compensa el `my-8` del chrome) → variante explícita en vez de override de clase.

## 6. Fase 4 — Motion coreografiado + micro-interacciones

Un único patrón de revelado (duración/easing tokenizados) en vez de `whileInView amount: 0.2` repetido en cada ventana; `whileInView` reducido a ~3 momentos clave. **Specular pointer-aware** en cards (`--mx`/`--my` por CSS). `prefers-reduced-motion` respetado en todo lo nuevo (§4 de `AGENTS.md`). El scope del CRT al panel terminal queda fuera (tier 3).

## 7. Fase 5 — Ajustes por sección

**Hero**: la jerarquía la lleva la tipografía, no los gradientes; el 3D se mantiene. **Menú vs dock**: diferenciar rol visualmente — menú = barra fina de estado con labels mono; dock = apps con tratamiento de icono, magnify y punto activo. **TechBento**: bento asimétrico real (celda featured a 2 columnas + satélites), un solo tratamiento de icono, fuera el shine sweep. **Trayectoria**: se mantiene el pin horizontal (es esencia); solo se tocan los *magic numbers* si el coste es bajo.

## 8. Fase 6 — Borrado de «Passions»

**Eliminar (11 ficheros):** `sections/ProfileShowcase.tsx` · `ProfileDeck.tsx` · `PassionCard.tsx` · `ProfileSectionHeader.tsx` · `ui/MobilePassionCard.tsx` · `ui/PassionArt.tsx` · `PassionArt.test.tsx` · `lib/profile-content.ts` · `profile-content.test.ts` · `lib/passion-data.ts` · `passion-data.test.ts`

**Editar (6 puntos que rompen si se olvidan):**

1. `pages/Index.tsx` — quitar import y la ventana `~/passions.md` (`id="profile"`); el orden pasa de 8 a 7 secciones.
2. `Nav.tsx` — quitar el link `nav.profile` **y re-anclar `computeThreshold()`**: hoy lee `#profile`; sin él cae al fallback `return 500` y el menú aparecería a los 500px. Re-anclar a `#projects`.
3. `lib/spotlight-items.ts` — quitar `"profile"` de la lista de ids (línea 16).
4. `i18n/translations.ts` — `nav.profile` + 19 claves `profile.*` **en `en` y `es`** (simetría obligatoria, §6/§15.6).
5. `index.css` — borrar el bloque `.profile-*` completo + keyframes `profile-vinyl-spin` / `profile-chef-breathe` / `profile-led-blink` y sus `@media` (~320 líneas).
6. `AGENTS.md` — §8 renumerar la composición de página; §10 fuera el bullet de `profile-content.ts`; §4 fuera `.profile-card`.

**Cierre:** cero referencias huérfanas (`grep -ri passion src/`) y ningún literal de clave visible en pantalla.

## 9. Fase 7 — Los dos defectos concretos

1. **Link muerto**: apuntar `nav.experience` a `#trayectoria` (o añadir `id="experience"` al wrapper) y corregir `allSections` para que el tracking lo detecte.
2. **Los 5 errores de `tsc`**: tipar `motionStyle` como `MotionStyle` de Framer en `SectionContainer.tsx` y `Projects.tsx`; el de `PassionCard` muere con la Fase 6. *(Opcional, 1 línea: script `"typecheck"` en `package.json`.)*

## 10. Verificación y criterio de «hecho»

Gates en orden: `npm run tokens` → `npm run lint` (**0 errores**, ≤12 warnings) → `npm test` → `npm run build` → `npx tsc --noEmit` en `tsconfig.app.json` y `tsconfig.node.json`.

Pase visual real en 375 / 768 / 1440 px, los 4 temas, EN y ES, con `prefers-reduced-motion` activo, midiendo contraste (no a ojo).

**Hecho cuando:** ningún literal visual fuera del pipeline (salvo traffic lights documentados) · un dueño del ritmo vertical · una escala tipográfica y una de radios · 2 recetas de glass · muted ≥4.5:1 · Passions sin rastro · cero anchors muertos · todos los gates en verde.

## 11. Fuera de alcance (deliberado)

**Tier 2:** code-splitting de three/gsap/framer · quitar `@tanstack/react-query` y `@react-three/postprocessing` no usados · gating de WebGL por `shouldUseFallback` · doble `<img>` del LCP · self-host de fuentes.
**Tier 3:** hero generativo con shader reactivo al tema · tema claro real + `prefers-color-scheme` · CRT restringido al terminal · reescritura vertical de Trayectoria · backend del formulario.

## 12. Riesgos

- **Cambio de familias tipográficas** = mayor riesgo de regresión visual (métricas distintas, CLS). Mitigación: tokens primero, `font-display: swap` ya presente, revisión a los 3 anchos antes de tocar secciones.
- Subir `muted-foreground` puede apagar la jerarquía → separar `--text-secondary` de los labels mono pequeños si hace falta.
- El borrado de Passions toca i18n y CSS a la vez → commit propio y aislado para poder revisarlo o revertirlo solo.
- `id="trayectoria"` duplicado podría ser HTML inválido → se confirma en runtime antes de decidir si se toca.

## 13. Estrategia de commits (en `pulido-web`)

Atomic commits por fase, estilo del repo (`docs:` / `feat:` / `fix:` / `refactor:`): (1) este plan, (2) fundación de tokens + pipeline, (3) barrido de literales, (4) ritmo y espaciado, (5) motion + specular, (6) ajustes por sección, (7) borrado de Passions, (8) defectos del nav y `tsc`, (9) docs. Sin push ni PR salvo petición explícita.

---

## Registro de ejecución

### Fase 1 — Fundación de tokens · COMPLETA

**Estructura resultante del pipeline** (el motor separado de su I/O, para que las
fases siguientes crezcan aquí y no en un fichero único):

| Módulo | Responsabilidad |
| --- | --- |
| `scripts/tokens-core.mjs` | Motor puro: `flatten`, `resolveAliases`, `buildTokenModel` (reducción a defaults + mapas por tema), política de emisión (`emitCSS`/`emitTS`/`emitFlat`) y matemática de contraste. Sin filesystem, sin logging. |
| `scripts/tokens-sources.mjs` | Frontera de IO: dónde viven las fuentes y en qué orden cargan (`tokens.index.json`). Único dueño del *load order*, compartido por CLI y tests. |
| `scripts/build-tokens.mjs` | CLI fino: cargar → reducir → escribir 3 artefactos → log. |

La política de emisión dejó de estar hardcodeada token a token: cualquier clave
que empiece por un namespace propio (`radius-`, `font-`, `text-`, `tracking-`) se
copia verbatim en `@theme inline` para que Tailwind genere `rounded-*`,
`text-*`, `tracking-*` y `font-*` desde nuestros valores. Añadir un namespace es
una cadena; el emisor ya no nombra ningún token individual. Las primitivas
desaparecieron del roster de temas: los nombres salen de las propias fuentes.

**Tokens nuevos (53 → 78):** familias + escala display (`text-display/h1/h2/h3/body/body-sm/caption/label`)
+ tracking nombrado; escala de radios; `section-gap` / `section-gap-sm`;
6 tokens de superficie (`surface-glass*`) que consolidan las recetas de glass en
dos materiales; 4 tokens `icon-*` para los hues del dock.

**Desviaciones fundamentadas respecto al plan aprobado:**

1. **Escala de radios: 4/8/12/16 (sin `xl`/`2xl`).** El plan preveía hasta `24px`,
   pero `rounded-xl` vale hoy 12px (default de Tailwind, **no** un token nuestro)
   y la escala actual es **no monótona** (`xl` < `lg`): emitir 24px movería 9 usos
   reales — botones del dock de 46×46, la card de Contact, el bloque de Education,
   el popover de ThemeSwitcher y BrowserPreview. Como esta fase exige render
   equivalente, se emite la parte de la escala que preserva **exactamente** cada
   valor consumido (`sm` 8, `md` 12, `lg` 16) más `xs` 4px (sin consumidores). Los
   pasos grandes entran en la fase de barrido, cuando los literales
   `rounded-xl/2xl/3xl` (9 + 6 + 1) ya estén migrados.
2. **Fuente display: Fraunces en lugar de Instrument Serif.** 5 titulares llevan
   `font-bold` (H1 del hero, H2 de Contact/Projects/Education, H1 del 404) y dos
   reglas piden 800. Instrument Serif solo tiene 400 → negrita **sintética**.
   Fraunces es la alternativa ya contemplada en el plan, es variable
   (wght 100-900 + opsz) y mantiene la fidelidad de peso. Verificado en navegador:
   el H1 computa `Fraunces` a `700` y 72px, sin síntesis.
3. **`muted-foreground`: la cifra de la auditoría no era reproducible.** El audit
   afirmaba ≈4.2:1 en el tema por defecto; medido con la fórmula WCAG validada
   contra pares de referencia (blanco/negro 21.00 y `#767676` sobre blanco 4.54,
   ambos exactos), indigo da **7.35:1** (ya AAA). El fallo real estaba en los otros
   temas y **sobre `card`**, no sobre `background`: catppuccin 4.37, dracula 4.00,
   tokyo-night 4.38 — los tres por debajo de AA. Arreglo mínimo: subir la
   *lightness* de 55% a 60% manteniendo hue y saturación de cada tema
   (5.20 / 4.74 / 5.24 sobre card). Indigo **no se toca**: ya cumplía.

**Artefactos:** `tokens.css`, `tokens.ts` y `tokens.flat.json` regenerados
(siguen gitignored). `--radius-sm/md/lg` emiten 8/12/16px, idénticos a los
`calc(1rem − …)` anteriores; el default de Tailwind para `rounded-xl/2xl/3xl`
queda intacto, así que **el render de radios y el tema indigo no cambian**.

**Verificación ejecutada:** `npm run tokens` (78 tokens × 4 temas) · `npm test`
(16 ficheros, 84 tests: +3 del modelo/política y +3 de contraste AA) ·
`npm run lint` (0 errores, 12 warnings — paridad) · `npm run build` (OK,
7322 módulos, CSS 145.14 kB, JS idéntico). En navegador: H1 en `Fraunces` 700 a
72px, body en `IBM Plex Sans`, títulos de ventana en `IBM Plex Mono`, los 4 temas
cambiando `--muted-foreground` a 60% y `--surface-glass` resolviendo por tema vía
`var(--card)`, y **todos** los `rounded-xl` del DOM a 12px (el dock no se movió).
La URL de Google Fonts devuelve HTTP 200 con exactamente los pesos usados.

**Defectos observados y NO tocados** (preexistentes, fuera de esta fase → fases 5/7):
`ImageBackground` pasa `color-interpolation-filters` y `fetchPriority` como props
DOM inválidas (2 warnings de React); `ThemeSwitcher` anida un `<button>` dentro de
otro `<button>` en el DockItem (HTML inválido); el preload de `pexels-640.webp`
no se usa. Además el DOM duplica `id` en `hero`, `about`, `projects`, `education`
y `trayectoria` (dos ramas desktop/móvil renderizadas) — pendiente de confirmar
antes de tocar nada.

### Fase 2 — Barrido de literales de color y radio · COMPLETA

**Before/after por superficie** (estilos computados, dev server, misma sonda en
indigo y dracula; lo que no cambia era el objetivo — solo el ajuste AA de Fase 1):

| Superficie | Before (idéntico en todos los temas) | After |
| --- | --- | --- |
| Dock: LinkedIn / Email / Resume / Terminal | `rgb(71,158,245)` / `rgb(92,214,133)` / `rgb(204,123,244)` / cian fijo — 4 hues congelados | indigo `rgb(71,158,245)`/`rgb(92,214,133)`/`rgb(204,123,244)`/`rgb(56,218,250)`; dracula `rgb(228,103,145)`/`rgb(97,209,134)`/`rgb(172,97,209)`/`rgb(97,209,134)`; catppuccin y tokyo-night también repintados (mediados) |
| `.glass` (bento, Contact, CRT toggle) | `rgba(18,20,33,0.45)` azul-negro en los 4 temas | sigue `var(--card)`-based: dracula `rgba(50,39,53,.45)`, indigo `rgba(14,16,27,.45)` — ahora **por tema** |
| `.glass-strong` (todas las WindowChrome + Trayectoria) | `rgba(21,24,40,0.6)` fijo | indigo `rgba(14,16,27,0.6)`, dracula `rgba(50,39,53,0.6)` |
| `::selection` | `rgba(111,90,246,0.4)` fijo (dracula inclusive) | regla `hsl(var(--primary)/0.4)` — dracula selecciona rosa |
| `.dock-item-active` + dot | glow cian `190 95% 60%` fijo | `hsl(var(--accent) / …)` — dracula lo pinta verde |
| Radios del dock / DockItem | 12px | 12px (sin mover el render) |

**Tokens nuevos (78 → 85):** `icon-linkedin/mail/resume` con overrides por tema
(catppuccin 200/160/320, dracula 340/140/280, tokyo-night 230/100/320);
`neutral-tint`/`neutral-scrim`; `gradient-text-from/-to`; `shadow-dock`,
`shadow-dock-item`; `radius-full` (9999px). `surface-glass*` realineado a sus
consumidores reales (`.glass` = 24px/160%/0.45, `.glass-strong` = 32px/180%/0.6,
antes invertidos) y `--projects-stage-h` movido de un `:root` de CSS module al
pipeline.

**Arquitectura del barrido:**

- **Política de emisión por forma, no por lista** (`tokens-core.mjs`): un token es
  direccionable como color de Tailwind exactamente cuando su valor es un triple
  HSL crudo (`isRawTriple`). Los rosters `COLOR_ALIASES`/`SIDEBAR_ALIASES`
  desaparecieron: `icon-*`, `neutral-*`, `mesh-*`, `gradient-text-*` emiten
  `--color-*` automáticamente y es estructuralmente imposible envolver un token
  compuesto (`--surface-glass: hsl(var(--card)/0.45)`) en un `hsl(hsl(...))`
  inválido. `shadow-*` entra en `THEME_INLINE_PREFIXES` → utilidades reales
  `shadow-dock` / `shadow-dock-item` (verificado en el CSS de `dist`).
- **Neutros:** todo `hsl(0 0% 100% / α)` → `hsl(var(--neutral-tint) / α)`,
  `hsl(0 0% 0% / α)` y `bg-black*` → `--neutral-scrim`; las utilidades
  `border-white/*`, `bg-white/*` y `ring-white/10` de componentes vivos →
  `neutral-tint`. `white`/`black` CSS, `zinc-*`/`cyan-*` (terminal) y `green-*`
  (boot) también absorbidos. Bootstrap y shadcn primitivas (`components/ui/*`)
  quedan con defaults a propósito (AGENTS §7).
- **Radios:** `xl/2xl/3xl` de componentes vivos (dock, WindowChrome, CliTerminal,
  ThemeSwitcher, TechBento, Education, BentoCard, Contact, Hero, tooltips) →
  `rounded-md/lg` de la escala; `1rem/1.25rem` y `9999px` en CSS modules →
  `var(--radius-lg)`/`var(--radius-full)`. Sin consumidores reales de 20/24/32px,
  no se inventan peldaños.
- **Dead code eliminado** (~40 literales que no había que migrar): `useFluidGradient`
  (+test), `BrowserPreview`, `PhoneVideo`, `App.css` — confirmados sin importadores.
  `chart.tsx` no se toca (primitiva shadcn, §7).
- **Traffic lights macOS conservados y comentados** (`WindowChrome` ×3+1,
  `CliTerminal` ×2) como única excepción pactada; `Hero3D` deja `#7c5cff` por
  `rgb(124 92 255)` == primary por defecto (THREE.Color necesita literal).

**Verificación:** `npm run tokens` (85 tokens × 4 temas, determinista) ·
`npm run tokens:test` 14/14 · `npm test` 15 ficheros, 71 tests (−13: test del hook
borrado) · `npm run lint` 0 errores, 11 warnings (mejora la paridad de 12) ·
`npm run build` OK (7322 módulos, CSS 156.05 kB). En navegador vía el conmutador
real: los 4 iconos del dock cambian por tema (`.text-icon-linkedin` en el class
attr y `340 70% 65%` computado en dracula), `::selection` y `.dock-item-active`
resuelven por `--primary`/`--accent`, `.glass*` por `--card`, radios del dock
intactos a 12px, CSS de `dist` contiene las utilidades `text-icon-*` y `shadow-dock`.
Residual auditado: 9 literales (traffic lights comentados ×6, fallback THREE
×3 — ambos pactados) y `#ccc`/`#fff` dentro de selectores de recharts en
`chart.tsx` (primitiva shadcn intocable). Passions y ritmo vertical intactos.

### Fase 3 — Ritmo y espaciado (un solo dueño) · COMPLETA

**Antes/Después** (estilos computados, gaps pintados entre ventanas):

| Límite | Antes | Después | Composición |
| --- | --- | --- | --- |
| about→projects | 32px | 32px | `mb-8` del hero-showcase (sin cambio) |
| projects→trayectoria | 8px | 0–8px | mb de .section-y (16) vs mt del pin-spacer GSAP (superposición de 8px por transform del pin; pintado equivalente) |
| trayectoria→education | 56px | 40px tras despin | 16 mb + 24 pb del spacer GSAP (antes 32+24) |
| education→profile | 32px | 16px | dueño único: .section-y |
| profile→contact | 32px | 16px | dueño único: .section-y |

**Estructura:** `.section-px` (horizontal, existente) + `.section-y` (vertical,
nuevo) son los dos ejes del ritmo; ambos consumen tokens. `WindowChrome` ya no
imponen margen (las variantes `my-0` parche desaparecen de Index/HeroShowcase),
`SectionContainer` perdió `py-12` + `min-h-[60vh]` (y su prop `padding`), y
Projects su copia local de ambos. El headroom anti-FOUC del fog del terminal
vive ahora en `.window-rail` (último hijo del flujo) en vez de un `pb-32` inline
en `<main>`; la suma `.section-y` + `.window-rail` = 60px ≈ 64px previos.

**Token:** `--section-gap: clamp(5rem,9vw,8rem)` → `1rem` y `--section-gap-sm` →
`0.875rem`, calibrados para reproducir el ritmo pintado heredado (32px) — la
fase exige no mover el layout; retunar el ritmo es ahora UNA edición en
`semantic/layout.json`. `.section-y` añade `scroll-margin-top:
calc(--nav-height + 8px)` para que el ancla `#projects` del nav no caiga bajo el
header fijo (verificado con `location.hash = '#projects'`: el top de la ventana
queda a 68px > 60px del nav).

**Defecto de Tailwind v4 cazado durante la fase:** un comentario CSS con la
secuencia literal `my-*/py-*` se auto-termina en la estrella-barra embebida y
la regla siguiente (`.section-y`) desaparece del bundle sin ningún error de
build. Documentado en el propio `index.css` para no re-caer.

**Gates:** tokens 85×4 · tokens:test 14/14 · test 71/71 · lint 0 errores/11
warnings · build OK. Verificación en preview del build (`vite preview`): gaps
medidos arriba, 375px y 1280px; `dist` contiene `.section-y{margin-block:
var(--section-gap); scroll-margin-top: calc(var(--nav-height,60px) + 8px)}` y
`.window-rail{margin-bottom: calc(var(--section-gap) + var(--section-gap-sm))}`.

### Fase 7 — Defectos concretos · COMPLETA

Se ejecutó primero (orden 7→6→5→4 del handoff). Tres defectos, un commit,
porque comparten raíz: el mapa de anclas de la página no coincidía con su DOM.

1. **Anchor muerto del nav:** `nav.experience` → `#trayectoria` (opción de
   riesgo 0: la clave i18n y los deep links no se tocan). Verificado con click
   real en el navegador: scroll 8661 → 6963, `#trayectoria` queda a top 0.
2. **Dos no-ops más en Spotlight, descubiertos en esta fase:** `Go to stack` y
   `Go to experience` apuntaban a ids que nada renderiza (`getElementById`
   devolvía null y el `?.` tragaba el error). Reescrito como lista explícita
   `{ key, label }` con claves reales; las labels conservan el wording bueno
   (`about` → "Go to stack", `trayectoria` → "Go to experience"). Test nuevo
   que bloquea la lista exacta de claves (regresión contra no-ops silenciosos).
3. **Ids duplicados en el DOM — confirmado como real, no falso positivo:**
   `WindowChrome` (en `Index.tsx`) y la sección interior (`Hero.tsx`,
   `SectionContainer` vía About/Education, `Projects`) emitían el mismo `id`
   de `hero`/`about`/`projects`/`education` simultáneamente en el DOM. La
   sección interior ya no lleva id: el wrapper es el dueño del ancla (y el
   `scroll-margin-top` de `.section-y` vive en él). El "duplicado" de
   `trayectoria` sí era falso positivo: las ramas desktop/móvil nunca montan
   a la vez (`useMediaQuery` condicional). Audit en DOM real:
   `duplicateIds == []`.

**tsc:** los 4 errores reales (`SectionContainer` ×2, `Projects` ×2) arreglados
tipando `motionStyle` como `MotionStyle` de framer y montándolo en
`motion.section` (un `motion.section` sin props de animación renderiza
idéntico a un `<section>`; es lo que hace el `MotionValue` legal en el
`style`). Las props muertas `id`/`innerRef` de About/Education/Projects se
fueron con ellos. Queda solo `PassionCard(69)` — muere con la Fase 6.
**`"typecheck"` script añadido** (ambos tsconfig en un comando).

**Gates:** test **72/72** (+1 spotlight) · lint 0 errores/11 warnings ·
`tsc app` solo el error heredado de PassionCard · `tsc node` limpio ·
verificación en navegador (dev server 8080): DOM sin ids duplicados, nav con
`#trayectoria`, click funcional. Commit `50646eb`.

### Fase 6 — Borrado de Passions · COMPLETA

**−1200 líneas netas** (18 ficheros: 11 borrados, 7 editados). Los 6 puntos de
rotura del plan, todos cubiertos:

1. `Index.tsx` — ventana `~/passions.md` fuera; el flujo va de education a
   contact directamente.
2. `Nav.tsx` — link `nav.profile` fuera **y** `computeThreshold()` re-anclado
   de `#profile` a `#projects` (si no, el nav habría aparecido a los 500px del
   fallback).
3. `spotlight-items.ts` — "Go to profile" fuera; el test de la Fase 7 bloquea
   ahora la lista exacta post-borrado.
4. `translations.ts` — `nav.profile` + 14 claves `profile.*` en ambos idiomas
   (simetría verificada con `rg "profile\." src/i18n` == 0).
5. `index.css` — bloque `.profile-*` completo (líneas 312–616, ~305 líneas)
   con los tres keyframes en loop y sus `@media`; el layer `utilities` cierra
   limpio (build OK).
6. `AGENTS.md` — §6 (claves), §7 (carve-out), §8 (composición 8→7, threshold,
   lista de secciones, nota `useDeviceTier`), §10 (profile-content fuera),
   §12 (tests fuera), §15.11 reescrito: el hook queda **sin consumidores** en
   disco a la espera de decisión humana (cablearlo al 3D del hero o borrarlo).

**Decisión de diseño propia — renumeración de etiquetas visibles:** las
etiquetas numeradas visibles eran 01 About · 02 Passions · 06 Education ·
07 Contact (el esquema contaba secciones que hoy no llevan label; Projects y
Trayectoria no la muestran). Con Passions muerto el índice visible habría
quedado 01/06/07. Renumerado coherente en ambos idiomas: **01 About ·
02 Education · 03 Contact**. Las claves muertas `tech/trayectoria.section_label`
("03"/"04") siguen en el fichero sin consumidor — deuda menor documentada, no
toca el render.

**Gates:** `tsc` **0 errores en ambos proyectos** (primer typecheck verde
completo del proyecto) · lint 0 errores/10 warnings (−1) · tests **50/50**
(−22: los de los 3 ficheros de test borrados) · build OK (10.9s) ·
verificación en navegador: sin ventana profile, nav con 4 links, labels
renumeradas en pantalla, transición education→contact limpia. Commit `96de391`.

### Fase 5 — Escala tipográfica consumida + ajustes por sección · COMPLETA

**La escala existía y nadie la consumía — y al consumirla se descubrió que no
estaba calibrada.** Los tokens emitidos no reproducían el render (p. ej.
`text-h2` = 28px a 768 donde el h2 de About renderizaba 48). Recalibrados
contra estilos computados medidos a 375/768/1440, con resultado **render
idéntico**: hero h1 48/72/72, h2 de sección 36/60/60, about h2 30/48/48,
h3 de cards 20 fijo, labels 12/14px a 0.3em. Los dos peldaños intermedios
(640–768) interpolan donde la utilidad vieja saltaba a discreto — documentado
en el propio token. Los aspirations de Fase 1 (`tracking-heading` −0.02em,
`tracking-label` 0.24em) se descartaron: movían el render; los valores
calibrados son −0.05em y 0.3em.

**Barrido de arbitrarios a cero:** 5× `tracking-[0.3em]` → `tracking-label`,
`tracking-[0.2em]` (periodos de Education) se une a la escala de labels
(+0.1em sobre un label de 12px, imperceptible), la regla base `h1-h6` apunta a
`var(--tracking-display)` en vez del literal −0.04em, y el título display de
TechBento (`tracking-[0.12em]` en Fraunces) pasa a **label mono**
(`text-label tracking-label`) — la tesis dice display nunca en labels.
**Consumo:** hero h1 → `text-display tracking-display`; Projects/Education h2 →
`text-h1 tracking-heading`; About h2 → `text-h2 tracking-heading`; Contact h2 →
`text-display tracking-heading`; h3 Education → `text-h3`. Los 19 `clamp()`
sueltos de secciones de titulares quedan en el pipeline; los que quedan en
CSS modules son de layout (stage del carrusel), no tipográficos.

**Decisión de diseño (§12.1 del handoff — asumida como senior):** el gradiente
blanco→gris repetido en los 5 titulares no aportaba jerarquía que la escala ya
diera; la tesis prohíbe gradientes decorativos *repetidos*. Titulares a
`foreground` sólido; **el gradiente sobrevive una sola vez, en el nombre del
hero** (momento de marca). `.text-gradient-accent` muere sin consumidores.

**Resto de la fase:**
- **Glass colapsado a 2 recetas**: `.liquid-glass` y `.liquid-glass-strong`
  (sin consumidores) eliminadas; la píldora de restaurar de `WindowChrome`
  pasa a `.glass`. Criterio del plan cumplido.
- **TechBento bento asimétrico real**: Frontend y Tools a 2 columnas (el orden
  DOM es load-bearing — si una celda de 2 col no cabe junto a un hueco de fila,
  auto-placement deja un agujero), Languages + Backend en fila. Los 4 mapas de
  accent se colapsan a 1 (el borde superior es la única pista de acento); los
  iconos de cabecera y los fallbacks Lucide van neutros (los SVG de marca ya
  llevan color). **Shine sweep fuera** (`.tech-chip` eliminado del CSS).
- **Nav mono**: labels a `font-mono text-xs tracking-mono` — el menú lee como
  barra de estado del OS y el dock conserva su tratamiento de iconos.
- **Trayectoria**: pin horizontal intacto, magic numbers sin tocar (como pide
  el plan).

**Gates:** tokens 85×4 · lint 0/10 · tests 50/50 · tsc 0/0 · build OK ·
verificación en navegador: medidas computadas idénticas en los 3 anchos,
bento sin celdas vacías en desktop y móvil (375px), nav mono en pantalla,
titulares sólidos. Commit `e9c8040`.
