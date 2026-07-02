# 3D Tech Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace wireframe cubes in TechStack3D with flat 3D panels showing tech logos as textures.

**Architecture:** Single component change. Each tech icon becomes a thin `boxGeometry` with an SVG logo loaded as a texture via `useTexture`. Ambient + directional lights added inside TechStack3D since Scene has none.

**Tech Stack:** React 18, TypeScript, Three.js 0.185, @react-three/fiber 8.18, @react-three/drei 9.122

## Global Constraints

- `useTexture` from `@react-three/drei` for SVG loading (handles TextureLoader + rasterization)
- SVGs in `public/icons/` — paths relative to public root (`/icons/...`)
- Keep `Float` animation, hover scale, reduced motion support
- `meshStandardMaterial` with `transparent: true` for SVG alpha
- Remove unused `onSelect` prop

---

### Task 1: Refactor TechStack3D.tsx

**Files:**
- Modify: `src/components/three/TechStack3D.tsx`
- Assets: already in `public/icons/`

- [ ] **Step 1: Read current file**

- [ ] **Step 2: Rewrite TechStack3D.tsx**

```tsx
import { Float, useTexture } from "@react-three/drei";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TechItem {
  name: string;
  icon: string;
  position: [number, number, number];
}

const TECH_ITEMS: TechItem[] = [
  // Row 1 — Languages
  { name: "TypeScript", icon: "/icons/ts.svg", position: [-3, 2, 0] },
  { name: "Kotlin", icon: "/icons/kotlin.svg", position: [-1.5, 2, 0] },
  { name: "Java", icon: "/icons/java.svg", position: [0, 2, 0] },
  { name: "Swift", icon: "/icons/swift.svg", position: [1.5, 2, 0] },
  { name: "Python", icon: "/icons/python.svg", position: [3, 2, 0] },
  // Row 2 — Frameworks & Tools
  { name: "Angular", icon: "/icons/angular.svg", position: [-3, 0, 0] },
  { name: "React", icon: "/icons/react.svg", position: [-1.5, 0, 0] },
  { name: "Docker", icon: "/icons/docker.svg", position: [0, 0, 0] },
  { name: "PostgreSQL", icon: "/icons/postgre.svg", position: [1.5, 0, 0] },
  { name: "MongoDB", icon: "/icons/mongodb.svg", position: [3, 0, 0] },
  // Row 3 — Platforms
  { name: "GitHub", icon: "/icons/github.svg", position: [-1.5, -2, 0] },
  { name: "Supabase", icon: "/icons/supabase.svg", position: [0, -2, 0] },
  { name: "VS Code", icon: "/icons/vscode.svg", position: [1.5, -2, 0] },
];

function TechIcon({ item, isHovered }: { item: TechItem; isHovered: boolean }) {
  const texture = useTexture(item.icon);

  return (
    <mesh
      position={item.position}
      scale={isHovered ? 1.3 : 1}
    >
      <boxGeometry args={[0.8, 0.8, 0.08]} />
      <meshStandardMaterial
        map={texture}
        transparent
        metalness={0.05}
        roughness={0.6}
      />
    </mesh>
  );
}

export function TechStack3D() {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      {TECH_ITEMS.map((item) => (
        <Float
          key={item.name}
          speed={reduced ? 0 : 1.5}
          rotationIntensity={reduced ? 0 : 0.3}
          floatIntensity={reduced ? 0 : 0.5}
        >
          <group
            onPointerOver={() => setHovered(item.name)}
            onPointerOut={() => setHovered(null)}
          >
            <TechIcon item={item} isHovered={hovered === item.name} />
          </group>
        </Float>
      ))}
    </>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds, no TS errors.

- [ ] **Step 4: Visual check**

Run: `npm run dev`
Expected: 13 flat panels with tech logos floating in the About section. Hover enlarges.
