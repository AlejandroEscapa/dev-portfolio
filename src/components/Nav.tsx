import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { label: "About", href: "#about" },
  { label: "Profile", href: "#profile" },
  { label: "Stack", href: "#stack" },
  { label: "Journey", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
];

const allSections = ["hero", ...links.map((l) => l.href.slice(1))];

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
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
          ME
        </a>
        <div className="hidden items-center sm:flex">
          {links.map((l) => (
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
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};
