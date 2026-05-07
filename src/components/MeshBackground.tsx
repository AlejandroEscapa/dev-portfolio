import { motion, useTransform, useReducedMotion } from "framer-motion";
import { useFluidGradient } from "@/hooks/useFluidGradient";
import { useIsMobile } from "@/hooks/use-mobile";

const BLOB_CONFIGS = [
  { phase: 0, initial: "-top-40 -left-40", size: "h-[600px] w-[600px]", blur: "blur-[140px]", yRange: [0, -260] as [number, number], xRange: [0, 120, -80] as [number, number, number], orbitRadius: 35 },
  { phase: Math.PI / 2, initial: "top-1/3 -right-40", size: "h-[700px] w-[700px]", blur: "blur-[160px]", yRange: [0, 220] as [number, number], xRange: [0, -150, 100] as [number, number, number], orbitRadius: 40 },
  { phase: Math.PI, initial: "bottom-0 left-1/3", size: "h-[500px] w-[500px]", blur: "blur-[140px]", yRange: [0, -160] as [number, number], xRange: [0, 80, -60] as [number, number, number], orbitRadius: 30 },
  { phase: (3 * Math.PI) / 2, initial: "top-1/2 left-1/2", size: "h-[420px] w-[420px]", blur: "blur-[120px]", yRange: [0, 180] as [number, number], xRange: [0, -100, 120] as [number, number, number], orbitRadius: 25 },
];

const MOBILE_BLOB_OVERRIDES = [
  { size: "h-[350px] w-[350px]", blur: "blur-[90px]" },
  { size: "h-[400px] w-[400px]", blur: "blur-[100px]" },
  { size: "h-[300px] w-[300px]", blur: "blur-[80px]" },
];

export const MeshBackground = () => {
  const isMobile = useIsMobile();
  const {
    containerRef,
    gradientLayerRef,
    gridRef,
    blobRefs,
    smooth,
  } = useFluidGradient(undefined, undefined, isMobile);

  const visibleBlobs = isMobile ? 3 : 4;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: "hsl(230 35% 5%)" }}
    >
      <div
        ref={gradientLayerRef}
        className="absolute inset-[-10%] will-change-[transform,filter,background-image]"
      />

      {BLOB_CONFIGS.slice(0, visibleBlobs).map((cfg, i) => (
        <OrbitalBlob
          key={i}
          index={i}
          config={cfg}
          smooth={smooth}
          isMobile={isMobile}
          mobileOverride={isMobile ? MOBILE_BLOB_OVERRIDES[i] : undefined}
          ref={(el) => { blobRefs.current[i] = el; }}
        />
      ))}

      <div
        ref={gridRef}
        className="absolute inset-0 grid-bg will-change-[opacity]"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(230,35%,5%)]/30 via-transparent to-[hsl(230,35%,5%)]/85" />
    </div>
  );
};

import { forwardRef } from "react";

interface OrbitalBlobProps {
  index: number;
  config: typeof BLOB_CONFIGS[number];
  smooth: import("framer-motion").MotionValue<number>;
  isMobile: boolean;
  mobileOverride?: { size: string; blur: string };
}

const OrbitalBlob = forwardRef<HTMLDivElement, OrbitalBlobProps>(
  ({ index, config, smooth, isMobile, mobileOverride }, ref) => {
    const { phase, initial, size, blur, yRange, xRange, orbitRadius } = config;
    const reducedMotion = useReducedMotion();

    const y = useTransform(smooth, [0, 1], yRange);
    const x = useTransform(smooth, [0, 0.5, 1], xRange);

    const blobAngle = useTransform(smooth, [0, 1], [0, Math.PI * 0.5]);

    const orbitX = useTransform(blobAngle, (a) =>
      reducedMotion ? 0 : Math.cos(a + phase) * orbitRadius
    );
    const orbitY = useTransform(blobAngle, (a) =>
      reducedMotion ? 0 : Math.sin(a + phase) * orbitRadius
    );

    const finalX = useTransform(x, orbitX, (px: number, ox: number) => px + ox);
    const finalY = useTransform(y, orbitY, (py: number, oy: number) => py + oy);

    const breathingKeyframes =
      index === 0
        ? { scale: [1, 1.15, 0.95, 1.1, 1] }
        : index === 1
        ? { scale: [1, 0.9, 1.2, 1, 1.05] }
        : index === 2
        ? { scale: [1, 1.2, 1, 1.1, 0.95] }
        : { scale: [1, 1.1, 0.95, 1.05, 1] };

    const breathingDuration = 18 + index * 2;

    const actualSize = mobileOverride?.size ?? size;
    const actualBlur = mobileOverride?.blur ?? blur;

    return (
      <motion.div
        style={{
          y: isMobile ? y : finalY,
          x: isMobile ? x : finalX,
          willChange: "transform, opacity",
        }}
        animate={breathingKeyframes}
        transition={{
          duration: breathingDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute ${initial} ${actualSize} rounded-full ${actualBlur}`}
      >
<div
            ref={ref}
            className="h-full w-full rounded-full"
            style={{ backgroundColor: "hsl(248 90% 66% / 0.35)" }}
          />

      </motion.div>
    );
  }
);

OrbitalBlob.displayName = "OrbitalBlob";
