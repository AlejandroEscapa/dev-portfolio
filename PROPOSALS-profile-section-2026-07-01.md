# Propuestas — Sección Profile (sin 3D)

- **Fecha**: 2026-07-01
- **Estado**: Pendiente de decisión del usuario
- **Origen**: Pivote del brainstorm original (`BRAINSTORM-profile-3d-2026-07-01.md`). El usuario reconsidera y descarta el render 3D para esta iteración.
- **Razón del pivote**: implementación 3D previa presentó problemas (texto no visible, scroll lateral, modelos que se "fundían", geometrías básicas). 3D queda diferido para una iteración futura. La sección debe construirse con **DOM/SVG/CSS/HTML5 puro** sobre el design system existente.
- **Stack objetivo**: React 18.3, Vite, Tailwind v4, framer-motion 12.38, lucide-react. **Sin Canvas, sin WebGL, sin three.js, sin postprocessing**.
- **Objetivo**: Sustituir la sección `Profile` actual ("De la cocina al código") por una sección dedicada a las 3 pasiones del usuario: **cocina**, **videojuegos** y **música**, manteniendo la estética de `WindowChrome` y la pipeline i18n.

---

## Idea A · "Terminal Passion Logs" — 3 ventanas con logs timestamped

**Concepto**: 3 `WindowChrome` en grid (3 columnas en `lg+`, stack vertical en mobile), cada una con título `~/cooking.log`, `~/gaming.log`, `~/music.log`. Contenido: entradas timestamped estilo terminal con typewriter al entrar en viewport.

**Anatomía**:

```
┌─ ~/cooking.log ──────────  3 ● ─────┐
│ [user@portfolio] cat cooking.log    │
│                                     │
│ [2024-03-14 18:42:32] PEZ TOMILLO   │
│   Head chef · cocina de autor       │
│ [2024-06-02 22:18:05] Alsea         │
│   200 covers, peak service          │
│ [2025-09-19 11:03:00] Curso cocina  │
│   asiática · certificado            │
│                                     │
│ [user@portfolio] _▌                 │
└─────────────────────────────────────┘
```

- Layout: `grid-cols-1 lg:grid-cols-3` con gap consistente con el resto de secciones.
- Typewriter: 1 línea aparece cada 80-120ms al entrar la card en viewport (respeta `prefers-reduced-motion`).
- Interacción: click en una entrada → expande con detalle adicional. Cursor `▌` parpadeante al final del log.
- Acento por pasión: el color del prompt `[user@portfolio]$` cambia por pasión (naranja para cocina, verde jade para gaming, violeta para música), leyendo de `--shadow-glow-accent`, `--primary-glow`, `--primary`.
- Tipografía: `Courier Prime` para los logs, `Space Grotesk` para el título de la ventana.
- i18n: keys nuevas `passions.cooking.log_entries[]`, `passions.gaming.log_entries[]`, `passions.music.log_entries[]` con arrays de `{timestamp, title, detail}`.

**Pros**:
- 100% on-brand con el resto del portfolio (que ya vive en `WindowChrome` con estética terminal)
- Íntimo: el formato "log" transmite autenticidad, no marketing
- Performante: cero animaciones pesadas, solo `transform` y `opacity`
- Sin assets externos: solo tipografía y CSS
- El copy es el protagonista: el usuario se luce con sus historias

**Contras**:
- Puede sentirse "esperado" dado que el portfolio ya tiene muchos `WindowChrome`
- Requiere buen copy: cada log tiene que sentirse auténtico, no genérico
- Requiere datos reales del usuario (fechas, lugares, roles) para que no parezca relleno

**Esfuerzo estimado**: ~3-4h (estructura + i18n + animación typewriter + responsive)

---

## Idea B · "Spotify Wrapped" — 3 cards de stats animados con gradient

**Concepto**: 3 cards grandes stacked verticalmente, cada una ocupa `100vh`. Sticky interior que revela progresivamente. Stats con contador animado que sube al entrar en viewport, gradient único por pasión, tipografía enorme.

