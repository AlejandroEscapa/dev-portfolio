import {
  ArrowLeft,
  Github,
  ExternalLink,
  Smartphone,
  Globe,
  Zap,
  Boxes,
  Database,
  Workflow,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  groupTechByCategory,
  type HighlightIcon,
  type Project,
  type StackCategoryId,
} from "@/data/projects";
import styles from "./projects.module.css";

const HIGHLIGHT_ICONS: Record<HighlightIcon, LucideIcon> = {
  Smartphone,
  Globe,
  Zap,
  Boxes,
  Database,
  Workflow,
  GraduationCap,
};

interface ProjectDetailProps {
  project: Project;
  isExiting: boolean;
  onBack: () => void;
}

export const ProjectDetail = ({ project, isExiting, onBack }: ProjectDetailProps) => {
  const { t } = useLanguage();
  const stack = groupTechByCategory(project.techTags);

  return (
    <div
      className={cn(styles.detail, isExiting ? styles.exiting : styles.entering)}
      role="region"
      aria-label={t(project.nameKey)}
    >
      <div className={styles.detailGrid}>
        <div className={styles.detailMedia}>
          {project.media.type === "video" ? (
            <video
              src={project.media.src}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="auto"
            />
          ) : (
            <img src={project.media.src} alt={project.media.alt ?? t(project.nameKey)} />
          )}
        </div>

        <div className={styles.detailInfo}>
          <div className={styles.detailHeader}>
            <button
              type="button"
              onClick={onBack}
              className={styles.detailBackBtn}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("projects.back")}</span>
            </button>
            <h2 className={styles.detailTitle}>{t(project.nameKey)}</h2>
          </div>

          <div className={styles.highlights}>
            {project.highlights.map((h) => {
              const Icon = HIGHLIGHT_ICONS[h.icon];
              return (
                <div key={h.label} className={styles.highlight}>
                  <Icon className={styles.highlightIcon} aria-hidden />
                  <span className={styles.highlightLabel}>{t(h.label)}</span>
                  <span className={styles.highlightValue}>{h.value}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>{t("projects.about")}</h4>
            <p className={styles.detailDesc}>{t(project.longDescKey)}</p>
          </div>

          <div className={styles.stack}>
            {stack.map(({ category, items }) => (
              <div key={category} className={styles.stackCategory}>
                <span className={styles.stackCategoryLabel}>
                  {t(`projects.category_${category}` as `projects.category_${StackCategoryId}`)}
                </span>
                <div className={styles.stackItems}>
                  {items.map((item) => (
                    <span key={item} className={styles.stackItem}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.detailActions}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="default" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  {t("projects.view_site")}
                </Button>
              </a>
            )}
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant={project.liveUrl ? "outline" : "default"} size="sm">
                <Github className="h-4 w-4" />
                {t("projects.view_repo")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
