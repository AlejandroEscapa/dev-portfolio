# Portfolio Redesign Brainstorm — 2026 Peak Design Research

> **Fecha:** 2026-06-30
> **Autor:** Análisis generado con brainstorming estructurado + research
> **Estado:** Exploración de opciones (sin implementación aún)

---

## TL;DR

El portfolio actual es **sólido pero genérico** dentro del estilo terminal. En 2026, los portfolios que destacan son **experiencias 3D inmersivas scroll-driven**, **ASCII art generativo**, o **híbridos de ambos**. El estilo "window chrome macOS + dark theme + blobs" está saturado.

Este documento explora 4 direcciones posibles, con trade-offs, dependencias, y una recomendación.

---

## 1. Análisis del estado actual

### Lo que tenemos (src/components/)

| Componente | Función | Calidad |
|---|---|---|
| `MeshBackground` | Blobs orbitales + lens flare + grid | Bueno, pero genérico |
| `WindowChrome` | Ventanas macOS-style para secciones | Competente |
| `BootSequence` | Pantalla tipo BIOS al cargar | Nice touch, pero visto |
| `CliTerminal` | Terminal interactivo bottom-right | Muy bueno, único |
| `CrtOverlay` | Scanlines + vignette toggleable | Opcional, no siempre activo |
| `OrbitalBlob` | 4 blobs con waypoints de animación | Sólido |
| `LensFlareOverlay` | 4 capas de flare con scroll | Decente |
| `Nav` | Pill flotante con detección de sección activa | Limpio |
| 4 temas | Default, Catppuccin, Dracula, Tokyo Night | Bien implementado |

### Secciones (src/components/sections/)

- Hero, About, Profile, TechStack, Experience, Projects, Education, Footer
- Todas usan `glass` + `liquid-glass` + gradients + Framer Motion
- Bento grid en TechStack
- Timeline con scroll-progress en Experience
- Project cards con mockups (phone/browser)

### Stack técnico

- **Vite + React 18 + TypeScript**
- **Tailwind v4** (con `@theme inline` pattern)
- **Framer Motion** para animaciones
- **shadcn/ui + Radix** (muchos instalados, pocos usados)
- **Framer Motion** para spring animations
- **lucide-react** para iconos
- **i18n** (en/es) ya implementado

### Lo que falta (perfil técnico)

- **Three.js / R3F** — no instalado
- **GSAP** — no instalado (alternativa: Framer Motion)
- **Lenis** (smooth scroll) — no instalado
- **Postprocessing** — no instalado
- **Custom shaders** — no usado

---

## 2. Research: Tendencias 2026 en developer portfolios

### 2.1 Lo que está ganando premios en Codrops/Awwwards (Q1-Q2 2026)

| Portfolio | Concepto | Stack clave |
|---|---|---|
| **Sketching the Impossible** (Tomasz Szmajda) | Portfolio entero en "habitaciones" 3D, sin modelos 3D reales (texturas pintas sobre flat geometry) | R3F + GSAP + custom GLSL shaders |
| **They Call Me Giulio** (Giulio Collesei) | Cyberpunk cinematic, dolly zoom como entrada, textos integrados en escena 3D | Three.js + GSAP + dolly zoom + Room of Memories |
| **R—K '26** (Ravi Klaassens) | Minimalismo extremo con presencia brutal, dock en vez de navbar, transiciones cinematográficas | Editorial layout + custom motion |
| **Mountain Portfolio** (Arthur Torres) | Mundo 3D explorable free-flight, cada zona cuenta parte de la historia | R3F + GSAP + 3D world + routes por zona |
| **VertexFlow** (Salony Ranjan) | 3D portfolio cinematic, glassmorphism overlay sobre WebGL canvas | Three.js + R3F + Drei + Postprocessing + Lenis + GSAP |
| **3D Portfolio Showcase** (askoti) | Scroll-driven camera animations, 3D project cards con tilt | R3F + ScrollTrigger + Next.js |

