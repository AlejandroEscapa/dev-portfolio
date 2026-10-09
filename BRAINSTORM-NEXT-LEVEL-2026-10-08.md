# BRAINSTORM: Next Level del Portfolio (2026-10-08)

> **Estado:** Ronda 1 APROBADA por Alejandro (2026-10-08). Ronda 2 DECIDIDA
> por delegación (2026-10-09): entran A1, A2, B1, B2 (condicionada), B3,
> C1 (mínima), C2, D1, D2; D3 diferida; D4 al cierre de Fase 2. Este
> documento es la spec de diseño; el plan de ejecución vive en
> `PLAN-NEXT-LEVEL-2026-10-08.md`.

---

## 1. Contexto y objetivo

Portfolio personal con metáfora "desktop OS" ya consolidado: ventanas con
traffic-lights, dock lateral, terminal CLI, Spotlight (⌘K), overlay CRT,
boot sequence, 4 temas, hero 3D holo con bloom, scroll horizontal con pin en
Trayectoria. Tipografías Fraunces (display) + IBM Plex Sans (UI) +
IBM Plex Mono (terminal). Deploy automático a Vercel desde `main`.

**Audiencia:** reclutadores y perfiles técnicos.
**Objetivo real (acordado):** no es "más efectos". Es que el portfolio
convenza mejor para conseguir trabajo y sea memorable.

**Lo que hoy NO cuenta la página:**

1. La experiencia real en empresa (ERP: Business Central y Odoo; WMS en PHP
   con lógica en SQL Server; e-commerce y kiosco web en Angular + TypeScript).
   Los tres proyectos visibles son TFM/demo personal.
2. Quién es Alejandro fuera del código: el hilo de "descubrir la lógica
   detrás de las cosas" (editar voces, aprender a pinchar, videojuegos).

**Design read** (design-taste-frontend §0.B): portfolio de desarrollador
para reclutadores, lenguaje desktop OS propio, en modo *redesign-preserve*:
se conserva todo el lenguaje actual y se sube un dial, MOTION, de ~5 a ~7.
VARIANCE y DENSITY no se tocan.

## 2. Tesis rectora

El portfolio ya tiene muchos efectos (grano, CRT, scramble, holo 3D con
bloom, scroll hijack, boot). El riesgo actual no es la falta de efectos:
es el **museo de efectos**. El salto de nivel viene de convertir el
movimiento en un **lenguaje**: duraciones, easings y coreografías
consistentes donde cada animación tiene un porqué (jerarquía, feedback,
transición de estado). Eso es lo que separa un sitio Awwwards de uno que
"tiene cosas que se mueven". Todo lo propuesto abajo obedece a esa tesis.

---

## 3. RONDA 1 (APROBADA)

### Eje 1 — Sistema de motion global

División de responsabilidades, declarada y respetada siempre:

- **GSAP/ScrollTrigger**: scroll-hijack (Trayectoria) y escena 3D.
- **Framer Motion**: todo el motion de UI.
- **CSS**: micro-transiciones de hover.
- Nunca dos motores en el mismo componente.

Piezas:

1. Primitivas `<Reveal>` y `<RevealStagger>` consumiendo los tokens
   `--duration-*` / `--ease-out-expo` vía `src/lib/motion.ts`, con
   degradación a estático bajo `prefers-reduced-motion`.
2. Shared-layout transition (`layoutId`) en Projects: la card crece hasta
   convertirse en la ficha de detalle, reemplazando el cross-fade CSS
   artesanal de 420ms.
3. Coreografía post-boot: la entrada del hero arranca orquestada justo al
   terminar (o saltarse) el BootSequence. Un solo momento, bien dirigido.

Coste medio, riesgo bajo, impacto percibido altísimo.

### Eje 2 — Cursor

Enfoque honesto: el cursor custom es un cliché cuando se hace mal
(reemplazar el nativo, lag, círculo gigante). La propuesta correcta:

- **Nunca `cursor: none` global**: el cursor nativo sigue visible. Encima,
  un halo que lo persigue con spring física (`useMotionValue` +
  `useSpring`, ~stiffness 300 / damping 30, transform-only,
  `pointer-events: none`, `mix-blend-mode: difference` para legibilidad
  sobre los 4 temas).
- **Contextual**: el halo crece o muda a etiqueta ("abrir", "ver") sobre
  links, cards de proyecto y carrusel. Es affordance, no decoración.