**Anatomía**:

```
┌─────────────────────────────────────────┐
│ 02 — PASIONES · COCINA                  │ ← ribbon
│                                         │
│                                         │
│              5                          │ ← número enorme
│           años en                       │
│         hostelería                      │
│                                         │
│   200+ servicios   3 roles de head chef  │ ← stats secundarios
│                                         │
│   "Donde empecé a currar para pagar     │
│    mis estudios..."                     │ ← copy breve
│                                         │
│   ▶ Ver más                             │ ← CTA
└─────────────────────────────────────────┘
   ↑ gradient naranja → rojo → negro
```

- Layout: stack vertical con 3 cards full-height. En cada card, el contenido se "revela" con scroll interno o simplemente aparece al hacer scroll.
- Animación: contador sube de 0 al valor real en 1.5s con `easeOutExpo`. "Now playing" ribbon se desliza desde la izquierda. Tipografía enorme (`clamp(6rem, 14vw, 14rem)`) para el número principal.
- Click "Ver más" → expande con el copy completo + lista de "highlights" (3-5 bullets).
- Acento: gradient por pasión (naranja→rojo para cocina, jade→turquesa para gaming, violeta→magenta para música).
- i18n: keys `passions.cooking.stats.{years,services,roles}`, `passions.cooking.highlight`, etc.

**Pros**:
- Moderno, "wow" inmediato, muy compartible
- Datos concretos = credibilidad profesional
- Ritmo claro: 3 secciones, una por pasión
- Funciona muy bien en mobile (cards stacked, animación por viewport)

**Contras**:
- Puede sentirse "plantilla" si no se personaliza con copy y datos propios
- Requiere stats honestas (no inventar números)
- Menos íntimo que A o D
- Más trabajo de tipografía y diseño del layout

**Esfuerzo estimado**: ~4-5h (diseño tipográfico + animación de contadores + 3 gradients custom + responsive)

---

## Idea C · "Bento Grid" — 6 cells asimétricas con interacciones únicas

**Concepto**: grid asimétrico estilo Linear/Stripe/Apple. 6 cells de tamaños variables, cada una con una interacción distinta. Layout definido por `grid-template-areas`.

**Anatomía**:

```
┌──────────┬──────────┬──────────┐
│          │  Cocina  │          │
│  Cocina  │  (recipe │  Música  │
│  (quote) │   flip)  │ (stats)  │
│          │          │          │
├──────────┼──────────┴──────────┤
│          │                     │
│ Gaming   │  Música             │
│ (grid    │  (waveform          │
│  icons)  │   SVG)              │
│          │                     │
├──────────┴─────────────────────┤
│  Gaming (setup SVG)            │
└────────────────────────────────┘
```

- Layout: `grid-template-areas` con 2 filas × 3 columnas en `lg+`, stack vertical en mobile. Cada cell es un mini-componente con su propia animación.
- Celdas:
  - **Cocina · Quote**: cita del usuario con typografía enorme, italic.
  - **Cocina · Recipe flip**: flip card que al hover/click revela una receta de autor.
  - **Gaming · Iconos**: grid de 6-8 iconos de juegos favoritos con hover que revela el género.
  - **Gaming · Setup**: SVG inline del PC/mando/monitor con animaciones de encendido.
  - **Música · Stats**: número grande de tracks/horas/releases.
  - **Música · Waveform**: SVG path que se "morphing" al hover, simulando una forma de onda.
- Animaciones: microinteracciones everywhere (hover scale, glow, focus rings, `prefers-reduced-motion` respetado).
- Acento: cada cell tiene un accent color de la pasión que domina (naranja, verde, violeta).
- i18n: keys por cell, más granulares.

**Pros**:
- Moderno, estilo Linear/Stripe/Apple, explorable
- Alto engagement: cada cell invita a interactuar
- Extensible: añadir más pasiones en el futuro = añadir más cells
- Cada cell puede ser una "micro-experiencia" única

