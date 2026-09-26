import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function useScrollReveal<T extends HTMLElement>(options?: { y?: number; duration?: number; stagger?: number }) {
  const ref = useRef<T>(null);
  const { y = 60, duration = 0.8, stagger = 0.08 } = options || {};

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelectorAll('[data-reveal]'), {
        y,
        opacity: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      });
    }, ref);
    return () => ctx.revert();
  }, [y, duration, stagger]);

  return ref;
}
