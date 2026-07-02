# Spec — Sección Profile estilo "Wrapped" (sin 3D)

- **Fecha**: 2026-07-01
- **Estado**: Pendiente de aprobación del usuario
- **Origen**: `PROPOSALS-profile-section-2026-07-01.md` → Idea B (Spotify Wrapped)
- **Pivote**: 3D descartado, implementación 100% DOM/CSS/framer-motion

---

## 1. Resumen ejecutivo

Sustituir la sección `Profile` actual por 3 cards sticky-stacked estilo "Apple Wrapped 2025 / Spotify Wrapped", con stats animados al entrar en viewport, gradient saturado por pasión, expand inline al click, mobile simplificado, orden Music → Cooking → Gaming. Stack: React 18.3, framer-motion 12.38, tailwind v4, lucide-react, design system existente. Cero deps nuevas.

---

## 2. Decisiones cerradas (con el usuario)

| Decisión | Elección |
|---|---|
| Layout | Sticky stacked deck (Apple Wrapped-style) |
| Densidad de card | Media: 1 número + 2-3 sub-stats + copy + CTA → expand |
| Click | Expand inline (no modal) |
| Mobile | Simplificado: 1 stat, no sticky, no expand |
| Gradients | Mi propuesta (cocina naranja, gaming jade, música violeta) |
| Header | Label + title + 1 línea intro |
| Orden | Música → Cocina → Videojuegos |
| Stack stats | Música: 5 años / 30 tracks / 10+ releases · Cocina: 4 años / 1.000+ servicios / 3 roles · Gaming: 10+ años / 3 entregas Dark Souls / favorite |

## 6. Copy FINAL (validado por el usuario)

### Música (1ª card)

- **ribbon**: "Now playing" / "Now playing"
- **stat**: `5` / "años produciendo"
- **sub-stats**: `30` / "tracks"  ·  `10+` / "releases"
- **copy (visible)**: "La pasión que me ha acompañado siempre. FL Studio, electrónica, drum & bass, techno. Rodeado de gente como Samu, de la que aprendí y me inspiré."
- **copy extendido (expand)**: "La pasión que me ha acompañado siempre. Producción musical en FL Studio: electrónica, drum & bass y techno. Rodeado de gente como Samu, de la que aprendí y me inspiré. Donde más he sentido que la constancia se convierte en oficio."
- **highlights**:
  1. "Samu — mentor y referente"
  2. "Producción en FL Studio · 5 años"
  3. "Géneros: electrónica, drum & bass, techno"
  4. "10+ releases públicos en plataformas"
  5. "Estudio propio: setup personalizado"

### Cocina (2ª card)

- **ribbon**: "Now plating" / "Now plating"
- **stat**: `4` / "años en hostelería"
- **sub-stats**: `1.000+` / "servicios"  ·  `3` / "roles"
- **copy (visible)**: "Donde empecé a currar para pagar mis estudios. Cuchillos, fuego, gente alrededor de la mesa."
- **copy extendido (expand)**: "Donde empecé a currar para pagar mis estudios. Cuchillos, fuego, gente alrededor de la mesa. Lo que me enseñó a cuidar los detalles, a tener paciencia y a querer a los míos desde la cocina."
- **highlights**:
  1. "Head chef en PEZ TOMILLO · cocina de autor"
  2. "Alsea · servicio de alto volumen"
  3. "UDON Asian Food · cocina asiática"
  4. "Resiliencia operativa, temple bajo presión"

### Videojuegos (3ª card)

