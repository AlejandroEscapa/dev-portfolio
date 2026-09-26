import { motion, type Variants } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { TechBento } from "@/components/sections/TechBento";
import { useLanguage } from "@/context/LanguageContext";

interface AboutProps {
  motionStyle?: MotionStyle;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
  }),
};

export const About = ({ motionStyle }: AboutProps) => {
  const { t } = useLanguage();

  return (
    <SectionContainer maxWidth="lg" motionStyle={motionStyle} className="h-full">
      <div className="flex flex-col">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-6 flex items-center gap-3 text-label uppercase tracking-label text-muted-foreground"
        >
          <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("about.section_label")}</span>
        </motion.div>

        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          variants={fadeUp}
          className="text-h2 font-bold leading-tight tracking-heading"
        >
          {t("tech.heading_before")} {t("tech.heading_after")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {t("tech.subheading")}
        </motion.p>

        <TechBento />
      </div>
    </SectionContainer>
  );
};
