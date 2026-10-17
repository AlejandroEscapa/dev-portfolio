# Auditoría de rendimiento — Portfolio (2026-10-17)

**Objetivo:** medir y explicar los "tirones" reales de la web sin tocar el diseño,
y separar el coste *medido* de la hipótesis. Es el documento de partida del plan
`docs/superpowers/plans/2026-10-17-rendimiento-portfolio.md`.

**Método:** build de producción (`npm run build`, `vite preview` en `:4173`),
Chromium del panel de preview, DPR 1.25, viewport 2048×1152. Medidas *in-page*
(PerformanceObserver `long-animation-frame`, `longtask`, rAF deltas, heap) y
microbenchmarks ejecutados dentro de la página. Donde he hecho A/B, lo digo.

---

## 1. Baseline medido

| Métrica | Valor |
| --- | --- |
| JS principal | **860,36 KB** min / **278,17 KB** gzip (2875 módulos) |
| Chunk 3D (`HeroScene`) | **1 095,53 KB** min / **300,19 KB** gzip (lazy) |
| CSS | **152,49 KB** min / **26,06 KB** gzip |
| DOM nodes | 1 025 |
| Elementos con `backdrop-filter` | **55** (27 en `about` → chips de `TechBento`; 12 en `trayectoria`) |
| Elementos con `will-change` | 15 |
| FCP / DCL | 310 ms / 115 ms (caché caliente) |
| CLS | **0,0003** (excelente; el layout no salta) |
| Frame pacing en idle | p50 11,1 ms / p95 11,2 ms a ~90 Hz |
| Frame pacing scroll completo (2.ª pasada) | p50 11,1 ms / p90 22,2 ms / **0 frames > 33 ms** |
| Heap JS en reposo | 33,1 MB estable tras GC durante 6 s |

Lectura: **en este equipo (desktop, GPU integrada decente) el scroll sostenido es
fluido**. El problema no es un bucle roto que tire 60 fps aquí, sino una *carga
base* muy alta que se come el presupuesto de un portátil o un móvil de gama
media: grano de ruido regenerado en CPU, 2 vídeos 1080p decodificando, 55
superficies con blur y ~278 KB de JS antes de pintar.

Fuente (map del bundle anterior, mismo código): gsap 368 KB, framer-motion +
motion-dom 502 KB, router 307 KB, zod 146 KB, react-hook-form 101 KB,
framer-motion, `@tanstack/query-core` 54 KB, `@floating-ui` 80 KB, sonner 33 KB,
app 288 KB (todo en KB de *fuente*, no de minificado).

---

## 2. Hallazgos, por impacto

### H1 — El grano (`Noise`) quema ~19 % de un core y 63 MB/s de basura (CRÍTICO)

`src/components/fx/Noise.tsx` construye cada refresco un `ImageData` de
1024×1024 y rellena 1 048 576 píxeles con `Math.random()`, lo sube con
`putImageData` y repite **cada `patternRefreshInterval = 6` frames de rAF**
(~15 veces/s a 90 Hz) **durante toda la sesión**, aunque el usuario esté en el
terminal o mirando el formulario.

Microbenchmark in-page (12 muestras, mismo código exacto):

```
10.6 11.2 11.3 11.7 11.7 12.4 12.7 13.1 13.5 14.6 15.4 15.5   (ms)
mediana: 12,7 ms   ·   asignación: 4,19 MB por refresco
```

→ **~190 ms de CPU por segundo** y **~63 MB/s de basura**. Medido en un desktop
rápido; en un móvil con JS 3-4× más lento es medio core y caídas de frame con
seguridad. Es el primer punto a atacar y no necesita ningún cambio visual: los
frames se pueden pre-renderizar una vez y ciclarse.

### H2 — Dos vídeos 1920×1080 en `autoplay loop` que siguen reproduciéndose fuera de pantalla (ALTO)

`ProjectCard` (desktop) monta los 3 proyectos; los 2 con vídeo llevan
`autoPlay muted loop`. Verificado con el scroll al final de la página
(`scrollY = 14836`): ambos siguen `paused: false` y avanzando (`t = 21.61 s`,
`19.75 s`) decodificando 1080p para pintar en 347×195 px.

