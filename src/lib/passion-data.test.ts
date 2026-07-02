import { describe, it, expect } from 'vitest';
import { PASSION_DATA, PASSION_KEYS, getAccentStyle } from './passion-data';

describe('passion-data', () => {
  it('exposes 3 passions in expected order', () => {
    expect(PASSION_KEYS).toEqual(['music', 'cooking', 'gaming']);
    expect(PASSION_KEYS).toHaveLength(3);
  });

  it('has valid structure for each passion', () => {
    PASSION_KEYS.forEach((key) => {
      const d = PASSION_DATA[key];
      expect(d.gradient.h).toBeGreaterThanOrEqual(0);
      expect(d.gradient.h).toBeLessThan(360);
      expect(['music', 'cooking', 'gaming']).toContain(d.artKey);
      expect(d.copyKey).toBe(`profile.passion.${key}.copy`);
      expect(d.copyExtendedKey).toBe(`profile.passion.${key}.copy_extended`);
    });
  });

  it('uses unique gradient hues for each passion', () => {
    const hues = PASSION_KEYS.map((k) => PASSION_DATA[k].gradient.h);
    const unique = new Set(hues);
    expect(unique.size).toBe(hues.length);
  });

  it('exposes accent CSS variables as raw HSL triples (composed by CSS via alpha-placeholder)', () => {
    const style = getAccentStyle('music');
    // Raw triple format `<h> <s>% <l>%` — NOT pre-wrapped in hsl(...).
    // CSS consumers compose via `hsl(var(--card-accent) / α)`; React-side
    // SVG props wrap the triple in `hsl(...)` themselves.
    expect(style['--card-accent']).toBe('270 80% 65%');
    expect(style['--card-accent-soft']).not.toMatch(/hsl\(/);
    expect(style['--card-accent-soft']).toMatch(/^\d+ \d+% \d+%$/);
  });
});


