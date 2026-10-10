# Plan de implementación: Fase 1.5 (motion de firma y tema oculto)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Estado:** **APROBADA POR DELEGACIÓN (2026-10-09) y en ejecución
(2026-10-10, rama `feat/next-level-fase-1.5`).** No hay `[HUECO]`: esta fase no
depende de datos ni de copy de Alejandro, solo de código y tokens. Es la última
fase aprobada que se puede ejecutar sin input suyo.

**Resultado de ejecución (2026-10-10, rama `feat/next-level-fase-1.5`):** las tres
features implementadas, con tests y comprobación en vivo. Dos hallazgos que no
estaban en el plan:

1. **Bug real encontrado y arreglado — el tema elegido en el menú del dock no se
guardaba.** `ThemeMenu` cierra el popover al elegir, así que se desmontaba en el
mismo commit en que cambiaba el tema y su efecto (el que persistía en
`localStorage`) nunca llegaba a correr. Ahora `setTheme` aplica `data-theme` y
persiste dentro del callback de la transición: el cambio es atómico y no
depende de que quien lo pida siga montado. Con test que lo reproduce (falla sin
el arreglo).
2. **La geometría del magnetismo vive en `src/lib/magnetic.ts`**, no en el
`.tsx`: exportar funciones desde un fichero de componente encendía un warning
de lint nuevo (react-refresh).

**Goal:** Convertir el cambio de tema en un momento de producto (wipe circular
que nace del dock), dar a los CTAs del hero una respuesta magnética al puntero y
sembrar un quinto tema ámbar CRT que solo se desbloquea desde la terminal,
persistido en `localStorage`.

**Architecture:** Redesign-preserve. No se toca el lenguaje visual (OS de
escritorio, ventanas, `.section-px`, Fraunces/Plex, tokens): se sube un dial de
MOTION de ~5 a ~7 en tres sitios concretos. Toda la lógica nueva vive en
módulos puros y testeables (`src/lib/theme-transition.ts`) o en primitivas
reutilizables de `src/components/fx/` (que ya alberga `Reveal`, `RevealStagger`
y `CursorHalo` sin código de registro). El tema ámbar entra por el pipeline de
tokens como cualquier otro tema; la única novedad es que **no se lista**.

**Tech Stack:** Vite 5 + React 18 + TS, Tailwind v4 (CSS-first), Framer Motion
12, View Transitions API (feature-detected), Vitest 3 (jsdom), pipeline DTCG
propio.

**Spec:** `BRAINSTORM-NEXT-LEVEL-2026-10-08.md` §5 (A1, A2, C2) y §6 (fila Fase
1.5). Depende de la Fase 1, ya cerrada y mergeada en `main` (`877372f`).

## Decisiones de diseño

1. **La transición es propiedad del cambio de tema, no del botón.** Se
   implementa dentro de `useTheme().setTheme`, así los tres puntos de entrada
   existentes (menú del dock, Spotlight y CLI) la heredan sin duplicar código.
2. **El wipe nace del dock.** Origen resuelto por prioridad: punto explícito →
   `#app-dock` (centro del rail) → centro del viewport. El rail está
   `display:none` por debajo de `md`, y un rect 0×0 daría un wipe desde la
   esquina: el resolutor cae al centro cuando el rect no tiene área.
3. **Degradación honesta.** Sin `document.startViewTransition` o con
   `prefers-reduced-motion`, el cambio de tema es el swap instantáneo de
   siempre. La transición es un adorno: nunca puede impedir ni retrasar el
   cambio de tema ni el guardado en `localStorage`.
4. **El tema ámbar se separa en datos, no en CSS.** `THEMES` (menú y Spotlight)
   sigue teniendo cuatro entradas; `SECRET_THEMES` añade la quinta, que solo
   `sudo theme amber` sabe interpretar. El CSS del tema se emite como el de
   cualquier otro.
5. **Magnetismo con `useMotionValue` + `useSpring`.** Cero `useState` por
   `mousemove` (el anti-patrón que la Fase 0 purgó con `useMousePosition`).
   Puertas de montaje: puntero fino y sin `prefers-reduced-motion`.

