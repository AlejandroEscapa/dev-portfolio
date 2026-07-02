import { useCallback, useMemo, useRef } from "react";
import type { Project } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import styles from "./projects.module.css";

const DRAG_THRESHOLD = 50;
const DRAG_DEBOUNCE_MS = 600;

interface ProjectsCarouselProps {
  projects: Project[];
  currentIndex: number;
  setCurrentIndex: (next: number) => void;
  onSelect: (project: Project) => void;
}

export const ProjectsCarousel = ({ projects, currentIndex, setCurrentIndex, onSelect }: ProjectsCarouselProps) => {
  const dragStartX = useRef<number | null>(null);
  const lastShiftAt = useRef<number>(0);
  const dragging = useRef<boolean>(false);

  const positionMap = useMemo(
    () => projects.map((_, i) => 3 + (i - currentIndex)),
    [projects, currentIndex]
  );

  const shift = useCallback(
    (delta: number) => {
      const now = Date.now();
      if (now - lastShiftAt.current < DRAG_DEBOUNCE_MS) return;
      lastShiftAt.current = now;
      const total = projects.length;
      if (total < 2) return;
      const next = (currentIndex + delta + total) % total;
      setCurrentIndex(next);
    },
    [currentIndex, projects.length, setCurrentIndex]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX.current = e.clientX;
    dragging.current = false;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = Math.abs((e as unknown as { __lastY?: number }).__lastY ?? 0);
    (e as unknown as { __lastY: number }).__lastY = deltaY;
    if (Math.abs(deltaX) > DRAG_THRESHOLD && Math.abs(deltaX) > deltaY) {
      dragging.current = true;
      shift(deltaX > 0 ? -1 : 1);
      dragStartX.current = e.clientX;
    }
  };

  const onPointerUp = () => {
    dragStartX.current = null;
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      shift(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      shift(1);
    }
  };

  const onCardClickCapture = (e: React.MouseEvent) => {
    if (dragging.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className={styles.carouselOuter}>
      <div
        className={styles.carousel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onClickCapture={onCardClickCapture}
        tabIndex={0}
        role="region"
        aria-label="Projects carousel"
      >
        <div className={styles.stageInner}>
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              position={positionMap[i]}
              isActive={positionMap[i] === 3}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
