# Plan de implementación: Next Level Ronda 2 (cursor retícula + contenido de evidencia)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el cursor por un cursor «retícula terminal» contextual (A + estado B) y añadir el contenido de evidencia aprobado: Contributions (ledger git-log), hilos por proyecto, El Puente en Trayectoria, Side quests, Stats neofetch, Certifications separadas y Footer profesional sin teléfono.

**Architecture:** Redesign-preserve sobre el lenguaje visual existente (desktop OS, 4 temas + amber, Fraunces/Plex, specular glass). El cursor evoluciona `CursorHalo` → `TerminalCursor` manteniendo su contrato de delegación `data-cursor` y añadiendo el valor `"text"`. Cada bloque nuevo es data file con test + sección dentro de `WindowChrome` + entradas en Nav/Spotlight/CLI + claves i18n en `en` y `es`. Zero tokens nuevos: todo el color sale de las vars semánticas existentes.

**Tech Stack:** Vite 5 + React 18 + TS, Tailwind v4 (CSS-first), Framer Motion 12 (`framer-motion`), Vitest 3 (jsdom), Lucide + simple-icons.

**Spec:** este plan travela con el diseño aprobado en conversación (2026-10-12, rondas 1 y 2 con feedback de My G). Decisiones cerradas: cursor A con estado B integrado; ledger sin métricas reales (cualitativo, copy a validar); hilos borradores tal cual; Stats en ventana compacta; Nav recibe Impacto y Side quests; firma «Construido con café y ganas» / «Built with coffee and grit».

## Global Constraints

- **Colores/fuente/radio solo por tokens**: nada de literales en componentes. Se reutilizan las CSS vars semánticas existentes (`--primary`, `--accent`, `--foreground`, `--muted-foreground`, `--neutral-tint`, status colors de `primitives/colors.json`). No se toca `src/styles/generated/` ni se añade `tailwind.config.ts`.
- **Framer Motion** se importa desde `framer-motion`, nunca `motion/react` (regla §15 del repo).
- **Media queries**: solo `useMediaQuery` / `useReducedMotion`; prohibido `window.matchMedia` directo. Prohibido `window.addEventListener("scroll")`.
- **Solo `transform`/`opacity` animados**; tamaños fijos con `scale` (patrón HALO_SIZE actual), nunca animar `width`/`height`.
- **i18n simétrico**: cada clave nueva en el bloque `en` Y el bloque `es` de `src/i18n/translations.ts`.
- **Comentarios existentes**: no se reformulan ni borran (regla del workspace).
- **GSAP** solo vía barrel `src/lib/gsap.ts`; efectos en `gsap.context` con root en ref real.
- **Tests antes del código** para todo data-shaping helper (convención §12 del repo).
- **Copy nuevo**: cero guiones largos (`—`, `–`) visibles; rangos de fechas con guión simple (`Mar-May 2023`). Cero números inventados (hashes y barras son estética/autorrevelación declarada, no métricas).
- **Puertas de montaje del cursor** (todas obligatorias): flag ON + `pointer: fine` + NO reduced-motion; con cualquiera a NO, `null` y cero listeners.

## Review Focus

1. **El cursor nativo no debe quedar oculto si el componente falla o se desmonta**: `cursor: none` solo vale mientras `<html data-custom-cursor="on">`. Test en Task 1 (unmount → dataset limpio).
2. **Táctil**: sin cursor custom ni `cursor: none` residual. Test en Task 1 (gate pointer fino).
3. **Legibilidad del dot sobre la foto de fondo y en tema claro**: verificación visual en preview, tema indigo y dracula, desktop y móvil (Task 9). Esperado: dot en `--primary` visible en los 4 temas públicos.
4. **Claves i18n sin traducción** renderizan la clave literal en silencio: el test de simetría (ya existe) debe ir verde en cada commit.
5. **Mapeo de credenciales**: los 3 URLs de LinkedIn deben corresponder al título de la credencial; si el post no menciona el título esperado, se invierte el mapeo antes de cablear (Task 3).
6. **Expandibles del ledger** (acordeón) no deben pinchar el layout en móvil: la historia expandida respira en columna única (Task 5, verificación móvil).

