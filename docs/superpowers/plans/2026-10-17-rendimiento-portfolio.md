# Rendimiento (sin tocar diseño) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bajar la carga base del portfolio (CPU por frame, decodificación de vídeo, lecturas de layout por evento y JS inicial) sin cambiar ni un píxel del diseño.

**Architecture:** Aislar la lógica caliente en módulos puros testeables (`src/lib/*`) y dejar que los componentes solo la consuman: grano pre-renderizado en vez de regenerado, handlers de scroll/pointer coalescidos a rAF con medidas cacheadas, providers muertos fuera del árbol y el formulario de contacto en su propio chunk. Los dos únicos cambios con impacto visual posible (vídeos inactivos, degradar blur) quedan marcados **GATE** y no se ejecutan sin visto bueno.

**Tech Stack:** React 18 + TypeScript (strict off) + Vite 5 + Tailwind v4 + GSAP/ScrollTrigger + Lenis + Framer Motion 12 + Vitest 3 (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-17-auditoria-rendimiento.md` (hallazgos H1–H10 con las medidas; el plan es la ejecución de su §5).

## Global Constraints

- **Sin cambios visuales por defecto.** Cualquier paso que altere píxeles, intensidad de un brillo, cadencia visible de una animación o el estado de un vídeo en pantalla está marcado **GATE** y requiere OK explícito antes de ejecutarse.
- Nada de `tailwind.config.ts`; tokens en `src/styles/tokens/**` + `src/index.css` (AGENTS §15.1, §15.4).
- No tocar `src/styles/generated/**` ni primitivas shadcn de `src/components/ui/` (salvo `SectionContainer`, que es código propio).
- `prefers-reduced-motion` respetado en todo lo nuevo: con reduced motion no se programa ninguna rAF y los reveals quedan estáticos.
- Sin dependencias nuevas. Quitar del bundle = desmontar imports; modificar `package.json` solo con OK aparte.
- Colores, tipografías, radios y alturas solo por token o utilidad existente.
- Al cerrar **cada** tarea: `npm test`, `npm run lint` y `npm run typecheck` verdes.
- Un commit por tarea, en castellano, con el estilo del repo (`feat(perf): …`). Este plan aprobado pre-autoriza esos commits; el `push` no.
- Presupuesto de bundle objetivo tras T5+T6: JS principal ≤ **240 KB gzip** (hoy 278,17 KB).

## Review Focus

- Con `prefers-reduced-motion` activo, el grano debe seguir pintando **un** frame estático y no programar ninguna rAF; si eso se rompe, el usuario con reduced motion ve CPU quemada por una animación que no existe.
- Desmontar y volver a montar la ruta (`/` → `/nope` → `/`): ni el bucle del grano, ni los listeners de `Nav`/`Dock`, ni Lenis, ni los ScrollTrigger pueden duplicarse; la segunda visita debe medir lo mismo que la primera.
- Salto programático a `#trayectoria` (nav, Spotlight o `footer`) con el pin vivo: el destino debe seguir siendo `pin.start`, y el `refresh()` tras `document.fonts.ready` no debe desplazarlo (un refresh extra sobre una sección pineada cambia todos los offsets inferiores).
- Cambiar `prefers-reduced-motion` con la página montada (DevTools → Rendering): el grano, los reveals y el pin deben reaccionar a los valores nuevos sin quedarse congelados ni animando.
- Cambio de tema a mitad del pin (CLI `sudo theme amber`): los colores del 3D (`useCssColor`) y las superficies glass deben refrescar sin dejar la View Transition colgada ni el pin desincronizado.

## File Structure

- Crear `src/lib/grain.ts` — relleno del buffer de grano + cadencia de refresco. Único dueño de la generación de ruido.
- Crear `src/lib/nav-scroll.ts` — resolución de la sección activa y de la visibilidad del nav.
- Crear `src/lib/dock-hover.ts` — índice más cercano y escala de magnificación del rail.
- Crear `src/lib/specular.ts` — puntero local a la tarjeta, sin tocar el DOM.
- Crear `src/lib/video-playback.ts` — decisión play/pausa de un vídeo (**GATE**).
- Crear `src/lib/bundle-budget.ts` — política del presupuesto de bundle, testeable.
- Crear `src/hooks/useSpecular.ts` — handler de `pointermove` coalescido a rAF.
- Crear `src/hooks/useInViewport.ts` — `IntersectionObserver` de sección reutilizable.
- Crear `scripts/check-bundle-budget.mjs` — CLI que lee `dist/assets/*.js` y aplica el presupuesto.
- Crear `src/components/sections/contact/ContactForm.tsx` — formulario (RHF + zod) separado para poder cargarlo en diferido.
- Modificar `src/components/fx/Noise.tsx`, `src/components/Nav.tsx`, `src/hooks/useDockHover.ts`, `src/components/dock/Dock.tsx`, `src/components/sections/{TechBento,Education,Certifications}.tsx`, `src/App.tsx`, `src/components/sections/Contact.tsx`, `src/components/sections/Projects.tsx`, `src/components/sections/projects/{ProjectCard,ProjectDetail}.tsx`, `src/hooks/useLenis.ts`, `src/lib/gsap.ts`, `src/components/sections/Trayectoria.tsx`, `src/components/sections/Trayectoria.module.css`, `package.json`, `AGENTS.md`.
- Test nuevos: `src/lib/{grain,nav-scroll,dock-hover,specular,video-playback,bundle-budget}.test.ts` + `src/components/sections/Contact.test.tsx`.

---

### Task 1: Grano pre-renderizado (H1)

**Files:**
- Create: `src/lib/grain.ts`
- Create: `src/lib/grain.test.ts`
- Modify: `src/components/fx/Noise.tsx`
- Test: `src/lib/grain.test.ts`

**Interfaces:**
- Produces: `fillGrainBuffer(data: Uint8ClampedArray, alpha: number, rand?: () => number): void` — rellena un buffer RGBA con gris uniforme.
- Produces: `grainIntervalMs(refreshInterval: number, referenceFps?: number): number` — cadencia en ms; `refreshInterval` sigue significando "cada N frames de referencia".

- [ ] **Step 1: Escribir los tests**

```ts
// src/lib/grain.test.ts
import { describe, it, expect } from "vitest";
import { fillGrainBuffer, grainIntervalMs } from "./grain";

describe("fillGrainBuffer", () => {
  it("pinta gris uniforme con el alpha pedido, pixel a pixel", () => {
    const buf = new Uint8ClampedArray(12); // 3 píxeles RGBA
    let n = 0;
    fillGrainBuffer(buf, 8, () => (n++ === 0 ? 0.5 : 0));
    expect(Array.from(buf.slice(0, 4))).toEqual([128, 128, 128, 8]);
    expect(Array.from(buf.slice(4, 8))).toEqual([0, 0, 0, 8]);
    expect(Array.from(buf.slice(8, 12))).toEqual([0, 0, 0, 8]);
  });
});

describe("grainIntervalMs", () => {
  it("traduce frames de referencia (60 fps) a milisegundos", () => {
    expect(grainIntervalMs(6)).toBe(100);
    expect(grainIntervalMs(2)).toBeCloseTo(1000 / 30, 5);
  });
});
```

- [ ] **Step 2: Ejecutarlos y verlos fallar**

Run: `npm test -- src/lib/grain.test.ts`
Expected: FAIL porque `src/lib/grain.ts` no existe.

- [ ] **Step 3: Implementar `src/lib/grain.ts`**

```ts
/**
 * Grano de película: relleno del buffer y cadencia. El coste caro (1 048 576
 * píxeles con Math.random) se paga UNA vez por frame pre-renderizado; el bucle
 * solo cambia de frame con drawImage.
 */
export function fillGrainBuffer(
  data: Uint8ClampedArray,
  alpha: number,
  rand: () => number = Math.random,
): void {
  for (let i = 0; i < data.length; i += 4) {
    const value = rand() * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = alpha;
  }
}

/** `refreshInterval` medido en frames de 60 fps, como hasta ahora. */
export function grainIntervalMs(refreshInterval: number, referenceFps = 60): number {
  return (refreshInterval / referenceFps) * 1000;
}
```

- [ ] **Step 4: Refactorizar `Noise.tsx`**

Mantener la firma pública del componente y el look exacto (1024×1024, mismo
`patternAlpha`, `image-rendering: pixelated`, canvas `fixed` a viewport).
Cambios internos:

1. Al montar, crear **dos** `<canvas>` fuera de pantalla de 1024×1024 y pintar en
   cada uno un `ctx.createImageData(1024, 1024)` rellenado con `fillGrainBuffer(data, patternAlpha)` (una sola vez).
2. En el bucle de rAF, en vez de regenerar: `ctx.drawImage(frames[frameIndex], 0, 0)` alternando `frameIndex` 0/1 y **programar el siguiente refresco por tiempo** con `grainIntervalMs(patternRefreshInterval)`, no por contador de frames:

```ts
let lastDraw = -Infinity;
const loop = (now: number) => {
  if (now - lastDraw >= interval) {
    frameIndex ^= 1;
    ctx.drawImage(frames[frameIndex], 0, 0);
    lastDraw = now;
  }
  animationId = window.requestAnimationFrame(loop);
};
```

3. La rama `prefersReducedMotion` se queda como está (un único `drawImage` del
   frame 0 y sin bucle).
4. El `cleanup` sigue cancelando la rAF; añadir que también limpia las
   referencias a los canvas offscreen (`frames.length = 0`).

Nota de trade-off a dejar en el comentario del archivo: 2 frames de 1024×1024
suponen ~8,4 MB de memoria de canvas a cambio de bajar de ~190 ms/s de CPU a
~0. Si memoria aprieta, bajar a 1 frame es un cambio de una línea (pierde el
parpadeo).

- [ ] **Step 5: Verificar**

Run: `npm test -- src/lib/grain.test.ts && npm run lint && npm run typecheck`
Expected: PASS.

Verificación de coste (con `npm run build && npm run preview` y la pestaña del
preview abierta en `http://localhost:4173`): repetir el microbenchmark de la
auditoría §2 H1 dentro de la página midiendo `drawImage` sobre los frames
pre-renderizados; el refresco debe quedar **< 1 ms** (era 12,7 ms de mediana).
Capturar una captura de pantalla antes y después: el grano debe leerse igual
(mismo tamaño de grano, misma intensidad); no comparar píxel a píxel, el patrón
es aleatorio por definición.

Comprobar además que con `prefers-reduced-motion` activo (DevTools → Rendering)
el canvas pinta grano y **no** hay rAF en bucle (`window.__perf` o el panel
Performance: 0 frames de trabajo del grano).

- [ ] **Step 6: Commit**

```bash
git add src/lib/grain.ts src/lib/grain.test.ts src/components/fx/Noise.tsx
git commit -m "perf(fx): pre-renderiza el grano en vez de regenerarlo por frame"
```

---

### Task 2: Nav coalescido y con offsets cacheados (H3)

**Files:**
- Create: `src/lib/nav-scroll.ts`
- Create: `src/lib/nav-scroll.test.ts`
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Produces: `type SectionAnchor = { id: string; center: number }` — `center` es el centro **absoluto** en el documento (scrollY + rect.top + rect.height/2).
- Produces: `resolveActiveSection(anchors: readonly SectionAnchor[], viewportCenter: number, fallback?: string): string`.
- Produces: `isNavVisible(scrollY: number, threshold: number): boolean`.

- [ ] **Step 1: Escribir los tests**

```ts
// src/lib/nav-scroll.test.ts
import { describe, it, expect } from "vitest";
import { resolveActiveSection, isNavVisible } from "./nav-scroll";

const anchors = [
  { id: "projects", center: 3000 },
  { id: "trayectoria", center: 9000 },
  { id: "contact", center: 14000 },
];

describe("resolveActiveSection", () => {
  it("elige el anchor cuyo centro queda más cerca del centro del viewport", () => {
    expect(resolveActiveSection(anchors, 100)).toBe("projects");
    expect(resolveActiveSection(anchors, 8800)).toBe("trayectoria");
    expect(resolveActiveSection(anchors, 99999)).toBe("contact");
  });

  it("cae al fallback sin anchors medidos", () => {
    expect(resolveActiveSection([], 500)).toBe("hero");
    expect(resolveActiveSection([], 500, "projects")).toBe("projects");
  });
});

describe("isNavVisible", () => {
  it("solo es visible a partir del umbral", () => {
    expect(isNavVisible(99, 100)).toBe(false);
    expect(isNavVisible(100, 100)).toBe(true);
  });
});
```

- [ ] **Step 2: Ejecutarlos y verlos fallar**

Run: `npm test -- src/lib/nav-scroll.test.ts`
Expected: FAIL porque `src/lib/nav-scroll.ts` no existe.

- [ ] **Step 3: Implementar `src/lib/nav-scroll.ts`**

`resolveActiveSection` recorre `anchors` y devuelve el `id` de la menor
distancia `|center - viewportCenter|`; sin anchors devuelve el `fallback`.
`isNavVisible` es `scrollY >= threshold`. Sin DOM, sin estado.

- [ ] **Step 4: Reescribir el efecto de `Nav.tsx`**

Mantener exactamente el comportamiento visible (nav oculto hasta 100 px antes
de `#projects`, enlace activo según el centro del viewport, `scrolled` a partir
de 40 px) y quitar las 9 `getBoundingClientRect()` por evento:

1. Un `useRef` con los anchors y otro con el umbral.
2. `measure()`: recalcula `threshold` con `computeThreshold()` y los anchors
   desde `document.getElementById(id).getBoundingClientRect()` (una vez, no por
   evento). Se llama al montar, en `resize` **y** en el evento `refresh` de
   `ScrollTrigger` (ya está suscrito: conservarlo).
3. `onScroll`: guarda `scrollY` en una ref y programa **una sola** rAF si no hay
   una pendiente:

```ts
const pending = useRef(false);
const onScroll = () => {
  if (pending.current) return;
  pending.current = true;
  requestAnimationFrame(() => {
    pending.current = false;
    const y = window.scrollY;
    setScrolled(y > 40);
    setVisible(isNavVisible(y, threshold.current));
    setActiveSection(resolveActiveSection(anchors.current, window.innerHeight / 2));
  });
};
```
4. El listener de `scroll` sigue siendo `{ passive: true }` y se limpia igual.

- [ ] **Step 5: Verificar**

Run: `npm test -- src/lib/nav-scroll.test.ts && npm test && npm run lint && npm run typecheck`
Expected: PASS. La suite completa incluye `src/pages/Index.anchors.test.tsx`.

En el preview: scrollear a mano y comprobar (a) el nav aparece justo al pasar
`#projects`, (b) el enlace activo cambia en el orden de las secciones,
(c) con el panel Performance no hay trabajo de layout por frame atribuible a
`Nav`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/nav-scroll.ts src/lib/nav-scroll.test.ts src/components/Nav.tsx
git commit -m "perf(nav): coalesce el scroll y cachea los offsets de sección"
```

---

### Task 3: Dock sin re-render por `mousemove` (H4)

**Files:**
- Create: `src/lib/dock-hover.ts`
- Create: `src/lib/dock-hover.test.ts`
- Modify: `src/hooks/useDockHover.ts`
- Modify: `src/components/dock/Dock.tsx`

**Interfaces:**
- Produces: `nearestIndex(centers: readonly number[], pointer: number): number | null` (`null` con lista vacía).
- Produces: `magnifyScale(index: number, hovered: number | null, radius?: number, step?: number): number` — misma fórmula que hoy: `hovered === null ? 0 : 1 - Math.min(radius, Math.abs(index - hovered) * step) / radius`, con `radius = 56` y `step = 26`.
- Consumes (Dock): `useDockHover("y")` sigue devolviendo `{ ref, hoveredIdx, onMouseMove, onMouseLeave }` (firma intacta).

- [ ] **Step 1: Escribir los tests**

```ts
// src/lib/dock-hover.test.ts
import { describe, it, expect } from "vitest";
import { nearestIndex, magnifyScale } from "./dock-hover";

describe("nearestIndex", () => {
  const centers = [100, 160, 220];
  it("devuelve el índice del centro más cercano al puntero", () => {
    expect(nearestIndex(centers, 90)).toBe(0);
    expect(nearestIndex(centers, 165)).toBe(1);
    expect(nearestIndex(centers, 999)).toBe(2);
  });
  it("devuelve null sin items", () => {
    expect(nearestIndex([], 10)).toBeNull();
  });
});

describe("magnifyScale", () => {
  it("es 0 sin hover y decrece con la distancia", () => {
    expect(magnifyScale(3, null)).toBe(0);
    expect(magnifyScale(3, 3)).toBe(1);
    expect(magnifyScale(4, 3)).toBeCloseTo(1 - 26 / 56, 5);
    expect(magnifyScale(9, 3)).toBe(0);
  });
});
```

- [ ] **Step 2: Ejecutarlos y verlos fallar**

Run: `npm test -- src/lib/dock-hover.test.ts`
Expected: FAIL porque `src/lib/dock-hover.ts` no existe.

- [ ] **Step 3: Implementar `src/lib/dock-hover.ts`**

Dos funciones puras con la fórmula exacta de hoy (mismos números, mismas
salidas) y sin acceso al DOM.

- [ ] **Step 4: Reescribir `useDockHover`**

1. `centersRef`: se recalcula con `querySelectorAll("[data-dock-item]")` +
   `getBoundingClientRect()` **al entrar** en el rail (`onMouseEnter`) y en
   `resize` — no en cada movimiento.
2. `onMouseMove` guarda `e.clientY` en una ref y programa una rAF si no hay
   pendiente; dentro de la rAF calcula `nearestIndex(...)` y **solo** llama a
   `setHoveredIdx` si el índice cambió.
3. `onMouseLeave` limpia el índice y marca los centros como invalidados
   (`centersRef.current = null`) para que la próxima entrada vuelva a medir.
4. Devolver también `onMouseEnter` y que `Dock.tsx` lo conecte al `motion.div`
   del rail (junto a `onMouseMove`/`onMouseLeave` que ya tiene).

- [ ] **Step 5: Usar `magnifyScale` en `Dock.tsx`**

Sustituir el cálculo inline (`1 - Math.min(RADIUS, …) / RADIUS`) por
`magnifyScale(dockIdx, hoveredIdx)`; borrar la constante `RADIUS` de `Dock.tsx`
si queda sin uso. Comportamiento idéntico.

- [ ] **Step 6: Verificar**

Run: `npm test -- src/lib/dock-hover.test.ts && npm test && npm run lint && npm run typecheck`
Expected: PASS.

En el preview: pasar el ratón por el rail y comprobar que la magnificación se
siente igual (incluido el item más lejano a 0), que al expandir/colapsar el rail
los centros se recalculan (el item bajo el puntero sigue siendo el correcto) y
que con el popover de temas abierto nada se rompe.

- [ ] **Step 7: Commit**

```bash
git add src/lib/dock-hover.ts src/lib/dock-hover.test.ts src/hooks/useDockHover.ts src/components/dock/Dock.tsx
git commit -m "perf(dock): coalesce el hover del rail y cachea los centros de los items"
```

---

### Task 4: Hover specular coalescido (H5)

**Files:**
- Create: `src/lib/specular.ts`
- Create: `src/lib/specular.test.ts`
- Create: `src/hooks/useSpecular.ts`
- Modify: `src/components/sections/TechBento.tsx`
- Modify: `src/components/sections/Education.tsx`
- Modify: `src/components/sections/Certifications.tsx`

**Interfaces:**
- Produces: `localPointer(clientX: number, clientY: number, rect: { left: number; top: number }): { x: number; y: number }` — coordenadas del puntero relativas a la tarjeta; es lo que hoy se escribe en `--mx`/`--my`.
- Produces: `useSpecular(): { onPointerMove: React.PointerEventHandler<HTMLElement> }` — escribe `--mx`/`--my` sobre `event.currentTarget` como máximo **una vez por frame**, con una sola lectura de `getBoundingClientRect()` por frame.

- [ ] **Step 1: Escribir el test**

```ts
// src/lib/specular.test.ts
import { describe, it, expect } from "vitest";
import { localPointer } from "./specular";

describe("localPointer", () => {
  it("resta el origen de la tarjeta al puntero", () => {
    expect(localPointer(340, 220, { left: 40, top: 20 })).toEqual({ x: 300, y: 200 });
  });
  it("acepta coordenadas negativas (puntero fuera de la tarjeta)", () => {
    expect(localPointer(10, 10, { left: 40, top: 20 })).toEqual({ x: -30, y: -10 });
  });
});
```

- [ ] **Step 2: Ejecutarlo y verlo fallar**

Run: `npm test -- src/lib/specular.test.ts`
Expected: FAIL porque `src/lib/specular.ts` no existe.

- [ ] **Step 3: Implementar `src/lib/specular.ts` y `src/hooks/useSpecular.ts`**

`localPointer` es la resta, sin DOM. El hook:

```ts
export function useSpecular() {
  const pending = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);
  const raf = useRef<number | null>(null);

  const onPointerMove: React.PointerEventHandler<HTMLElement> = (e) => {
    pending.current = { el: e.currentTarget, x: e.clientX, y: e.clientY };
    if (raf.current !== null) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const p = pending.current;
      if (!p) return;
      const { x, y } = localPointer(p.x, p.y, p.el.getBoundingClientRect());
      p.el.style.setProperty("--mx", `${x}px`);
      p.el.style.setProperty("--my", `${y}px`);
    });
  };

  useEffect(() => () => { if (raf.current !== null) cancelAnimationFrame(raf.current); }, []);

  return { onPointerMove };
}
```

- [ ] **Step 4: Sustituir los tres handlers inline**

En `TechBento.tsx` (3 tarjetas), `Education.tsx` (2) y `Certifications.tsx`
(5 + el slot foto-futura), borrar el bloque `onPointerMove={(e) => { const rect =
e.currentTarget.getBoundingClientRect(); …setProperty… }}` y pasar
`onPointerMove={specular.onPointerMove}` (en el caso de `Reveal`, por su prop
`onPointerMove`; el hook se instancia **una vez por componente de sección**, no
por tarjeta). El resto de clases (`specular`, `glass`, `hover-glow`) no cambian.

- [ ] **Step 5: Verificar**

Run: `npm test -- src/lib/specular.test.ts && npm test && npm run lint && npm run typecheck`
Expected: PASS.

En el preview: pasar el ratón despacio y rápido por TechBento, Education y
Certifications; el brillo debe seguir al puntero con la misma suavidad (el
`.specular::after` no cambia) y en el panel Performance no deben aparecer
`getBoundingClientRect` por cada evento de puntero.

- [ ] **Step 6: Commit**

```bash
git add src/lib/specular.ts src/lib/specular.test.ts src/hooks/useSpecular.ts \
  src/components/sections/TechBento.tsx src/components/sections/Education.tsx src/components/sections/Certifications.tsx
