import { motion } from "framer-motion";
import { Github, Linkedin, Phone, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative px-6 py-12 border-t border-white/5">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-between gap-6 sm:flex-row"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">Let's build something together.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              © {new Date().getFullYear()} · Made with code and coffee.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-10 w-10 items-center justify-center rounded-full glass transition-all hover:scale-110 hover:border-primary/50"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-10 w-10 items-center justify-center rounded-full glass transition-all hover:scale-110 hover:border-accent/50"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="tel:+34601175067"
              aria-label="Phone"
              className="flex h-10 w-10 items-center justify-center rounded-full glass transition-all hover:scale-110 hover:border-primary-glow/50"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href="mailto:alejandro.oliesc97@gmail.com"
              aria-label="Email"
              className="flex h-10 w-10 items-center justify-center rounded-full glass transition-all hover:scale-110 hover:border-accent/50"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
