/**
 * ImageBackground — tratamiento cinematográfico performante.
 *
 * Brand agresivo 2026 (Volt-Noir sobre tokens existentes):
 * una sola imagen nítida con grade cine + viñeta direccional + mesh
 * de marca a baja opacidad. Sin glow duplicado ni filtro SVG fullscreen
 * (los dos costes GPU más altos del anterior: blur(60px) + feTurbulence
 * sobre todo el viewport cada frame).
 *
 * Motion (solo transform/opacity, GPU):
 * - Intro dolly: scale 1.12 -> 1.02, 1.8s expo-out, tras el boot.
 * - Parallax scroll: y 0 -> -60px + scale 1.02 -> 1.08 vía
 *   framer-motion useScroll (nunca window scroll listener).
 * - prefers-reduced-motion: estático, sin parallax ni dolly.
 */

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

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
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  // Parallax corto: el fondo cede 60px y respira un 6% al bajar.
  const y = useTransform(scrollY, [0, 1200], [0, -60]);
  const scale = useTransform(scrollY, [0, 1200], [1.02, 1.08]);
  const opacity = useTransform(scrollY, [0, 900], [1, 0.85]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background"
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduce ? undefined : { y, scale, opacity }}
      >
        <motion.img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{
            // Grade cine legible sobre tokens: la imagen baja 28% y gana
            // contraste/saturación para que el mesh de marca la ancle.
            filter: 'brightness(0.72) contrast(1.06) saturate(1.12)',
            transform: 'scale(1.02)',
          }}
          initial={reduce ? false : { scale: 1.12, opacity: 0 }}
          animate={reduce ? undefined : { scale: 1.02, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {/* Mesh de marca: primary/accent anclan la foto al Brand. Tokens, no hex. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(at 18% 12%, hsl(var(--primary) / 0.16) 0px, transparent 55%),' +
            'radial-gradient(at 85% 18%, hsl(var(--accent) / 0.1) 0px, transparent 50%),' +
            'radial-gradient(at 80% 85%, hsl(var(--mesh-3) / 0.12) 0px, transparent 55%)',
        }}
      />

      {/* Legibilidad: rampa direccional top->bottom sobre background. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, hsl(var(--background) / 0.42) 0%, hsl(var(--background) / 0.18) 30%, hsl(var(--background) / 0.28) 62%, hsl(var(--background) / 0.88) 100%)',
        }}
      />

      {/* Viñeta cine: foco al centro, bordes fundidos al background. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 75% at 50% 42%, transparent 52%, hsl(var(--background) / 0.6) 100%)',
        }}
      />
    </div>
  );
}
