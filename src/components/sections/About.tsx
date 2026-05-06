import { motion, type Variants } from "framer-motion";
import { User, Sparkles } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
  }),
};

export const About = () => {
  return (
    <section id="about" className="relative px-6 py-32">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-12 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground"
        >
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>02 — About me</span>
        </motion.div>

        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          variants={fadeUp}
          className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl"
        >
          <span className="text-gradient">Professional</span>{" "}
          <span className="text-gradient-primary">summary.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-12 grid gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            <div className="glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-10">
              <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

              <div className="relative space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <p>
                  Mobile and Frontend Developer with proven leadership experience as{" "}
                  <span className="font-medium text-foreground">
                    Tech Lead on production Angular projects
                  </span>
                  , coordinating architecture decisions with backend and product teams.
                </p>
                <p>
                  Specialized in{" "}
                  <span className="font-medium text-foreground">
                    native Android (Kotlin/Jetpack Compose) and iOS (Swift)
                  </span>{" "}
                  development with strong backend API design skills using{" "}
                  <span className="font-medium text-foreground">Spring Boot and FastAPI</span>.
                </p>
                <p>
                  Leverages{" "}
                  <span className="font-medium text-foreground">
                    AI-assisted development workflows
                  </span>{" "}
                  with local LLM infrastructure and agentic tooling for enhanced productivity.
                </p>
                <p>
                  Brings operational resilience from high-pressure hospitality environments,
                  translating to effective prioritization and execution under demanding technical
                  deadlines.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="glass relative flex-1 overflow-hidden rounded-3xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow glow-primary">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Role
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                Frontend & Mobile Developer
              </p>
              <p className="mt-1 text-sm text-primary">Tech Lead</p>
            </div>

            <div className="glass relative flex-1 overflow-hidden rounded-3xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Edge
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                AI-assisted workflows
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Local LLMs · Agentic tooling
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
