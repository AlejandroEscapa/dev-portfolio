# Handoff — Sección Profile: Pasiones

> **Estado al cerrar la sesión**: implementación v4 entregada y verificada. Pendiente decisión entre 3 ideas para v5 (animaciones o iconos premium).
> **Fecha**: 2026-07-01
> **Puerto dev**: 8080
> **Stack**: Vite + React 18.3 + TypeScript + Tailwind v4 + framer-motion 12.38

---

## TL;DR

- ✅ La sección `~/passions.md` está implementada con 3 cards glass horizontales, SVG custom por pasión, copy breve, "Ver más" que expande.
- ✅ Build verde, 47/47 tests pasan, lint 0 errors.
- ⏳ **Pendiente**: el usuario quiere que los SVGs actuales cobren vida (animación) o se sustituyan por iconos más profesionales. Hay 3 ideas propuestas (A / B / C), pendiente de elegir.

---

## 1. Contexto del proyecto

**Tipo**: single-page portfolio personal.
**Stack fijo** (no se puede cambiar sin migrar React 19):
- `react@18.3.1`, `vite@5.4`, `typescript@5.8`
- `tailwindcss@4.3` (no v3 como dice el AGENTS.md — el código real es v4)
- `framer-motion@12.38` (Motion para React)
- `@react-three/fiber@8.18` + `@react-three/drei@9.122` (r3f v9+ requiere React 19, **no migrar**)
- `@react-three/postprocessing@2.19.1`
- `lucide-react` para iconos
- `i18next` con **solo 2 idiomas**: `en` y `es` (no CA/GL — el proyecto no los soporta)
- `useLenis` para smooth scroll en window
- `useReducedMotion` para accesibilidad
- `useMediaQuery` para breakpoints
- `@/*` resuelve a `./src/*`

**Sistema de diseño**:
- Dark mode only (`.dark` class en `<html>`)
- Tokens HSL en `:root` con overrides en `[data-theme="catppuccin|dracula|tokyo-night"]`
- Tipografías: Space Grotesk (display), Inter (sans), Courier Prime (mono)
- Componentes en `src/components/ui/` (shadcn-style, no se modifican a mano)
- `WindowChrome` para todas las "ventanas" con título tipo `~/archivo.md`
- Utilidades custom: `.glass`, `.glass-strong`, `.liquid-glass`, `.text-gradient*`, `.mesh-bg`, `.grid-bg`, `.glow-*`, `.hover-glow`, `.section-px`

**Composición del Index** (`src/pages/Index.tsx`):
- `<ImageBackground>` con Pexels
- `<Nav>` arriba
- `<HeroShowcase>` con Hero + About (40/60 split sticky)
- Sección `~/passions.md` con `id="profile"` ← **esta es la sección que iteramos**
- `<Trayectoria>`, `<Projects>`, `<Education>`, `<Contact>`

---

## 2. Historia de la sesión (4 iteraciones)

El usuario y yo iteramos sobre la sección Profile. Resumen de cada vuelta:

### v1 · 3D scroll-jack con r3f
- Idea: sticky stack vertical con `<ScrollControls>`, 3 modelos procedurales (chef hat, gamepad, keyboard), cámara CatmullRom.
- **Resultado**: el usuario lo rechazó. Texto no visible, scroll lateral derecho (no nativo), modelos "se fundían".
- **Lección**: nunca usar `<ScrollControls>` ni `<Html>` de drei para texto crítico.

### v2 · Wrapped style sticky stacked con gradients
- Idea: 3 cards stacked 100vh cada una, sticky con peek de 80px, gradients saturados (violeta/naranja/jade), `AnimatedCounter` con framer-motion, expand inline.
- **Resultado**: usuario dijo "sección vacía, falta personalidad, demasiado texto".
- **Lección**: prefería 1x3 horizontal y glass transparente, no gradients fuertes.

### v3 · 1x3 horizontal glass + manifestos + stats
- Idea: grid 3 cols, glass cards con `backdrop-filter: blur(20px)`, accent color en border-top y sub-stats, manifestos italic, "personal detail" mono, SVG decorativo por pasión.
- **Resultado**: usuario pidió quitar texto, manifestos, stats. Solo SVGs profesionales, nombre grande, "Ver más".
- **Lección**: minimalismo > density. La "esencia" es lo que importa, no los datos.