- Solo se monta con `pointer: fine`, sin `prefers-reduced-motion`, y nunca
  en móvil. Tras un flag de configuración: si en vivo no convence, se va
  sin dejar rastro.

Nota de tensión registrada: la skill de diseño proscribe cursores custom
por defecto (§9.A: accesibilidad y rendimiento). Se acepta aquí por petición
explícita y con el diseño halo-only, que mantiene el cursor nativo y toda la
operabilidad. El flag es la válvula de escape.

### Eje 3 — Ventana "En producción real" (empleabilidad)

El hueco gordo: la experiencia en empresa no aparece en ningún sitio.

- **Formato**: 3-4 fichas de caso con contexto (1 línea, empresa
  anonimizable), rol, stack real, y 2-3 bullets de resultado. Números solo
  si son reales y defendibles en entrevista. Los números precisos
  inventados los detecta cualquier técnico.
- **Encaje**: Trayectoria cuenta cuándo y dónde; esta ventana cuenta qué
  se construyó y qué resultado tuvo. Ventana propia
  (`~/experience — production.log`) colocada ANTES de Projects, porque
  para empleabilidad pesa más que los TFM. Descartado el toggle
  "Personal | En empresa" dentro de Projects: diluye ambas cosas.
- **Certificados**: añadir credenciales verificables (links a Credly o
  similar) en la ventana Education. Barato y directo.
- **Input necesario de Alejandro**: por cada trabajo — contexto, rol,
  periodo, stack, bullets de logro, y qué es confidencial.

### Eje 4 — Ventana "Quién soy" (ocio e identidad)

El hilo personal es copy real, no postureo: descubrir la lógica detrás de
las cosas (editar voces, pinchar, videojuegos). Conecta con cómo programa
sin decirlo explícitamente.

- Ventana corta (`~/me — whoami`), 3 mundos en cards, densidad baja.
- Guiño visual medido: barras de ecualizador SVG para el mundo del sonido
  (animación CSS transform-only con fallback estático). Nada de canvas
  pesado ni WebGL extra: la auditoría de escalado 3D ya fijó el presupuesto
  de contextos.
- El copy lo escribe Alejandro o se afina juntos.

### Qué NO se hará (criba honesta)

- Nada de marquees infinitos, partículas ni fondos animados nuevos:
  chocan con grano + CRT + GLB y rompen el presupuesto de GPU.
- De los registries instalados (aceternity/magicui/reactbits) solo cabe
  `NumberTicker` para las métricas del Eje 3, y solo con datos reales.
- Nada de multi-escena 3D en esta ronda (la auditoría lo marcó caro):
  queda como fase ambiciosa posterior.

### Fase 0 — Purrias (una sesión, riesgo cero)

- `cv.pdf` devuelve 404: el botón Resume del Dock falla en silencio ante
  un reclutador. Prioridad real.
- Pesos de la mono no cargados (ver §4, reformulado tras auditoría).
- Huérfanos FX y hooks sin consumidores (ver §4, ampliado).
- `flip-check.webm` suelto en raíz.
- `repomix-output.xml` trackeado sin razón clara.

### Hoja de ruta (ronda 1)

- **Fase 0**: purrias.
- **Fase 1**: sistema de motion + coreografía post-boot + layoutId en
  Projects + cursor (tras flag).
- **Fase 2**: ventana de impacto profesional + credenciales en Education
  (depende de datos/copy de Alejandro).
- **Fase 3**: ventana quién soy (depende de copy).
- **Fase 4** (opcional, ambiciosa): multi-escena 3D o páginas de caso por
  proyecto.

El cuello de botella real es el copy y los datos de los Ejes 3 y 4, no el
código: Fases 0 y 1 pueden ejecutarse mientras se redacta lo otro.
Branch por fase; merge a `main` solo con visto bueno.

---

## 4. Actualización tras auditoría del repo (2026-10-08)

Verificación del estado real antes de fijar el plan. Corrige y amplía la
ronda 1:

**Ya existe más del Eje 1 del que parecía:**

- `src/lib/motion.ts` ya formaliza `DURATION_*`, `EASE_OUT_EXPO` y las
  variants `fadeUp`, `fadeUpSm`, `stagger` leídas del pipeline de tokens.
  Consumidores actuales: CliTerminal, Dock, About, ThemeMenu, Education,
  WindowChrome.