---

# FASE 1 — Cursor retícula terminal

### Task 1: `TerminalCursor` sustituye a `CursorHalo`

**Files:**
- Create: `src/components/fx/TerminalCursor.tsx`
- Test: `src/components/fx/TerminalCursor.test.tsx`
- Delete: `src/components/fx/CursorHalo.tsx`, `src/components/fx/CursorHalo.test.tsx`
- Modify: `src/lib/config.ts` (tipo de `features`: `cursorHalo` → `terminalCursor`), `portfolio.config.json` (mismo cambio), `src/test/config.test.ts` (si referencia el flag), `src/App.tsx` (montar `TerminalCursor` donde estaba `CursorHalo`), `src/index.css` (regla `cursor: none`), `src/components/sections/Contact.tsx` (inputs y textarea → `data-cursor="text"`)

**Interfaces:**
- Consumes: `useMotionValue`/`useSpring`/`motion` de `framer-motion`; `useMediaQuery("(pointer: fine)")`, `useReducedMotion()`; `portfolioConfig.features.terminalCursor`; `t()` i18n; `DURATION_FAST`, `EASE_OUT_EXPO` de `lib/motion`.
- Produces: `TerminalCursor()` — renderiza el cursor o `null`. Contrato DOM: wrapper `fixed left-0 top-0 z-[35]` con `pointer-events: none` y `will-change: transform`, movido SOLO por motion values sobre `transform` (prohibido `useState` por mousemove). Contrato contextual: delegación en `document` (`mouseover`/`mouseout`) leyendo `closest("[data-cursor]")`; valores `"view" | "open" | "text"`; sin atributo → `rest`. Efecto de montaje: asigna `document.documentElement.dataset.customCursor = "on"` al montar, lo elimina al desmontar.

**Especificación visual (valores cerrados):**

| Elemento | Definición |
|---|---|
| Dot | 6px, `backgroundColor: hsl(var(--primary))`, sigue motion value directo (sin spring) |
| Ring | 88px, `border: 1px solid hsl(var(--foreground) / 0.45)`, `rounded-full`; spring stiffness 300 / damping 30 / mass 0.6 (igual al actual); en reposo `scale 0.32` (~28px) |
| Ticks crosshair | 4 líneas de 8×1px en `hsl(var(--foreground) / 0.35)` al N/S/E/W dentro del ring; `opacity 0` salvo en `rest` |
| Estado `view` | ring `scale 1`, `borderColor: hsl(var(--primary) / 0.9)`, fill `hsl(var(--primary) / 0.12)`, label `cursor.view` en mono 10px uppercase; dot oculto; ticks fuera |
| Estado `open` | brackets: 4 esquinas en L de 14×14px formando caja de 44px en `hsl(var(--accent))`; label `cursor.open` mono 10px a la derecha de la caja; ring/dot ocultos |
| Estado `text` | ring/ticks/brackets ocultos; dot se convierte en barra vertical de 2×20px en `hsl(var(--foreground))` (I-beam custom) |
| Transiciones | variantes de Framer Motion: crossfade + scale, `DURATION_FAST` + `EASE_OUT_EXPO`; sin `mix-blend-mode` (se elimina el `difference`) |

Regla `cursor: none` en `src/index.css` (dentro de `@layer` existente):

```css
@media (pointer: fine) {
  html[data-custom-cursor="on"] * { cursor: none !important; }
}
```

(`!important` necesario para ganar a los `cursor-pointer` de shadcn; documentado así en el propio CSS.)

- [ ] **Step 1: Write the failing test** (`TerminalCursor.test.tsx`, adaptar puertas de `CursorHalo.test.tsx`):
  - flag OFF → `container.innerHTML === ""` y `<html>` sin `data-custom-cursor`.
  - `pointer: fine` simulado en NO → null.
  - reduced-motion → null.
  - ON: fire `mouseover` en un `[data-cursor="view"]` → el label `cursor.view` está en el DOM; `[data-cursor="open"]` → label `cursor.open`; atributo `text` → sin label y modo I-beam; sin atributo → reposo.
  - unmount → `document.documentElement.dataset.customCursor` limpio.
