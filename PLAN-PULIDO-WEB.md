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