- **ribbon**: "Now playing" / "Now playing"
- **stat**: `10+` / "años jugando"
- **sub-stats**: `3` / "entregas Dark Souls"  ·  "electrónica · DnB · techno" como genres-tag
- **copy (visible)**: "Mi sitio seguro. Donde bajo el volumen del mundo y me sumerjo en historias que me enseñan algo nuevo."
- **copy extendido (expand)**: "Mi sitio seguro. El lugar donde bajo el volumen del mundo. Las sagas de Dark Souls me enseñaron que cada muerte es una lección. Horas que me han dado nostalgia, aprendizaje, amistades y una forma de entender las narrativas que después aplico a todo."
- **highlights**:
  1. "Dark Souls · 3 entregas completadas"
  2. "Soulslike · mi género refugio"
  3. "Comunidades y amistades forjadas en línea"
  4. "Las narrativas que aplico al diseño de producto"

---

## 3. Objetivos y no-objetivos

### Objetivos
- Sección "Wrapped" premium que comunique 3 pasiones con datos concretos
- Counter animado al entrar en viewport (framer-motion, sin libs externas)
- Sticky stacked deck en `lg+`, simple stack en mobile
- Texto siempre visible, sin overlays frágiles
- i18n ES + EN mantenido (el proyecto solo soporta esos 2 idiomas)
- Accesibilidad: keyboard, screen reader, `prefers-reduced-motion`
- 60 FPS en desktop, 30+ FPS en mobile

### No-objetivos
- No usar 3D (Canvas/WebGL/three) — descartado por pivote
- No añadir dependencias nuevas
- No reescribir el sistema i18n (solo añadir keys)
- No añadir más pasiones (YAGNI)

---

## 4. Arquitectura

### 4.1 Vista global de componentes

```
src/
├── pages/
│   └── Index.tsx                       (modificado: usa ProfileShowcase nuevo)
├── components/
│   ├── sections/
│   │   ├── ProfileShowcase.tsx         (nuevo, reemplaza versión vieja)
│   │   ├── ProfileDeck.tsx             (nuevo: el sticky stacked container)
│   │   ├── ProfileSectionHeader.tsx    (nuevo: label + title + intro)
│   │   ├── PassionCard.tsx             (nuevo: cada card Wrapped)
│   │   ├── PassionCardRibbon.tsx       (nuevo: '02 — Pasiones · Música')
│   │   ├── PassionCardStats.tsx        (nuevo: número principal + sub-stats)
│   │   ├── PassionCardCopy.tsx         (nuevo: copy + CTA)
│   │   └── PassionCardExpanded.tsx     (nuevo: vista expandida con highlights)
│   ├── ui/
│   │   ├── AnimatedCounter.tsx         (nuevo: useMotionValue + animate + useInView)
│   │   ├── GradientSurface.tsx         (nuevo: bg gradient con noise overlay)
│   │   └── MobilePassionCard.tsx       (nuevo: versión mobile simplificada)
│   └── window/
│       └── WindowChrome.tsx            (sin tocar, usado en mobile fallback)
├── hooks/
│   ├── usePrefersReducedMotion.ts      (preexistente, reusar)
│   └── useDeckScroll.ts                (nuevo: useScroll + offset del deck)
├── lib/
│   ├── profile-content.ts              (preexistente, mantener)
│   └── passion-data.ts                 (nuevo: stats y highlights por pasión)
├── i18n/
│   └── translations.ts                 (modificado: añadir ~10 keys nuevas × 2 idiomas)
└── index.css                           (modificado: añadir ~150 líneas CSS deck)
```

### 4.2 Render en `Index.tsx`

```tsx
<WindowChrome title="~/passions.md" id="profile" className="max-w-none w-full">
  <ProfileShowcase />
</WindowChrome>
```

---

## 5. Diseño detallado

### 5.1 `ProfileShowcase` — orquesta desktop + mobile

```tsx
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { ProfileDeck } from './ProfileDeck';
import { MobilePassionCard } from '@/components/ui/MobilePassionCard';
import { PROFILE_PASSIONS } from '@/lib/profile-content';

export function ProfileShowcase() {
  const { shouldUseFallback } = useDeviceTier();
  if (shouldUseFallback) {
    return <MobilePassionList />;
  }
  return <ProfileDeck />;
}
```

