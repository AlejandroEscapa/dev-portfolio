import { motion } from "framer-motion";
import { Code2, Brain, Cloud, Database, Smartphone, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BentoItem {
  title: string;
  subtitle: string;
  items: string[];
  icon: LucideIcon;
  className: string;
  accent?: "primary" | "accent" | "glow";
}

const bento: BentoItem[] = [
  {
    title: "Lenguajes",
    subtitle: "Native & web",
    items: ["TypeScript", "Kotlin", "Java", "Swift"],
    icon: Code2,
    className: "lg:col-span-2 lg:row-span-2",
    accent: "primary",
  },
  {
    title: "AI Stack",
    subtitle: "Agentic & local LLMs",
    items: ["Ollama", "Claude Code"],
    icon: Brain,
    className: "lg:col-span-2",
    accent: "accent",
  },
  {
    title: "Mobile",
    subtitle: "Android & iOS",
    items: ["Jetpack Compose", "SwiftUI", "MVVM"],
    icon: Smartphone,
    className: "lg:col-span-2",
    accent: "glow",
  },
  {
    title: "Frontend",
    subtitle: "Modern web",
    items: ["React", "Next.js"],
    icon: Layers,
    className: "lg:col-span-2",
    accent: "primary",
  },
  {
    title: "Databases",
    subtitle: "SQL & NoSQL",
    items: ["PostgreSQL", "SQLite", "MySQL", "MongoDB"],
    icon: Database,
    className: "lg:col-span-4",
    accent: "glow",
  },
];

const accentMap = {
  primary: "text-primary",
  accent: "text-accent",
  glow: "text-primary-glow",
};

export const TechStack = () => {
  return (
    <section id="stack" className="relative px-6 py-32">
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
            <span>02 — Stack</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            <span className="text-gradient">Las herramientas</span>{" "}
            <span className="text-gradient-primary">que importan.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Pragmatismo sobre dogma. Cada elección responde a un problema real.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {bento.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.96 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`group relative overflow-hidden rounded-3xl glass p-6 hover-glow ${item.className}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl glass ${accentMap[item.accent || "primary"]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>

                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {item.items.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground transition-colors group-hover:border-white/20 group-hover:text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
