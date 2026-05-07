import { useRef } from "react";
import { useScroll, useTransform, useSpring } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface SectionZoomOutput {
  ref: React.RefObject<HTMLElement>;
  scale: import("framer-motion").MotionValue<number>;
  y: import("framer-motion").MotionValue<number>;
  opacity: import("framer-motion").MotionValue<number>;
}

export function useSectionZoom(
  scaleRange?: number,
  yRange?: number
): SectionZoomOutput {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLElement>(null!);

  const maxScale = scaleRange ?? (isMobile ? 0.03 : 0.05);
  const maxY = yRange ?? (isMobile ? 20 : 35);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawScale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1 - maxScale, 1, 1, 1 - maxScale]);
  const rawY = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [maxY, 0, 0, -maxY]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]);

  const springConfig = { stiffness: 80, damping: 20, mass: 0.5 };

  return {
    ref,
    scale: useSpring(rawScale, springConfig),
    y: useSpring(rawY, springConfig),
    opacity: useSpring(rawOpacity, springConfig),
  };
}
