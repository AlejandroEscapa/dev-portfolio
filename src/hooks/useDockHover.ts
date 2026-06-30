import { useRef, useState, useCallback } from "react";

export function useDockHover() {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-dock-item]");
    const mouseX = e.clientX;
    let closest = -1;
    let closestDist = Infinity;
    items.forEach((it, i) => {
      const rect = it.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(center - mouseX);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    setHoveredIdx(closest);
  }, []);

  const onMouseLeave = useCallback(() => setHoveredIdx(null), []);

  return { ref, hoveredIdx, onMouseMove, onMouseLeave };
}
