import { useRef, useState, useCallback } from "react";

/** Tracks which dock item the pointer is closest to, for the magnify effect.
    The rail is vertical, so the default axis is "y" (the old bottom dock used "x"). */
export function useDockHover(axis: "x" | "y" = "y") {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-dock-item]");
    const pointer = axis === "x" ? e.clientX : e.clientY;
    let closest = -1;
    let closestDist = Infinity;
    items.forEach((it, i) => {
      const rect = it.getBoundingClientRect();
      const center = axis === "x" ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
      const dist = Math.abs(center - pointer);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    setHoveredIdx(closest);
  }, [axis]);

  const onMouseLeave = useCallback(() => setHoveredIdx(null), []);

  return { ref, hoveredIdx, onMouseMove, onMouseLeave };
}
