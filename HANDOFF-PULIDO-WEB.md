# HANDOFF — Continuación del plan de pulido premium (`pulido-web`)

**Escrito:** 2026-09-26
**Para:** el siguiente agente que retome el trabajo.
**Rama:** `pulido-web` · **HEAD:** `e261be3` (`docs: record the phase 3 rhythm handover`)
**Plan canónico:** [`PLAN-PULIDO-WEB.md`](./PLAN-PULIDO-WEB.md) — **léelo entero antes de tocar nada.** Este documento no lo sustituye: es el estado exacto de ejecución, la evidencia medida y el arranque de la fase siguiente.

> **Contexto de esta entrega:** el agente anterior se detuvo a mitad de turno. La rama está **limpia y commiteada** (no hay trabajo parcial en disco ni en `git stash`): lo último que hizo fue cerrar y documentar la Fase 3. Lo que sigue (Fases 4–7) **no está empezado**.
> Quedaron dos artefactos de depuración sin commitear en `.freebuff/` (ver §9): `tw-probe.css` y `preview.log` con la cadena `[BLOCKED]`. Son desechables; no forman parte del plan.

---

## 0. Resumen de 60 segundos

El proyecto recibió el encargo de subir el portfolio de «template muy pulido» a **instrumento editorial de precisión** (tesis «Editorial OS», §1 del plan). Se aprobó un alcance **tier 1**: sistema de diseño, ritmo, detalle y **borrado de la sección Passions**. Sin features nuevas, sin refactors estructurales, sin cambios de arquitectura.

**7 fases.** Las 3 primeras están completas, verificadas y commiteadas:

| Fase | Nombre | Estado |
| --- | --- | --- |
| 1 | Fundación de tokens (por el pipeline) | ✅ COMPLETA (`deb5eb1`, `5d5d81d`) |
| 2 | Barrido de literales de color/radio | ✅ COMPLETA (`f4502cb`, `845bd5d`) |
| 3 | Ritmo vertical con dueño único (`.section-y`) | ✅ COMPLETA (`d9cea51`) |
| **4** | **Motion coreografiado + micro-interacciones** | ⬜ **EMPEZAR AQUÍ** |
| 5 | Ajustes por sección (Hero, Nav vs dock, TechBento, Trayectoria) + consumir la escala tipográfica | ⬜ PENDIENTE |
| 6 | Borrado de «Passions» (11 ficheros, 6 puntos de rotura) | ⬜ PENDIENTE |
| 7 | Los dos defectos concretos (anchor muerto + 5 errores de `tsc`) | ⬜ PENDIENTE |

Tokens: **85** (empezó en 53), × 4 temas. El pipeline es la fuente única de verdad; nada visual se escribe a mano (ver §2).

---

## 1. Estado exacto del repositorio (verificado hoy)

```
rama:            pulido-web
HEAD:            e261be3  docs: record the phase 3 rhythm handover
working tree:    limpio salvo  ?? .freebuff/   (solo artefactos de depuración, desechables)
git stash:       vacío
```

### Gates medidos en este mismo árbol (baseline real, no de memoria)

| Gate | Comando | Resultado hoy |
| --- | --- | --- |
| Tokens | `npm run tokens` | 85 tokens × 4 temas, determinista |
| Tests de tokens | `npm run tokens:test` | 14/14 |
| Tests | `npm test` | **15 ficheros, 71 tests, todo verde** |
| Lint | `npm run lint` | **0 errores, 11 warnings** (todos `react-refresh/only-export-components` en primitivas shadcn / contextos) |
| Typecheck | `npx tsc --noEmit -p tsconfig.app.json` | **5 errores** — ver §7, son justamente el work item de la Fase 7 |
| Build | `npm run build` | última ejecución OK (7322 módulos) |

Los 5 errores de `tsc` (textual, hoy):

```
src/components/sections/PassionCard.tsx(69,40): TS2345  (…(v: false) => true …)   ← muere con la Fase 6
src/components/sections/Projects.tsx(102,9):    TS2322  MotionValue<number> → Scale
src/components/sections/Projects.tsx(104,9):    TS2322  MotionValue<number> → Opacity
src/components/ui/SectionContainer.tsx(37,9):   TS2322  MotionValue<number> → Scale
src/components/ui/SectionContainer.tsx(39,9):   TS2322  MotionValue<number> → Opacity
```

### Verificación previa recomendada (antes de tu primer edit)

```bash
git status && git log --oneline -6
npm run tokens && npm run lint && npm test
npx tsc --noEmit -p tsconfig.app.json
```

Si algo de esto no coincide con la tabla, **para y averigua por qué** antes de seguir (otro hilo podría haber tocado el árbol).

---

## 2. Reglas que NO se pueden romper (extracto operativo de `AGENTS.md`)

`AGENTS.md` es largo y **está en lo cierto**: leerlo entero. Resumen de lo que más muerde:

