import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { GraduationCap, BadgeCheck, School, ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";

interface EducationProps {
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

const SECTION_ID = "education";

const items = [
  {
    icon: GraduationCap,
    institution: "Tokio School",
    title: "Master's Degree in Mobile Application Development",
    location: "Remote",
    period: "June 2025 – Dec 2025",
    tags: ["Android Native", "iOS", "Compose", "Swift"],
    accent: "from-primary to-primary-glow",
    glow: "bg-primary/20",
  },
  {
    icon: School,
    institution: "IES San Andrés",
    title: "FP in Multiplatform Application Development",
    location: "León, España",
    period: "Nov 2021 – May 2023",
    tags: ["Java", "Kotlin", "SQL", "Spring"],
    accent: "from-accent to-primary",
    glow: "bg-accent/20",
  },
  {
    icon: BadgeCheck,
    institution: "IBM",
    title: "Certification in Artificial Intelligence Fundamentals",
    location: "Remote",
    period: "Feb 2026 – Feb 2026",
    credential: "1965d5c5-2593-47ca-bed5-a5190bfa7667",
    accent: "from-primary-glow to-accent",
    glow: "bg-primary-glow/25",
  },
];

export const Education = ({ id = SECTION_ID, innerRef, motionStyle }: EducationProps) => {
  return (
    <SectionContainer maxWidth="lg" id={id} innerRef={innerRef} motionStyle={motionStyle}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="mb-8"
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.institution}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-3xl glass p-8 hover-glow"
              >
                <div className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${it.glow}`} />
                <div className="relative">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${it.accent}`}>
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {it.period}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                    {it.institution}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {it.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {it.location}
                  </p>

                  {it.tags && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {it.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {it.credential && (
                    <>
                      <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Credential ID
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-foreground">
                          {it.credential}
                        </p>
                      </div>
                      <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-accent transition-colors group-hover:text-primary-glow">
                        <ExternalLink className="h-3 w-3" />
                        Verifiable
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
    </SectionContainer>
  );
};
