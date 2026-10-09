import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { stagger } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RevealInheritanceContext } from "./RevealContext";

type RevealStaggerProps = {
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
  children: ReactNode;
};

export function RevealStagger({
  staggerChildren = 0.08,
  delayChildren = 0,
  className,
  children,
}: RevealStaggerProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return <div className={className}>{children}</div>;

  return (
    <RevealInheritanceContext.Provider value>
      <motion.div
        className={className}
        initial="hidden"
        whileInView="show"
        // `amount: "some"` (cualquier parte visible), NO una fracción: una
        // grilla más alta que ~3.3 viewports jamás alcanza un umbral
        // proporcional y se quedaría invisible para siempre (pantalla corta,
        // ventana pequeña o zoom del navegador).
        viewport={{ once: true, amount: "some" }}
        variants={stagger(staggerChildren, delayChildren)}
      >
        {children}
      </motion.div>
    </RevealInheritanceContext.Provider>
  );
}