**Contras**:
- Más trabajo de diseño y desarrollo
- Requiere SVG inline o iconografía coherente (lucide-react puede no ser suficiente)
- Riesgo de sentirse genérico si las interacciones no son distintivas
- Accesibilidad: cada cell interactiva necesita keyboard support y aria

**Esfuerzo estimado**: ~5-6h (6 mini-componentes + animaciones + responsive + accesibilidad)

---

## Idea D · "Polaroid Scrapbook" — polaroids rotadas con notas manuscritas

**Concepto**: grid con CSS columns o flex wrap. 6-9 polaroids (2-3 por pasión) ligeramente rotadas (-8° a +8° random con `transform: rotate()`). Imágenes de Pexels/Unsplash, captions manuscritos (Caveat de Google Fonts), cinta adhesiva en la esquina.

**Anatomía**:

```
┌─ ~/scrapbook ──────────────────────────┐
│                                         │
│   ╔══════════╗     ╔══════════╗         │
│   ║          ║     ║          ║         │ ← rotación -4°
│   ║  [foto]  ║     ║  [foto]  ║         │ ← rotación +3°
│   ║          ║     ║          ║         │ ← rotación -2°
│   ╚══════════╝     ╚══════════╝         │
│   "Cena en casa     "Primera vez        │
│    de mamá"          jugando FFVII"      │ ← handwriting
│   ── 2024-03-14     ── 2018-06-02        │ ← metadata
│                                         │
│       ╔══════════╗                      │
│       ║  [foto]  ║                      │ ← rotación +6°
│       ╚══════════╝                      │
│       "Track 01 · 03:42"                │
│       ── 2025-09-19                     │
└─────────────────────────────────────────┘
```

- Layout: flex wrap o CSS columns con gap. Las polaroids tienen tamaños variables (no uniformes) para sensación de scrapbook real.
- Animación: hover → la polaroid se "endereza" (rotation 0deg) y sube (`translateY(-8px)`) con spring. Click → modal/lightbox con la polaroid en grande + copy adicional.
- Sombra de profundidad: `box-shadow: 0 12px 24px rgba(0,0,0,0.35)` + `0 4px 8px rgba(0,0,0,0.2)` para doble capa.
- Cinta adhesiva: `::before` con gradient sepia y leve rotación, simulando cinta washi.
- Fondo: sutil noise SVG o `mix-blend-mode: overlay` para textura de papel.
- Tipografía: Caveat o Kalam (Google Fonts) para captions, Inter para metadata.
- i18n: keys `passions.cooking.polaroids[].{caption,date,location}`, mismo patrón para gaming y música.

**Pros**:
- El más personal e íntimo de los 4: transmite "esto soy yo, esto es lo que me importa"
- Perfecto para hobbies: las fotos cuentan más que 1.000 palabras
- Gran "encanto": el scrapbook genera calidez inmediata
- Diferenciador fuerte: pocos portfolios técnicos tienen este approach

**Contras**:
- Requiere imágenes: 6-9 fotos de Pexels/Unsplash (gratuitas pero hay que seleccionarlas) o用户提供
- La handwriting font puede chocar con Space Grotesk/Inter del resto (mitigable con uso selectivo solo en captions)
- Más difícil de mantener accesible (rotación, focus rings, keyboard)
- Riesgo de parecer "demasiado whimsy" si no se integra bien con el resto del portfolio

**Esfuerzo estimado**: ~4-5h (selección de fotos + scrapbook layout + animaciones + modal + responsive)

---

## Idea E (bonus) · Híbrido A+C

**Concepto**: header + 3 `WindowChrome` (uno por pasión), cada una con un mini-bento de 4 cells en su interior. Combina la coherencia de A con la variedad visual de C.

**Anatomía**:

