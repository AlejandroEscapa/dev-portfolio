# Portfolio Redesign — "Terminal Evolved" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el portfolio actual inspirado en https://portfolio.carlosblog.com/ — manteniendo la identidad terminal/OS pero elevándola con hero 3D, flow field background, iconos tech 3D rotantes, scroll animations con GSAP+Lenis, y una sección AI-Coder showcase. Casi idéntico a la referencia en estructura y vibe.

**Architecture:** SPA Vite + React 18 + TS + Tailwind v4. Se reemplaza MeshBackground por un FlowField WebGL (curl noise). Hero gana objeto 3D wireframe orbitando. TechStack usa iconos 3D con R3F `<Float>` + `<Instances>`. Scroll animations con GSAP ScrollTrigger + Lenis. Se mantiene CLI terminal, boot sequence (acortado), 4 temas, i18n es/en, SidePanel. Se añade sección AI-Coder showcase. Onboarding script interactivo al ejecutar para personalizar colores, fuentes, nombre, socials.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind v4, Framer Motion (ya instalado), `three`, `@react-three/fiber`, `@react-three/drei`, `gsap` (+ ScrollTrigger), `lenis`, `simplex-noise`. shadcn/ui ya instalado. i18n ya implementado (react-i18next).

## Global Constraints

- **NO romper** i18n existente (`src/i18n/translations.ts`, `src/context/LanguageContext.tsx`). Toda string nueva va al archivo de translations con keys es + en.
- **NO romper** los 4 temas existentes (`data-theme` en `src/index.css`). Nuevos componentes deben usar CSS variables (`var(--primary)`, etc.), no colores hardcoded.
- **NO añadir** dependencias fuera de las listadas en este plan.
- **Path alias** `@/*` → `./src/*` (ya configurado).
- **Port dev** 8080 (no 5173).
- **Strict mode OFF** — no añadir `strict: true` a tsconfig.
- **prefers-reduced-motion** debe respetarse en todos los efectos 3D/animación (versión estática o simplificada).
- **Device tier detection**: mobile (<768px) → versión simplificada de flow field (500 partículas vs 2000 desktop), sin post-processing.
- **Onboarding**: antes de Task 1, ejecutar `npm run onboard` que crea `portfolio.config.json` con personalización. Todos los componentes leen este config.
- **Commits**: conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`). Subject ≤72 chars.
- **Tests**: Vitest + @testing-library/react. Patrones existentes en `src/test/setup.ts`.

---

## File Structure

### Archivos nuevos

| Path | Responsabilidad |
|---|---|
| `portfolio.config.json` | Config de personalización (generado por onboarding) |
| `scripts/onboard.mjs` | Script interactivo de onboarding (Node, prompts) |
| `src/lib/config.ts` | Loader del portfolio.config.json (tipado) |
| `src/components/three/FlowFieldBackground.tsx` | Canvas WebGL con curl noise flow field |
| `src/components/three/Hero3D.tsx` | Objeto 3D wireframe orbitando en hero |
| `src/components/three/TechStack3D.tsx` | Iconos tech 3D rotantes con R3F |
| `src/components/three/Scene.tsx` | Wrapper `<Canvas>` de R3F compartido |
| `src/hooks/useDeviceTier.ts` | Hook device tier detection (mobile/desktop) |
| `src/hooks/useReducedMotion.ts` | Hook prefers-reduced-motion |
| `src/hooks/useLenis.ts` | Hook Lenis smooth scroll setup |
| `src/components/sections/AICoder.tsx` | Sección AI-Coder showcase (prompt gallery) |
| `src/lib/gsap.ts` | Setup de GSAP + ScrollTrigger + Lenis sync |
| `src/test/flowfield.test.ts` | Test del hook useDeviceTier + config loader |

### Archivos a modificar

| Path | Cambio |
|---|---|
| `package.json` | Añadir deps: three, @react-three/fiber, @react-three/drei, gsap, lenis, simplex-noise |
| `src/pages/Index.tsx` | Reemplazar MeshBackground por FlowFieldBackground, añadir Hero3D, AICoder section, reordenar secciones |
| `src/components/sections/Hero.tsx` | Integrar Hero3D, cambiar tipografía display, glitch reveal |
| `src/components/sections/TechStack.tsx` | Reemplazar bento grid por TechStack3D |
| `src/components/MeshBackground.tsx` | Eliminar (reemplazado por FlowFieldBackground) |
| `src/components/OrbitalBlob.tsx` | Eliminar |
| `src/components/LensFlareOverlay.tsx` | Eliminar |
| `src/components/boot/BootSequence.tsx` | Acortar (menos líneas, más punchy) |
| `src/index.css` | Añadir font-family display configurable, mantener temas |
| `src/i18n/translations.ts` | Añadir keys para AICoder section + nuevos textos hero |
| `index.html` | Actualizar title/meta desde config |

---

## Task 0: Onboarding Script + Config Loader

**Files:**
- Create: `scripts/onboard.mjs`
- Create: `portfolio.config.json` (generado por el script)
- Create: `src/lib/config.ts`
- Create: `src/test/config.test.ts`

**Interfaces:**
- Produces: `PortfolioConfig` type en `src/lib/config.ts`, `portfolio.config.json` en raíz

- [ ] **Step 1: Crear script de onboarding**

`scripts/onboard.mjs` — script Node ESM interactivo que pregunta por terminal:
- Nombre (string)
- Rol/tagline (string)
- Email (string)
- Teléfono (string)
- LinkedIn URL, GitHub URL
- Color primario (hex, con preview)
- Color accent (hex)
- Font display (elegir de lista: Space Grotesk, Syne, JetBrains Mono, Sora, Geist)
- Font body (Inter por defecto)
- ¿Mantener terminal CLI? (sí/no)
- ¿Mantener boot sequence? (sí/no)
- ¿Activar AI-Coder section? (sí/no)

Usar `readline/promises` de Node stdlib (no deps). Validar hex con regex `^#[0-9a-fA-F]{6}$`. Si ya existe `portfolio.config.json`, cargar valores existentes como defaults. Escribir el JSON al final.