1. **El pipeline de tokens es la única fuente de verdad** (§4). Prohibido hardcodear color, familia tipográfica, radio o `--nav-height` en componentes. Se añade el token a `src/styles/tokens/semantic/*.json` (o `themes/<tema>.json`) y se regenera.
2. **No se edita a mano `src/styles/generated/`** — está **gitignored** y se regenera con `npm run tokens`. Antes de `build` **hay que** correr `tokens` (el watcher solo existe en dev).
3. **No crear `tailwind.config.ts`.** Tailwind v4 es CSS-first: tokens, utilidades y `@theme inline` viven en `src/index.css` + los JSON del pipeline. Cualquier agente que sugiera un config de Tailwind no ha leído §4.
4. **No editar primitivas shadcn** (`src/components/ui/`). Carve-out: son editables a mano `SectionContainer.tsx`, `PassionArt.tsx`, `MobilePassionCard.tsx` (app code en carpeta de UI, señal: tienen `.test.tsx` o no exportan patrones Radix).
5. **i18n: siempre `en` y `es` juntos** (`src/i18n/translations.ts`). Si falta una clave, `t()` devuelve la clave literal en pantalla.
6. **No usar `window.matchMedia` directamente** en componentes: `useMediaQuery` / `useReducedMotion`.
7. **GSAP siempre desde el barrel** `@/lib/gsap` (si no, el plugin no está registrado). Todo efecto GSAP en `.context()` enrooted en un ref real.
8. **`prefers-reduced-motion` se respeta en toda animación nueva.**
9. **No tocar el switch `shouldUseFallback`** de `ProfileShowcase` — pero ojo: la Fase 6 borra ese componente entero, así que el gate se traslada a lo que quede (ver §6).
10. Tipografías: **un solo `<link>`** en `index.html`, sin pesos nuevos. Actuales: `Fraunces` (display, variable 100–900), `IBM Plex Sans`, `IBM Plex Mono`.
11. **Strict mode está OFF** a propósito (`strict: false`, `noUnusedLocals: false`, etc.). No lo "arregles" — eso es un refactor aparte.
12. **Commits atómicos por fase**, y **no hay push ni PR** sin petición explícita.

Arquitectura del pipeline (para extenderlo, no para pelearse con él):

| Módulo | Responsabilidad |
| --- | --- |
| `scripts/tokens-core.mjs` | Motor puro: `flatten`, `resolveAliases`, `buildTokenModel`, `emitCSS`/`emitTS`/`emitFlat`, matemática de contraste WCAG. Sin FS, sin logging. |
| `scripts/tokens-sources.mjs` | Frontera de IO: dónde viven las fuentes y su *load order* (`tokens.index.json`). Compartido por CLI y tests. |
| `scripts/build-tokens.mjs` | CLI fino: cargar → reducir → escribir 3 artefactos → log. |
| `src/scripts/build-tokens.test.ts` · `token-contrast.test.ts` | Los tests importan **core + loader**, nunca el CLI. |

**Política de emisión por forma, no por lista** (clave de las Fases 1–2): cualquier clave cuyo valor sea un **triple HSL crudo** (`isRawTriple`) se emite como `--color-*` en `@theme inline` (así Tailwind genera `text-*`, `bg-*`, `border-*`, `shadow-*`). Los namespaces propios (`radius-*`, `font-*`, `text-*`, `tracking-*`) se copian **verbatim**. Es estructuralmente imposible envolver un token compuesto (`--surface-glass: hsl(var(--card)/0.45)`) en un `hsl(hsl(...))` inválido. Añadir un token nuevo no requiere tocar el emisor.

---

## 3. Lo que YA está hecho — **no lo repitas**

### Fase 1 — Fundación de tokens
- Familias + escala tipográfica (`text-display/h1/h2/h3/body/body-sm/caption/label`) + tracking nombrado (`tracking-display/heading/mono/label`).
- Escala de radios `--radius-{xs,sm,md,lg}` = 4/8/12/16px (**sin** `xl`/`2xl`, deliberado: emitir 24px movería 9 usos reales). Se añadió `--radius-full`.
- `--section-gap` / `--section-gap-sm` (dueño único del ritmo vertical).
- 6 tokens `surface-glass*` que consolidan las recetas de glass en **dos materiales**.
- `muted-foreground` corregido en catppuccin/dracula/tokyo-night (55% → 60% de lightness; indigo no se tocó porque ya daba 7.35:1). **La cifra de `AUDITORIA-2026.md` (≈4.2:1 en indigo) era irreproducible**; el fallo real estaba en los otros temas y **sobre `card`**.
- **Desviación a documentar:** la fuente display es **Fraunces**, no `Instrument Serif` (5 titulares usan `font-bold` y dos reglas piden 800; Instrument Serif solo tiene 400 → negrita sintética).
- `AGENTS.md` actualizado (§4 tipografías, radios, `section-gap`, mapa del pipeline).

