import { type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";

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

/* Simple Icons SVGs — official brand paths from simpleicons.org */
const LinkedInSvg = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
    <title>LinkedIn</title>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubSvg = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
    <title>GitHub</title>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const PhoneSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailSvg = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
    <title>Gmail</title>
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
  </svg>
);

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative flex h-full items-center px-4"
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
