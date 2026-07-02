# Projects Section — 3D Carousel + Detail View (reference layout, our design)

**Date:** 2026-07-01
**Status:** Draft
**Reference:** `portfolio-main/repomix-output.xml` → `widgets/projects-section/`

## Goal

Replace the current vertical stack of project cards (`src/components/sections/Projects.tsx`) with a 3D carousel layout that matches the reference's disposition, modal behavior and detail view structure, but rendered with our own design system (glassmorphism, HSL tokens, Space Grotesk / Inter / Courier Prime, MeshBackground atmosphere, WindowChrome wrapper).

The user explicitly deferred the "click tech in stack → filter projects" feature. Everything else about the reference's projects section is in scope.

## Scope

In scope:
- 3D carousel of project cards (CSS transforms with `data-position` attribute, identical to reference).
- Click on a card opens a detail view in the same section (in-section swap, not a true modal — identical to reference).
- Detail view: 2-column layout (media left, info right) with back button, description, tech chips, GitHub repo button, optional "View site" / "Download" button.
- Category filter chips above the carousel (using our project's `mobile` / `web` categories).
- Drag / swipe support on the carousel (pointer events, threshold 50px, debounce 600ms).
- Keyboard nav: ← / → to shift carousel, Esc to close detail, Tab to navigate action buttons.
- Mobile (<768px): vertical stack of cards; click opens a Radix Dialog full-screen with the same detail content.
- `prefers-reduced-motion: reduce`: disable 3D transforms, use simple opacity transitions.
- WindowChrome wrapper stays as-is (section id `projects`, title `~/projects — ls -la`).

Out of scope (deferred to a future iteration):
- Click on a tech in `TechStack` / `TechBento` → filter the projects carousel.
- GitHub stars badge (no API call, no static fallback).
- Parallax title animation from the reference (use our own heading style).
- Categories from the reference that don't apply to our 3 projects (`libraries`, `tools`, `desktop`, `extensions`).

## Approach

**Option A — Pure CSS 3D carousel with `data-position` attribute (selected).**

Each card receives a `data-position={n}` (n ∈ [-2..8]) computed from `currentIndex` and the filtered list length. CSS rules per `data-position` value produce the 3D layout. This matches the reference exactly and keeps the bundle small (no new carousel lib, no framer-motion for the carousel itself — only for detail view enter/exit).

Rejected alternatives:
- **Option B — framer-motion 3D carousel.** More flexibility, but two animation systems (CSS for transform + framer for enter/exit) is harder to keep in sync. The reference proves the pure-CSS approach handles 3D carousel physics well.
- **Option C — embla-carousel-react with custom 3D transform injection.** embla is 2D-first; bending it into 3D requires overriding the engine. Not worth the fight.

## Data model

```ts
// src/data/projects.ts
export type ProjectCategoryId = "mobile" | "web";

export type ProjectMedia =
  | { type: "video"; src: string; alt?: string }
  | { type: "image"; src: string; alt: string };

export type Project = {
  id: string;                  // "gamevision" | "matchvision" | "casahumedo"
  nameKey: string;             // "projects.gamevision_name"
  descKey: string;             // short desc (card)
  longDescKey?: string;        // long desc (detail)
  badgeKey: string;            // "projects.gamevision_badge"
  media: ProjectMedia;         // plain video / image — no phone or browser frame
  githubUrl: string;
  liveUrl?: string;            // → "View site" button when present
  techTags: string[];          // for chip display
  categories: ProjectCategoryId[];
};

export const projectCategories: { id: ProjectCategoryId; i18nKey: string }[] = [
  { id: "mobile", i18nKey: "projects.filter_mobile" },
  { id: "web",    i18nKey: "projects.filter_web"    },
];
```

## Component tree

```
src/components/sections/projects/
├── Projects.tsx              # Entry: state, WindowChrome, mount <ProjectsCarousel> or <ProjectDetail>
├── ProjectsCarousel.tsx      # 3D carousel (desktop), wraps ProjectCard list
├── ProjectCard.tsx           # Card body: media, title, desc, tech chips, "View details" + GitHub
├── ProjectDetail.tsx         # 2-col detail (desktop) / Dialog content (mobile)
├── ProjectCategoryChips.tsx  # Filter chips (toggle)
├── MobileProjectList.tsx     # Vertical stack for <768px
├── MobileProjectDialog.tsx   # Radix Dialog wrapper for mobile detail
└── projects.module.css       # All CSS — data-position rules, slideInBlur, riseOutBlur
```

## State and interactions

Single source of truth in `Projects.tsx`:

```ts
const [activeCategories, setActiveCategories] = useState<ProjectCategoryId[]>([]); // [] = all
const [currentIndex, setCurrentIndex]         = useState(0);
const [selectedProject, setSelectedProject]   = useState<Project | null>(null);
const [viewMode, setViewMode]                 = useState<"carousel" | "transitioning" | "detail">("carousel");
const [isExiting, setIsExiting]               = useState(false);
```

- **Click card** → `setSelectedProject`, `setViewMode("transitioning")`, `setIsExiting(true)` → 500ms (carousel exit) → `setViewMode("detail")`, `setIsExiting(false)` (detail enter).
- **Click "Back"** → `setIsExiting(true)` → 400ms (detail exit) → reset to `viewMode = "carousel"`.
- **Filter chip** → toggle in `activeCategories`. If the previously active project is no longer in the filtered list, reset `currentIndex` to 0; else keep the same project active.
- **Drag / swipe** → `onPointerDown/Move/Up` on the carousel container. 50px threshold, 600ms debounce. Touch and mouse both supported.
- **Keyboard** → `←` / `→` on the carousel → shift index. `Esc` on detail → close. `Tab` cycles action buttons.

## Edge cases

- **Mobile (<768px):** the entire 3D carousel is replaced by `MobileProjectList` (vertical grid of cards). Click opens `MobileProjectDialog` (Radix Dialog, full-screen, same `ProjectDetail` content).
- **Reduced motion:** `matchMedia("(prefers-reduced-motion: reduce)")` → skip `data-position` transforms, use simple opacity fade for card swaps and detail transitions.
- **Empty filter result:** show a localized empty-state message ("No projects match this filter") with a "Clear filters" button.
- **Single project in filter:** no left/right navigation arrows, no drag handlers attached.
- **Existing "View my projects" CTA in Hero:** `href="#projects"` keeps working — no change.

## Acceptance criteria

1. `npm run dev` (port 8080) shows the new projects section inside the same `WindowChrome` (id `projects`).
2. On desktop, three project cards are visible in a 3D carousel; only the center card is fully clickable.
3. Clicking the center card animates the carousel out (≤500ms) and the detail view in (≤600ms), matching the reference's `riseOutBlur` / `slideInBlur` feel.
4. Detail view shows: media on the left, title + long description + tech chips + GitHub + optional `liveUrl` button on the right, plus a "Back" button at the top.
5. Category filter chips above the carousel toggle the visible set; active chip uses our `--primary` token.
6. `←` / `→` keys shift the carousel; `Esc` closes the detail view.
7. Drag / swipe on the carousel works with a 50px threshold and 600ms debounce.
8. `prefers-reduced-motion: reduce` disables 3D transforms.
9. At <768px, the 3D carousel is replaced by a vertical stack; clicking a card opens a Radix Dialog with the same detail content.
10. `npm run lint` and `npm test` pass.
11. No new dependencies added.

## Asset reuse

- `/gamevision-demo.mp4`, `/matchvision-demo.mp4`, `/casahumedo-preview.png` already exist in `public/`.
- `PhoneVideo.tsx` and `BrowserPreview.tsx` are no longer used by the projects section but stay in the codebase (not deleted — used elsewhere or kept for future use).

## What gets removed

- The vertical stack of `<ProjectCard>`-style blocks (3 of them) inside the current `Projects.tsx`.
- Inline `framer-motion` `motion.div` from the current card layout (the replacement uses CSS for the 3D layout, framer-motion only for the detail enter/exit).

## What stays the same

- `WindowChrome` wrapper, its title, and the `id="projects"` anchor.
- The `Projects` component's import in `Index.tsx` (`import Projects from "@/components/sections/Projects"`).
- The i18n key pattern (`projects.*`) — only new keys are added (`filter_mobile`, `filter_web`, `longDesc` for each project, `view_details`, `back`).
- The `useLanguage()` / `useTranslation()` pattern already used in the current `Projects.tsx`.
