import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const linksConfig = [
  { labelKey: "nav.about", href: "#about" },
  { labelKey: "nav.profile", href: "#profile" },
  { labelKey: "nav.techStack", href: "#stack" },
  { labelKey: "nav.experience", href: "#experience" },
  { labelKey: "nav.projects", href: "#projects" },
  { labelKey: "nav.education", href: "#education" },
];

export const Nav = () => {
  const { lang, toggleLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const allSections = ["hero", ...linksConfig.map((l) => l.href.slice(1))];

    const onScroll = () => {
      setScrolled(window.scrollY > 40);

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

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetScrollY = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
    >
      <div
        className={`flex items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-500 ${
          scrolled ? "glass-strong" : "glass"
        }`}
      >
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className={`rounded-full px-3 py-1.5 text-sm font-bold tracking-tight transition-colors ${
            activeSection === "hero"
              ? "bg-white/10 hover:bg-white/5 text-foreground"
              : "text-gradient-primary hover:text-foreground"
          }`}
        >
          {t("nav.hero")}
        </a>
        <div className="hidden items-center sm:flex">
          {linksConfig.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeSection === l.href.slice(1)
                  ? "bg-white/10 hover:bg-white/5 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(l.labelKey)}
            </a>
          ))}
          <button
            onClick={toggleLang}
            aria-label={lang === "en" ? t("nav.lang_switch_to_es") : t("nav.lang_switch_to_en")}
            className="relative flex h-8 items-center gap-0.5 rounded-full bg-white/5 pl-2.5 pr-1.5 text-xs font-medium tracking-wide"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <Globe className="absolute h-3.5 w-3.5 text-muted-foreground" />
            </span>
            <span className="flex items-center gap-0.5 py-1">
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  lang === "en"
                    ? "bg-primary/20 text-primary shadow-[0_0_8px_hsl(248_90%_66%/0.4)]"
                    : "text-muted-foreground"
                }`}
              >
                EN
              </span>
              <span className="text-muted-foreground/40">/</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  lang === "es"
                    ? "bg-primary/20 text-primary shadow-[0_0_8px_hsl(248_90%_66%/0.4)]"
                    : "text-muted-foreground"
                }`}
              >
                ES
              </span>
            </span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