```javascript
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const rl = readline.createInterface({ input, output });

const ask = async (q, def) => {
  const suffix = def ? ` [${def}]: ` : ': ';
  const ans = (await rl.question(q + suffix)).trim();
  return ans || def || '';
};

const askHex = async (q, def) => {
  while (true) {
    const ans = await ask(q, def);
    if (/^#[0-9a-fA-F]{6}$/.test(ans)) return ans;
    console.log('  Invalid hex. Use #RRGGBB format.');
  }
};

const askChoice = async (q, options, def) => {
  while (true) {
    const ans = await ask(`${q} (${options.join('/')})`, def);
    if (options.includes(ans)) return ans;
    console.log(`  Choose one of: ${options.join(', ')}`);
  };
};

const existing = existsSync('portfolio.config.json')
  ? JSON.parse(readFileSync('portfolio.config.json', 'utf8'))
  : {};

const name = await ask('Your name', existing.name || 'Alejandro Olivares');
const tagline = await ask('Tagline', existing.tagline || 'Crafting solutions. Solving challenges.');
const email = await ask('Email', existing.email || 'alejandro.oliesc97@gmail.com');
const phone = await ask('Phone', existing.phone || '+34601175067');
const linkedin = await ask('LinkedIn URL', existing.linkedin || 'https://www.linkedin.com/in/alejandro-olivares-escapa/');
const github = await ask('GitHub URL', existing.github || 'https://github.com/alejandrooliesc');
const primaryColor = await askHex('Primary color (#RRGGBB)', existing.primaryColor || '#7c5cff');
const accentColor = await askHex('Accent color (#RRGGBB)', existing.accentColor || '#22d3ee');
const displayFont = await askChoice('Display font', ['Space Grotesk', 'Syne', 'JetBrains Mono', 'Sora', 'Geist'], existing.displayFont || 'Space Grotesk');
const keepCli = await askChoice('Keep terminal CLI?', ['yes', 'no'], existing.keepCli ?? 'yes');
const keepBoot = await askChoice('Keep boot sequence?', ['yes', 'no'], existing.keepBoot ?? 'yes');
const aiCoderSection = await askChoice('Enable AI-Coder section?', ['yes', 'no'], existing.aiCoderSection ?? 'yes');

const config = { name, tagline, email, phone, linkedin, github, primaryColor, accentColor, displayFont, keepCli, keepBoot, aiCoderSection };
writeFileSync('portfolio.config.json', JSON.stringify(config, null, 2) + '\n');
console.log('\nSaved to portfolio.config.json');
rl.close();
```

