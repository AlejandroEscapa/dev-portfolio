import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

describe('useDeviceTier', () => {
  it('returns mobile or desktop', () => {
    const { result } = renderHook(() => useDeviceTier());
    expect(['mobile', 'desktop']).toContain(result.current);
  });
});

describe('useReducedMotion', () => {
  it('returns boolean', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(typeof result.current).toBe('boolean');
  });
});
