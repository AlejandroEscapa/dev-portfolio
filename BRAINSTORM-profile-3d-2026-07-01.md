# Brainstorm — Rediseño sección Profile (pivot NO 3D)

- **Fecha**: 2026-07-01
- **Estado**: Pivote de brainstorming — 3D descartado por ahora
- **Pivote**: El usuario decide no usar render 3D (r3f/three/drei) en esta iteración. Se replantea la sección con 4 ideas alternativas (DOM/SVG/CSS/HTML5 puro).
- **Razón del pivote**: la implementación 3D previa presentó problemas (texto no visible, scroll lateral, modelos que se "fundían", geometrías básicas). El usuario quiere esencia, no tecnología por la tecnología. 3D queda diferido para una iteración futura.
- **Stack objetivo**: React 18.3, Vite, Tailwind v4, framer-motion 12.38, lucide-react, CSS custom properties del design system existente. **Sin Canvas, sin WebGL, sin three.js, sin postprocessing**.
- **Objetivo**: Sustituir la sección `Profile` actual ("De la cocina al código") por una sección dedicada a las 3 pasiones del usuario: **cocina**, **videojuegos** y **música**, manteniendo la estética de `WindowChrome` y la pipeline i18n.

---

## 1. Contexto del proyecto

Stack 3D existente en el repo:

- `@react-three/fiber@8.18`
- `@react-three/drei@9.122`
- `three@0.185`
- `@types/three@0.185`
- `framer-motion@12.38`
- `gsap@3.15`
- Tailwind v4 (`@tailwindcss/vite@4.3.2`)

Implementación 3D actual (`src/components/three/`):

- `Scene.tsx` — wrapper de `<Canvas>` con `alpha: true`, `dpr=[1, 2]`, `antialias: true`.
- `Hero3D.tsx` — `Icosahedron` wireframe (`meshBasicMaterial`) con `Float` de drei. Lee `--primary` del CSS root y reacciona al ratón con `useFrame` (lerp suave). Respeta `useReducedMotion`.
- `TechStack3D.tsx` — 10 cubos wireframe flotantes con colores de marca.
- `Icon3D.tsx` — wrapper CSS `perspective: 600px` que rota con `gsap.to`.

Composición actual en `src/pages/Index.tsx`:

- `HeroShowcase` (40/60 split, `position: sticky` para el 3D del lado izquierdo) contiene Hero + About.
- Tras `HeroShowcase`, las demás secciones viven en `div.section-px` con su `WindowChrome` propia: Profile, Trayectoria, Projects, Education, Contact.

Sección Profile actual (`src/components/sections/Profile.tsx`):

- 1 columna con título grande (`text-gradient` / `text-gradient-primary`), dos párrafos y un card a la derecha con iconos `ChefHat` → `Code2`.
- Copy i18n en 4 idiomas via `useLanguage()` (`profile.section_label`, `profile.heading_before`, `profile.heading_after`, `profile.bio_p1_*`, etc.).
- Envuelta en `WindowChrome` con título `~/profile.json` y `id="profile"`.

Sistema de diseño (`src/index.css`):

- Tokens HSL en `:root` y overrides en `[data-theme="catppuccin|dracula|tokyo-night"]`.
- Utilidades custom: `.text-gradient`, `.text-gradient-primary`, `.text-gradient-accent`, `.glass`, `.glass-strong`, `.liquid-glass`, `.mesh-bg`, `.grid-bg`, `.glow-primary`, `.glow-accent`, `.hover-glow`, `.terminal-fog`, `.crt-scanlines`.
- `.section-px` = padding horizontal único (`px-6 / md:px-8 / lg:px-10`).
- Layout tokens: `--nav-height: 60px`, `--hero-pad-top: 32px`.
- `.viewport-content` = `calc(100vh - var(--nav-height))`.

Tipografías: Space Grotesk (display), Inter (sans), Courier Prime (body).

---

## 2. Hallazgos del research web (junio 2026)

### r3f / drei / three

