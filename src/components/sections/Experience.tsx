import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Sparkles } from "lucide-react";

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  highlights?: string[];
  featured?: boolean;
}

const experiences: Experience[] = [
  {
    company: "MAS Ingeniería",
    role: "Tech Lead",
    period: "Present",
    description:
      "Technical leadership of cross-functional teams on production Angular projects. Mobile-first architecture, API integration and adoption of Agentic AI / local LLM tooling to accelerate the development cycle.",
    highlights: ["Mobile Native", "Angular", "AI Tooling", "Code Reviews", "Mentoring"],
    featured: true,
  },
  {
    company: "UDON Asian Food",
    role: "Hospitality",
    period: "Pre-tech",
    description: "Service operations in a restaurant chain. Teamwork and performance under pressure.",
  },
  {
    company: "PEZ TOMILLO",
    role: "Hospitality",
    period: "Pre-tech",
    description: "Kitchen and service. Attention to detail and consistency.",
  },
  {
    company: "Leasba",
    role: "Hospitality",
    period: "Pre-tech",
    description: "Operations, shift management and customer service.",
  },
  {
    company: "Alsea",
    role: "Hospitality",
    period: "Pre-tech",
    description: "International brands. Process standardization.",
  },
  {
    company: "Hilton Foods",
    role: "Industrial Operator",
    period: "Pre-tech",
    description: "Industrial food production. Discipline and quality compliance.",
  },
];

const TimelineNode = ({ featured }: { featured?: boolean }) => (
  <div className="relative">
    <div
      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border ${
        featured
          ? "border-primary/60 bg-gradient-to-br from-primary to-primary-glow glow-primary"
          : "border-white/15 glass"
      }`}
    >
      {featured ? (
        <Sparkles className="h-5 w-5 text-primary-foreground" />
      ) : (
        <Briefcase className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
    {featured && (
      <span className="absolute inset-0 -z-0 animate-pulse-glow rounded-full bg-primary/40 blur-xl" />
    )}
  </div>
);

export const Experience = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0, 0.9], ["0%", "100%"]);

  return (
    <section id="experience" className="relative px-6 py-32">
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
            <span>03 — Journey</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            <span className="text-gradient">Impact</span>{" "}
            <span className="text-gradient-accent">at every stop.</span>
          </h2>
        </motion.div>

        <div ref={ref} className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-px bg-white/10 sm:left-6" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-5 top-2 w-px bg-gradient-to-b from-primary via-primary-glow to-accent sm:left-6"
          />

          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 pl-0 sm:gap-8"
              >
                <div className="flex-shrink-0">
                  <TimelineNode featured={exp.featured} />
                </div>

                <div
                  className={`flex-1 rounded-2xl glass p-6 transition-all duration-300 hover:border-white/20 ${
                    exp.featured ? "lg:p-10 glass-strong" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3
                      className={`font-semibold tracking-tight ${
                        exp.featured ? "text-2xl sm:text-3xl text-gradient-primary" : "text-xl text-foreground"
                      }`}
                    >
                      {exp.company}
                    </h3>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm font-medium ${exp.featured ? "text-accent" : "text-primary"}`}>
                    {exp.role}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {exp.description}
                  </p>
                  {exp.highlights && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {exp.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
