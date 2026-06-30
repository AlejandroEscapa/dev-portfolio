# Portfolio Redesign Brainstorm v2 — 2026 Peak Design Research

> **Fecha:** 2026-06-30
> **Autor:** Análisis con brainstorming estructurado + research web profunda
> **Estado:** Listo para seleccionar opción y desglosar
> **Stack actual:** Vite + React 18 + TypeScript + Tailwind v4 + Framer Motion + shadcn/ui + i18n (es/en)

---

## TL;DR

El portfolio actual es **sólido pero saturado** dentro del estilo terminal/OS. En 2026 hay decenas de portfolios terminal en GitHub (ctOS, Tidepool, SAMI-portifolio, tfish, hackknow-os, etc.). Para destacar hay que **elevar la identidad terminal con 3D + creative coding**, no quedarse en "otro terminal portfolio".

Este documento presenta **4 propuestas completas** con ejemplos webs reales, stack técnico, fases de implementación y tasks desglosados. Tras elegir una, se escribe el design document y el implementation plan.

---

## 1. Diagnóstico del portfolio actual

### Lo que tienes y funciona

| Componente | Función | Calidad |
|---|---|---|
| `MeshBackground` | Blobs orbitales + lens flare + grid | Genérico (saturado en 2026) |
| `WindowChrome` | Ventanas macOS-style para secciones | Competente pero visto 1000 veces |
| `BootSequence` | Pantalla tipo BIOS al cargar | Nice touch, acortable |
| `CliTerminal` | Terminal interactivo bottom-right | Muy bueno, único, mantener |
| `CrtOverlay` | Scanlines + vignette toggleable | Opcional, mantener |
| `OrbitalBlob` | 4 blobs con waypoints | Reemplazable |
| `LensFlareOverlay` | 4 capas de flare con scroll | Reemplazable |
| `Nav` | Pill flotante con detección de sección activa | Limpio, mantener |
| 4 temas | Default, Catppuccin, Dracula, Tokyo Night | Bien implementado, mantener |
| `SidePanel` | Quick actions + mini terminal + CV | Útil, mantener |
| i18n es/en | Ya implementado | Mantener |

### Lo saturado en 2026 (anti-patrones)

- Window chrome macOS con traffic lights → visto 1000 veces
- Mesh blobs + glassmorphism purple → genérico
- "Otro portfolio terminal" → hay decenas en GitHub 2026
- Particle field hero con logo rotando → sobre-saturado
- Three.js sphere flotando sin propósito → no impresiona

### Lo que gana premios en 2026 (Awwwards SOTD / Codrops Q1-Q2)

- **Scroll-driven 3D scenes** — cámara vuela entre secciones
- **Flow fields con curl noise** — GPU particles, orgánico
- **Tipografía display** como protagonista (no Inter/Roboto)
- **Restraint** — un solo concepto fuerte, no todos los efectos
- **Lenis smooth scroll + GSAP ScrollTrigger** como base técnica
- **prefers-reduced-motion** respetado como diseño paralelo, no fallback
- **WebGPU + Gaussian Splatting** como próxima frontera (finales 2026)

### Stack que falta (perfil técnico)

| Herramienta | Propósito | Estado |
|---|---|---|
| `three` | WebGL engine | No instalado |
| `@react-three/fiber` | React renderer para Three.js | No instalado |
| `@react-three/drei` | Helpers (Float, Instances, Text3D, Environment) | No instalado |
| `@react-three/postprocessing` | Bloom, DOF, chromatic aberration | No instalado |
| `gsap` + ScrollTrigger | Animation timelines | No instalado |
| `lenis` | Smooth scroll physics | No instalado |
| `simplex-noise` | Perlin/curl noise para flow fields | No instalado |
| Custom GLSL shaders | Efectos únicos | No usado |

---

## 2. Las 4 propuestas

---

### Propuesta 1: "Terminal Evolved" ⭐ RECOMENDADA

