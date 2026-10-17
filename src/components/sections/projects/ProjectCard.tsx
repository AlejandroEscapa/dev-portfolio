import { useEffect, useRef } from "react";
import { Github, ArrowRight } from "lucide-react";
import { safePlay } from "@/lib/video-playback";
import { motion } from "framer-motion";
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
  enableSharedLayout?: boolean;
  /** Dossier editorial: "01 / 03" — lo pasa el carousel, no la posición 3D. */
  dossierNo?: string;
  /** Reproducir el vídeo. La sección lo apaga cuando sale del viewport
      (los mp4 son 1080p y decodificar fuera de pantalla no aporta nada). */
  play?: boolean;
}

export const ProjectCard = ({
  project,
  position,
  isActive,
  onSelect,
  enableSharedLayout = false,
  dossierNo,
  play = true,
}: ProjectCardProps) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  // play()/pause() en vez de montar y desmontar el <video>: no se recarga el
  // medio ni se pierde el fotograma que está mostrando la tarjeta.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (play) safePlay(video);
    else video.pause();
  }, [play]);

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
      // Contexto del halo de cursor: la card entera invita a abrir la ficha.
      data-cursor="view"
      onClick={() => isActive && onSelect(project)}
      onKeyDown={handleKeyDown}
      tabIndex={isActive ? 0 : -1}
      aria-hidden={!isActive}
      aria-label={`${t(project.nameKey)} — ${t(project.badgeKey)}`}
    >
      <motion.div
        className={styles.cardMedia}
        layoutId={enableSharedLayout ? `proj-media-${project.id}` : undefined}
      >
        {project.media.type === "video" ? (
          <video
            ref={videoRef}
            src={project.media.src}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img src={project.media.src} alt={project.media.alt ?? t(project.nameKey)} loading="lazy" />
        )}
      </motion.div>

      <div className={styles.cardBody}>
        {dossierNo && (
          <p className={cn(styles.dossierMeta, "folio")} aria-hidden={!isActive}>
            <span>{dossierNo}</span>
            <span aria-hidden="true">·</span>
            <span>{project.media.type === "video" ? "motion" : "still"}</span>
            <span aria-hidden="true">·</span>
            <span>{project.techTags.length} tech</span>
          </p>
        )}
        <span className={styles.tabBar}>
          <span className={styles.cardBadge}>{t(project.badgeKey)}</span>
          <span className={styles.tabRail} aria-hidden="true" />
        </span>
        <motion.h3
          className={styles.cardTitle}
          layoutId={enableSharedLayout ? `proj-title-${project.id}` : undefined}
        >
          {t(project.nameKey)}
        </motion.h3>
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
              data-cursor="open"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Outline defaults melt into the card: --input border is a ~12
                  channel-step delta over --card, so the 36px box reads shorter
                  than the filled sibling. Chip-recipe edge + interior keep the
                  secondary variant but make its footprint legible. */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-1 font-mono text-[0.72rem] tracking-wide text-muted-foreground hover:text-foreground"
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