- [ ] **Step 2: Añadir script `onboard` a package.json**

En `package.json`, añadir en `scripts`:
```json
"onboard": "node scripts/onboard.mjs"
```

- [ ] **Step 3: Crear config loader tipado**

`src/lib/config.ts`:
```typescript
import config from '../../portfolio.config.json';

export interface PortfolioConfig {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  primaryColor: string;
  accentColor: string;
  displayFont: 'Space Grotesk' | 'Syne' | 'JetBrains Mono' | 'Sora' | 'Geist';
  keepCli: 'yes' | 'no';
  keepBoot: 'yes' | 'no';
  aiCoderSection: 'yes' | 'no';
}

export const portfolioConfig: PortfolioConfig = config;
```

- [ ] **Step 4: Escribir test del config loader**

`src/test/config.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { portfolioConfig } from '@/lib/config';

describe('portfolioConfig', () => {
  it('has required fields', () => {
    expect(portfolioConfig.name).toBeTypeOf('string');
    expect(portfolioConfig.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(portfolioConfig.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(['Space Grotesk', 'Syne', 'JetBrains Mono', 'Sora', 'Geist']).toContain(portfolioConfig.displayFont);
  });
});
```

- [ ] **Step 5: Ejecutar onboarding y test**

```bash
npm run onboard
npm test -- src/test/config.test.ts
```
Expected: onboarding crea `portfolio.config.json`, test PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/onboard.mjs portfolio.config.json src/lib/config.ts src/test/config.test.ts package.json
git commit -m "feat: add onboarding script and config loader"
```

---

## Task 1: Instalar dependencias 3D + animación

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar dependencias**

```bash
npm install three @react-three/fiber @react-three/drei gsap lenis simplex-noise
npm install -D @types/three
```

- [ ] **Step 2: Verificar instalación**

```bash
node -e "require('three'); require('gsap'); require('lenis'); require('simplex-noise'); console.log('ok')"
```
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add three, r3f, gsap, lenis, simplex-noise"
```

---

## Task 2: Hooks base (device tier, reduced motion, lenis)

**Files:**
- Create: `src/hooks/useDeviceTier.ts`
- Create: `src/hooks/useReducedMotion.ts`
- Create: `src/hooks/useLenis.ts`
- Create: `src/test/hooks.test.ts`

**Interfaces:**
- Produces: `useDeviceTier()` → `'mobile' | 'desktop'`, `useReducedMotion()` → `boolean`, `useLenis()` → setup/cleanup

- [ ] **Step 1: Hook useDeviceTier**

`src/hooks/useDeviceTier.ts`:
```typescript
import { useState, useEffect } from 'react';

export type DeviceTier = 'mobile' | 'desktop';

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setTier(e.matches ? 'mobile' : 'desktop');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return tier;
}
```

- [ ] **Step 2: Hook useReducedMotion**

`src/hooks/useReducedMotion.ts`:
```typescript
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
```

- [ ] **Step 3: Hook useLenis**

`src/hooks/useLenis.ts`:
```typescript
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}
```