- **r3f v10 alpha + drei v11 alpha** (enero 2026) introducen WebGPU y TSL first-class, pero los propios mantenedores y la comunidad coinciden: "no en producción todavía". El estable actual es **r3f 9.6.1** (abril 2026) y **drei 10.7.7**.
- **WebGPU en producción** sigue siendo arriesgado en junio 2026 (crashes con hot-reload de shaders, artefactos en transpilación GLSL→WGSL). Recomendación: WebGL2.
- `useGLTF` + Draco funciona out-of-the-box (decoder desde CDN de Google). `useGLTF.preload` permite precarga de modelos.
- `KTX2` para texturas comprimidas soportado en `three@0.185` via `useKTX2`.
- Patrón 2026 para scroll-3D: `drei` `ScrollControls` + `useScroll` + GSAP timeline sincronizado con `scroll.offset`.
- `@react-three/postprocessing` (versión actual) soporta `EffectComposer` con `Bloom` (selective si `luminanceThreshold=1` + `toneMapped={false}` en materiales emisivos), `DepthOfField`, `Vignette`, `Noise`, `ChromaticAberration`.

### Assets 3D gratuitos encontrados

| Pasión | Modelo candidato | Fuente | Tris | Licencia |
|---|---|---|---|---|
| Gorro chef | "Peppino Chef Hat" by Greg Lynch | Sketchfab | 1.4k | CC-BY |
| Gorro chef | "Chef Hat Low Poly Free" by Zackerr | Sketchfab | 316 | CC-BY |
| Gorro chef | "Chef hat with low-poly mesh" | CGTrader | 1.4k | Royalty Free |
| Mando PS5 | "PS5 Controller" by Taohid Animation | Sketchfab | 104k | CC-BY |
| Mando PS5 | "PS5 DualSense" by AHarmlessPotato | Sketchfab | 112k | CC-BY |
| Mando PS5 | "Sony PS5 DualSense Controller" by be the knight | Sketchfab | 250k | CC-BY |
| Teclado/MIDI | "Realistic Digital Keyboard with Stand" | CGTrader | n/d | Royalty Free (glTF 4.68 MB) |
| Teclado/MIDI | "NanoKeytar Wireless MIDI Controller" | CGTrader | n/d | Royalty Free (glTF, 3 LODs) |

Repositorios generales de CC0 / Royalty Free:

- KhronosGroup `glTF-Sample-Assets` (CC0) — modelos de muestra, no específicos.
- Quaternius (CC0) — pack estilizado "Starter Pack" incluye props.
- Poly Haven Models (CC0) — más enfocado en props/arquitectura.
- Kenney (CC0) — packs de props low-poly.

### AI 3D generation (junio 2026)

- **Meshy 5** (Free: 100 créditos/mes, CC-BY; Pro $20/mes): generalista, mejores PBR. Salida GLB/FBX/OBJ/USDZ en 30–90 s.
- **Tripo v3.1** (Free: 200 créditos/mes, CC-BY): mejor topología, estilizado rápido. Pro ~$12/mes.
- **Rodin Gen-2** (Free: 10 + 30 trial credits, watermark y no-comercial): máxima fidelidad geométrica. Pay-per-download ~$1.50/crédito.
- **TRELLIS.2** (MIT, self-hosted, Apple Silicon nativo): gratis, offline, ~60 s en M-series.
- **Hunyuan 3D 2.1** (open weights, Tencent): gratis si tienes GPU.

Para portfolio personal sin ánimo comercial masivo: la **Free tier de Tripo o Meshy** cubre los 3 modelos con atribución CC-BY. Para uso 100% limpio, **TRELLIS.2 self-hosted** en un Mac es la ruta más segura (MIT, sin atribución).

---

## 3. Opciones de diseño (4 propuestas)

### A · Triptych — 3 columnas simétricas, 3 canvases

- Grid `lg:grid-cols-3` con 3 cards, cada una con su `<Canvas>` lightweight.
- Cada card: texto izq (40%) + 3D der (60%) con el mismo `<Environment preset="city">`.
- Cada modelo con `Float` + `useFrame` rotación mouse-driven.
- Al hover, el modelo se acerca a la cámara vía `CameraControls` con lerp.
- **Pros**: lectura rápida, encaja con el resto del portfolio (cards consistentes), buen responsive.
- **Contras**: 3 canvases simultáneos = más coste de GPU en móvil. Hay que usar `AdaptiveDpr` + `frameloop="demand"` o detección de device tier.

### B · Sticky scroll-jacked — Una sola escena 3D que cambia al hacer scroll (recomendada)

- Un único `<Canvas>` full-height con `ScrollControls pages={3} damping={0.25}`.
- Conforme scrolleas, GSAP timeline mueve la cámara e intercambia el modelo (fade-cross) + sincroniza la opacity del texto.
- Cada "página" = una pasión con su modelo, color de luz y fondo. Sensación Apple-product-page.
- **Pros**: cinematic, alto factor "wow", UNA escena = UNA carga de GPU. Patrón scroll-3D es 2026-vanguardia.
- **Contras**: scroll-jacking puede ser divisivo. Respetar `prefers-reduced-motion` y dar fallback sin canvas.