git commit -m "perf(fx): coalesce el brillo especular a una escritura por frame"
```

---

### Task 5: Fuera los providers muertos (H7)

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Conserva: `<Sonner />`, `<BootSequence />`, `<BrowserRouter>`, `<Spotlight>`, `<CliTerminal>`, `<Dock>`, `<CrtOverlay>`, `<CRTToggle>`, `<TerminalCursor>`.
- Elimina: `QueryClient`/`QueryClientProvider`, `Toaster` (Radix, `src/components/ui/toaster.tsx`) y `TooltipProvider`.

- [ ] **Step 1: Confirmar que están muertos**

Run: `grep -rn "use-toast\|TooltipTrigger\|TooltipContent\|useQuery\|useMutation" src --include=*.tsx --include=*.ts | grep -v "src/components/ui/\|src/hooks/use-toast.ts"`
Expected: sin resultados fuera de `src/components/ui/**` (ningún consumidor). Si aparece alguno, **parar y replantear**: este paso no se salta.

- [ ] **Step 2: Editar `App.tsx`**

Borrar los tres imports y desmontar los tres providers; `<Sonner />` se queda
(es el toast que usa `Contact` vía `toast` de `@/components/ui/sonner`). No
borrar los archivos de `src/components/ui/` (fuera del alcance): al no
importarse, dejan de entrar en el bundle.

- [ ] **Step 3: Verificar**

Run: `npm test && npm run lint && npm run typecheck && npm run build`
Expected: PASS y el log de `vite build` con el JS principal por debajo del
baseline (860,36 KB min / 278,17 KB gzip). Anotar el número exacto para
compararlo con el presupuesto de Task 8.

Comprobar en el preview: abrir el terminal, Spotlight (`⌘K`/`Ctrl+K`), cambiar
de tema y enviar el formulario (debe seguir saliendo el toast de Sonner).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "perf(app): desmonta QueryClient, Radix Toaster y TooltipProvider sin consumidores"
```

---

### Task 6: Formulario de contacto en su propio chunk (H7)

**Files:**
- Create: `src/components/sections/contact/ContactForm.tsx`
- Create: `src/components/sections/Contact.test.tsx`
- Modify: `src/components/sections/Contact.tsx`

**Interfaces:**
- Produce `ContactForm.tsx`: `export function ContactForm(): JSX.Element` — todo el `<Form {...form}>…</Form>` de hoy, con su `zodResolver`, su `onSubmit` (`mailto:`) y sus clases exactas (`inputCls`, `textareaCls`, `messageCls`).
- `Contact.tsx` conserva el `<section>`, el grid de dos columnas, la tarjeta (`div.glass` + barra de acento) y el heading; solo el interior del `<form>` pasa a ser diferido.

- [ ] **Step 1: Escribir el test del formulario**

```tsx
// src/components/sections/Contact.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";

vi.mock("@/components/ui/sonner", () => ({ toast: vi.fn() }));

import { Contact } from "./Contact";

describe("Contact", () => {
  it("monta el formulario diferido con sus tres campos", async () => {
    render(
      <LanguageProvider>
        <Contact />
      </LanguageProvider>,
    );
    expect(await screen.findByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutarlo y verlo fallar**

Run: `npm test -- src/components/sections/Contact.test.tsx`
Expected: PASS hoy (el formulario aún es síncrono) — el test entra como red de seguridad del troceado. Si falla por los `aria-label`, corregir los selectores con los textos reales de `translations.ts` antes de seguir.

- [ ] **Step 3: Extraer `ContactForm.tsx`**

1. Cortar el bloque del formulario (desde `<Form {...form}>` hasta `</Form>`) a
   `src/components/sections/contact/ContactForm.tsx`, con `useForm`,
   `zodResolver` y `onSubmit` incluidos.
2. El esquema deja de recrearse en cada render:

```ts
const createSchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().min(2, t("contact.form_error_name")),
    email: z.string().email(t("contact.form_error_email")),
    message: z.string().min(10, t("contact.form_error_message")),
  });
// dentro del componente:
const schema = useMemo(() => createSchema(t), [t]);
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", message: "" } });
```

- [ ] **Step 4: Diferir el import en `Contact.tsx`**

```tsx
const ContactForm = lazy(() => import("./contact/ContactForm").then((m) => ({ default: m.ContactForm })));
```

Dentro de la tarjeta, `Suspense` con un fallback que **ocupa exactamente la misma
caja** (es lo que garantiza CLS 0), sin texto ni spinner:

```tsx
<Suspense fallback={<ContactFormSkeleton />}>
  <ContactForm />
</Suspense>
```

```tsx
/** Placeholder con la geometría exacta del formulario real: inputs h-11,
    textarea min-h-[80px], el mismo grid y el mismo padding. */