### 2.2 Patrones recurrentes en portfolios 2026 peak

1. **Restraint over abundance** — un solo concepto visual fuerte, sostenido
2. **Scroll-driven chapters** — cada proyecto/sección es un "capítulo" con su propia escena
3. **Mobile-first** — recruiters navegan en móvil
4. **Custom typography** — display font único, no Inter/Roboto
5. **Accessibility** — `prefers-reduced-motion` respetado
6. **WebGPU + Gaussian Splatting** como próxima frontera (finales 2026)

### 2.3 Anti-patrones (lo que ya NO impresiona)

- "Particle field hero with rotating logo" — sobre-saturado
- Window chrome macOS-style con traffic lights — visto 1000 veces
- Generic dark theme + purple gradient + glassmorphism
- Three.js sphere flotando sin propósito
- NFT/Metaverse-themed portfolios (audiencia que se fue)

### 2.4 Bibliotecas/librerías que dominan 2026

| Herramienta | Propósito | Estado en tu proyecto |
|---|---|---|
| **Three.js** | WebGL engine | No instalado |
| **@react-three/fiber** | React renderer para Three.js | No instalado |
| **@react-three/drei** | Helpers (Environment, OrbitControls, etc.) | No instalado |
| **@react-three/postprocessing** | Bloom, DOF, chromatic aberration | No instalado |
| **GSAP + ScrollTrigger** | Animation timelines | No instalado |
| **Lenis** | Smooth scroll physics | No instalado |
| **Framer Motion** | UI micro-interactions | Instalado ✓ |
| **Tailwind v4** | Styling | Instalado ✓ |
| **Custom GLSL shaders** | Efectos únicos | No usado |

---

## 3. Research: Three.js / R3F para portfolios

### 3.1 Capacidades técnicas

#### ASCII Art en Three.js (SÍ es posible)
- **Post-processing pass** que convierte el render a caracteres ASCII
- Bibliotecas: `three.js` + custom shader con mapeo de luminosidad → char index
- Efecto: tu escena 3D renderizada como arte ASCII en tiempo real
- Alternativa: renderizar a canvas, samplear pixels, mapear a string grid

#### 3D Typography
- TextGeometry (from font JSON) o troika-three-text (más flexible)
- Morphing letters, floating text, text reacting to mouse
- **Drei** tiene `<Text3D />` que simplifica esto

#### Particle Systems
- GPU instancing para miles de partículas
- Drei: `<Points />`, `<Sparkles />`, custom shaders
- Use cases: starfields, floating tech icons, "code rain" mejorado

#### Fluid Simulation
- WebGL fluid simulation (como el de Pavel Dobryakov) en canvas
- Custom shader para ondas, plasma, noise
- Perfecto para backgrounds interactivos

#### Post-processing
- Bloom (glow en elementos brillantes)
- Chromatic aberration (RGB split en movimiento de cursor)
- Depth of field (focus en hero, blur en distancia)
- Noise/grain (film grain)
- Glitch (efecto VHS/datamosh)

#### Custom Shaders
- GLSL escrito a mano
- Use cases: displacement, color grading, generative patterns
- Dificultad: media-alta (requiere entender GPU pipeline)

### 3.2 Performance considerations

| Técnica | FPS impact | Mobile OK? |
|---|---|---|
| Particles (< 1000) | Bajo | Sí |
| Particles (> 5000) | Medio | Con cuidado |
| Bloom + DOF | Medio | Fallback en mobile |
| Fluid simulation | Alto | Solo desktop o reducido |
| Custom shaders simples | Bajo | Sí |
| Custom shaders complejos | Medio-Alto | Versión simplificada |
| ASCII post-process | Medio | Depende de resolución |
| 3D text (TextGeometry) | Bajo-Medio | Sí |

**Regla 2026:** device tier detection → versión simplificada en mobile

### 3.3 Ejemplos concretos de efectos visuales posibles

