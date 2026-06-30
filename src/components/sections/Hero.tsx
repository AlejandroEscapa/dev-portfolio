import { motion } from "framer-motion";
import { Github, Linkedin, ArrowDown, Sparkles, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Hero = () => {
  const { t } = useLanguage();
  const title = t("hero.title");
  const words = title.split(" ");

  return (
    <section id="hero" className="relative flex min-h-[60vh] items-center justify-center px-4 pt-10 pb-10">
      <div className="container relative z-10 mx-auto max-w-5xl text-center">
        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>{t("hero.available")}</span>
        </motion.div>

        {/* Word-by-word headline */}
        <h1 className="text-4xl font-bold leading-[0.95] sm:text-5xl md:text-6xl">
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
            {t("hero.title_final")}
          </motion.span>
        </h1>

        {/* CTAs with glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="https://www.linkedin.com/in/alejandro-olivares-escapa/"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_var(--shadow-glow)]"
          >
            <Linkedin className="h-4 w-4" />
            {t("hero.cta_linkedin")}
            <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary to-primary-glow opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70" />
          </motion.a>

          <motion.a
            href="https://github.com/alejandrooliesc"
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-2 rounded-full liquid-glass px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:scale-105 hover:border-accent/50"
          >
            <Github className="h-4 w-4" />
            {t("hero.cta_github")}
            <span className="absolute inset-0 -z-10 rounded-full bg-accent/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
          </motion.a>

          <motion.a
            href="tel:+34601175067"
            aria-label="Phone"
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-2 rounded-full liquid-glass px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:scale-105 hover:border-primary-glow/50"
          >
            <Phone className="h-4 w-4" />
            {t("hero.cta_phone")}
            <span className="absolute inset-0 -z-10 rounded-full bg-primary-glow/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
          </motion.a>

          <motion.a
            href="mailto:alejandro.oliesc97@gmail.com"
            aria-label="Email"
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex items-center gap-2 rounded-full liquid-glass px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:scale-105 hover:border-accent/50"
          >
            <Mail className="h-4 w-4" />
            {t("hero.cta_email")}
            <span className="absolute inset-0 -z-10 rounded-full bg-accent/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80" />
          </motion.a>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"
          >
            <span>{t("hero.scroll_hint")}</span>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
