# Brainstorm: tipografía, secciones nuevas y ritmo general — manifiesto previo a ejecución

> Fecha: 2026-10-13. Rama: `feat/next-level-r2`.
> Estado: **método por fases acordado — no se implementa sin debatir, elegir y madurar cada fase**.
> Este documento congela el diagnóstico y las vías propuestas. La implementación
> requiere marcar una casilla de decisión al final y abrir el plan por fases
> correspondiente. Sin esa marca, nadie ejecuta. Cada fase se debate y madura
> en chat antes de pasar a la siguiente.

## 0. Punto de partida

- Auditoría tipográfica cerrada: norma 3 voces (Fraunces display / Plex Sans
  producto / Plex Mono chrome), Contact bajado a `text-h1`, eyebrows y pills
  a mono, card-titles a Sans, `h2.sr-only` en Contributions y Stats.
- Base R2 sana: datos con test, ids estables, i18n simétrica, footer sin
  teléfono, cursor con gates. El problema detectado es de composición, no de
  arquitectura: secciones nuevas planas, lineales y densas; el CV se percibe
  largo por aire repetido, no por contenido.

## 1. Must-fix ya aplicados (verificados)

| # | Hallazgo | Corrección | Verificación |
| - | -------- | ---------- | ------------ |
| 1 | Labels `06 — / 07 — / 08 —` con em-dash (prohibido por R2 y por la skill de gusto) | Guion simple `06 - / 07 - / 08 -` en `src/i18n/translations.ts` (en + es) | `vitest` 126/126, `lint` 0 errores, `build` OK |
| 2 | Doble anuncio en lectores (eyebrow visible + `h2.sr-only` con mismo texto) | `aria-hidden="true"` en el eyebrow decorativo de `Contributions.tsx` y `Stats.tsx` | idem |
| 3 | `about.section_label` huérfana tras pasar About a `tech.section_label` | Comentario en `About.tsx`: queda reservada para el futuro layout bio | idem |
| 4 | Sospecha `trayectoria.cat_bridge` inexistente | Verificado falso positivo: `BridgeCard` no usa `CategoryLabel` | grep + lectura de `Trayectoria.tsx` |

## 2. Diagnóstico de diseño (criterio)

1. **Eyebrow en cada sección.** 9 ventanas con el mismo micro-label; además el
   `WindowChrome title` ya etiqueta (`~/certifications`) y dentro se repite el
   label. Doble etiquetado, cero jerarquía.
2. **Tres secciones gemelas.** Education, Certifications y SideQuests comparten
   familia: `grid gap-6 md:grid-cols-3` + `specular glass p-8 hover-glow` +
   header `eyebrow + text-h1 + sub`. Mismo componente con distinto copy.
3. **Listas largas con el mismo separador.** `border-t` por fila y patrón
   `hairline + mono index` repetido en Education y Contributions; Stats con 5
   filas idénticas al mismo ritmo vertical.
4. **Cero imagen real en lo nuevo.** Todo texto y glass desde Projects hacia
   abajo; Hero sí tiene 3D y foto. Página solo texto no es minimalismo.
5. **Longitud percibida.** Cada ventana pide `min-h-[65vh]` + `mb-8` + `p-8`:
   6-7 pantallas de aire idéntico. No sobra contenido, sobra aire repetido.

## 3. Vías propuestas (sin implementar)

### Vía A — Compresión conservadora

- Fusionar Education + Certifications en “Formación verificable”.
- Stats a tira compacta bajo Contributions (no ventana).
- Contributions con Creators abierta por defecto, resto colapsado.
- SideQuests a banda de una frase (transferencia, no body + transferencia).
- Efecto: -1 ventana, ~-1 pantalla de scroll. Mantiene ids, esfuerzo medio,
  riesgo bajo.

### Vía B — Ritmo editorial (el cambio de imagen)

- Una familia por bloque: Contributions ledger ancho, Certs bento asimétrico
  2+1 con una celda de imagen real, SideQuests banda con icono grande,
  Stats tira teñida sin glass blanco.
- Efecto: rompe la repetición `grid-3 + glass`; mete 2-3 imágenes reales y
  1 fondo teñido. Esfuerzo medio-alto, no toca IA/SEO.
- Requisito: fotos reales (setup, kiosco, PDA). Sin ellas, no ejecutar a medias.

### Vía C — Capítulo Impacto (shake-up)

- Un solo `WindowChrome` con sub-nav mono por tabs: Aportaciones /
  Credenciales / Datos.