1. **Hero con 3D text que morphs** — tu nombre "Alejandro" en 3D rotando, con wireframe mode toggle
2. **Tech stack icons flotando en 3D space** — los icons orbit alrededor del cursor, clickeables
3. **WebGL fluid background** — el MeshBackground actual reemplazado por simulación de fluidos real
4. **Project cards con 3D tilt + WebGL reflections** — chrome-like reflections en las cards
5. **ASCII post-process overlay** — todo el portfolio en modo "hacker terminal" con un toggle
6. **Particle constellation** — las skills forman constelaciones conectadas
7. **Scroll-driven camera flythrough** — cada sección es una "habitación" 3D
8. **3D timeline** — tu experiencia profesional como un camino 3D con waypoints

---

## 4. Research: ASCII Art / Lettering / Graffiti en web 2026

### 4.1 Estado del arte

#### Proyectos notables
- **GlyphStream** (glyphstream.vercel.app) — 5 algoritmos ASCII art generativos sin dependencias, incluyendo flow fields y reactive art
- **ASCII Type** (sachibon.com) — CSS typeface hecha con caracteres ASCII, estilo malware art
- **Asciiara** (byllzz/asciiara) — 35+ fonts ASCII hand-crafted incluyendo estilos graffiti, glitch, matrix, neon
- **ASCILINE Studio** — Engine propietario que convierte video a ASCII art interactivo con CSS effects
- **ripley-portfolio** (alexengineered) — Portfolio con ASCII art intro, monospace, neon green
- **Cyber Terminal Portfolio** (Akshatr08) — Matrix rain + typewriter + interactive commands

#### Estilos de ASCII art identificados
- **Classic ASCII**: `###`, `---`, `***` para formas básicas
- **Box-drawing**: `┌─┐│└┘├┤` para arquitectura
- **Block elements**: `█▓▒░` para shading/gradients
- **Unicode extended**: emojis, símbolos matemáticos, braille patterns
- **Braille art**: ⠿⣿ para alta resolución (2x3 pixels per char)
- **Generative / Perlin noise driven**: partículas que forman patrones orgánicos
- **Reactive**: mouse/keyboard/audio input que modifica el output
- **Typographic**: texto renderizado como arte (variable font weights × ASCII)

### 4.2 Técnicas para implementar ASCII art en React

#### Opción A: ASCII como background CSS
- Generar grid de `<span>` con caracteres random/semi-random
- Animar con `requestAnimationFrame` actualizando text content
- Estilo Matrix rain, terminal screensavers

#### Opción B: ASCII como post-processing de 3D
- Renderizar escena 3D a texture
- Custom shader samplea pixels y mapea luminosity a char index
- Output en canvas overlay o HTML grid

#### Opción C: ASCII typography
- Pre-generar un set de letras en ASCII art
- Usar monospace font
- Cada "letra" es un bloque de caracteres (3-5 líneas × 5-7 cols)

#### Opción D: Lettering/Graffiti style
- Custom font SVG path
- Variable font weights con CSS
- Spray paint effect con WebGL particle system
- "Tags" estilo graffiti como accent en headers

### 4.3 ASCII Art + 3D = Combo potente

Lo más interesante que vi: **ASCII shader post-process en Three.js**

```glsl
// Pseudo-shader
float luminosity = sample(originalRender, uv).r;
int charIndex = int(luminosity * float(charCount));
output = characterAtlas[charIndex];
```

Esto convierte cualquier escena 3D a arte ASCII en tiempo real. Tu portfolio podría tener un "mode toggle" entre vista normal y vista ASCII.

---

## 5. Opciones de rediseño (4 direcciones)

### Opción A: Evolución del terminal (BAJA transformación)

**Concepto:** Mantener la estructura actual pero añadir un "killer feature" visual: un ASCII post-process shader que cubre toda la página, con un toggle para activar/desactivar.

