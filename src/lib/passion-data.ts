import { type CSSProperties } from 'react';

export interface PassionData {
  gradient: { h: number; s: number; l: number };
  artKey: 'music' | 'cooking' | 'gaming';
  copyKey: string;
  copyExtendedKey: string;
  ctaExpandKey: string;
  ctaCollapseKey: string;
  expandedByDefault: boolean;
}

export const PASSION_DATA = {
  music: {
    gradient: { h: 270, s: 80, l: 65 },
    artKey: 'music',
    copyKey: 'profile.passion.music.copy',
    copyExtendedKey: 'profile.passion.music.copy_extended',
    ctaExpandKey: 'profile.cta_expand',
    ctaCollapseKey: 'profile.cta_collapse',
    expandedByDefault: false,
  },
  cooking: {
    gradient: { h: 25, s: 90, l: 60 },
    artKey: 'cooking',
    copyKey: 'profile.passion.cooking.copy',
    copyExtendedKey: 'profile.passion.cooking.copy_extended',
    ctaExpandKey: 'profile.cta_expand',
    ctaCollapseKey: 'profile.cta_collapse',
    expandedByDefault: false,
  },
  gaming: {
    gradient: { h: 150, s: 70, l: 55 },
    artKey: 'gaming',
    copyKey: 'profile.passion.gaming.copy',
    copyExtendedKey: 'profile.passion.gaming.copy_extended',
    ctaExpandKey: 'profile.cta_expand',
    ctaCollapseKey: 'profile.cta_collapse',
    expandedByDefault: false,
  },
} as const satisfies Record<string, PassionData>;

export type PassionKey = keyof typeof PASSION_DATA;

export const PASSION_KEYS = Object.keys(PASSION_DATA) as PassionKey[];

export function getAccentStyle(passion: PassionKey): CSSProperties {
  const { h, s, l } = PASSION_DATA[passion].gradient;
  // Emit raw HSL triples (NOT pre-wrapped in `hsl(...)`) so CSS can compose
  // them via the alpha-placeholder convention `hsl(var(--card-accent) / α)`.
  // React-side consumers that need a full color string (e.g. SVG fill/stroke
  // attributes) wrap the triple themselves in `hsl(...)`.
  return {
    ['--card-accent' as string]: `${h} ${s}% ${l}%`,
    ['--card-accent-soft' as string]: `${h} ${Math.round(s * 0.55)}% ${Math.round(l * 1.15)}%`,
  };
}