**Concepto:** Mantienes la identidad terminal/OS que ya tienes, pero la elevas con un hero 3D, iconos tech flotantes en 3D, y un background moderno de flow field (en vez de los mesh blobs genéricos). El CLI terminal se queda. WindowChrome se mantiene pero más sutil.

#### Elementos clave

- **Hero:** Objeto 3D estilizado orbitando (wireframe geométrico o ascii-art 3D shape que rota) que reacciona al mouse. Text reveal con glitch/decode effect. Tipografía display grande (no Inter).
- **Background:** Reemplazar `MeshBackground` por **flow field WebGL con curl noise** — partículas que fluyen siguiendo un campo de ruido. Reactivo al cursor. Performance: ~2000 partículas desktop, ~500 mobile.
- **Tech stack section:** Iconos 3D rotantes con `@react-three/drei` `<Float>` + `<Instances>` — logos de React, TS, Node, etc. flotan y rotan en 3D, hover hace zoom. Clickeables para filtrar proyectos.
- **Scroll animations:** GSAP ScrollTrigger + Lenis smooth scroll. Reveal staggered, parallax en project cards, pinned sections.
- **Se mantiene:** CLI terminal, boot sequence (acortado), 4 temas, i18n, SidePanel, info para recruiters.
- **Se va:** MeshBackground genérico, OrbitalBlob, LensFlareOverlay (reemplazados por flow field).

#### Stack nuevo

- `three`, `@react-three/fiber`, `@react-three/drei`
- `gsap` (+ ScrollTrigger), `lenis`
- `simplex-noise` (para curl noise flow field)

#### Pros / Cons

| Pros | Cons |
|---|---|
| Wow factor alto | Curva de aprendizaje R3F media |
| Mantiene tu identidad terminal | Performance requiere device-tier detection |
| Recruiters encuentran todo fácil | Hay que integrar R3F bien |
| Demuestra creative coding + 3D | |
| Mobile factible con fallbacks | |
| Diferenciado (terminal + 3D flow field, combinación rara) | |

#### Esfuerzo: 2-4 semanas

#### Ejemplos webs

- **VertexFlow** — https://github.com/salonyranjan/VertexFlow
  WebGL hero + 3D tilt cards + glassmorphism overlay. Exactamente la vibe: 3D scene + UI overlay legible.
- **kbtale/portfolio** — https://portfolio.carlosblog.com
  Next.js + R3F + GSAP. Interactive grid shader + tech stack section con click-to-filter. Wireframe reveal shader.
- **Txemalon/3d-portfolio** — https://github.com/Txemalon/3d-portfolio
  Next 16 + R3F + Lenis + i18n ES/EN. 3D keyboard hero scene. Mismo stack que necesitas.

#### Fases de implementación