```
┌─ ~/passions.md ──────────────────────────────────────┐
│ 02 — PASIONES                                         │
│ "Lo que me define"                                    │
├──────────────────────┬───────────────────────────────┤
│ ~/cooking.log        │ ~/gaming.log                  │
│ ┌────┬────┐          │ ┌────┬────┐                    │
│ │    │    │          │ │    │    │                    │
│ │ A  │ B  │          │ │ A  │ B  │                    │
│ │    │    │          │ │    │    │                    │
│ ├────┴────┤          │ ├────┴────┤                    │
│ │   C    │          │ │   C    │                    │
│ │        │          │ │        │                    │
│ ├────────┤          │ ├────────┤                    │
│ │   D    │          │ │   D    │                    │
│ └────────┘          │ └────────┘                    │
├──────────────────────┼───────────────────────────────┤
│ ~/music.log                                            │
│ ┌────┬────┐                                           │
│ │ A  │ B  │                                           │
│ ├────┴────┤                                           │
│ │   C    │                                           │
│ ├────────┤                                           │
│ │   D    │                                           │
│ └────────┘                                           │
└──────────────────────────────────────────────────────┘
```

- Por cada `WindowChrome`:
  - Cell A (grande): copy principal (4-5 líneas con la esencia de la pasión)
  - Cell B (mediana): 2-3 stats con contador animado (como en B)
  - Cell C (mediana): 3-4 entradas de log con timestamp (como en A)
  - Cell D (ancha): SVG ilustrativo o foto relacionada (sin 3D)
- Layout: cada `WindowChrome` apilada verticalmente, dentro un mini-bento de 2×2 o 3×1 según el contenido.

**Pros**:
- Lo mejor de A (coherencia terminal) y C (variedad de interacciones) y B (datos con contadores)
- Cada pasión se siente única: las 4 cells pueden tener pesos distintos
- Densidad: mucho contenido sin sentirse abrumador
- Cada `WindowChrome` puede tener un accent color distinto en su border-top

**Contras**:
- 12 cells en total = más trabajo de diseño
- Requiere buen sistema de tipos y espaciado para que no se sienta caótico
- El mini-bento dentro de cada window puede ser difícil de hacer responsive bien
- Es la opción con más tiempo de implementación

**Esfuerzo estimado**: ~6-7h (3 mini-bentos + 12 cells + diseño coherente + responsive + accesibilidad)

---

## Tabla comparativa

| Idea | Esfuerzo | Coherencia | Personalidad | Engagement | Originalidad |
|------|----------|------------|--------------|------------|--------------|
| A · Terminal Logs | 3-4h | ★★★★★ | ★★★★ | ★★★ | ★★★ |
| B · Spotify Wrapped | 4-5h | ★★★ | ★★★ | ★★★★ | ★★★ |
| C · Bento Grid | 5-6h | ★★★★ | ★★★ | ★★★★★ | ★★★★ |
| D · Polaroid Scrapbook | 4-5h | ★★ | ★★★★★ | ★★★★ | ★★★★★ |
| E · Híbrido A+C | 6-7h | ★★★★★ | ★★★★ | ★★★★★ | ★★★★ |

---

## Mi recomendación

Para tu mensaje de "esencia" + "como me muestro al mundo":

- **Si quieres máxima coherencia con el portfolio y el copy es fuerte**: **A · Terminal Logs**.
- **Si quieres transmitir "persona" y tienes/dispones de imágenes**: **D · Polaroid Scrapbook**.
- **Si quieres credibilidad y datos de un vistazo**: **B · Spotify Wrapped**.
- **Si quieres explorabilidad y "wow" interactivo**: **C · Bento Grid**.
- **Si quieres densidad con personalidad**: **E · Híbrido A+C**.

Yo apostaría por **A** si tu copy es fuerte (los logs pueden ser muy íntimos) o **D** si la estética scrapbook te resuena. **E** es la opción más ambiciosa si te animas a más densidad.

---

## Decisión pendiente

¿Cuál de las 4 ideas (A, B, C, D) o el híbrido E ejecutamos?

Una vez elegida, escribo el spec detallado en `docs/superpowers/specs/`, lo revisas, y entramos a plan + implementación.
