import { motion } from "framer-motion";
import { GraduationCap, BadgeCheck, ExternalLink } from "lucide-react";

export const Education = () => {
  return (
    <section id="education" className="relative px-6 py-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <span>06 — Education</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            <span className="text-gradient">Learning</span>{" "}
            <span className="text-gradient-accent">is not optional.</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="group relative overflow-hidden rounded-3xl glass p-8 hover-glow"
          >
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                Master's in Mobile Development
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Master's Thesis · GameVision · 9/10
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Android Native", "Compose", "MVVM", "Clean Arch"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl glass p-8 hover-glow"
          >
            <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary">
                <BadgeCheck className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                IBM Artificial Intelligence Fundamentals
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Official IBM certification
              </p>

              <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Credential ID
                </p>
                <p className="mt-1 break-all font-mono text-xs text-foreground">
                  1965d5c5-2593-47ca-bed5-a5190bfa7667
                </p>
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent transition-colors group-hover:text-primary-glow">
                <ExternalLink className="h-3 w-3" />
                Verifiable
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
