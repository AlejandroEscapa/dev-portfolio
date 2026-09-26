import { motion, useReducedMotion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { ExternalLink } from "lucide-react";
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
      institution: "Tokio School",
      titleKey: "education.tokio_title",
      descriptionKey: "education.tokio_description",
      locationKey: "education.tokio_location",
      periodKey: "education.tokio_period",
      tags: ["Android Native", "iOS", "Compose", "Swift"],
      accent: "from-primary",
    },
    {
      institution: "IES San Andr\u00e9s",
      titleKey: "education.sanandres_title",
      descriptionKey: "education.sanandres_description",
      locationKey: "education.sanandres_location",
      periodKey: "education.sanandres_period",
      tags: ["Java", "Kotlin", "SQL", "Spring"],
      accent: "from-accent",
    },
    {
      institution: "IBM",
      titleKey: "education.ibm_title",
      locationKey: "education.ibm_location",
      periodKey: "education.ibm_period",
      credential: "1965d5c5-2593-47ca-bed5-a5190bfa7667",
      accent: "from-primary-glow",
    },
  ];

  return (
    <SectionContainer maxWidth="lg" motionStyle={motionStyle} className="min-h-[78vh]">
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
            return (
              <motion.div
                key={it.institution}
                variants={fadeUp}
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
                }}
                className="specular group relative flex flex-col overflow-hidden rounded-lg glass p-8 hover-glow"
              >
                {/* Editorial eyebrow: a single accent hairline + the period in
                    mono. No icon square — the hierarchy is typographic. */}
                <div className="flex items-center gap-3">
                  <span className={`h-px w-8 bg-gradient-to-r ${it.accent} to-transparent`} />
                  <p className="font-mono text-label uppercase tracking-label text-muted-foreground">
                    {t(it.periodKey)}
                  </p>
                </div>
                <h3 className="mt-4 text-h3 font-semibold tracking-tight text-foreground">
                  {it.institution}
                </h3>
                <p className="mt-1.5 text-sm text-foreground/80">
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

                {/* Footer rides the card bottom so the three cards share one
                    baseline: tags as mono index items, credential as fine print. */}
                <div className="mt-auto pt-5">
                  {it.tags && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-neutral-tint/10 pt-4">
                      {it.tags.map((tag, i) => (
                        <span key={tag} className="flex items-center gap-3">
                          {i > 0 && <span className="h-3 w-px bg-neutral-tint/15" aria-hidden="true" />}
                          <span className="font-mono text-caption text-muted-foreground">
                            {tag}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                  {it.credential && (
                    <div className="border-t border-neutral-tint/10 pt-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("education.credential_label")}
                      </p>
                      <p className="mt-1 break-all font-mono text-caption text-foreground/80">
                        {it.credential}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent transition-colors group-hover:text-primary-glow">
                        <ExternalLink className="h-3 w-3" />
                        {t("education.verifiable")}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
      </motion.div>
    </SectionContainer>
  );
};
