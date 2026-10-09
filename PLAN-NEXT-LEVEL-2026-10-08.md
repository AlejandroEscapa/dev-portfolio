# Plan de implementación: Fase 0 (purrias) + Fase 1 (sistema de motion y cursor)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar el portfolio al siguiente nivel ejecutando las dos fases
aprobadas y desbloqueadas del brainstorm: limpieza de purrias (Fase 0) y
la capa global de movimiento con cursor contextual (Fase 1).

**Architecture:** Redesign-preserve: no se toca el lenguaje visual
(desktop OS, 4 temas, Fraunces/Plex). Se formaliza el motion como sistema
sobre lo que ya existe (`src/lib/motion.ts` + tokens `--duration-*` /
`--ease-out-expo`): primitivas `Reveal`/`RevealStagger` en `fx/`,
shared-layout transition con `layoutId` en Projects, coreografía
post-boot basada en una señal de boot síncrona, y halo de cursor tras
flag de configuración, montado solo en pointer fino sin reduced-motion.

**Tech Stack:** Vite 5 + React 18 + TS, Tailwind v4 (CSS-first), Framer
Motion 12, GSAP 3 + ScrollTrigger, Lenis, Vitest 3 (jsdom).

**Spec:** `BRAINSTORM-NEXT-LEVEL-2026-10-08.md` (rondas 1 y 2 aprobadas;
de la ronda 2 solo entra en este plan Task 5 (D1). El resto de ítems ya
decididos tienen su fase asignada en la sección "Trabajo bloqueado").

## Global Constraints

- **Tokens pipeline es la única fuente**: duraciones/easings nuevos van a
  `src/styles/tokens/semantic/motion.json` + `npm run tokens`. Prohibido
  hardcodear duraciones, easings, colores o radios en componentes.
- **Reglas de `src/components/fx/`**: importar de `framer-motion` (nunca
  `motion/react`); colores solo vía tokens semánticos/props;
  `prefers-reduced-motion` degrada a estático; si algo viniera de un
  registry, procedencia en `src/lib/fx-attributions.ts`.
- **GSAP** solo desde el barrel `@/lib/gsap` y siempre dentro de
  `gsap.context(...)` conectado a un ref, con cleanup.
- Media queries en componentes: `useMediaQuery` / `useReducedMotion`
  (`src/hooks/`), nunca `window.matchMedia` directo.
- **i18n**: toda clave nueva en `src/i18n/translations.ts` se añade en
  los bloques `en` Y `es` a la vez.
- **Test-first** para cualquier helper o data-shaping nuevo (Vitest
  co-localizado, §12 del AGENTS.md del proyecto).
- No tocar `src/styles/generated/`; no crear `tailwind.config.ts`; no
  añadir pesos de fuente al `<link>` de Google Fonts.
- Git: branch por fase (`chore/next-level-fase-0`, `feat/next-level-fase-1`),
  commits en castellano, merge a `main` solo con okey explícito de
  Alejandro. Vercel auto-despliega `main`.
- Verificación de cierre de cada tarea: `npm test`, `npm run typecheck`,
  `npm run lint` (y `npm run build` al cerrar fase).

## Review Focus

1. **Usuario recurrente con hero oculto**: si el hero espera el evento de
   boot pero `portfolio-booted=1` ya existía, el evento nunca llega y el
   hero quedaría invisible. `isBooted()` debe ser síncrono en el primer
   render (Task 9, paso de test).
2. **layoutId solo en desktop**: el flip compartido no debe tocar
   `MobileProjectList`; dos vistas montadas a la vez durante la
   transición no pueden duplicar `layoutId` visibles (Task 8).
3. **Reveal above the fold**: nada de `whileInView` en contenido visible
   al cargar (columna hero / TechBento): esa zona se anima solo por la
   coreografía post-boot. `Reveal` es exclusivo de contenido bajo el
   fold (Task 6 y 7).
4. **Halo en táctil o reducido**: el halo no debe montarse jamás con
   `pointer: coarse`, con reduced-motion, ni capturar eventos
   (`pointer-events: none`); flag apagado = cero rastro en el DOM
   (Task 10).
