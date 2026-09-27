import {
  useRef,
  useState,
} from "react";
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
  Play,
  Pause,
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div
      className={cn(styles.detail, isExiting ? styles.exiting : styles.entering)}
      role="region"
      aria-label={t(project.nameKey)}
    >
      {/* Block 1: Header — back button left, title centered */}
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

      {/* Block 2: Bento content — media + spec grid left, narrative right */}
      <div className={styles.detailContent}>
        <div className={styles.detailMediaCol}>
          <div className={styles.detailMedia}>
            {project.media.type === "video" ? (
              <>
                <video
                  ref={videoRef}
                  src={project.media.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {/* Whole media surface is the control: the glyph sits centered
                    over the video pixels (never on letterbox), visible while
                    paused and on hover/focus while playing. */}
                <button
                  type="button"
                  className={styles.videoToggle}
                  data-playing={isPlaying}
                  onClick={togglePlay}
                  aria-label={isPlaying ? t("projects.video_pause") : t("projects.video_play")}
                >
                  <span className={styles.videoToggleGlyph} aria-hidden="true">
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
                    )}
                  </span>
                </button>
              </>
            ) : (
              <img src={project.media.src} alt={project.media.alt ?? t(project.nameKey)} />
            )}
          </div>

          <div className={styles.highlights}>
            {project.highlights.map((h) => {
              const Icon = HIGHLIGHT_ICONS[h.icon];
              return (
                <div key={h.label} className={styles.highlight}>
                  <Icon className={styles.highlightIcon} aria-hidden />
                  <span className={styles.highlightText}>
                    <span className={styles.highlightLabel}>{t(h.label)}</span>
                    <span className={styles.highlightValue}>{h.value}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.detailInfo}>
          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>{t("projects.about")}</h4>
            <p className={styles.detailDesc}>{t(project.longDescKey)}</p>
          </div>
        </div>
      </div>

      {/* Block 3: Tech stack strip + actions */}
      <div className={styles.detailStackStrip}>
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
  );
};
