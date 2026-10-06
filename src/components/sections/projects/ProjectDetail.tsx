import {
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import {
  groupTechByCategory,
  type Project,
  type StackCategoryId,
} from "@/data/projects";
import styles from "./projects.module.css";

interface ProjectDetailProps {
  project: Project;
  isExiting: boolean;
  onBack: () => void;
}

interface InspectorRow {
  labelKey: string;
  value: string;
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

  // Single source of truth: the categorized techTags. Highlights only
  // contribute what no category covers (platform, final grade); a highlight
  // whose key suffix collides with a present category (framework, backend,
  // ...) is dropped in favor of the richer category row.
  const categoryIds = new Set(stack.map(({ category }) => category));
  const identityRows: InspectorRow[] = [
    ...project.highlights
      .filter(
        (h) =>
          !categoryIds.has(
            h.label.replace("projects.highlight_", "") as StackCategoryId,
          ),
      )
      .map((h) => ({ labelKey: h.label, value: h.value })),
  ];
  const contextCategory = stack.find(({ category }) => category === "context");
  if (contextCategory) {
    // Context describes the project itself, so it joins the identity group.
    identityRows.push({
      labelKey: "projects.category_context",
      value: contextCategory.items.join(", "),
    });
  }
  const stackRows: InspectorRow[] = stack
    .filter(({ category }) => category !== "context")
    .map(({ category, items }) => ({
      labelKey: `projects.category_${category}` as `projects.category_${StackCategoryId}`,
      value: items.join(", "),
    }));

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

      {/* Block 2: media left, narrative + file-inspector right */}
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

          {(identityRows.length > 0 || stackRows.length > 0) && (
            <div className={styles.inspector}>
              {identityRows.length > 0 && (
                <div className={styles.inspectorGroup}>
                  <h5 className={styles.inspectorGroupTitle}>
                    {t("projects.identity_title")}
                  </h5>
                  {identityRows.map((row) => (
                    <div key={row.labelKey} className={styles.inspectorRow}>
                      <span className={styles.inspectorLabel}>{t(row.labelKey)}</span>
                      <span className={styles.inspectorLeader} aria-hidden />
                      <span className={styles.inspectorValue}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {stackRows.length > 0 && (
                <div className={styles.inspectorGroup}>
                  <h5 className={styles.inspectorGroupTitle}>
                    {t("projects.stack_title")}
                  </h5>
                  {stackRows.map((row) => (
                    <div key={row.labelKey} className={styles.inspectorRow}>
                      <span className={styles.inspectorLabel}>{t(row.labelKey)}</span>
                      <span className={styles.inspectorLeader} aria-hidden />
                      <span className={styles.inspectorValue}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
