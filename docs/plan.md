# Plan Técnico: Fluid Scroll Atmosphere — MeshBackground v2

> **Objetivo**: Transformar el fondo de "capas discretas con cross-fade por opacidad" a un sistema de **interpolación fluida continua de colores HSL** que se perciba como un viaje lento y orgánico, tipo agua o aurora, sin cortes perceptibles.

---

## 1. Estado Actual vs Objetivo

| Aspecto | Estado Actual (v1) | Objetivo (v2) |
|---------|-------------------|---------------|
| Cambio de color | 8 capas con opacidad escalonada (plateau) | Interpolación continua HSL sin cortes |
| Sensación | Cross-fade entre estados discretos | Flujo orgánico tipo agua — un viaje lento |
| Número de estados | 8 (uno por sección) | **6 atmósferas** para reducir fragmentación |
| Palette | Hue-rotate global (rompe brand) | Color trapping estricto en palette cósmica |
| Zoom/Blur | Escala global uniforme | **Zoom + desenfoque que se acentúa al centrarse en cada sección** |
| Movimiento base | 4 blobs estáticos en loop | 6 blobs con órbita sutil y phases desfasadas |
| Parallax | Lineal simple | Curvas suaves, velocidad variable por sección |
| Mobile | Igual que desktop | Reducción de complejidad manteniendo look & feel |

---

## 2. Decisiones de Diseño

### 2.1 Concatenar Education + Footer

