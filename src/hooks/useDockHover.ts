import { useRef, useState, useCallback, useEffect } from "react";
import { nearestIndex } from "@/lib/dock-hover";

/**
 * Tracks which dock item the pointer is closest to, for the magnify effect.
 * The rail is vertical, so the default axis is "y" (the old bottom dock used "x").
 *
 * Los centros de los items se miden una vez por gesto (al entrar en el rail) en
 * lugar de en cada `mousemove`, y el cálculo se coalesce a una rAF por ráfaga
 * de eventos. `remeasure()` existe para los cambios de layout del propio rail
 * (expandir/colapsar), que mueven los centros sin que el puntero se mueva.
 */
export function useDockHover(axis: "x" | "y" = "y") {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const centersRef = useRef<number[] | null>(null);
  const pointerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) {
      centersRef.current = null;
      return;
    }
    const centers: number[] = [];
    el.querySelectorAll<HTMLElement>("[data-dock-item]").forEach((item) => {
      const rect = item.getBoundingClientRect();
      centers.push(axis === "x" ? rect.left + rect.width / 2 : rect.top + rect.height / 2);
    });
    centersRef.current = centers;
  }, [axis]);

  const remeasure = useCallback(() => {
    centersRef.current = null;
    measure();
  }, [measure]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      pointerRef.current = axis === "x" ? e.clientX : e.clientY;
      if (rafRef.current !== null) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const pointer = pointerRef.current;
        if (pointer === null) return;
        if (!centersRef.current) measure();
        const next = nearestIndex(centersRef.current ?? [], pointer);
        // Sin cambio de índice no hay re-render: era el 90 % de los eventos.
        setHoveredIdx((prev) => (prev === next ? prev : next));
      });
    },
    [axis, measure],
  );

  const onMouseEnter = useCallback(() => {
    // Gesto nuevo: los centros pueden haber cambiado desde la última entrada.
    measure();
  }, [measure]);

  const onMouseLeave = useCallback(() => {
    pointerRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    centersRef.current = null;
    setHoveredIdx(null);
  }, []);

  useEffect(() => {
    const invalidate = () => {
      centersRef.current = null;
    };
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("resize", invalidate);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { ref, hoveredIdx, onMouseMove, onMouseEnter, onMouseLeave, remeasure };
}
