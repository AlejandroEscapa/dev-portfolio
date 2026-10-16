# Hoja Continua Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar todas las ventanas (`WindowChrome`) y dejar las secciones seguidas en flujo continuo, separadas solo por divisores editoriales con folio.

**Architecture:** Recomposición en `Index.tsx` (cada chrome → `<section id>` llana) + reestructura de `HeroShowcase` (3D pegajoso sin marco) + borrado de `WindowChrome` muerto + `SectionDivider` nuevo. Anchors, Spotlight, CLI y Nav intactos porque los ids no se tocan.

**Tech Stack:** React 18 + Tailwind v4 + tokens (`section-gap`, `window-pad-y` se reutiliza como aire interior de sección) + utilidades `.rule-double`/`.folio` existentes.

**Spec:** Decisiones 2026-10-16 en el hilo (hoja total, filete+folio, fuera cerrar/minimizar). Anula el patrón chrome único y los Arcos con chromes.

## Global Constraints

- Los ids de navegación no cambian: `hero`, `about`, `projects`, `ai-workbench`, `contributions`, `formacion` (con `education`/`certifications` internas), `sidequests`, `stats`, `contact`.
- `Trayectoria` y `Projects` conservan su lógica interna (GSAP pin, carousel 3D); solo pierden el marco.
- Sin hardcodear color/radio; tokens y `prefers-reduced-motion` como siempre.
- Sin `window.addEventListener('scroll')`.

## Review Focus

- Anchor `#hero`/`#about` tras desmontar el showcase (el scroll del Nav debe caer igual).
- El 3D pegajoso sin ventana no debe romper el sticky (`lg:self-start` + altura `viewport-content` se conservan en el contenedor).
- Ventanas cerradas por defecto en tests de `WindowChrome` desaparecen con el componente; ningún test debe importar lo borrado.
- `scroll.ts` y `spotlight-items.ts` mencionan a WindowChrome en comentarios: actualizar el texto.
- Doble `section-y` colapsado: el ritmo lo da el divisor, no márgenes extra.

## File Structure

- Modificar `src/pages/Index.tsx` — 9 chromes → sections llanas + `SectionDivider` entre ellas.
- Crear `src/components/section/SectionDivider.tsx` — filete doble + folio (`01 / 09 · nombre`).
- Crear `src/components/section/SectionDivider.test.tsx` — render del folio.
- Modificar `src/components/sections/HeroShowcase.tsx` — 3D + Hero + About sin marcos, sticky conservado.
- Borrar `src/components/window/WindowChrome.tsx` + `WindowChrome.test.tsx`.
- Modificar `src/lib/scroll.ts`, `src/lib/spotlight-items.ts`, `src/components/sections/{Hero,Projects,Contact,AIWorkbench}.tsx` — solo comentarios que nombran al chrome.
- Modificar `AGENTS.md` §8 — hoja continua sustituye a chromes y Arcos.
- Reusar `src/pages/Index.anchors.test.tsx` — debe seguir verde sin cambios.

---

### Task 1: SectionDivider + recomposición de Index

**Files:**
- Create: `src/components/section/SectionDivider.tsx`
- Create: `src/components/section/SectionDivider.test.tsx`
- Modify: `src/pages/Index.tsx`
- Test: `src/pages/Index.anchors.test.tsx` (reusar, sin tocar)

**Interfaces:**
- Consumes: `.rule-double`, `.folio` de `src/index.css`.
- Produces: `<SectionDivider index={2} total={9} label="Proyectos" />` → `<div role="separator">` con filete y folio `02 / 09 · proyectos`.

- [ ] **Step 1: Escribir el test del divisor**

```tsx
it("renders folio with index and label", () => {
  render(<SectionDivider index={2} total={9} label="Proyectos" />);
  expect(screen.getByRole("separator")).toHaveTextContent("02 / 09");
  expect(screen.getByRole("separator")).toHaveTextContent("proyectos");
});
```

- [ ] **Step 2: Ejecutarlo y verlo fallar**

