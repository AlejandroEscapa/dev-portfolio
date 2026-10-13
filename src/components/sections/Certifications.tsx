import type { MotionStyle } from "framer-motion";
import { ExternalLink, ImagePlus } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";
import { certifications } from "@/data/certifications";

interface CertificationsProps {
  motionStyle?: MotionStyle;
}

export const Certifications = ({ motionStyle }: CertificationsProps) => {
  const { t } = useLanguage();

  return (
    // F1.5 sin min-h sistemático en bloque CV.
    <SectionContainer maxWidth="md" motionStyle={motionStyle}>
      {/* Header espejo de Education: eyebrow con hairline y display heading. */}
      <RevealStagger className="mb-8">
        <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("certifications.section_label")}</span>
        </Reveal>
        <Reveal variant="fadeUp">
          <h2 className="text-h1 font-bold leading-tight tracking-heading">
            {t("certifications.heading_before")} {t("certifications.heading_after")}
          </h2>
        </Reveal>
        <Reveal variant="fadeUpSm" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("certifications.subheading")}
        </Reveal>
      </RevealStagger>

      {/* F2a bento 2+1: rompe el grid-3 gemelo. Fila 1: elev8 (span 2) + big_school;
          fila 2: ibm + slot estable. El slot conserva caja aspect-video para 2b. */}
      <RevealStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((c) => (
          <Reveal
            key={c.id}
            variant="fadeUp"
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
            }}
            className={`specular group relative flex flex-col overflow-hidden rounded-lg glass p-8 hover-glow${c.id === "elev8" ? " lg:col-span-2" : ""}`}
          >
            {/* Eyebrow editorial: hairline con acento + emisor en mono. */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-accent to-transparent" />
              <p className="font-mono text-label uppercase tracking-label text-muted-foreground">
                {c.issuer}
              </p>
            </div>
            <h3 className="mt-4 font-sans text-h3 font-semibold tracking-tight text-foreground">
              {t(c.titleKey)}
            </h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground/70">{c.date}</p>

            {c.validUntil && (
              // t no interpola: el template "{year}" se resuelve aquí con el año literal.
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                {t("certifications.valid_until").replace("{year}", c.validUntil)}
              </p>
            )}

            {c.credentialId && (
              <p className="mt-3 text-[10px] text-muted-foreground/60">
                {t("education.credential_label")}:{" "}
                <span className="font-mono break-all">{c.credentialId}</span>
              </p>
            )}

            {/* Enlace verificable pegado al pie de la tarjeta. */}
            <div className="mt-auto pt-5">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-caption text-muted-foreground transition-colors hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                {t("certifications.show_credential")}
                <span className="sr-only">: {t(c.titleKey)}</span>
              </a>
            </div>
          </Reveal>
        ))}
        {/* TODO(2b): slot foto-futura. Misma caja aspect-video; hoy badges, mañana
            img object-cover 1:1 (setup/kiosco/PDA). Mapping pexels reservado en
            manifiesto, sin <img> ni peso nuevo en 2a. */}
        <Reveal
          variant="fadeUp"
          data-slot="foto-futura"
          className="group relative flex flex-col overflow-hidden rounded-lg border border-neutral-tint/10 bg-neutral-tint/[0.03] p-8 md:col-span-2 lg:col-span-2"
        >
          <div className="flex aspect-video flex-col justify-between">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
              <p className="font-mono text-label uppercase tracking-label text-muted-foreground">
                demo / badges hoy
              </p>
              <ImagePlus className="ml-auto h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent"
                >
                  {c.issuer}
                </span>
              ))}
              <span className="rounded-full border border-neutral-tint/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                3 verificables
              </span>
            </div>
          </div>
        </Reveal>
      </RevealStagger>
    </SectionContainer>
  );
};
