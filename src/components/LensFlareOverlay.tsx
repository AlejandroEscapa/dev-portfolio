import { motion, useScroll, useTransform } from "framer-motion";

export const LensFlareOverlay = () => {
  const { scrollYProgress } = useScroll();

  return (
    <div className="pointer-events-none fixed inset-0 z-[4] overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -right-1/4 -top-1/4 h-[80vw] w-[80vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(190 95% 80% / 0.025) 0%, transparent 70%)",
          x: useTransform(scrollYProgress, [0, 1], ["10%", "-15%"]),
          y: useTransform(scrollYProgress, [0, 1], ["5%", "-20%"]),
        }}
      />

      <motion.div
        className="absolute -bottom-1/4 -left-1/4 h-[70vw] w-[70vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(248 90% 80% / 0.02) 0%, transparent 70%)",
          x: useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]),
          y: useTransform(scrollYProgress, [0, 1], ["-5%", "15%"]),
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[6vh] w-[40vw] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.012) 50%, transparent 100%)",
          rotate: useTransform(scrollYProgress, [0, 1], [-6, 6]),
        }}
      />

      <motion.div
        className="absolute left-[10%] top-[15%] h-[20vw] w-[20vw]"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, hsl(320 85% 80% / 0.015) 0%, transparent 60%)",
          opacity: useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [0.3, 1, 0.3],
          ),
        }}
      />
    </div>
  );
};
