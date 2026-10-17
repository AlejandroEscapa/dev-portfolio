import {
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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
import { useLanguage } from "@/context/LanguageContext";
import { GitHubSvg } from "@/components/brand-icons";
import { safePlay } from "@/lib/video-playback";
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
  enableSharedLayout?: boolean;
  /** Si la sección está en el viewport: fuera de él, el vídeo se pausa. */
  sectionVisible?: boolean;
}

export const ProjectDetail = ({
  project,
  isExiting,
  onBack,
  enableSharedLayout = false,
  sectionVisible = true,
}: ProjectDetailProps) => {
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
  // Intención del usuario, separada del estado real del <video>: la pausa por
  // scroll no puede reescribirla (si el usuario pausa, sigue pausado al volver).
  const userPaused = useRef(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      safePlay(video);
    } else {
      userPaused.current = true;
      video.pause();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || project.media.type !== "video") return;
    if (!sectionVisible) {
      video.pause();
      return;
    }
    if (!userPaused.current) safePlay(video);
  }, [sectionVisible, project.media.type]);

  return (
    <div
      className={cn(
        styles.detail,
        !enableSharedLayout && (isExiting ? styles.exiting : styles.entering),
      )}
      role="region"
      aria-label={t(project.nameKey)}
    >
      {/* Block 1: Thin header — back only. The project title moved into the
          info column (next to the content it names); the freed header row
          height belongs to the media/ficha stage. */}
      <div className={styles.detailHeader}>
        <button
          type="button"
          onClick={onBack}
          className={styles.detailBackBtn}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("projects.back")}</span>
        </button>
      </div>

      {/* Block 2: media left (full stage height), title + narrative + spec
          grid + actions right */}
      <div className={styles.detailContent}>
        <div className={styles.detailMediaCol}>
          <motion.div
            className={styles.detailMedia}
            layoutId={enableSharedLayout ? `proj-media-${project.id}` : undefined}
          >
            {project.media.type === "video" ? (
              <>
                <video
                  ref={videoRef}
                  src={project.media.src}
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
          </motion.div>
        </div>

        <div className={styles.detailInfo}>
          <motion.h2
            className={styles.detailName}
            layoutId={enableSharedLayout ? `proj-title-${project.id}` : undefined}
          >
            {t(project.nameKey)}
          </motion.h2>

          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>{t("projects.about")}</h4>
            <p className={styles.detailDesc}>{t(project.longDescKey)}</p>
          </div>

          {/* Round 4 (option 1): spec facts + actions share ONE bento mosaic.
              2-col grid with dense flow packs odd spec counts without empty
              cells; the CTA carries the real GitHub mark, not a generic
              glyph, with the brand gradient treatment. */}
          <div className={styles.specBento}>
            {/* The project's thread: full-width mosaic cell that opens the
                mosaic with the one-line "why" shared across surfaces. */}
            {project.threadKey && (
              <div className={cn(styles.bentoCell, styles.bentoThread)}>
                <span className={styles.bentoLabel}>{t("projects.thread_label")}</span>
                <span className={styles.bentoThreadText}>{t(project.threadKey)}</span>
              </div>
            )}
            {tiles.map((tile) => {
              const Icon = HIGHLIGHT_ICONS[tile.icon];
              return (
                <div key={tile.labelKey} className={styles.bentoCell}>
                  <Icon className={styles.bentoIcon} aria-hidden />
                  <span className={styles.bentoText}>
                    <span className={styles.bentoLabel}>{t(tile.labelKey)}</span>
                    <span className={styles.bentoValue}>{tile.value}</span>
                  </span>
                </div>
              );
            })}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(styles.bentoCell, styles.bentoGhost)}
              >
                <ExternalLink className={styles.bentoIcon} aria-hidden />
                <span className={styles.bentoActionLabel}>{t("projects.view_site")}</span>
              </a>
            )}
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                styles.bentoCell,
                styles.bentoCta,
                // Wide CTA when the spec cells pair up evenly (or "Ver sitio"
                // takes the odd slot); half width only when it must share the
                // row with the last unpaired spec — the bento never shows an
                // empty cell.
                tiles.length % 2 === 0 || !!project.liveUrl
                  ? styles.bentoCtaWide
                  : styles.bentoCtaHalf,
              )}
            >
              <GitHubSvg />
              <span className={styles.bentoActionLabel}>{t("projects.view_repo")}</span>
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
