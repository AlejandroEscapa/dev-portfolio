# Edición Nocturna + Ritmo Único Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar espaciado/colocación de secciones bajo un ritmo único y vestir la página como edición nocturna de periódico digital, respetando Trayectoria y Projects como estructuras especiales.

**Architecture:** Sin nuevos temas ni frameworks: utilidades CSS en `src/index.css` con tokens existentes + ajustes de composición en `Index.tsx`. Los chromes siguen siendo los recortes; el fondo cine ya existente es el papel nocturno.

**Tech Stack:** React 18 + Tailwind v4 (CSS-first) + tokens JSON (`section-gap`, `section-gap-sm`, `window-pad-y`) + framer-motion solo `transform`/`opacity`.

**Spec:** Decisiones de brainstorm en el hilo (periódico digital nocturno, patrón Arcos, chrome único con Trayectoria como excepción). Sin doc de spec separada; este plan es la fuente.

## Global Constraints

- Nunca hardcodear color, radio o `nav-height` en componentes; todo vía `src/styles/tokens/semantic/*.json` + `npm run tokens`.
- No editar `src/styles/generated/*` ni primitivas shadcn puras en `src/components/ui/`.
- Un chrome = un anchor; `Trayectoria` es la única excepción sin chrome; `Footer` sin chrome por diseño.
- i18n: toda key nueva en `en` y `es` a la vez.
- `prefers-reduced-motion` degradado en toda animación nueva.
- No `window.addEventListener('scroll')`; motion vía framer-motion/GSAP existentes.

## Review Focus

- Anchor duplicado `#ai-workbench`/`#stats` tras recomponer (Spotlight/CLI/Nav deben resolver al chrome).
- Doble gap vertical entre Projects y Workbench si ambos llevan `section-y` (el ritmo debe leerse intra-arco, no doble).
- Contraste WCAG AA del texto mono pequeño (folios, datelines) sobre fondo oscuro en los 4 temas públicos.
- `Stats` dentro de chrome no debe ensancharse a `max-w-none` como ventana grande; debe leer subordinado.
- Trailing `my-*`/`px-*` añadidos dentro de secciones que rompan `.section-y`/`.section-px` como dueños únicos.

## File Structure

- Modificar `src/pages/Index.tsx` — composición y ritmo entre arcos (dueño de `.section-y`).
- Modificar `src/index.css` — utilidades editoriales (filetes, folio, pie de foto, capitular) en `@layer utilities`.
- Modificar `src/components/sections/Hero.tsx` — mástil/dateline (solo si DECISIÓN 1 = total).
- Modificar `src/components/sections/Stats.tsx` — ancho subordinado dentro de chrome.
- Crear `src/components/sections/Masthead.tsx` — solo si DECISIÓN 1 = total (dateline + nº edición).
- Modificar `AGENTS.md` §8 — documentar arcos y ritmo.
- Test `src/pages/Index.anchors.test.tsx` — crear: asserts de anchors únicos.

---

### Task 1: Ritmo único entre secciones

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/components/sections/Stats.tsx`
- Test: `src/pages/Index.anchors.test.tsx` (crear)

**Interfaces:**
- Consumes: `.section-y` (`section-gap: 1rem`), `.section-gap-sm` (`0.875rem`), `WindowChrome({title, id, className})`.
- Produces: composición con gap completo entre arcos y gap-sm intra-arco Projects→Workbench; `#stats` único en el chrome.

- [ ] **Step 1: Escribir el test de anchors únicos**

```tsx
// src/pages/Index.anchors.test.tsx
// render de Index es pesado (3D/GSAP): test unitario sobre composición
// via query de document tras render con mocks existentes del repo.
it("exposes each navigation anchor exactly once", () => {
  const ids = ["projects", "ai-workbench", "contributions", "formacion", "sidequests", "stats", "contact"];
  ids.forEach((id) => {
    expect(document.querySelectorAll(`#${CSS.escape(id)}`).length).toBe(1);
  });
});
```

- [ ] **Step 2: Ejecutar el test y verlo fallar**

Run: `npm test -- src/pages/Index.anchors.test.tsx`
Expected: FAIL (el archivo no existe / composición sin ajustar)

- [ ] **Step 3: Ajustar `Index.tsx`: gap-sm intra-arco y chrome de Stats subordinado**

Firmas exactas: `WindowChrome title="~/stats — uptime" id="stats" className="mx-auto max-w-5xl section-y"` (subordinado, no `max-w-none`); envolver Projects+Workbench contiguos con `section-y` solo en el segundo (gap-sm intra-arco vía `mt-[var(--section-gap-sm)]` en el chrome de Workbench, nunca `my-*` en ambos).

- [ ] **Step 4: Quitar `id` residuales interiores si duplican anchors del chrome**

Solo `AIWorkbench`/`Stats` si los tuvieran; verificar con el test del paso 1.

- [ ] **Step 5: Verificar**

Run: `npm run typecheck && npm test -- src/pages/Index.anchors.test.tsx src/lib/spotlight-items.test.ts src/lib/cli-commands.test.ts`
Expected: PASS todo.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Index.tsx src/components/sections/Stats.tsx src/pages/Index.anchors.test.tsx
git commit -m "feat: unifica ritmo de secciones y anchors únicos por chrome"
```

