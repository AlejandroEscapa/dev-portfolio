import { Fragment } from "react";

import { useLanguage } from "@/context/LanguageContext";
import { portfolioConfig } from "@/lib/config";
import { GitHubSvg, LinkedInSvg } from "@/components/brand-icons";

/* Site footer: quiet, centered strip carrying the contact data that the
   Contact window no longer holds — location, direct email/phone links and
   the social marks. Same hairline + mono language as the rest of the page;
   no window chrome, so the page ends on a calm base under the last window. */
export function Footer() {
  const { t } = useLanguage();

  const dataRow: Array<{
    key: string;
    text: string;
    href?: string;
    aria?: string;
  }> = [
    { key: "location", text: t("contact.location_value") },
    {
      key: "email",
      text: portfolioConfig.email,
      href: `mailto:${portfolioConfig.email}`,
      aria: t("aria.email"),
    },
    {
      key: "phone",
      text: portfolioConfig.phone,
      href: `tel:${portfolioConfig.phone}`,
      aria: t("aria.phone"),
    },
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

  return (
    <footer className="section-y pb-2">
      <div className="flex flex-col items-center gap-5 border-t border-neutral-tint/10 pt-8 pb-4">
        {/* Data row: location + direct channels, hairline-separated
            (the same per-item separator pattern the Education cards use) */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs sm:text-sm text-muted-foreground">
          {dataRow.map((item, i) => (
            <Fragment key={item.key}>
              {i > 0 && <span className="h-3 w-px bg-neutral-tint/15" aria-hidden="true" />}
              {item.href ? (
                <a
                  href={item.href}
                  aria-label={item.aria}
                  className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0"
                >
                  {item.text}
                </a>
              ) : (
                <span>{item.text}</span>
              )}
            </Fragment>
          ))}
        </div>

        {/* Social marks — same hover treatment the Contact icons had */}
        <div className="flex items-center gap-5">
          {socials.map(({ key, href, Icon, aria }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={aria}
              className="inline-flex items-center justify-center text-muted-foreground transition-all duration-200 hover:text-primary hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0 [&_svg]:h-6 [&_svg]:w-6"
            >
              <Icon />
            </a>
          ))}
        </div>

        <p className="text-xs sm:text-[11px] font-medium leading-none text-muted-foreground/90">
          {t("contact.signature")}
        </p>
      </div>
    </footer>
  );
}