function ContactFormSkeleton() {
  return (
    <div className="grid gap-5 p-6 md:p-8" aria-hidden="true">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="h-11 rounded-md border border-neutral-tint/10" />
        <div className="h-11 rounded-md border border-neutral-tint/10" />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-[1fr_auto]">
        <div className="min-h-[80px] rounded-md border border-neutral-tint/10" />
        <div className="min-h-[80px] w-full rounded-lg border border-neutral-tint/10 sm:w-44" />
      </div>
    </div>
  );
}
```

`Contact.tsx` deja de importar `react-hook-form`, `zod`, `@hookform/resolvers` y
`@/components/ui/form`.

- [ ] **Step 5: Verificar**

Run: `npm test -- src/components/sections/Contact.test.tsx && npm test && npm run lint && npm run typecheck && npm run build`
Expected: PASS y un chunk nuevo (`ContactForm-*.js`) en la salida de `vite build`; el JS principal debe bajar ~50-60 KB gzip respecto al baseline.

En el preview: bajar hasta Contact (el chunk carga ahí), rellenar con datos
inválidos y ver los tres mensajes de error traducidos, enviar (debe abrir el
`mailto:` y salir el toast), cambiar a ES y repetir. Comprobar que **no hay
salto de layout** al cargar (`Performance` → Layout Shifts ≈ 0).

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Contact.tsx src/components/sections/contact/ContactForm.tsx src/components/sections/Contact.test.tsx
git commit -m "perf(contact): carga el formulario en diferido y memoriza su esquema"
```

