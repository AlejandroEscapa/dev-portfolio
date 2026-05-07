import { motion } from "framer-motion";
import { useFluidGradient } from "@/hooks/useFluidGradient";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMousePosition } from "@/hooks/useMousePosition";
import { OrbitalBlob } from "./OrbitalBlob";

export const MeshBackground = () => {
  const isMobile = useIsMobile();
  const mousePos = useMousePosition();
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

      {/* Noise Layer for Premium Texture */}
      <div className="absolute inset-0 bg-noise z-10 mix-blend-overlay" />

      {/* Gooey Fluid Container: This creates the "lava/mercury" effect */}
      <div className="absolute inset-0 gooey-container z-0">
        {Array.from({ length: visibleBlobs }).map((_, i) => (
          <OrbitalBlob
            key={i}
            index={i}
            smooth={smooth}
            isMobile={isMobile}
            mousePos={mousePos}
            mobileOverride={isMobile ? [
              { size: "h-[350px] w-[350px]", blur: "blur-[90px]" },
              { size: "h-[400px] w-[400px]", blur: "blur-[100px]" },
              { size: "h-[300px] w-[300px]", blur: "blur-[80px]" },
            ][i] : undefined}
            ref={(el) => { blobRefs.current[i] = el; }}
          />
        ))}
      </div>

      <div
        ref={gridRef}
        className="absolute inset-0 grid-bg will-change-[opacity] z-20"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(230,35%,5%)]/30 via-transparent to-[hsl(230,35%,5%)]/85 z-30" />
    </div>
  );
};
