import { useLanguage } from '@/context/LanguageContext';

export function ProfileSectionHeader() {
  const { t } = useLanguage();
  return (
    <header className="profile-showcase-header">
      <span className="profile-section-label">{t('profile.section_label')}</span>
      <h2 className="profile-section-title text-gradient-primary">{t('profile.section_title')}</h2>
      <p className="profile-section-intro">{t('profile.section_intro')}</p>
    </header>
  );
}
