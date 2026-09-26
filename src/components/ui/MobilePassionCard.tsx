import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PASSION_DATA, getAccentStyle } from '@/lib/passion-data';
import { PASSION_ART } from '@/components/ui/PassionArt';
import type { ProfilePassion } from '@/lib/profile-content';

interface MobilePassionCardProps {
  passion: ProfilePassion;
}

export function MobilePassionCard({ passion }: MobilePassionCardProps) {
  const { t } = useLanguage();
  const data = PASSION_DATA[passion];
  const [isExpanded, setIsExpanded] = useState(false);
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
      className="profile-mobile-card"
      style={accentStyle}
      data-passion={passion}
    >
      <div className="profile-mobile-card-art" aria-hidden="true">
        <PassionArtComponent accentColor={accentColor} accentSoft={accentSoft} static />
      </div>
      <h3 className="profile-mobile-card-name">{t(`profile.passion.${passion}.label`)}</h3>
      <p className="profile-mobile-card-copy">{t(data.copyKey)}</p>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="profile-mobile-card-expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="profile-mobile-card-expanded-copy">{t(data.copyExtendedKey)}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        className="profile-mobile-card-cta"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
      >
        <span>{isExpanded ? t(data.ctaCollapseKey) : t(data.ctaExpandKey)}</span>
        <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} aria-hidden="true">
          <ChevronDown size={14} />
        </motion.span>
      </button>
    </article>
  );
}