### Fase 2 — Barrido de literales
- **145 `hsl(literal)` + 27 hex + 117 `rounded-*` + 6 recetas de glass**: barridos. Verificado en navegador que dock, `::selection`, `.dock-item-active` y `.glass*` **cambian por tema** (antes eran indigo congelado en los 4).
- Neutros: `--neutral-tint` / `--neutral-scrim` son el único par acromático.
- Radios `xl/2xl/3xl` de componentes vivos → `rounded-md/lg`; `9999px` → `--radius-full`; `1rem/1.25rem` de CSS modules → `var(--radius-lg)`.
- **Dead code eliminado:** `useFluidGradient` (+test), `BrowserPreview`, `PhoneVideo`, `App.css`.
- Excepción pactada y comentada en código: **traffic lights macOS** (`#ff5f57`/`#febc2e`/`#28c840`). `Hero3D` usa `rgb(124 92 255)` (== primary por defecto) porque `THREE.Color` exige literal.

**Residual auditado hoy (nada más):** 6 traffic lights (§ arriba) + `#ccc`/`#fff` dentro de selectores de recharts en `src/components/ui/chart.tsx` (primitiva shadcn intocable). Los `hsl(...)` que quedan están en **los JSON del pipeline** (`themes/*.json` y el propio `semantic/colors.json`), que es donde deben estar. **El criterio «ningún literal visual fuera del pipeline» ya está cumplido.**

### Fase 3 — Ritmo y espaciado
- `.section-px` (horizontal) + **`.section-y`** (vertical) son los dos ejes; ambos consumen tokens. `.section-y` añade `scroll-margin-top: calc(var(--nav-height,60px) + 8px)`.
- `WindowChrome` ya **no** impone `my-8`; `SectionContainer` perdió `py-12` + `min-h-[60vh]`; desaparecieron los parches `my-0` de `Index.tsx` / `HeroShowcase.tsx`.
- `--section-gap: 1rem`, `--section-gap-sm: 0.875rem`, calibrados para **reproducir** el ritmo pintado heredado. El headroom anti-FOUC del fog vive ahora en `.window-rail` (último hijo del flujo) en vez de un `pb-32` inline.

> ⚠️ **Trampa documentada en `src/index.css` (línea ~275):** un comentario CSS que contenga la secuencia `my-*/py-*` se auto-termina en la estrella-barra embebida y **la regla siguiente desaparece del bundle sin error de build**. Costó una sesión de depuración. No vuelvas a escribir esa secuencia en un comentario CSS.

---

## 4. FASE 4 (siguiente) — Motion coreografiado + micro-interacciones

**Objetivo del plan:** un **único patrón de revelado** con duración/easing **tokenizados**, en lugar de `whileInView` repetido por todas las ventanas. Reducir `whileInView` a ~3 momentos clave. Añadir **specular pointer-aware** en cards. Respetar `prefers-reduced-motion` en todo lo nuevo. **Fuera de alcance:** scoping del CRT al terminal (tier 3).

### Evidencia medida hoy

- `whileInView` aparece **8 veces en 5 ficheros**: `About.tsx` (3), `Education.tsx` (2), `WindowChrome.tsx` (1), `Projects.tsx` (1), `Contact.tsx` (1).
- **No existe ningún token de motion.** No hay duración ni easing en `semantic/*.json` ni `primitives/*.json`.
- El easing `[0.22, 1, 0.36, 1]` está **duplicado a mano** en `WindowChrome.tsx` (`transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}`) y en `About.tsx` (`const EASE = [0.22, 1, 0.36, 1] as const`). Duraciones dispersas: `0.2` (WindowChrome minimize), `0.5`, `0.6`, `0.7`, `0.8`.
- `About.tsx` define un `Variants` `fadeUp` con `custom` + delay escalonado `i * 0.1`; `Education.tsx` repite el mismo patrón con `delay: i * 0.1` inline. Es exactamente la duplicación que la fase debe colapsar.
- `SectionContainer.tsx` acepta un `motionStyle={{ scale, y, opacity }}` y lo pasa **directamente como `style` a un `<section>`** — de ahí los 4 errores de `tsc` (ver §7).
- El specular pointer-aware (`--mx`/`--my`) **no existe todavía** en ninguna card.

### Propuesta de ejecución (ajustable, pero mantén la forma)

1. **Tokens primero, test-first** (`AGENTS.md` §12: nuevo helper de data-shaping ⇒ test co-locado **antes** de la implementación):
   - Añadir a `semantic/typography.json` o a un nuevo `semantic/motion.json` (lo limpio es un fichero nuevo + su línea en `tokens.index.json`): `duration-fast` (≈200ms), `duration-base` (≈500ms), `duration-slow` (≈700ms) y `ease-out-expo` (`cubic-bezier(0.22,1,0.36,1)`).
   - Ojo: si el valor **no** es un triple HSL crudo ni un namespace propio, **no** se emite automáticamente al `@theme inline` ni como utilidad Tailwind. Decide si necesitas utilidades (`transition-duration`/`ease-*`) o basta con consumirlo por `var()` desde `index.css`. Extiende `build-tokens.test.ts` con una aserción del shape nuevo si tocas la política de emisión.