### Task 2: Sistema editorial en CSS (filetes, folio, pie, capitular)

**Files:**
- Modify: `src/index.css`
- Test: visual (captura dev server antes/después en `#projects` y hero)

**Interfaces:**
- Consumes: tokens `--primary`, `--muted-foreground`, `--neutral-tint`, `--font-mono`, `--font-display`.
- Produces: utilidades `.rule-double`, `.folio`, `.photo-credit`, `.dropcap` usables en cualquier sección.

- [ ] **Step 1: Añadir las 4 utilidades en `@layer utilities` con tokens**

Sin hex: filete doble con `hsl(var(--neutral-tint) / 0.14)`; folio mono `0.66rem tracking 0.08em lowercase`; pie de foto mono `0.7rem muted`; capitular Fraunces `3.2em float-left`.

- [ ] **Step 2: Aplicar `.folio` a `ProjectCard` dossierMeta y `.rule-double` bajo cabeceras de 2 secciones**

Archivos: `src/components/sections/projects/projects.module.css`, `src/components/sections/Contributions.tsx`. Solo clases, sin cambiar copy ni datos.

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm test -- src/components/sections/projects/ProjectCard.test.tsx`
Expected: PASS. Más captura en `http://127.0.0.1:8080/` (`#projects`, `#contributions`).

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/components/sections/projects/projects.module.css src/components/sections/Contributions.tsx
git commit -m "feat: añade sistema editorial mínimo con tokens"
```

### Task 3: Mástil de edición nocturna (SOLO si DECISIÓN 1 = total)

**Files:**
- Create: `src/components/sections/Masthead.tsx`
- Modify: `src/components/sections/Hero.tsx` (montar mástil encima del titular)
- Modify: `src/i18n/translations.ts` (keys `masthead.*` en en+es)
- Test: `src/components/sections/Masthead.test.tsx` (crear)

**Interfaces:**
- Consumes: `t("masthead.dateline")`, fecha viva `new Date()` con `Intl.DateTimeFormat(lang)`.
- Produces: `<Masthead edition="nº 001" />` — nombre, fecha viva, `Edición nº · León`.

- [ ] **Step 1: Escribir el test del mástil**

```tsx
it("renders masthead with live dateline", () => {
  render(<LanguageProvider><Masthead edition="nº 001" /></LanguageProvider>);
  expect(screen.getByText(/nº 001/)).toBeInTheDocument();
  expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
});
```

- [ ] **Step 2: Ejecutarlo y verlo fallar**

Run: `npm test -- src/components/sections/Masthead.test.tsx`
Expected: FAIL con "Masthead no definido"

- [ ] **Step 3: Implementar `Masthead({ edition: string })` en `src/components/sections/Masthead.tsx`**

Serif Fraunces para el nombre, mono para dateline; `prefers-reduced-motion` sin animación de entrada (estático).

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm test -- src/components/sections/Masthead.test.tsx src/i18n/translations.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Masthead.tsx src/components/sections/Masthead.test.tsx src/components/sections/Hero.tsx src/i18n/translations.ts
git commit -m "feat: añade mástil de edición nocturna al hero"
```

### Task 4: Documentar arcos y ritmo en AGENTS.md

**Files:**
- Modify: `AGENTS.md` (§8 composición + regla de ritmo)

**Interfaces:**
- Consumes: nada nuevo. Produces: texto de arquitectura.

- [ ] **Step 1: Añadir regla de arcos (obra/prueba/persona/cierre) y gap intra vs entre arcos**

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: documenta patrón Arcos y ritmo único de secciones"
```

## Self-Review

1. **Spec coverage:** ritmo (Task 1), sistema editorial (Task 2), mástil nocturno (Task 3, condicional), docs (Task 4). Trayectoria/Projects intactos por diseño.
2. **Step scan:** cada paso produce una sola cosa razonable; sin cuerpos innecesarios.
3. **Type consistency:** `Masthead({edition: string})`, clases utilitarias con nombres únicos, ids de anchors en kebab ya existentes.
4. **Review Focus:** cada línea tiene su pin (test anchors Task 1; contraste mono en revisión visual Task 2; Stats subordinado Task 1; dueños únicos Task 1).
5. **Proportion:** plan más corto que el código que describe; cuerpos solo donde la firma no basta.

## DECISIONES APROBADAS 2026-10-16

- Alcance: guiños editoriales → **Task 3 DESCARTADA** (sin Masthead).
- Tono: edición nocturna (tokens intactos).
- Ritmo: Arcos con gap-sm intra-arco.
- Stats: subordinado `max-w-5xl`.
- Trayectoria: intocable.
- Ejecución: nativa en esta sesión.