**Fase 1: Setup 3D + Flow Field Background (semana 1-2)**
- Instalar `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `lenis`, `simplex-noise`
- Crear `<FlowFieldBackground />` — canvas WebGL con ~2000 partículas siguiendo curl noise
- Reactivo al cursor (smoothstep falloff)
- Device tier detection: 500 partículas en mobile, 2000 desktop
- `prefers-reduced-motion` → versión estática o sin canvas
- Reemplazar `MeshBackground` en `Index.tsx`

**Fase 2: Hero 3D + Tech Stack Icons (semana 2-3)**
- Crear `<Hero3D />` — objeto wireframe geométrico orbitando con `<Float>` de drei
- Text reveal con glitch/decode effect (GSAP SplitText o custom)
- Cambiar tipografía display a algo más editorial (Space Grotesk ya lo tienes, considerar Syne o JetBrains Mono para acentos)
- Crear `<TechStack3D />` — iconos tech con `<Instances>` + `<Float>`, rotan en 3D, hover zoom, click filtra proyectos
- Integrar Lenis smooth scroll + GSAP ScrollTrigger

**Fase 3: Scroll Animations + Polish (semana 3-4)**
- Reveal staggered en todas las secciones (GSAP ScrollTrigger)
- Parallax en project cards
- Pinned sections para experience timeline
- Acortar boot sequence (más corto, más punchy)
- Mantener CLI terminal, CRT overlay, 4 temas
- Testing mobile, performance audit, Lighthouse

---

### Propuesta 2: "Cinematic Scroll World" — 3D scroll-driven completo

**Concepto:** Abandonas el terminal OS como concepto base y lo conviertes en **mundo 3D scroll-driven**. Cada sección es una escena 3D. La cámara vuela entre escenas con scroll. El terminal pasa a ser una sección/easter egg, no el envoltorio.

#### Elementos clave

- **Hero:** Escena 3D arquitectónica (low-poly o wireframe). Texto overlay. Dolly zoom al entrar. Cámara se mueve con scroll.
- **Secciones:** Cada una es un "capítulo" con su escena. Projects = cards 3D tilt flotando en espacio. Tech stack = constelación de iconos 3D. Experience = camino 3D con waypoints.
- **Background:** Escena 3D generativa (particles + lighting) persistente, cross-fadeea entre estados.
- **Terminal:** Se mantiene como sección "open terminal" — un Easter egg clickable, no el chasis del sitio.
- **Transiciones:** Shader transitions con Perlin noise entre escenas (estilo Giulio Collesei).

#### Stack nuevo

- `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- `gsap` (+ ScrollTrigger, Observer, SplitText), `lenis`
- Blender (opcional, para modelado low-poly) o modelos de Sketchfab

#### Pros / Cons

| Pros | Cons |
|---|---|
| Wow factor brutal | Mucho trabajo (4-8 sem) |
| Es lo que gana Awwwards SOTD 2026 | Riesgo de performance en mobile |
| Demuestra WebGL/shaders skills senior | SEO complejo (contenido en canvas) |
| | Accesibilidad delicada |
| | Reescribes arquitectura |
| | Recruiters pueden perderse |

#### Esfuerzo: 4-8 semanas

#### Ejemplos webs

- **Mountain Portfolio** — https://github.com/ArthurTorres75/mountain-portfolio
  Mundo 3D free-flight, cada zona = sección. Next.js routes indexables. Low-poly toon-shaded.
- **More Than a Portfolio** (Codrops, Joseph Santamaria) — https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/
  Scroll-driven 3D environment. Astronaut crossfade entre estados. GSAP Observer + ScrollTrigger.
- **They Call Me Giulio** (Codrops) — https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/
  Dolly zoom, shader transitions con Perlin noise, cyberpunk aesthetic. Inspiración para transiciones.

#### Fases de implementación

**Fase 1: Arquitectura 3D base (semana 1-2)**
- Instalar stack 3D completo + GSAP + Lenis
- Crear `<Canvas>` persistente en `layout.tsx` (una sola escena, no una por sección)
- Sistema de cámara scroll-driven con GSAP ScrollTrigger
- Device tier detection: fallback 2D en mobile

**Fase 2: Escenas por sección (semana 3-5)**
- Hero scene: arquitectura low-poly + dolly zoom
- About scene: texto en 3D space con `<Html>` de drei
- Tech stack: constelación de iconos 3D
- Projects: cards 3D tilt flotando
- Experience: camino 3D con waypoints
- Contact: form en escena final

**Fase 3: Transiciones + Polish (semana 6-8)**
- Shader transitions con Perlin noise entre escenas
- Post-processing: bloom, DOF, chromatic aberration
- Terminal como Easter egg (modal 3D)
- SEO: contenido HTML paralelo indexable
- Accesibilidad: `prefers-reduced-motion` como diseño paralelo
- Performance audit, mobile testing

---

### Propuesta 3: "Generative Flow Field Terminal" — Híbrido ASCII + flow field

**Concepto:** El fondo es un **flow field WebGL con ASCII post-processing** — partículas que fluyen por curl noise y se renderizan como caracteres ASCII en tiempo real. Combina tu identidad terminal con creative coding de nivel alto. Único en 2026.

#### Elementos clave

