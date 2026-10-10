import { DURATION_SLOW, EASE_OUT_EXPO_CSS } from "@/lib/motion";

/**
 * Cambio de tema cinematográfico (BRAINSTORM §5 A1).
 *
 * El switch de tema es una interacción central del sitio: con View Transitions
 * deja de ser un swap instantáneo y pasa a ser un wipe circular. Vive aquí, y
 * no en el menú del dock, porque el cambio de tema tiene tres puntos de
 * entrada (menú del dock, Spotlight y CLI) y los tres merecen el mismo
 * momento: `useTheme().setTheme` es quien lo envuelve.
 *
 * Contrato de degradación — la transición es un adorno, nunca un requisito:
 *   - sin `document.startViewTransition` (o sin Web Animations API) se aplica
 *     el cambio directamente;
 *   - con `prefers-reduced-motion` no se abre ninguna transición;
 *   - si abrirla falla, el tema se aplica igual y sin ruido en consola.
 */

/** Rail del dock en `Dock.tsx`; origen por defecto del wipe. */
const DOCK_ID = "app-dock";

export type ThemeOrigin = Element | { x: number; y: number } | null;

export interface ThemeOriginPoint {
  x: number;
  y: number;
}

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

interface TransitionKeyframes extends KeyframeAnimationOptions {
  pseudoElement?: string;
}

const viewportCenter = (): ThemeOriginPoint => ({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
});

const isPoint = (origin: NonNullable<ThemeOrigin>): origin is ThemeOriginPoint =>
  "x" in origin && "y" in origin;

/** Centro de un elemento; `null` si no tiene área (p. ej. `display: none`). */
const centerOf = (el: Element): ThemeOriginPoint | null => {
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Prioridad del origen: punto explícito → centro del dock → centro del
 * viewport. El rail está `hidden` por debajo de `md`, y un rect 0×0 daría un
 * wipe naciendo de la esquina superior: por eso el area check cae al centro.
 */
export function resolveThemeOrigin(origin?: ThemeOrigin): ThemeOriginPoint {
  if (origin) {
    if (isPoint(origin)) return origin;
    return centerOf(origin) ?? viewportCenter();
  }

  const dock = document.getElementById(DOCK_ID);
  return (dock ? centerOf(dock) : null) ?? viewportCenter();
}

/** Excepción consciente a la regla de componentes: esto corre en un handler. */
const prefersReducedMotion = (): boolean =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

export function startThemeTransition(apply: () => void, origin?: ThemeOrigin): void {
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => ViewTransitionLike;
  };

  if (
    typeof doc.startViewTransition !== "function" ||
    typeof document.documentElement.animate !== "function" ||
    prefersReducedMotion()
  ) {
    apply();
    return;
  }

  // El cambio de DOM tiene que ocurrir DENTRO del callback: es lo que separa
  // el snapshot viejo del nuevo. Si abrir la transición falla antes de
  // ejecutarlo (una transición ya en curso, por ejemplo), se aplica aquí.
  let applied = false;
  const runApply = () => {
    applied = true;
    apply();
  };

  try {
    const transition = doc.startViewTransition(runApply);
    transition.ready
      .then(() => {
        const { x, y } = resolveThemeOrigin(origin);
        // Radio = distancia a la esquina más lejana desde el origen, para que
        // el círculo cubra el viewport entero sin huecos.
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: DURATION_SLOW * 1000, // WAAPI espera milisegundos
            easing: EASE_OUT_EXPO_CSS,
            pseudoElement: "::view-transition-new(root)",
          } as TransitionKeyframes,
        );
      })
      .catch(() => {
        /* transición saltada a mitad: el tema ya está aplicado */
      });
  } catch {
    if (!applied) runApply();
  }
}
