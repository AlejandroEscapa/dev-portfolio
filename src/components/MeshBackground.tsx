import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Animated mesh gradient background with subtle parallax.
 * Renders a grid overlay + drifting blobs behind all content.
 */
export const MeshBackground = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Base mesh */}
      <div className="absolute inset-0 mesh-bg opacity-90" />

      {/* Drifting blobs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/30 blur-[140px] animate-mesh-drift"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-accent/25 blur-[160px] animate-mesh-drift"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-primary-glow/25 blur-[140px] animate-mesh-drift"
      />

      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/80" />
    </div>
  );
};
