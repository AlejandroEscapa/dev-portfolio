import { Reveal } from "@/components/fx/Reveal";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";

export const AIWorkbench = () => {
  const { t } = useLanguage();

  return (
    // Anchor owned by the sheet section in Index.tsx (id="ai-workbench");
    // inner content carries no id to avoid duplicate anchors.
    <SectionContainer maxWidth="md" className="px-6 md:px-8 lg:px-10">
      <RevealStagger className="mb-6">
        <Reveal variant="fadeUpSm" className="mb-3 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("workbench.section_label")}</span>
        </Reveal>
        <Reveal variant="fadeUp">
          <h2 className="text-h1 font-bold leading-tight tracking-heading">
            {t("workbench.heading")}
          </h2>
        </Reveal>
        <Reveal variant="fadeUpSm" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("workbench.subheading")}
        </Reveal>
      </RevealStagger>

      <RevealStagger className="grid gap-5 border-y border-neutral-tint/10 py-5 md:grid-cols-2 md:gap-8">
        <Reveal variant="fadeUp">
          <h3 className="font-mono text-label uppercase tracking-label text-primary">
            {t("workbench.tools_label")}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("workbench.tools_body")}
          </p>
        </Reveal>
        <Reveal variant="fadeUp">
          <h3 className="font-mono text-label uppercase tracking-label text-primary">
            {t("workbench.review_label")}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("workbench.review_body")}
          </p>
        </Reveal>
      </RevealStagger>
    </SectionContainer>
  );
};
