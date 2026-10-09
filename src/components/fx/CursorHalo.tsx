import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { portfolioConfig } from "@/lib/config";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION_FAST, EASE_OUT_EXPO } from "@/lib/motion";

type HaloMode = "rest" | "view" | "open";

/** Box del halo a escala 1; en reposo se reduce a un punto (~28px). */
const HALO_SIZE = 92;
const REST_SCALE = 0.3;

/**
 * Halo de cursor contextual tras flag (`features.cursorHalo`).
 *
 * Puertas de montaje — todas obligatorias: flag ON, puntero fino y sin
 * reduced-motion. Con cualquiera en NO no se monta nada y no queda ningún
 * listener. La posición se mueve SOLO con motion values sobre `transform`
 * (nunca estado de React por mousemove); el estado solo cambia de contexto.
 *
 * Contrato contextual: delegación en `document` leyendo
 * `closest("[data-cursor]")`; valores soportados `"view" | "open"`.
 */
export function CursorHalo() {
  const { t } = useLanguage();
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled =
    portfolioConfig.features?.cursorHalo === true && finePointer && !reducedMotion;

  const [mode, setMode] = useState<HaloMode>("rest");

  // Arranca fuera de pantalla: el primer mousemove lo trae al puntero.
  const pointerX = useMotionValue(-HALO_SIZE);
  const pointerY = useMotionValue(-HALO_SIZE);
  const x = useSpring(pointerX, { stiffness: 300, damping: 30, mass: 0.6 });
  const y = useSpring(pointerY, { stiffness: 300, damping: 30, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: MouseEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    };
    const onOver = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-cursor]") : null;
      const value = target?.getAttribute("data-cursor");
      setMode(value === "view" || value === "open" ? value : "rest");
    };
    const onOut = (event: MouseEvent) => {
      // Salir de la ventana no pasa por `mouseover`: vuelve a reposo.
      if (!event.relatedTarget) setMode("rest");
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [enabled, pointerX, pointerY]);

  if (!enabled) return null;

  const label = mode === "view" ? t("cursor.view") : mode === "open" ? t("cursor.open") : "";

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[35]"
      style={{
        x,
        y,
        pointerEvents: "none",
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full"
        style={{
          width: HALO_SIZE,
          height: HALO_SIZE,
          marginLeft: -HALO_SIZE / 2,
          marginTop: -HALO_SIZE / 2,
          backgroundColor: "hsl(var(--foreground) / 0.14)",
        }}
        animate={{ scale: mode === "rest" ? REST_SCALE : 1, opacity: mode === "rest" ? 0.6 : 1 }}
        transition={{ duration: DURATION_FAST, ease: EASE_OUT_EXPO }}
      >
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-label text-foreground">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
