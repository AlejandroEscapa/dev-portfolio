import { type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ArtProps {
  className?: string;
  style?: CSSProperties;
  accentColor: string;
  accentSoft: string;
  /** Render the art without any motion effects. Mobile fallback / choreography off. */
  static?: boolean;
}

function Vinyl({ className, style, accentColor, accentSoft, static: isStatic = false }: ArtProps) {
  const reducedMotion = useReducedMotion();
  const motionEnabled = !isStatic && !reducedMotion;
  return (
    <motion.svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-motion={motionEnabled ? 'enabled' : 'reduced'}
    >
      <defs>
        <radialGradient id="vinyl-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#vinyl-glow)" />

      {/* Spinning vinyl body — rotates via CSS @keyframes profile-vinyl-spin (18s linear infinite). */}
      <g className="profile-art-vinyl-spin" data-testid="vinyl-spinner">
        {[88, 82, 76, 70, 64, 58, 52, 46, 40, 34].map((r, i) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            stroke={accentColor}
            strokeOpacity={0.18 + (i % 3) * 0.06}
            strokeWidth="0.4"
            fill="none"
          />
        ))}

        <circle cx="100" cy="100" r="32" fill={accentColor} fillOpacity="0.12" stroke={accentColor} strokeOpacity="0.6" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="32" stroke={accentColor} strokeOpacity="0.5" strokeWidth="0.4" fill="none" strokeDasharray="2 2" />

        <circle cx="100" cy="100" r="4" fill={accentColor} fillOpacity="0.8" />
        <circle cx="100" cy="100" r="1.4" fill="hsl(var(--background))" />

        {/* Play checkmark — pulses opacity [0.5, 1, 0.5] every 2s. */}
        <motion.path
          d="M85 100 L93 108 L115 86"
          stroke={accentSoft}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ opacity: 0.7 }}
          animate={motionEnabled ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          data-testid="vinyl-play"
        />

        <path
          d="M152 50 L156 46 L160 50 L164 46"
          stroke={accentColor}
          strokeWidth="0.6"
          strokeOpacity="0.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="166" cy="42" r="2" fill={accentColor} fillOpacity="0.5" />
      </g>

      {/* Tonearm — swings [−12°, +12°, −12°] every 6s, pivots from (165, 35) in SVG user space. */}
      <motion.g
        animate={motionEnabled ? { rotate: [-12, 12, -12] } : { rotate: 0 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '165px 35px' }}
        data-testid="vinyl-tonearm"
      >
        <line
          x1="165"
          y1="35"
          x2="105"
          y2="95"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <circle cx="165" cy="35" r="2.5" fill={accentColor} fillOpacity="0.85" />
        <circle cx="105" cy="95" r="2.2" fill={accentColor} fillOpacity="0.9" />
      </motion.g>
    </motion.svg>
  );
}

function ChefHat({ className, style, accentColor, accentSoft, static: isStatic = false }: ArtProps) {
  const reducedMotion = useReducedMotion();
  const motionEnabled = !isStatic && !reducedMotion;
  return (
    <motion.svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-motion={motionEnabled ? 'enabled' : 'reduced'}
    >
      <defs>
        <radialGradient id="chef-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#chef-glow)" />

      {/* Chef hat body — breathes via CSS @keyframes profile-chef-breathe (3s ease-in-out infinite). */}
      <g className="profile-art-chef-breathe" data-testid="chef-breather">
        <path
          d="M50 110 C50 90, 35 88, 35 70 C35 52, 52 42, 68 48 C70 32, 88 22, 100 22 C112 22, 130 32, 132 48 C148 42, 165 52, 165 70 C165 88, 150 90, 150 110 Z"
          fill={accentColor}
          fillOpacity="0.08"
          stroke={accentColor}
          strokeOpacity="0.7"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        <path
          d="M70 50 C72 65, 80 75, 88 80 M130 50 C128 65, 120 75, 112 80 M100 28 C100 50, 100 70, 100 90"
          stroke={accentColor}
          strokeOpacity="0.4"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
        />

        <rect x="44" y="108" width="112" height="22" rx="3" fill={accentColor} fillOpacity="0.1" stroke={accentColor} strokeOpacity="0.7" strokeWidth="1" />
        <line x1="60" y1="118" x2="140" y2="118" stroke={accentColor} strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="3 2" />

        <path
          d="M58 135 L62 142 M72 132 L75 140 M100 134 L100 144 M128 132 L125 140 M142 135 L138 142"
          stroke={accentSoft}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
      </g>

      {/* Vapor: 3 rising wisps with staggered cycle (4s, ease-in-out, delays 0 / 0.66s / 1.33s). */}
      {[
        { d: 'M70 100 Q 78 65 82 25', delay: 0 },
        { d: 'M100 95 Q 104 60 108 18', delay: 0.66 },
        { d: 'M130 100 Q 122 65 118 25', delay: 1.33 },
      ].map((vapor, i) => (
        <motion.path
          key={i}
          d={vapor.d}
          stroke={accentColor}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.45"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            motionEnabled
              ? { pathLength: [0, 1, 1, 0], opacity: [0, 0.65, 0.65, 0] }
              : { pathLength: 0.5, opacity: 0.4 }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: vapor.delay,
          }}
          data-testid={`chef-vapor-${i + 1}`}
        />
      ))}
    </motion.svg>
  );
}

