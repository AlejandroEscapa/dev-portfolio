import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MAGNET_RADIUS, MAGNET_STRENGTH, isWithinMagnet, magneticOffset } from "@/lib/magnetic";
import { cn } from "@/lib/utils";

/**
 * Campo magnético para CTAs (BRAINSTORM §5 A2): el contenido se desplaza una
 * fracción de la distancia al puntero mientras este está dentro o en el borde
 * del propio botón. La geometría vive en `@/lib/magnetic`.
 *
 * Por qué no hay padding invisible como "campo": un área ampliada con `margin`
 * negativo se superpone al CTA vecino (el `gap-3` del hero son 12px) y le roba
 * los clics en esa franja. Aquí el campo es la caja del botón más `radius`
 * píxeles de margen exterior, y el magnetismo se resuelve con geometría, nunca
 * con un hitbox que intercepte eventos.
 *
 * Movimiento solo con `useMotionValue` + `useSpring` sobre `transform`: cero
 * estado de React por `mousemove` (el anti-patrón que purgó la Fase 0 con
 * `useMousePosition`). Sin puntero fino o con `prefers-reduced-motion` se
 * renderiza el hijo tal cual, sin listeners.
 */

/** Muelle del seguimiento: rápido, con un micro-overshoot al soltar. */
const SPRING = { stiffness: 250, damping: 20, mass: 0.5 };

interface MagneticProps {
  children: ReactNode;
  /** Radio del campo en px. */
  radius?: number;
  /** Fracción del desplazamiento del puntero que sigue el contenido. */
  strength?: number;
  className?: string;
}

export function Magnetic({
  children,
  radius = MAGNET_RADIUS,
  strength = MAGNET_STRENGTH,
  className,
}: MagneticProps) {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, SPRING);
  const y = useSpring(pointerY, SPRING);

  if (!enabled) return <>{children}</>;

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pointer = { x: event.clientX, y: event.clientY };
    if (!isWithinMagnet(pointer, rect, radius)) {
      pointerX.set(0);
      pointerY.set(0);
      return;
    }
    const { dx, dy } = magneticOffset(
      pointer,
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      radius,
      strength,
    );
    pointerX.set(dx);
    pointerY.set(dy);
  };

  const reset = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      data-magnetic="on"
      className={cn("inline-flex", className)}
      style={{ x, y, willChange: "transform" }}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}
