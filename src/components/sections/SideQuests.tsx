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
    <SectionContainer maxWidth="md" motionStyle={motionStyle} className="min-h-[65vh]">
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

      {/* Cero animaciones en loop: solo entradas whileInView, una vez. */}
      <RevealStagger className="grid gap-6 md:grid-cols-3">
        {sidequests.map((s) => {
          const Icon = iconMap[s.icon];
          return (
            <Reveal
              key={s.id}
              variant="fadeUp"
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
              }}
              className="specular group relative flex flex-col overflow-hidden rounded-lg glass p-8 hover-glow"
            >
              {/* Icono discreto: pequeño y en muted, sin decorarlo más. */}
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="text-h3 font-semibold tracking-tight text-foreground">
                  {t(s.title)}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(s.bodyKey)}
              </p>

              {/* Transferencia: línea mono con prefijo flecha. */}
              <div className="mt-auto pt-5 border-t border-neutral-tint/10">
                <p className="font-mono text-caption text-muted-foreground">
                  <span aria-hidden="true">→ </span>
                  {t(s.transferKey)}
                </p>
              </div>
            </Reveal>
          );
        })}
      </RevealStagger>
    </SectionContainer>
  );
};
