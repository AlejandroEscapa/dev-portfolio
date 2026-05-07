import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Sparkles } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";

interface ExperienceProps {
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

const SECTION_ID = "experience";

interface ExperienceItem {
  company: string;
  roleKey: string;
  locationKey: string;
  periodKey: string;
  bulletKeys: string[];
  featured?: boolean;
}

const TimelineNode = ({ featured }: { featured?: boolean }) => (
  <div className="relative">
    <div
      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border ${
        featured
          ? "border-primary/60 bg-gradient-to-br from-primary to-primary-glow glow-primary"
          : "border-white/15 glass"
      }`}
    >
      {featured ? (
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      ) : (
        <Briefcase className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
    {featured && (
      <span className="absolute inset-0 -z-0 animate-pulse-glow rounded-full bg-primary/40 blur-xl" />
    )}
  </div>
);

export const Experience = ({ id = SECTION_ID, innerRef, motionStyle }: ExperienceProps) => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0, 0.9], ["0%", "100%"]);

  const experiences: ExperienceItem[] = [
    {
      company: "MAS Ingeniería",
      roleKey: "experience.mas_role",
      locationKey: "experience.mas_location",
      periodKey: "experience.mas_period",
      bulletKeys: ["experience.mas_bullet_1", "experience.mas_bullet_2", "experience.mas_bullet_3"],
      featured: true,
    },
    {
      company: "Leasba",
      roleKey: "experience.leasba_role",
      locationKey: "experience.leasba_location",
      periodKey: "experience.leasba_period",
      bulletKeys: ["experience.leasba_bullet_1", "experience.leasba_bullet_2"],
    },
  ];

  return (
    <SectionContainer maxWidth="lg" id={id} innerRef={innerRef} motionStyle={motionStyle}>
      <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <span>{t("experience.section_label")}</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            <span className="text-gradient">{t("experience.heading_before")}</span>{" "}
            <span className="text-gradient-accent">{t("experience.heading_after")}</span>
          </h2>
        </motion.div>

        <div ref={ref} className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-px bg-white/10 sm:left-6" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-5 top-2 w-px bg-gradient-to-b from-primary via-primary-glow to-accent sm:left-6"
          />

          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 pl-0 sm:gap-8"
              >
                <div className="flex-shrink-0">
                  <TimelineNode featured={exp.featured} />
                </div>

                <div
                  className={`flex-1 rounded-2xl glass p-6 transition-all duration-300 hover:border-white/20 ${
                    exp.featured ? "lg:p-10 glass-strong" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3
                      className={`font-semibold tracking-tight ${
                        exp.featured ? "text-2xl sm:text-3xl text-gradient-primary" : "text-xl text-foreground"
                      }`}
                    >
                      {exp.company}
                    </h3>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t(exp.periodKey)}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm font-medium ${exp.featured ? "text-accent" : "text-primary"}`}>
                    {t(exp.roleKey)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t(exp.locationKey)}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {exp.bulletKeys.map((key) => (
                      <li key={key} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
    </SectionContainer>
  );
};