→ Decodificación continua de 2 streams durante toda la visita. En batería y
CPU es el segundo coste más caro, y es evitable sin cambiar el look de la
sección cuando está a la vista.

### H3 — `Nav` mide 9 secciones en cada evento de scroll, sin coalescer (MEDIO-ALTO)

`src/components/Nav.tsx` registra `window.addEventListener("scroll", onScroll)`
y en cada evento hace **9 `getBoundingClientRect()`** + 3 `setState`. Con Lenis
a 90-120 Hz son ~900 lecturas de layout por segundo. Los `setState` sí rebotan
(el valor no cambia → React baila), pero las lecturas y el bucle no.

### H4 — `Dock`: re-render completo + 8 rects por cada `mousemove` sobre el rail (MEDIO)

`useDockHover` hace `querySelectorAll("[data-dock-item]")` +
`getBoundingClientRect()` por item y `setState(hoveredIdx)` en **cada**
movimiento del ratón; el `Dock` vuelve a renderizar los 9 items y Framer Motion
recalcula 9 springs. Debe coalescerse a rAF y salir antes si el índice no cambia
(los centros de los items solo cambian al expandir/colapsar o al redimensionar).

### H5 — Hover "specular": layout forzado + repintado de gradiente por evento (MEDIO)

`Certifications` (5 tarjetas), `Education` (2) y `TechBento` (3) escriben en
`pointermove` dos variables CSS sobre un `radial-gradient` de 420-560 px, y cada
escritura hace antes `getBoundingClientRect()` (lectura de layout). Un
`pointermove` puede disparar 100-200 veces/s; sin rAF se recalcula estilo y se
repinta el gradiente muchas más veces de las que el ojo puede ver.

### H6 — `backdrop-filter` masivo: 55 superficies (MEDIO, dependiente de GPU)

27 chips de `TechBento` con `backdrop-blur-sm`, 9 tarjetas + CTA de
`Trayectoria` con `--surface-glass-elevated-blur`, `cardBody` de proyectos con
`blur(28px) saturate(200%)` dentro de tarjetas con `rotateY` y
`will-change: transform, opacity` permanente, más dock, nav, terminal-fog y
cristales de Education/Certifications/Contact.

A/B controlado en el tramo del pin de `Trayectoria` (mismo rango de scroll,
60 px/frame, mismas condiciones, blur puesto vs. anulado):

```
con blur:    p50 11,1 ms · p90 23,7 ms
sin blur:    p50 11,1 ms · p90 23,9 ms
```

→ **En esta GPU el blur NO es el cuello de botella.** No lo toco por defecto:
solo tiene sentido degradarlo si en un dispositivo de gama baja se confirma con
traza. Queda como palanca documentada, no como tarea.

### H7 — Presupuesto de arranque: 278 KB gz + 300 KB gz del 3D (MEDIO)

Cargado y ejecutado antes de pintar:

- `zod` (146 KB) + `react-hook-form` (101 KB) + `@hookform/resolvers`, que solo
  usa el formulario de `Contact`, y **el formulario es un lanzador `mailto:` al
  final de la página**.
- `@tanstack/query-core` (54 KB): `QueryClientProvider` montado **sin un solo
  consumidor**.
- `@floating-ui` (80 KB): `TooltipProvider` montado y **ningún `Tooltip` fuera
  de `src/components/ui/`**.
- Radix `Toaster` + `hooks/use-toast`: **muerto** (el toast que se usa es
  `sonner`, vía `ui/sonner.tsx`).

Quitar los tres providers y mover el formulario a su propio chunk recorta el
bundle inicial sin tocar un píxel.

### H8 — `Trayectoria`: pin con 12 superficies de cristal y estado de React (BAJO-MEDIO)

`.track` mantiene `perspective: 1000px` (no hay ninguna transformación Z en las
tarjetas: es coste de contexto 3D puro) y un `will-change: transform`
permanente sobre una pista de ~5 000 px con 12 backdrops. El `onUpdate` de
ScrollTrigger actualiza React state (protegido con bail-out), y el componente
lee `window.matchMedia` directamente, en contra de la regla §15.7 del repo.

### H9 — Efectos de scroll solapados (BAJO)

