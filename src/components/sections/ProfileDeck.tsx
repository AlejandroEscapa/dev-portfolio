import { useMemo } from 'react';
import { ProfileSectionHeader } from './ProfileSectionHeader';
import { PassionCard } from './PassionCard';
import { PROFILE_PASSIONS } from '@/lib/profile-content';

export function ProfileDeck() {
  const total = useMemo(() => PROFILE_PASSIONS.length, []);

  return (
    <div className="profile-deck" data-deck-length={total}>
      <ProfileSectionHeader />
      <div className="profile-deck-grid">
        {PROFILE_PASSIONS.map((key, i) => (
          <PassionCard
            key={key}
            passion={key}
            index={i}
            total={total}
          />
        ))}
      </div>
    </div>
  );
}
