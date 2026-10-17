import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useInViewport } from "@/hooks/useInViewport";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { Reveal } from "@/components/fx/Reveal";
import type { MotionStyle } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { projects as allProjects, type Project, type ProjectCategoryId } from "@/data/projects";
import { ProjectCategoryChips } from "./projects/ProjectCategoryChips";
import { ProjectsCarousel } from "./projects/ProjectsCarousel";
import { ProjectDetail } from "./projects/ProjectDetail";
import { MobileProjectList } from "./projects/MobileProjectList";
import { cn } from "@/lib/utils";
import styles from "./projects/projects.module.css";

interface ProjectsProps {
  motionStyle?: MotionStyle;
}

const SWAP_MS = 420;

export const Projects = ({ motionStyle }: ProjectsProps) => {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const reduceMotion = useReducedMotion();
  const enableSharedLayout = !isMobile && !reduceMotion;

  const [activeCategories, setActiveCategories] = useState<ProjectCategoryId[]>([]);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(0, Math.floor(allProjects.length / 2))
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"carousel" | "detail">("carousel");
  const [isExiting, setIsExiting] = useState(false);

  // Los mp4 son 1080p y siguen decodificando fuera de pantalla: la visibilidad
  // del stage decide si se reproducen (auditoría 2026-10-17).
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionVisible = useInViewport(stageRef);

  // Un solo timer para el cross-fade: cambiar de ruta a mitad del flip dejaba
  // un setState programado sobre un componente desmontado (auditoria 2026-10-17).
  const swapTimer = useRef<number | null>(null);
  const scheduleSwap = (fn: () => void) => {
    if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      swapTimer.current = null;
      fn();
    }, SWAP_MS);
  };
  useEffect(() => () => {
    if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeCategories.length === 0) return allProjects;
    return allProjects.filter((p) => p.categories.some((c) => activeCategories.includes(c)));
  }, [activeCategories]);

  useEffect(() => {
    if (filteredProjects.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= filteredProjects.length) {
      setCurrentIndex(Math.floor(filteredProjects.length / 2));
    }
  }, [filteredProjects, currentIndex]);

  const handleSelect = (project: Project) => {
    if (isExiting) return;
    setSelectedProject(project);
    if (enableSharedLayout) {
      setViewMode("detail");
      return;
    }
    setIsExiting(true);
    scheduleSwap(() => {
      setViewMode("detail");
      setIsExiting(false);
    });
  };

  const handleBack = () => {
    if (isExiting) return;
    if (enableSharedLayout) {
      setSelectedProject(null);
      setViewMode("carousel");
      return;
    }
    setIsExiting(true);
    scheduleSwap(() => {
      setSelectedProject(null);
      setViewMode("carousel");
      setIsExiting(false);
    });
  };

  const handleCategoriesChange = (next: ProjectCategoryId[]) => {
    if (viewMode !== "carousel") {
      setSelectedProject(null);
      setViewMode("carousel");
      setIsExiting(false);
    }
    setActiveCategories(next);
    setCurrentIndex(Math.floor(Math.max(1, allProjects.length / 2)));
  };

  const renderEmpty = () => (
    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
      <p>{t("projects.no_results")}</p>
      <button
        type="button"
        onClick={() => handleCategoriesChange([])}
        className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm text-primary transition hover:bg-primary/20"
      >
        {t("projects.clear_filters")}
      </button>
    </div>
  );

  return (
    <motion.section
      // No id here: the sheet section in Index owns the "projects" anchor.
      style={motionStyle}
      className={cn("relative flex flex-col justify-center px-6 md:px-8 lg:px-10")}
    >
      <LayoutGroup id="projects-shared">
      <div className="container mx-auto max-w-6xl">
        {/* Header stays mounted in BOTH view modes: the swap below happens
            inside a fixed-height stage, so the window never changes size and
            the page never shifts when opening a project detail. */}
        <RevealStagger className="mb-8 pt-2 md:pt-6">
          {/* Same numbered header motif as Education/Contact: accent hairline,
              mono label, left-aligned display heading and a sub line. The extra
              top air + mb-8 match the Education header rhythm (whose content
              is vertically centred, so its title never hugs the chrome). */}
          <Reveal variant="fadeUpSm" className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
            <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <span>{t("projects.section_label")}</span>
          </Reveal>
          {/* leading-tight: text-h1 inherits body line-height (1.5), leaving
              ~15px of dead air under the display glyphs before the stage.
              The subline couples at mt-2 so heading + sub read as one block. */}
          <Reveal variant="fadeUp">
            <h2 className="text-h1 font-bold leading-tight tracking-heading">
              {t("projects.heading")}
            </h2>
          </Reveal>
          <Reveal variant="fadeUpSm" className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("projects.subheading")}
          </Reveal>
        </RevealStagger>

        <div ref={stageRef} className={styles.stage}>
          {viewMode === "carousel" ? (
            <div className={cn(styles.viewFlip, isExiting ? styles.exiting : !enableSharedLayout && styles.entering)}>
              <ProjectCategoryChips
                activeCategories={activeCategories}
                onChange={handleCategoriesChange}
              />
              {filteredProjects.length === 0 ? (
                renderEmpty()
              ) : isMobile ? (
                <MobileProjectList projects={filteredProjects} onSelect={handleSelect} />
              ) : (
                <ProjectsCarousel
                  projects={filteredProjects}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                  onSelect={handleSelect}
                  enableSharedLayout={enableSharedLayout}
                  videoPlayback={sectionVisible}
                />
              )}
            </div>
          ) : (
            selectedProject && (
              <ProjectDetail
                project={selectedProject}
                isExiting={isExiting}
                onBack={handleBack}
                enableSharedLayout={enableSharedLayout}
                sectionVisible={sectionVisible}
              />
            )
          )}
        </div>
      </div>
      </LayoutGroup>
    </motion.section>
  );
};
