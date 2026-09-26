export type ProjectCategoryId = "mobile" | "web";

export type ProjectMedia =
  | { type: "video"; src: string; alt?: string }
  | { type: "image"; src: string; alt: string };

export type Highlight = {
  icon: HighlightIcon;
  label: string;
  value: string;
};

export type HighlightIcon =
  | "Smartphone"
  | "Globe"
  | "Zap"
  | "Boxes"
  | "Database"
  | "Workflow"
  | "GraduationCap";

export type StackCategoryId =
  | "language"
  | "framework"
  | "architecture"
  | "backend"
  | "context"
  | "styling"
  | "integration";

export type Project = {
  id: string;
  nameKey: string;
  descKey: string;
  longDescKey: string;
  badgeKey: string;
  media: ProjectMedia;
  githubUrl: string;
  liveUrl?: string;
  techTags: string[];
  categories: ProjectCategoryId[];
  highlights: Highlight[];
};

export type ProjectCategory = {
  id: ProjectCategoryId;
  i18nKey: string;
};

export const projectCategories: ProjectCategory[] = [
  { id: "mobile", i18nKey: "projects.filter_mobile" },
  { id: "web", i18nKey: "projects.filter_web" },
];

// ponytail: static category map keeps data clean and avoids per-project duplication.
// Order in the array = display order in the detail view.
const TECH_CATEGORY: Record<string, StackCategoryId> = {
  Swift: "language",
  Kotlin: "language",
  TypeScript: "language",
  SwiftUI: "framework",
  "Jetpack Compose": "framework",
  "Next.js 14": "framework",
  MVVM: "architecture",
  "Clean Architecture": "architecture",
  Firebase: "backend",
  Supabase: "backend",
  "API-Football": "backend",
  TFM: "context",
  "Tailwind CSS": "styling",
  "Framer Motion": "styling",
  n8n: "integration",
};

const CATEGORY_ORDER: StackCategoryId[] = [
  "language",
  "framework",
  "architecture",
  "backend",
  "styling",
  "integration",
  "context",
];

export const groupTechByCategory = (
  techTags: string[],
): { category: StackCategoryId; items: string[] }[] => {
  const buckets = new Map<StackCategoryId, string[]>();
  for (const tag of techTags) {
    const cat = TECH_CATEGORY[tag];
    if (!cat) continue;
    const list = buckets.get(cat) ?? [];
    list.push(tag);
    buckets.set(cat, list);
  }
  return CATEGORY_ORDER.filter((c) => buckets.has(c)).map((c) => ({
    category: c,
    items: buckets.get(c)!,
  }));
};

export const projects: Project[] = [
  {
    id: "gamevision",
    nameKey: "projects.gamevision_name",
    descKey: "projects.gamevision_desc",
    longDescKey: "projects.gamevision_long",
    badgeKey: "projects.gamevision_badge",
    media: { type: "video", src: "/gamevision-demo.mp4" },
    githubUrl: "https://github.com/AlejandroEscapa/GameVisionTFM",
    techTags: ["Android", "Kotlin", "Jetpack Compose", "MVVM", "Clean Architecture", "TFM"],
    categories: ["mobile"],
    highlights: [
      { icon: "Smartphone", label: "projects.highlight_platform", value: "Android" },
      { icon: "Zap", label: "projects.highlight_framework", value: "Jetpack Compose" },
      { icon: "Boxes", label: "projects.highlight_architecture", value: "MVVM" },
      { icon: "GraduationCap", label: "projects.highlight_context", value: "TFM" },
    ],
  },
  {
    id: "matchvision",
    nameKey: "projects.matchvision_name",
    descKey: "projects.matchvision_desc",
    longDescKey: "projects.matchvision_long",
    badgeKey: "projects.matchvision_badge",
    media: { type: "video", src: "/matchvision-demo.mp4" },
    githubUrl: "https://github.com/AlejandroEscapa/MatchVisionTFM",
    techTags: ["iOS", "Swift", "SwiftUI", "MVVM", "Firebase", "API-Football", "TFM"],
    categories: ["mobile"],
    highlights: [
      { icon: "Smartphone", label: "projects.highlight_platform", value: "iOS" },
      { icon: "Zap", label: "projects.highlight_framework", value: "SwiftUI" },
      { icon: "GraduationCap", label: "projects.highlight_grade", value: "9/10" },
      { icon: "Database", label: "projects.highlight_backend", value: "Firebase" },
    ],
  },
  // TODO [FUTURO - URLs]: Actualizar liveUrl y githubUrl cuando el proyecto esté en producción
  {
    id: "casahumedo",
    nameKey: "projects.casahumedo_name",
    descKey: "projects.casahumedo_desc",
    longDescKey: "projects.casahumedo_long",
    badgeKey: "projects.casahumedo_badge",
    media: { type: "image", src: "/casahumedo-preview.png", alt: "Casa Húmedo website preview" },
    githubUrl: "https://github.com/AlejandroEscapa",
    liveUrl: "https://preview--leon-craft-engine.lovable.app",
    techTags: ["Next.js 14", "TypeScript", "Tailwind CSS", "Supabase", "n8n", "Framer Motion"],
    categories: ["web"],
    highlights: [
      { icon: "Globe", label: "projects.highlight_platform", value: "Web" },
      { icon: "Zap", label: "projects.highlight_framework", value: "Next.js 14" },
      { icon: "Database", label: "projects.highlight_backend", value: "Supabase" },
      { icon: "Workflow", label: "projects.highlight_integration", value: "n8n" },
    ],
  },
];
