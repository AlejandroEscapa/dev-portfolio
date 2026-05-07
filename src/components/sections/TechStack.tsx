import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Code2, Brain, Database, Smartphone, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";

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
      className: "col-span-2 lg:col-span-2",
      accent: "primary",
    },
    {
      titleKey: "tech.ai_title",
      subtitleKey: "tech.ai_subtitle",
      items: ["Ollama", "Open Code", "LLMs locales"],
      icon: Brain,
      className: "col-span-2 lg:col-span-2",
      accent: "accent",
    },
    {
      titleKey: "tech.mobile_title",
      subtitleKey: "tech.mobile_subtitle",
      items: ["Jetpack Compose", "SwiftUI", "MVVM"],
      icon: Smartphone,
      className: "col-span-2 lg:col-span-2",
      accent: "glow",
    },
    {
      titleKey: "tech.frontend_title",
      subtitleKey: "tech.frontend_subtitle",
      items: ["Angular", "React"],
      icon: Layers,
      className: "col-span-2 lg:col-span-3",
      accent: "primary",
    },
    {
      titleKey: "tech.databases_title",
      subtitleKey: "tech.databases_subtitle",
      items: ["PostgreSQL", "SQLite", "MySQL", "MongoDB"],
      icon: Database,
      className: "col-span-2 lg:col-span-3",
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

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-2 min-h-[140px] gap-4 sm:gap-5 lg:grid-cols-6"
        >
          {bento.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.titleKey}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.96 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`group relative overflow-hidden rounded-3xl glass p-5 hover-glow ${item.className}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl glass ${accentMap[item.accent || "primary"]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t(item.subtitleKey)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                    {t(item.titleKey)}
                  </h3>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {item.items.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground transition-colors group-hover:border-white/20 group-hover:text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
    </SectionContainer>
  );
};