### C · Horizontal snap museum — Scroll horizontal dentro de la sección

- Sección con scroll vertical normal; dentro aparece un track horizontal (`flex + snap-x mandatory`) con 3 "exhibits" full-height.
- Cada exhibit = modelo 3D grande izq + texto der. Snap al cambiar, micro-animación al entrar.
- **Pros**: muy personal, íntimo, mobile-friendly con `scroll-snap`.
- **Contras**: dentro de un portfolio vertical rompe el ritmo del resto. Mejor si el resto de secciones son más "respiradas".

### D · Showcase window — 3 cards apiladas, modelo en su propio WindowChrome

- Mantiene la estética de "ventanas de terminal" pero cada pasión es una `WindowChrome` individual con `<Canvas>` interno, marco de color distinto (naranja para cocina, verde-jade para gaming, violeta para música).
- Cada modelo con su `ContactShadows` y un `Environment` distinto por sección (dorado / cian / magenta).
- **Pros**: 100% coherente con el sistema actual, más conservador en presupuesto GPU (carga lazy al entrar), más accesible.
- **Contras**: más verboso en código, 3 cards grandes = sección larga. Pierde algo del factor "wow" del scroll-jack.

---

## 4. Matriz de assets

| Asset | Pre-made (Sketchfab/CGTrader) | AI (Meshy/Tripo Free) | Procedural (primitivas three) |
|---|---|---|---|
| **Gorro chef** | Sketchfab "Peppino Chef Hat" (1.4k tris, limpio, CC-BY) o CGTrader "Stylish Chef Hat" (1.91 MB glTF) | Meshy prompt "stylized white chef hat, low-poly, flat shading" → mesh en 30 s | Cilindro con bulge + 3 esferas encima con `MeshStandardMaterial` blanco — feo pero honesto |
| **Mando PS5** | Sketchfab "PS5 Controller" by Taohid (104k tris, CC-BY) o "PS5 DualSense" by AHarmlessPotato (112k tris, CC-BY) | Rodin Gen-2 "stylized PS5 controller, matte black, hero shot" (watermarked en free) | Muy difícil de hacer bien; no recomendado |
| **Teclado/MIDI** | CGTrader "Realistic Digital Keyboard with Stand" (glTF 4.68 MB, Royalty Free) o "NanoKeytar" (glTF, 3 LODs) | Meshy "compact 25-key MIDI controller, knobs, side view" | Posible con boxes + cylinders, queda "diorama" más que "objeto" |

Recomendación: **descarga directa de Sketchfab/CGTrader** (validados, atribución clara) + **un modelo AI-generado con Meshy Free** solo para el que peor quede de los tres. Procedural solo para el gorro si se quiere un "estilo propio" deliberado.

---

## 5. Decisión técnica recomendada

| Capa | Recomendación | Razón |
|---|---|---|
| `r3f` | Mantener 8.18 (o subir a 9.6.1) | Estable, sin reescritura. v10 alpha no compensa el riesgo. |
| `drei` | 9.122 (o 10.7.7) | `Float`, `Environment`, `ContactShadows`, `ScrollControls`, `CameraControls`, `Preload`, `AdaptiveDpr`, `PerformanceMonitor` |
| Modelos | `.glb` Draco-compressed via `useGLTF` + `useGLTF.preload` | 1–4 MB total, lazy con `<Suspense>` |
| Texturas | KTX2 via `useKTX2` si existen; si no, PNG | `three@0.185` soporta KTX2 |
| Animación | `useFrame` para mouse-look + GSAP timeline para scroll-sync | GSAP 3.15 ya está en el proyecto |
| Postprocessing | `EffectComposer` con `Bloom` (selective) + `Vignette` + sutil `ChromaticAberration` solo en desktop | Premium look sin romper performance |
| Mobile fallback | `dpr={[1, 1.25]}` + `frameloop="demand"` + `PerformanceMonitor` | Freno a caídas de FPS en gama media-baja |
| i18n | Mantener `useLanguage()` con keys nuevas `profile.passion.{cooking|gaming|music}.{title|body}` | Compatible con sistema actual |

---

## 6. Decisiones cerradas (input del usuario)

