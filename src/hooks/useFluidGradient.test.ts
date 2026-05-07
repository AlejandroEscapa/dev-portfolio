import { describe, it, expect } from 'vitest';
import { 
  parseHSLA, 
  lerpHSLA, 
  findNeighbors, 
  interpolateColors, 
  interpolateGridOpacity, 
  computeSectionFx, 
  FLUID_ATMOSPHERES 
} from './useFluidGradient';

describe('useFluidGradient Utilities', () => {
  describe('parseHSLA', () => {
    it('should parse valid HSLA strings', () => {
      const color = 'hsl(248 90% 66% / 0.45)';
      const result = parseHSLA(color);
      expect(result).toEqual({ h: 248, s: 90, l: 66, a: 0.45 });
    });

    it('should throw error for invalid HSLA strings', () => {
      expect(() => parseHSLA('invalid-color')).toThrow('Invalid HSLA string');
    });
  });

  describe('lerpHSLA', () => {
    it('should interpolate between two colors', () => {
      const c1 = 'hsl(0 100% 50% / 1.0)';
      const c2 = 'hsl(180 100% 50% / 0.0)';
      const result = lerpHSLA(c1, c2, 0.5);
      // Hue should be 90, Sat 100, Light 50, Alpha 0.5
      expect(result).toBe('hsl(90.0 100.0% 50.0% / 0.50)');
    });

    it('should handle shortest path hue interpolation', () => {
      const c1 = 'hsl(350 100% 50% / 1.0)';
      const c2 = 'hsl(10 100% 50% / 1.0)';
      const result = lerpHSLA(c1, c2, 0.5);
      // From 350 to 10 is a gap of 20 degrees crossing 0/360.
      // Midpoint should be 0/360.
      expect(result).toBe('hsl(0.0 100.0% 50.0% / 1.00)');
    });
  });

  describe('findNeighbors', () => {
    it('should find correct neighbors for middle progress', () => {
      const progress = 0.3; // Between 0.2 and 0.4
      const [lo, hi] = findNeighbors(progress, FLUID_ATMOSPHERES);
      expect(lo.progress).toBe(0.2);
      expect(hi.progress).toBe(0.4);
    });

    it('should handle progress at boundary', () => {
      const [lo, hi] = findNeighbors(0, FLUID_ATMOSPHERES);
      expect(lo.progress).toBe(0);
      expect(hi.progress).toBe(0);
    });

    it('should handle progress beyond 1', () => {
      const [lo, hi] = findNeighbors(1.1, FLUID_ATMOSPHERES);
      expect(lo.progress).toBe(1);
      expect(hi.progress).toBe(1);
    });
  });

  describe('interpolateColors', () => {
    it('should return start colors at progress 0', () => {
      const colors = interpolateColors(0, FLUID_ATMOSPHERES);
      expect(colors).toEqual(FLUID_ATMOSPHERES[0].stops);
    });

    it('should return end colors at progress 1', () => {
      const colors = interpolateColors(1, FLUID_ATMOSPHERES);
      expect(colors).toEqual(FLUID_ATMOSPHERES[5].stops);
    });
  });

  describe('interpolateGridOpacity', () => {
    it('should interpolate opacity correctly', () => {
      const opacity = interpolateGridOpacity(0.1, FLUID_ATMOSPHERES);
      // 0.0 -> 0.45, 0.2 -> 0.30. Midpoint 0.1 should be approx (0.45 + 0.30)/2 = 0.375
      // but we use smoothstep, so it will be slightly different.
      expect(opacity).toBeGreaterThan(0.30);
      expect(opacity).toBeLessThan(0.45);
    });
  });

  describe('computeSectionFx', () => {
    it('should provide maximum scale/blur at center of section', () => {
      const fx = computeSectionFx(0.3, FLUID_ATMOSPHERES, false); // Center of 0.2 and 0.4
      expect(fx.scale).toBeCloseTo(1.12, 2);
      expect(fx.blur).toBeCloseTo(3, 2);
    });

    it('should provide base scale/blur at boundaries', () => {
      const fx = computeSectionFx(0.2, FLUID_ATMOSPHERES, false); // Boundary
      expect(fx.scale).toBeCloseTo(1.0, 2);
      expect(fx.blur).toBeCloseTo(0, 2);
    });

    it('should use mobile values when isMobile is true', () => {
      const fx = computeSectionFx(0.3, FLUID_ATMOSPHERES, true);
      expect(fx.scale).toBeCloseTo(1.06, 2);
      expect(fx.blur).toBeCloseTo(2, 2);
    });
  });
});
