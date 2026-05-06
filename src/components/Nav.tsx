import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Profile", href: "#profile" },
  { label: "About", href: "#about" },
  { label: "Stack", href: "#stack" },
  { label: "Journey", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
];

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
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
            href="#"
            className="rounded-full px-3 py-1.5 text-sm font-bold tracking-tight text-gradient-primary"
          >
            DEV.
          </a>
          <div className="hidden items-center sm:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
};
