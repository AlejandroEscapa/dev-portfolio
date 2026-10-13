import type { ComponentType } from "react";
import type { MotionStyle } from "framer-motion";
import { AudioWaveform, Disc3, Gamepad2 } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";
import { sidequests } from "@/data/sidequests";

interface SideQuestsProps {
  motionStyle?: MotionStyle;
}

// Los glyphs llegan por nombre desde el data file; el mapa mantiene la
// conversión en un solo sitio y evita JSX por id en el render.
const iconMap: Record<(typeof sidequests)[number]["icon"], ComponentType<{ className?: string }>> = {
  Disc3,
  AudioWaveform,
  Gamepad2,
};

export const SideQuests = ({ motionStyle }: SideQuestsProps) => {
  const { t } = useLanguage();

  return (
    // F1.5 sin min-h sistemático en bloque CV; F1.4 banda una frase sin body.
    <SectionContainer maxWidth="md" motionStyle={motionStyle}>
      {/* Header sobrio: eyebrow + display heading, sin decoración de más. */}
      <RevealStagger className="mb-8">
        <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("sidequests.section_label")}</span>
        </Reveal>
        <Reveal variant="fadeUp" className="text-h1 font-bold leading-tight tracking-heading">
          {t("sidequests.heading")}
        </Reveal>
        <Reveal variant="fadeUpSm" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("sidequests.subheading")}
        </Reveal>
      </RevealStagger>

      {/* F1.4 banda de una frase: icono + título + transferencia, sin body. */}
      <RevealStagger className="border-y border-neutral-tint/10 divide-y divide-neutral-tint/10">
        <ul>
          {sidequests.map((s) => {
            const Icon = iconMap[s.icon];
            return (
              <li key={s.id}>
                <Reveal variant="fadeUp" className="flex items-baseline gap-3 py-3">
                  <Icon className="h-4 w-4 shrink-0 translate-y-0.5 text-muted-foreground" aria-hidden="true" />
                  <h3 className="shrink-0 text-sm font-semibold tracking-tight text-foreground">
                    {t(s.title)}
                  </h3>
                  <p className="ml-auto text-right font-mono text-caption text-muted-foreground">
                    <span aria-hidden="true">→ </span>
                    {t(s.transferKey)}
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </RevealStagger>
    </SectionContainer>
  );
};
