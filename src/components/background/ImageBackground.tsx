/**
 * ImageBackground — full-viewport decorative image with responsive srcset.
 *
 * Renders a fixed/inset-0/pointer-events-none wrapper around an <img>
 * with object-cover, a subtle darken overlay, and a radial vignette
 * for theme integration. The srcSet + sizes props let the browser
 * pick the right size from /public/pexels-*.webp.
 *
 * Design notes (pro):
 * - object-cover fills the viewport without distortion; if the source
 *   aspect doesn't match, the browser crops symmetrically.
 * - bg-background on the parent guarantees a theme-colored fill behind
 *   any sub-pixel sliver of empty space during viewport changes.
 * - The 35% darken overlay + radial vignette (transparent 45% center ->
 *   hsl(var(--background) / 0.55) edges) keep the image from competing
 *   with the page content while still letting it read through.
 * - fetchPriority="high" + loading="eager" mark this as the LCP image;
 *   the matching <link rel="preload"> in index.html warms the cache.
 *
 * Effects:
 * - Dithering: SVG feTurbulence noise overlay for subtle film grain
 * - Glow: Blurred copy of the image with boosted brightness
 */

interface ImageBackgroundProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
}

export function ImageBackground({
  src,
  srcSet,
  sizes = '100vw',
  alt = '',
}: ImageBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background"
    >
      {/* Hidden SVG filter for dithering noise */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="dither-noise" color-interpolation-filters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="grey"
            />
            <feBlend
              in="SourceGraphic"
              in2="grey"
              mode="overlay"
            />
          </filter>
        </defs>
      </svg>

      {/* Glow layer: blurred copy of the image with brightness boost */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
        style={{
          filter: 'blur(60px) brightness(1.3) saturate(1.2)',
          opacity: 0.15,
          transform: 'scale(1.1)',
        }}
      />

      {/* Main background image */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
      />

      {/* Dithering overlay: subtle film grain texture */}
      <div
        className="absolute inset-0"
        style={{
          filter: 'url(#dither-noise)',
          opacity: 0.05,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Subtle full-surface darken so content stays readable over the image. */}
      <div className="absolute inset-0 bg-background/35" />

      {/* Vignette: focus toward the center, fade the edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, hsl(var(--background) / 0.55) 100%)',
        }}
      />
    </div>
  );
}
