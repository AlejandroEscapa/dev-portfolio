import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection } from "@/lib/scroll";
import { ScrollTrigger } from "@/lib/gsap";
import { resolveActiveSection, isNavVisible, type SectionAnchor } from "@/lib/nav-scroll";

// Un enlace por cada una de las 9 secciones numeradas, en el orden real de la
// pagina (el hero es la portada, sin numeral: no entra en el menu). El href de
// Education apunta a la seccion `formacion` (su anchor interna `education`
// queda para Spotlight/CLI), para que el tracking de seccion activa mida el
// bloque completo y no un div interior.
const linksConfig = [
  { labelKey: "nav.about", href: "#about" },
  { labelKey: "nav.projects", href: "#projects" },
  { labelKey: "nav.workbench", href: "#ai-workbench" },
  { labelKey: "nav.experience", href: "#trayectoria" },
  { labelKey: "nav.impact", href: "#contributions" },
  { labelKey: "nav.education", href: "#formacion" },
  { labelKey: "nav.sidequests", href: "#sidequests" },
  { labelKey: "nav.stats", href: "#stats" },
  { labelKey: "nav.contact", href: "#contact" },
];

export const Nav = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const allSections = linksConfig.map((l) => l.href.slice(1));

    // Medidas cacheadas: se recalculan al montar, al redimensionar y cuando
    // ScrollTrigger refresca (los pin-spacers mueven los offsets después del
    // montaje). Antes esto eran 9 getBoundingClientRect por CADA evento de
    // scroll (~900 lecturas de layout por segundo con Lenis a 90-120 Hz).
    const anchors: SectionAnchor[] = [];
    let threshold = 500;

    const measure = () => {
      // First section AFTER the hero rail: the nav stays hidden while the
      // visitor is inside the hero screens and appears past this anchor.
      const projectsEl = document.getElementById("projects");
      threshold = projectsEl
        ? projectsEl.getBoundingClientRect().top + window.scrollY - 100
        : 500;

      anchors.length = 0;
      for (const id of allSections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        anchors.push({ id, center: rect.top + window.scrollY + rect.height / 2 });
      }
    };

    // Una sola rAF por ráfaga de eventos: el estado de React solo cambia de
    // valor cuando de verdad cambia, pero el cálculo tampoco se repite.
    let pending = false;
    const update = () => {
      pending = false;
      const scrollY = window.scrollY;
      setScrolled(scrollY > 40);
      setVisible(isNavVisible(scrollY, threshold));
      setActiveSection(
        resolveActiveSection(anchors, scrollY + window.innerHeight / 2),
      );
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    const onRefresh = measure;
    ScrollTrigger.addEventListener("refresh", onRefresh);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    measure();
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToSection(href.slice(1));
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
        {/* 10 enlaces + ⌘K no caben a 640px: el menu entra en md y el atajo
            solo en lg, con tracking mas cerrado por debajo de lg. */}
        <div className="hidden items-center gap-1 md:flex">
          {linksConfig.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={`whitespace-nowrap px-1.5 py-1.5 font-mono text-[11px] tracking-mono transition-colors lg:px-3 lg:text-xs ${
                activeSection === l.href.slice(1)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(l.labelKey)}
            </a>
          ))}
          <kbd className="ml-1 hidden items-center gap-0.5 rounded border border-neutral-tint/10 bg-neutral-tint/5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground lg:inline-flex">⌘K</kbd>
        </div>
      </div>
    </nav>
  );
};