- **Hero:** Tu nombre aparece formándose/disolviéndose en partículas ASCII que siguen el flow field. Tipografía display monospace brutalista (JetBrains Mono o Space Grotesk).
- **Background:** Canvas WebGL: ~80k partículas GPU siguiendo curl noise, renderizadas como chars ASCII (`#`, `+`, `*`, `░▒▓`). Cursor las aparta. Reemplaza MeshBackground.
- **Toggle "ASCII mode":** Post-process shader que convierte toda la página a ASCII art on-demand (killer feature único).
- **Tech stack:** Iconos tech renderizados en ASCII art style, hover revela versión limpia.
- **Terminal:** CLI se mantiene como herramienta flotante (ya lo tienes).

#### Stack nuevo

- `three` (para post-process) o canvas2d puro
- `simplex-noise` para Perlin/curl noise
- `gsap` (opcional, para reveal animations)
- `lenis` (opcional, para smooth scroll)

#### Pros / Cons

| Pros | Cons |
|---|---|
| Muy diferenciado (casi nadie hace esto) | ASCII puede cansar si muy denso |
| Demuestra shaders + creative coding serio | Necesita calibration visual fina |
| Performance OK (canvas < WebGL en peso) | Accesibilidad: fallback sin ASCII |
| Mantiene legibilidad (ASCII solo en background) | |
| "ASCII mode toggle" = memorable | |

#### Esfuerzo: 3-5 semanas

#### Ejemplos webs

- **murmuration** (yusyuan9224) — https://github.com/yusyuan9224/murmuration
  ~80k GPU particles en curl noise, pure GLSL, 60fps. Base técnica para el flow field.
- **particular-drift** (collidingScopes) — https://collidingscopes.github.io/particular-drift/
  Image → particles flow field, Perlin noise + WebGL2. Inspiración para mapear contenido a partículas.
- **GlyphStream** — https://glyphstream.vercel.app/
  5 algoritmos ASCII generativos sin deps. Referencia para ASCII art techniques.

#### Fases de implementación

**Fase 1: ASCII Flow Field Background (semana 1-2)**
- Setup canvas WebGL o canvas2d
- Implementar curl noise con `simplex-noise`
- ~80k partículas GPU (o ~5k canvas2d para compatibilidad)
- Renderizar partículas como chars ASCII mapeando luminosity → char index
- Reactivo al cursor
- `prefers-reduced-motion` → versión estática
- Reemplazar `MeshBackground`

**Fase 2: ASCII Hero + Content Reveal (semana 2-3)**
- Hero: nombre formándose en partículas ASCII que siguen el flow field
- Tipografía display monospace brutalista
- Sistema de reveal: secciones aparecen "atravesando" el ASCII
- El ASCII se reorganiza al entrar una sección en viewport
- Contenido textual se mantiene legible (no afectado por ASCII)

**Fase 3: ASCII Mode Toggle + Polish (semana 4-5)**
- Post-process shader que convierte toda la página a ASCII on-demand
- Toggle en nav (estilo CRT overlay que ya tienes)
- Tech stack icons en ASCII style, hover revela versión limpia
- CLI terminal se mantiene
- Sound effects sutiles (opcional)
- Device tier detection, mobile testing

---

### Propuesta 4: "AI-Coder Showcase" — Posición "programador con IA"

**Concepto:** En vez de "otro portfolio bonito", conviertes el portfolio en **demostración explícita de workflow con IA**. Cada sección muestra qué prompt generó qué resultado. Posicionamiento directo como "AI-augmented developer".

#### Elementos clave

- **Hero:** Animación de código escribiéndose (typed effect), que se transforma en mockup visual 3D. "Este portfolio lo construí con X prompts → aquí están".
- **Sección "Prompt Gallery":** Side-by-side: prompt → resultado (card 3D tilt). Muestra 5-8 prompts reales que usaste con capturas del output. Live demo editable.
- **Tech stack:** Iconos 3D orbitando un núcleo (estilo sistema solar), cada uno linkable.
- **Sección "AI Tools I ship with":** Cursor, Claude, v0, Bolt — reviews mini con tu rating.
- **Live prompt runner:** Input donde el visitante puede pegar un prompt y ver (mock) cómo lo descompondrías. Easter egg.
- **Terminal:** CLI se mantiene, expandido con comandos AI (`ai-decompose <prompt>`, etc.).