1. **Opción de diseño**: **B — Sticky scroll-jacked con `ScrollControls` + GSAP timeline**.
2. **Estrategia de assets**: **Mix — descarga directa de Sketchfab/CGTrader CC-BY + 1 AI-generado (Meshy Free) si hace falta**.
3. **Versión del stack**: **Subir a r3f 9.6.1 + drei 10.7.7** (estable abril 2026).
4. **i18n copy**: **Yo redacto borrador en 4 idiomas, usuario valida en una sola pasada**.
5. **Mobile fallback**: **Scroll-jack solo en ≥md**. En <md fallback a 3 cards apiladas con su `<Canvas>` individual, scroll vertical normal.
6. **Camera path**: **Curva CatmullRom 3D con ligero orbit** en cada modelo (no traslación lineal).

### Defaults que asumo (comentados en el spec, no bloqueantes)

- **"Samu"**: sí aparece en el copy de música, como pidió el usuario en el briefing.
- **Reduced motion**: fallback a cards estáticas (no canvas) con texto + miniatura del modelo.
- **Anclas de nav**: `#profile` salta al inicio del scroll-jack; cada pasión no tiene anchor individual.
- **Cross-fade de modelos**: 0.5 s.
- **Lenis**: se desactiva dentro de la sección `ProfileShowcase` (ScrollControls usa su propio scroll container).
- **Postprocessing**: solo desktop, solo `Bloom` selective + `Vignette`. `ChromaticAberration` apagado por defecto.
- **Anclaje de cada pasión**: cocina (luz cálida naranja), gaming (verde-jade), música (violeta primario).

---

## 7. Próximos pasos (cuando se apruebe)

1. Escribir spec detallado en `docs/superpowers/specs/2026-07-01-profile-3d-redesign.md` con arquitectura, componentes, modelo de datos, accesibilidad, testing y estrategia de assets concreta.
2. Review del spec por el usuario.
3. Invocar skill `writing-plans` para generar plan de implementación.
4. Implementar (probablemente vía `@designer` para layout/interacción y `@fixer` para bounded execution).
5. Verificar con `npm run lint` + `npm test` + `npm run build`.

---

## 8. Pivot — 4 ideas sin 3D (2026-07-01, decisión del usuario)

El usuario reconsidera y descarta el render 3D para esta iteración. La sección debe construirse con DOM/SVG/CSS/HTML5 puro, aprovechando el design system existente (HSL custom properties, `.glass`, `.text-gradient`, `.liquid-glass`, `WindowChrome`, framer-motion). 3D queda como deuda para una iteración futura.

### Idea A · "Terminal Passion Logs" — 3 ventanas con logs timestamped

- Layout: 3 columnas en `lg+`, stack vertical en mobile. Cada columna es una `WindowChrome` con título `~/cooking.log`, `~/gaming.log`, `~/music.log`.
- Contenido: lista de entradas con timestamp, en estilo terminal. Ejemplo:
  ```
  [2024-03-14 18:42:32] PEZ TOMILLO · head chef
  [2024-06-02 22:18:05] Alsea · 200 covers, peak service
  [2025-09-19 11:03:00] Curso de cocina asiática · certificado
  ```
- Animación: typewriter al entrar la card en viewport (1 línea cada 80-120ms, después del click de la card o al hover).
- Interacción: click en una entrada → expande con detalle. Cursor parpadeante al final del log.
- Acento por pasión: el color del prompt `[user@portfolio]$` cambia por pasión (naranja, verde, violeta).
- **Pros**: 100% on-brand con el resto del portfolio (que ya usa `WindowChrome` con estética terminal), íntimo, performante, sin assets externos, copy protagonista.
- **Contras**: puede sentirse "esperado" dado que el portfolio ya tiene muchos `WindowChrome`. Requiere buen copy y buenos datos para que cada log no quede genérico.

### Idea B · "Spotify Wrapped" — 3 cards de stats animados con gradient

- Layout: 3 cards grandes stacked verticalmente, cada una ocupa 100vh. Sticky interior que revela progresivamente.
- Contenido: cada card tiene un gradient propio (naranja, verde, violeta), 3-4 stats con contador animado que sube al entrar en viewport, y un copy breve.
  - Cocina: "5 años en hostelería", "200+ servicios de alta presión", "3 roles de head chef".
  - Videojuegos: "1.000+ horas", "47 historias terminadas", "1 comunidad que adora".
  - Música: "4 años produciendo", "11 tracks finalizados", "2 releases publicados".
