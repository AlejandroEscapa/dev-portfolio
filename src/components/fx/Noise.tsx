import React, { useRef, useEffect } from "react";

import { fillGrainBuffer, grainIntervalMs } from "@/lib/grain";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Adaptado de React Bits "Noise" (MIT), item @reactbits/Noise-TS-TW:
// con prefers-reduced-motion el grano se dibuja una sola vez (sin loop);
// resto del canvas idéntico (gris neutro, alpha bajo — no lleva color).
//
// Rendimiento (auditoría 2026-10-17): antes cada refresco regeneraba un
// ImageData de 1024×1024 con Math.random() — 12,7 ms de CPU y 4,19 MB de
// basura cada ~100 ms, medidos dentro de la página. Ahora los frames se
// pre-renderizan UNA vez y el bucle solo los intercambia con drawImage
// (< 1 ms). Coste de la alternativa: FRAME_COUNT canvas de 1024×1024 fuera de
// pantalla (~4,2 MB cada uno). Con FRAME_COUNT = 1 se ahorra la mitad de
// memoria pero el grano deja de parpadear.

interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
}

/** Lado del canvas de grano: mismo valor que la implementación original. */
const GRAIN_SIZE = 1024;
/** Frames pre-renderizados que se alternan. 2 = parpadeo, coste mínimo. */
const FRAME_COUNT = 2;

const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const canvasSize = GRAIN_SIZE;

    // Frames de grano fuera de pantalla: se pintan una sola vez aquí.
    const frames: HTMLCanvasElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const frame = document.createElement("canvas");
      frame.width = canvasSize;
      frame.height = canvasSize;
      const frameCtx = frame.getContext("2d", { alpha: true });
      if (!frameCtx) return;
      const imageData = frameCtx.createImageData(canvasSize, canvasSize);
      fillGrainBuffer(imageData.data, patternAlpha);
      frameCtx.putImageData(imageData, 0, 0);
      frames.push(frame);
    }

    let frameIndex = 0;
    const present = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.drawImage(frames[frameIndex], 0, 0);
    };

    const resize = () => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      // Redimensionar vacía el canvas: hay que repintar el frame actual.
      present();
    };

    let animationId: number | undefined;
    let lastDraw = 0;

    resize();
    window.addEventListener("resize", resize);

    if (!prefersReducedMotion) {
      const interval = grainIntervalMs(patternRefreshInterval);
      const loop = (now: number) => {
        if (now - lastDraw >= interval) {
          frameIndex = (frameIndex + 1) % FRAME_COUNT;
          present();
          lastDraw = now;
        }
        animationId = window.requestAnimationFrame(loop);
      };
      animationId = window.requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId !== undefined) window.cancelAnimationFrame(animationId);
      frames.length = 0;
    };
  }, [
    prefersReducedMotion,
    patternSize,
    patternScaleX,
    patternScaleY,
    patternRefreshInterval,
    patternAlpha,
  ]);

  return (
    <canvas
      className="pointer-events-none absolute top-0 left-0 h-screen w-screen"
      ref={grainRef}
      style={{
        imageRendering: "pixelated",
      }}
      aria-hidden="true"
    />
  );
};

export default Noise;