- [ ] **Step 4: Test de hooks**

`src/test/hooks.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDeviceTier, useReducedMotion } from '@/hooks/useDeviceTier';

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
```

- [ ] **Step 5: Correr test**

```bash
npm test -- src/test/hooks.test.ts
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useDeviceTier.ts src/hooks/useReducedMotion.ts src/hooks/useLenis.ts src/test/hooks.test.ts
git commit -m "feat: add useDeviceTier, useReducedMotion, useLenis hooks"
```

---

## Task 3: FlowField Background (WebGL curl noise)

**Files:**
- Create: `src/components/three/FlowFieldBackground.tsx`
- Create: `src/components/three/Scene.tsx`

**Interfaces:**
- Consumes: `useDeviceTier()`, `useReducedMotion()` de Task 2
- Produces: `<FlowFieldBackground />` component (full-screen fixed canvas)

- [ ] **Step 1: Scene wrapper**

`src/components/three/Scene.tsx` — wrapper reutilizable de `<Canvas>` de R3F:
```typescript
import { Canvas } from '@react-three/fiber';
import { type ReactNode } from 'react';

interface SceneProps {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
}

export function Scene({ children, className, camera = { position: [0, 0, 5], fov: 75 } }: SceneProps) {
  return (
    <Canvas className={className} camera={camera} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      {children}
    </Canvas>
  );
}
```

- [ ] **Step 2: FlowFieldBackground component**

`src/components/three/FlowFieldBackground.tsx` — canvas full-screen fixed con partículas siguiendo curl noise. Usa `simplex-noise` para el campo. Reactivo al cursor. Device tier: 2000 partículas desktop, 500 mobile. Reduced motion: estático.

```typescript
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const PARTICLE_COUNT_DESKTOP = 2000;
const PARTICLE_COUNT_MOBILE = 500;

export function FlowFieldBackground() {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const count = tier === 'mobile' ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
  const mouse = useRef(new THREE.Vector2(0, 0));

  const noise = useMemo(() => createNoise3D(), []);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    const t = state.clock.elapsedTime * 0.1;
    const geom = ref.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = arr[ix], y = arr[ix + 1], z = arr[ix + 2];
      const angle = noise(x * 0.1, y * 0.1, t) * Math.PI * 2;
      arr[ix] += Math.cos(angle) * 0.01;
      arr[ix + 1] += Math.sin(angle) * 0.01;
      // cursor repulsion
      const dx = x - mouse.current.x;
      const dy = y - mouse.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        const force = (2 - dist) * 0.02;
        arr[ix] += (dx / dist) * force;
        arr[ix + 1] += (dy / dist) * force;
      }
      // wrap
      if (Math.abs(arr[ix]) > 10) arr[ix] *= -0.95;
      if (Math.abs(arr[ix + 1]) > 10) arr[ix + 1] *= -0.95;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref} onPointerMove={(e) => { mouse.current.set(e.point.x, e.point.y); }}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="var(--primary)" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}
```

Nota: el `color="var(--primary)"` no funciona directo en R3F; hay que leer la CSS var y convertirla. Usar un `useMemo` que lea `getComputedStyle(document.documentElement).getPropertyValue('--primary')` y la convierta a THREE.Color. Simplificar: aceptar un prop `color` hex leído del config.

- [ ] **Step 3: Integrar en Index.tsx**

En `src/pages/Index.tsx`, reemplazar `<MeshBackground />` por:
```tsx
import { Scene } from '@/components/three/Scene';
import { FlowFieldBackground } from '@/components/three/FlowFieldBackground';

// dentro del main, antes de Nav:
<div className="fixed inset-0 z-0 pointer-events-none">
  <Scene className="!fixed inset-0" camera={{ position: [0, 0, 5], fov: 75 }}>
    <FlowFieldBackground />
  </Scene>
</div>
```

- [ ] **Step 4: Verificar visualmente**