#### Stack nuevo

- `three`, `@react-three/fiber`, `@react-three/drei` (iconos 3D orbitando)
- `gsap` (opcional, para scroll animations)
- `lenis` (opcional, smooth scroll)

#### Pros / Cons

| Pros | Cons |
|---|---|
| Único en el landscape 2026 | Requiere contenido real (documentar prompts) |
| Diferenciación brutal (nadie posiciona así) | Riesgo: puede leerse como "yo no codeo, solo prompteo" |
| Demuestra exactamente el pitch que pides | Hay que balancear con código real visible |
| Recruiters ven pensamiento sistemático | |

#### Esfuerzo: 3-4 semanas

#### Ejemplos webs

- **RayanAIX portfolio** — https://github.com/RayanAIX/RayanAIX
  16-yo AI researcher, terminal section + neural network hero. Justo la vibe AI-coder.
- **ferhatolmez/portfolio** — https://ferhatolmez.vercel.app
  3D + Spline + socket.io realtime. Muestra full-stack playground, no solo brochure.
- **Martin Laxenaire** — https://www.martin-laxenaire.fr
  WebGPU game portfolio, "cada sección se desbloquea como juegas". Procedural con datos reales.

#### Fases de implementación

**Fase 1: Hero AI + Setup 3D (semana 1-2)**
- Instalar `three`, `@react-three/fiber`, `@react-three/drei`
- Hero: código escribiéndose (typed effect) → transforma en mockup 3D
- Tech stack: iconos 3D orbitando núcleo (sistema solar style)
- Documentar 5-8 prompts reales que usaste (contenido)

**Fase 2: Prompt Gallery + AI Tools (semana 2-3)**
- Sección "Prompt Gallery": cards 3D tilt side-by-side prompt → resultado
- Sección "AI Tools I ship with": reviews mini con rating
- Live prompt runner: input + mock descomposición (Easter egg)
- Expandir CLI terminal con comandos AI

**Fase 3: Polish + Balance (semana 3-4)**
- Asegurar que código real (proyectos, experiencia) está bien visible
- Balancear "AI workflow" con "mira mi código"
- Scroll animations, reveal staggered
- Mobile testing, performance audit

---

## 3. Comparativa

| Criterio | P1: Terminal Evolved | P2: Cinematic 3D | P3: ASCII Flow | P4: AI-Coder |
|---|---|---|---|---|
| **Wow factor** | Alto | Brutal | Alto | Único |
| **Riesgo** | Medio | Alto | Medio | Medio |
| **Esfuerzo** | 2-4 sem | 4-8 sem | 3-5 sem | 3-4 sem |
| **Performance** | OK con fallback | Delicado | OK | OK |
| **Mobile** | OK | Difícil | OK | OK |
| **Accesibilidad** | OK | Complejo | Medio | OK |
| **SEO** | OK | Complejo | OK | Excelente |
| **Mantenibilidad** | Alta | Baja | Media | Alta |
| **Diferenciación** | Media-alta | Muy alta | Muy alta | Brutal |
| **Recruiter-friendly** | Alto | Medio | Alto | Alto |
| **Skills que demuestra** | 3D + creative coding | WebGL senior | Shaders + ASCII | Workflow IA |
| **Mantiene terminal actual** | Sí | No (easter egg) | Sí | Parcial |
| **3D rotating icons** | ✓ | ✓ | ASCII style | ✓ orbit |
| **Hero 3D animado** | ✓ | ✓ | ASCII particles | ✓ typed→3D |
| **Background moderno** | ✓ flow field | ✓ 3D scene | ✓ ASCII flow | Opcional |
| **Scroll animations** | ✓ GSAP+Lenis | ✓ GSAP+Lenis | Opcional | Opcional |
| **Terminal CLI** | ✓ se mantiene | Easter egg | ✓ se mantiene | ✓ expandido |
| **Social/email/CV icons** | ✓ | ✓ | ✓ | ✓ 3D orbit |

