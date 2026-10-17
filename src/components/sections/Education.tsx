import type { MotionStyle } from "framer-motion";
import { Reveal } from "@/components/fx/Reveal";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";
import { useSpecular } from "@/hooks/useSpecular";


interface EducationProps {
  motionStyle?: MotionStyle;
}

export const Education = ({ motionStyle }: EducationProps) => {
  const { t } = useLanguage();
  // Un handler para las dos tarjetas: escribe --mx/--my una vez por frame.
  const specular = useSpecular();
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
  ];

  return (
    // F1.5 sin min-h sistemático en bloque CV.
    <SectionContainer maxWidth="md" motionStyle={motionStyle}>
      {/* Reveal moment 1 — the section header: one whileInView, staggered children. */}
      <RevealStagger className="mb-8">
        <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("education.section_label")}</span>
        </Reveal>
        <Reveal variant="fadeUp">
          <h2 className="text-h1 font-bold leading-tight tracking-heading">
            {t("education.heading_before")} {t("education.heading_after")}
          </h2>
        </Reveal>
        {/* Same heading→sub coupling as Projects/About: mt-2 under the
            leading-tight display heading (~15px real gap). */}
        <Reveal variant="fadeUpSm" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("education.subheading")}
        </Reveal>
      </RevealStagger>

      {/* Reveal moment 2 — the card grid cascades from one parent. */}
      <RevealStagger className="grid gap-6 md:grid-cols-2">
          {items.map((it) => {
            return (
              <Reveal
                key={it.institution}
                variant="fadeUp"
                onPointerMove={specular.onPointerMove}
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
                <h3 className="mt-4 font-sans text-h3 font-semibold tracking-tight text-foreground">
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
                </div>
              </Reveal>
            );
          })}
      </RevealStagger>
    </SectionContainer>
  );
};
