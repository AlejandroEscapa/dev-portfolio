import { forwardRef, useMemo } from "react";
import { 
  motion, 
  useTransform, 
  useReducedMotion, 
  useSpring, 
  MotionValue 
} from "framer-motion";

export interface BlobWaypoint {
  progress: number;
  x: number; // % of viewport width
  y: number; // % of viewport height
  scale: number;
  blur: number;
}

export const BLOB_WAYPOINTS: BlobWaypoint[][] = [
  // Blob 0: Deep Cosmic Flow - TopLeft -> BottomRight -> Center
  [
    { progress: 0, x: -20, y: -20, scale: 1, blur: 120 },
    { progress: 0.3, x: 40, y: 20, scale: 1.5, blur: 150 },
    { progress: 0.6, x: 120, y: 80, scale: 0.8, blur: 100 },
    { progress: 1, x: 20, y: 20, scale: 1.2, blur: 130 },
  ],
  // Blob 1: Electric Pulse - TopRight -> TopLeft -> BottomRight
  [
    { progress: 0, x: 120, y: -20, scale: 1, blur: 140 },
    { progress: 0.3, x: -20, y: 40, scale: 1.8, blur: 180 },
    { progress: 0.6, x: 80, y: 120, scale: 1, blur: 120 },
    { progress: 1, x: 140, y: 20, scale: 1.3, blur: 140 },
  ],
  // Blob 2: Liquid Shadow - BottomCenter -> TopCenter -> BottomLeft
  [
    { progress: 0, x: 50, y: 120, scale: 1.2, blur: 110 },
    { progress: 0.3, x: 30, y: -40, scale: 1, blur: 130 },
    { progress: 0.6, x: -20, y: 50, scale: 1.6, blur: 160 },
    { progress: 1, x: 60, y: 100, scale: 1.1, blur: 120 },
  ],
  // Blob 3: Nebula Core - Center -> Outer Ring -> Center
  [
    { progress: 0, x: 50, y: 50, scale: 1, blur: 100 },
    { progress: 0.3, x: 130, y: 130, scale: 1.4, blur: 140 },
    { progress: 0.6, x: -10, y: -10, scale: 0.7, blur: 90 },
    { progress: 1, x: 40, y: 40, scale: 1.5, blur: 150 },
  ],
];

const BLOB_SIZES = [
  "h-[800px] w-[800px]",
  "h-[900px] w-[900px]",
  "h-[700px] w-[700px]",
  "h-[600px] w-[600px]",
];

interface OrbitalBlobProps {
  index: number;
  smooth: MotionValue<number>;
  isMobile: boolean;
  mobileOverride?: { size: string; blur: string };
  mousePos: { x: number; y: number };
}

const OrbitalBlob = forwardRef<HTMLDivElement, OrbitalBlobProps>(
  ({ index, smooth, isMobile, mobileOverride, mousePos }, ref) => {
    const reducedMotion = useReducedMotion();
    const waypoints = BLOB_WAYPOINTS[index];

    const mouseX = useSpring(mousePos.x * 200, { stiffness: 60, damping: 15 });
    const mouseY = useSpring(mousePos.y * 200, { stiffness: 60, damping: 15 });

    const xPct = useTransform(
      smooth,
      waypoints.map(w => w.progress),
      waypoints.map(w => w.x)
    );
    const yPct = useTransform(
      smooth,
      waypoints.map(w => w.progress),
      waypoints.map(w => w.y)
    );
    const scale = useTransform(
      smooth,
      waypoints.map(w => w.progress),
      waypoints.map(w => w.scale)
    );
    const blur = useTransform(
      smooth,
      waypoints.map(w => w.progress),
      waypoints.map(w => w.blur)
    );

    const mouseBlurMod = useSpring(mousePos.y * 0.35, { stiffness: 25, damping: 20 });

    const combinedBlur = useTransform(
      [blur, mouseBlurMod],
      useMemo(() => {
        const rm = reducedMotion;
        return ([b, mb]: number[]) =>
          rm ? b : Math.max(30, b * (1 + mb));
      }, [reducedMotion])
    );

    const combinedBlurFilter = useTransform(combinedBlur, (b) => `blur(${b}px)`);

    const finalX = useTransform(
      [xPct, mouseX],
      ([px, mx]) => {
        if (reducedMotion) return `${px}vw`;
        return `${px + mx * 0.3}vw`;
      }
    );
    const finalY = useTransform(
      [yPct, mouseY],
      ([py, my]) => {
        if (reducedMotion) return `${py}vh`;
        return `${py + my * 0.3}vh`;
      }
    );

    const actualSize = mobileOverride?.size ?? BLOB_SIZES[index];

    return (
      <motion.div
        style={{
          x: finalX,
          y: finalY,
          scale,
          filter: combinedBlurFilter,
          willChange: "transform, filter",
        }}
        className={`absolute ${actualSize} rounded-full pointer-events-none`}
      >
        <div
          ref={ref}
          className="h-full w-full rounded-full"
          style={{ backgroundColor: "hsl(248 90% 66% / 0.4)" }}
        />
      </motion.div>
    );
  }
);

OrbitalBlob.displayName = "OrbitalBlob";

export { OrbitalBlob };