- [ ] **Step 2: Run** `npx vitest run src/components/fx/TerminalCursor.test.tsx` — Expected: FAIL (componente no existe).
- [ ] **Step 3: Implement** según la especificación visual (tres capas: dot, ring con ticks, brackets; tamaños por constante + `scale`; dataset en el efecto con cleanup).
- [ ] **Step 4: Run** el test — Expected: PASS. Después `npx vitest run` completo — Expected: PASS (los tests de `config.test.ts` y de App que referencien `cursorHalo` se ajustan en este paso).
- [ ] **Step 5: Ajustar consumidores** — `data-cursor="text"` en los 3 campos del formulario Contact.
- [ ] **Step 6: Commit**

```bash
git add src/components/fx/TerminalCursor.tsx src/components/fx/TerminalCursor.test.tsx src/lib/config.ts portfolio.config.json src/test/config.test.ts src/App.tsx src/index.css src/components/sections/Contact.tsx
git rm src/components/fx/CursorHalo.tsx src/components/fx/CursorHalo.test.tsx
git commit -m "feat: cursor de retícula terminal con estados view/open/text (sustituye a CursorHalo)"
```

---

# FASE 2 — Capa de datos y copy

### Task 2: `data/contributions.ts` (ledger)

**Files:**
- Create: `src/data/contributions.ts`
- Test: `src/data/contributions.test.ts`
- Modify: `src/i18n/translations.ts` (claves `contributions.*` en ambos bloques)

**Interfaces:**
- Produces:

```ts
export interface Contribution {
  id: string;          // "leasba" | "mas" | "creators"
  hash: string;        // 7 hex fake: "a3f9c21", "f72e0b4", "c81d9aa"
  companyKey: string;  // nombre de empresa como clave i18n
  period: string;      // "Mar-May 2023" | "Mar-Jun 2026" | "Jul 2026 - hoy" / en: "Jul 2026 - now"
  type: "feat" | "fix" | "perf";  // los 3 son "feat"
  stack: string[];     // ver copy
  titleKey: string;    // línea resumen
  storyKeys: { problema: string; hilo: string; resolucion: string };
}
export const contributions: Contribution[];  // orden temporal: leasba, mas, creators
```

- Copy cerrado (es → en), claves `contributions.leasba_*`, `contributions.mas_*`, `contributions.creators_*`:

| Campo | es | en |
|---|---|---|
| leasba título | Facturación adaptada al negocio real | Invoicing adapted to the real business |
| leasba problema | El ERP estándar no reflejaba cómo factura el negocio de verdad. | The standard ERP did not reflect how the business actually invoices. |
| leasba hilo | Business Central no se configura: se extiende con AL. | Business Central is not configured: it is extended with AL. |
| leasba resolucion | Facturación a medida y workflows diseñados por cliente. | Bespoke invoicing and workflows designed per client. |
| mas título | Frontend del kiosco digital desde cero | Kiosk frontend built from scratch |
| mas problema | Un kiosco físico no es una web: pantalla táctil, hardware propio y cero margen de error. | A physical kiosk is not a website: touch screen, custom hardware, zero margin for error. |
| mas hilo | La arquitectura modular era la única salida salvable a escala de producto. | A modular architecture was the only workable way to scale the product. |
| mas resolucion | Frontend de NixNexo desde cero y coordinación directa con backend y producto. | NixNexo frontend from zero, coordinating directly with backend and product. |
| creators título | Ecosistema SGA operativo sobre SQL Server | WMS ecosystem running on SQL Server |
| creators problema | Un WMS distribuido donde la lógica vive dentro de la base de datos. | A distributed WMS where the logic lives inside the database. |
| creators hilo | En un almacén el código no se recarga: opera en vivo, contra producción real. | In a warehouse, code does not reload: it runs live against real production. |
| creators resolucion | Resolución de incidentes del SGA, backend Laravel + API Slim 3 y app Android sobre PDAs industriales junto a Magento y Odoo. | WMS incident resolution, Laravel backend + Slim 3 API and an Android app on industrial PDAs alongside Magento and Odoo. |

