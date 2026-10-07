import React, { useCallback, useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// Adaptado de Magic UI "Magic Card" (MIT), item @magicui/magic-card:
// solo modo gradient; `next-themes` retirado (no aplica en este repo);
// imports sobre framer-motion; colores SIEMPRE via props con tokens;
// con prefers-reduced-motion el spotlight queda desactivado.

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  // Colores en sintaxis CSS (p. ej. "hsl(var(--primary))") — solo tokens.
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  // Clase del panel interior opaco; pásale "bg-transparent" sobre cristal.
  innerClassName?: string;
}

export function MagicCard({
  children,
  className,
  innerClassName = "bg-background",
  gradientSize = 200,
  gradientColor = "hsl(var(--primary))",
  gradientOpacity = 0.8,
  gradientFrom = "hsl(var(--primary))",
  gradientTo = "hsl(var(--accent))",
}: MagicCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const borderBackground = useMotionTemplate`
    linear-gradient(var(--color-background) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--color-border) 100%
    ) border-box
  `;
  const spotlightBackground = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `;

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  const [disengaged, setDisengaged] = useState(true);

  useEffect(() => {
    const handleGlobalPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) setDisengaged(true);
    };
    const handleBlur = () => setDisengaged(true);
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") setDisengaged(true);
    };

    window.addEventListener("pointerout", handleGlobalPointerOut);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pointerout", handleGlobalPointerOut);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const showSpotlight = disengaged ? false : !prefersReducedMotion;
  const spotlightOpacity = showSpotlight ? undefined : 0;

  return (
    <motion.div
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit]",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        reset();
        setDisengaged(true);
      }}
      onPointerEnter={() => setDisengaged(false)}
      style={{ background: borderBackground }}
    >
      <div className={cn(innerClassName, "absolute inset-px z-20 rounded-[inherit]")} />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit]"
        style={{
          background: spotlightBackground,
          opacity: spotlightOpacity,
        }}
      />

      <div className="relative z-40">{children}</div>
    </motion.div>
  );
}