```bash
npm run dev
```
Abrir http://localhost:8080 — debe verse el flow field de partículas. Mover mouse para ver repulsión.

- [ ] **Step 5: Commit**

```bash
git add src/components/three/Scene.tsx src/components/three/FlowFieldBackground.tsx src/pages/Index.tsx
git commit -m "feat: replace MeshBackground with WebGL flow field"
```

---

## Task 4: Hero 3D (wireframe orbitando)

**Files:**
- Create: `src/components/three/Hero3D.tsx`
- Modify: `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `Scene` de Task 3, `useReducedMotion` de Task 2, `portfolioConfig` de Task 0
- Produces: `<Hero3D />` component

- [ ] **Step 1: Hero3D component**

`src/components/three/Hero3D.tsx` — objeto wireframe geométrico (icosaedro o torus knot) orbitando con `<Float>` de drei. Reactivo al mouse (rotación leve). Reduced motion: estático.

```typescript
import { Float, Icosahedron, Wireframe } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Hero3D() {
  const reduced = useReducedMotion();
  const ref = useRef<THREE.Mesh>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!ref.current || reduced) return;
    const targetX = mouse.current.y * 0.3;
    const targetY = mouse.current.x * 0.3;
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.05;
    ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.05;
  });

  return (
    <Float speed={reduced ? 0 : 2} rotationIntensity={reduced ? 0 : 0.5} floatIntensity={reduced ? 0 : 1}>
      <Icosahedron ref={ref} args={[1.2, 1]}>
        <meshBasicMaterial color="#7c5cff" wireframe />
      </Icosahedron>
    </Float>
  );
}
```

- [ ] **Step 2: Integrar Hero3D en Hero.tsx**

En `src/components/sections/Hero.tsx`, añadir el canvas 3D detrás del texto. Mantener el texto existente (word-by-word reveal). Estructura:

```tsx
import { Scene } from '@/components/three/Scene';
import { Hero3D } from '@/components/three/Hero3D';

// dentro del section, antes del container de texto:
<div className="absolute inset-0 z-0 opacity-60 pointer-events-auto">
  <Scene camera={{ position: [0, 0, 5], fov: 75 }}>
    <Hero3D />
  </Scene>
