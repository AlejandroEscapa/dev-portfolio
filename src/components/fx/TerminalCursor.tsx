import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { portfolioConfig } from "@/lib/config";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION_FAST, EASE_OUT_EXPO } from "@/lib/motion";

type CursorMode = "rest" | "view" | "open" | "text";

/** Dot morado único: 6px en reposo, escala a 56px con label en view/open. */
const DOT_SIZE = 6;
const ACTIVE_SIZE = 56;
const BEAM_WIDTH = 2;
const BEAM_HEIGHT = 20;

const TRANSITION = { duration: DURATION_FAST, ease: EASE_OUT_EXPO };
const SPRING = { stiffness: 300, damping: 30, mass: 0.6 };

/**
 * Cursor mínimo tras flag (`features.terminalCursor`).
 *
 * Una sola capa circular en `--primary` que escala con spring: reposo 6px,
 * view/open 56px con label mono, text esconde el dot y muestra el I-beam.
 * Sin ring gris, sin crosshair, sin brackets. Puertas de montaje: flag ON,
 * puntero fino y sin reduced-motion. Posición solo con motion values sobre
 * `transform`; el estado solo cambia de contexto vía `data-cursor`.
 */
export function TerminalCursor() {
  const { t } = useLanguage();
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled =
    portfolioConfig.features?.terminalCursor === true && finePointer && !reducedMotion;

  const [mode, setMode] = useState<CursorMode>("rest");

  // Arranca fuera de pantalla: el primer mousemove lo trae al puntero.
  const pointerX = useMotionValue(-ACTIVE_SIZE);
  const pointerY = useMotionValue(-ACTIVE_SIZE);
  const x = useSpring(pointerX, SPRING);
  const y = useSpring(pointerY, SPRING);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.dataset.customCursor = "on";

    const onMove = (event: MouseEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    };
    const onOver = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("[data-cursor]") : null;
      const value = target?.getAttribute("data-cursor");
      setMode(value === "view" || value === "open" || value === "text" ? value : "rest");
    };
    const onOut = (event: MouseEvent) => {
      // Salir de la ventana no pasa por `mouseover`: vuelve a reposo.
      if (!event.relatedTarget) setMode("rest");
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      delete document.documentElement.dataset.customCursor;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [enabled, pointerX, pointerY]);

  if (!enabled) return null;

  const label = mode === "view" ? t("cursor.view") : mode === "open" ? t("cursor.open") : "";
  const active = mode === "view" || mode === "open";
  const dotScale = mode === "text" ? 0 : active ? ACTIVE_SIZE / DOT_SIZE : 1;

  return (
    <>
      {/* Capa única: dot morado que escala en view/open. */}
      <motion.div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[35]"
        style={{ x, y, pointerEvents: "none", willChange: "transform" }}
      >
        <motion.div
          className="flex items-center justify-center rounded-full"
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            marginLeft: -DOT_SIZE / 2,
            marginTop: -DOT_SIZE / 2,
            backgroundColor: "hsl(var(--primary))",
            border: "1px solid hsl(var(--primary) / 0.9)",
          }}
          animate={{
            scale: dotScale,
            opacity: mode === "text" ? 0 : 1,
            backgroundColor: active ? "hsl(var(--primary) / 0.12)" : "hsl(var(--primary))",
          }}
          transition={TRANSITION}
        >
          {label && (
            <motion.span
              className="font-mono text-[10px] uppercase tracking-label text-foreground"
              animate={{ scale: active ? DOT_SIZE / ACTIVE_SIZE : 1, opacity: active ? 1 : 0 }}
              transition={TRANSITION}
            >
              {label}
            </motion.span>
          )}
        </motion.div>
        <motion.div
          data-testid="cursor-beam"
          style={{
            width: BEAM_WIDTH,
            height: BEAM_HEIGHT,
            marginLeft: -BEAM_WIDTH / 2,
            marginTop: -BEAM_HEIGHT / 2,
            backgroundColor: "hsl(var(--foreground))",
          }}
          animate={{ opacity: mode === "text" ? 1 : 0 }}
          transition={TRANSITION}
        />
      </motion.div>
    </>
  );
}
