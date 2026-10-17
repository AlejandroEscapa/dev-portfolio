import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

let lenisInstance: Lenis | null = null;

/** Live Lenis instance (null before mount, after unmount, and in tests). */
export function getLenis() {
  return lenisInstance;
}

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenisInstance = lenis;
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);

    // Con las metricas de la fuente fallback los offsets del pin se calculan
    // mal (y quedan desplazados hasta el primer resize): este refresh los
    // rehace con las definitivas. `cancelled` evita tocar ScrollTrigger si la
    // promesa se resuelve despues del desmontaje.
    let cancelled = false;
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        // Tras el desmontaje (o en un entorno ya desmantelado) refrescar deja
        // timers de ScrollTrigger corriendo contra un DOM que no existe.
        if (cancelled || typeof window === 'undefined' || !window.requestAnimationFrame) return;
        ScrollTrigger.refresh();
      });
    }

    return () => {
      cancelled = true;
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
