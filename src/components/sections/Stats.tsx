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
    <SectionContainer maxWidth="md" motionStyle={motionStyle} className="min-h-[65vh]">
      {/* Eyebrow único: la ventana compacta no lleva display heading propio;
          el título de la ventana ya da la presentación. */}
      <RevealStagger className="mb-8">
        <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("stats.section_label")}</span>
        </Reveal>
      </RevealStagger>

      <Reveal variant="fadeUp" className="mx-auto max-w-4xl rounded-lg glass p-8 md:p-10">
        {/* Panel único: label mono + barra ASCII en <code> + caption muted.
            Sin tracks CSS: la barra es texto que hereda --font-mono. */}
        <ul className="space-y-6">
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