---

### Task 7 (**GATE**): Vídeos fuera de pantalla (H2)

> **GATE — requiere OK explícito.** Pausar los vídeos de las tarjetas laterales
> (opción b) congela su imagen, que hoy se ve animando dentro del carrusel: es un
> cambio visible. La opción (a) — pausar solo cuando la sección está fuera del
> viewport — no se ve y es la que este plan ejecuta por defecto. **No empezar sin
> respuesta.**

**Files:**
- Create: `src/lib/video-playback.ts`
- Create: `src/lib/video-playback.test.ts`
- Create: `src/hooks/useInViewport.ts`
- Modify: `src/components/sections/Projects.tsx`
- Modify: `src/components/sections/projects/ProjectCard.tsx`
- Modify: `src/components/sections/projects/ProjectDetail.tsx`

**Interfaces:**
- Produces: `shouldPlayVideo(args: { sectionVisible: boolean; isActive: boolean; gateIsActiveOnly?: boolean }): boolean` — con `gateIsActiveOnly` (opción b) exige además `isActive`.
- Produces: `useInViewport<T extends Element>(ref: React.RefObject<T>, options?: { rootMargin?: string }): boolean` — `false` por defecto, `true` cuando entra; sin `once`.
- Consume `ProjectCard`: prop nueva `play?: boolean` (default `true` para no cambiar nada si no se pasa).