Education y Footer comparten la misma atmósfera de cierre (return to cosmic indigo). Se concatenan en un solo landmark (#5) para eliminar un corte innecesario. El flujo final del viaje es:

```
Hero → Profile/About → TechStack → Experience → Projects → Education+Footer
  0         1              2            3            4            5
```

### 2.2 Zoom + Desenfoque por Sección

El fondo no solo cambia de color: **respira**. Cuando el usuario se centra en una sección:

- **Scale aumenta ligeramente** (1.0 → 1.12) → el gradiente se expande, dando sensación de inmersión.
- **Blur aumenta** (0px → 2-4px) → el fondo se difumina, cediendo protagonismo al contenido.
- Al **transitar entre secciones**, scale y blur vuelven a su estado base → el fondo se "enfoca" brevemente antes de entrar en la siguiente sección.

**Curva de comportamiento:**

```
Scale/Blur
    ▲
 1.12│      ████        ████        ████
     │     ██  ██      ██  ██      ██  ██
 1.00│██████    ████████    ████████    ████████
     └──────────────────────────────────────────▶ scroll
      Hero    Profile   TechStack  Experience   ...
         ↑centro↑      ↑centro↑
```

Esto se implementa con una función sinusoidal suave (`sin(π * localProgress)`) aplicada al `scale` y `blur` del background, donde `localProgress` es la posición relativa dentro de cada sección (0 en los bordes, 1 en el centro).

### 2.3 Viaje Continuo y Lento

- **Sin plateaus** en la interpolación de color. El color se mueve constantemente.
- El `useSpring` que suaviza el scroll tiene `stiffness: 40, damping: 25, mass: 0.8` (más suave que el actual) para que los cambios sean perceptibles pero nunca bruscos.
- La interpolación HSL entre landmarks vecinos usa **easing cúbico** (`t² * (3 - 2t)`) para que el cambio de color sea más lento en los extremos y más ágil en el medio, simulando inercia.

### 2.4 Número de Blobs (Decisión propia)

Se mantienen **4 blobs** (no 6). Razón:

- 6 blobs en un fondo de gradiente interpolado generan demasiado ruido visual — el efecto "agua" requiere un canvas relativamente limpio para que la transición de color sea protagonista.
- Los 4 blobs existentes se reconfiguran con **trayectorias orbitales** (no solo drift lineal) para aportar vida sin competir con el gradiente.
- Cada blob tiene **phase distinta** (0°, 90°, 180°, 270°) para que nunca se sincronicen.
- Los blobs heredan el color del landmark activo, reforzando coherencia cromática.

---

## 3. Arquitectura Técnica

### 3.1 Flujo de Datos

```
scrollYProgress (0 → 1)
       ↓
smoothProgress (useSpring — más suave)
       ↓
  ┌────────────────────────┐
  │  useFluidGradient()    │ ← Hook custom
  │  ───────────────────── │
  │  1. findLandmarks()    │ → Encuentra los 2 vecinos más cercanos
  │  2. interpolateHSLA()  │ → Mezcla colores de cada esquina
  │  3. buildGradientCSS() │ → Genera string CSS final
  │  4. computeSectionFx() │ → Calcula scale + blur por sección
  └────────────────────────┘
       ↓
  ref.style.backgroundImage = gradientString
  ref.style.filter = blur(value)
  ref.style.transform = scale(value)
```

**Key insight:** Mutamos el DOM directamente via `ref` + `useMotionValueEvent`, sin re-renders de React. Esto garantiza 60fps porque solo actualizamos 3 propiedades CSS por frame.

### 3.2 Hook: `useFluidGradient`

```typescript
// src/hooks/useFluidGradient.ts

interface FluidAtmosphere {
  progress: number;        // 0 → 1, posición del landmark
  stops: [string, string, string, string]; // 4 HSLA corners (TL, TR, BR, BL)
  gridOpacity: number;     // 0 → 1
}

interface FluidOutput {
  backgroundImage: string;
  blur: number;            // px
  scale: number;
  gridOpacity: number;
}

function useFluidGradient(
  scrollProgress: MotionValue<number>,
  atmospheres: FluidAtmosphere[],
  isMobile: boolean
): React.RefObject<HTMLDivElement>;
```

**Algoritmo core:**

```typescript
function interpolateColor(progress: number, atmospheres: FluidAtmosphere[]): string[] {
  // 1. Encontrar los 2 landmarks vecinos
  const [lo, hi] = findNeighbors(progress, atmospheres);

  // 2. Calcular t con easing cúbico (smoothstep)
  let t = (progress - lo.progress) / (hi.progress - lo.progress);
  t = t * t * (3 - 2 * t); // smoothstep

  // 3. Para cada esquina, interpolar HSLA
  return lo.stops.map((colorA, i) => {
    const colorB = hi.stops[i];
    return lerpHSLA(colorA, colorB, t);
  });
}
```

### 3.3 Interpolación HSLA

```typescript
function lerpHSLA(a: string, b: string, t: number): string {
  // Parsea "hsl(248 90% 66% / 0.45)" → {h:248, s:90, l:66, a:0.45}
  const pa = parseHSLA(a);
  const pb = parseHSLA(b);

  // Interpolación shortest-path en hue (para no dar la vuelta al color wheel)
  let dh = pb.h - pa.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;

  const h = (pa.h + dh * t + 360) % 360;
  const s = pa.s + (pb.s - pa.s) * t;
  const l = pa.l + (pb.l - pa.l) * t;
  const alpha = pa.a + (pb.a - pa.a) * t;

  return `hsl(${h} ${s}% ${l}% / ${alpha.toFixed(2)})`;
}
```

### 3.4 Zoom + Blur por Sección (Sinusoidal)

```typescript
function computeSectionFx(progress: number, atmospheres: FluidAtmosphere[]): {
  scale: number;
  blur: number;
} {
  // Encontrar en qué sección estamos
  const [lo, hi] = findNeighbors(progress, atmospheres);
  const center = (lo.progress + hi.progress) / 2;

  // localProgress: 0 en bordes, 1 en centro de sección
  const sectionSize = hi.progress - lo.progress;
  const localProgress = 1 - Math.abs(progress - center) / (sectionSize / 2);

  // Sinusoide suave: máximo en centro, mínimo en bordes
  const envelope = Math.sin(localProgress * Math.PI);

  return {
    scale: 1 + 0.12 * envelope,     // 1.0 → 1.12 en centro
    blur: 3 * envelope,              // 0px → 3px en centro
  };
}
```

### 3.5 Blob Orbitales

Cada blob mantiene su animación `animate` de breathing, pero el **centro de su posición** se desplaza con una órbita lenta:

```typescript
// En lugar de solo parallax lineal, la posición base orbita:
const blobAngle = useTransform(smooth, [0, 1], [0, Math.PI * 0.5]); // 90° de rotación total
const blobRadius = 40; // px de órbita

const blobX = useTransform(blobAngle, (a) => Math.cos(a + phase) * blobRadius + parallaxX);
const blobY = useTransform(blobAngle, (a) => Math.sin(a + phase) * blobRadius + parallaxY);
```

Cada blob tiene su `phase` (0, π/2, π, 3π/2) para que nunca coincidan.

Los colores de los blobs también se interpolan: en el landmark 0 son `--primary`, en el 2 son `--accent`, etc. Se usa `useMotionValueEvent` para mutar el `backgroundColor` del ref del blob.

---

## 4. Las 6 Atmósferas

| # | Landmark | Progress | Stops (TL / TR / BR / BL) | Grid Opacity | Mood |
|---|----------|----------|---------------------------|-------------|------|
| 0 | **Hero** | 0.00 | `hsl(248 90% 66% / .45)` / `hsl(190 95% 60% / .35)` / `hsl(270 95% 75% / .40)` / `hsl(230 35% 5% / .40)` | 0.45 | Apertura eléctrica |
| 1 | **Profile/About** | 0.20 | `hsl(270 80% 60% / .40)` / `hsl(280 75% 55% / .35)` / `hsl(260 85% 50% / .40)` / `hsl(230 35% 5% / .40)` | 0.30 | Introspección purple |
| 2 | **TechStack** | 0.40 | `hsl(190 95% 60% / .45)` / `hsl(248 90% 66% / .35)` / `hsl(220 80% 55% / .40)` / `hsl(230 35% 5% / .40)` | 0.40 | Pulso cyan-tech |
| 3 | **Experience** | 0.60 | `hsl(260 70% 50% / .40)` / `hsl(240 65% 45% / .35)` / `hsl(280 75% 55% / .40)` / `hsl(230 35% 5% / .40)` | 0.25 | Midnight serio |
| 4 | **Projects** | 0.80 | `hsl(320 85% 65% / .45)` / `hsl(190 95% 60% / .35)` / `hsl(340 80% 60% / .40)` / `hsl(230 35% 5% / .40)` | 0.35 | Magenta creativo |
| 5 | **Edu+Footer** | 1.00 | `hsl(248 90% 66% / .40)` / `hsl(270 95% 75% / .35)` / `hsl(230 35% 5% / .40)` / `hsl(230 35% 5% / .40)` | 0.38 | Cierre cósmico |

**Nota sobre progress:** Los valores 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 son equidistantes porque las secciones tienen alturas similares. Si en QA se detecta que Hero (100vh) necesita más espacio, se ajustan a [0, 0.22, 0.40, 0.58, 0.78, 1.0].

---

## 5. Mobile Optimization

Para garantizar fluidez en mobile sin sacrificar look & feel:

| Estrategia | Desktop | Mobile (< 768px) |
|-----------|---------|------------------|
| **Blobs** | 4 con órbita | 3 (sin el 4to central) |
| **Blur radius** | 120-160px | 80-100px |
| **Blob size** | 500-700px | 300-400px |
| **Interpolación** | Cada frame (60fps) | Cada 2 frames (throttle ~30fps) |
| **Background blur** | Hasta 3px | Hasta 2px |
| **Grid** | Completo | Opacidad fija 0.2 (sin pulse) |
| **will-change** | `transform, opacity, filter` | `transform, opacity` |

**Detección de mobile:** `window.matchMedia('(max-width: 768px)')` vía hook `useMediaQuery`.

**Modo reduce-motion:** Si `prefers-reduced-motion: reduce`, se desactivan las órbitas de blobs y el blur, manteniendo solo la interpolación de color (que es sutil por naturaleza).

---

## 6. Estructura de Archivos

```
src/
├── hooks/
│   ├── useFluidGradient.ts    ← NUEVO: hook de interpolación
│   └── useMediaQuery.ts       ← NUEVO: detección de viewport
├── components/
│   └── MeshBackground.tsx     ← REFACTORIZADO: usa useFluidGradient
└── index.css                  ← SIN CAMBIOS (la .mesh-bg legacy se mantiene por compatibilidad)
```

---

## 7. Plan de Ejecución (Orden de Implementación)

### Fase 1: Data Layer
1. Definir las 6 `FluidAtmosphere` con stops HSLA.
2. Implementar `parseHSLA()` y `lerpHSLA()`.
3. Implementar `findNeighbors()`.
4. Implementar `computeSectionFx()` (scale + blur sinusoidal).
5. Implementar `buildGradientCSS()`.

### Fase 2: Hook Engine
6. Crear `useMediaQuery` hook.
7. Crear `useFluidGradient` hook con `useMotionValueEvent`.
8. Optimizar con throttle para mobile.
9. Test unitario del hook (vitest).

### Fase 3: MeshBackground Refactor
10. Reemplazar 8 capas por 1 capa con ref directo.
11. Conectar `useFluidGradient` al ref.
12. Refactorizar 4 blobs: órbitas + colores interpolados.
13. Conectar grid pulse con sectionFx.
14. Añadir `will-change` estratégico.

### Fase 4: Mobile Polish
15. Implementar renderizado condicional (3 vs 4 blobs).
16. Ajustar blur/scale ranges para mobile.
17. Testear `prefers-reduced-motion`.

### Fase 5: QA
18. `npm run lint` — sin errores nuevos.
19. `npm test` — tests pasan.
20. Visual QA: scroll rápido, scroll lento, mobile.
21. Ajuste de progress values si Hero necesita más rango.
