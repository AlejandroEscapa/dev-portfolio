import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const linksConfig = [
  { labelKey: "nav.about", href: "#about" },
  { labelKey: "nav.projects", href: "#projects" },
  { labelKey: "nav.experience", href: "#trayectoria" },
  { labelKey: "nav.education", href: "#education" },
  { labelKey: "nav.profile", href: "#profile" },
];

export const Nav = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const allSections = ["hero", ...linksConfig.map((l) => l.href.slice(1))];

    const computeThreshold = () => {
      const profileEl = document.getElementById("profile");
      if (!profileEl) return 500;
      return profileEl.getBoundingClientRect().top + window.scrollY - 100;
    };

    let threshold = computeThreshold();

    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 40);

      setVisible(scrollY >= threshold);

      const viewportCenter = window.innerHeight / 2;
      let closestSection = "hero";
      let closestDistance = Infinity;

      for (const id of allSections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = id;
        }
      }

      setActiveSection(closestSection);
    };

    const onResize = () => {
      threshold = computeThreshold();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 60;
      const rect = el.getBoundingClientRect();
      const targetScrollY = window.scrollY + rect.top - navHeight;
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-200 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full pointer-events-none"
      }`}
    >
      <div
        className={`flex items-center justify-center px-5 py-3 transition-all duration-200 ease-out border-b border-neutral-tint/[0.06] ${
          scrolled
            ? "bg-background/60 backdrop-blur-xl"
            : "bg-background/30 backdrop-blur-md"
        }`}
      >
        <div className="hidden items-center gap-1 sm:flex">
          {linksConfig.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                activeSection === l.href.slice(1)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(l.labelKey)}
            </a>
          ))}
          <kbd className="ml-1 hidden items-center gap-0.5 rounded border border-neutral-tint/10 bg-neutral-tint/5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground md:inline-flex">⌘K</kbd>
        </div>
      </div>
    </nav>
  );
};
