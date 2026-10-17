import type { MotionStyle } from "framer-motion";
import { Reveal } from "@/components/fx/Reveal";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";
import { stats, statBar } from "@/data/stats";

interface StatsProps {
  motionStyle?: MotionStyle;
}

export const Stats = ({ motionStyle }: StatsProps) => {
  const { t } = useLanguage();

  return (
    // F2a tira teñida sin glass; F1.5 sin min-h sistemático en bloque CV.
    <SectionContainer maxWidth="md" motionStyle={motionStyle}>
      {/* Misma receta de cabecera que el resto de secciones: label numerada
          + display heading + sub. El panel sigue subordinado debajo. */}
      <RevealStagger className="mb-8">
        <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("stats.section_label")}</span>
        </Reveal>
        <Reveal variant="fadeUp">
          <h2 className="text-h1 font-bold leading-tight tracking-heading">
            {t("stats.heading")}
          </h2>
        </Reveal>
        <Reveal variant="fadeUpSm" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("stats.subheading")}
        </Reveal>
      </RevealStagger>

      <Reveal variant="fadeUp" className="rounded-lg border border-primary/20 bg-primary/[0.06] p-4 md:p-5">
        {/* Panel único: label mono + barra ASCII en <code> + caption muted.
            Sin tracks CSS: la barra es texto que hereda --font-mono. */}
        <ul className="space-y-3">
          {stats.map((r) => (
            <li key={r.id}>
              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-label uppercase tracking-label text-muted-foreground">
                  {t(`stats.${r.id}_label`)}
                </p>
                <code
                  className="font-mono text-sm text-primary"
                  aria-label={`${r.value} / ${r.max}`}
                >
                  {statBar(r.value, r.max)}
                </code>
                <p className="font-mono text-caption text-muted-foreground/70">
                  {t(r.captionKey)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionContainer>
  );
};