5. **Guardia de assets en Windows**: el test debe normalizar separadores
   y el `/` inicial de las rutas públicas, o fallará en falso en este
   equipo (Task 5).

---

## FASE 0 — Purrias (branch `chore/next-level-fase-0`)

### Task 1: Reparar `cv.pdf`

**Files:**
- Create: `public/cv.pdf` (binario; fuente decidida:
  `C:\Users\Usuario\Desktop\Desarrollo\Portfolio\alejandroescapa.github.io-main\CV_TECNICO_ESPAÑOL_2026.pdf`,
  el CV del portfolio anterior)
- Modify: `src/components/dock/Dock.tsx:126-128` (eliminar el TODO al
  quedar resuelto; es parte de esta purria)

**Interfaces:**
- Consumes: nada.
- Produces: la ruta pública `/cv.pdf` sirviendo 200; Task 5 la vigila.

- [ ] **Step 1: Copiar el CV** desde la ruta fuente a `public/cv.pdf`
  (nombre exacto, minúsculas) y validar que el archivo es un PDF íntegro
  (cabecera `%PDF` y apertura visual correcta). Si el contenido está
  desactualizado respecto a la trayectoria actual, avisar a Alejandro
  antes de seguir: el fichero sirve, pero conviene regenerarlo pronto
  (Fase 5, B4).
- [ ] **Step 2: Eliminar el TODO de `Dock.tsx`** ya resuelto, dejando el
  handler de descarga tal cual (apunta a `/cv.pdf`).
- [ ] **Step 3: Verificación manual**: `npm run dev`, click en Resume del
  Dock → descarga del PDF real. Esperado: 200 y archivo correcto.
- [ ] **Step 4: Commit**

```bash
git add public/cv.pdf src/components/dock/Dock.tsx
git commit -m "fix: restaurar descarga del CV (cv.pdf 404)"
```

### Task 2: Purgar huérfanos (fx + hooks + dependencia)

**Files:**
- Delete: `src/components/fx/ElectricBorder.tsx`,
  `src/components/fx/magic-card.tsx`,
  `src/hooks/useScrollReveal.ts`, `src/hooks/useMousePosition.ts`
- Modify: `package.json` (desinstalar `@phosphor-icons/react`,
  `i18next` y `react-i18next` — sistema i18n propio probado, YAGNI)

**Interfaces:**
- Consumes: nada. Produces: nada (borrado puro).

- [ ] **Step 1: Demostrar que son huérfanos**:

```bash
grep -rn "ElectricBorder\|magic-card\|useScrollReveal\|useMousePosition\|phosphor\|react-i18next\|from \"i18next\"\|from 'i18next'" src --include="*.ts" --include="*.tsx" | grep -v "fx/ElectricBorder\|fx/magic-card\|hooks/useScrollReveal\|hooks/useMousePosition"
```

Esperado: cero resultados (si aparece un consumidor, PARAR y avisar a
Alejandro antes de borrar ese fichero).

- [ ] **Step 2: Borrar los 4 ficheros** y ejecutar
  `npm uninstall @phosphor-icons/react i18next react-i18next`.
- [ ] **Step 3: Verificar**: `npm test`, `npm run typecheck`,
  `npm run lint`. Esperado: todo verde.
- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: eliminar efectos y hooks huérfanos (ElectricBorder, magic-card, useScrollReveal, useMousePosition) y desinstalar phosphor e i18next"
```

### Task 3: `repomix-output.xml` fuera del tracking y `flip-check.webm` archivado

**Files:**
- Modify: `.gitignore`
- Delete (del índice): `repomix-output.xml`
- Move: `flip-check.webm` → `docs/assets/flip-check.webm`
  (NO se borra: no está en Git y la regla de irreversibles manda)

**Interfaces:**
- Consumes: nada. Produces: raíz del repo limpia de artefactos.

- [ ] **Step 1**: Añadir `repomix-output.xml` a `.gitignore` y ejecutar
  `git rm --cached repomix-output.xml` (conserva el archivo local).
- [ ] **Step 2**: `mkdir -p docs/assets && git mv` no aplica (no
  trackeado): mover con `mv flip-check.webm docs/assets/`.
- [ ] **Step 3: Verificar**: `git status` limpio de ambos artefactos;
  `npm run build` sigue verde.
- [ ] **Step 4: Commit**

```bash
git add .gitignore docs/assets/flip-check.webm
git commit -m "chore: ignorar repomix-output.xml y archivar flip-check.webm en docs/assets"
```

### Task 4: Pesos de la mono + corrección de AGENTS.md §15.9

**Files:**
- Modify: `index.html` (line 49, `<link>` de fuentes) O los componentes
  que usen mono con peso ≥600, según resultado de la auditoría
- Modify: `AGENTS.md` §15.9 (la afirmación "400/500/600/700 de las tres
  familias" es falsa para la mono: el link carga Plex Mono solo 400/500)

**Interfaces:**
- Consumes: nada.
- Produces: política de pesos mono documentada y real.

- [ ] **Step 1: Auditar uso real**:

```bash
grep -rn "font-mono" src --include="*.tsx" --include="*.css" -A1 | grep -i "600\|700\|800\|semibold\|bold\|font-\["
grep -rn "font-weight" src --include="*.css"
```

- [ ] **Step 2: Resolver según resultado**:
  - Si hay mono ≥600 (pocos casos): remapear a 500 (decisión preferida;
    los labels mono no necesitan más) y dejar el `<link>` intacto.
  - Si el diseño realmente pierde (caso excepcional): añadir 600 al link
    de Plex Mono ÚNICAMENTE, anotándolo como excepción autorizada a la
    regla de no nuevos pesos.
- [ ] **Step 3: Corregir AGENTS.md §15.9** con la realidad del link
  (Sans 400-700, Mono 400/500 [+600 si se autorizó], Fraunces variable).
- [ ] **Step 4: Verificar**: `npm run build` verde; revisión visual de
  terminal/CLI y labels mono sin negrita sintética.
- [ ] **Step 5: Commit**

```bash
git add index.html AGENTS.md src
git commit -m "fix: eliminar negritas sintéticas de Plex Mono y corregir inventario de pesos en AGENTS.md"
```

### Task 5: Guardia de assets públicos (test)

> Aprobada: es el ítem D1 de la ronda 2, decidido por delegación el
> 2026-10-09.

**Files:**
- Create: `src/scripts/public-assets.test.ts`

**Interfaces:**
- Consumes: `src/data/projects.ts` (`PROJECTS[].media.src`), constantes
  locales del test.
- Produces: fallo de `npm test` si cualquier asset referenciado no
  existe en `public/`. Es la cura sistémica del 404 de `cv.pdf`.

- [ ] **Step 1: Escribir el test que falla primero** (con `cv.pdf`
  ausente debe fallar hasta que Task 1 esté hecha en la rama; si Task 1
  ya se mergeó, pasa directamente):

```ts
// @vitest-environment node
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PROJECTS } from "@/data/projects";

