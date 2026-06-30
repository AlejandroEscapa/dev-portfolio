import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Code2, Brain, Database, Smartphone, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";
import { Scene } from "@/components/three/Scene";
import { TechStack3D } from "@/components/three/TechStack3D";

interface TechStackProps {
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

const SECTION_ID = "stack";

interface BentoItem {
  titleKey: string;
  subtitleKey: string;
  items: string[];
  icon: LucideIcon;
  className: string;
  accent?: "primary" | "accent" | "glow";
}

const accentMap = {
  primary: "text-primary",
  accent: "text-accent",
  glow: "text-primary-glow",
};

export const TechStack = ({ id = SECTION_ID, innerRef, motionStyle }: TechStackProps) => {
  const { t } = useLanguage();

  const bento: BentoItem[] = [
    {
      titleKey: "tech.languages_title",
      subtitleKey: "tech.languages_subtitle",
      items: ["TypeScript", "Kotlin", "Java", "Swift"],
      icon: Code2,
      className: "col-span-1 lg:col-span-1",
      accent: "primary",
    },
    {
      titleKey: "tech.ai_title",
      subtitleKey: "tech.ai_subtitle",
      items: ["Ollama", "Open Code", "LLMs locales"],
      icon: Brain,
      className: "col-span-1 lg:col-span-1",
      accent: "accent",
    },
    {
      titleKey: "tech.mobile_title",
      subtitleKey: "tech.mobile_subtitle",
      items: ["Jetpack Compose", "SwiftUI", "MVVM"],
      icon: Smartphone,
      className: "col-span-1 lg:col-span-1",
      accent: "glow",
    },
    {
      titleKey: "tech.frontend_title",
      subtitleKey: "tech.frontend_subtitle",
      items: ["Angular", "React"],
      icon: Layers,
      className: "col-span-1 lg:col-span-1",
      accent: "primary",
    },
    {
      titleKey: "tech.databases_title",
      subtitleKey: "tech.databases_subtitle",
      items: ["PostgreSQL", "SQLite", "MySQL", "MongoDB"],
      icon: Database,
      className: "col-span-1 lg:col-span-1",
      accent: "glow",
    },
  ];

  return (
    <SectionContainer maxWidth="lg" id={id} innerRef={innerRef} motionStyle={motionStyle}>
      <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <span>{t("tech.section_label")}</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            <span className="text-gradient">{t("tech.heading_before")}</span>{" "}
            <span className="text-gradient-primary">{t("tech.heading_after")}</span>
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t("tech.subheading")}
          </p>
        </motion.div>

        <div className="relative h-[400px] w-full rounded-3xl overflow-hidden glass">
          <Scene className="absolute inset-0" camera={{ position: [0, 0, 8], fov: 60 }}>
            <TechStack3D />
          </Scene>
        </div>

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
    </SectionContainer>
  );
};