Stack tags: leasba `["AL", "Business Central", "M365"]`, mas `["Angular", "TypeScript", "RxJS"]`, creators `["Laravel", "Slim 3", "SQL Server", "Android", "Magento", "Odoo"]`.

- [ ] **Step 1: Write the failing test**: 3 entradas, ids únicos, hash con regex `/^[0-9a-f]{7}$/`, `storyKeys` con las 3 partes presentes, orden temporal `["leasba", "mas", "creators"]`.
- [ ] **Step 2: Run** `npx vitest run src/data/contributions.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** el array + claves i18n (es y en a la vez, simetría).
- [ ] **Step 4: Run** — Expected: PASS (incluye `i18n/translations.test.ts`).
- [ ] **Step 5: Commit** — `git commit -m "feat: datos de contributions (ledger de aportaciones) con copy es/en"`

### Task 3: `data/certifications.ts` + `data/sidequests.ts` + `data/stats.ts`

**Files:**
- Create: `src/data/certifications.ts`, `src/data/sidequests.ts`, `src/data/stats.ts`
- Test: `src/data/certifications.test.ts`, `src/data/sidequests.test.ts`, `src/data/stats.test.ts`
- Modify: `src/i18n/translations.ts` (claves en ambos bloques)

**Interfaces:**
- Produces:

```ts
export interface Certification {
  id: string;           // "elev8" | "big_school" | "ibm"
  issuer: string;       // texto plano
  titleKey: string;     // claves certifications.elev8_title etc. (títulos propios, no se traducen salvo variante es/en si procede)
  date: string;         // "Sept 2026" | "Jun 2026" | "Feb 2026"
  validUntil?: string;  // solo elev8: "2030"
  credentialId?: string;// elev8: "e43bf971-c499-4c43-a69a-a546bc3a8be9" · ibm: "1965d5c5-2593-47ca-bed5-a5190bfa7667"
  url: string;          // LinkedIn (ver mapeo abajo)
}
export interface SideQuest {
  id: string;           // "dj" | "voz" | "gaming"
  title: string;        // "DJ" | "Voz & vídeo"/"Voice & video" | "Gaming" (vía titleKey)
  icon: "Disc3" | "AudioWaveform" | "Gamepad2";  // glyph Lucide
  bodyKey: string;
  transferKey: string;
}
export interface StatRow {
  id: string;           // "frontend" | "backend" | "mobile" | "erp_legacy" | "ai_tooling"
  value: number;        // 0..16, autorrevelación declarada
  max: 16;
  captionKey: string;   // leyenda cualitativa
}
```

- Datos cerrados:
  - URLs LinkedIn (mapeo a verificar contra el título del post antes de cablear): elev8 `https://www.linkedin.com/feed/update/urn:li:activity:7514304684887826432/` · big_school `...7476236098143444992/` · ibm `...7429203243265794050/`.
  - Side quests copy (es → en): dj body «Aprendí a pinchar: leer la sala y corregir el tempo en vivo, sin red.» → "Learned to beatmatch: read the room and fix the tempo live, no safety net."; dj transfer «En el código: leer al usuario y ajustar el sistema en tiempo real.» → "In code: read the user, tune the system in real time."; voz body «Editaba voces a mano: cortes, silencios, oído crítico frame a frame.» → "Used to edit voices by hand: cuts, silences, critical listening frame by frame."; voz transfer «En el código: post-producción es detalle en microinteracciones.» → "In code: post-production is detail in micro-interactions."; gaming body «Sistemas, feedback loops y decisiones con información incompleta.» → "Systems, feedback loops, decisions with incomplete information."; gaming transfer «En el código: game design aplicado a UX.» → "In code: game design applied to UX."
  - Stats (autorrevelación, leyenda es → en): frontend 13 «fuerte» → "strong"; backend 10 «sólido» → "solid"; mobile 15 «núcleo» → "core"; erp_legacy 8 «batallas ganadas» → "battle-tested"; ai_tooling 11 «de diario» → "daily driver". Las barras se pintan como TEXTO ASCII en mono (`"█".repeat(value) + "░".repeat(max - value)`), sin track de fondo CSS.