const PUBLIC_DIR = join(__dirname, "../../public");
const toPublicPath = (src: string) => join(PUBLIC_DIR, src.replace(/^\//, ""));

const FIXED = [
  "/cv.pdf", "/og.png", "/logo1.svg", "/developer.ico",
  "/pexels-640.webp", "/pexels-1280.webp", "/pexels-1920.webp", "/pexels-2560.webp",
  "/3d/zoro-fanko-pop-draco.glb",
];

test("todo asset referenciado existe en public/", () => {
  const media = PROJECTS.map((p) => p.media.src);
  const missing = [...FIXED, ...media].filter((src) => !existsSync(toPublicPath(src)));
  expect(missing).toEqual([]);
});
```

(Ojo: confirmar `developer.ico` vs `favicon` real en `public/` al
implementar; el test nace de la lista §14 del AGENTS.md corregida por lo
que haya en disco.)

- [ ] **Step 2: Ejecutar** `npm test -- public-assets` → esperado: PASS
  con Task 1 aplicada (o FAIL listando exactamente lo que falte).
- [ ] **Step 3: Commit**

```bash
git add src/scripts/public-assets.test.ts
git commit -m "test: guardia de existencia de assets públicos referenciados"
```

**Cierre de Fase 0:** `npm test && npm run typecheck && npm run lint &&
npm run build` todo verde → pedir okey de Alejandro para merge a `main`.

---

## FASE 1 — Sistema de motion y cursor (branch `feat/next-level-fase-1`)

### Task 6: Primitivas `Reveal` / `RevealStagger`

**Files:**
- Create: `src/components/fx/Reveal.tsx`,
  `src/components/fx/RevealStagger.tsx`
- Test: `src/components/fx/Reveal.test.tsx`

**Interfaces:**
- Consumes: `fadeUp`, `fadeUpSm`, `stagger` de `@/lib/motion`;
  `useReducedMotion` de `@/hooks/useReducedMotion`.
- Produces:
  - `Reveal({ variant?: "fadeUp" | "fadeUpSm" = "fadeUpSm", delay?: number = 0, className?: string, children })` — wrapper `motion.div`
    con `initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}`.
  - `RevealStagger({ staggerChildren?: number = 0.08, delayChildren?: number = 0, className?: string, children })` — wrapper con la variant
    `stagger()`; los hijos usan `<Reveal>` SIN trigger propio (heredan).
  - Contrato de reduced-motion: si `useReducedMotion()` es true, ambos
    renderizan `children` en un `div` plano (sin props de motion).

- [ ] **Step 1: Test primero** (`Reveal.test.tsx`):

```ts
it("renderiza los hijos", ...); // getByText visible
it("bajo reduced-motion no aplica estado hidden", ...);
// mockear useReducedMotion → true; el wrapper no debe llevar
// initial/variants de motion (render plano)
```

- [ ] **Step 2: Ejecutar** `npm test -- Reveal` → FAIL (módulo no existe).
- [ ] **Step 3: Implementar ambos componentes** en `fx/`, importando
  `framer-motion` (regla del folder) y las variants de `@/lib/motion`.
- [ ] **Step 4: Ejecutar** `npm test -- Reveal` → PASS.
- [ ] **Step 5: Commit**

```bash
git add src/components/fx/Reveal.tsx src/components/fx/RevealStagger.tsx src/components/fx/Reveal.test.tsx
git commit -m "feat(fx): primitivas Reveal y RevealStagger sobre los tokens de motion"
```

### Task 7: Adopción bajo el fold (Education, Contact, Footer, Projects)

**Files:**
- Modify: `src/components/sections/Education.tsx` (migra de variants
  sueltas a las primitivas), `src/components/sections/Contact.tsx`,
  `src/components/Footer.tsx`, `src/components/sections/Projects.tsx`
  (entrada de la ventana, no el flip)

**Interfaces:**
- Consumes: `Reveal`/`RevealStagger` de Task 6.
- Produces: nada nuevo para terceros.

- [ ] **Step 1: Auditoría previa**: listar qué secciones usan ya
  `@/lib/motion` directamente (Education lo hace) y cuáles no tienen
  entrada animada (Footer, Contact). Anotar el resultado en el cuerpo del
  commit.
- [ ] **Step 2: Aplicar** `RevealStagger`+`Reveal` a las grillas bajo el
  fold: items de Education, bloque de Contact, datos del Footer, entrada
  del WindowChrome de Projects. PROHIBIDO aplicarlos a la columna del
  hero / TechBento (above the fold: eso es territorio de Task 9).
- [ ] **Step 3: Verificación**: `npm run dev`, scroll completo en los 4
  temas; entradas escalonadas una sola vez; con
  `prefers-reduced-motion: reduce` emulado, todo estático. `npm test` y
  `npm run lint` verdes.
- [ ] **Step 4: Commit**

```bash
git add src/components/sections src/components/Footer.tsx
git commit -m "feat: entradas escalonadas consistentes en secciones bajo el fold"
```

### Task 8: Shared-layout transition en Projects (`layoutId`)

**Files:**
- Modify: `src/components/sections/Projects.tsx`,
  `src/components/sections/projects/ProjectCard.tsx`,
  `src/components/sections/projects/ProjectDetail.tsx`,
  `src/components/sections/projects/projects.module.css` (el cross-fade
  420ms queda SOLO como fallback de reduced-motion)

**Interfaces:**
- Consumes: `useReducedMotion`.
- Produces: nada nuevo. El contrato visual: la media y el título de la
  card "vuelan" hasta su posición en la ficha de detalle (shared element).

- [ ] **Step 1: Envolver las dos vistas en `LayoutGroup`** y dar al media
  y al título de card y detalle el mismo `layoutId` por proyecto:
  `proj-media-${project.id}`, `proj-title-${project.id}` (verificar el
  campo id real en `src/data/projects.ts` al implementar). El swap sigue
  siendo una sola vista montada (`AnimatePresence mode="wait"` si hace
  falta para no duplicar ids).
- [ ] **Step 2: Ramificación reduced-motion**: con reduced-motion activo,
  se usa el cross-fade CSS actual (transición de opacidad, sin layout
  animation). `MobileProjectList` NO se toca.
- [ ] **Step 3: Verificación manual** (núcleo de la tarea): card →
  detalle → atrás en los 4 temas, móvil intacto, sin saltos de layout
  (CLS) ni parpadeos; `npm run build` verde; Lighthouse local sin
  regresión de CLS.
- [ ] **Step 4: Commit**

```bash
git add src/components/sections
git commit -m "feat(projects): transición shared-element entre card y ficha con layoutId"
```

### Task 9: Coreografía post-boot

**Files:**
- Create: `src/lib/boot-state.ts`
- Test: `src/lib/boot-state.test.ts`
- Modify: `src/hooks/useBootSequence.ts`,
  `src/components/sections/Hero.tsx` (y `HeroShowcase.tsx` solo si la
  entrada del lateral la coordina también)

**Interfaces:**
- Consumes: nada externo.
- Produces (consumido por Hero y cualquier futura coreografía):
  - `BOOTED_EVENT = "portfolio:booted"` (CustomEvent en `window`)
  - `isBooted(): boolean` — lectura SÍNCRONA de
    `localStorage["portfolio-booted"] === "1"` (crítico para usuarios
    recurrentes: ver Review Focus 1)
  - `markBooted(): void` — escribe la key y despacha `BOOTED_EVENT`
- `useBootSequence` pasa a usar `markBooted()` en sus dos caminos (fin
  natural y skip).

- [ ] **Step 1: Test primero** (`boot-state.test.ts`):

```ts
it("isBooted es false sin key y true tras markBooted", ...);
it("markBooted despacha BOOTED_EVENT", ...); // listener espía
```

- [ ] **Step 2: Ejecutar** `npm test -- boot-state` → FAIL.
- [ ] **Step 3: Implementar `boot-state.ts`** y rewirar
  `useBootSequence` (los tests existentes del hook, si los hay, deben
  seguir verdes; si el hook no tiene test, esta tarea no añade más).
- [ ] **Step 4: Hero orquestado**: el estado inicial de las animaciones
  de entrada del hero (título + CTAs; la materialización 3D queda como
  stretch opcional) se dispara cuando `isBooted()` ya es true en el
  primer render, o al recibir `BOOTED_EVENT`. Nada de delays mágicos:
  el encadenado es boot → hero.
- [ ] **Step 5: Verificación**: primera visita (localStorage limpio) →
  boot y entrada orquestada tras él; segunda visita → hero inmediato, sin
  espera; skip con click → hero entra al instante. `npm test` verde.
- [ ] **Step 6: Commit**

```bash
git add src/lib/boot-state.ts src/lib/boot-state.test.ts src/hooks/useBootSequence.ts src/components/sections/Hero.tsx
git commit -m "feat(boot): señal de arranque síncrona y entrada del hero coreografiada"
```

### Task 10: Halo de cursor tras flag

**Files:**
- Create: `src/components/fx/CursorHalo.tsx`
- Test: `src/components/fx/CursorHalo.test.tsx`,
  `src/i18n/translations.test.ts` (nuevo: simetría en/es)
- Modify: `portfolio.config.json` (`"features": { "cursorHalo": true }`),
  `src/lib/config.ts` (tipo), `src/App.tsx` (mount tras `<CRTToggle/>`),
  `src/i18n/translations.ts` (`cursor.view` / `cursor.open` en AMBOS
  bloques), `src/components/sections/projects/ProjectCard.tsx` y
  controles del carrusel (`data-cursor="view"` donde aplique)

**Interfaces:**
- Consumes: `useMotionValue`/`useSpring` de `framer-motion`;
  `useMediaQuery("(pointer: fine)")` y `useReducedMotion()` de
  `src/hooks/`; flag `config.features.cursorHalo`; `t()` de i18n.
- Produces:
  - `CursorHalo()` — renderiza el halo o `null`; no altera a nadie.
  - Contrato DOM: un `div` fijo, `pointer-events: none`,
    `mix-blend-mode: difference`, movido SOLO por `transform` vía
    motion values (jamás `useState` por mousemove).
  - Contrato contextual: delegación de eventos en `document`
    (`mouseover`/`mouseout`) leyendo `closest("[data-cursor]")`; valores
    soportados: `"view" | "open"`; sin atributo → estado reposo.
  - Puertas de montaje (todas): flag ON, `pointer: fine`, NO
    reduced-motion. Con cualquiera a NO: `null`, cero listeners.

- [ ] **Step 1: Tests primero**:

```ts
// CursorHalo.test.tsx
it("flag off → no renderiza nada", ...);
it("pointer coarse → no renderiza nada", ...);
it("reduced-motion → no renderiza nada", ...);
it("flag on + pointer fine → monta un elemento aria-hidden", ...);
// translations.test.ts
it("toda clave de en existe en es y viceversa", ...);
```

- [ ] **Step 2: Ejecutar** → FAIL.
- [ ] **Step 3: Implementar** config + tipo, claves i18n en ambos
  idiomas, componente y mount en `App.tsx`, atributos `data-cursor` en
  cards/CTAs del carrusel.
- [ ] **Step 4: Ejecutar** `npm test` → PASS; `npm run typecheck` verde.
- [ ] **Step 5: Verificación manual**: halo fluido (spring ~300/30),
  crece/etiqueta sobre cards; no aparece emulando touch ni
  reduced-motion; click y selección de texto intactos. Si a Alejandro no
  le convence en vivo: flag a `false` y fin (sin dejar rastro).
- [ ] **Step 6: Commit**

```bash
git add portfolio.config.json src/lib/config.ts src/components/fx/CursorHalo.tsx src/components/fx/CursorHalo.test.tsx src/i18n src/App.tsx src/components/sections/projects
git commit -m "feat(fx): halo de cursor contextual tras flag, solo pointer fino"
```

**Cierre de Fase 1:** suite entera verde + `npm run build` + pase visual
en los 4 temas y dos modos de motion → pedir okey de Alejandro para
merge a `main`.

---

## Trabajo bloqueado (NO está en este plan)

Ronda 2 ya decidida por delegación (2026-10-09); queda así repartida:

- **Fase 1.5** (tras Fase 1, sin input externo): A1 cambio de tema
  cinematográfico con View Transitions, A2 CTAs magnéticos en el hero,
  C2 quinto tema oculto desbloqueable por CLI. Se planifica al cerrar
  Fase 1.
- **Fase 2** (ventana experiencia real + credenciales + B1 badge de
  disponibilidad + B3 formulario de contacto real; B2 testimonios solo
  si Alejandro aporta citas reales con permiso): entra cuando entregue el
  worksheet §7 del brainstorm. Tendrá su propio plan, con
  `src/data/experience.ts` tipado + test-first según §12 del proyecto.
- **Fase 3** (ventana quién soy + C1 sound design opt-in, alcance
  mínimo: toggle en dock + sonidos de ventana/boot, apagado por
  defecto): entra con el copy de los 3 mundos.
- **Fase 4-5**: páginas de caso / multi-escena 3D / B4 CV vivo desde
  datos / D2 budget mínimo de bundle. Se planifican al cerrar Fase 2.
  D3 (smoke tests Playwright) diferida a post-Fase 2;
  D4 (Vercel Analytics) se activa al cierre de Fase 2.
- **Resuelto**: `i18next`/`react-i18next` se desinstalan en Fase 0
  (Task 2).
