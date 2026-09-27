import { Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";
import styles from "./projects.module.css";

interface ProjectCardProps {
  project: Project;
  position: number;
  isActive: boolean;
  onSelect: (project: Project) => void;
}

export const ProjectCard = ({ project, position, isActive, onSelect }: ProjectCardProps) => {
  const { t } = useLanguage();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isActive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(project);
    }
  };

  return (
    <article
      className={cn(styles.card)}
      data-position={position}
      data-active={isActive}
      onClick={() => isActive && onSelect(project)}
      onKeyDown={handleKeyDown}
      tabIndex={isActive ? 0 : -1}
      aria-hidden={!isActive}
      aria-label={`${t(project.nameKey)} — ${t(project.badgeKey)}`}
    >
      <div className={styles.cardMedia}>
        {project.media.type === "video" ? (
          <video
            src={project.media.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img src={project.media.src} alt={project.media.alt ?? t(project.nameKey)} loading="lazy" />
        )}
      </div>

      <div className={styles.cardBody}>
        <span className={styles.tabBar}>
          <span className={styles.cardBadge}>{t(project.badgeKey)}</span>
          <span className={styles.tabRail} aria-hidden="true" />
        </span>
        <h3 className={styles.cardTitle}>{t(project.nameKey)}</h3>
        <p className={styles.cardDesc}>{t(project.descKey)}</p>

        <div className={styles.techRow}>
          {project.techTags.slice(0, 4).map((tag) => (
            <span key={tag} className={styles.techChip}>{tag}</span>
          ))}
        </div>

        <div className={styles.cardActions}>
          <div className={styles.cardActionRow}>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(project);
              }}
            >
              {t("projects.view_details")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Outline defaults melt into the card: --input border is a ~12
                  channel-step delta over --card, so the 36px box reads shorter
                  than the filled sibling. Chip-recipe edge + interior keep the
                  secondary variant but make its footprint legible. */}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-neutral-tint/25 bg-neutral-tint/[0.04] hover:bg-neutral-tint/[0.08]"
              >
                <Github className="h-4 w-4" />
                {t("projects.view_repo")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
