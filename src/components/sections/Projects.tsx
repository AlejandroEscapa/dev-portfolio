import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Award, Layers, Smartphone, Github, Globe, Zap, Layout } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { PhoneVideo } from "@/components/ui/PhoneVideo";
import { BrowserPreview } from "@/components/ui/BrowserPreview";
import { useLanguage } from "@/context/LanguageContext";

interface ProjectsProps {
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

interface ProjectStat {
  icon: typeof Award;
  labelKey: string;
  valueKey: string;
}

interface ProjectData {
  id: string;
  nameKey: string;
  descKey: string;
  badgeKey: string;
  videoSrc?: string;
  previewSrc?: string;
  displayType: "phone" | "browser";
  githubUrl: string;
  liveUrl?: string;
  techTags: string[];
  stats: ProjectStat[];
}

const SECTION_ID = "projects";

const projects: ProjectData[] = [
  {
    id: "gamevision",
    nameKey: "projects.gamevision_name",
    descKey: "projects.gamevision_desc",
    badgeKey: "projects.gamevision_badge",
    videoSrc: "/gamevision-demo.mp4",
    displayType: "phone",
    githubUrl: "https://github.com/AlejandroEscapa/GameVisionTFM",
    techTags: ["Android", "Jetpack Compose", "MVVM", "Clean Architecture", "TFM"],
    stats: [
      { icon: Smartphone, labelKey: "projects.stat_platform_label", valueKey: "projects.stat_platform_value" },
      { icon: Layers, labelKey: "projects.stat_architecture_label", valueKey: "projects.stat_architecture_value" },
      { icon: Award, labelKey: "projects.stat_grade_label", valueKey: "projects.stat_grade_value" },
    ],
  },
  {
    id: "matchvision",
    nameKey: "projects.matchvision_name",
    descKey: "projects.matchvision_desc",
    badgeKey: "projects.matchvision_badge",
    videoSrc: "/matchvision-demo.mp4",
    displayType: "phone",
    githubUrl: "https://github.com/AlejandroEscapa/MatchVisionTFM",
    techTags: ["iOS", "Swift", "SwiftUI", "MVVM", "Firebase", "TFM"],
    stats: [
      { icon: Smartphone, labelKey: "projects.matchvision_stat_platform_label", valueKey: "projects.matchvision_stat_platform_value" },
      { icon: Layers, labelKey: "projects.matchvision_stat_architecture_label", valueKey: "projects.matchvision_stat_architecture_value" },
      { icon: Award, labelKey: "projects.matchvision_stat_grade_label", valueKey: "projects.matchvision_stat_grade_value" },
    ],
  },
  // TODO [FUTURO - URLs]: Actualizar liveUrl y githubUrl cuando el proyecto esté en producción
  // liveUrl: URL real del dominio del cliente (ej: https://casahumedo.es)
  // githubUrl: Repo real del proyecto (privado o público según decida el cliente)
  //
  // TODO [FUTURO - Stats]: Añadir métricas reales cuando estén disponibles:
  // - Lighthouse Performance score
  // - Core Web Vitals (LCP, FID, CLS)
  // - Conversion rate del widget de reservas
  {
    id: "casahumedo",
    nameKey: "projects.casahumedo_name",
    descKey: "projects.casahumedo_desc",
    badgeKey: "projects.casahumedo_badge",
    previewSrc: "/casahumedo-preview.png",
    displayType: "browser",
    liveUrl: "https://preview--leon-craft-engine.lovable.app",
    githubUrl: "https://github.com/AlejandroEscapa",
    techTags: ["Next.js 14", "TypeScript", "Tailwind CSS", "Supabase", "n8n", "Framer Motion"],
    stats: [
      { icon: Globe, labelKey: "projects.stat_type_label", valueKey: "projects.stat_type_value" },
      { icon: Zap, labelKey: "projects.stat_performance_label", valueKey: "projects.stat_performance_value" },
      { icon: Layout, labelKey: "projects.stat_architecture_label", valueKey: "projects.stat_architecture_value" },
    ],
  },
];

export const Projects = ({ id = SECTION_ID, innerRef, motionStyle }: ProjectsProps) => {
  const { t } = useLanguage();

  return (
    <SectionContainer maxWidth="lg" id={id} innerRef={innerRef} motionStyle={motionStyle}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="mb-12"
      >
        <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("projects.section_label")}</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          <span className="text-gradient">{t("projects.heading_before")}</span>{" "}
          <span className="text-gradient-primary">{t("projects.heading_after")}</span>
        </h2>
      </motion.div>

      <div className="flex flex-col gap-12">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
            className="group relative overflow-hidden rounded-3xl glass"
          >
            {/* Glow accents */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />

            <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
              {/* Left: details */}
              <div className="flex flex-col">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs uppercase tracking-wider text-accent">
                  <Award className="h-3 w-3" />
                  {t(project.badgeKey)}
                </div>

                <h3 className="mt-6 flex items-center gap-3 text-4xl font-bold tracking-tighter sm:text-5xl">
                  {t(project.nameKey)}
                  <span className="text-3xl">{project.id === "gamevision" ? "🎮" : project.id === "matchvision" ? "⚽" : "🍽️"}</span>
                </h3>

                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {t(project.descKey)}
                </p>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Github className="h-4 w-4" />
                  <span>{t("projects.github_link_label")}</span>
                  <span className="text-foreground/60 underline underline-offset-4 decoration-white/20">{project.githubUrl.replace("https://github.com/", "")}</span>
                </a>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.techTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                  {project.stats.map((stat) => (
                    <Stat
                      key={stat.labelKey}
                      icon={stat.icon}
                      label={t(stat.labelKey)}
                      value={t(stat.valueKey)}
                    />
                  ))}
                </div>
              </div>

              {/* Right: preview mockup */}
              <div className="relative flex items-center justify-center">
                {project.displayType === "browser" ? (
                  <BrowserPreview src={project.previewSrc!} url={project.liveUrl} />
                ) : (
                  <PhoneVideo src={project.videoSrc!} />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) => (
  <div className="flex flex-col gap-1.5">
    <Icon className="h-4 w-4 text-accent" />
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">{value}</span>
  </div>
);