### v4 · ACTUAL — Minimal con SVGs custom
- Idea: 3 cards horizontales, cada una con un SVG custom (Vinyl, ChefHat, Controller) de ~220px, nombre grande con gradient, copy de 1 línea, "Ver más" abajo.
- **Resultado**: ✅ Entregado y verificado. Pero el usuario quiere dar "más vida" a los SVGs o sustituirlos por iconos más profesionales.

### v5 · PRÓXIMA — pendiente de decisión
- 3 ideas propuestas:
  - **A · Vida continua** (CSS + framer-motion hover, sin libs nuevas)
  - **B · Acción / storytelling** (RECOMENDADA por mí — framer-motion, cada SVG cuenta lo que haces en la pasión)
  - **C · Iconos premium** (Phosphor Duotone / Solar LineDuotone, menos personal)

---

## 3. Estado actual del código (v4)

### 3.1 Archivos de la sección Profile

**Activos** (en uso):
- `src/components/sections/PassionCard.tsx` — la card por pasión
- `src/components/sections/ProfileShowcase.tsx` — root que decide desktop vs mobile
- `src/components/sections/ProfileSectionHeader.tsx` — label + title + intro
- `src/components/sections/ProfileDeck.tsx` — grid 1x3
- `src/components/ui/PassionArt.tsx` — los 3 SVGs custom (Vinyl, ChefHat, Controller)
- `src/components/ui/MobilePassionCard.tsx` — fallback mobile
- `src/lib/passion-data.ts` — datos tipados
- `src/hooks/useDeviceTier.ts` — detección mobile / reduced-motion / GPU

**Eliminados** (no resucitar):
- `src/components/ui/AnimatedCounter.tsx` y su test
- `src/components/ui/GradientSurface.tsx`
- `src/components/ui/MobilePassionFallback.tsx` (versión vieja)
- `src/components/ui/PassionMark.tsx` (versión decorativa intermedia)
- `src/components/three/ProfileCamera.tsx`
- `src/components/three/ProfileLights.tsx`
- `src/components/three/ProfileModels.tsx`
- `src/components/three/ProfilePostFX.tsx`
- `src/components/three/ProfileScene.tsx`
- `src/components/three/ProfileText.tsx`
- `src/components/three/StandaloneModels.tsx`
- `src/components/sections/Profile.tsx` (versión vieja)
- `src/hooks/useScrollProgress.ts`

### 3.2 Estructura de cada card (v4)

```
┌──────────────────────────────┐
│   ┌──────────┐               │
│   │   SVG    │  ← PassionArt (220px max, 1:1 aspect)
│   │  custom  │     hover: scale 1.05 + rotate -2°
│   └──────────┘     radialGradient del accent color
│                              │
│       Música                 │  ← h3, font-display, weight 800
│                              │     gradient foreground → accent-soft
│                              │     clamp 1.75-2.5rem
│   Electrónica, drum & bass  │  ← 1 línea copy, color 72% white
│   y techno, producida en    │
│   FL Studio desde 2019.     │
│                              │
│       [ Ver más ]            │  ← CTA pill, accent border en hover
│                              │
└──────────────────────────────┘
```

Al hacer click en "Ver más": aparece el `copy_extended` (2-3 líneas) debajo con animación `AnimatePresence` (height + opacity, easing `[0.16, 1, 0.3, 1]`).

### 3.3 Glass card styling

```css
.profile-card {
  background: hsl(0 0% 100% / 0.04);
  backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid hsl(0 0% 100% / 0.08);
  border-top: 3px solid var(--card-accent, ...);
  border-radius: 1rem;
  box-shadow: 0 8px 32px hsl(230 25% 4% / 0.35);
}
.profile-card:hover {
  background: hsl(0 0% 100% / 0.06);
  border-color: hsl(0 0% 100% / 0.14);
  transform: translateY(-2px);
}
```

CSS variables que recibe la card:
- `--card-accent`: `hsl(H S% L%)` saturado (color de la pasión)
- `--card-accent-soft`: `hsl(H S*0.55% L*1.15%)` para el gradient del nombre

Mobile (<1024px) y `prefers-reduced-motion: reduce` → `grid-cols-1` sin sticky, sin glass hover.

