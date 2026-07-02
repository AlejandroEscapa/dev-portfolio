import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PASSION_DATA, getAccentStyle } from '@/lib/passion-data';
import { PASSION_ART } from '@/components/ui/PassionArt';
import type { ProfilePassion } from '@/lib/profile-content';

interface PassionCardProps {
  passion: ProfilePassion;
  index: number;
  total: number;
}

export function PassionCard({ passion, index, total }: PassionCardProps) {
  const { t } = useLanguage();
  const data = PASSION_DATA[passion];
  const [isExpanded, setIsExpanded] = useState(data.expandedByDefault);
  const PassionArtComponent = PASSION_ART[data.artKey];

  const accentStyle = useMemo(() => getAccentStyle(passion), [passion]);
  // Inline values are stored as raw HSL triples. SVG props need full colors,
  // so wrap them in `hsl(...)` here. CSS consumers use the triple directly
  // via the alpha-placeholder convention.
  const accentRaw = (accentStyle['--card-accent' as string] as string) ?? '0 0% 100%';
  const accentSoftRaw = (accentStyle['--card-accent-soft' as string] as string) ?? accentRaw;
  const accentColor = `hsl(${accentRaw})`;
  const accentSoft = `hsl(${accentSoftRaw})`;

  return (
    <article
      className="profile-card"
      style={{
        ...accentStyle,
        ['--card-index' as string]: index,
        ['--card-total' as string]: total,
      }}
      data-passion={passion}
    >
      <div className="profile-card-art" aria-hidden="true">
        <PassionArtComponent accentColor={accentColor} accentSoft={accentSoft} />
      </div>

      <div className="profile-card-content">
        <h3 className="profile-card-name">{t(`profile.passion.${passion}.label`)}</h3>

        <p className="profile-card-copy">{t(data.copyKey)}</p>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="expanded"
              className="profile-card-expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="profile-card-expanded-copy">{t(data.copyExtendedKey)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="profile-card-actions">
        <button
          type="button"
          className="profile-card-cta"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          aria-controls={`passion-${passion}-expanded`}
        >
          <span>{isExpanded ? t(data.ctaCollapseKey) : t(data.ctaExpandKey)}</span>
          <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} aria-hidden="true">
            <ChevronDown size={14} />
          </motion.span>
        </button>
      </div>
    </article>
  );
}