- **No** lo consumen: TechBento, Hero, Footer, ProjectCard/ProjectDetail.
  El trabajo del Eje 1 se reformula como "unificar y envolver" (componentes
  `<Reveal>`/`<RevealStagger>` sobre las variants existentes), no
  "crear desde cero".

**Purrias nuevas detectadas:**

- `src/hooks/useScrollReveal.ts`: **cero consumidores** y, encima, viola
  la regla de tokens (y=60, 0.8s, `power3.out` hardcodeados, GSAP en
  territorio Framer). Borrado directo.
- `src/hooks/useMousePosition.ts`: **cero consumidores** y es el
  anti-patrón prohibido (`useState` actualizado en cada `mousemove`).
  Borrado directo. El halo del cursor NO lo reutilizará: irá con
  `useMotionValue` fuera del ciclo de render.
- Mono: el `<link>` de Google Fonts carga Plex Mono **solo en 400 y 500**
  (Plex Sans sí llega a 700; Fraunces es variable 100-900). Cualquier label
  mono con peso ≥600 es negrita sintética. AGENTS.md §15.9 afirma que el
  link cubre 400-700 "de las tres familias": es incorrecto y hay que
  corregirlo al resolver la purria.
- `repomix-output.xml`: está **trackeado** (aparece modificado en
  `git status`). Decisión propuesta: sacarlo del tracking y añadirlo a
  `.gitignore`.
- `flip-check.webm`: **no** trackeado, suelto en raíz. Es un artefacto de
  desarrollo; se mueve a `docs/assets/` (no se borra: no está en Git y la
  regla de irreversibles manda).
- `@phosphor-icons/react`: instalado con **cero imports** (AGENTS.md §1 ya
  lo marca candidato a eliminación). Se desinstala en Fase 0.
- `i18next` + `react-i18next`: instalados "para migración" sin uso real.
  NO se tocan sin decisión explícita (ver §7).

**Confirmado que ya existe (no reproponer):**

- Spotlight ⌘K (`cmdk` + `src/lib/spotlight-items.ts`), CLI con ~17
  comandos (`src/lib/cli-commands.ts`), i18n ES/EN propio, `og.png` 1200×630
  generado con sharp, 4 temas con persistencia, CRT toggle, dock con
  magnify-on-hover.

---

## 5. RONDA 2 (DECIDIDA por delegación de Alejandro, 2026-10-09)

Ideas adicionales, agrupadas por naturaleza, con coste/impacto y
recomendación. Decisiones ya tomadas (ver §7 y §8): entran todas las
evaluadas salvo D3 (diferida a post-Fase 2); D4 se activa al cierre de
Fase 2.

### A. Toque global (extienden el Eje 1)

**A1. Cambio de tema cinematográfico (View Transitions API).**
El switch de tema es una interacción central de este sitio y hoy es un
swap instantáneo de `[data-theme]`. Con `document.startViewTransition` se
hace un wipe circular que nace del icono del dock. Cuatro temas ya
construidos lo convierten en un momento "demo" para quien lo descubre.
Coste bajo. Reduced-motion y navegadores sin soporte: swap instantáneo
(actual). **Recomendada: sí, es el efecto premium más barato disponible.**

**A2. CTAs magnéticos.**
Los ShimmerButton del hero tiran sutilmente del cursor a corta distancia
(`useMotionValue` + `useTransform`, jamás `useState`). Refuerza la tesis
"lenguaje de motion" sin añadir superficie visual.
Coste bajo. **Recomendada: sí, dentro de Fase 1 si entra A1.**

### B. Empleabilidad (extienden el Eje 3)

**B1. Badge de disponibilidad.**
Un "Disponible para oportunidades" pequeño y real (dock o footer). Es la
señal que un reclutador busca y hoy no existe en ningún sitio.
Coste muy bajo. **Recomendada: sí, va con Fase 2.**

**B2. Testimonios cortos en la ventana de experiencia.**
2-3 citas de LinkedIn/compañeros (con permiso), máximo 3 líneas, con
nombre + rol. La prueba social es lo que convierte "dice que" en "consta".
Coste: solo copy. Va dentro de Fase 2.
**Recomendada: sí, si hay material.**

