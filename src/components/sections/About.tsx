import { motion, type Variants } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { TechBento } from "@/components/sections/TechBento";
import { useLanguage } from "@/context/LanguageContext";

interface AboutProps {
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

const SECTION_ID = "about";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
  }),
};

export const About = ({ id = SECTION_ID, innerRef, motionStyle }: AboutProps) => {
  const { t } = useLanguage();

  return (
    <SectionContainer maxWidth="lg" id={id} innerRef={innerRef} motionStyle={motionStyle} padding="py-0" className="h-full">
      <div className="flex flex-col">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground"
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
          className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl md:text-5xl"
        >
          <span className="text-gradient">{t("tech.heading_before")}</span>{" "}
          <span className="text-gradient-primary">{t("tech.heading_after")}</span>
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
