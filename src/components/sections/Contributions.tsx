import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { Reveal } from "@/components/fx/Reveal";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { contributions, type Contribution } from "@/data/contributions";

interface ContributionsProps {
  motionStyle?: MotionStyle;
}

// Las tres líneas de la war story, en el orden del brief: problema → hilo →
// resolución. Label mono uppercase + cuerpo muted debajo.
const storyParts = (c: Contribution) => [
  { labelKey: "contributions.story_problema", textKey: c.storyKeys.problema },
  { labelKey: "contributions.story_hilo", textKey: c.storyKeys.hilo },
  { labelKey: "contributions.story_resolucion", textKey: c.storyKeys.resolucion },
];

const ContributionRow = ({ c, open, onToggle }: { c: Contribution; open: boolean; onToggle: () => void }) => {
  const { t } = useLanguage();
  return (
    <li className="border-t border-neutral-tint/10 last:border-b last:border-neutral-tint/10">
      {/* Botón-fila: la cabecera del commit es toda el área clicable; la story
          expandida vive FUERA del botón. Con una única fila abierta a la vez
          (accordion), aria-expanded marca la fila sobre la que se lee. */}
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="group w-full cursor-pointer py-5 text-left"
      >
        {/* Línea 1: hash mono en --primary + type tag + empresa; el período
            queda a la derecha con ml-auto, como en git log --pretty. La
            animación nunca toca el layout: sólo color al hover. */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-sm text-primary">{c.hash}</span>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
            {c.type}
          </span>
          <span className="font-mono text-sm text-muted-foreground transition-colors group-hover:text-foreground">
            {t(c.companyKey)}
          </span>
          <span className="ml-auto font-mono text-xs text-muted-foreground/70">
            {t(c.period)}
          </span>
        </div>
        {/* Línea 2: el resumen del commit en color cuerpo. */}
        <p className="mt-1.5 text-sm text-foreground/90">
          {t(c.titleKey)}
        </p>
        {/* Stack como índice mono separado por hairlines: mismo patrón de
            separador que usan las fichas de Education. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          {c.stack.map((item, i) => (
            <span key={item} className="flex items-center gap-3">
              {i > 0 && <span className="h-3 w-px bg-neutral-tint/15" aria-hidden="true" />}
              <span className="font-mono text-caption text-muted-foreground">
                {item}
              </span>
            </span>
          ))}
        </div>
      </button>
      {/* Expansión: la war story en tres líneas etiquetadas. Accordion sobrio —
          altura y opacidad only, EASE_OUT_EXPO; con reduce-motion dura 0 y el
          contenido aparece/desaparece sin transición. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="story"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { height: { duration: 0.32, ease: EASE_OUT_EXPO }, opacity: { duration: 0.2 } }
            }
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-tint/10 pb-5 pt-4">
              {storyParts(c).map((part) => (
                <div key={part.labelKey} className="mt-2 first:mt-0">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t(part.labelKey)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(part.textKey)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export const Contributions = ({ motionStyle }: ContributionsProps) => {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <SectionContainer maxWidth="md" motionStyle={motionStyle}>
      {/* Header del ledger: sólo eyebrow + label — un git log no lleva display
          heading; la jerarquía la llevan las filas. */}
      <RevealStagger className="mb-2">
        <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("contributions.section_label")}</span>
        </Reveal>
      </RevealStagger>

      {/* Accordion: una sola fila abierta; click en la fila abierta la cierra.
          Con reduce-motion el cambio de estado es inmediato y sin transición. */}
      <ul>
        {contributions.map((c) => {
          const open = openId === c.id;
          return (
            <ContributionRow
              key={c.id}
              c={c}
              open={open}
              onToggle={() => setOpenId(openId === c.id ? null : c.id)}
            />
          );
        })}
      </ul>
    </SectionContainer>
  );
};
