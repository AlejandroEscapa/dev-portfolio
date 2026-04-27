import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

/**
 * Living mesh gradient background.
 * - Continuous drift on each blob (independent rhythms).
 * - Scroll-driven zoom + rotation + hue shift to make every section feel different.
 */
export const MeshBackground = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Smooth the scroll value so transforms feel buttery, not jittery.
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.6 });

  // Parallax positions
  const y1 = useTransform(smooth, [0, 1], [0, -260]);
  const y2 = useTransform(smooth, [0, 1], [0, 220]);
  const y3 = useTransform(smooth, [0, 1], [0, -160]);
  const x1 = useTransform(smooth, [0, 0.5, 1], [0, 120, -80]);
  const x2 = useTransform(smooth, [0, 0.5, 1], [0, -150, 100]);

  // Section-driven zoom: pulses bigger/smaller as you scroll between sections.
  const meshScale = useTransform(
    smooth,
    [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
    [1, 1.15, 0.95, 1.2, 1.05, 1.25, 1.1]
  );
  const meshRotate = useTransform(smooth, [0, 1], [0, 25]);
  const meshHue = useTransform(smooth, [0, 0.33, 0.66, 1], [0, 35, -25, 50]);
  const meshFilter = useTransform(meshHue, (h) => `hue-rotate(${h}deg)`);

  // Grid breathes: shifts and scales differently than the mesh.
  const gridScale = useTransform(smooth, [0, 0.5, 1], [1, 1.4, 1.1]);
  const gridOpacity = useTransform(smooth, [0, 0.2, 0.5, 0.8, 1], [0.45, 0.25, 0.5, 0.2, 0.4]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Animated mesh layer (zoom + rotate + hue per section) */}
      <motion.div
        style={{ scale: meshScale, rotate: meshRotate, filter: meshFilter }}
        className="absolute inset-[-10%] mesh-bg opacity-90"
      />

      {/* Drifting blobs with independent loops */}
      <motion.div
        style={{ y: y1, x: x1 }}
        animate={{ scale: [1, 1.15, 0.95, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/35 blur-[140px]"
      />
      <motion.div
        style={{ y: y2, x: x2 }}
        animate={{ scale: [1, 0.9, 1.2, 1, 1.05] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-accent/30 blur-[160px]"
      />
      <motion.div
        style={{ y: y3 }}
        animate={{ scale: [1, 1.2, 1, 1.1, 0.95] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-primary-glow/30 blur-[140px]"
      />
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--mesh-3))]/25 blur-[120px]"
      />

      {/* Breathing grid */}
      <motion.div
        style={{ scale: gridScale, opacity: gridOpacity }}
        className="absolute inset-0 grid-bg"
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/85" />
    </div>
  );
};
