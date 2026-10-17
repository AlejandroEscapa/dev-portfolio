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
    <SectionContainer maxWidth="lg" motionStyle={motionStyle} className="px-6 md:px-8 lg:px-10 h-full">
      {/* One reveal moment: the wrapper enters and staggers its children —
          no per-element whileInView. With reduced motion everything is static.
          NOTE: about.section_label stays reserved for the future bio layout;
          this window currently shows the Stack (tech.* copy). */}
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger()}
        className="flex flex-col"
      >
        <motion.div
          variants={fadeUpSm}
          className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground"
        >
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("tech.section_label")}</span>
        </motion.div>

        {/* Same numbered-header recipe as Education/Projects (text-h1) so the
            section numbering reads at one size across the page. leading-tight
            keeps the fixed-height window from clipping the bento below. */}
        <motion.h2 variants={fadeUp} className="text-h1 font-bold leading-tight tracking-heading">
          {t("tech.heading_before")} {t("tech.heading_after")}
        </motion.h2>

        <motion.p
          variants={fadeUpSm}
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
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
