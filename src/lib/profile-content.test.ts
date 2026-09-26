import { describe, it, expect } from 'vitest';
import { PROFILE_PASSIONS, PASSION_META, nearestPassion, visibilityCurve, lerpColor } from './profile-content';

describe('profile-content', () => {
  it('exposes exactly 3 passions in the right order', () => {
    expect(PROFILE_PASSIONS).toEqual(['cooking', 'gaming', 'music']);
    expect(PROFILE_PASSIONS).toHaveLength(3);
  });

  it('defines meta for every passion', () => {
    PROFILE_PASSIONS.forEach((key) => {
      const meta = PASSION_META[key];
      expect(meta).toBeDefined();
      expect(meta.key).toBe(key);
      expect(meta.windowTitle).toMatch(/^~.*\.md$/);
      expect(meta.ariaLabel.length).toBeGreaterThan(0);
      expect(meta.scrollPhase).toBeGreaterThanOrEqual(0);
      expect(meta.scrollPhase).toBeLessThanOrEqual(1);
    });
  });

  it('nearestPassion picks the closest scroll phase', () => {
    expect(nearestPassion(0)).toBe('cooking');
    expect(nearestPassion(0.25)).toBe('cooking');
    expect(nearestPassion(0.5)).toBe('gaming');
    expect(nearestPassion(0.8)).toBe('music');
    expect(nearestPassion(1)).toBe('music');
  });

  it('visibilityCurve returns 1 at the phase and 0 beyond the width', () => {
    expect(visibilityCurve(0.5, 0.5, 0.3)).toBe(1);
    expect(visibilityCurve(0, 0, 0.3)).toBe(1);
    expect(visibilityCurve(0.5, 0, 0.3)).toBe(0);
    expect(visibilityCurve(0.5, 0.99, 0.3)).toBe(0);
  });

  it('lerpColor interpolates h/s/l', () => {
    const a = { h: 0, s: 0, l: 0 };
    const b = { h: 100, s: 50, l: 25 };
    expect(lerpColor(a, b, 0)).toEqual(a);
    expect(lerpColor(a, b, 1)).toEqual(b);
    expect(lerpColor(a, b, 0.5).l).toBeCloseTo(12.5, 1);
  });
});
