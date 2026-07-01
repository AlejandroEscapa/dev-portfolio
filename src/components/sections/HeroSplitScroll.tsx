/**
 * HeroSplitScroll — 40/60 split layout with a sticky 3D figure on the left.
 *
 * While the right column scrolls through Hero + About (the "resumen
 * profesional"), the left column stays pinned to the viewport. When the
 * grid container scrolls out (Perfil section reaches the viewport), the
 * 3D window naturally un-pins because there's no more parent height.
 *
 * Layout: both columns take 40/60 of the viewport width on desktop. The
 * left column is h-screen (fills the viewport) with the 3D window
 * filling it via h-full. The right column has two full-width children
 * (Hero + About) stacked vertically with a gap. The 3D stays pinned
 * for the full height of the right column's scroll.
 *
 * Implementation: CSS `position: sticky` on the left column. No JS, no
 * GSAP — the native browser behavior is the right tool for this pattern.
 *
 * Mobile fallback (< lg): stack vertically. The 3D window sits on top at
 * 55vh, content scrolls below normally (no sticky).
 */

import { type ReactNode } from 'react';
import { WindowChrome } from '@/components/window/WindowChrome';
import { Scene } from '@/components/three/Scene';
import { Hero3D } from '@/components/three/Hero3D';

interface HeroSplitScrollProps {
  /** Right-column content. Typically <WindowChrome id="hero"><Hero /></WindowChrome>
   *  followed by <WindowChrome id="about"><About /></WindowChrome>. */
  children: ReactNode;
}

export function HeroSplitScroll({ children }: HeroSplitScrollProps) {
  return (
    <div className="relative w-full section-px">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 lg:gap-6">
        {/* Left: sticky 3D figure window filling the full viewport height.
            align-self:start is required for sticky to work in CSS grid items. */}
        <div className="relative h-[55vh] lg:sticky lg:top-0 lg:h-screen lg:self-start">
          <WindowChrome
            title="~/object.glb"
            id="hero-3d"
            // h-full fills the sticky left column (h-screen). Overrides
            // WindowChrome's max-w-5xl / mx-auto / my-8 defaults.
            className="h-full max-w-none my-0 mx-0"
            fullHeight
          >
            <div className="relative h-full min-h-[360px]">
              {/* Soft primary glow behind the wireframe */}
              <div className="pointer-events-none absolute inset-0 -z-10 scale-90 rounded-full bg-primary/15 blur-3xl" />
              <Scene
                camera={{ position: [0, 0, 5], fov: 75 }}
                className="!absolute inset-0"
              >
                <Hero3D />
              </Scene>
            </div>
          </WindowChrome>
        </div>

        {/* Right: full-width windows (Hero + About) stacked with a gap.
            The 3D stays pinned to the left for the full height of this column. */}
        <div className="relative flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}