2. **Un solo patrón de revelado.** Extrae el `fadeUp` de `About.tsx` a un helper compartido (p. ej. `src/lib/motion.ts`) que consuma los tokens, y úsalo en `About`, `Education`, `Projects`, `Contact` y `WindowChrome`. Deja `whileInView` **solo** en los 3 momentos que de verdad lo merezcan (candidatos naturales: entrada de cada `WindowChrome`, el H2 de la sección, y la rejilla de cards de `Education`). El resto pasa a revelado por CSS (`animation-timeline: view()` está aún en soporte irregular — **prefiere IntersectionObserver/CSS class** antes que una API frágil, o simplemente un solo wrapper `motion.div` que orqueste a sus hijos con `staggerChildren`).
3. **Specular pointer-aware.** Propón `--mx`/`--my` por CSS en las cards (`Education` cards y `TechBento` si la Fase 5 no lo cambia antes). Debe seguir el §2: nada de gradientes decorativos nuevos sueltos — si el highlight es un color, sale de token.
4. **`prefers-reduced-motion`** en todo lo nuevo. `useReducedMotion` ya existe; no uses `matchMedia` a pelo.
5. **Verifica con estilos computados, no a ojo** (es el estándar que han seguido las fases 1–3): abre la página y comprueba `transition-duration`/`animation` computados, y que con reduced-motion activo el revelado queda estático.

**Riesgo principal:** convertir la fase en un rediseño de animaciones. El plan pide *menos y mejor*, no más. Si dudas, quita movimiento.

---

## 5. FASE 5 — Ajustes por sección (+ consumir la escala tipográfica)

**Objetivo del plan:** Hero (jerarquía por tipografía, no por gradientes; el 3D se mantiene) · diferenciar menú vs dock · TechBento asimétrico real y fuera el shine sweep · Trayectoria: mantener el pin horizontal, tocar magic numbers solo si es barato.

### Hallazgo importante: la escala tipográfica existe pero **no la consume nadie**

Los tokens `--text-display/h1/h2/h3/body/body-sm/caption/label` se emiten (Fase 1) pero **cero componentes los usan**. Las secciones siguen inventándose la escala:

- `Hero.tsx`: `text-5xl sm:text-6xl md:text-7xl`
- `Education.tsx`: `text-4xl sm:text-5xl md:text-6xl`
- `Contact.tsx`: `text-5xl sm:text-6xl md:text-7xl`
- `TechBento.tsx`: `text-sm` + `tracking-[0.12em]`
- Quedan **19 `clamp()`** y **6 `tracking-[…]`** sueltos en `src/`.

⇒ El criterio «una escala tipográfica» **no se cumple aún**. Esta es la parte de la Fase 5 con más valor y el candidato claro a commit propio: sustituir los `text-*` de titulares y los `tracking-[…]` por los tokens, y verificar en los 3 anchos (375/768/1440) que **el render no se mueve** (la escala se calibró para eso; si se mueve, es un bug de calibración, no un rediseño).

### Otros puntos de la fase, con el estado real

- **Menú vs dock** (`Nav.tsx` vs `dock/Dock.tsx`): hoy el nav es una barra con labels y el dock son iconos con magnify. El plan pide *diferenciar el rol* (nav = estado + secciones con labels mono; dock = apps/acciones con tratamiento de icono). El nav ya usa `font-mono` en el `kbd` ⌘K pero **no** en los labels.
- **TechBento** (`TechBento.tsx`): hoy es `grid-cols-1 sm:grid-cols-2` con **4 cells iguales** (2×2) y chips con `.tech-chip` (**shine sweep**: `tech-chip::before` en `index.css`, ~30 líneas). El plan pide **bento asimétrico real** (una cell featured a 2 columnas + satélites), **un solo tratamiento de icono** y **fuera el shine sweep**. Nota: los items con `svg: null, iconLucide` (Apicalypse, "Integración de IA") son el caso mixto SVG/Lucide que el audit marcó como inconsistente.
- **Hero** (`Hero.tsx`): dos CTAs usan `text-gradient` en el H1. El plan dice que la jerarquía la lleve la tipografía, no el gradiente. `.text-gradient` sigue siendo `linear-gradient(135deg, --gradient-text-from, --gradient-text-to)` (blanco→gris en la práctica), aplicado en **todos** los H1 del sitio. El audit lo llama «el patrón más copiado de Dribbble» y no theme-aware. Decisión de diseño pendiente para el humano (ver §12).
- **Trayectoria** (`Trayectoria.tsx` + `.module.css`): pin horizontal GSAP **se mantiene** (es esencia, según el plan). Magic numbers conocidos: `padding: 0 calc(50vw - 220px) 0 15vw`, `height: 600px`, card `width: 380px`. Solo se tocan si el coste es bajo. Ya respeta reduced-motion (skip del pin).

