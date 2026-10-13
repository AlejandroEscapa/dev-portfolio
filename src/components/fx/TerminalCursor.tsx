import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { portfolioConfig } from "@/lib/config";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DURATION_FAST, EASE_OUT_EXPO } from "@/lib/motion";

type CursorMode = "rest" | "view" | "open" | "text";

/** Ring a escala 1; en reposo se contrae a ~28px (88 × 0.32). */
const RING_SIZE = 88;
const REST_SCALE = 0.32;
const DOT_SIZE = 6;
const BEAM_WIDTH = 2;
const BEAM_HEIGHT = 20;
/** Caja de ticks alineada con el ring en reposo (~28px). */
const TICKS_BOX = 28;
const TICK_SIZE = 8;
/** Caja de brackets del estado `open` y sus esquinas en L. */
const OPEN_BOX = 44;
const BRACKET_SIZE = 14;

const TRANSITION = { duration: DURATION_FAST, ease: EASE_OUT_EXPO };
const SPRING = { stiffness: 300, damping: 30, mass: 0.6 };

/** Esquina en L (14×14) para el estado `open`; cada una lleva sus dos bordes. */
const bracketCorner = (side: "tl" | "tr" | "bl" | "br") => {
  const horizontal = side.startsWith("t") ? "top" : "bottom";
  const vertical = side.endsWith("l") ? "left" : "right";
  return {
    position: "absolute",
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    [horizontal]: 0,
    [vertical]: 0,
    [`border${horizontal[0].toUpperCase()}${horizontal.slice(1)}Width`]: 1,
    [`border${horizontal[0].toUpperCase()}${horizontal.slice(1)}Style`]: "solid",
    [`border${vertical[0].toUpperCase()}${vertical.slice(1)}Width`]: 1,
    [`border${vertical[0].toUpperCase()}${vertical.slice(1)}Style`]: "solid",
    borderColor: "hsl(var(--accent))",
  } as const;
};

/** Línea de 8×1px en N/S/E/W dentro del ring en reposo. */
const tick = (side: "n" | "s" | "e" | "w") => {
  const vertical = side === "n" || side === "s";
  return {
    position: "absolute",
    width: vertical ? 1 : TICK_SIZE,
    height: vertical ? TICK_SIZE : 1,
    top: side === "n" ? 0 : side === "s" ? "auto" : `calc(50% - 0.5px)`,
    bottom: side === "s" ? 0 : "auto",
    left: side === "w" ? 0 : side === "e" ? "auto" : `calc(50% - 0.5px)`,
    right: side === "e" ? 0 : "auto",
    backgroundColor: "hsl(var(--foreground) / 0.35)",
  } as const;
};

/**
 * Cursor de retícula terminal tras flag (`features.terminalCursor`).
 *
 * Puertas de montaje — todas obligatorias: flag ON, puntero fino y sin
 * reduced-motion. Con cualquiera en NO no se monta nada y no queda ningún
 * listener. La posición se mueve SOLO con motion values sobre `transform`
 * (nunca estado de React por mousemove); el estado solo cambia de contexto.
 *
 * Capas: dot que sigue el puntero al instante (sin spring) y ring con
 * crosshair que lo sigue con spring. El contexto se delega en `document`
 * leyendo `closest("[data-cursor]")`; valores soportados
 * `"view" | "open" | "text"`; sin atributo → `rest`. Al montar marca
 * `html[data-custom-cursor="on"]` (ver regla `cursor: none` en index.css)
 * y lo retira al desmontar.
 */
export function TerminalCursor() {
  const { t } = useLanguage();
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled =
    portfolioConfig.features?.terminalCursor === true && finePointer && !reducedMotion;

  const [mode, setMode] = useState<CursorMode>("rest");

  // Arranca fuera de pantalla: el primer mousemove lo trae al puntero.
  const pointerX = useMotionValue(-RING_SIZE);
  const pointerY = useMotionValue(-RING_SIZE);
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

  const viewLabel = mode === "view" ? t("cursor.view") : "";
  const openLabel = mode === "open" ? t("cursor.open") : "";

  return (
    <>
      {/* Capa instantánea: dot en reposo / I-beam sobre texto. */}
      <motion.div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[35]"
        style={{ x: pointerX, y: pointerY, pointerEvents: "none", willChange: "transform" }}
      >
        <motion.div
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            marginLeft: -DOT_SIZE / 2,
            marginTop: -DOT_SIZE / 2,
            borderRadius: "50%",
            backgroundColor: "hsl(var(--primary))",
          }}
          animate={{ opacity: mode === "rest" ? 1 : 0 }}
          transition={TRANSITION}
        />
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

      {/* Capa con spring: ring, crosshair y brackets. */}
      <motion.div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[35]"
        style={{ x, y, pointerEvents: "none", willChange: "transform" }}
      >
        {/* Ring en reposo: se contrae a ~28px y esconde ticks al salir. */}
        <motion.div
          className="rounded-full"
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            marginLeft: -RING_SIZE / 2,
            marginTop: -RING_SIZE / 2,
            border: "1px solid hsl(var(--foreground) / 0.45)",
          }}
          animate={{ scale: mode === "view" ? 1 : REST_SCALE, opacity: mode === "rest" ? 1 : 0 }}
          transition={TRANSITION}
        />
        {/* Ring de `view`: expande a escala 1 con tinte primario y label. */}
        <motion.div
          className="flex items-center justify-center rounded-full"
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            marginLeft: -RING_SIZE / 2,
            marginTop: -RING_SIZE / 2,
            border: "1px solid hsl(var(--primary) / 0.9)",
            backgroundColor: "hsl(var(--primary) / 0.12)",
          }}
          animate={{ scale: mode === "view" ? 1 : REST_SCALE, opacity: mode === "view" ? 1 : 0 }}
          transition={TRANSITION}
        >
          {viewLabel && (
            <span className="font-mono text-[10px] uppercase tracking-label text-foreground">
              {viewLabel}
            </span>
          )}
        </motion.div>
        {/* Crosshair N/S/E/W, fijo (~28px), visible solo en reposo. */}
        <motion.div
          style={{
            position: "relative",
            width: TICKS_BOX,
            height: TICKS_BOX,
            marginLeft: -TICKS_BOX / 2,
            marginTop: -TICKS_BOX / 2,
          }}
          animate={{ opacity: mode === "rest" ? 1 : 0 }}
          transition={TRANSITION}
        >
          <span style={tick("n")} />
          <span style={tick("s")} />
          <span style={tick("e")} />
          <span style={tick("w")} />
        </motion.div>
        {/* Brackets de `open`: caja de 44px con label a su derecha. */}
        <motion.div
          style={{
            position: "relative",
            width: OPEN_BOX,
            height: OPEN_BOX,
            marginLeft: -OPEN_BOX / 2,
            marginTop: -OPEN_BOX / 2,
          }}
          animate={{ opacity: mode === "open" ? 1 : 0 }}
          transition={TRANSITION}
        >
          <span style={bracketCorner("tl")} />
          <span style={bracketCorner("tr")} />
          <span style={bracketCorner("bl")} />
          <span style={bracketCorner("br")} />
          {openLabel && (
            <span
              className="font-mono text-[10px] uppercase tracking-label text-foreground"
              style={{ position: "absolute", left: OPEN_BOX + 8, top: "50%", transform: "translateY(-50%)" }}
            >
              {openLabel}
            </span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