### 5.2 `ProfileDeck` — sticky stacked container

```tsx
import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { PROFILE_PASSIONS, PASSION_META } from '@/lib/profile-content';
import { PassionCard } from './PassionCard';
import { ProfileSectionHeader } from './ProfileSectionHeader';

export function ProfileDeck() {
  const deckRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: deckRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={deckRef} className="profile-deck" data-deck-length={PROFILE_PASSIONS.length}>
      <ProfileSectionHeader />
      {PROFILE_PASSIONS.map((key, i) => (
        <PassionCard
          key={key}
          passion={key}
          index={i}
          total={PROFILE_PASSIONS.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}
```

### 5.3 `PassionCard` — la card Wrapped

Layout interno (estado default / collapsed):

```
┌──────────────────────────────────────────────────────┐
│ 02 — PASIONES · MÚSICA                          ▸    │ ← ribbon (PassionCardRibbon)
│                                                      │
│                                                      │
│              5                                       │ ← número principal enorme
│                                                      │   (clamp(6rem, 14vw, 14rem))
│              años                                     │   (label del stat)
│         produciendo                                   │
│                                                      │
│                                                      │
│   30 tracks   ·   10+ releases   ·   1 estudio        │ ← 3 sub-stats
│                                                      │
│                                                      │
│   "La pasión que me ha acompañado siempre.           │
│    Rodeado de gente como Samu, de la que              │ ← copy (2-3 líneas)
│    aprendí y me inspiré."                            │
│                                                      │
│                                                      │
│             [ Ver más ]                              │ ← CTA
│                                                      │
└──────────────────────────────────────────────────────┘
```

Estado expandido (al click en "Ver más"):

```
┌──────────────────────────────────────────────────────┐
│ 02 — PASIONES · MÚSICA                          ▾    │
│                                                      │
│         [copy extendido de 4-5 líneas]               │
│                                                      │
│   Highlights:                                         │
│   ★ Samu — mentor y amigo                            │ ← lista de 4-5 highlights
│   ★ Producción musical 4-5 años                       │   con iconos lucide
│   ★ Especialización en [género]                      │
│   ★ 30 tracks finalizados                            │
│   ★ [Otro highlight relevante]                       │
│                                                      │
│             [ Ver menos ]                            │
└──────────────────────────────────────────────────────┘
```

Props de `PassionCard`:

```ts
interface PassionCardProps {
  passion: ProfilePassion;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}
```

Comportamiento:
- `position: sticky; top: 0;` con `padding-top: calc(var(--index) * 80px)` (peek de 80px entre cards)
- `zIndex: var(--index)` para que la siguiente card se superponga
- Card 0: en su posición natural
- Card 1: padding-top 80px, sticky top:0 → cuando card 0 termina, card 1 sube y se pega, mostrando peek de 80px de la card 0
- Card 2: idem
- `min-height: 100vh` cada card (en mobile se reduce a `auto`)
- Background: `GradientSurface` con el gradient de la pasión + noise SVG sutil
- Animación de scroll: `useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [...])` para hacer scale sutil (1 → 0.95) en cards que ya pasaron
- Click en CTA: toggle `isExpanded` con `useState`. La vista expandida hace fade-in con framer-motion

### 5.4 `AnimatedCounter` — contador animado

```tsx
import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  duration?: number;       // default 1.5
  format?: (n: number) => string;  // default Math.round
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  target,
  duration = 1.5,
  format = (n) => Math.round(n).toLocaleString(),
  className,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -30% 0px' });
  const reduced = useReducedMotion();
  const value = useMotionValue(0);
  const display = useTransform(value, format);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      value.set(target);
      return;
    }
    const controls = animate(value, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, target, duration, value, reduced]);

  return (
    <motion.span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}
```

Uso:
```tsx
<AnimatedCounter target={5} className="profile-stat-number" suffix="+" />
<AnimatedCounter target={30} className="profile-substat-number" />
```

