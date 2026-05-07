import { useRef, useCallback, useEffect } from "react";
import {
  useScroll,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/* 1. TYPES                                                            */
/* ------------------------------------------------------------------ */

export interface FluidAtmosphere {
  progress: number;
  stops: [string, string, string, string];
  gridOpacity: number;
}

export interface FluidOutput {
  backgroundImage: string;
  blur: number;
  scale: number;
  gridOpacity: number;
}

/* ------------------------------------------------------------------ */
/* 2. ATMOSPHERES (6 landmarks — from plan §4)                        */
/* ------------------------------------------------------------------ */

export const FLUID_ATMOSPHERES: FluidAtmosphere[] = [
  {
    progress: 0.0,
    stops: [
      "hsl(248 90% 66% / 0.45)",
      "hsl(190 95% 60% / 0.35)",
      "hsl(270 95% 75% / 0.40)",
      "hsl(230 35% 5% / 0.40)",
    ],
    gridOpacity: 0.45,
  },
  {
    progress: 0.2,
    stops: [
      "hsl(270 80% 60% / 0.40)",
      "hsl(280 75% 55% / 0.35)",
      "hsl(260 85% 50% / 0.40)",
      "hsl(230 35% 5% / 0.40)",
    ],
    gridOpacity: 0.30,
  },
  {
    progress: 0.4,
    stops: [
      "hsl(190 95% 60% / 0.45)",
      "hsl(248 90% 66% / 0.35)",
      "hsl(220 80% 55% / 0.40)",
      "hsl(230 35% 5% / 0.40)",
    ],
    gridOpacity: 0.40,
  },
  {
    progress: 0.6,
    stops: [
      "hsl(260 70% 50% / 0.40)",
      "hsl(240 65% 45% / 0.35)",
      "hsl(280 75% 55% / 0.40)",
      "hsl(230 35% 5% / 0.40)",
    ],
    gridOpacity: 0.25,
  },
  {
    progress: 0.8,
    stops: [
      "hsl(320 85% 65% / 0.45)",
      "hsl(190 95% 60% / 0.35)",
      "hsl(340 80% 60% / 0.40)",
      "hsl(230 35% 5% / 0.40)",
    ],
    gridOpacity: 0.35,
  },
  {
    progress: 1.0,
    stops: [
      "hsl(248 90% 66% / 0.40)",
      "hsl(270 95% 75% / 0.35)",
      "hsl(230 35% 5% / 0.40)",
      "hsl(230 35% 5% / 0.40)",
    ],
    gridOpacity: 0.38,
  },
];

/* ------------------------------------------------------------------ */
/* 3. HSLA PARSING & INTERPOLATION                                     */
/* ------------------------------------------------------------------ */

interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

const HSLA_RE = /hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\/\s*([\d.]+)\s*\)/;

export function parseHSLA(raw: string): HSLA {
  const m = raw.match(HSLA_RE);
  if (!m) {
    throw new Error(`Invalid HSLA string: ${raw}`);
  }
  return {
    h: parseFloat(m[1]),
    s: parseFloat(m[2]),
    l: parseFloat(m[3]),
    a: parseFloat(m[4]),
  };
}

