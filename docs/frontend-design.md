# Cosmic Chrome Design System (CCDS)
*Technical Design Manual & Visual Architecture*

## 1. System Identity
**Name:** Cosmic Chrome Design System
**Philosophy:** A cinematic, high-fidelity visual language that merges "Deep Space" aesthetics with a "Liquid Glass" modern interface. The goal is to convey technical sophistication, luxury, and professional precision through high-contrast electric accents and complex depth layers.
**Visual Language:** Modern SaaS / Cinematic Portfolio. It leverages dark-mode-only aesthetics with cosmic indigo depths and holographic highlights.

## 2. Technical Stack
- **Core:** React 18 + Vite + TypeScript.
- **Styling:** Tailwind CSS v3 (Utility-first approach).
- **UI Primitives:** shadcn/ui (based on Radix UI) for accessible, unstyled components.
- **Animations:** Framer Motion for orchestrating complex transitions and `tailwindcss-animate` for basic shifts.
- **Icons:** Lucide React.
- **Typography:**
  - **Headings:** `Space Grotesk` (Tracking: tighter).
  - **Body:** `Inter` (Antialiased).

## 3. Atomic Structure

### Atoms (Primitives)
Located in `src/components/ui/`. These are the smallest functional units.
- **Buttons:** `Button` (CVA based variants).
- **Inputs:** `Input`, `Textarea`, `Checkbox`, `Switch`.
- **Indicators:** `Badge`, `Progress`, `Separator`.
- **Feedback:** `Toast`, `Alert`, `Tooltip`.
- **Overlays:** `Dialog`, `Popover`, `Sheet`.

### Molecules (Composite Components)
Intermediate components that combine atoms.
- **Navigation:** `NavLink` (Combining anchor tags with themed hover states).
- **Containers:** `SectionContainer` (Logic for consistent section padding and alignment).
- **Decorations:** `OrbitalBlob`, `CodeBackground` (Visual accents).

### Organisms (Layout Modules)
Complex components forming the page structure, located in `src/components/sections/`.
- **Hero Section:** High-impact entry point with mesh backgrounds and primary CTAs.
- **Profile/About:** Integrated identity blocks.
- **TechStack:** Grid-based display of competencies.
- **Experience/Education:** Timeline-based professional history.
- **Projects:** Portfolio grid highlighting work.
- **Footer:** Site termination with social links and branding.

## 4. Layout & Grid System
- **Container:** Centered layout with `1.5rem` horizontal padding. Maximum width constrained to `1400px` (2xl).
- **Responsiveness:** Mobile-first approach using Tailwind's breakpoint system (`sm`, `md`, `lg`, `xl`, `2xl`).
- **Spacing:** Consistent vertical rhythm managed via `SectionContainer` and Tailwind's spacing scale.
- **Backgrounds:** 
  - `mesh-bg`: Multi-stop radial gradients for ambient lighting.
  - `grid-bg`: subtle 64px linear grid for architectural feel.

## 5. Component Guidelines

### Development Workflow
1. **Primitives First:** Check if a primitive exists in `@/components/ui`. If not, add via shadcn CLI.
2. **Styling:** Use `cn()` utility (`src/lib/utils.ts`) for conditional classes.
3. **Variants:** Use `class-variance-authority` (CVA) for components with multiple visual states.

### Naming & Structure
- **Files:** PascalCase (`MyComponent.tsx`).
- **Directory:**
  - `src/components/ui/` $\rightarrow$ Pure primitives.
  - `src/components/sections/` $\rightarrow$ Page-specific compositions.
  - `src/components/` $\rightarrow$ Global shared components.

### Visual Constraints
- **Colors:** ALWAYS use HSL variables defined in `src/index.css`. Never hardcode hex colors.
- **Radius:** Use the system `--radius` (`1rem`) to maintain consistent rounding.

## 6. State of UI

### Visual States
- **Default:** Dark cosmic background (`--background`).
- **Focus/Active:** Primary electric indigo (`--primary`) with glow effects.
- **Hover:** Use `.hover-glow` for interactive elements to trigger box-shadow and border-color transitions.
- **Loading:** `Skeleton` components used for content placeholders.

### Depth & Materiality
- **Glassmorphism:** 
  - `.glass`: Low-opacity blur for standard overlays.
  - `.glass-strong`: Higher opacity blur for critical containers.
- **Cinematic Chrome:** 
  - `.liquid-glass`: Ultra-subtle blur with a high-contrast top/bottom border gradient to simulate light refraction on a curved surface.
- **Glows:** 
  - `.glow-primary` / `.glow-accent`: Intense outer shadows for highlighting "hero" elements.

### Animation Patterns
- **Ambient:** `mesh-drift` (slow shifting gradients).
- **Attention:** `pulse-glow` (soft breathing effect for CTAs).
- **Organic:** `float` (vertical oscillation for floating elements).
- **Progressive:** `shimmer` (linear movement for loading/highlight states).