---

## 6. FASE 6 — Borrado de «Passions» (borrar con precisión, o romperás el nav)

**Objetivo:** eliminar la sección completa. **Hoy los 11 ficheros siguen en disco** (comprobado). Es el commit más arriesgado de la fase: toca CSS + i18n + nav a la vez ⇒ **commit propio y aislado** para poder revertirlo solo.

### Eliminar (11 ficheros)

```
src/components/sections/ProfileShowcase.tsx
src/components/sections/ProfileDeck.tsx
src/components/sections/PassionCard.tsx
src/components/sections/ProfileSectionHeader.tsx
src/components/ui/MobilePassionCard.tsx
src/components/ui/PassionArt.tsx
src/components/ui/PassionArt.test.tsx
src/lib/profile-content.ts
src/lib/profile-content.test.ts
src/lib/passion-data.ts
src/lib/passion-data.test.ts
```

### Editar (los 6 puntos que rompen si se olvidan)

1. **`src/pages/Index.tsx`** — quitar el import de `ProfileShowcase` y la ventana:
   ```tsx
   <WindowChrome title="~/passions.md" id="profile" className="max-w-none w-full section-y">
     <ProfileShowcase />
   </WindowChrome>
   ```
   La composición pasa de **8 ventanas a 7** (hero, about, projects, trayectoria, education, contact + el wrapper de HeroShowcase).
2. **`src/components/Nav.tsx`** — dos cosas, no una:
   - quitar `{ labelKey: "nav.profile", href: "#profile" }` de `linksConfig`;
   - **re-anclar `computeThreshold()`**. Hoy hace `document.getElementById("profile")` y, si no lo encuentra, **`return 500`** ⇒ sin `#profile` el nav aparecería a 500px de scroll. Re-anclar a `#projects` (o a la primera sección que siga teniendo sentido). `allSections` se deriva de `linksConfig`, así que se actualiza solo.
3. **`src/lib/spotlight-items.ts`** — quitar `"profile"` de la lista de ids (está en la **línea 16**: `"hero", "about", "profile", "stack", "experience", "projects", "education", "contact"`). Hay test co-locado (`spotlight-items.test.ts`) — actualízalo.
4. **`src/i18n/translations.ts`** — quitar `nav.profile` **y las 14 claves `profile.*`**, en **ambos** bloques (`en` líneas ~9 y ~48–61; `es` líneas ~243 y ~282–295). Hoy hay **28 coincidencias** `"profile.` (14 × 2). Simetría obligatoria (§2.5).
   - ⚠️ Decisión: `about.section_label` dice `"02 — Passions"` en los dos idiomas. Si la numeración de secciones importa, hay que renumerar (About es `02` y la sección que muere es `02 — Passions`; revisa si el label correcto es `01`/`02`). **Comprueba si algún otro `section_label` deja un hueco visible.**
5. **`src/index.css`** — borrar el bloque `.profile-*` completo: empieza en la **línea ~313** (`.profile-showcase`) y llega al final del layer (~**617**), incluidos los `@keyframes profile-vinyl-spin` / `profile-chef-breathe` / `profile-led-blink` (líneas ~604–615) y sus `@media`. Son ~300 líneas. **Cuida el comentario `/* === Profile Wrapped === */`** y no dejes llaves huérfanas (es un `@layer utilities` compartido: revísalo con el build, no solo con lint).
6. **`AGENTS.md`** — §8 renumerar la composición de página (hoy lista 8 secciones e incluye `ProfileShowcase`), §10 quitar el bullet de `src/lib/profile-content.ts`, §4 quitar la mención a `.profile-card` / `prefers-reduced-motion` del `.profile-card`.

### Detalle importante sobre `shouldUseFallback`

`AGENTS.md` §15.11 prohíbe regresar el switch `useDeviceTier().shouldUseFallback` y dice que `ProfileShowcase` debe seguir usándolo. **Al borrar Passions, ese consumidor desaparece.** Antes de borrar, decide y documenta: ¿queda `HeroShowcase`/`Hero3D` como consumidor (hoy el hero **ignora** el gate, ver §8), o el switch queda sin consumidores? Si queda sin consumidores, **no borres el hook por tu cuenta**: es decisión del humano (§12) y el audit lo señala como deuda técnica pendiente.

### Cierre de la fase

```bash
rg -i "passion" src/          # debe dar CERO (hoy da 100+ repartidas en 12 ficheros)
rg -n "profile\." src/i18n/    # debe dar CERO
```

Y **ninguna clave literal visible en pantalla** (el fallback silencioso de `t()` imprime la clave).

---

## 7. FASE 7 — Los dos defectos concretos

### 7.1 Anchor muerto: `nav.experience` → `#experience` **no existe**

