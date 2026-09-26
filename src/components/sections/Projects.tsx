import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

  const [activeCategories, setActiveCategories] = useState<ProjectCategoryId[]>([]);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(0, Math.floor(allProjects.length / 2))
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"carousel" | "detail">("carousel");
  const [isExiting, setIsExiting] = useState(false);

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
    setIsExiting(true);
    window.setTimeout(() => {
      setViewMode("detail");
      setIsExiting(false);
    }, SWAP_MS);
  };

  const handleBack = () => {
    if (isExiting) return;
    setIsExiting(true);
    window.setTimeout(() => {
      setSelectedProject(null);
      setViewMode("carousel");
      setIsExiting(false);
    }, SWAP_MS);
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
      // No id here: the WindowChrome wrapper in Index owns the "projects" anchor.
      style={motionStyle}
      className={cn("relative flex flex-col justify-center")}
    >
      <div className="container mx-auto max-w-6xl">
        {viewMode === "carousel" && (
          <div className="mb-6">
            {/* Same numbered header motif as Education/Contact: accent hairline,
                mono label, left-aligned display heading and a sub line. */}
            <div className="mb-4 flex items-center gap-3 text-sm uppercase tracking-label text-muted-foreground">
              <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              <span>{t("projects.section_label")}</span>
            </div>
            <h2 className="text-h1 font-bold tracking-heading">
              {t("projects.heading")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("projects.subheading")}
            </p>
          </div>
        )}

        <div className={styles.stage}>
          {viewMode === "carousel" ? (
            <div className={cn(styles.viewFlip, isExiting ? styles.exiting : styles.entering)}>
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
                />
              )}
            </div>
          ) : (
            selectedProject && (
              <ProjectDetail
                project={selectedProject}
                isExiting={isExiting}
                onBack={handleBack}
              />
            )
          )}
        </div>
      </div>
    </motion.section>
  );
};