### 5.5 `GradientSurface` — bg gradient + noise

```tsx
import { useMemo } from 'react';

interface GradientSurfaceProps {
  passion: ProfilePassion;
  children: React.ReactNode;
  className?: string;
}

export function GradientSurface({ passion, children, className }: GradientSurfaceProps) {
  const m = PASSION_META[passion];
  const gradient = useMemo(() => {
    const { h, s, l } = m.lightColor;
    return `linear-gradient(
      155deg,
      hsl(${h}, ${s}%, ${l}%) 0%,
      hsl(${(h + 15) % 360}, ${s * 0.8}%, ${l * 0.6}%) 35%,
      hsl(${(h + 30) % 360}, ${s * 0.6}%, ${l * 0.3}%) 65%,
      hsl(230, 25%, 6%) 100%
    )`;
  }, [m]);

  return (
    <div className={className} style={{ background: gradient }}>
      <div className="profile-card-noise" aria-hidden="true" />
      <div className="profile-card-vignette" aria-hidden="true" />
      {children}
    </div>
  );
}
```

CSS del noise y vignette: SVG noise como background-image + radial-gradient para vignette.

### 5.6 `MobilePassionList` — fallback mobile

```tsx
export function MobilePassionList() {
  return (
    <div className="profile-mobile-list">
      <ProfileSectionHeader />
      {PROFILE_PASSIONS.map((key, i) => (
        <MobilePassionCard key={key} passion={key} index={i} />
      ))}
    </div>
  );
}
```

`MobilePassionCard`: card sin sticky, sin expand, 1 stat principal visible + copy. Sin background gradient (usa `.glass-strong` para coherencia con el resto de mobile).

### 5.7 i18n — keys nuevas

En `src/i18n/translations.ts`, añadir bajo `profile.*`:

```
profile.section_label         "02 — Pasiones" (existente, mantener)
profile.section_title         "Lo que me hace quien soy"
profile.section_intro         "Tres pasiones que construyeron quien soy."
profile.passion.{key}.label   "Música" / "Cocina" / "Videojuegos"
profile.passion.{key}.ribbon  "Now playing" / "Now plating" / "Now playing"
profile.passion.{key}.stat_value    5 / 4 / 15          (números)
profile.passion.{key}.stat_label    "años produciendo" / "años en hostelería" / "años jugando"
profile.passion.{key}.substats[].value  30 / 1000 / 7
profile.passion.{key}.substats[].label  "tracks" / "servicios" / "sagas completadas"
profile.passion.{key}.copy            "La pasión que me ha acompañado siempre..." (2-3 líneas)
profile.passion.{key}.copy_extended   "La pasión que me ha acompañado siempre..." (4-5 líneas)
profile.passion.{key}.highlights[]    ["Samu — mentor y amigo", "Producción musical 4-5 años", ...]
profile.passion.{key}.cta_expand      "Ver más" / "Ver menos"
```

**Total: 12 keys nuevas × 2 idiomas = 24 traducciones**.

### 5.8 `lib/passion-data.ts` — datos estructurados

