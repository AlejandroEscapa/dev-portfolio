import { motion, type Variants } from "framer-motion";
import { ChefHat, ArrowRight, Code2 } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
  }),
};

export const Profile = () => {
  return (
    <section id="profile" className="relative px-6 py-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-16 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground"
        >
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>01 — Profile</span>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Asymmetric: left big text */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-7"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl"
            >
              <span className="text-gradient">From the kitchen</span>
              <br />
              <span className="text-gradient-primary">to the code.</span>
            </motion.h2>

            <motion.p
              custom={1}
              variants={fadeUp}
              className="mt-8 text-lg leading-relaxed text-muted-foreground"
            >
              Mobile and Frontend Developer with proven leadership experience as{" "}
              <span className="text-foreground font-medium">Tech Lead on production Angular projects</span>,
              coordinating architecture decisions with backend and product teams. Specialized in
              native Android (Kotlin/Jetpack Compose) and iOS (Swift) development with strong
              backend API design skills using Spring Boot and FastAPI.
            </motion.p>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
            >
              Leverages{" "}
              <span className="text-foreground font-medium">AI-assisted development workflows</span>{" "}
              with local LLM infrastructure and agentic tooling for enhanced productivity. Brings
              operational resilience from high-pressure hospitality environments, translating to
              effective prioritization and execution under demanding technical deadlines.
            </motion.p>
          </motion.div>

          {/* Asymmetric: right transition card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 lg:pt-12"
          >
            <div className="glass-strong relative overflow-hidden rounded-3xl p-8">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass">
                    <ChefHat className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Hospitality
                  </span>
                </div>

                <ArrowRight className="h-6 w-6 text-primary" />

                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow glow-primary">
                    <Code2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Tech
                  </span>
                </div>
              </div>

              <div className="relative mt-8 border-t border-white/10 pt-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Resilience.</span> No improvised
                  transition: nights studying architectures, weekends on side-projects, and the
                  discipline of someone who has worked 200-cover services.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
