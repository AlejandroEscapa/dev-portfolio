# Auditoría 2026 — dev-portfolio

**Fecha:** 2026-07-08  
**Contexto:** Análisis experto como senior React engineer + diseñador 2026 (Awwwards/FWA judge, Liquid Glass/spatial-UI era)  
**Alcance:** Arquitectura React, diseño/UX 2026, performance/build/DX

---

## Resumen Ejecutivo

Tienes una base **muy por encima** de la media de portfolios. La arquitectura de tokens (primitives → semantic → themes), el plumbing reactivo del 3D, y los guards de `prefers-reduced-motion` son trabajo de alguien que sabe. Pero hay varios problemas que, sumados, te mantienen en categoría "template muy pulido" en vez de "contender Awwwards".

**Veredicto:** Fuerte técnicamente, pero:
- La metáfora "desktop OS" está anticuada (2021) y aplicada inconsistentemente
- No hay code-splitting → three.js (~600KB) bloquea first paint para todos
- El design system se bypassa en ~30 lugares con hardcoded colors/radii
- Motion está apilado (Lenis + GSAP + Framer) y es maximalista, no coreografiado
- Hero sin "wow" — icosaedro wireframe es tutorial de 2018
- Zero AI-native touches en un portfolio de 2026
- Fallos de contraste en muted text (accesibilidad rota)

**3 cambios que más impacto tendrían:**
1. Code-split el 3D hero + secciones below-the-fold (mayor win LCP/TTI)
2. Mata boot sequence + CRT viewport, consolida 6 glasses en 2 tokens
3. Reemplaza el icosaedro por shader generativo reactivo al tema

---

## 🔴 CRÍTICO — Arreglar Ya

### 1. No hay code-splitting en ningún sitio
**Severidad:** P0 / Critical  
**Archivos:** `vite.config.ts`, `src/App.tsx`, `src/pages/Index.tsx`, `src/components/sections/HeroShowcase.tsx:30-31`

**Problema:** Cero `React.lazy`, cero `Suspense`, cero `manualChunks`. Todo entra en el bundle inicial: three.js (~600KB), gsap, framer-motion, lenis, 24 paquetes Radix, recharts, embla, cmdk... y las dos rutas. Visitantes móviles que nunca verán el 3D se bajan todo antes del primer paint.

**Fix:**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'three': ['three', '@react-three/fiber', '@react-three/drei'],
        'gsap': ['gsap', 'gsap/ScrollTrigger'],
        'framer': ['framer-motion'],
        'radix': ['@radix-ui/react-dialog', '@radix-ui/react-toast', /*...*/]
      }
    }
  }
}