**B3. Formulario de contacto real.**
El formulario actual abre `mailto:` y depende de que el visitante tenga
cliente de correo configurado. Un servicio tipo Formspree/Web3Forms (tier
gratuito) convierte sin fricción. El mailto queda como fallback visible.
Coste bajo-medio (cuenta externa + honeypot anti-spam).
**Recomendada: sí.**

**B4. CV vivo generado desde datos.**
`cv.pdf` hoy es un archivo manual que ya demostró pudrirse (404). La
versión seria: los datos de experiencia/trayectoria son la fuente única y
un script (mismo patrón que `build-tokens.mjs` / generación de `og.png`
con sharp, o una plantilla HTML renderizada a PDF) regenera `cv.pdf` en
cada build. La web y el CV jamás vuelven a desincronizarse.
Coste medio-alto. **Recomendada: como fase propia después de Fase 2**,
cuando los datos de experiencia ya existan tipados.

### C. Firma personal (identidad)

**C1. Sound design opt-in.**
Micro-sonidos de UI (abrir/cerrar ventana, boot, cambio de tema) con
WebAudio, apagados por defecto, toggle en el dock. Es literalmente su
historia (edición de voces, DJ) convertida en detalle de producto.
Riesgo: el sonido en webs molesta si se impone; por eso opt-in y sin
autoplay. Coste medio.
**Recomendada: solo si a Alejandro le hace ilusión; es marca personal
pura, no empleabilidad.**

**C2. Easter egg: 5º tema oculto vía CLI.**
El comando `sudo` ya existe; `sudo theme amber` (o similar) desbloquea un
tema CRT ámbar no listado en ThemeMenu, persistido en localStorage.
Quien lo encuentra, lo cuenta. Coste bajo (un `themes/amber.json` +
ramificación en cli-commands). **Recomendada: sí, es barata y muy "él".**

### D. Proceso profesional (lo que separa junior de senior)

**D1. Guardia de assets en CI/test.**
Test (Vitest) que verifica que todo asset referenciado en
`portfolio.config.json`, items del Dock, `index.html` (preload/og) y media
de proyectos existe en `public/`. El 404 de `cv.pdf` no vuelve a pasar
nunca en silencio. Coste bajo. **Propuesta para colarse en Fase 0 como
Task 5 del plan** (es la cura sistémica de esa purria): entra solo si se
aprueba D1.