- [ ] **Step 1: Escribir los tests**

```ts
// src/lib/video-playback.test.ts
import { describe, it, expect } from "vitest";
import { shouldPlayVideo } from "./video-playback";

describe("shouldPlayVideo", () => {
  it("en modo sección solo depende del viewport", () => {
    expect(shouldPlayVideo({ sectionVisible: true, isActive: false })).toBe(true);
    expect(shouldPlayVideo({ sectionVisible: false, isActive: true })).toBe(false);
  });
  it("en modo tarjeta activa exige ambas condiciones", () => {
    expect(shouldPlayVideo({ sectionVisible: true, isActive: false, gateIsActiveOnly: true })).toBe(false);
    expect(shouldPlayVideo({ sectionVisible: true, isActive: true, gateIsActiveOnly: true })).toBe(true);
  });
});
```

- [ ] **Step 2: Ejecutarlos y verlos fallar**

Run: `npm test -- src/lib/video-playback.test.ts`
Expected: FAIL porque `src/lib/video-playback.ts` no existe.

- [ ] **Step 3: Implementar `src/lib/video-playback.ts` y `useInViewport`**

`useInViewport` crea un `IntersectionObserver` con `{ rootMargin = "200px" }` y
desconecta en el cleanup; el stub de `IntersectionObserver` de `src/test/setup.ts`
lo cubre en jsdom.