Run: `npm test -- src/components/section/SectionDivider.test.tsx`
Expected: FAIL con "SectionDivider no definido"

- [ ] **Step 3: Implementar `SectionDivider({index, total, label})`**

`div role="separator"` con `rule-double` arriba y folio mono debajo; `index` con `padStart(2, "0")`; sin animación (estático también con reduced-motion).

- [ ] **Step 4: Recomponer `Index.tsx`: cada chrome → `<section id className="section-y">` + divisor previo**

Orden y ids idénticos a los actuales; `formacion` conserva `education`/`certifications` internas; `stats` conserva `mx-auto max-w-5xl` interior. Quitar el import de WindowChrome.

- [ ] **Step 5: Verificar**

Run: `npm run typecheck && npm test -- src/pages/Index.anchors.test.tsx src/components/section/SectionDivider.test.tsx src/lib/spotlight-items.test.ts src/lib/cli-commands.test.ts`
Expected: PASS todo.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Index.tsx src/components/section/SectionDivider.tsx src/components/section/SectionDivider.test.tsx
git commit -m "feat: convierte secciones en hoja continua con divisores"
```

### Task 2: HeroShowcase sin marcos

**Files:**
- Modify: `src/components/sections/HeroShowcase.tsx`
- Test: visual (captura hero en dev server)

**Interfaces:**
- Consumes: `HeroScene` lazy, `Hero`, `About`, clase `viewport-content`.
- Produces: mismo grid 2fr/3fr y sticky, sin `WindowChrome`; el 3D conserva `lg:viewport-content lg:sticky lg:top-[var(--hero-pad-top)] lg:self-start`.

- [ ] **Step 1: Sustituir los 3 chromes por contenedores llanos con sus ids (`hero-3d` pasa a figura sin anchor navegable; `hero`, `about` conservan ids)**

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm test -- src/pages/Index.anchors.test.tsx src/components/sections/Hero.test.tsx`
Expected: PASS + captura del hero.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HeroShowcase.tsx
git commit -m "feat: desmonta ventanas del hero manteniendo sticky 3D"
```

### Task 3: Borrar WindowChrome muerto + actualizar comentarios y docs

**Files:**
- Delete: `src/components/window/WindowChrome.tsx`, `src/components/window/WindowChrome.test.tsx`
- Modify: `src/lib/scroll.ts`, `src/lib/spotlight-items.ts`, `src/components/sections/Hero.tsx`, `src/components/sections/Projects.tsx`, `src/components/sections/Contact.tsx`, `src/components/sections/AIWorkbench.tsx` (solo comentarios), `AGENTS.md` §8

**Interfaces:** Ninguna nueva; solo limpieza.

- [ ] **Step 1: Borrar componente y test, reescribir comentarios que lo nombran**

En `spotlight-items.ts`: "Keys MUST be real DOM ids (section wrappers in Index.tsx)".

- [ ] **Step 2: Reescribir AGENTS.md §8 (chromes → hoja continua + divisores)**

- [ ] **Step 3: Verificar suite completa**

Run: `npm run typecheck && npm test`
Expected: PASS todo (cero imports huérfanos).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: elimina WindowChrome y documenta hoja continua"
```

## Self-Review

1. **Spec coverage:** hoja total (T1+T2), folio (T1), sin cerrar/minimizar (T3 borra el componente), anchors intactos (test reusado).
2. **Step scan:** cada paso una sola cosa; sin cuerpos salvo el divisor trivial.
3. **Type consistency:** `SectionDivider({index: number, total: number, label: string})` en ambos tasks igual.
4. **Review Focus:** cada riesgo tiene pin (anchors test, sticky en captura, suite completa tras borrado, comentarios).
5. **Proportion:** plan breve frente al código que toca; bodies solo donde hace falta.

## Desviación conocida

`window-pad-y` sobrevive como aire interior de sección aunque naciera para chromes; si molesta el nombre se renombra en follow-up, no en este plan.