## Global Constraints

- **Tokens pipeline es la única fuente**: el tema ámbar es
  `src/styles/tokens/themes/amber.json` + `tokens.index.json` + `npm run tokens`.
  Duraciones/easings de la transición salen de `--duration-slow` /
  `--ease-out-expo`, nunca literales nuevos.
- **Sin `tailwind.config.ts`**: el CSS de los pseudo-elementos de View
  Transitions vive en `src/index.css`.
- **No tocar `src/styles/generated/`** ni los primitivos shadcn de
  `src/components/ui/`.
- **Test-first** para todo helper o data-shaping nuevo, incluida la lógica de la
  transición y el despacho del comando secreto.
- **Accesibilidad**: WCAG AA se mantiene en el tema nuevo (la guardia
  `token-contrast.test.ts` cubre `muted-foreground` en los dos surfaces) y el
  wipe se salta con `prefers-reduced-motion`.
- **Cero dependencias nuevas.**
- **Git**: rama por fase (`feat/next-level-fase-1.5`, desde `main`), commits en
  castellano, merge a `main` solo con okey explícito.
- Verificación por tarea: `npm test`, `npm run typecheck`, `npm run lint`; y
  `npm run build` al cerrar la fase.

## Review Focus

1. **El cambio de tema nunca puede romperse por el adorno**: si la transición
   lanza (una segunda llamada con una en curso, un motor que no la soporta),
   el tema se aplica igual y sin ruido en consola.
2. **El wipe no debe verse como un fundido**: el snapshot viejo se queda
   quieto (`animation: none` sobre `::view-transition-old(root)`) y el nuevo
   entra recortado en círculo; si ambos se animan, vuelve a ser un cross-fade.
3. **Magnetismo sin basura**: sin listeners cuando está desactivado, retorno a
   cero con spring al salir, y ninguna escritura de estado de React por
   movimiento del ratón.
4. **El tema oculto sigue oculto**: `THEMES` no lo lista, `theme amber` a secas
   responde "unknown theme" y el menú del dock no lo muestra.
5. **AA en ámbar**: `muted-foreground` ≥ 4.5:1 sobre `background` y `card`.

---

## FASE 1.5 — Motion de firma (rama `feat/next-level-fase-1.5`)

### Task 1: Transición cinematográfica de tema (A1)

**Files:**
- Create: `src/lib/theme-transition.ts`
- Create: `src/lib/theme-transition.test.ts`
- Modify: `src/lib/motion.ts` (exponer el easing como string CSS para WAAPI)
- Modify: `src/hooks/useTheme.ts` (el wipe envuelve el cambio de tema)
- Modify: `src/index.css` (pseudo-elementos de View Transitions)

**Interfaces:**
- `type ThemeOrigin = { x: number; y: number } | Element | null`
- `resolveThemeOrigin(origin?: ThemeOrigin): { x: number; y: number }`
- `startThemeTransition(apply: () => void, origin?: ThemeOrigin): void`

- [x] Test primero (`theme-transition.test.ts`): sin soporte de la API,
      `apply` corre una vez y de forma síncrona; con
      `prefers-reduced-motion: reduce`, tampoco se usa la API; con la API
      presente, se llama una vez, `apply` corre dentro y se anima
      `::view-transition-new(root)` con un radio mayor que la diagonal; un
      punto explícito gana al dock; un dock oculto (rect 0×0) cae al centro.
- [x] Implementar `src/lib/theme-transition.ts` con `try/catch` de seguridad y
      las duraciones/easing del pipeline.
- [x] Añadir el CSS base de los pseudo-elementos en `src/index.css`.
- [x] Envolver el cambio de tema en `useTheme.setTheme` (el atributo
      `data-theme` cambia dentro del callback de la transición; React y
      `localStorage` no cambian de comportamiento).

### Task 2: CTAs magnéticos (A2)

**Files:**
- Create: `src/components/fx/Magnetic.tsx`
- Create: `src/components/fx/Magnetic.test.tsx`
- Modify: `src/components/sections/Hero.tsx` (los dos `ShimmerButton`)