Coexisten 4 consumidores de scroll: Lenis (+ ticker GSAP), `ScrollTrigger`,
`useScroll` de Framer en `ImageBackground` y el listener nativo de `Nav`. No es
un bug, pero el orden importa: sin `ScrollTrigger.refresh()` tras
`document.fonts.ready` los offsets del pin se calculan con las métricas de
fuente fallback y quedan desplazados hasta el primer resize.

### H10 — `ImageBackground`: `filter` full-screen + `scale`/`opacity` animados (BAJO, ya bastante bien)

El grado cine (`brightness/contrast/saturate`) se aplica a la imagen completa y
la capa se mueve con parallax. La capa ya tiene `will-change: transform` en el
wrapper, así que es una sola capa compuesta; el coste está asumido a cambio del
look. Solo lo tocaría con datos de un dispositivo débil.

---

## 3. No-hallazgos (para no "arreglar" lo que no está roto)

- **`simple-icons` NO es un problema de bundle.** Su `index.mjs` pesa 5,1 MB de
  fuente y aparece como el mayor módulo del source map, pero el árbol lo poda:
  en el bundle final queda **un solo icono** (`slug:` aparece 1 vez). No tocar.
- **Sin fugas de listeners/observers en la página montada.** Revisados y
  correctamente limpiados: `useLenis` (ticker + destroy), `Nav`, `TerminalCursor`
  (mousemove/mouseover/mouseout), `Magnetic`, `Noise` (rAF), `HoloFigure`
  (mousemove), `useCssColor` (MutationObserver), `useBootSequence` (setTimeout),
  `DecryptedText` (setInterval). El heap queda plano en 33,1 MB.
- **La "fuga de memoria" que se percibe es presión de GC**, no retención: son
  los 4,19 MB por refresco de H1 (H1 explica el síntoma).
- **CLS 0,0003** y el stage de `Projects` con altura fija: el layout no salta.
- **`useDeviceTier` + `HeroScene` hacen lo correcto**: `frameloop: "never"`
  cuando el hero sale de viewport, `demand` en el camino de fallback y `always`
  solo con motion activo. No tocar la política de render sin medir.

## 4. Riesgos residuales y cosas que no he podido cerrar

- **Stall de ~990 ms de primera pasada**: en dos trazas (LoAF) aparecen dos
  frames de ~990 ms **sin scripts atribuidos** (`scripts: []`), al primer scroll
  profundo; no se reproducen en la segunda pasada ni con el blur de
  `Trayectoria` desactivado. No lo atribuyo a un bug concreto: huele a oclusión
  del panel de preview o a la primera composición de la pista pineada. **Hay que
  confirmarlo en el navegador del usuario con el panel Performance** antes de
  abrir ninguna tarea por él.
- **LCP no medible con la sonda**: el observer siguió acumulando candidatos
  tras el scroll programático. Hay que medirlo con Lighthouse en el deploy.
- **`setTimeout` de `Projects` sin limpiar**: `handleSelect`/`handleBack` lanzan
  `window.setTimeout(…, 420)` y no lo cancelan al desmontar (cambio de ruta a
  `/nope`). Es un `setState` sobre componente desmontado, no una fuga grande,
  pero se limpia gratis.
- **Desmontaje/remontaje de la ruta**: `/nope` → `/` vuelve a montar `HeroScene`
  contra la caché de `useGLTF`; conviene verificarlo a mano (geometría
  compartida + dispose de R3F).
- **`useTheme` vive en 3 componentes** con estado independiente (dock,
  Spotlight, terminal). No es rendimiento, pero un cambio de tema dispara View
  Transition + snapshot de página completa en cada uno de los 3 caminos.

## 5. Orden de prioridad propuesto

1. **H1** grano (sin cambio visual, mayor ganancia de CPU/GC).
2. **H2** vídeos fuera de viewport / inactivos (necesita visto bueno de diseño).
3. **H3, H4, H5** handlers de scroll/pointer coalescidos (sin cambio visual).
4. **H7** providers muertos + formulario en chunk propio (sin cambio visual).
5. **H8, H9** higiene de GSAP/ScrollTrigger y del pin (sin cambio visual).
6. **H6, H10, HeroScene**: solo con datos de un dispositivo de gama baja.
