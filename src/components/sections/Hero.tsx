import { type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LinkedInSvg, GitHubSvg, PhoneSvg, MailSvg } from "@/components/brand-icons";

interface IconCtaProps {
  href: string;
  label: string;
  external?: boolean;
  tone: "primary" | "accent" | "accentAlt";
  children: ReactNode;
  delay?: number;
}

const toneClasses: Record<IconCtaProps["tone"], { base: string; glow: string }> = {
  primary: {
    base: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-[0_0_40px_var(--shadow-glow)]",
    glow: "bg-gradient-to-r from-primary to-primary-glow",
  },
  accent: {
    base: "liquid-glass text-foreground hover:border-accent/50",
    glow: "bg-accent/30",
  },
  accentAlt: {
    base: "liquid-glass text-foreground hover:border-primary-glow/50",
    glow: "bg-primary-glow/30",
  },
};

function IconCta({ href, label, external, tone, children }: IconCtaProps) {
  const t = toneClasses[tone];
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={label}
      className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${t.base}`}
    >
      {children}
      <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-zinc-900/90 px-2 py-1 text-[10px] font-mono text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {label}
      </span>
      <span className={`absolute inset-0 -z-10 rounded-full ${t.glow} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80`} />
    </a>
  );
}

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      // Horizontal padding comes from the outer .section-px wrapper in
      // HeroShowcase / Index — do NOT add px-* here (would stack).
      className="relative flex h-full items-center"
    >
      <div className="relative z-10 w-full max-w-2xl space-y-10">
        {/* Banner pill */}
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-muted-foreground">
          <span className="h-3.5 w-3.5 text-accent">✦</span>
          <span>{t("hero.available")}</span>
        </div>

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
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.06] hover:shadow-[0_0_20px_hsl(248_90%_66%/0.15)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            {t("hero.cta_projects")}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.06] hover:shadow-[0_0_20px_hsl(190_95%_60%/0.15)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {t("hero.cta_contact")}
          </a>
        </div>

        {/* Brand icons — Simple Icons SVGs */}
        <div className="flex flex-wrap items-center gap-3">
          <IconCta
            href="https://www.linkedin.com/in/alejandro-olivares-escapa/"
            label="LinkedIn"
            external
            tone="primary"
          >
            <LinkedInSvg />
          </IconCta>
          <IconCta
            href="https://github.com/alejandrooliesc"
            label="GitHub"
            external
            tone="accent"
          >
            <GitHubSvg />
          </IconCta>
          <IconCta href="tel:+34601175067" label="Phone" tone="accentAlt">
            <PhoneSvg />
          </IconCta>
          <IconCta
            href="mailto:alejandro.oliesc97@gmail.com"
            label="Email"
            tone="accent"
          >
            <MailSvg />
          </IconCta>
        </div>
      </div>
    </section>
  );
};
