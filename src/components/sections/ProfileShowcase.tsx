import { useDeviceTier } from '@/hooks/useDeviceTier';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { ProfileDeck } from './ProfileDeck';
import { MobilePassionCard } from '@/components/ui/MobilePassionCard';
import { PROFILE_PASSIONS } from '@/lib/profile-content';

export function ProfileShowcase() {
  const { shouldUseFallback } = useDeviceTier();

  if (shouldUseFallback) {
    return (
      <div className="profile-showcase">
        <ProfileSectionHeader />
        <div className="profile-mobile-list">
          {PROFILE_PASSIONS.map((key) => (
            <MobilePassionCard key={key} passion={key} />
          ))}
        </div>
      </div>
    );
  }

  return <ProfileDeck />;
}
