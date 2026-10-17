import { useEffect, useRef, type PointerEventHandler } from "react";
import { localPointer } from "@/lib/specular";

/**
 * Handler de `pointermove` para superficies `.specular`: escribe `--mx`/`--my`
 * sobre la tarjeta apuntada como máximo UNA vez por frame y con una sola
 * lectura de `getBoundingClientRect()` por frame.
 *
 * Se instancia una vez por sección (no por tarjeta) y se pasa a cada
 * superficie: el elemento sale de `event.currentTarget`, así que el mismo
 * handler sirve para todas.
 */
export function useSpecular(): { onPointerMove: PointerEventHandler<HTMLElement> } {
  const pending = useRef<{ el: HTMLElement; x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const onPointerMove: PointerEventHandler<HTMLElement> = (event) => {
    pending.current = {
      el: event.currentTarget,
      x: event.clientX,
      y: event.clientY,
    };
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const p = pending.current;
      if (!p) return;
      const { x, y } = localPointer(p.x, p.y, p.el.getBoundingClientRect());
      p.el.style.setProperty("--mx", `${x}px`);
      p.el.style.setProperty("--my", `${y}px`);
    });
  };

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return { onPointerMove };
}
