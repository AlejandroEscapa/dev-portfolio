import { motion } from "framer-motion";
import { Github, Linkedin, ArrowDown, Sparkles, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const title = "Construyo software que se siente";
const subtitle = "Desarrollador Software · Mobile Native (Android & iOS) · Frontend & APIs REST · Agentic AI & local LLM tooling";

const words = title.split(" ");

export const Hero = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-32 pb-20">
      <div className="container relative z-10 mx-auto max-w-5xl text-center">
        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Disponible para nuevos retos</span>
        </motion.div>

        {/* Word-by-word headline */}
        <h1 className="text-5xl font-bold leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mr-3 inline-block"
            >
              <span className={i === words.length - 1 ? "text-gradient-primary" : "text-gradient"}>
                {word}
              </span>
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 + words.length * 0.08 }}
            className="text-gradient-accent inline-block"
          >
            vivo.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mx-auto mt-8 max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl"
        >
          {subtitle}
        </motion.p>

        {/* CTAs with glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)]"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
            <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary to-primary-glow opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70" />
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:scale-105 hover:border-accent/50"
          >
            <Github className="h-4 w-4" />
            GitHub
            <span className="absolute inset-0 -z-10 rounded-full bg-accent/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
          </a>

          <a
            href="tel:+34601175067"
            aria-label="Teléfono"
            className="group relative inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:scale-105 hover:border-primary-glow/50"
          >
            <Phone className="h-4 w-4" />
            Teléfono
            <span className="absolute inset-0 -z-10 rounded-full bg-primary-glow/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
          </a>

          <a
            href="mailto:alejandro.oliesc97@gmail.com"
            aria-label="Email"
            className="group relative inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:scale-105 hover:border-accent/50"
          >
            <Mail className="h-4 w-4" />
            Email
            <span className="absolute inset-0 -z-10 rounded-full bg-accent/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
          </a>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"
          >
            <span>Scroll</span>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