---

## 4. Recomendación

**Propuesta 1: "Terminal Evolved"** como base, **con una sección dedicada de Propuesta 4 ("AI-coder showcase")** integrada.

### Por qué

- **P1 da el wow visual** (hero 3D, flow field background, iconos 3D rotantes, scroll animations)
- **Mantiene tu identidad terminal** (no pierdes CLI, boot, temas, i18n)
- **Es recruiter-friendly** (info clara, legible, mobile OK)
- **Es alcanzable** (3-4 semanas, no 4-8)
- **La sección AI-coder** (subset de P4) te posiciona explícitamente como "programador con IA" sin renombrar todo el portfolio
- **Cumple todos tus requisitos**: hero potente animado ✓, background moderno ✓, scroll animations ✓, iconos 3D rotantes ✓, terminal CLI ✓, social/email/CV ✓

### Stack final recomendado

```
three + @react-three/fiber + @react-three/drei
gsap + ScrollTrigger + SplitText
lenis
simplex-noise
```

### Fases recomendadas (combinadas P1 + sección P4)

**Fase 1: Setup 3D + Flow Field Background (semana 1-2)**
- Instalar dependencias
- `<FlowFieldBackground />` con curl noise, reactivo al cursor
- Device tier detection
- Reemplazar MeshBackground

**Fase 2: Hero 3D + Tech Stack Icons (semana 2-3)**
- `<Hero3D />` wireframe orbitando con `<Float>`
- Text reveal glitch/decode
- `<TechStack3D />` iconos rotantes con `<Instances>` + `<Float>`
- Lenis + GSAP ScrollTrigger setup

**Fase 3: Scroll Animations + AI-Coder Section (semana 3-4)**
- Reveal staggered, parallax, pinned sections
- Sección "AI-Coder Showcase" (subset P4): prompt gallery + AI tools
- Expandir CLI con comandos AI
- Acortar boot sequence
- Polish, mobile testing, Lighthouse

---

## 5. Cómo proceder

1. **Elegir una propuesta** (1, 2, 3, o 4) o confirmar la recomendación híbrida (P1 + sección P4)
2. **Escribir design document** detallado en `docs/superpowers/specs/2026-06-30-portfolio-redesign-design.md`
3. **Spec self-review** (placeholders, consistencia, scope, ambigüedad)
4. **User review** del spec
5. **Implementation plan** con tasks específicas (writing-plans skill)
6. **Ejecución** con subagentes especializados

---

## 6. Referencias investigadas

