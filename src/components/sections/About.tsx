import { motion, useReducedMotion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { TechBento } from "@/components/sections/TechBento";
import { useLanguage } from "@/context/LanguageContext";
import { fadeUp, fadeUpSm, stagger } from "@/lib/motion";

interface AboutProps {
  motionStyle?: MotionStyle;
}

export const About = ({ motionStyle }: AboutProps) => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  return (
    <SectionContainer maxWidth="lg" motionStyle={motionStyle} className="h-full">
      {/* One reveal moment: the wrapper enters and staggers its children —
          no per-element whileInView. With reduced motion everything is static. */}
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger()}
        className="flex flex-col"
      >
        <motion.div
          variants={fadeUpSm}
          className="mb-6 flex items-center gap-3 text-label uppercase tracking-label text-muted-foreground"
        >
          <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("about.section_label")}</span>
        </motion.div>

        <motion.h2 variants={fadeUp} className="text-h2 font-bold leading-tight tracking-heading">
          {t("tech.heading_before")} {t("tech.heading_after")}
        </motion.h2>

        <motion.p
          variants={fadeUpSm}
          className="mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {t("tech.subheading")}
        </motion.p>

        <motion.div variants={fadeUp}>
          <TechBento />
        </motion.div>
      </motion.div>
    </SectionContainer>
  );
};
