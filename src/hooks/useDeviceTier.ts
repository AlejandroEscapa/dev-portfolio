import { useState, useEffect } from 'react';

export type DeviceTier = 'mobile' | 'desktop';

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setTier(e.matches ? 'mobile' : 'desktop');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return tier;
}
