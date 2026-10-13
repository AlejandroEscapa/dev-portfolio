import type { MotionStyle } from "framer-motion";
import { ExternalLink } from "lucide-react";
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
    <SectionContainer maxWidth="md" motionStyle={motionStyle} className="min-h-[65vh]">
      {/* Header espejo de Education: eyebrow con hairline y display heading. */}
      <RevealStagger className="mb-8">
        <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("certifications.section_label")}</span>
        </Reveal>
        <Reveal variant="fadeUp" className="text-h1 font-bold leading-tight tracking-heading">
          {t("certifications.heading_before")} {t("certifications.heading_after")}
        </Reveal>
        <Reveal variant="fadeUpSm" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("certifications.subheading")}
        </Reveal>
      </RevealStagger>

      {/* Grid 3 en desktop, columna única en móvil (mismo escalado que Education). */}
      <RevealStagger className="grid gap-6 md:grid-cols-3">
        {certifications.map((c) => (
          <Reveal
            key={c.id}
            variant="fadeUp"
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
            }}
            className="specular group relative flex flex-col overflow-hidden rounded-lg glass p-8 hover-glow"
          >
            {/* Eyebrow editorial: hairline con acento + emisor en mono. */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-accent to-transparent" />
              <p className="font-mono text-label uppercase tracking-label text-muted-foreground">
                {c.issuer}
              </p>
            </div>
            <h3 className="mt-4 text-h3 font-semibold tracking-tight text-foreground">
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
      </RevealStagger>
    </SectionContainer>
  );
};