- [ ] **Step 4: Cablearlo**

1. `Projects.tsx`: `const stageRef = useRef<HTMLDivElement>(null)` sobre
   `div.stage` y `const stageVisible = useInViewport(stageRef)`; pasar
   `sectionVisible={stageVisible}` a `ProjectsCarousel` → `ProjectCard` (o el
   booleano ya resuelto como `play`).
2. `ProjectCard.tsx`: sustituir el `autoPlay` fijo por un efecto que
   **reproduzca/pause** el vídeo sin desmontarlo:

```tsx
const videoRef = useRef<HTMLVideoElement>(null);
useEffect(() => {
  const v = videoRef.current;
  if (!v) return;
  if (play) v.play().catch(() => {});
  else v.pause();
}, [play]);
```
   quitar `autoPlay` del JSX y dejar `muted loop playsInline preload="metadata"`.
3. `ProjectDetail.tsx`: añadir la prop `sectionVisible` y pausar el vídeo cuando
   la sección no se ve, con el mismo efecto (mantener el toggle manual y su
   `isPlaying`).

- [ ] **Step 5: Verificar**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS.

En el preview con la pestaña abierta en el deploy local: comprobar en el
Projects que los dos vídeos siguen reproduciendo igual que antes (opción a) y,
al bajar al final de la página, que **ambos están en `paused: true`** y que
`currentTime` no avanza:

```js
[...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc.split('/').pop(), paused: v.paused, t: v.currentTime }))
```

Medir con el panel Performance que la decodificación de vídeo desaparece del
perfil al salir de la sección.