#### Cambios
- Añadir Three.js para el post-process (o un canvas con sample-and-replace)
- El MeshBackground se mantiene, pero ahora tiene un toggle "ASCII mode"
- En ASCII mode, todo el contenido (texto, cards) se renderiza como arte ASCII
- El CLI terminal se expande con más comandos
- Boot sequence se mejora con más líneas y más "hacker vibes"

#### Pros
- Riesgo bajo (no rompes lo que funciona)
- Rápido de implementar (1-2 features nuevas)
- Mantiene la identidad actual
- El toggle ASCII es un wow factor inmediato
- Performance: el ASCII solo activo on-demand

#### Cons
- Sigue siendo "otro terminal portfolio" en su base
- No es memorable fuera del toggle
- El window chrome sigue siendo genérico

#### Dependencias nuevas
- `three` (opcional, se puede hacer con canvas2d)
- `@react-three/fiber` (opcional)
- `@react-three/postprocessing` (opcional)

#### Esfuerzo
- 1-2 semanas de trabajo
- 1-2 archivos nuevos + integración

---

### Opción B: Revolución inmersiva 3D (ALTA transformación)

**Concepto:** Transformar el portfolio en un **mundo 3D scroll-driven** donde cada sección es una "escena" a la que la cámara vuela. El contenido (texto, cards) se posiciona en el espacio 3D con profundidad. El terminal se mantiene como Easter egg / modo alternativo.

#### Cambios
- Eliminar WindowChrome de las secciones
- El index.tsx se convierte en un único `<Canvas>` con scroll-driven camera
- Cada sección es un "capítulo" 3D con su propia posición de cámara
- GSAP ScrollTrigger controla la cámara (no el scroll nativo)
- El contenido HTML se posiciona en 3D space con `Html` de Drei
- El fondo es una escena 3D generativa (particles + meshes + lighting)
- Transiciones entre secciones: cámara vuela entre puntos, objetos morphan
- Performance: device tier detection, versión mobile simplificada

#### Pros
- Wow factor brutal (los que ganan premios en 2026)
- Demuestra skills de WebGL/3D (diferenciador para recruiters)
- Scroll como experiencia cinematográfica, no como navegación
- Mobile-first con fallback simplificado

#### Cons
- Mucho trabajo (rehacer secciones enteras)
- Performance risk (WebGL en mobile es delicado)
- SEO: Google puede no indexar bien contenido en canvas
- Accesibilidad: requiere `prefers-reduced-motion` muy bien implementado
- El contenido textual (about, experience) puede ser difícil de leer en 3D
- Reescribir toda la arquitectura