- `Nav.tsx` `linksConfig` apunta a `#experience`.
- `Trayectoria.tsx` (línea **169**) renderiza `id="trayectoria"`.
- Consecuencia doble: el click no navega **y** `activeSection` nunca marca esa sección (el bucle de `allSections` hace `if (!el) continue`).
- **Arreglo:** apuntar el link a `#trayectoria` (o añadir `id="experience"` al wrapper). Si cambias el `id`, **comprueba los deep links** (`window.location.hash`) y el `scroll-margin-top` de `.section-y`.
- ⚠️ **Relacionado, sin resolver:** el DOM **duplica `id`** en `hero`, `about`, `projects`, `education` y `trayectoria` porque conviven las dos ramas (desktop/móvil) y Trail/desktop sections. Ya se detectó en Fase 1 y se dejó «pendiente de confirmar antes de tocar nada». **Confírmalo con el árbol de accesibilidad antes de decidir** — puede ser un falso positivo de dos ramas que nunca se montan a la vez, o HTML inválido real.

### 7.2 Los 5 errores de `tsc`

- **4 reales**: `SectionContainer.tsx(37,39)` y `Projects.tsx(102,104)` pasan un `MotionValue<number>` en un `style` tipado como `Scale`/`Opacity`. Arreglo: tipar `motionStyle` como `MotionStyle` de Framer (`import type { MotionStyle } from "framer-motion"`) y usar `style={{ ...motionStyle, willChange: "transform, opacity" }}` — o mover el estilo a un `motion.section` con `style={motionStyle}`. **Los dos ficheros deben quedar coherentes** (hoy `Projects.tsx` duplica a mano el mapa del `SectionContainer`).
- **1 muere solo**: `PassionCard.tsx(69)` desaparece con la Fase 6.
- **Opcional (1 línea, buena idea):** añadir script `"typecheck"` en `package.json` para que los agentes y el CI tengan un gate único en vez de recordar `-p tsconfig.app.json`.

**Criterio de hecho:** `npx tsc --noEmit -p tsconfig.app.json` y `-p tsconfig.node.json` **ambos en verde (0 errores)**.

---

## 8. Deuda y defectos ya observados que **no** pertenecen a las 7 fases

Detectados durante las fases 1–3 y **deliberadamente no tocados**. Están aquí para que no los "descubras" como si fueran nuevos, y para que decidas conscientemente:

| Defecto | Dónde | Nota |
| --- | --- | --- |
| Props DOM inválidas (`color-interpolation-filters`, `fetchPriority`) → 2 warnings de React | `src/components/background/ImageBackground.tsx` | El audit pide además reducir el doble `<img>` del LCP (tier 2, fuera de alcance) |
| `<button>` anidado dentro de `<button>` (HTML inválido) | `ThemeSwitcher` dentro de `DockItem` | Puede afectar a la tanda de `a11y` del dock |
| El `preload` de `pexels-640.webp` no se usa | `index.html` | |
| `id` duplicados en el DOM | ver §7.1 | |
| Dock sin `role="toolbar"` / `aria-label` de contenedor | `dock/Dock.tsx` | Los items **sí** tienen `aria-label` (línea 243). El audit pide el contenedor. |
| **`.liquid-glass-strong` sin ningún consumidor** | `src/index.css` (~173–195) | Borrable ya; `.liquid-glass` (base) solo lo usa `WindowChrome.tsx` línea 68 (la píldora de restaurar ventana cerrada) |
| **Criterio «2 recetas de glass» aún NO cumplido** | `src/index.css` | `.glass`/`.glass-strong` ya son token-backed (`--surface-glass*`), pero siguen existiendo las 4 reglas `.liquid-glass*`. Colapsar a 2 es trabajo pendiente de la Fase 5 (o de un commit propio de cierre de diseño) |
| `chart.tsx` (recharts) con `#ccc`/`#fff` | `src/components/ui/chart.tsx` | Primitiva shadcn: **no se toca** (§7 de `AGENTS.md`) |
| `brand-icons.tsx` no wired | `src/components/brand-icons.tsx` | `AGENTS.md` dice explícitamente: histórico, borrar cuando convenga |
| `cv.pdf` da 404 | `public/` | El item "Resume" del dock parpadea "Downloading…" y falla en silencio |

---

## 9. Trampas del entorno (esto te ahorrará una sesión)