- [ ] **Step 1: Write the failing tests** (un test por fichero): certifications — 3 entradas, ids únicos, URL regex `^https://www.linkedin.com/`, credentialId regex UUID si existe; sidequests — 3 entradas, icon dentro del set cerrado, transferKey presente; stats — 5 filas, `0 <= value <= max`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement** los tres arrays + claves i18n (es/en) y la helper `statBar(value: number, max: number): string`.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: datos de certifications, side quests y stats con copy es/en"`

### Task 4: Hilos por proyecto + El Puente en Trayectoria

**Files:**
- Modify: `src/data/projects.ts` (añadir `threadKey?: string` al tipo `Project` + valor en los 3 proyectos), `src/data/trayectoria.ts` (extender `Category` y `Variant` con `"bridge"` + item `puente`), `src/i18n/translations.ts`
- Test: `src/data/projects.test.ts`, `src/data/trayectoria.test.ts` (extender)

**Interfaces:**
- Produces: `Project.threadKey?: string` (clave i18n del hilo). `TrayectoriaItem` nuevo: `{ id: "puente", category: "bridge", variant: "bridge", startDate: "2026-01", endDate: "2026-02", titleKey: "trayectoria.item_puente_title", orgKey: "trayectoria.item_puente_org", locationKey: "trayectoria.item_puente_location", detailKey: "trayectoria.item_puente_detail" }` — la tarjeta puente se posiciona entre `udon` y `mas` por fechas.
- Copy cerrado: hilo GameVision (es): «La app no lista juegos: aprende tu gusto. Identidad por uid, descubrimiento guiado por señales reales.» (en: "The app does not list games: it learns your taste. Identity by uid, discovery guided by real signals."); hilo MatchVision (es): «Un partido es un stream, no una página que recargas.» (en: "A match is a stream, not a page you reload."); hilo Casa Húmedo (es): «SSR + reserva sin comisiones: devolver al negocio local el control de su web.» (en: "SSR + zero-commission booking: hand local business the control of its own site."); puente detail (es): «La cocina no fue un desvío: financió el máster y entrenó lo que ningún curso enseña. Presión, timing y servicio con la sala llena: el método para profesionalizarme y llegar al sector.» (en: "The kitchen was not a detour: it paid for the master's and trained what no course teaches. Pressure, timing and service with a full room: the method I used to go professional and reach the industry."); puente title (es): «El Puente» (en: "The Bridge"); org (es): «De la cocina al código» (en: "From kitchen to code").
- [ ] **Step 1: Write the failing tests**: projects — si `threadKey` existe, la clave está en ambos idiomas (usar el helper de simetría existente); trayectoria — el item `puente` existe, `variant: "bridge"` es válido y el orden cronológico lo deja entre `udon` y `mas`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement** los campos + claves.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: hilo por proyecto en el detalle y tarjeta El Puente en trayectoria"`

---

# FASE 3 — Secciones nuevas

### Task 5: Sección `Contributions` + Education solo formal

**Files:**
- Create: `src/components/sections/Contributions.tsx`
- Modify: `src/pages/Index.tsx` (montar entre `Trayectoria` y `Education`, dentro de `WindowChrome` con `title="~/contributions — git log --author=alejandro"` e `id="contributions"`), `src/components/sections/Education.tsx` (quitar la ficha IBM del array `items`; grid a `md:grid-cols-2`)
- Verificación: viewport móvil — filas expandibles en columna única.

