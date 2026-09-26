import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMemo } from 'react';

export type GpuTier = 'low' | 'mid' | 'high';

interface DeviceTier {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  gpuTier: GpuTier;
  shouldUseFallback: boolean;
}

function detectGpuTier(): GpuTier {
  if (typeof window === 'undefined') return 'mid';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return 'low';
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'mid';
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
    if (!renderer) return 'mid';
    const low = /Mali-4|Adreno 3|Mali-T6|Intel HD Graphics 4/i;
    const mid = /Mali-G|Adreno 5|Intel UHD 6|M1|M2/i;
    if (low.test(renderer)) return 'low';
    if (mid.test(renderer)) return 'mid';
    return 'high';
  } catch {
    return 'mid';
  }
}

export function useDeviceTier(): DeviceTier {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const prefersReducedMotion = useReducedMotion();
  const gpuTier = useMemo(() => detectGpuTier(), []);

  return {
    isMobile,
    prefersReducedMotion,
    gpuTier,
    shouldUseFallback: isMobile || prefersReducedMotion || gpuTier === 'low',
  };
}