### 3.4 Gradientes por pasión

| Pasión | `h s l` | Color |
|---|---|---|
| music | 270 80 65 | violeta saturado |
| cooking | 25 90 60 | naranja saturado |
| gaming | 150 70 55 | jade / verde-azulado |

Aplicado en:
- `border-top: 3px solid var(--card-accent)`
- SVG color (vía `currentColor` en PassionArt)
- Sub-stat border-left (si se añadieran de nuevo)
- CTA hover border

### 3.5 i18n keys actuales

Bajo el namespace `profile.*` en `src/i18n/translations.ts` (TS, no JSON):

```
profile.section_label       "02 — Pasiones" / "02 — Passions"
profile.section_title       "Lo que me hace quien soy" / "What makes me who I am"
profile.section_intro       "Tres cosas fuera del teclado que construyeron quien soy." / "Three things off the keyboard that built who I am."
profile.cta_expand          "Ver más" / "See more"
profile.cta_collapse        "Ver menos" / "See less"
profile.passion.{music|cooking|gaming}.label
profile.passion.{music|cooking|gaming}.copy        (1 línea)
profile.passion.{music|cooking|gaming}.copy_extended (2-3 líneas)
```

**Copy actual**:

- **Música** (visible): "Electrónica, drum & bass y techno, producida en FL Studio desde 2019."
- **Música** (expandido): "La pasión que me ha acompañado siempre. Rodeado de gente como Samu, de la que aprendí y me inspiré. 30+ tracks, 10+ releases públicos."
- **Cocina** (visible): "Cuchillo, fuego, mesa. Cuatro años en hostelería, 1.000+ servicios, head chef."
- **Cocina** (expandido): "Donde empecé a currar para pagar mis estudios. Lo que me enseñó a cuidar los detalles, a tener paciencia y a querer a los míos desde la cocina."
- **Videojuegos** (visible): "Mi sitio seguro. 10+ años, tres Dark Souls completados, soulslike como refugio."
- **Videojuegos** (expandido): "La saga Dark Souls me enseñó que cada muerte es una lección. Horas de nostalgia, aprendizaje, amistades y una forma de entender las narrativas que después aplico a todo."

### 3.6 Datos del usuario (validados)

- **Música**: FL Studio, electrónica / drum & bass / techno, 5 años produciendo, 30+ tracks, 10+ releases públicos, mentor Samu
- **Cocina**: 4 años en hostelería (PEZ TOMILLO, Alsea, UDON), 1.000+ servicios, 3 roles
- **Videojuegos**: 10+ años jugando, 3 entregas de Dark Souls completadas, soulslike como género refugio

Orden de las cards en el deck: **Música → Cocina → Videojuegos** (cambiado desde el orden original Cocina→Gaming→Música; el usuario dijo "music primero, pasión más fuerte").

---

## 4. Decisión pendiente: v5 — animación o iconos premium

El usuario quiere "dar vida" a los SVGs actuales (animación: "mando pulsando teclas, cocina dinámica") o sustituirlos por iconos "mucho más profesionales". Le presenté 3 ideas y pidió que las volcara aquí.

### Idea A · "Vida continua" — animaciones infinitas sutiles + hover reactivo

**Concepto**: cada SVG tiene una animación sutil en bucle + una más marcada al hover.

**Ejemplos por pasión**:
- **Vinyl**: gira lento continuo (8s/vuelta) + al hover acelera, surco exterior brilla
- **Chef hat**: flotación vertical sutil (3s) + al hover salta 4px y aparecen 3 paths de vapor
- **Controller**: LED rojo central parpadea (1.5s) + al hover los 4 botones se prenden en secuencia (300ms entre cada uno)

**Stack**: CSS `@keyframes` para lo continuo + framer-motion `whileHover` para el hover. **0KB extra** (framer-motion ya está).

**Pros**: vida sin saturar, accesible con `prefers-reduced-motion`, ligero.
**Contras**: las animaciones de hover se ven poco sin interacción, hay que cuidar el timing.

### Idea B · "Acción" — las animaciones SIMULAN lo que haces en cada pasión (RECOMENDADA)

**Concepto**: en vez de solo moverse, cada SVG cuenta lo que haces. Storytelling visual.

