import { motion, useReducedMotion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { GraduationCap, BadgeCheck, School, ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";
import { fadeUp, fadeUpSm, stagger } from "@/lib/motion";

interface EducationProps {
  motionStyle?: MotionStyle;
}

export const Education = ({ motionStyle }: EducationProps) => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const items = [
    {
      icon: GraduationCap,
      institution: "Tokio School",
      titleKey: "education.tokio_title",
      descriptionKey: "education.tokio_description",
      locationKey: "education.tokio_location",
      periodKey: "education.tokio_period",
      tags: ["Android Native", "iOS", "Compose", "Swift"],
      accent: "from-primary to-primary-glow",
      glow: "bg-primary/20",
    },
    {
      icon: School,
      institution: "IES San Andr\u00e9s",
      titleKey: "education.sanandres_title",
      descriptionKey: "education.sanandres_description",
      locationKey: "education.sanandres_location",
      periodKey: "education.sanandres_period",
      tags: ["Java", "Kotlin", "SQL", "Spring"],
      accent: "from-accent to-primary",
      glow: "bg-accent/20",
    },
    {
      icon: BadgeCheck,
      institution: "IBM",
      titleKey: "education.ibm_title",
      locationKey: "education.ibm_location",
      periodKey: "education.ibm_period",
      credential: "1965d5c5-2593-47ca-bed5-a5190bfa7667",
      accent: "from-primary-glow to-accent",
      glow: "bg-primary-glow/25",
    },
  ];

  return (
    <SectionContainer maxWidth="lg" motionStyle={motionStyle}>
      {/* Reveal moment 1 — the section header: one whileInView, staggered children. */}
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger()}
        className="mb-8"
      >
        <motion.div
          variants={fadeUpSm}
          className="mb-4 flex items-center gap-3 text-sm uppercase tracking-label text-muted-foreground"
        >
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("education.section_label")}</span>
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-h1 font-bold tracking-heading">
          {t("education.heading_before")} {t("education.heading_after")}
        </motion.h2>
      </motion.div>

      {/* Reveal moment 2 — the card grid cascades from one parent. */}
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger()}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.institution}
                variants={fadeUp}
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
                }}
                className="specular group relative overflow-hidden rounded-lg glass p-8 hover-glow"
              >
                <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${it.glow}`} />
                <div className="relative">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${it.accent}`}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="mt-6 text-xs uppercase tracking-label text-muted-foreground">
                    {t(it.periodKey)}
                  </p>
                  <h3 className="mt-2 text-h3 font-semibold tracking-tight text-foreground">
                    {it.institution}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(it.titleKey)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {t(it.locationKey)}
                  </p>

                  {it.descriptionKey && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {t(it.descriptionKey)}
                    </p>
                  )}

                  {it.tags && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {it.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-neutral-tint/10 px-3 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {it.credential && (
                    <>
                      <div className="mt-6 rounded-lg border border-neutral-tint/10 bg-neutral-scrim/30 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {t("education.credential_label")}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-foreground">
                          {it.credential}
                        </p>
                      </div>
                      <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent transition-colors group-hover:text-primary-glow">
                        <ExternalLink className="h-3 w-3" />
                        {t("education.verifiable")}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
      </motion.div>
    </SectionContainer>
  );
};
