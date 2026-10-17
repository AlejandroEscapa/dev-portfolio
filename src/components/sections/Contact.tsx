import { lazy, Suspense } from "react";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { Reveal } from "@/components/fx/Reveal";

import { useLanguage } from "@/context/LanguageContext";

// El formulario (react-hook-form + zod) va en su propio chunk: está al final
// de la página y es un lanzador `mailto:`, así que no tiene por qué ejecutarse
// antes de pintar nada (auditoría de rendimiento 2026-10-17).
const ContactForm = lazy(() =>
  import("./contact/ContactForm").then((m) => ({ default: m.ContactForm })),
);

/**
 * Placeholder con la geometría EXACTA del formulario real (inputs h-11,
 * textarea min-h-[80px], mismo grid y mismo padding): el hueco que deja
 * mientras carga el chunk mide lo mismo, así que no hay salto de layout.
 */
function ContactFormSkeleton() {
  return (
    <div className="grid gap-5 p-6 md:p-8" aria-hidden="true">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="h-11 rounded-md border border-neutral-tint/10" />
        <div className="h-11 rounded-md border border-neutral-tint/10" />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-[1fr_auto]">
        <div className="min-h-[80px] rounded-md border border-neutral-tint/10" />
        <div className="min-h-[80px] w-full rounded-lg border border-neutral-tint/10 sm:w-44" />
      </div>
    </div>
  );
}

export const Contact = () => {
  const { t } = useLanguage();

  return (
    /* The section keeps its asymmetric vertical padding so the two-column
       composition sits centred inside the window; data + socials + signature
       live in the site footer (src/components/Footer.tsx). */
    <section className="relative min-h-[60vh] flex flex-col pt-7 md:pt-10 pb-4 px-6 md:px-8 lg:px-10">
      {/* The sheet section owns the entry; reveals only orchestrate its contents. */}
      {/* Same content inset as Projects/Education (container max-w-6xl):
          the window stays full-bleed, the content floats inside it. */}
      <div className="flex-1 flex flex-col container mx-auto max-w-6xl">
        <RevealStagger className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-12">
          {/* Left column — numbered label + title, vertically centred; the
              narrower column defers to the form */}
          <Reveal variant="fadeUpSm" className="flex flex-col justify-center">
            <div className="space-y-3">
              <div className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
                <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <span>{t("contact.section_label")}</span>
              </div>
              <h2 className="text-h1 font-bold tracking-heading leading-tight">
                {t("contact.heading")}
              </h2>

              {/* 2nd phrase — one step under the display heading so the
                  hierarchy heading > subhead > label stays readable */}
              <p className="text-base sm:text-lg md:text-xl leading-snug text-muted-foreground">
                {t("contact.heading_line1")} {t("contact.heading_line2")}
              </p>
            </div>
          </Reveal>

          {/* Right column — the form card takes the wider column (~55%)
              so it leads the composition */}
          <Reveal variant="fadeUpSm" className="flex flex-col justify-center">
            <div className="relative w-full rounded-lg glass border border-neutral-tint/[0.08] overflow-hidden transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5">
              {/* Primary accent border */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-primary"
              />
              <Suspense fallback={<ContactFormSkeleton />}>
                <ContactForm />
              </Suspense>
            </div>
          </Reveal>
        </RevealStagger>
      </div>
    </section>
  );
};
