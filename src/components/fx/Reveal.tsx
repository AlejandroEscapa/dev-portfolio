import { useContext, type PointerEventHandler, type ReactNode } from "react";
import { motion, type TargetAndTransition, type Variants } from "framer-motion";
import { fadeUp, fadeUpSm } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RevealInheritanceContext } from "./RevealContext";

type RevealProps = {
  variant?: "fadeUp" | "fadeUpSm";
  delay?: number;
  className?: string;
  children: ReactNode;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
};

export function Reveal({
  variant = "fadeUpSm",
  delay = 0,
  className,
  children,
  onPointerMove,
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const inheritAnimation = useContext(RevealInheritanceContext);

  if (reducedMotion) return <div onPointerMove={onPointerMove} className={className}>{children}</div>;

  const baseVariants = variant === "fadeUp" ? fadeUp : fadeUpSm;
  const show = baseVariants.show as TargetAndTransition;
  const variants: Variants = delay
    ? {
        ...baseVariants,
        show: {
          ...show,
          transition: { ...show.transition, delay },
        },
      }
    : baseVariants;

  return (
    <motion.div
      onPointerMove={onPointerMove}
      className={className}
      variants={variants}
      {...(!inheritAnimation && {
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, amount: 0.3 },
      })}
    >
      {children}
    </motion.div>
  );
}