1. **Comentarios CSS en Tailwind v4**: una secuencia `my-*/py-*` dentro de un comentario **se auto-termina** y **la regla siguiente desaparece del bundle sin error de build**. Ya está documentado in-situ en `src/index.css`. El artefacto `.freebuff/tw-probe.css` que dejó el agente anterior era exactamente la sonda para aislar ese bug.
2. **`.freebuff/` es ruido de depuración**, no código: `tw-probe.css` (sonda de lo anterior) y `preview.log` (contiene solo `[BLOCKED]`). El turno anterior murió, probablemente, al intentar usar el panel de preview compartido. **Los gates de este proyecto son CLI** (`npm run tokens|lint|test|build` + `tsc`); no dependas del navegador para decidir si algo está bien — úsalo solo para *ver* el resultado.
3. **`src/styles/generated/*` están gitignored**: si abres el repo en frío no existen. `npm run tokens` antes de `build`; en `dev` el plugin de Vite regenera y hace `moduleGraph.invalidateAll()`.
4. **`npm`, no `bun`.** Existe `bun.lockb` en el repo, pero los scripts y el flujo son npm (y hay `package-lock.json`).
5. **Dev server en el puerto 8080** (`host: "::"`). Puede haber otros hilos con servidores levantados: **inspecciona los listeners antes de elegir puerto**.
6. **`tsconfig` está partido**: `tsconfig.app.json` (código) y `tsconfig.node.json` (scripts/vite). El gate de tipos son **ambos**, y no hay script `typecheck` (propuesta en §7.2).
7. **Nada de push, nada de PR, nada de `git add -A`.** El repo lo comparten otros agentes/hilos: haz staging de tus ficheros concretos y deja claro qué queda sin commitear si algo es ambiguo.

---

## 10. Gates y definición de «hecho»

Ejecuta **en este orden** al cerrar cada fase:

```bash
npm run tokens
npm run lint                       # objetivo: 0 errores, ≤12 warnings
npm test
npm run build
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.node.json
```

**Criterios globales del plan (del §10 de `PLAN-PULIDO-WEB.md`), con su estado real hoy:**

| Criterio | Estado |
| --- | --- |
| Ningún literal visual fuera del pipeline (salvo traffic lights documentados) | ✅ **cumplido** |
| Un dueño del ritmo vertical | ✅ **cumplido** (`.section-y`) |
| Una escala tipográfica | ⚠️ **emitida pero sin consumir** (19 clamps, 6 `tracking-[…]`) |
| Una escala de radios | ✅ cumplido |
| 2 recetas de glass | ⚠️ `.glass*` tokenizadas; `.liquid-glass*` siguen existiendo (y `.liquid-glass-strong` sin consumidores) |
| `muted-foreground` ≥ 4.5:1 | ✅ cumplido (5.20 / 4.74 / 5.24 sobre card; indigo 7.35) |
| Passions sin rastro | ❌ **pendiente** (11 ficheros intactos) |
| Cero anchors muertos | ❌ **pendiente** (`#experience`) |
| Todos los gates en verde | ⚠️ todo verde **salvo `tsc`** (5 errores) |

**Pase visual real obligatorio** antes de dar por buena una fase: 375 / 768 / 1440 px, los **4 temas**, **EN y ES**, con `prefers-reduced-motion` activo, y **midiendo contraste, no a ojo**. En las fases 1–3 la validación se hizo con **estilos computados** en el navegador (comparando before/after por superficie). Mantén ese estándar: es lo que permitió demostrar que el barrido no movió el render.

---

## 11. Convención de commits (estilo del repo, ya usada en esta rama)

Mensaje en inglés, cuerpo explicando el **porqué** (los commits de esta rama lo hacen y son un buen modelo a copiar). Tipos usados: `docs:`, `feat:`, `fix:`, `refactor:`, `chore:`. **Un commit atómico por fase** — así lo pactó el plan (§13).

Historial de la rama (para calibrar el tono):

```
e261be3  docs: record the phase 3 rhythm handover
d9cea51  refactor(layout): give vertical rhythm a single owner (.section-y)
c71595d  docs: record the phase 2 sweep and the shape-based emit policy
845bd5d  chore: drop dead code carrying unmigrated color literals
f4502cb  refactor(ui): sweep color and radius literals onto the token layer
5d5d81d  feat(tokens): per-theme dock hues, neutral pair, dock shadows and a shape-based emit policy
80c6c50  docs: document the token foundation and record the phase 1 decisions
deb5eb1  feat(tokens): put the type scale, radius scale, rhythm and surfaces in the pipeline
53c45fa  docs: add pulido-web premium polish plan
```

**Cada fase cierra con dos commits**: el de código y el de `docs:` que añade su bloque a `PLAN-PULIDO-WEB.md` (sección «Registro de ejecución»). **Sigue ese patrón** — es lo que hizo posible este handoff, y un agente que solo lea el plan no sabría dónde quedó todo.

---

## 12. Decisiones que debería tomar el humano (no las adivines)

1. **`.text-gradient`**: ¿se mantiene en todos los H1, se reduce a 2 de 3 instancias, o se sustituye por highlight especular que samplee `--primary`? (El audit lo señala; el plan lo deja abierto en la Fase 5.)
2. **`useDeviceTier().shouldUseFallback`**: tras borrar Passions, ¿el hero pasa a consumirlo (hoy lo ignora ⇒ usuarios con GPU baja o reduced-motion pagan el WebGL completo), o el hook queda sin consumidores? Afecta a `AGENTS.md` §15.11.
3. **Numeración de `section_label`** al borrar Passions (`02 — Passions` muere). ¿Hay que renumerar las etiquetas de sección?
4. **`nav.experience`**: ¿se corrige el href a `#trayectoria` (0 riesgo) o se renombra el `id` de la sección a `experience` (coherente con la clave i18n, pero toca deep links)?
5. **Tier 2/3 siguen fuera de alcance.** El plan lo dice explícitamente: *code-splitting de three/gsap/framer · quitar `@tanstack/react-query` y `@react-three/postprocessing` · gating de WebGL · doble `<img>` del LCP · self-host de fuentes · hero generativo con shader · tema claro + `prefers-color-scheme` · CRT restringido al terminal · reescritura vertical de Trayectoria · backend del formulario*. **No los metas en una fase tier 1 «de paso».** Si el humano quiere tocarlos, es una rama/plan nuevo.