### Codrops 2026 portfolio features
- [More Than a Portfolio](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/) — scroll-driven 3D world
- [They Call Me Giulio](https://tympanus.net/codrops/2026/04/14/they-call-me-giulio-the-making-of-a-cinematic-cyberpunk-portfolio/) — cinematic cyberpunk, dolly zoom, shader transitions
- [R—K '26](https://tympanus.net/codrops/2026/04/07/r-k-26-the-thinking-and-code-behind-a-portfolio-led-by-presence/) — minimalismo brutal, dock, transiciones clip-path
- [Arnaud Rocca's Portfolio](https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/) — GSAP + fluid WebGL slider
- [Jonas Reymondin](https://tympanus.net/codrops/2026/03/16/jonas-reymondins-portfolio-reclaiming-the-ui-eye-through-systems-code-and-pixel-motion/) — pixel trail WebGL, terminal reveal, glitch reveal
- [From Shader Uniforms to Clip-Path Wipes](https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/) — GSAP + Lenis + scroll morph
- [Whooshes, Snaps and Shaders](https://tympanus.net/codrops/2026/05/27/whooshes-snaps-and-shaders-adrien-vanderpotte-and-the-feeling-of-the-interface/) — radial effects, deep-zoom scrolling

### Awwwards 2026
- [Cynx Portfolio 2026](https://www.awwwards.com/sites/cynx-portfolio-2026) — Honorable Mention, GSAP + GLSL + WebGL
- [Pacôme Pertant Portfolio](https://www.awwwards.com/sites/pacome-pertant-portfolio) — SOTD Jun 9 2026, GSAP + Three.js + Nuxt

### 3D portfolio examples (GitHub)
- [VertexFlow](https://github.com/salonyranjan/VertexFlow) — Three.js + R3F + GSAP + Lenis + post-processing
- [Mountain Portfolio](https://github.com/ArthurTorres75/mountain-portfolio) — free-flight 3D world, Next.js routes
- [kbtale/portfolio](https://github.com/kbtale/portfolio) — Next 16 + R3F + GSAP, interactive grid shader
- [Txemalon/3d-portfolio](https://github.com/Txemalon/3d-portfolio) — Next 16 + R3F + Lenis + i18n ES/EN
- [askoti/portfolio](https://github.com/askoti/portfolio) — scroll-driven camera, 3D project cards
- [ferhatolmez/portfolio](https://github.com/ferhatolmez/portfolio) — 3D + Spline + socket.io realtime
- [RayanAIX portfolio](https://github.com/RayanAIX/RayanAIX) — AI researcher, neural network hero
- [Martin Laxenaire](https://github.com/martinlaxenaire/portfolio-2025) — WebGPU game portfolio

### Flow field / generative art
- [murmuration](https://github.com/yusyuan9224/murmuration) — ~80k GPU particles, curl noise, pure GLSL
- [particular-drift](https://github.com/collidingScopes/particular-drift) — image → particles, Perlin noise + WebGL2
- [generative-flow-field](https://github.com/23x2/generative-flow-field) — WebGL2 flow field, no deps, theme transitions
- [Colourful-Attraction](https://github.com/qc20/colourful-attraction) — 100k GPU particles, 12 strange attractors
- [GlyphStream](https://glyphstream.vercel.app/) — 5 ASCII generative algorithms

### Terminal/OS portfolios 2026 (referencia del landscape)
- [ctOS Dev Portfolio](https://github.com/pd241008/ctOS-Dev-Portfolio) — Watch Dogs aesthetic
- [Tidepool](https://github.com/Real-Fruit-Snacks/Tidepool) — xterm.js, Catppuccin Mocha
- [OS_PORTFOLIO](https://github.com/CrypterENC/OS_PORTFOLIO) — Arch Linux + Hyprland sim
- [tfish](https://github.com/iamovi/tfish) — OS simulation, BIOS boot, draggable icons
- [Web-OS Portfolio](https://github.com/pravin-python/Web-OS-Portfolio) — React 19 + Zustand + react-rnd
- [showcase-os](https://github.com/ronbodnar/showcase-os) — extensible OS, window manager, process lifecycle
- [hackknow-os](https://github.com/gaganchauhan1997/hackknow-os) — cosmic brutalism, zero deps
- [SAMI-portifolio](https://github.com/SAMI-CODEAI/SAMI-portifolio) — terminal OS sim, matrix rain, CRT

### Tendencias diseño 2026
- [Aesthetics in the AI era](https://medium.com/design-bootcamp/aesthetics-in-the-ai-era-visual-web-design-trends-for-2026-5a0f75a10e98) — Technical Mono / code brutalism, Interface Nostalgia
- [Portfolio design trends 2026](https://elements.envato.com/learn/portfolio-trends) — gamified navigation, minimalist, retro futurism

---

## 7. Estado del documento

**Decisión pendiente:** Esperando selección de propuesta (1, 2, 3, 4, o híbrida P1+P4) para proceder con design document + implementation plan.

**Próximo paso tras elegir:** Escribir spec en `docs/superpowers/specs/2026-06-30-portfolio-redesign-design.md` con arquitectura detallada, componentes, dependencias, fases y tasks específicas.