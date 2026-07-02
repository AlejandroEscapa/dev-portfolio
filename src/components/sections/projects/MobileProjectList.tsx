import { useLanguage } from "@/context/LanguageContext";
import type { Project } from "@/data/projects";
import styles from "./projects.module.css";

interface MobileProjectListProps {
  projects: Project[];
  onSelect: (project: Project) => void;
}

export const MobileProjectList = ({ projects, onSelect }: MobileProjectListProps) => {
  const { t } = useLanguage();

  if (projects.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{t("projects.no_results")}</p>
      </div>
    );
  }

  return (
    <div className={styles.mobileGrid}>
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          className={styles.mobileCard}
          onClick={() => onSelect(project)}
          aria-label={`${t(project.nameKey)} — ${t("projects.view_details")}`}
        >
          <div className={styles.mobileCardMedia}>
            {project.media.type === "video" ? (
              <video
                src={project.media.src}
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={project.media.src}
                alt={project.media.alt ?? t(project.nameKey)}
                loading="lazy"
              />
            )}
          </div>
          <div className={styles.mobileCardBody}>
            <span className={styles.cardBadge}>{t(project.badgeKey)}</span>
            <h3 className={styles.mobileCardTitle}>{t(project.nameKey)}</h3>
            <p className={styles.mobileCardDesc}>{t(project.descKey)}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