#### Dependencias nuevas
- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`
- `gsap`
- `lenis`

#### Esfuerzo
- 4-8 semanas
- Refactor significativo de toda la app
- Nueva arquitectura de secciones

---

### Opción C: Híbrido: ASCII art generativo + contenido reveal (TRANSFORMACIÓN MEDIA-ALTA)

**Concepto:** El portfolio tiene un **background ASCII art generativo** que reacciona al scroll, mouse, y sección actual. El contenido (cards, texto) se revela orgánicamente "atravesando" el ASCII. El window chrome se elimina. El CLI se mantiene como herramienta flotante. El terminal aesthetic se mantiene pero más sutil.

#### Cambios
- Eliminar WindowChrome (o hacerlo opcional como modo)
- El MeshBackground se reemplaza por un canvas generativo con:
  - ASCII flow field (Perlin noise) que reacciona al mouse
  - ASCII typography que morpha con el scroll
  - Reactive chars que siguen al cursor
- Las secciones se revelan con "dissolve" effect (texto aparece, ASCII se reorganiza)
- El CLI terminal se mantiene bottom-right (ya lo tienes, está bien)
- Los project cards ganan ASCII borders/accents
- Tech stack icons se renderizan en ASCII style

#### Pros
- Diferenciador claro (casi nadie tiene esto)
- Combina lo mejor de ASCII art + UI moderna
- Performance: ASCII canvas es más ligero que WebGL
- Mantiene legibilidad del contenido
- El terminal aesthetic se eleva, no se elimina
- Único: nadie está haciendo esto en portfolios ahora

#### Cons
- Trabajo medio (rebuild del background, integrar en secciones)
- El ASCII puede cansar visualmente si es demasiado denso
- Requiere cuidado con la accesibilidad (ofrecer fallback)
- El efecto de "revelación" necesita estar bien afinado

#### Dependencias nuevas
- Posiblemente `three` para post-process, o canvas2d puro
- `simplex-noise` o `noisejs` para Perlin noise
- `gsap` (opcional, para las reveal animations)
- `lenis` (opcional, para smooth scroll)

#### Esfuerzo
- 2-4 semanas
- Reemplazo del background system + ajustes en secciones

---

### Opción D: Editorial / Magazine brutalismo (TRANSFORMACIÓN MEDIA)

**Concepto:** Abandonar el terminal aesthetic completamente. Adoptar un estilo **editorial / brutalist** con tipografía display impactante, layouts asimétricos, gridded composition, y un toque de arte generativo. Inspirado en portfolios como **R—K '26** o **The Ringo**.

#### Cambios
- Eliminar window chrome, boot sequence, CLI terminal (o relegarlos a Easter egg)
- Cambiar la tipografía display a algo más editorial (GT Sectra, Migra, Editorial New, etc.)
- Layout magazine-style: columns, asymmetric grids, generous whitespace
- Un toque generativo: SVG noise filters, procedural shapes como accents
- Hero con display type a pantalla completa + una imagen/video
- Project case studies con formato de "magazine spread"
- Color: o bien monocromático (black/white/one accent) o paleta curada de 3-4 colores
- Sin glassmorphism (más dry, más typographic)

#### Pros
- Diferenciador claro (no es "otro dev portfolio")
- Más rápido de implementar que 3D world
- Excelente para SEO y accesibilidad
- Legibilidad máxima del contenido
- Tipografía como protagonista

#### Cons
- Requiere encontrar/implementar fonts editoriales (licencias)
- Requiere buen ojo de diseño (no es "solo código")
- Menos "wow visual" inmediato que 3D
- El usuario pidió no dejar el terminal, así que esto contradice

#### Dependencias nuevas
- Fonts editoriales (pueden tener costo)
- Sin librerías nuevas pesadas

#### Esfuerzo
- 2-3 semanas
- Refactor de tipografía + layouts + remover componentes

---

## 6. Comparativa rápida

| Criterio | A: Evolución | B: Revolución 3D | C: Híbrido ASCII | D: Editorial |
|---|---|---|---|---|
| **Wow factor** | Medio | Muy alto | Alto | Medio |
| **Riesgo** | Bajo | Alto | Medio | Bajo |
| **Esfuerzo** | 1-2 sem | 4-8 sem | 2-4 sem | 2-3 sem |
| **Performance** | OK | Delicado | OK | Excelente |
| **Mobile** | OK | Requiere fallback | OK | Excelente |
| **Accesibilidad** | OK | Complejo | Medio | Excelente |
| **SEO** | OK | Complejo | OK | Excelente |
| **Mantenibilidad** | Alta | Baja | Media | Alta |
| **Diferenciación** | Media | Alta | Muy alta | Alta |
| **Skills que demuestra** | Lo actual | WebGL/3D/Shaders | Creative coding + ASCII | Typography + Design |

---

## 7. Mi recomendación

**Opción C: Híbrido ASCII art + contenido reveal** es la que mejor balance da:

1. **Es única** — no hay docenas de portfolios haciendo esto
2. **Es alcanzable** — 2-4 semanas, no 4-8
3. **Mantiene tu identidad terminal** — no pierdes lo que ya tienes
4. **Es performante** — canvas generativo es más ligero que WebGL
5. **Demuestra skills de creative coding** — Perlin noise, generative art, ASCII shaders
6. **Es memorable** — el efecto "ASCII que se reorganiza al scroll" es inmediatamente memorable
7. **Es 2026** — exactamente en la intersección de las tendencias que investigué

### Roadmap sugerido para Opción C

#### Fase 1: ASCII Generative Background (semana 1-2)
- Reemplazar MeshBackground con canvas ASCII generativo
- Implementar flow field con Perlin noise
- Caracteres que se reorganizan orgánicamente
- Reactivo a mouse position
- Performance budget: 60fps desktop, 30fps mobile

#### Fase 2: Content Reveal System (semana 2-3)
- Sistema de "reveal" donde las secciones aparecen atravesando el ASCII
- El ASCII se "abre" cuando una sección entra en viewport
- Transiciones orgánicas entre secciones
- El contenido textual se mantiene legible (no afectado por ASCII)

#### Fase 3: Polish & Easter Eggs (semana 3-4)
- Mantener CLI terminal como Easter egg
- Mantener boot sequence (más corto)
- Modo "full ASCII" toggle (contenido + background)
- Sound effects sutiles (opcional)
- Device tier detection
- prefers-reduced-motion

#### Bonus: Three.js ASCII post-process (si da tiempo)
- Si en Fase 1-2 hay余裕, añadir un modo "3D ASCII"
- El MeshBackground puede tener una versión 3D con post-process ASCII
- Esto te daría el "killer feature" de la Opción A integrado en la C

---

## 8. Próximos pasos

Si decides seguir alguna dirección:

1. **Aprobar una opción** (A, B, C, o D)
2. **Definir scope** exacto (full implementation vs MVP)
3. **Priorizar features** (ASCII reveal vs CLI enhancements vs 3D)
4. **Crear spec document** con detalle técnico
5. **Implementation plan** con tasks específicas

### Preguntas pendientes para clarificar

- ¿Cuál es tu target audience? (recruiters, clientes freelance, ambos)
- ¿Cuánto tiempo tienes disponible?
- ¿Tu portfolio actual está en producción? (cambios in-place vs v2 nueva)
- ¿Tienes restricciones de performance / SEO?
- ¿Presupuesto para fonts/licencias?

---

## 9. Referencias investigadas

### Codrops 2026 portfolio features
- [Sketching the Impossible](https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/)
- [They Call Me Giulio](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/)
- [R—K '26](https://tympanus.net/codrops/2026/04/07/r-k-26-the-thinking-and-code-behind-a-portfolio-led-by-presence/)
- [Arnaud Rocca's Portfolio](https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/)
- [More Than a Portfolio](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)

### 3D portfolio examples (GitHub)
- [VertexFlow](https://github.com/salonyranjan/VertexFlow) — Three.js + R3F + GSAP
- [Mountain Portfolio](https://github.com/ArthurTorres75/mountain-portfolio) — Free-flight 3D world
- [folio-2026](https://github.com/iTzRitual/folio-2026) — WebGL flat UI → 3D reveal
- [AaronJCunningham/portfolio](https://github.com/AaronJCunningham/my-portfolio) — Three.js + GLSL + AI art

### ASCII art references
- [GlyphStream](https://glyphstream.vercel.app/) — 5 generative ASCII algorithms
- [ASCII Type — Sarah](https://sachibon.com/ASCII-Type) — CSS ASCII typeface
- [Asciiara](https://github.com/byllzz/asciiara) — 35+ ASCII fonts
- [ASCILINE Studio](https://www.asciline.dev/) — ASCII video engine
- [ripley-portfolio](https://github.com/alexengineered/ripley-portfolio) — ASCII art intro

### 3D Portfolio Trends 2026
- [3D Portfolio Trends 2026 — Svilenković](https://svilenkovic.com/3d/3d-portfolio-trends-2026)
- [Best Three.js Portfolio Examples](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025)

---

## 10. Estado del documento

**Decisión pendiente:** Esperando selección de opción (A, B, C, o D) para proceder con la siguiente fase (spec document + implementation plan).