**Interfaces:**
- Consumes: `contributions` de `@/data/contributions`; `WindowChrome`, `SectionContainer`, `Reveal`/`RevealStagger`, `t()`.
- Produces: `Contributions({ motionStyle? })` — lista de filas mono expandibles. Formato de fila cerrado: `hash` mono en `--primary` + `type` + empresa + período a la derecha; segunda línea `titleKey`; stack como índice mono separado por hairlines (patrón Education). Expansión: la war story en tres líneas con labels mono `contributions.story_problema` / `story_hilo` / `story_resolucion` («Problema» / «El hilo» / «Resolución» · "Problem" / "The thread" / "Resolution"), altura animada (accordion sobrio, `EASE_OUT_EXPO`). `aria-expanded` correcto en el botón-fila.
- [ ] **Step 1: Implement** el componente (sin test nuevo: es presentación; la simetría i18n y el data ya están cubiertos).
- [ ] **Step 2: Education split** — IBM fuera (su credential migra a Task 6).
- [ ] **Step 3: Verificar en dev** (`npm run dev`) — filas expanden y colapsan; móvil OK.
- [ ] **Step 4: Run** `npx vitest run` — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: sección contributions con war stories expandibles y education solo formal"`

### Task 6: Secciones `Certifications`, `SideQuests` y `Stats`

**Files:**
- Create: `src/components/sections/Certifications.tsx`, `src/components/sections/SideQuests.tsx`, `src/components/sections/Stats.tsx`
- Modify: `src/pages/Index.tsx` (montar en este orden tras Education: `Certifications` → `SideQuests` → `Stats`, cada una en su `WindowChrome`: `title="~/certifications — credentials --verify"` e `id="certifications"`; `title="~/side-quests — ls ~/hobbies"` e `id="sidequests"`; `title="~/stats — uptime"` e `id="stats"`)

**Interfaces:**
- Consumes: los data files de Fase 2; receta visual de Education (specular glass, eyebrow accent hairline + período mono, footer al fondo de la tarjeta con `mt-auto`).
- Produces:
  - `Certifications` — grid 3 cards (md:grid-cols-3): eyebrow mono con emisor, título, fecha; `validUntil` (solo elev8) como mono label «Vigente hasta 2030»/"Valid until 2030"; credential ID en mono break-all; botón «Mostrar credencial»/"Show credential" con `ExternalLink`, `target="_blank"` `rel="noopener noreferrer"`.
  - `SideQuests` — grid 3 cards: icono Lucide discreto (`h-4 w-4` en `--muted-foreground`), título, body; línea de transferencia en mono con prefijo `→`.
  - `Stats` — ventana compacta: bloque de dos columnas (mono ASCII a la izquierda o solo filas si el logo ASCII no aporta); cada fila: label mono + barra ASCII + caption en `--muted-foreground`. Sin animaciones en loop en ninguna de las tres secciones (lección Passions).
- [ ] **Step 1: Implement** las tres secciones.
- [ ] **Step 2: Verificar en dev** — composición y scroll correctos; móvil en columna única.
- [ ] **Step 3: Run** `npx vitest run` — Expected: PASS.
- [ ] **Step 4: Commit** — `git commit -m "feat: secciones certifications, side-quests y stats"`

---

# FASE 4 — Integración en el shell

### Task 7: Nav, Spotlight y CLI

**Files:**
- Modify: `src/components/Nav.tsx` (links `nav.impact` → `#contributions`, `nav.sidequests` → `#sidequests`), `src/lib/spotlight-items.ts` (secciones: `contributions`, `certifications`, `sidequests`, `stats` con labels "Go to impact", "Go to certifications", "Go to side quests", "Go to stats"), `src/lib/cli-commands.ts` (comandos `impact`, `certs`, `stats` siguiendo el patrón de los comandos de info existentes + líneas en `HELP`), `src/i18n/translations.ts` (`nav.impact` es «Impacto» / en "Impact"; `nav.sidequests` «Side quests» en ambos)
- Test: `src/lib/spotlight-items.test.ts`, `src/lib/cli-commands.test.ts` (extender)

**Interfaces:**
- Consumes: `scrollToSection(key)` — las claves de spotlight DEBEN ser ids reales de `Index.tsx` (contributions, certifications, sidequests, stats).
- [ ] **Step 1: Write the failing tests**: spotlight — los 4 nuevos ids generan items del grupo Sections; cli — `impact`/`certs`/`stats` responden sin error y aparecen en `HELP`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement** los tres ficheros.
- [ ] **Step 4: Run** — Expected: PASS. Verificar nav a una sola línea en lg (1024px) con 7 links; si no cabe, acortar etiquetas («Impacto» ya es corto; último recurso: Side quests solo por scroll/spotlight).
- [ ] **Step 5: Renumerar labels de sección** («01 — About», «02 — Projects», …) en `translations.ts` para que queden consecutivos con las secciones nuevas.
- [ ] **Step 6: Commit** — `git commit -m "feat: nav, spotlight y CLI con las secciones nuevas"`

