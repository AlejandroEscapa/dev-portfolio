# AGENTS.md

## Stack
Vite + React 18 + TypeScript + Tailwind v3 + shadcn/ui (Radix). React Router v6, TanStack Query, Framer Motion, react-hook-form + zod.

## Commands
- `npm run dev` — dev server on **port 8080** (not Vite default 5173)
- `npm run build` / `npm run build:dev` — production / development build
- `npm run lint` — ESLint (flat config, `eslint .`)
- `npm test` — Vitest single run; `npm run test:watch` for watch mode
- Test files: `src/**/*.{test,spec}.{ts,tsx}` (jsdom environment, globals enabled)

## Path alias
`@/*` → `./src/*` (configured in tsconfig, vite, and vitest configs)

## Architecture
Single-page portfolio. Entry: `src/main.tsx` → `src/App.tsx`.
- `src/pages/Index.tsx` — main page composing all sections in order: Hero → Profile → About → TechStack → Experience → Projects → Education → Footer
- `src/components/sections/` — page section components
- `src/components/ui/` — shadcn/ui primitives (do not hand-edit; managed by shadcn CLI)
- `src/components/` — top-level components (MeshBackground, Nav, NavLink)
- `src/hooks/` — custom hooks
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge)

## shadcn/ui
- Config: `components.json` (style: default, RSC: false, baseColor: slate, cssVariables: true)
- Add components via shadcn CLI, not by hand
- UI component alias: `@/components/ui`

## TypeScript & linting quirks
- **Strict mode is OFF**: `strict: false`, `strictNullChecks: false`, `noImplicitAny: false`
- `noUnusedLocals` and `noUnusedParameters` are OFF
- ESLint `@typescript-eslint/no-unused-vars` is OFF — unused vars won't flag

## Design system
- All colors are HSL CSS custom properties defined in `src/index.css` (`:root` layer)
- Dark-only theme (no light mode toggle despite `darkMode: ["class"]` in Tailwind)
- Custom utility classes in `src/index.css`: `.text-gradient`, `.text-gradient-primary`, `.glass`, `.glass-strong`, `.mesh-bg`, `.grid-bg`, `.glow-primary`, `.hover-glow`
- Custom animations in `tailwind.config.ts`: `mesh-drift`, `pulse-glow`, `float`, `shimmer`
- Fonts: **Space Grotesk** (headings), **Inter** (body)

## Testing
- Setup: `src/test/setup.ts` — imports `@testing-library/jest-dom`, mocks `window.matchMedia`
- Libraries: `@testing-library/react`, `vitest`

## Lockfiles
Both `bun.lockb` and `package-lock.json` exist. Use `npm` for installs to stay consistent with npm scripts.