</div>
```

Mover el container de texto a `z-10` para que quede encima del 3D.

- [ ] **Step 3: Verificar visualmente**

```bash
npm run dev
```
El hero debe mostrar el icosaedro wireframe orbitando detrás del texto.

- [ ] **Step 4: Commit**

```bash
git add src/components/three/Hero3D.tsx src/components/sections/Hero.tsx
git commit -m "feat: add 3D wireframe hero object"
```

---

## Task 5: TechStack 3D (iconos rotantes)

**Files:**
- Create: `src/components/three/TechStack3D.tsx`
- Modify: `src/components/sections/TechStack.tsx`

**Interfaces:**
- Consumes: `Scene` de Task 3, `useReducedMotion` de Task 2
- Produces: `<TechStack3D />` component

- [ ] **Step 1: TechStack3D component**

`src/components/three/TechStack3D.tsx` — iconos tech como meshes 3D flotando y rotando. Usa `<Instances>` de drei para performance. Cada icono es un plano con textura del logo (o un mesh simple). Hover hace zoom. Click emite evento para filtrar proyectos.

```typescript
import { Float, Instances, Instance } from '@react-three/drei';
import { useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TechItem {
  name: string;
  color: string;
  position: [number, number, number];
}

const TECH_ITEMS: TechItem[] = [
  { name: 'React', color: '#61dafb', position: [-3, 1, 0] },
  { name: 'TypeScript', color: '#3178c6', position: [-1.5, 1.5, 0] },
  { name: 'Node.js', color: '#339933', position: [0, 1, 0] },
  { name: 'Three.js', color: '#000000', position: [1.5, 1.5, 0] },
  { name: 'GSAP', color: '#88ce02', position: [3, 1, 0] },
  { name: 'Tailwind', color: '#06b6d4', position: [-3, -1, 0] },
  { name: 'Vite', color: '#646cff', position: [-1.5, -1.5, 0] },
  { name: 'Python', color: '#3776ab', position: [0, -1, 0] },
  { name: 'Docker', color: '#2496ed', position: [1.5, -1.5, 0] },
  { name: 'Git', color: '#f05032', position: [3, -1, 0] },
];

interface TechStack3DProps {
  onSelect?: (tech: string) => void;
}

export function TechStack3D({ onSelect }: TechStack3DProps) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {TECH_ITEMS.map((item) => (
        <Float
          key={item.name}
          speed={reduced ? 0 : 1.5}
          rotationIntensity={reduced ? 0 : 0.3}
          floatIntensity={reduced ? 0 : 0.5}
        >
          <mesh
            position={item.position}
            onPointerOver={() => setHovered(item.name)}
            onPointerOut={() => setHovered(null)}
            onClick={() => onSelect?.(item.name)}
            scale={hovered === item.name ? 1.3 : 1}
          >
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={item.color} wireframe />
          </mesh>
        </Float>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Integrar en TechStack.tsx**

Reemplazar el bento grid actual por un canvas 3D con `<TechStack3D />`. Mantener los labels de categorías (Languages, Frontend, etc.) como overlay HTML debajo del canvas.

- [ ] **Step 3: Verificar visualmente**

```bash
npm run dev
```
La sección tech stack debe mostrar los cubos wireframe flotando y rotando. Hover hace zoom.

- [ ] **Step 4: Commit**

```bash
git add src/components/three/TechStack3D.tsx src/components/sections/TechStack.tsx
git commit -m "feat: add 3D rotating tech stack icons"
```

---

## Task 6: GSAP ScrollTrigger setup + scroll animations

**Files:**
- Create: `src/lib/gsap.ts`
- Modify: `src/pages/Index.tsx`
- Modify: `src/components/sections/Experience.tsx` (parallax)
- Modify: `src/components/sections/Projects.tsx` (staggered reveal)

- [ ] **Step 1: GSAP setup file**

`src/lib/gsap.ts`:
```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
```

- [ ] **Step 2: Integrar Lenis en Index.tsx**

En `src/pages/Index.tsx`, llamar `useLenis()` al top del componente:
```tsx
import { useLenis } from '@/hooks/useLenis';

const Index = () => {
  useLenis();
  // ...
};
```

- [ ] **Step 3: Scroll reveal helper**

Crear un hook reutilizable `src/hooks/useScrollReveal.ts`:
```typescript
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function useScrollReveal<T extends HTMLElement>(options?: { y?: number; duration?: number; stagger?: number }) {
  const ref = useRef<T>(null);
  const { y = 60, duration = 0.8, stagger = 0.08 } = options || {};

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelectorAll('[data-reveal]'), {
        y, opacity: 0, duration, stagger, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      });
    }, ref);
    return () => ctx.revert();
  }, [y, duration, stagger]);

  return ref;
}
```

- [ ] **Step 4: Aplicar reveal a Projects y Experience**

En `Projects.tsx` y `Experience.tsx`, añadir `data-reveal` a las cards/items y usar `useScrollReveal` en el container.

- [ ] **Step 5: Verificar scroll animations**

```bash
npm run dev
```
Scroll debe ser smooth (Lenis). Las cards deben revelarse con stagger al entrar en viewport.

- [ ] **Step 6: Commit**

```bash
git add src/lib/gsap.ts src/hooks/useScrollReveal.ts src/pages/Index.tsx src/components/sections/Projects.tsx src/components/sections/Experience.tsx
git commit -m "feat: add GSAP scroll animations and Lenis smooth scroll"
```

---

## Task 7: AI-Coder Section

**Files:**
- Create: `src/components/sections/AICoder.tsx`
- Modify: `src/pages/Index.tsx` (añadir sección)
- Modify: `src/i18n/translations.ts` (añadir keys)

**Interfaces:**
- Consumes: `portfolioConfig.aiCoderSection` de Task 0, `useScrollReveal` de Task 6
- Produces: `<AICoder />` component

- [ ] **Step 1: Añadir keys de i18n**

En `src/i18n/translations.ts`, añadir:
```typescript
aiCoder: {
  title: { es: "AI-Coder Showcase", en: "AI-Coder Showcase" },
  subtitle: { es: "Cómo trabajo con IA", en: "How I work with AI" },
  promptGallery: { es: "Galería de Prompts", en: "Prompt Gallery" },
  tools: { es: "Herramientas que uso", en: "Tools I ship with" },
}
```

- [ ] **Step 2: AICoder component**

`src/components/sections/AICoder.tsx` — sección con prompt gallery (cards side-by-side prompt → resultado) + AI tools reviews. Solo se renderiza si `portfolioConfig.aiCoderSection === 'yes'`.

```typescript
import { useLanguage } from '@/context/LanguageContext';
import { portfolioConfig } from '@/lib/config';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PROMPTS = [
  { prompt: "Build a 3D portfolio hero with R3F", result: "Hero3D.tsx with wireframe icosahedron" },
  { prompt: "Create a flow field background with curl noise", result: "FlowFieldBackground.tsx, 2000 particles" },
  // ... más prompts reales
];

const TOOLS = [
  { name: "Cursor", rating: 5, note: "Daily driver for code generation" },
  { name: "Claude", rating: 5, note: "Architecture and complex refactors" },
  { name: "v0", rating: 4, note: "Quick UI scaffolding" },
];

export function AICoder() {
  const { t } = useLanguage();
  const ref = useScrollReveal<HTMLDivElement>();

  if (portfolioConfig.aiCoderSection !== 'yes') return null;

  return (
    <section id="ai-coder" className="relative py-20 px-4">
      <div ref={ref} className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold mb-2 text-gradient-primary" data-reveal>{t("aiCoder.title")}</h2>
        <p className="text-muted-foreground mb-12" data-reveal>{t("aiCoder.subtitle")}</p>

        <h3 className="text-xl font-semibold mb-6" data-reveal>{t("aiCoder.promptGallery")}</h3>
        <div className="grid gap-6 md:grid-cols-2 mb-16">
          {PROMPTS.map((p, i) => (
            <div key={i} className="rounded-2xl border border-white/10 glass-strong p-6" data-reveal>
              <div className="text-xs font-mono text-accent mb-2">PROMPT</div>
              <p className="text-sm mb-4">{p.prompt}</p>
              <div className="text-xs font-mono text-primary mb-2">RESULT</div>
              <p className="text-sm text-muted-foreground">{p.result}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold mb-6" data-reveal>{t("aiCoder.tools")}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <div key={i} className="rounded-2xl border border-white/10 glass p-4" data-reveal>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{tool.name}</span>
                <span className="text-accent">{'★'.repeat(tool.rating)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{tool.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Integrar en Index.tsx**

Añadir `<AICoder />` entre Projects y Experience (o donde prefieras). Solo se renderiza si el config lo activa.

- [ ] **Step 4: Verificar**

```bash
npm run dev
```
La sección AI-Coder debe aparecer (si el config dice 'yes') con scroll reveal.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/AICoder.tsx src/pages/Index.tsx src/i18n/translations.ts
git commit -m "feat: add AI-Coder showcase section"
```

---

## Task 8: Cleanup + Polish

**Files:**
- Delete: `src/components/MeshBackground.tsx`
- Delete: `src/components/OrbitalBlob.tsx`
- Delete: `src/components/LensFlareOverlay.tsx`
- Modify: `src/components/boot/BootSequence.tsx` (acortar)
- Modify: `src/index.css` (font display desde config)
- Modify: `index.html` (title/meta desde config)

- [ ] **Step 1: Eliminar componentes reemplazados**

```bash
git rm src/components/MeshBackground.tsx src/components/OrbitalBlob.tsx src/components/LensFlareOverlay.tsx
```

Verificar que no quedan imports rotos:
```bash
npm run build
```
Expected: build OK sin errores de imports.

- [ ] **Step 2: Acortar BootSequence**

En `src/components/boot/BootSequence.tsx`, reducir las líneas de boot a 4-5 máximo. Más punchy, menos tiempo. Si `portfolioConfig.keepBoot === 'no'`, no renderizar.

- [ ] **Step 3: Font display desde config**

En `src/index.css`, el `--font-display` ya existe. Asegurar que el font elegido en config se carga. Añadir `@import` de Google Fonts condicional o usar el que ya está cargado en `index.html`. Para simplicidad, mantener Space Grotesk como default y documentar que cambiar font requiere actualizar el `<link>` en `index.html`.

- [ ] **Step 4: Title/meta desde config**

En `index.html`, el title puede leerse dinámicamente. Para simplicidad, dejar el title estático y actualizarlo manualmente tras onboarding, o inyectarlo desde `main.tsx`:
```typescript
import { portfolioConfig } from '@/lib/config';
document.title = `${portfolioConfig.name} — ${portfolioConfig.tagline}`;
```

- [ ] **Step 5: Build final + Lighthouse check**

```bash
npm run build
npm run preview
```
Verificar visualmente en http://localhost:4173 (preview port). Correr Lighthouse en el navegador.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: cleanup replaced components, polish boot and config"
```

---

## Task 9: Tests finales + verificación

**Files:**
- Modify: `src/test/config.test.ts` (ampliar)
- Run: full test suite

- [ ] **Step 1: Correr todos los tests**

```bash
npm test
```
Expected: todos PASS.

- [ ] **Step 2: Correr lint**

```bash
npm run lint
```
Expected: sin errores.

- [ ] **Step 3: Build producción**

```bash
npm run build
```
Expected: build OK, sin warnings de tamaño excesivo (three.js es grande, aceptar).

- [ ] **Step 4: Verificación visual final**

```bash
npm run preview
```
Checklist visual:
- [ ] Flow field background se ve y reacciona al mouse
- [ ] Hero 3D wireframe orbita
- [ ] Tech stack 3D iconos rotan, hover zoom
- [ ] Scroll smooth (Lenis)
- [ ] Reveal animations en projects/experience
- [ ] AI-Coder section aparece (si activada)
- [ ] CLI terminal funciona (si keepCli=yes)
- [ ] Boot sequence acortado (si keepBoot=yes)
- [ ] 4 temas funcionan
- [ ] i18n es/en funciona
- [ ] Mobile responsive
- [ ] prefers-reduced-motion respeta (probar en DevTools)

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "test: final verification, all tests pass"
```

---

## Resumen de ejecución

```bash
# 1. Onboarding (personalización)
npm run onboard

# 2. Ejecutar tasks en orden (0 → 9)
# Cada task termina con commit

# 3. Verificación final
npm test && npm run lint && npm run build
```

## Notas para el modelo ejecutor

- **Sigue los tasks en orden** (0 → 9). Cada task es independiente pero algunos dependen de anteriores.
- **No añadas features no listadas**. YAGNI. Si crees que falta algo, documenta en un `PENDING.md` pero no lo implementes.
- **Cada task termina con commit**. No acumules cambios.
- **Si un step falla**, no continues al siguiente. Fix el error, luego avanza.
- **prefers-reduced-motion y device tier** son obligatorios en todos los efectos 3D.
- **i18n**: toda string nueva va a `translations.ts` con es + en.
- **No hardcoded colors**: usa `var(--primary)`, `var(--accent)`, etc. Los temas dependen de esto.
- **El config loader** (`src/lib/config.ts`) es la fuente de verdad para personalización. Léelo donde necesites nombre, socials, colores.