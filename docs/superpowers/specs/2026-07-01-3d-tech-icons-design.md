# 3D Tech Icons — Replacing Wireframe Cubes with Logo Textures

**Date:** 2026-07-01
**Status:** Draft

## Goal

Replace the abstract wireframe cubes in `TechStack3D` (About section) with flat 3D panels that display the actual logo of each technology as a texture. The result should look professional while keeping the existing Float animation, hover effects, and scene setup.

## Approach

**Option A — Flat panels with logo textures** (selected).

Each tech becomes a thin `boxGeometry` (0.8 × 0.8 × 0.08) with the SVG logo loaded as a `map` texture via `useTexture` from drei. The flat panel preserves logo readability while the slight depth and Float rotation give the 3D feel.

## Technologies

13 icons (aligned with what the user downloaded to `public/icons/`):

| Icon file | Label | Row | Position |
|---|---|---|---|
| `/icons/ts.svg` | TypeScript | 1 | (-3, 2, 0) |
| `/icons/kotlin.svg` | Kotlin | 1 | (-1.5, 2, 0) |
| `/icons/java.svg` | Java | 1 | (0, 2, 0) |
| `/icons/swift.svg` | Swift | 1 | (1.5, 2, 0) |
| `/icons/python.svg` | Python | 1 | (3, 2, 0) |
| `/icons/angular.svg` | Angular | 2 | (-3, 0, 0) |
| `/icons/react.svg` | React | 2 | (-1.5, 0, 0) |
| `/icons/docker.svg` | Docker | 2 | (0, 0, 0) |
| `/icons/postgre.svg` | PostgreSQL | 2 | (1.5, 0, 0) |
| `/icons/mongodb.svg` | MongoDB | 2 | (3, 0, 0) |
| `/icons/github.svg` | GitHub | 3 | (-1.5, -2, 0) |
| `/icons/supabase.svg` | Supabase | 3 | (0, -2, 0) |
| `/icons/vscode.svg` | VS Code | 3 | (1.5, -2, 0) |

3 rows × 5-5-3 layout. Row 3 centred with 1.5 spacing between items.

## Component changes

### `TechStack3D.tsx`

- **Geometry:** `boxGeometry` → `[0.8, 0.8, 0.08]` (thin panel)
- **Material:** `meshStandardMaterial` with `map={texture}`, `transparent`, `metalness={0.05}`, `roughness={0.6}`
- **Lighting:** Add `<ambientLight intensity={0.7} />` + `<directionalLight position={[5, 5, 5]} />` inside the component (Scene is shared and currently has no lights)
- **Icons:** Extract each into a `TechIcon` sub-component so `useTexture` respects hook rules
- **Hover:** Keep scale 1→1.3 and pointer events
- **Float:** Keep existing animation
- **Props:** Remove unused `onSelect`

### `Scene.tsx`

No changes needed. The Canvas wrapper stays as-is.

### `About.tsx`

No changes needed. Already uses `<Scene><TechStack3D /></Scene>`.

## Assets

13 SVG files already in `public/icons/`. No new dependencies.

## What gets removed

- `color` and `wireframe` from materials
- `onSelect` prop from TechStack3D
- Node.js, Three.js, GSAP, Tailwind, Vite, Git icons (replaced by new set)