**Ejemplos por pasión**:
- **Vinyl**: gira continuo + un "tonearm" (brazo) se desliza desde el borde hasta el centro + al hover el "play" central pulsa
- **Cocina**: una llama SVG debajo del gorro parpadea (1s) + vapor sale de la base con `pathLength` animado + al hover la llama crece 10%
- **Controller**: los 4 botones faciales se prenden en secuencia cada 800ms (loop) + el D-pad se ilumina + al hover los sticks analógicos se inclinan

**Stack**: framer-motion (`motion.path`, `motion.circle` con `pathLength`, `animate`).

**Pros**: cuenta la pasión visualmente, único y memorable, combina storytelling + interactividad.
**Contras**: más complejo, restraint es clave para no parecer juguete, cada SVG necesita rediseño.

### Idea C · "Profesional" — iconos premium con micro-animaciones

**Concepto**: sustituir los SVGs custom por iconos de bibliotecas premium (Phosphor Duotone, Solar LineDuotone, etc.) + micro-animaciones CSS.

**Ejemplos**:
- **Vinyl**: icono detallado con label central, surcos finos, depth con duotone
- **Chef hat**: silueta con shading y detalles
- **Controller**: gamepad con sticks, botones, todo en duotone con profundidad

**Stack**: importar SVGs desde Phosphor / Solar via Iconify. Sin framer-motion nuevo.

**Pros**: calidad visual inmediata, menos código custom.
**Contras**: menos personal, riesgo de "de catálogo".

### Mi recomendación

**Idea B (Acción)** porque responde directamente a lo que el usuario describió: "un mando que se mueve pulsando teclas, en cocina algo más dinámico". Convierte los SVGs de "símbolos" a "demostraciones de la pasión" — exactamente la "esencia" que el usuario quiere transmitir.

**Plan B**: Idea A (Vida continua) si Idea B resulta demasiado. Más segura.
**Plan C**: Idea C (Profesional) si la prioridad es calidad visual inmediata sobre personalidad.

---

## 5. Plan para retomar la sesión

### Si el usuario eligió Idea A:
1. Mantener `PassionArt.tsx` igual, añadir CSS keyframes (`@keyframes`) en `index.css` para cada pasión
2. Añadir `whileHover` con framer-motion en `PassionCard.tsx` para las animaciones reactivas
3. Test: verificar `prefers-reduced-motion: reduce` desactiva las animaciones infinitas
4. Verificar con `npm run build && npm test && npm run lint`

### Si el usuario eligió Idea B:
1. Rediseñar cada SVG en `PassionArt.tsx` para añadir elementos "de acción":
   - **Vinyl**: añadir tonearm (path nuevo), play central animado
   - **Cocina**: añadir llama debajo (path nuevo), 3 paths de vapor animadas con `pathLength`
   - **Controller**: los 4 botones pasan a `motion.circle` con animaciones secuenciales; los sticks a `motion.path` con rotación
2. En `PassionCard.tsx`, importar `motion` de framer-motion, usar `useAnimation` o `whileInView`/`whileHover`
3. Para loops: usar `useEffect` con `animate()` de framer-motion
4. Test: igual que Idea A
5. Performance: validar 60 FPS con las 3 animaciones corriendo en paralelo (puede requerir `useReducedMotion` para desactivarlas en low-end)

### Si el usuario eligió Idea C:
1. Investigar la mejor opción: Phosphor Duotone, Solar LineDuotone, o similar (CC0)
2. Importar los SVGs directamente en `PassionArt.tsx` o como componentes de `lucide-react` o `@solar-icons/react`
3. Mantener la composición actual (SVG → nombre → copy → "Ver más")
4. Añadir micro-animaciones CSS sutiles (hover scale, etc.)
5. Verificar

### Pasos comunes antes de empezar:
1. `npm run dev` y abrir `http://localhost:8080/#profile` para ver el estado actual
2. Confirmar con el usuario qué idea elegir (si no lo ha hecho ya)
3. Leer `src/components/three/PassionArt.tsx`, `src/components/sections/PassionCard.tsx`, `src/index.css` (sección profile) para entender el código actual antes de modificar

---

## 6. Comandos útiles

```bash
# Dev server (puerto 8080)
npm run dev

# Build de producción
npm run build

# Tests
npm test

# Lint
npm run lint

# Type-check sin emit
npx tsc --noEmit
```