- [ ] **Step 6: Commit**

```bash
git add src/lib/video-playback.ts src/lib/video-playback.test.ts src/hooks/useInViewport.ts \
  src/components/sections/Projects.tsx src/components/sections/projects/ProjectCard.tsx \
  src/components/sections/projects/ProjectDetail.tsx
git commit -m "perf(projects): deja de decodificar los vídeos cuando la sección no se ve"
```

---

### Task 8: Presupuesto de bundle con guardia (H7)

**Files:**
- Create: `src/lib/bundle-budget.ts`
- Create: `src/lib/bundle-budget.test.ts`
- Create: `scripts/check-bundle-budget.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `type Budget = { pattern: string; maxGzipBytes: number }` y `evaluateBudget(entries: { path: string; gzipBytes: number }[], budgets: Budget[]): { failures: string[]; report: string[] }` — `pattern` es un `String.includes` sobre el nombre de fichero; cada entrada cuenta contra **todas** las reglas que casen.
- Produce `scripts/check-bundle-budget.mjs`: lee **todo** `dist/assets/*` (js y css), comprime con `node:zlib`, aplica los presupuestos e imprime; sale con código 1 si hay `failures`.
- Formato de fallo fijado (lo testea el módulo): `` `${path} ${gzipBytes}B gzip > ${maxBytes}B (+${excess}B)` ``.

- [ ] **Step 1: Escribir el test**

```ts
// src/lib/bundle-budget.test.ts
import { describe, it, expect } from "vitest";
import { evaluateBudget } from "./bundle-budget";

describe("evaluateBudget", () => {
  const budgets = [{ pattern: "index-", maxGzipBytes: 1000 }];
  it("pasa cuando todo entra en presupuesto", () => {
    const r = evaluateBudget([{ path: "assets/index-abc.js", gzipBytes: 900 }], budgets);
    expect(r.failures).toEqual([]);
    expect(r.report[0]).toContain("index-abc.js");
  });
  it("falla con el desvío en bytes", () => {
    const r = evaluateBudget([{ path: "assets/index-abc.js", gzipBytes: 1300 }], budgets);
    expect(r.failures).toHaveLength(1);
    expect(r.failures[0]).toContain("index-abc.js");
    expect(r.failures[0]).toContain("(+300B)");
  });
  it("ignora los ficheros sin presupuesto", () => {
    expect(evaluateBudget([{ path: "assets/other.js", gzipBytes: 99999 }], budgets).failures).toEqual([]);
  });
});
```

- [ ] **Step 2: Ejecutarlo y verlo fallar**

Run: `npm test -- src/lib/bundle-budget.test.ts`
Expected: FAIL porque `src/lib/bundle-budget.ts` no existe.

- [ ] **Step 3: Implementar el módulo y el script**

Presupuestos iniciales (ajustar con el número real medido tras Task 5 y 6, y
dejar el listón justo por encima de lo medido, no holgado):

```js
// scripts/check-bundle-budget.mjs
const budgets = [
  { pattern: "index-", maxGzipBytes: 240 * 1024 },  // JS principal
  { pattern: "HeroScene-", maxGzipBytes: 320 * 1024 },
  { pattern: ".css", maxGzipBytes: 30 * 1024 },
];
```

Añadir a `package.json`: `"perf:budget": "node scripts/check-bundle-budget.mjs"`.
**No** engancharlo a `build` ni a `prebuild` (un presupuesto que rompe el deploy
en Vercel es peor que un presupuesto que se consulta).

- [ ] **Step 4: Verificar**

Run: `npm run build && npm run perf:budget && npm test && npm run lint`
Expected: el informe lista cada bundle con su gzip y el presupuesto; sin
`failures` (salida 0). Si `index-` falla, es que T5/T6 aún no están aplicadas: no
subir el presupuesto para taparlo.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bundle-budget.ts src/lib/bundle-budget.test.ts scripts/check-bundle-budget.mjs package.json
git commit -m "chore(perf): añade presupuesto de bundle verificable"
```

---

### Task 9: Higiene de ScrollTrigger y del pin (H8, H9)

**Files:**
- Modify: `src/lib/gsap.ts`
- Modify: `src/hooks/useLenis.ts`
- Modify: `src/components/sections/Trayectoria.tsx`
- Modify: `src/components/sections/Trayectoria.module.css`

**Interfaces:**
- Conserva: `useLenis()` sin argumentos y `getLenis()`; `Trayectoria` sin props.
- Nuevo comportamiento interno: `ScrollTrigger.config({ ignoreMobileResize: true })` al registrar el plugin; `ScrollTrigger.refresh()` una vez tras `document.fonts.ready`.

- [ ] **Step 1: Configurar ScrollTrigger**

En `src/lib/gsap.ts`, tras `gsap.registerPlugin(ScrollTrigger)`:

```ts
// La barra de URL móvil cambia de alto sin que cambie el layout real: sin esto
// cada movimiento dispara un refresh completo de los pins.
ScrollTrigger.config({ ignoreMobileResize: true });
```

- [ ] **Step 2: Refresh tras cargar las fuentes**

En el efecto de `useLenis`, tras crear la instancia:

```ts
// Con las métricas de la fuente fallback, los offsets del pin se calculan mal
// hasta el primer resize.
if (typeof document !== "undefined" && "fonts" in document) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
```

El cleanup ya existente no cambia; no añadir suscripciones nuevas fuera de ese
efecto (el `refresh` de fuentes puede resolverse después del unmount: guardar un
flag `cancelled` y no refrescar si ya se desmontó).

- [ ] **Step 3: `Trayectoria` sin `matchMedia` suelto**

Sustituir en `DesktopTrayectoria`:

```ts
const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
useLayoutEffect(() => {
  if (reduced) return;
  … // el cuerpo actual del contexto GSAP, sin el matchMedia interno
}, [reduced]);
```

(`useMediaQuery` ya está importado en el archivo para el layout móvil.)

- [ ] **Step 4: Quitar el `perspective` inerte de `.track`**

En `Trayectoria.module.css`, borrar `perspective: 1000px;` de `.track`. No hay
ninguna transformación Z en la pista (las tarjetas solo hacen `translateY` en
hover): era contexto 3D puro para 12 superficies de cristal. Conservar
`will-change: transform` (es lo que mantiene la pista compuesta durante el pin).

- [ ] **Step 5: Verificar**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS.

En el preview: (a) recargar con la caché de fuentes vacía (DevTools → Network →
Disable cache) y comprobar que el pin arranca donde debe (el `TitleCard` entra
alineado, no desplazado); (b) saltar a `#trayectoria` desde el nav, desde
Spotlight y desde el footer: los tres deben aterrizar en el mismo punto;
(c) `ScrollTrigger.getAll().length` no debe crecer al refrescar la página ni al
redimensionar; (d) simular viewport móvil y comprobar que no hay refreshes en
bucle al mostrar/ocultar la barra de URL; (e) con el pin a mitad de recorrido,
cambiar `prefers-reduced-motion` en DevTools: el pin debe soltarse sin dejar la
pista desplazada; (f) dentro del pin, lanzar `sudo theme amber` en el terminal y
comprobar que los colores del 3D y las superficies glass refrescan y que la View
Transition no deja la página a medio snapshot (este caso está en Review Focus).

- [ ] **Step 6: Commit**

```bash
git add src/lib/gsap.ts src/hooks/useLenis.ts src/components/sections/Trayectoria.tsx src/components/sections/Trayectoria.module.css
git commit -m "perf(scroll): ajusta ScrollTrigger a fuentes cargadas y quita estados 3D inertes"
```

---

### Task 10: Limpieza de `Projects` y registro en AGENTS.md

**Files:**
- Modify: `src/components/sections/Projects.tsx`
- Modify: `AGENTS.md`

**Interfaces:**
- Sin cambios de firma. `Projects` gana un `useRef` interno para su transición.

- [ ] **Step 1: Cancelar la transición al desmontar**

En `Projects.tsx`: un `const swapTimer = useRef<number | null>(null)`, una
función `scheduleSwap(fn)` que limpia el timer previo antes de programarlo, y
`useEffect(() => () => { if (swapTimer.current !== null) window.clearTimeout(swapTimer.current); }, [])`.
`handleSelect` y `handleBack` pasan a usarlo: mismo `SWAP_MS`, mismo
comportamiento, sin `setState` sobre un componente desmontado si el usuario
cambia de ruta a mitad del flip.

- [ ] **Step 2: Verificar**

Run: `npm test && npm run lint && npm run typecheck`
Expected: PASS.

En el preview: pulsar "Ver detalles" y cambiar de ruta a `/nope` antes de los
420 ms (consola sin warnings de `setState` tras unmount); volver a `/` y
comprobar que la escena 3D y Lenis remontan una sola vez
(`ScrollTrigger.getAll().length` de vuelta al valor de la primera visita).

- [ ] **Step 3: Registrar lo nuevo en AGENTS.md**

- §8 `FX components`: describir el grano pre-renderizado (dos frames, refresco por tiempo) en lugar del generador por frame.
- §8 / `Nav`, `Dock`: una línea sobre la política de handlers coalescidos a rAF con medidas cacheadas.
- §12 `Testing`: añadir a la lista co-locada `lib/grain`, `lib/nav-scroll`, `lib/dock-hover`, `lib/specular`, `lib/video-playback`, `lib/bundle-budget` y `sections/Contact`.
- §2 `Commands`: añadir `npm run perf:budget`.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Projects.tsx AGENTS.md
git commit -m "chore(perf): limpia la transición de Projects y registra las nuevas piezas"
```

---

## Pendiente de confirmar antes de abrir nada (no es una tarea)

- El stall de ~990 ms de primera pasada que aparece en las trazas LoAF de la
auditoría (§4) **no está atribuido**. Hay que reproducirlo en el navegador del
usuario con el panel Performance; si se confirma y apunta a un componente
concreto, se abre una tarea nueva con su propia spec.

## Descartado a propósito (para que nadie lo reabra sin datos)

- **Degradar `backdrop-filter`** (chips de `TechBento`, pin de `Trayectoria`): el A/B de la auditoría (§2 H6) da p50 idéntico con y sin blur en este equipo. Solo si un dispositivo de gama baja lo confirma por traza.
- **`content-visibility: auto`** en secciones: cambia la altura de scroll mientras el contenido está colapsado, y de esa altura dependen el umbral del nav, los anchors y los offsets del pin. Riesgo alto, ganancia no medida. No.
- **`ContactShadows frames={1}` / bajar `dpr` del hero**: congela la sombra del muñeco o le quita filo. Es cambio visual y la política de render actual del `HeroScene` ya está bien (frameloop `never` fuera de pantalla).
- **`simple-icons` "barrel gigante"**: es un falso positivo; el árbol deja 1 icono. No tocar.
- **Chunks manuales de gsap/framer/router**: no reduce bytes, solo reordena cachés. Sin datos que lo justifiquen.
- **Borrar dependencias de `package.json`** (query, radix-toast, radix-tooltip, next-themes): requiere OK aparte por ser cambio de dependencias. Ojo: `next-themes` sí se usa en `src/components/ui/sonner.tsx` (primita shadcn; no se edita sin permiso).