// HeroShowcase.tsx
const Hero3D = React.lazy(() => import('@/components/three/Hero3D'));
// Y para Projects, Trayectoria, ProfileShowcase, Contact, NotFound
```

---

### 2. TanStack Query está montado pero no se usa
**Severidad:** P0 / Critical  
**Archivos:** `src/App.tsx:16,22`

**Problema:** `QueryClientProvider` envuelve la app pero no hay **ni un solo** `useQuery`/`useMutation` en `src/`. Es ~30KB gz de runtime muerto + adds top-level provider subtree.

**Fix:** Elimina `QueryClientProvider`, `QueryClient` y desinstala `@tanstack/react-query`.

---

### 3. Hero LCP pinta **dos `<img>`** de la misma imagen
**Severidad:** P0 / High  
**Archivo:** `src/components/background/ImageBackground.tsx:73-101`

**Problema:** Dos capas `<img>` del mismo `src`/`srcSet`: blur-glow (lineas 73-88, `filter: blur(60px) brightness(1.3)`) + main (91-101). Eso es dos decodificaciones + rasterización Gaussiana a pantalla completa. El `feTurbulence` overlay (lines 44-70) añade tercera capa de compositing.

**Fix:** Reemplaza el glow por un `radial-gradient` CSS o un thumbnail de 64px. Reduce `baseFrequency="0.65"` a `"0.9"` y `numOctaves="3"` a `"1"`.

---

### 4. El `<Canvas>` WebGL arranca aunque estés en reduced-motion o GPU baja
**Severidad:** P1 / High  
**Archivos:** `src/components/three/Hero3D.tsx:51-57`, `src/components/sections/HeroShowcase.tsx:61-66`, `src/hooks/useDeviceTier.ts:43`

**Problema:** `Hero3D` solo anula rotación/float si `reduced`, pero el `<Canvas>`, contexto WebGL, `MutationObserver` y listener siguen activos. `useDeviceTier.shouldUseFallback` solo lo consume `ProfileShowcase` — el hero lo ignora. Reduced-motion users pagan full bundle + GPU cost.

**Fix:**
```typescript
// HeroShowcase.tsx
const { shouldUseFallback } = useDeviceTier();
if (shouldUseFallback) return <StaticFallback />;
// O dentro de Hero3D antes de return <Canvas>
```

---

## 🔴 CRÍTICO — Diseño 2026

### 5. La metáfora "desktop OS" está anticuada e inconsistente
**Severidad:** P0 / Strategic  
**Archivos:** `src/components/window/WindowChrome.tsx:29-54`, `src/components/dock/Dock.tsx`, `src/App.tsx`, `src/pages/Index.tsx:26-47`

**Problema:** Es un patrón de 2021 (era Brittany Chiang / crafity). En 2026 es *categoría de template*, lo que Awwwards penaliza. Metáfora inconsistente: dock **Y** nav superior **Y** spotlight **Y** terminal — tres paradigmas redundantes sobre página que scrollea normal. Semáforos son teatro no funcional (close solo esconde la sección).

**En 2026 elige UNA dirección:**
- **(a) Spatial UI de verdad**: panes con z-translate real en scroll, sin title bars falsos
- **(b) Drop el chrome**: deja que contenido + motion lleven la señal

**Fix para (a):**
- Elimina `WindowChrome` traffic lights falsos
- Implementa depth layers con parallax z-translation en scroll
- Mantiene dock como única navegación (o nav único, no ambos)

---

### 6. Hero sin "wow" — el juez decide en 2 segundos
**Severidad:** P0 / Strategic  
**Archivos:** `src/components/three/Hero3D.tsx:62`, `src/components/sections/Hero.tsx:13-17`

**Problema:** El 3D es un icosaedro wireframe con `meshBasicMaterial` — tutorial de three.js de 2018. Text-only hero + wireframe = "aprendí three.js la semana pasada". Ya tienes el plumbing reactivo al tema (`Hero3D.tsx:40-48`, muy bien hecho) — estás al 80% de algo impresionante.

**Fix:** Reemplaza con:
- **Blob raymarched GLSL** que samplee `--primary`/`--mesh-*` (ya tienes MutationObserver)
- **Nube de partículas GPU** cuya densidad reaccione a scroll velocity
- **Generativo**: hash de sesión del visitante → forma única pero estable

---

### 7. Cuatro temas oscuros, ninguno claro
**Severidad:** P0 / Strategic  
**Archivos:** `src/styles/tokens/themes/*.json`, `src/index.css:52,59,77`

**Problema:** Indigo, Catppuccin, Dracula, Tokyo-Night son "dark muted con un accent". Diferencia perceptual mínima, ninguno es declaración de marca. `::selection`, `.glass`, `.text-gradient` hardcoded a indigo → en Dracula (magenta) siguen violetas. No respeta `prefers-color-scheme`.

**Fix:**
- Tema light real (papel cálido, no `#fff`)
- Respeta `prefers-color-scheme` por defecto
- Corta a 2 temas con propósito (o 3 si incluyes a11y high-contrast)
- Pasa todos los literales por `hsl(var(--primary))`/`hsl(var(--card))`

---

### 8. Fallos de contraste en muted text
**Severidad:** P0 / Accessibility  
**Archivos:** `src/styles/tokens/semantic/colors.json:24,5`, `src/components/sections/Hero.tsx:25`, `src/components/sections/projects/projects.module.css:201`

**Problema:** `muted-foreground: 230 15% 65%` sobre `background: 230 35% 5%` ≈ **4.2:1** — falla AA para texto normal. Dracula es peor (~3.3:1). Lo usas en body copy y labels de `0.68rem`.

**Fix:** Sube a `230 15% 70%` (≈5.0:1) o crea `--text-secondary` ≥4.5:1. Audita todos los `text-muted-foreground` contra su font-size.

---

## 🟠 ALTA — React Architecture

### 9. Hooks con leaks/cleanup muerto
**Severidad:** P1 / High  
**Archivos:** `src/hooks/useTypewriter.ts:25-37`, `src/components/sections/Projects.tsx:54-72`, `src/components/Nav.tsx:29-52`, `src/hooks/useDockHover.ts:7-21`, `src/hooks/useMousePosition.ts:6-16`

**Problemas:**
- `useTypewriter`: `return () => clearInterval(id)` está **dentro del callback de setTimeout**, no del effect → React nunca lo recibe
- `Projects`: `setTimeout` sin cleanup → setState-on-unmounted
- `Nav`: scroll listener sin throttle + `getBoundingClientRect()` cada frame
- `useDockHover`: `querySelectorAll` + layout reads por cada mousemove pixel
- `useMousePosition`: setState por cada mousemove sin throttling

**Fix:**
- Mueve interval creation al top-level del effect, return cleanup desde el effect
- Guarda timer IDs en ref y clear en cleanup
- Usa `IntersectionObserver` + rAF batching en Nav
- Cachea rects on `mouseenter`/resize en dock
- Expose ref/motion-value en lugar de state

---

### 10. `gsap.registerPlugin` llamado 3 veces
**Severidad:** P1 / Medium  
**Archivos:** `src/lib/gsap.ts:4`, `src/hooks/useLenis.ts:6`, `src/components/sections/Trayectoria.tsx:10`

**Problema:** Doble registro es inofensivo pero maintenance trap. `Trayectoria`/`useLenis` importan directamente del package en vez del barrel.

**Fix:** Importa solo desde `@/lib/gsap` en todas partes. Elimina los 2 `registerPlugin` extra.

---

### 11. A11y en chrome y dock
**Severidad:** P1 / Medium  
**Archivos:** `src/components/dock/Dock.tsx:194-237`, `src/components/boot/BootSequence.tsx:11-29`, `src/components/window/WindowChrome.tsx:31-48`

**Problemas:**
- Desktop `Dock` no tiene `role="toolbar"` ni `aria-label`, labels hover-only
- `BootSequence` es `<div>` clickable z-100 sin `role="button"`/focus trap
- `WindowChrome` al cerrar quita `id="hero"`/`id="about"` del árbol, rompiendo deep links

**Fix:**
- Dock: `role="toolbar" aria-label="Quick actions"` + `aria-label` por item
- Boot: `<button>` o `role="button"` + `tabIndex={0}` + focus trap
- WindowChrome: mueve `id` a elemento estable, `aria-expanded` en close button

---

## 🟠 ALTA — Design System

### 12. Seis recetas de "glass" sin token compartido
**Severidad:** P1 / High  
**Archivos:** `src/index.css:76,83,122,170,246,350,435,472`, `src/components/sections/projects/projects.module.css:144,642`, `src/components/sections/Trayectoria.module.css:145,155,165`

**Problema:** `.glass`, `.glass-strong`, `.liquid-glass`, `.liquid-glass-strong` + inline en Profile cards + Trayectoria = **6 recetas distintas**. `.liquid-glass` bg 2% alpha es esencialmente invisible — existe por su borde. Apple Liquid Glass 2025/26 es **un** material con highlights que responden al contenido detrás.

**Fix:** Consolida a **dos** tokens:
```css
:root {
  --surface-glass: hsl(var(--card) / 0.45) blur(16px) saturate(140%);
  --surface-glass-elevated: hsl(var(--card) / 0.65) blur(20px) saturate(160%);
}
```
Renombra `.liquid-glass*` a `.glass-hairline-border` o bórralo.

---

### 13. Escala de radius rota
**Severidad:** P1 / Medium  
**Archivos:** `src/styles/tokens/semantic/layout.json:5-8`, múltiples JSX/CSS modules

**Problema:** `radius: 1rem` definido pero JSX hardcodea `rounded-lg/2xl/xl/md` en ~15 sitios. CSS modules: `0.4rem` (chips), `1rem` (profile), `1.25rem` (mobile), `9999px` (badges). Chips a 0.4 dentro de cards a 1 dentro de windows a 1.5 — tres radios no relacionados.

**Fix:** Escala armónica 4/8/12/16/24px. Mapea a Tailwind via `@theme inline`. Regla: radio interior = exterior − padding. Elimina todos los `rounded-*` literales.

---

### 14. Escala tipográfica inexistente
**Severidad:** P1 / Medium  
**Archivos:** `src/components/sections/Hero.tsx:14`, `src/components/sections/Projects.tsx:118`, `src/components/sections/Contact.tsx:118`, `src/components/sections/Trayectoria.module.css:312`, `src/index.css:301`, `src/components/sections/projects/projects.module.css:397-409`

**Problema:** Cada sección inventa su clamp:
- Hero: `text-5xl→7xl`
- Projects: `4xl→6xl`
- Contact: `5xl→7xl`
- Trayectoria: `clamp(2.6rem, 5.2vw, 4.2rem)`
- Profile: `clamp(1.875rem, 4vw, 3.25rem)`

No hay `--text-display`/`--text-h1`. Trackings `-0.04em`/`-0.025em`/`-0.02em`/`-0.01em` dispersos.

**Fix:** Define escala tokenizada:
```json
// typography.json
{
  "text-display": "clamp(2.5rem, 5vw, 4.5rem)",
  "text-h1": "clamp(2rem, 4vw, 3rem)",
  "text-h2": "clamp(1.5rem, 3vw, 2.25rem)",
  "tracking-tight": "-0.025em"
}
```

---

### 15. `.text-gradient` blanco→gris es de 2020-2023
**Severidad:** P1 / Low  
**Archivo:** `src/index.css:59`

**Problema:** `linear-gradient(135deg, #fff, hsl(230 30% 75%))` en TODOS los h1. Patrón más copiado de Dribbble, y no es theme-aware.

**Fix:** Hazlo direccional/especular o quítalo de 2 de 3 instancias. Mejor: reemplaza con highlight specular que samplee `--primary`.

---

## 🟠 ALTA — Performance/Build

### 16. `@react-three/postprocessing` instalado pero no usado
**Severidad:** P1 / Medium  
**Archivo:** `package.json:50`

**Problema:** `grep` muestra **cero** referencias no-test. Es dead weight.

**Fix:** Desinstala. Confirma que no hay imports en `src/`.

---

### 17. Fonts: 3 families, 9 weights, blocking
**Severidad:** P1 / Medium  
**Archivo:** `index.html:18`

**Problema:** `Courier+Prime` (2), `Space+Grotesk` (4), `Inter` (3) = 9 archivos vía `<link>` blocking. `font-display: swap` (bueno para CLS) pero request uncached/unoptimized.

**Fix:** Self-host con `@font-face` subset a latin, woff2. Drop pesos no usados. Preload solo 2 pesos LCP.

---

### 18. Dedupe list omite heavy deps
**Severidad:** P2 / Low  
**Archivo:** `vite.config.ts:61-68`

**Problema:** Dedupe react/tanstack pero no three, gsap, framer-motion. Si transitive dep pulla segunda copia de three (común vía drei), bundle duplica ~600KB.

**Fix:** Añade `three`, `@react-three/fiber`, `gsap`, `framer-motion` a `dedupe`.

---

## 🟡 MEDIA — Motion

### 19. Cuatro runtimes de animación apilados
**Severidad:** P1 / Strategic  
**Archivos:** `src/hooks/useLenis.ts`, `src/components/sections/Trayectoria.tsx:146-162`, múltiples `whileInView`

**Problema:** Lenis (smooth scroll) + GSAP pin (`Trayectoria`) + Framer `whileInView` en casi todo + 3D carousel + dock magnification + boot + CRT + loops. ~150KB+ JS, y boot sequence fuerza a esperar o click-skip — conversión killer para recruiters.

**Fix drástico:**
- Corta boot sequence (o easter egg)
- Elige **o** Lenis **o** GSAP pin, no ambos
- Reduce `whileInView` a 2-3 momentos clave
- CRT scanlines: restringe a **panel terminal solo**, nunca viewport completo

---

### 20. CRT overlay hurt readability
**Severidad:** P2 / Low  
**Archivo:** `src/index.css:194-224`

**Problema:** Scanlines sobre body text reducen legibilidad. `mix-blend-mode: multiply` sobre dark theme casi no se ve — invisible o dañino. Vaporwave cosplay.

**Fix:** Remove de default. Si amas CRT, restringe a terminal panel solo (donde mono + scanlines está earned).

---

## 🟡 MEDIA — Otros

### 21. `useDeviceTier.detectGpuTier()` corre por cada consumidor
**Severidad:** P1 / Medium  
**Archivo:** `src/hooks/useDeviceTier.ts:14-37`

**Problema:** Memoiza por hook instance, pero cada consumidor crea canvas + WebGL context. Contextos son recurso global limitado y creación es sincrona y cara.

**Fix:** Hoist a module-level lazy singleton:
```typescript
let cached: GpuTier | undefined;
export function detectGpuTier(): GpuTier {
  if (cached) return cached;
  // ... create canvas once
  return cached;
}
```

---

### 22. Dead/over-shipped shadcn deps
**Severidad:** P2 / Low  
**Archivo:** `package.json:21-47`

**Problema:** 24 `@radix-ui/*`, recharts, react-day-picker, embla, resizable-panels, cmdk, input-otp, vaul. `grep` confirma muchos no consumidos (chart → recharts, calendar → react-day-picker, etc.).

**Fix:** Audita `src/components/ui/*` contra imports reales. Elimina dead deps.

---

### 23. No image optimization build step
**Severidad:** P3 / Info  
**Archivos:** `public/pexels-*.webp`, `package.json:96` (sharp in devDeps)

**Problema:** Variantes responsive hand-committed. No AVIF. `sharp` existe pero no hay script que lo use.

**Fix:** `scripts/optimize-images.mjs` con sharp → AVIF + WebP per breakpoint desde source. Wire to `prebuild`.

---

### 24. Test coverage narrow
**Severidad:** P3 / Info  
**Archivo:** `src/test/setup.ts`

**Problema:** No tests para: Hero3D, Scene, TechStack3D, useLenis, useScrollReveal, ImageBackground (LCP path), GSAP Trayectoria, routing/App, useDeviceTier gating.

**Fix:** Añade tests assertiendo:
- `<Canvas>` NOT render cuando `reduced` true
- `useDeviceTier.shouldUseFallback` true en mobile
- `ImageBackground` renderiza single primary img

---

## 🟢 BAJA — Lo que te falta para 2026

### 25. Zero AI-native touches
**Severidad:** P1 / Strategic  
**Archivos:** `src/components/spotlight/Spotlight.tsx`

**Problema:** Para portfolio 2026, ausencia de elemento generativo/IA es conspicuo. Dock tiene "Terminal" y "Spotlight" pero ninguno hace nada model-powered.

**Fix:** Uno tasteful:
- Spotlight (⌘K) que responda preguntas reales vía índice on-device
- Hero 3D generado desde hash de sesión del visitante (forma única pero estable)

---

### 26. No micro-interacción / spatial-depth layer
**Severidad:** P1 / Strategic  
**Archivos:** `src/index.css:93-107` (`.mesh-bg`, `.grid-bg` estáticos)

**Problema:** Hover states son `hover:-translate-y-0.5` + border change. Uniform, predecible. No pointer-tracking highlights, no depth-shift en scroll, no parallax entre capas.

**Fix:**
- **Pointer-aware specular**: cards con highlight radial siguiendo cursor vía `--mx/--my` CSS
- **Scroll-depth**: mesh + grid layers translate a diferente rate
- **Section transitions**: en vez de fade-up, "pull-back" (scale 0.96→1 + z-translate)

---

### 27. Contact form es `mailto:`
**Severidad:** P2 / Low  
**Archivo:** `src/components/sections/Contact.tsx:51-63`

**Problema:** `onSubmit` construye `mailto:` y `window.location.href`. Abre cliente mail, clunky en mobile webviews, y toast "sending" es misleading. Para 2026 portfolio showcasing engineering chops, serverless handler (Resend, Cloudflare Worker) es señal más fuerte.

**Fix:** Wire endpoint real. Honest success/error states. 30 min change, outsized credibility return.

---

### 28. Hardcoded color literals bypass token system
**Severidad:** P2 / Low  
**Archivos:** `src/components/dock/Dock.tsx:101,107,126,135,149,158`, `src/components/window/WindowChrome.tsx:34,40,46`, `src/components/sections/Hero.tsx:34,44`, `src/index.css:260-267`

**Problema:** Dock usa `text-[hsl(190_95%_60%)]`, `text-cyan-300`, etc. WindowChrome hardcoded `#ff5f57`/`#febc2e`/`#28c840`. Hero CTAs hardcode `hsl(248_90%_66%)`. En Dracula (primary magenta), dock cyan / hero violet stay indigo-themed.

**Fix:** Reemplaza todos los `hsl(...)`/`#hex` por `hsl(var(--primary))`/`hsl(var(--accent))`. Traffic-light colors pueden quedar literal (son macOS convention).

---

## 🟢 BAJA — Miscelánea

### 29. Trayectoria horizontal pin es clever pero frágil
**Severidad:** P1 / Low  
**Archivos:** `src/components/sections/Trayectoria.tsx:146-162`, `src/components/sections/Trayectoria.module.css:67-112`

**Problema:** Pinned horizontal scroll es over-used 2022-2024. Jueces fatigados. Rompe `Ctrl+F` findability, complica deep-linking. Magic numbers (`padding: 0 calc(50vw - 220px) 0 15vw`, `height: 600px`/`width: 380px`) brittles across viewports. Mobile es diseño completamente diferente.

**Fix:** Si lo mantienes, añade payoff real (cards tilt 3D hacia axis al pasar center). Si no, convierte a vertical timeline con scroll-driven reveal — más legible, maintainable, y moderno en 2026 "calm, confident" aesthetic.

---

### 30. Projects 3D carousel hardcoded transforms
**Severidad:** P2 / Low  
**Archivo:** `src/components/sections/projects/projects.module.css:92-102`

**Problema:** Diez reglas `data-position` con `translateX(-420px)`, `-760px`, etc. Card width es `clamp(380px, 38vw, 520px)` pero offsets son px fijos → wrong overlap en narrow desktop.

**Fix:** Drive offsets desde CSS var scaled a card width (`--card-w`), o compute en JS desde measured width. Como mínimo, añade comment acknowledging coupling.

---

### 31. TechBento es la sección más débil visualmente
**Severidad:** P2 / Low  
**Archivo:** `src/components/sections/TechBento.tsx:115`

**Problema:** 2×2 grid de 4 cells iguales es "bento sin hierarchy". Shine sweep en chips es 2021 skeuomorphic flourish que clasha con estilo plano. Mixing lucide fallback con colored SVGs se ve inconsistente.

**Fix:** Asymmetric bento — una cell featured (2-column) + pequeñas alrededor. Standardiza icon treatment. Reemplaza shine sweep con border-glow hover que samplee `--accent`.

---

### 32. ProfileShowcase "Passion Cards" disconnect de OS metaphor
**Severidad:** P2 / Low  
**Archivos:** `src/index.css:339-357,563-586`, `src/components/sections/ProfileShowcase.tsx`

**Problema:** Abandona lenguaje terminal/OS — es grid hobbies genérico con ilustraciones spinning. Vinyl/chef/LED loops son charming pero se sienten de otro diseñador. Es *least* hire-able signal.

**Fix:** Reframe como "What I'm exploring" con tie más tight a craft (music → audio programming; cooking → precision/iteration). Theme art a match OS aesthetic. Sticky-stacked pattern es bueno — keep.

---

## 🟢 INFO — Strengths (mencionar en portfolio/entrevista)

- **Token architecture bien estructurada**: primitives → semantic → themes con pipeline automatizado. Adelantado a mayoría portfolios.
- **Theme-reactive 3D plumbing**: `Hero3D.tsx:40-48` (MutationObserver para `--primary`/`--mesh-*`) y conic-gradient rim en projects (`projects.module.css:155-175`) — work de alguien que importa details.
- **Reduced-motion guards**: `useReducedMotion` hook, CRT auto-disabled, Trayectoria skip pin — a11y considerado por encima de media.
- **Clean hooks**: `useMediaQuery`, `useScrollReveal` están limpios y correctamente cleanup. Device-tier fallback strategy es idea correcta (solo necesita singleton fix).
- **Mobile/desktop split**: Trayectoria via `useMediaQuery` es pattern SSR-safe correcto.

---

## Plan de Acción Priorizado

### Quick Wins Técnicos (1 sesión, alto impacto)
1. Code-split hero 3D + secciones below-fold (#1)
2. Desinstalar react-query (#2)
3. Fix doble img en ImageBackground (#3)
4. Gate WebGL en shouldUseFallback + reduced (#4)
5. Eliminar @react-three/postprocessing (#16)

### Limpieza Design System (1-2 sesiones)
1. Consolida 6 glasses → 2 tokens (#12)
2. Arregla escala radius (#13)
3. Define escala tipográfica (#14)
4. Fix hardcoded colors por tokens (#28)
5. Audita contrast en muted (#8)

### Rediseño Hero (1-2 sesiones, más ambicioso)
1. Reemplaza icosaedro wireframe por blob shader generativo (#6)
2. Haz shader reactivo a tema (reusa MutationObserver)
3. Añade pointer-aware specular en cards (#26)

### Decisión Creativa Motion (discusión primero)
1. Corta boot sequence (#19)
2. Elige Lenis **o** GSAP pin, no ambos
3. Reduce `whileInView` a momentos clave
4. Restringe CRT a terminal panel

### Polish (sessions intercaladas)
1. Tema light real + prefers-color-scheme (#7)
2. Contact form real (#27)
3. AI-native moment en Spotlight (#25)
4. Fix hooks leaks (#9)
5. Fonts self-host + subset (#17)

### Technical Debt (cuando tiempo permita)
1. Dead shadcn deps audit (#22)
2. Trayectoria reconsider (#29)
3. Projects carousel offsets (#30)
4. TechBento asymmetry (#31)
5. Image optimization build step (#23)
6. Test coverage (#24)

---

## Métricas de Éxito

Antes de iniciar:
- LCP: ?? (medir con Lighthouse)
- TTI: ??
- Bundle size: ??

Después de Quick Wins Técnicos:
- LCP < 2.5s
- TTI < 3.5s
- Initial bundle < 200KB gz (three chunk separado)

Después de Rediseño Hero:
- Perceived quality score (subjetivo pero judge-noticeable)
- "Wow" moment < 3 segundos de carga

---

## Notas de Implementación

- **Usa `/ponytail full`** para cambios quirúrgicos sin gold-plating
- **Usa `/deepwork`** para multi-file tasks (rediseño hero, consolidación design system)
- **Siempre test-first** para hooks/data helpers antes de refactor
- **Changelog.md** después de cada sesión (Keep a Changelog format)
- **Commits atomics** por hallazgo, no por batch

---

**Fin de auditoría.**

Recuerda: este análisis está basado en el código actual. Algunos hallazgos pueden haber cambiado si has modificado archivos desde la fecha de auditoría (2026-07-08).