**D2. Presupuesto de rendimiento comprobable.**
Script de budget (tamaño de bundle por chunk, con el chunk three/* ya
separado) que falla si se supera el umbral. Opcionalmente Lighthouse CI
sobre el preview de Vercel. Coste medio.
**Recomendada: versión mínima (budget de bundle local).**

**D3. Smoke tests de navegador (Playwright).**
Boot → hero → flip de Projects → cambio de tema, en Chromium headless.
Coste medio-alto de montar, ahorro real a partir de Fase 2.
**Recomendada: diferir** hasta que las ventanas nuevas existan.

**D4. Analytics ligero.**
Vercel Analytics (deploy ya está en Vercel: es casi gratis de activar) o
Umami si se prefiere self-hosted. Datos de qué ventanas se abren y dónde
se va la gente, para priorizar Fases 2-4 con evidencia.
**Recomendada: activar Vercel Analytics cuando se desee; sin urgencia.**

### Descartado en ronda 2

- **PWA/offline**: valor ~0 para un portfolio.
- **Blog / build-log**: buena marca personal, pero exige constancia de
  contenido. Aparcar a Fase 5+; si interesa, el formato natural es
  "devlog por proyecto" dentro de las páginas de caso de Fase 4.
- **i18n**: ya existe ES/EN. No reproponer.
- **OG dinámico por sección**: `og.png` ya cubre; sobresfuerzo.
- **Multi-escena 3D**: sigue aparcada en Fase 4 (presupuesto de contextos
  WebGL fijado por la auditoría previa).

---

## 6. Hoja de ruta consolidada

| Fase | Contenido | Depende de | Estado |
| ---- | --------- | ---------- | ------ |
| 0 | Purrias (cv.pdf, huérfanos, mono, repomix, guardia de assets D1) | Nada | Aprobada |
| 1 | Sistema de motion (unificar + Reveal/Stagger), layoutId en Projects, coreografía post-boot, cursor tras flag | Fase 0 | Aprobada |
| 1.5 | A1 view-transitions de tema, A2 CTAs magnéticos, C2 5º tema oculto por CLI | Fase 1 | Aprobada (delegada) |
| 2 | Ventana experiencia real + credenciales + B1 badge disponibilidad + B3 formulario real (+ B2 testimonios si hay material real) | Datos y copy de Alejandro | Aprobada, bloqueada por input |
| 3 | Ventana quién soy + C1 sound design opt-in (alcance mínimo) | Copy de Alejandro | Aprobada, bloqueada por input |
| 4 | Páginas de caso por proyecto y/o multi-escena 3D | Fases 1-3 | Aparcada (ambiciosa) |
| 5 | B4 CV vivo desde datos + D2 budget mínimo de bundle; D3 (Playwright) diferida; D4 analytics al cierre de Fase 2 | Fase 2 para B4 | Aprobada parcial (delegada) |

**Dependencia crítica:** Fases 0 y 1 no necesitan nada de Alejandro y
pueden empezar ya. Fases 2 y 3 necesitan el worksheet de la §7.

## 7. Input necesario de Alejandro (worksheet)

**Para Fase 2 (experiencia real), por cada trabajo:**
1. Empresa (nombre real o anonimizado: tú decides qué se publica).
2. Rol y periodo.
3. Contexto en 1 línea (qué era el producto/sistema).
4. Stack real usado.
5. 2-3 bullets de resultado con números SOLO si son reales y defendibles.
6. Qué es confidencial y no debe aparecer (NDA, cifras internas).

**Para Fase 2 (credenciales):** links verificables de certificados/títulos
(Credly o equivalente), si existen.

**Para Fase 3 (quién soy):** los 3 mundos (sonido/DJ, videojuegos, y el
tercero que elijas) + 2-3 frases por mundo en tu voz. Las pulimos juntos.

**Ronda 2 — RESUELTA por delegación (2026-10-09):** entran A1, A2, B1,
B2 (condicionada a citas reales con permiso), B3, C1 (alcance mínimo:
toggle en dock + sonidos de ventana/boot, apagado por defecto), C2, D1 y
D2 (versión mínima local). D3 se difiere a post-Fase 2; D4 se activa al
cierre de Fase 2. Distribución por fases en §6.

**i18next — RESUELTO (2026-10-09):** se desinstalan `i18next` y
`react-i18next` en Fase 0 (Task 2 del plan). El sistema propio funciona y
está probado; mantener dependencias muertas "por si acaso" es YAGNI. Si
algún día hace falta la migración, reinstalar cuesta un comando.

**CV canónico — RESUELTO (2026-10-09):** se usa
`CV_TECNICO_ESPAÑOL_2026.pdf` del portfolio anterior como fuente de
`public/cv.pdf` (se valida integridad y contenido al copiarlo).

**Modo de ejecución — RESUELTO (2026-10-09):** nativo (esta misma
sesión), branch por fase, con la suite de verificación al cierre de cada
tarea.

---

## 8. Registro de decisiones

| Fecha | Decisión | Origen |
| ----- | -------- | ------ |
| 2026-10-08 | Ronda 1 íntegra aprobada (Ejes 1-4, criba, Fase 0, roadmap) | Alejandro |
| 2026-10-08 | Cursor = halo sobre cursor nativo, con flag; jamás `cursor: none` | Ronda 1 + skill design (tensión registrada) |
| 2026-10-08 | Ventana experiencia = ventana propia antes de Projects, no toggle | Ronda 1 |
| 2026-10-08 | `useScrollReveal` y `useMousePosition` se borran (huérfanos + anti-patrones) | Auditoría repo |
| 2026-10-08 | Mono: auditar pesos ≥600; corrección de AGENTS.md §15.9 | Auditoría repo |
| 2026-10-09 | Ronda 2 resuelta por delegación: entran A1, A2, B1, B2 (cond.), B3, C1 (mínima), C2, D1, D2; D3 diferida; D4 al cierre de Fase 2 | Alejandro delega |
| 2026-10-09 | i18next/react-i18next se desinstalan en Fase 0 (YAGNI; sistema propio probado) | Alejandro delega |
| 2026-10-09 | CV canónico = CV_TECNICO_ESPAÑOL_2026.pdf del portfolio anterior | Alejandro delega |
| 2026-10-09 | Ejecución en modo nativo, branch por fase | Alejandro delega |
