export const PROFILE_PASSIONS = ['cooking', 'gaming', 'music'] as const;
export type ProfilePassion = (typeof PROFILE_PASSIONS)[number];

export interface PassionMeta {
  key: ProfilePassion;
  index: number;
  windowTitle: string;
  modelPath: string;
  lightColor: { h: number; s: number; l: number };
  emissiveColor: { h: number; s: number; l: number };
  accentVar: string;
  ariaLabel: string;
  scrollPhase: number;
}

export const PASSION_META: Record<ProfilePassion, PassionMeta> = {
  cooking: {
    key: 'cooking',
    index: 0,
    windowTitle: '~/cooking.md',
    modelPath: '/models/profile/chef-hat.glb',
    lightColor: { h: 25, s: 90, l: 60 },
    emissiveColor: { h: 30, s: 95, l: 55 },
    accentVar: '--shadow-glow-accent',
    ariaLabel: 'Passion: cooking',
    scrollPhase: 0,
  },
  gaming: {
    key: 'gaming',
    index: 1,
    windowTitle: '~/gaming.md',
    modelPath: '/models/profile/gamepad.glb',
    lightColor: { h: 150, s: 70, l: 55 },
    emissiveColor: { h: 150, s: 80, l: 50 },
    accentVar: '--primary-glow',
    ariaLabel: 'Passion: gaming',
    scrollPhase: 0.5,
  },
  music: {
    key: 'music',
    index: 2,
    windowTitle: '~/music.md',
    modelPath: '/models/profile/keyboard.glb',
    lightColor: { h: 280, s: 80, l: 65 },
    emissiveColor: { h: 270, s: 90, l: 60 },
    accentVar: '--primary',
    ariaLabel: 'Passion: music',
    scrollPhase: 1,
  },
};

export function nearestPassion(offset: number): ProfilePassion {
  const distances = PROFILE_PASSIONS.map((key) => ({
    key,
    distance: Math.abs(PASSION_META[key].scrollPhase - offset),
  }));
  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].key;
}

export function visibilityCurve(offset: number, phase: number, width = 0.35): number {
  const d = Math.abs(offset - phase) / width;
  return Math.max(0, Math.min(1, 1 - d * d));
}

export function lerpColor(
  a: { h: number; s: number; l: number },
  b: { h: number; s: number; l: number },
  t: number
): { h: number; s: number; l: number } {
  return {
    h: a.h + (b.h - a.h) * t,
    s: a.s + (b.s - a.s) * t,
    l: a.l + (b.l - a.l) * t,
  };
}