**Interfaces:**
- `<Magnetic strength={0.25} radius={24}>{children}</Magnetic>`

- [x] Test primero: envuelve y renderiza los hijos; con puntero grueso o
      `prefers-reduced-motion` no monta ningún listener de ratón; con puntero
      fino, un `mousemove` dentro del campo desplaza el contenido hacia el
      puntero y `mouseleave` lo devuelve a cero.
- [x] Implementar con `useMotionValue` + `useSpring` (magnetismo resuelto
      con geometría: sin hitbox invisible que le robe clics al CTA vecino)
      (transform-only, `will-change: transform`), sin estado de React.
- [x] Aplicarlo a los dos CTAs del hero sin alterar la fila `flex flex-wrap
      gap-3` ni la coreografía post-boot.

### Task 3: Quinto tema ámbar CRT, oculto y desbloqueable por CLI (C2)

**Files:**
- Create: `src/styles/tokens/themes/amber.json`
- Create: `src/lib/themes.test.ts`
- Modify: `src/styles/tokens/tokens.index.json`, `src/lib/themes.ts`,
  `src/lib/cli-commands.ts`, `src/lib/cli-commands.test.ts`,
  `src/scripts/token-contrast.test.ts` (la guardia AA pasa a cubrir 5 temas)

**Interfaces:**
- `ThemeId` gana `"amber"`; `THEMES` (público) sigue con 4;
  `SECRET_THEMES: Record<SecretThemeId, { label; emoji }>`;
  `isPublicTheme(value): value is ThemeId` y `isSecretTheme(value)`.

- [x] Test primero del reparto público/secreto: `THEMES` no contiene amber y
      `SECRET_THEMES` sí; el comando `theme amber` responde "unknown theme"
      mientras `sudo theme amber` llama a `setTheme("amber")` y lo anuncia.
- [x] Escribir `themes/amber.json` (fósforo ámbar sobre negro cálido) y
      añadirlo al índice; regenerar tokens.
- [x] Actualizar la guardia de contraste para cubrir el quinto tema y ajustar
      la paleta hasta que pase AA.
- [x] Ampliar el `sudo` de la CLI sin romper su chiste original sin argumentos.

## Cierre de Fase 1.5

- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- [x] Comprobación en vivo (Chromium, dev server):
      - **wipe**: `startViewTransition called → callback ok → ready resolved →
        finished`, con `clipPath: circle(0px at 38px 450px)` → radio 1472px,
        `duration: 700`, `easing: cubic-bezier(0.22, 1, 0.36, 1)`,
        `pseudoElement: "::view-transition-new(root)"`. El origen (38, 450) es
        exactamente el centro del rail del dock. Repetido en tres puntos de
        entrada: Spotlight, CLI y menú del dock.
      - **tema oculto**: `theme amber` → "unknown theme: amber"; `sudo theme
        amber` → desbloqueo, `data-theme="amber"`, `--background: 30 25% 4%`,
        `--primary: 41 100% 50%`, fondo `rgb(13, 10, 8)`. El menú del dock sigue
        listando solo los cuatro públicos.
      - **magnetismo**: el navegador de este entorno no compone frames (captura
        vacía, rAF suspendido), así que la primitiva se verificó con una prueba
        de integración real en jsdom: `mousemove` dentro del campo →
        `translateX(4px)` (16px × 0.25); fuera del campo → vuelve a `none`.
      - La primera transición del wipe no se animó porque el propio diagnóstico
        (una segunda View Transition de prueba) la saltó: una transición nueva
        salta la anterior. Las tres siguientes midieron limpio.
- [ ] `AGENTS.md`: §4 (procedimiento de tema nuevo → mención al tema oculto),
      §5 (theming: `THEMES` vs `SECRET_THEMES` y el comando de desbloqueo),
      §12 (tests nuevos) y §8/§9 si la transición o el magnetismo cambian la
      descripción de un componente.
- [x] Commits en castellano por tarea; merge a `main` pendiente de okey
      explícito (Vercel auto-despliega `main`).