- Animación: el contador sube de 0 al valor real en 1.5s con easing. "Now playing" ribbon en la parte superior. Click → expande con el copy completo.
- Acento: tipografía enorme (clamp(4rem, 8vw, 8rem)) para los números, Inter para el copy, Space Grotesk para el label.
- **Pros**: moderno, compartible, "wow" inmediato, datos concretos dan credibilidad, ritmo claro.
- **Contras**: puede sentirse "plantilla" si no se personaliza. Requiere stats honestas (no inventar). Menos íntimo que las otras opciones.

### Idea C · "Bento Grid interactivo" — 6 cells con interacciones únicas

- Layout: bento grid asimétrico (`grid-template-areas`). En `lg+`: 2 filas × 3 columnas con celdas de tamaños variables. En mobile: stack vertical.
- Celdas (6 en total):
  - **Cocina** (2 cells): flip card con receta de autor, carrusel de "técnicas dominadas" con iconos.
  - **Videojuegos** (2 cells): grid de iconos de juegos favoritos con hover que revela el género, "mi setup" con SVG inline del PC/mando.
  - **Música** (2 cells): SVG waveform animada (path morphing al hacer hover), lista de equipos/software favoritos.
- Animaciones: microinteracciones everywhere (hover scale, glow, focus rings, prefers-reduced-motion respetado).
- **Pros**: moderno (estilo Linear/Stripe/Apple), explorable, alto engagement, permite añadir más pasiones en el futuro sin romper el layout.
- **Contras**: más trabajo de diseño, requiere assets SVG inline o iconografía coherente. Puede sentirse genérico si no se hace bien. Cada cell es un mini-componente.

### Idea D · "Polaroid scrapbook" — polaroids rotadas con notas manuscritas

- Layout: grid con CSS columns o flex wrap. 6-9 polaroids (2-3 por pasión) ligeramente rotadas (-8° a +8° random con `transform: rotate()`).
- Contenido: cada polaroid tiene una imagen (Pexels/Unsplash para tema cocina/gaming/música), un caption manuscrito (Caveat, Kalam o font de Google Fonts), y una pequeña "metadata" abajo (fecha, lugar).
- Animación: hover → la polaroid se "endereza" (rotation 0deg) y sube (`translateY(-8px)`) con spring. Click → modal/lightbox con la polaroid en grande + copy.
- Acento: sombra de profundidad (`box-shadow: 0 12px 24px rgba(0,0,0,0.35)`), cinta adhesiva en la esquina (`::before` con gradient sepia), fondo texturizado (sutil noise SVG).
- **Pros**: el más personal e íntimo, perfecto para "esto soy yo" / hobbies, alto "encanto", gran foto puede transmitir más que 1.000 palabras.
- **Contras**: requiere imágenes (Pexels/Unsplash con download directo, o用户提供). La handwriting font puede chocar con la estética Inter/Space Grotesk del resto (mitigable con uso selectivo solo en captions). Más difícil de mantener accesible.

### Idea E (bonus) · Híbrido Terminal+Bento

- 1 hero header (label + title + intro)
- 3 columnas (en lg+) o stack (mobile). Cada columna es una `WindowChrome` con título `~/cooking.log` y dentro un mini-bento con:
  - 1 cell grande: copy principal (4-5 líneas)
  - 1 cell stats: 2-3 números con contador animado
  - 1 cell log: 3-4 entradas con timestamp
  - 1 cell media: SVG ilustrativo o foto (sin 3D)
- Ventaja: combina la coherencia de A con la variedad visual de C. Cada pasión se siente única.
- **Pros**: lo mejor de A y C. Mucha personalidad sin perder orden.
- **Contras**: 12 cells en total = más trabajo de diseño. Requiere buen sistema de tipos y espaciado.

### Mi recomendación

**A (Terminal logs)** si quieres máxima coherencia con el resto del portfolio y el copy es fuerte. **D (Polaroid)** si quieres transmitir "persona" y tienes/dispones de imágenes. **B (Spotify Wrapped)** si quieres que la sección comunique credibilidad y datos de un vistazo. **C (Bento)** si quieres explorabilidad y "wow" interactivo.

Para tu mensaje de "esencia" + "como me muestro al mundo", yo apostaría por **A o D**, con **E** como upgrade si te animas a más densidad.

### Decisión pendiente

¿Cuál de las 4 ideas (A, B, C, D) o el híbrido E? Una vez elegida, escribo el spec en `docs/superpowers/specs/` y entramos a plan + ejecución.
