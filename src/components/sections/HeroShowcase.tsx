/**
 * HeroShowcase — 40/60 split layout with three windows that measure
 * the SAME height (`.viewport-content` = 100vh − --nav-height):
 *
 *   ┌────────────────────────┬──────────────────────────────────┐
 *   │  3D window             │  Welcome window (Hero)           │
 *   │  viewport-content       │  viewport-content                │
 *   │  ─ sticky top-0        │                                  │
 *   │                        ├──────────────────────────────────┤
 *   │                        │  About window                    │
 *   │                        │  viewport-content + fullHeight   │
 *   └────────────────────────┴──────────────────────────────────┘
 *
 * All three panels share the exact same height. The 3D stays pinned
 * via CSS `position: sticky` (no JS). No @layer cascade ambiguity:
 * `.viewport-content` is defined OUTSIDE @layer utilities (unlayered)
 * so it always wins over Tailwind arbitrary-values like `h-[55vh]`.
 *
 * Padding: horizontal padding lives ONLY on `.section-px`
 * (single source of truth in `src/index.css`). Inner components MUST
 * NOT add their own `px-*` — stacking it would defeat the model.
 * To change lateral margin or panel height, edit `src/index.css`.
 *
 * Mobile fallback (< lg): stack vertically. 3D sits on top at 55vh,
 * content scrolls below normally (no sticky).
 */

import { type ReactNode, lazy, Suspense } from 'react';
import { WindowChrome } from '@/components/window/WindowChrome';

// The whole R3F tree (fiber + drei + postprocessing + GLB) is code-split
// out of the initial bundle; the mono "loading" line covers the fetch.
const HeroScene = lazy(() => import('@/components/three/HeroScene'));

interface HeroShowcaseProps {
  /** Right-column content. Typically:
   *    <WindowChrome className="viewport-content" fullHeight><Hero /></WindowChrome>
   *    <WindowChrome className="viewport-content" fullHeight><About /></WindowChrome> */
  children: ReactNode;
}

export function HeroShowcase({ children }: HeroShowcaseProps) {
  return (
    <div className="hero-showcase relative mb-8 w-full section-px">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]">
        {/* Left: 3D figure window. At <lg the column stacks on top of the
            right column at 55vh. At lg+ it becomes viewport-content so
            it aligns 1:1 with the Welcome window on the right.
            `lg:self-start` is required for `position: sticky` to work
            on a CSS grid item. */}
        <div className="relative max-lg:h-[55vh] lg:viewport-content lg:sticky lg:top-[var(--hero-pad-top)] lg:self-start">
          <WindowChrome
            title="~/object.glb"
            id="hero-3d"
            // h-full fills the sticky left column; overrides WindowChrome's
            // max-w-5xl / mx-auto defaults.
            className="h-full max-w-none mx-0"
            fullHeight
          >
            <div className="relative h-full min-h-[360px]">
              {/* Soft primary glow behind the 3D figure */}
              <div className="pointer-events-none absolute inset-0 -z-10 scale-90 rounded-full bg-primary/15 blur-3xl" />
              <Suspense
                fallback={
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="animate-pulse font-mono text-xs text-muted-foreground">
                      loading ~/object.glb …
                    </span>
                  </div>
                }
              >
                <HeroScene />
              </Suspense>
            </div>
          </WindowChrome>
        </div>

        {/* Right: Welcome (Hero) + About stacked. `gap-8` (32px) gives a
            touch more breathing room than the default `gap-6` so the
            rounded bottom border of the Welcome window doesn't read
            as touching the rounded top border of the About window.
            Both windows measure viewport-content (set by the parent's
            fullHeight prop on WindowChrome). The 3D stays pinned for
            the full height of this column, so visual alignment is
            preserved. */}
        <div className="relative flex flex-col gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}
