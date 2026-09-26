import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { projectCategories, type ProjectCategoryId } from "@/data/projects";
import { cn } from "@/lib/utils";
import styles from "./projects.module.css";

interface ProjectCategoryChipsProps {
  activeCategories: ProjectCategoryId[];
  onChange: (next: ProjectCategoryId[]) => void;
}

// Single-highlight indicator owner. When ≥2 categories active, returns null
// so the indicator is hidden to avoid duplicate sliding backgrounds while
// multi-select still uses CSS color change on the active chips.
type IndicatorKey = "all" | ProjectCategoryId;

export const ProjectCategoryChips = ({ activeCategories, onChange }: ProjectCategoryChipsProps) => {
  const { t } = useLanguage();

  const toggle = (id: ProjectCategoryId) => {
    if (activeCategories.includes(id)) {
      onChange(activeCategories.filter((c) => c !== id));
    } else {
      onChange([...activeCategories, id]);
    }
  };

  const isAllActive = activeCategories.length === 0;
  const singleActiveId: IndicatorKey | null =
    activeCategories.length === 0 ? "all" : activeCategories.length === 1 ? activeCategories[0] : null;

  const renderIndicator = (key: IndicatorKey) => (
    <AnimatePresence>
      {singleActiveId === key && (
        <motion.span
          layoutId="chip-indicator"
          className={styles.chipBg}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
    </AnimatePresence>
  );

  return (
    <LayoutGroup>
      <div className={styles.chips} role="group" aria-label={t("projects.filter_all")}>
        <div className={styles.chipTrack}>
          <button
            type="button"
            className={cn(styles.chip)}
            data-active={isAllActive}
            aria-pressed={isAllActive}
            onClick={() => onChange([])}
          >
            {renderIndicator("all")}
            <span className={styles.chipLabel}>{t("projects.filter_all")}</span>
          </button>
          {projectCategories.map((cat) => {
            const active = activeCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                className={cn(styles.chip)}
                data-active={active}
                aria-pressed={active}
                onClick={() => toggle(cat.id)}
              >
                {renderIndicator(cat.id)}
                <span className={styles.chipLabel}>{t(cat.i18nKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
};