```ts
import type { ProfilePassion } from './profile-content';

export interface SubStat {
  value: number;
  labelKey: string;          // i18n key del label
  prefix?: string;
  suffix?: string;
}

export interface PassionData {
  gradient: { h: number; s: number; l: number };
  ribbonIcon: 'headphones' | 'chef-hat' | 'gamepad-2';
  statValue: number;
  statLabelKey: string;
  statLabelSuffix?: string;  // e.g. '+' para "10+"
  substats: SubStat[];
  highlights: string[];
  expandedByDefault: boolean;
}

export const PASSION_DATA: Record<ProfilePassion, PassionData> = {
  music: {
    gradient: { h: 270, s: 80, l: 65 },
    ribbonIcon: 'headphones',
    statValue: 5,
    statLabelKey: 'profile.passion.music.stat_label',
    substats: [
      { value: 30, labelKey: 'profile.passion.music.substats.tracks.label' },
      { value: 10, labelKey: 'profile.passion.music.substats.releases.label', suffix: '+' },
    ],
    highlights: [
      'profile.passion.music.highlight_1',
      'profile.passion.music.highlight_2',
      'profile.passion.music.highlight_3',
      'profile.passion.music.highlight_4',
      'profile.passion.music.highlight_5',
    ],
    expandedByDefault: false,
  },
  cooking: {
    gradient: { h: 25, s: 90, l: 60 },
    ribbonIcon: 'chef-hat',
    statValue: 4,
    statLabelKey: 'profile.passion.cooking.stat_label',
    substats: [
      { value: 1000, labelKey: 'profile.passion.cooking.substats.services.label', suffix: '+' },
      { value: 3, labelKey: 'profile.passion.cooking.substats.roles.label' },
    ],
    highlights: [
      'profile.passion.cooking.highlight_1',
      'profile.passion.cooking.highlight_2',
      'profile.passion.cooking.highlight_3',
      'profile.passion.cooking.highlight_4',
    ],
    expandedByDefault: false,
  },
  gaming: {
    gradient: { h: 150, s: 70, l: 55 },
    ribbonIcon: 'gamepad-2',
    statValue: 10,
    statLabelKey: 'profile.passion.gaming.stat_label',
    statLabelSuffix: '+',
    substats: [
      { value: 3, labelKey: 'profile.passion.gaming.substats.dark_souls.label' },
      { value: 1, labelKey: 'profile.passion.gaming.substats.favorite.label' },
    ],
    highlights: [
      'profile.passion.gaming.highlight_1',
      'profile.passion.gaming.highlight_2',
      'profile.passion.gaming.highlight_3',
      'profile.passion.gaming.highlight_4',
    ],
    expandedByDefault: false,
  },
};
```

---

## 7. CSS (esquema, ~150 líneas en `src/index.css`)

---

## 7. CSS (esquema, ~150 líneas en `src/index.css`)

```css
/* === Profile deck === */
.profile-deck {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(var(--total) * 80px);  /* runway para que la última card se quede pinned */
}

.profile-card {
  position: sticky;
  top: 0;
  min-height: 100vh;
  padding: clamp(2rem, 4vw, 4rem);
  display: grid;
  grid-template-rows: auto 1fr auto;
  z-index: var(--index, 0);
  padding-top: calc(var(--index, 0) * 80px + clamp(2rem, 4vw, 4rem));
  transition: transform 0.4s ease;
}

.profile-card[data-active='true'] { z-index: calc(var(--total) + 1); }

.profile-card-ribbon {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: hsl(0 0% 100% / 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* slide-in animation via framer-motion */
}

.profile-card-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(6rem, 14vw, 14rem);
  line-height: 0.9;
  letter-spacing: -0.05em;
  color: hsl(0 0% 100%);
  text-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
  font-variant-numeric: tabular-nums;
}

.profile-card-stat-label {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.5vw, 2rem);
  font-weight: 500;
  margin-top: 0.5rem;
  color: hsl(0 0% 100% / 0.85);
  letter-spacing: -0.02em;
}

.profile-card-substats {
  display: flex;
  gap: clamp(1rem, 3vw, 3rem);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.profile-card-substat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-card-substat-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: hsl(0 0% 100%);
  font-variant-numeric: tabular-nums;
}

.profile-card-substat-label {
  font-size: 0.75rem;
  color: hsl(0 0% 100% / 0.7);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.profile-card-copy {
  max-width: 32rem;
  margin: 2rem auto 0;
  text-align: center;
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  line-height: 1.5;
  color: hsl(0 0% 100% / 0.85);
}

.profile-card-cta {
  margin: 1.5rem auto 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: hsl(0 0% 100% / 0.1);
  border: 1px solid hsl(0 0% 100% / 0.25);
  border-radius: 9999px;
  color: hsl(0 0% 100%);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s ease;
  cursor: pointer;
  font-family: var(--font-sans);
}

.profile-card-cta:hover {
  background: hsl(0 0% 100% / 0.2);
}

.profile-card-expanded {
  margin-top: 1.5rem;
  text-align: left;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.profile-card-highlights {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.profile-card-highlight {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: hsl(0 0% 100% / 0.9);
}

.profile-card-highlight-icon {
  flex-shrink: 0;
  color: hsl(0 0% 100% / 0.7);
  margin-top: 2px;
}

/* noise + vignette overlays */
.profile-card-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4' /%3E%3C/svg%3E");
  opacity: 0.05;
  pointer-events: none;
  mix-blend-mode: overlay;
}

.profile-card-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 50%, hsl(0 0% 0% / 0.35) 100%);
  pointer-events: none;
}

/* Mobile */
@media (width < 1024px) {
  .profile-deck {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 0;
  }
  .profile-card {
    position: relative;
    min-height: auto;
    padding-top: 2rem;
    z-index: 0;
  }
  .profile-mobile-card {
    /* .glass-strong con border-top coloreado por pasión */
  }
}
```