---

# FASE 5 — Footer profesional y teléfono fuera

### Task 8: Footer editorial + purga del teléfono

**Files:**
- Modify: `src/components/Footer.tsx` (restructura), `portfolio.config.json` (eliminar `phone`), `src/lib/config.ts` (tipo, si `phone` es campo del tipo), `index.html` (JSON-LD y meta: eliminar `telephone`/`tel:` si aparece), `src/i18n/translations.ts` (quitar `aria.phone` en ambos bloques; nueva `footer.status`; cambiar valor de `contact.signature`)
- Test: `src/i18n/translations.test.ts` (debe seguir verde), `src/test/config.test.ts` (ajustar si referencia `phone`)

**Interfaces:**
- Consumes: `portfolioConfig` sin `phone`; status colors existentes.
- Produces: Footer en 3 zonas con la misma hairline + mono del site:

```
Alejandro Olivares          Sobre · Proyectos         [in] [gh]
Frontend & Mobile Dev       Trayectoria · Impacto
León, España                alejandro.oliesc97@gmail.com

────────────────────────────────────────────────────────────
© 2026 Alejandro Olivares Escapa          ● Abierto a oportunidades
Construido con café y ganas
```

- Copy cerrado: `footer.status` es «Abierto a oportunidades» / en "Open to opportunities"; `contact.signature` es: es «Construido con café y ganas» / en "Built with coffee and grit". El punto de estado (único del site) usa el status color verde existente.
- [ ] **Step 1: Purgar el teléfono** — config, tipo, JSON-LD/meta de `index.html` (grep `tel` y `601` en `index.html` y en `src/` para cero restos), `aria.phone`.
- [ ] **Step 2: Implement** el nuevo Footer (grid de 3 zonas, links de nav rápidos con `scrollToSection`).
- [ ] **Step 3: Run** `npx vitest run` + `npm run lint` — Expected: PASS.
- [ ] **Step 4: Commit** — `git commit -m "feat: footer editorial profesional sin teléfono público"`

---

# FASE 6 — QA, verificación y docs

### Task 9: Verificación completa y registro

- [ ] **Step 1: Suite completa** — `npm run tokens:test` (no debe cambiar), `npx vitest run`, `npm run lint`, `npm run build` — Expected: todo PASS.
- [ ] **Step 2: Verificación visual en preview** (`npm run build && npm run preview`): screenshots desktop (1280px) y móvil (390px), tema indigo y dracula, comprobando: cursor en los 4 estados, ledger expandible, certs grid, side quests, stats ASCII, footer nuevo, sin teléfono en el footer ni en el DOM.
- [ ] **Step 3: Pre-Flight de diseño** (checklist de la skill de gusto): cero em-dashes en copy nuevo, un acento (`--primary`) consistente, radios coherentes, contraste AA en footer/status, reducido-motion estático.
- [ ] **Step 4: Validación de My G** — preview + copy del ledger e hilos a revisión; se corrige antes de merge.
- [ ] **Step 5: Update AGENTS.md del repo** (§8 page composition con las secciones nuevas y el shell actualizado; §10 data con los 3 data files nuevos) y registro de ejecución al final de este plan.
- [ ] **Step 6: Commit** — `git commit -m "docs: registro de ejecución next-level-r2 y actualización de AGENTS.md"`

## Estrategia de commits y rama

Rama de trabajo: `feat/next-level-r2` desde `feat/next-level-fase-1.5` (la rama con el estado más reciente; la rama principal del repo es `main`, no existe `master`). Commits atómicos por fase (uno por Task, `docs:` para el propio plan como primer commit). Sin push ni PR salvo petición de My G (merge a `main`: confirmar antes).
