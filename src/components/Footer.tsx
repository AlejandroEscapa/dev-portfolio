import { Fragment } from "react";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { Reveal } from "@/components/fx/Reveal";

import { useLanguage } from "@/context/LanguageContext";
import { portfolioConfig } from "@/lib/config";
import { scrollToSection } from "@/lib/scroll";
import { GitHubSvg, LinkedInSvg } from "@/components/brand-icons";

/* Site footer: editorial three-column layout on the same hairline + mono
   language as the rest of the page — identity (name, role, location) left,
   quick section links center, direct email + the social marks right. No
   window chrome, so the page ends on a calm base: a bottom bar with the
   copyright and the site's single green availability dot. No phone anywhere
   (public surface, purged — email is the channel). */
export function Footer() {
  const { t } = useLanguage();

  // Quick links reuse the nav.* vocabulary (no duplicated label keys).
  const quickLinks: Array<{ id: string; label: string }> = [
    { id: "about", label: t("nav.about") },
    { id: "projects", label: t("nav.projects") },
    { id: "trayectoria", label: t("nav.experience") },
    { id: "contributions", label: t("nav.impact") },
    { id: "contact", label: t("nav.contact") },
  ];

  const socials = [
    {
      key: "linkedin",
      href: portfolioConfig.linkedin,
      Icon: LinkedInSvg,
      aria: t("aria.linkedin"),
    },
    {
      key: "github",
      href: portfolioConfig.github,
      Icon: GitHubSvg,
      aria: t("aria.github"),
    },
  ];

  const linkFocus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0";

  // Sin .section-y ni filete propio: el SectionDivider de Index es el único
  // separador de cierre y su margen marca el ritmo; el footer arranca justo
  // debajo. Evita la doble raya y el aire duplicado.
  return (
    <footer className="pb-2">
      <div className="pb-4">
        <RevealStagger className="grid gap-8 md:grid-cols-3">
          {/* Zone left: identity */}
          <Reveal variant="fadeUpSm" className="flex flex-col gap-1.5 font-mono text-xs sm:text-sm text-muted-foreground">
            <span className="text-sm sm:text-base font-medium text-foreground">{portfolioConfig.name}</span>
            <span>{t("about.role_value")}</span>
            <span>{t("contact.location_value")}</span>
          </Reveal>

          {/* Zone center: quick section links, hairline-separated monospace
              (the same per-item separator pattern the Education cards use) */}
          <Reveal variant="fadeUpSm" className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs sm:text-sm text-muted-foreground md:justify-center">
            {quickLinks.map(({ id, label }, i) => (
              <Fragment key={id}>
                {i > 0 && <span className="h-3 w-px bg-neutral-tint/15" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`transition-colors duration-200 hover:text-primary cursor-pointer ${linkFocus}`}
                >
                  {label}
                </button>
              </Fragment>
            ))}
          </Reveal>

          {/* Zone right: direct email + social marks — same hover treatment
              the Contact icons had */}
          <Reveal variant="fadeUpSm" className="flex flex-col items-start gap-3 md:items-end">
            <a
              href={`mailto:${portfolioConfig.email}`}
              aria-label={t("aria.email")}
              className={`font-mono text-xs sm:text-sm text-muted-foreground transition-colors duration-200 hover:text-primary ${linkFocus}`}
            >
              {portfolioConfig.email}
            </a>
            <div className="flex items-center gap-5">
              {socials.map(({ key, href, Icon, aria }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={aria}
                  className={`inline-flex items-center justify-center text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-110 [&_svg]:h-6 [&_svg]:w-6 ${linkFocus}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </Reveal>
        </RevealStagger>

        {/* Bottom bar: copyright + signature left, availability status right
            (the green dot is the site's single status dot) */}
        <Reveal variant="fadeUpSm" className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-neutral-tint/10 pt-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs sm:text-[11px] text-muted-foreground">
              &copy; 2026 Alejandro Olivares Escapa
            </span>
            <span className="text-xs sm:text-[11px] font-medium leading-none text-muted-foreground/90">
              {t("contact.signature")}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs sm:text-[11px] text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full bg-success"
              aria-hidden="true"
            />
            {t("footer.status")}
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