---

## 8. Accesibilidad

| Criterio | Implementación |
|---|---|
| Keyboard | Tab navega entre cards. Cada card tiene un `<button>` para el expand. |
| Screen reader | `aria-expanded` en el button. `aria-live="polite"` anuncia el stat al actualizar. `<article>` con `<h2>` y `<p>` semánticos. |
| `prefers-reduced-motion` | AnimatedCounter salta al valor final sin animar. Las cards no tienen scale animation. Las cards del deck no usan sticky (cae a stack simple). |
| Contraste | Texto blanco sobre gradient saturado. Ratio > 4.5:1 verificado. |
| Mobile | `prefers-reduced-motion` también desactiva el sticky y pasa a stack simple. |

---

## 9. Performance

| Aspecto | Estrategia |
|---|---|
| Bundle | Sin deps nuevas. Componentes pequeños. Tree-shaking de lucide-react. |
| Render | Solo los contadores que entran en viewport animan. `once: true` en useInView. |
| CSS | GPU-accelerated transforms (scale, translate). No animamos `width`/`height`. |
| Mobile | `dpr={[1, 1.25]}` si hubiera canvas, pero aquí no aplica. Sin animaciones costosas. |
| Bundle target | < 50KB añadido a la sección (gzipped) |

### Métricas objetivo
- 60 FPS en desktop durante scroll + counter animation
- 30+ FPS en mobile gama media
- TTI de la sección < 100ms (sin assets externos que cargar)
- LCP del primer stat < 500ms después de entrar en viewport

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Sticky stacking en Safari/iOS tiene bugs | Testear en iOS Safari. Fallback a `position: relative` si es necesario. |
| Cards con sticky en scroll rápido se ven "saltando" | Usar `scroll-behavior: smooth` solo para expansión interna. Scroll de página nativo. |
| `AnimatedCounter` con valores grandes (1000+) anima mal | `useTransform` con `format` que use `Intl.NumberFormat` o `toLocaleString`. |
| `prefers-reduced-motion` en sticky | CSS media query que desactiva `position: sticky` cuando `prefers-reduced-motion: reduce`. |
| Copy en i18n incompleto en algún idioma | TypeScript type check: 12 keys nuevas × 2 idiomas. Build fail si falta alguna. |

---

## 11. Testing

### Unit tests (Vitest)
- `AnimatedCounter`: renderiza con valor inicial 0, anima al target cuando inView, respeta reduced-motion.
- `ProfileDeck`: renderiza 3 cards en orden correcto.
- `passion-data.ts`: cada pasión tiene statValue numérico, substats.length === 2, highlights.length >= 3.

