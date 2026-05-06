import { motion } from "framer-motion";
import { Gamepad2, Award, Layers, Smartphone } from "lucide-react";

const techTags = ["Android", "Jetpack Compose", "MVVM", "Clean Architecture", "TFM"];

export const Projects = () => {
  return (
    <section id="projects" className="relative px-6 py-32">
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
            <span>04 — Projects</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            <span className="text-gradient">The proof</span>{" "}
            <span className="text-gradient-primary">in code.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-3xl glass-strong"
        >
          {/* Glow accents */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />

          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
            {/* Left: details */}
            <div className="flex flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs uppercase tracking-wider text-accent">
                <Award className="h-3 w-3" />
                Featured · TFM 9/10
              </div>

              <h3 className="mt-6 flex items-center gap-3 text-4xl font-bold tracking-tighter sm:text-5xl">
                GameVision
                <span className="text-3xl">🎮</span>
              </h3>

              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Master's Thesis: native Android application that reimagines video game discovery.
                Clean, testable and scalable architecture, built entirely with Jetpack Compose and
                MVVM.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {techTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                <Stat icon={Smartphone} label="Platform" value="Android" />
                <Stat icon={Layers} label="Architecture" value="Clean" />
                <Stat icon={Award} label="Grade" value="9 / 10" />
              </div>
            </div>

            {/* Right: phone mockup */}
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ rotate: -6, y: 0 }}
                whileHover={{ rotate: 0, y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="relative"
              >
                {/* Phone frame */}
                <div className="relative h-[520px] w-[260px] rounded-[3rem] border border-white/15 bg-gradient-to-b from-secondary to-background p-3 shadow-[0_30px_80px_-20px_hsl(248_90%_66%/0.5)]">
                  <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-primary/30 via-background to-accent/30">
                    {/* Notch */}
                    <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-background/80" />

                    {/* Screen content */}
                    <div className="flex h-full flex-col p-4 pt-10">
                      <div className="flex items-center justify-between">
                        <Gamepad2 className="h-6 w-6 text-primary-glow" />
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      </div>
                      <h4 className="mt-3 text-lg font-bold text-foreground">GameVision</h4>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Discover · Track · Play
                      </p>

                      <div className="mt-5 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                            className="flex gap-3 rounded-xl glass p-3"
                          >
                            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent" />
                            <div className="flex flex-col justify-center gap-1">
                              <div className="h-2 w-20 rounded bg-white/30" />
                              <div className="h-1.5 w-14 rounded bg-white/15" />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-auto rounded-xl bg-gradient-to-r from-primary to-primary-glow p-3 text-center text-xs font-medium text-primary-foreground">
                        Browse catalog
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating glow */}
                <div className="absolute -inset-8 -z-10 rounded-[4rem] bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) => (
  <div className="flex flex-col gap-1.5">
    <Icon className="h-4 w-4 text-accent" />
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);