**Build actual**: ✅ 9.29s, 7320 módulos
**Tests actuales**: ✅ 47/47 pasan
**Lint**: 0 errors, 14 warnings (todos pre-existentes en otros archivos)

---

## 7. Archivos de referencia para retomar

- **Spec formal**: `docs/superpowers/specs/2026-07-01-profile-wrapped.md` (versión detallada, ya no aplica 100% al v4)
- **Plan**: `docs/superpowers/plans/2026-07-01-profile-wrapped.md`
- **Propuestas previas**: `BRAINSTORM-profile-3d-2026-07-01.md` (raíz), `PROPOSALS-profile-section-2026-07-01.md` (raíz)
- **AGENTS.md** (raíz): reglas del proyecto
- **Sección CSS profile**: `src/index.css` desde línea ~430 (buscar `/* === Profile === */`)
- **i18n**: `src/i18n/translations.ts` (TS, no JSON)

---

## 8. Tone of voice y decisiones de diseño

- **Idioma**: responder en español cuando el usuario escribe en español. La copia final en el portfolio va en ES + EN.
- **Prosa**: concisa, sin adornos. Ponytail mode activo: lazy pero correcto. Sin sobre-ingeniería.
- **Personalidad del usuario**: directo, sabe lo que quiere, sabe cuando algo no le gusta, no tolera "basura". Valora "essence" y "cohesion". Trabaja como chef, mobile tech lead, y productor musical — la sección Profile tiene que honrar las 3 dimensiones.
- **TypeScript**: strict está OFF (`strict: false`, `strictNullChecks: false`). No usar tipos innecesarios.
- **Mobile-first mentality**: si una decisión mejora mobile, tomarla. `prefers-reduced-motion` es sagrado.

---

## 9. Resumen de cambios NO pendientes

NO cambiar:
- Stack 3D (r3f 8.18 / drei 9.122 / three 0.185)
- Sistema i18n (solo añadir keys nuevas, no refactorizar)
- `WindowChrome` component
- Theme system (catppuccin / dracula / tokyo-night)
- Routing (single page, sin React Router para Profile)
- Lenguas (solo ES + EN, no añadir CA/GL)
- `useLenis` (smooth scroll del window — funciona OK con la sección actual)

SÍ pendiente:
- Decidir A / B / C
- Implementar las animaciones elegidas
- Ajustar copy si el usuario lo pide
- Verificar accesibilidad tras los cambios

---

## 10. Si el usuario vuelve y dice "implementa la B"

Pseudo-código de qué tocar (no es código real, es guía):

1. **`src/components/ui/PassionArt.tsx`**: rediseñar los 3 componentes:
   - `Vinyl`: añadir `<motion.path>` para el tonearm (path SVG). El play central como `motion.circle` con `animate` infinito de opacity/scale.
   - `ChefHat`: añadir un path de llama debajo (puede ser un `<path>` con stroke-dasharray animado). 3 paths de vapor con `motion.path` y `pathLength: 0→1` en loop.
   - `Controller`: cada botón como `motion.circle` con `animate` secuencial (delay 0, 0.3, 0.6, 0.9). Los sticks como `motion.path` que rotan ligeramente.
   - Mantener la firma `interface ArtProps { accentColor, accentSoft, className?, style? }`.

2. **`src/components/sections/PassionCard.tsx`**: pasar de componente funcional simple a usar `useEffect` con `animate()` de framer-motion para los loops que no se pueden hacer con CSS. O usar `motion.g` con `animate` prop.

3. **`src/index.css`**: añadir keyframes CSS para las animaciones que sean puramente CSS (más performantes que JS-driven). Respetar `@media (prefers-reduced-motion: reduce)`.

4. **`src/hooks/useDeviceTier.ts`**: ya detecta `prefersReducedMotion`. Asegurarse de que las animaciones se desactivan.

5. **Tests**: añadir test que verifique que el SVG tiene los elementos esperados (botones, paths, etc.) usando `getByTestId` o similar.

6. **Verificación final**: `npm run build && npm test && npm run lint && npx tsc --noEmit` y abrir en browser para QA visual.

---

**Fin del handoff.** Para retomar: abre el archivo, decide A/B/C con el usuario, sigue el plan de la sección 5 correspondiente.