function Controller({ className, style, accentColor, accentSoft, static: isStatic = false }: ArtProps) {
  const reducedMotion = useReducedMotion();
  const motionEnabled = !isStatic && !reducedMotion;
  return (
    <motion.svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-motion={motionEnabled ? 'enabled' : 'reduced'}
    >
      <defs>
        <radialGradient id="ctrl-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#ctrl-glow)" />

      <path
        d="M55 80 C40 80, 30 95, 30 115 C30 140, 45 160, 60 160 C72 160, 78 152, 84 148 L116 148 C122 152, 128 160, 140 160 C155 160, 170 140, 170 115 C170 95, 160 80, 145 80 C140 80, 135 82, 130 85 L70 85 C65 82, 60 80, 55 80 Z"
        fill={accentColor}
        fillOpacity="0.08"
        stroke={accentColor}
        strokeOpacity="0.7"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* D-pad: 4 motion.rect with fillOpacity [0.4, 0.9, 0.4] staggered every 0.2s, 3.2s cycle. */}
      {[
        { x: 55, y: 110, key: 'ctrl-dpad-up', delay: 0 },
        { x: 62, y: 113, key: 'ctrl-dpad-right', delay: 0.2 },
        { x: 55, y: 119, key: 'ctrl-dpad-down', delay: 0.4 },
        { x: 48, y: 116, key: 'ctrl-dpad-left', delay: 0.6 },
      ].map((btn) => (
        <motion.rect
          key={btn.key}
          x={btn.x}
          y={btn.y}
          width="6"
          height="6"
          rx="1"
          fill={accentColor}
          initial={{ fillOpacity: 0.6 }}
          animate={motionEnabled ? { fillOpacity: [0.4, 0.9, 0.4] } : { fillOpacity: 0.6 }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: btn.delay,
          }}
          data-testid={btn.key}
        />
      ))}

      <circle cx="145" cy="113" r="2.4" fill={accentColor} fillOpacity="0.85" />
      <circle cx="153" cy="120" r="2.4" fill={accentColor} fillOpacity="0.85" />
      <circle cx="145" cy="127" r="2.4" fill={accentColor} fillOpacity="0.85" />
      <circle cx="137" cy="120" r="2.4" fill={accentColor} fillOpacity="0.85" />

      {/* Sticks: opposite rotation phases (4s cycle, +2s offset on right). */}
      <motion.g
        animate={motionEnabled ? { rotate: [-6, 8, -6] } : { rotate: 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '75px 130px' }}
        data-testid="ctrl-stick-left"
      >
        <circle cx="75" cy="130" r="6" stroke={accentColor} strokeOpacity="0.7" strokeWidth="1" fill="none" />
        <circle cx="75" cy="130" r="2" fill={accentColor} fillOpacity="0.6" />
      </motion.g>
      <motion.g
        animate={motionEnabled ? { rotate: [8, -6, 8] } : { rotate: 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ transformOrigin: '125px 130px' }}
        data-testid="ctrl-stick-right"
      >
        <circle cx="125" cy="130" r="6" stroke={accentColor} strokeOpacity="0.7" strokeWidth="1" fill="none" />
        <circle cx="125" cy="130" r="2" fill={accentColor} fillOpacity="0.6" />
      </motion.g>

      {/* Center LEDs: blink via CSS @keyframes profile-led-blink (2s ease-in-out infinite). */}
      <circle
        className="profile-art-led-blink"
        cx="100"
        cy="95"
        r="1.6"
        fill={accentColor}
        fillOpacity="0.6"
        data-testid="ctrl-led-up"
      />
      <circle
        className="profile-art-led-blink"
        cx="100"
        cy="105"
        r="1.6"
        fill={accentColor}
        fillOpacity="0.6"
        data-testid="ctrl-led-down"
      />
    </motion.svg>
  );
}

export const PASSION_ART = {
  music: Vinyl,
  cooking: ChefHat,
  gaming: Controller,
} as const;

export { Vinyl, ChefHat, Controller };