export function lerpHSLA(a: string, b: string, t: number): string {
  const pa = parseHSLA(a);
  const pb = parseHSLA(b);

  let dh = pb.h - pa.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;

  const h = ((pa.h + dh * t) % 360 + 360) % 360;
  const s = pa.s + (pb.s - pa.s) * t;
  const l = pa.l + (pb.l - pa.l) * t;
  const alpha = pa.a + (pb.a - pa.a) * t;

  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}% / ${alpha.toFixed(2)})`;
}

/* ------------------------------------------------------------------ */
/* 4. NEIGHBOR SEARCH + SMOOTHSTEP                                     */
/* ------------------------------------------------------------------ */

export function findNeighbors(
  progress: number,
  atmospheres: FluidAtmosphere[]
): [FluidAtmosphere, FluidAtmosphere] {
  if (progress <= atmospheres[0].progress) {
    return [atmospheres[0], atmospheres[0]];
  }
  if (progress >= atmospheres[atmospheres.length - 1].progress) {
    const last = atmospheres[atmospheres.length - 1];
    return [last, last];
  }

  for (let i = 0; i < atmospheres.length - 1; i++) {
    if (
      progress >= atmospheres[i].progress &&
      progress <= atmospheres[i + 1].progress
    ) {
      return [atmospheres[i], atmospheres[i + 1]];
    }
  }

  return [atmospheres[0], atmospheres[0]];
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ */
/* 5. GRADIENT BUILDER                                                 */
/* ------------------------------------------------------------------ */

export function interpolateColors(
  progress: number,
  atmospheres: FluidAtmosphere[]
): string[] {
  const [lo, hi] = findNeighbors(progress, atmospheres);

  if (lo === hi) return [...lo.stops];

  const range = hi.progress - lo.progress;
  const raw = (progress - lo.progress) / range;
  const t = smoothstep(Math.max(0, Math.min(1, raw)));

  return lo.stops.map((colorA, i) => lerpHSLA(colorA, hi.stops[i], t));
}

export function interpolateGridOpacity(
  progress: number,
  atmospheres: FluidAtmosphere[]
): number {
  const [lo, hi] = findNeighbors(progress, atmospheres);
  if (lo === hi) return lo.gridOpacity;

  const range = hi.progress - lo.progress;
  const raw = (progress - lo.progress) / range;
  const t = smoothstep(Math.max(0, Math.min(1, raw)));

  return lo.gridOpacity + (hi.gridOpacity - lo.gridOpacity) * t;
}

export function buildGradientCSS(colors: string[]): string {
  return `
    radial-gradient(at 18% 22%, ${colors[0]} 0px, transparent 50%),
    radial-gradient(at 82% 12%, ${colors[1]} 0px, transparent 50%),
    radial-gradient(at 75% 78%, ${colors[2]} 0px, transparent 50%),
    radial-gradient(at 12% 88%, ${colors[3]} 0px, transparent 50%)
  `.trim().replace(/\s+/g, " ");
}

/* ------------------------------------------------------------------ */
/* 6. SECTION FX (sinusoidal scale + blur)                             */
/* ------------------------------------------------------------------ */

export function computeSectionFx(
  progress: number,
  atmospheres: FluidAtmosphere[],
  isMobile: boolean
): { scale: number; blur: number } {
  const [lo, hi] = findNeighbors(progress, atmospheres);
  if (lo === hi) {
    const envelope = 1;
    return {
      scale: 1 + (isMobile ? 0.06 : 0.12) * envelope,
      blur: (isMobile ? 2 : 3) * envelope,
    };
  }

  const center = (lo.progress + hi.progress) / 2;
  const sectionSize = hi.progress - lo.progress;
  const localProgress = (progress - lo.progress) / sectionSize;
  const envelope = Math.sin(Math.max(0, Math.min(1, localProgress)) * Math.PI);

  return {
    scale: 1 + (isMobile ? 0.06 : 0.12) * envelope,
    blur: (isMobile ? 2 : 3) * envelope,
  };
}

/* ------------------------------------------------------------------ */
/* 7. BLOB COLOR INTERPOLATION                                         */
/* ------------------------------------------------------------------ */

const BLOB_HUE_MAPS: [string, string][] = [
  ["hsl(248 90% 66% / 0.35)", "hsl(190 95% 60% / 0.30)"],
  ["hsl(190 95% 60% / 0.30)", "hsl(270 95% 75% / 0.30)"],
  ["hsl(270 95% 75% / 0.30)", "hsl(320 85% 65% / 0.25)"],
  ["hsl(320 85% 65% / 0.25)", "hsl(248 90% 66% / 0.25)"],
];

export function interpolateBlobColor(
  progress: number,
  blobIndex: number
): string {
  const [a, b] = BLOB_HUE_MAPS[blobIndex % BLOB_HUE_MAPS.length];
  const t = smoothstep(Math.max(0, Math.min(1, progress)));
  return lerpHSLA(a, b, t);
}

/* ------------------------------------------------------------------ */
/* 8. HOOK: useFluidGradient                                           */
/* ------------------------------------------------------------------ */

export function useFluidGradient(
  scrollProgress?: MotionValue<number>,
  atmospheres: FluidAtmosphere[] = FLUID_ATMOSPHERES,
  isMobile = false
): {
  containerRef: React.RefObject<HTMLDivElement>;
  gradientLayerRef: React.RefObject<HTMLDivElement>;
  gridRef: React.RefObject<HTMLDivElement>;
  blobRefs: React.RefObject<(HTMLDivElement | null)[]>;
  smooth: MotionValue<number>;
} {
  const containerRef = useRef<HTMLDivElement>(null!);
  const gradientLayerRef = useRef<HTMLDivElement>(null!);
  const gridRef = useRef<HTMLDivElement>(null!);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress: defaultScroll } = useScroll();
  const raw = scrollProgress ?? defaultScroll;

  const smooth = useSpring(raw, {
    stiffness: 40,
    damping: 25,
    mass: 0.8,
  });

  const update = useCallback(
    (latest: number) => {
      const p = Math.max(0, Math.min(1, latest));

      const colors = interpolateColors(p, atmospheres);
      const gradient = buildGradientCSS(colors);

      const fx = computeSectionFx(p, atmospheres, isMobile);
      const gOpacity = interpolateGridOpacity(p, atmospheres);

      const gradEl = gradientLayerRef.current;
      if (gradEl) {
        gradEl.style.backgroundImage = gradient;
        gradEl.style.transform = `scale(${fx.scale.toFixed(4)})`;
        gradEl.style.filter = `blur(${fx.blur.toFixed(2)}px)`;
      }

      const gridEl = gridRef.current;
      if (gridEl) {
        gridEl.style.opacity = gOpacity.toFixed(3);
      }

      for (let i = 0; i < 4; i++) {
        const el = blobRefs.current[i];
        if (el) {
          el.style.backgroundColor = interpolateBlobColor(p, i);
        }
      }
    },
    [atmospheres, isMobile]
  );

  useMotionValueEvent(smooth, "change", update);

  useEffect(() => {
    update(0);
  }, []);

  return {
    containerRef,
    gradientLayerRef,
    gridRef,
    blobRefs,
    smooth,
  };
}