---

## 13. Orden recomendado de ejecución + checklist

Se puede hacer **4 → 5 → 6 → 7**, o **6 → 7 antes de 4/5** si prefieres cerrar primero los defectos objetivos (borrar Passions elimina 1 de los 5 errores de `tsc` y deja el terreno más limpio para el trabajo creativo de motion/tipografía). Recomendación: **7 (el fix del nav, 10 minutos, sin riesgo) → 6 (borrado limpio) → 5 (tipografía: la deuda más visible) → 4 (motion, el más subjetivo, el último).**

Checklist por fase:

- [ ] `git status` limpio y HEAD == `e261be3` (o lo que el humano haya decidido)
- [ ] Gates de §10 en verde **antes** de empezar (baseline)
- [ ] Leídas las reglas de §2 y confirmadas contra `AGENTS.md`
- [ ] Cambio implementado siguiendo la forma del plan (tokens primero, test-first si hay helper nuevo)
- [ ] `prefers-reduced-motion` respetado en todo lo animado nuevo
- [ ] Verificación en navegador con **estilos computados**, los 4 temas, EN/ES, 375/768/1440
- [ ] Gates de §10 en verde **después**
- [ ] Commit de código (atómico, mensaje con el porqué)
- [ ] Bloque `### Fase N — … · COMPLETA` añadido a `PLAN-PULIDO-WEB.md` + commit `docs:`
- [ ] Nada de push/PR

---

## Appendix A — Mapa rápido de ficheros que más vas a tocar

| Fichero | Por qué |
| --- | --- |
| `PLAN-PULIDO-WEB.md` | El plan + el registro de ejecución. **Actualízalo al cerrar cada fase.** |
| `AGENTS.md` | Fuente de verdad operativa. Actualízalo cuando cambies estructura (§4, §8, §10). |
| `src/index.css` | Custom utilities (`@layer utilities`), ritmo (`.section-y`), glass, `.tech-chip`, el bloque `.profile-*` a borrar, keyframes. |
| `src/styles/tokens/semantic/{colors,layout,typography}.json` | Todos los tokens visuales. |
| `src/styles/tokens/themes/{indigo,catppuccin,dracula,tokyo-night}.json` | Deltas por tema. |
| `scripts/tokens-core.mjs` | Política de emisión (por forma, `isRawTriple`, `THEME_INLINE_PREFIXES`). |
| `src/components/Nav.tsx` | El link muerto + `computeThreshold` + borrado de `nav.profile`. |
| `src/components/window/WindowChrome.tsx` | Chrome de todas las ventanas (traffic lights, `whileInView`, minimize). |
| `src/components/ui/SectionContainer.tsx` | Los 2 errores de `tsc` por `motionStyle`. |
| `src/components/sections/TechBento.tsx` | Bento asimétrico + fuera shine sweep. |
| `src/components/sections/Education.tsx` | Cards con `whileInView` duplicado + tipo. |
| `src/components/sections/Projects.tsx` | Los 2 errores de `tsc` por `motionStyle`. |
| `src/i18n/translations.ts` | Las 28 claves `profile.*` + `nav.profile` a borrar (en los 2 idiomas). |
| `src/lib/spotlight-items.ts` | `"profile"` en la línea 16. |
| `src/pages/Index.tsx` | La ventana `~/passions.md` y el orden de secciones. |

## Appendix B — Comandos de reconocimiento útiles

```bash
# ¿queda alguna sección Passions en pie?
rg -i "passion" src/ | wc -l

# ¿qué literales visuales quedan fuera del pipeline?
rg -n "#[0-9a-fA-F]{3,8}\b" src --glob '!**/generated/**' --glob '!**/*.test.*'
rg -n "hsl\(\s*[0-9]" src --glob '!**/generated/**' --glob '!**/*.test.*'

# ¿dónde siguen duplicándose los patrones de motion?
rg -n "whileInView|ease: \[0.22" src

# ¿la escala tipográfica se consume?
rg -n "text-display|text-h1|text-h2|tracking-display|tracking-heading" src --glob '!**/generated/**' --glob '!*.json' --glob '!*.test.*'

# radios / clamps inventados que sobreviven
rg -o "clamp\(" src --glob '!**/generated/**' | wc -l
rg -o "tracking-\[" src | wc -l
```