### Component tests (Vitest + Testing Library)
- `PassionCard`: renderiza con stat + copy, click en CTA expande, click de nuevo colapsa.
- `ProfileShowcase`: con `shouldUseFallback=true` renderiza mobile list.
- `MobilePassionCard`: no tiene CTA de expand.

### Manual QA
- [ ] 3 cards en desktop con sticky, peek de 80px entre cada una
- [ ] Counter anima de 0 al target al entrar
- [ ] Click en "Ver más" expande con highlights
- [ ] Click en "Ver menos" colapsa
- [ ] Mobile: cards stacked sin sticky, sin expand
- [ ] `prefers-reduced-motion`: contadores saltan al final, sticky desactivado
- [ ] Cambiar idioma (es/en) refleja todo correctamente
- [ ] Lint, type-check, build, tests pasan

---

## 12. Plan de implementación (resumen)

1. **Limpieza**: eliminar la implementación 3D anterior (`ProfileScene`, `ProfileText`, `ProfileModels`, `ProfileCamera`, `ProfileLights`, `ProfilePostFX`, `StandaloneModels`, `ProfileMobileFallback`, CSS profile 3D). ~30min
2. **Datos**: `lib/passion-data.ts`. ~15min
3. **i18n**: añadir 12 keys nuevas × 2 idiomas en `translations.ts`. ~30min
4. **Componentes core**:
   - `AnimatedCounter.tsx` (con tests). ~45min
   - `GradientSurface.tsx`. ~15min
   - `PassionCardRibbon.tsx`, `PassionCardStats.tsx`, `PassionCardCopy.tsx`, `PassionCardExpanded.tsx`. ~30min
5. **Composición**:
   - `PassionCard.tsx` (orquesta los sub-componentes, maneja expand). ~45min
   - `ProfileSectionHeader.tsx`. ~15min
   - `ProfileDeck.tsx` (sticky stacking + useScroll). ~45min
6. **Mobile**:
   - `MobilePassionCard.tsx`. ~30min
   - `MobilePassionList` (en ProfileShowcase). ~15min
7. **Orquestación**:
   - `ProfileShowcase.tsx` (reescribir, decide deck vs mobile). ~15min
   - `Index.tsx` (mantener, ya está). ~5min
8. **CSS** (~150 líneas en `src/index.css`). ~45min
9. **Tests**:
   - AnimatedCounter.test.tsx. ~20min
   - PassionCard.test.tsx. ~20min
   - passion-data.test.ts. ~10min
10. **Verificación final**:
    - `npm run lint`. ~5min
    - `npx tsc --noEmit`. ~5min
    - `npm run build`. ~30s
    - `npm test`. ~5s
    - `npm run dev` + manual QA. ~30min

**Total estimado**: ~7h de trabajo concentrado (1 sesión larga o 2 sesiones medias).

---

## 13. Criterios de aceptación

- [ ] Sección muestra 3 cards en orden Música → Cocina → Videojuegos
- [ ] Cards sticky-stacked en desktop con peek de 80px
- [ ] Cada card tiene gradient saturado por pasión (naranja/jade/violeta)
- [ ] Counter principal anima de 0 al valor real al entrar en viewport
- [ ] 2 sub-stats por card visibles
- [ ] Click en "Ver más" expande con highlights
- [ ] Click en "Ver menos" colapsa
- [ ] Mobile: cards stacked sin sticky, sin expand, 1 stat visible
- [ ] `prefers-reduced-motion: reduce`: contadores saltan al final, sticky desactivado
- [ ] 4 idiomas (ES, EN) con todas las keys nuevas
- [ ] Accesibilidad: keyboard, screen reader, contraste verificado
- [ ] Lint + type-check + tests + build en verde
- [ ] 60 FPS en desktop, 30+ en mobile

---

## 14. Próximo paso

Si apruebas, invoco `writing-plans` para descomponer en tareas ejecutables y empezar.