- Efecto: el CV deja de crecer por ventanas y el nav se acorta.
- Coste: cambian anchors `#contributions/#stats`, Spotlight, CLI y analítica.
  Requiere migración de anclas. Solo con aprobación explícita de IA.

Recomendación técnica: A ahora, B después, C solo si se valida el cambio de IA.

## 4. Análisis general de la app (resumen)

- **Hero + About:** arranque sólido; About es Stack con id `about` por anclas
  históricas: no renombrar sin migración, ya documentado.
- **Projects:** mejor bloque; pulir `detailBackBtn` mono en tamaño/tracking.
- **Trayectoria:** buen GSAP con fallback; necesita un segundo respiro visual.
- **Contact + Footer:** Contact ya en `text-h1`; status dot único, no repartir.
- **Tokens/rendimiento:** 91 tokens x5 temas intactos; chunks grandes por
  three/postprocessing asumibles vía lazy split.
- **A11y/i18n:** simetría verde, acordeón etiquetado, reduced-motion cubierto;
  eyebrow-count alto como decisión de marca consciente.

## 5. Decisiones bloqueantes (marcar una antes de ejecutar)

- [ ] Decisión 1: ejecutar Vía A (compresión) como fase 1.
- [ ] Decisión 2: ejecutar Vía B (ritmo editorial) + lista cerrada de fotos.
- [ ] Decisión 3: ejecutar Vía C (capítulo Impacto) asumiendo migración de anclas.
- [ ] Decisión 4: aparcar el rediseño y quedarse solo con must-fix + norma 3 voces.

> Nota: este manifiesto no autoriza código. La autorización nace al marcar una
> casilla y pedir el plan por fases correspondiente.

## 6. Método por fases (acordado 2026-10-13)

- Se avanza **a un paso por fase**: debatir → elegir → madurar → solo entonces implementar.
- Ninguna fase se ejecuta sin diseño corto en chat + sí explícito de My G + verificación (`vitest`/`lint`/`build`) posterior.
- Orden acordado: Fase 1 = Vía A (compresión conservadora). Fase 2 = Vía B (ritmo editorial, requiere fotos reales cerradas). Fase 3 = Vía C (capítulo Impacto, solo si se valida migración de anchors/Spotlight/CLI).

### Fase 1 — implementada en `feat/fase-1-compresion` (verificada)

- [x] F1.1: Fusionar Education + Certifications en "Formación verificable" manteniendo ids `education` y `certifications` como anclas internas (`Index.tsx` un solo `WindowChrome id="formacion"` + divs internos con scroll-margin por token). No se toca Spotlight/CLI/anchors.
- [x] F1.2: Stats a tira compacta bajo Contributions, sin `WindowChrome` propio, con id `stats` en wrapper conservado (`Stats.tsx` panel compacto p-4 + space-y-3, sin min-h).
- [x] F1.3: Secciones Contributions y Stats abiertas; acordeones de ContributionRow cerrados de serie (estado inicial `null`, verificado sin cambios).
- [x] F1.4: SideQuests a banda de una frase (`SideQuests.tsx` lista con icono + título + transferencia, sin body).
- [x] F1.5: Quitado `min-h-[65vh]` solo en bloque CV. Intactas: Hero/About `viewport-content`, Projects con flip, Trayectoria pin, Contact.

> Fase 1 verificada: `vitest` 29 ficheros/126 tests EXIT 0, `lint` 0 errores EXIT 0, `build` EXIT 0. Pendiente merge a `main` al cerrar la fase.
>
> Fase intermedia cursor verificada en `feat/fase-1-compresion` (`88c2b24`): `TerminalCursor.tsx` a dot morado único 6px→56px con label, fuera ring gris/ticks/brackets; cursor test 7/7, vitest 126/126, lint 0 errores, medido en vivo solo dot `rgb(111,90,246)` en reposo.

## 7. Política de ramas por fase (acordada 2026-10-13)

- Una rama por fase, con merge a `main` al final de cada implementación de cada fase.
- `feat/next-level-r2` se mergea a `main` antes de abrir Fase 1; Fase 1 se implementa en rama nueva (p. ej. `feat/fase-1-compresion`) creada desde `main`.
- Al cerrar cada fase: verificación (`vitest`/`lint`/`build`) en la rama, merge a `main`, y apertura de la siguiente fase en rama nueva.

### Fase 2 — maduración 2026-10-13 (bloqueada por fotos)

- Alcance elegido: pack editorial completo (ledger ancho + bento 2+1 + banda con icono grande + tira teñida).
- Fotos: ninguna aún — sin fotos reales no se ejecuta a medias. Fase 2 aparcada hasta lista cerrada (setup, kiosco, PDA).
