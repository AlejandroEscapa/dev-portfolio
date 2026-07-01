import { motion, type Variants } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Code2, Brain, Database, Smartphone, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
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

interface BentoItem {
  titleKey: string;
  subtitleKey: string;
  items: string[];
  icon: LucideIcon;
  accent?: "primary" | "accent" | "glow";
}

const accentMap = {
  primary: "text-primary",
  accent: "text-accent",
  glow: "text-primary-glow",
};

export const About = ({ id = SECTION_ID, innerRef, motionStyle }: AboutProps) => {
  const { t } = useLanguage();

  const bento: BentoItem[] = [
    {
      titleKey: "tech.languages_title",
      subtitleKey: "tech.languages_subtitle",
      items: ["TypeScript", "Kotlin", "Java", "Swift"],
      icon: Code2,
      accent: "primary",
    },
    {
      titleKey: "tech.ai_title",
      subtitleKey: "tech.ai_subtitle",
      items: ["Ollama", "Open Code", "LLMs locales"],
      icon: Brain,
      accent: "accent",
    },
    {
      titleKey: "tech.mobile_title",
      subtitleKey: "tech.mobile_subtitle",
      items: ["Jetpack Compose", "SwiftUI", "MVVM"],
      icon: Smartphone,
      accent: "glow",
    },
    {
      titleKey: "tech.frontend_title",
      subtitleKey: "tech.frontend_subtitle",
      items: ["Angular", "React"],
      icon: Layers,
      accent: "primary",
    },
    {
      titleKey: "tech.databases_title",
      subtitleKey: "tech.databases_subtitle",
      items: ["PostgreSQL", "SQLite", "MySQL", "MongoDB"],
      icon: Database,
      accent: "glow",
    },
  ];

  return (
    <SectionContainer maxWidth="lg" id={id} innerRef={innerRef} motionStyle={motionStyle} padding="py-0">
      <div className="flex h-full min-h-[calc(100vh)] flex-col justify-center">
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

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8"
        >
          {bento.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.titleKey}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.96 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="flex items-center gap-2 rounded-xl glass px-3 py-2"
              >
                <Icon className={`h-4 w-4 ${accentMap[item.accent || "primary"]}`} />
                <span className="text-xs font-medium text-foreground">{t(item.titleKey)}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionContainer>
  );
};
