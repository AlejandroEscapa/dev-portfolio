import { useLanguage } from "@/context/LanguageContext";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      // Horizontal padding comes from the outer .section-px wrapper in
      // HeroShowcase / Index — do NOT add px-* here (would stack).
      // No id here: the WindowChrome wrapper in Index owns the "hero" anchor.
      className="relative flex h-full items-center pl-4 md:pl-8"
    >
      <div className="relative z-10 w-full max-w-2xl space-y-10">
        <h1 className="text-5xl font-bold leading-[0.95] sm:text-6xl md:text-7xl">
          <span className="block text-gradient">Alejandro</span>
          <span className="block text-gradient-primary">Olivares Escapa</span>
        </h1>

        {/* Professional summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
            <span>{t("hero.description_label")}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("hero.description")}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-tint/10 bg-neutral-tint/[0.03] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-neutral-tint/[0.06] hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            {t("hero.cta_projects")}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-tint/10 bg-neutral-tint/[0.03] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:bg-neutral-tint/[0.06] hover:shadow-[0_0_20px_hsl(var(--accent)/0.15)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {t("hero.cta_contact")}
          </a>
        </div>
      </div>
    </section>
  );
};
