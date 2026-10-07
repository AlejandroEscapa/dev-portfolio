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
  // Dedup: the card chips and the About narrative already carry the stack,
  // so the detail shows only the facts nothing else tells. A highlight whose
  // key suffix collides with a present category (framework, backend, ...)
  // is dropped; the context category joins as a tile instead.
  const categoryIds = new Set(stack.map(({ category }) => category));
  const contextCategory = stack.find(({ category }) => category === "context");
  const tiles: Array<{ icon: HighlightIcon; labelKey: string; value: string }> = [
    ...project.highlights
      .filter(
        (h) =>
          !categoryIds.has(
            h.label.replace("projects.highlight_", "") as StackCategoryId,
          ),
      )
      .map((h) => ({ icon: h.icon, labelKey: h.label, value: h.value })),
    ...(contextCategory
      ? [
          {
            icon: "GraduationCap" as const,
            labelKey: "projects.category_context",
            value: contextCategory.items.join(", "),
          },
        ]
      : []),
  ];
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

      {/* Block 2: Bento content — media left (full stage height), narrative
          + spec grid right */}
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
        </div>

        <div className={styles.detailInfo}>
          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>{t("projects.about")}</h4>
            <p className={styles.detailDesc}>{t(project.longDescKey)}</p>
          </div>

          <div className={styles.highlights}>
            {tiles.map((tile) => {
              const Icon = HIGHLIGHT_ICONS[tile.icon];
              return (
                <div key={tile.labelKey} className={styles.highlight}>
                  <Icon className={styles.highlightIcon} aria-hidden />
                  <span className={styles.highlightText}>
                    <span className={styles.highlightLabel}>{t(tile.labelKey)}</span>
                    <span className={styles.highlightValue}>{tile.value}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className={styles.detailActions}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="default" size="sm" className={styles.detailBtnPrimary}>
                  <ExternalLink className="h-4 w-4" />
                  {t("projects.view_site")}
                </Button>
              </a>
            )}
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant={project.liveUrl ? "outline" : "default"}
                size="sm"
                className={cn(project.liveUrl ? styles.detailBtnGhost : styles.detailBtnPrimary)}
              >
                <Github className="h-4 w-4" />
                {t("projects.view_repo")}
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Block 3: one-line fact strip — additive data only (UI framework,
          architecture, APIs, features). Same visual language as the old
          stack strip (primary chip + mono items) but never repeats the
          tiles' facts, and never grows past a single line. */}
      {(() => {
        const stripGroups: Array<{ labelKey: string; value: string }> = [];
        const uiCategory = stack.find(({ category }) => category === "framework");
        if (uiCategory) stripGroups.push({ labelKey: "projects.strip_ui", value: uiCategory.items.join(", ") });
        const archCategory = stack.find(({ category }) => category === "architecture");
        if (archCategory) stripGroups.push({ labelKey: "projects.strip_arch", value: archCategory.items.join(", ") });
        if (project.apis?.length) stripGroups.push({ labelKey: "projects.strip_apis", value: project.apis.join(", ") });
        if (project.features?.length) stripGroups.push({ labelKey: "projects.strip_features", value: project.features.join(", ") });
        if (stripGroups.length === 0) return null;
        return (
          <div className={styles.detailStrip}>
            {stripGroups.map((group) => (
              <div key={group.labelKey} className={styles.stripGroup}>
                <span className={styles.stripLabel}>{t(group.labelKey)}</span>
                <span className={styles.stripItems}>{group.value}</span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};
