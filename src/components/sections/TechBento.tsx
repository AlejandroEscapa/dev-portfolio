import { Code2, Brain, Layout, Cloud } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TechItem {
  name: string;
  svg: string | null;
  iconLucide: LucideIcon | null;
}

interface TechCategory {
  titleKey: string;
  items: TechItem[];
  accent: "primary" | "accent" | "glow";
  icon: LucideIcon;
  /** Spans both columns of the bento grid. DOM order must keep the 2-col
      cells adjacent to a row boundary or auto-placement leaves a hole:
      frontend featured(2) | languages-tools + backend(1+1). */
  featured?: boolean;
}

const CATEGORIES: TechCategory[] = [
  {
    titleKey: "tech.frontend_title",
    accent: "accent",
    icon: Layout,
    featured: true,
    items: [
      { name: "HTML", svg: "/icons/html5.svg", iconLucide: null },
      { name: "CSS", svg: "/icons/css.svg", iconLucide: null },
      { name: "React", svg: "/icons/react.svg", iconLucide: null },
      { name: "Vue", svg: "/icons/vue.svg", iconLucide: null },
      { name: "Next.js", svg: "/icons/nextjs.svg", iconLucide: null },
      { name: "Tailwind CSS", svg: "/icons/tailwindcss.svg", iconLucide: null },
      { name: "GSAP", svg: "/icons/gsap.svg", iconLucide: null },
      { name: "Three.js", svg: "/icons/three.svg", iconLucide: null },
      { name: "Flutter", svg: "/icons/flutter.svg", iconLucide: null },
    ],
  },
  {
    titleKey: "tech.lang_tools_title",
    accent: "primary",
    icon: Code2,
    items: [
      { name: "C", svg: "/icons/c.svg", iconLucide: null },
      { name: "Python", svg: "/icons/python.svg", iconLucide: null },
      { name: "PHP", svg: "/icons/php.svg", iconLucide: null },
      { name: "JavaScript", svg: "/icons/javascript.svg", iconLucide: null },
      { name: "TypeScript", svg: "/icons/ts.svg", iconLucide: null },
      { name: "Git", svg: "/icons/git.svg", iconLucide: null },
      { name: "Make", svg: "/icons/make.svg", iconLucide: null },
      { name: "Swagger", svg: "/icons/swagger.svg", iconLucide: null },
      { name: "Integración de IA", svg: null, iconLucide: Brain },
    ],
  },
  {
    titleKey: "tech.backend_title",
    accent: "glow",
    icon: Cloud,
    items: [
      { name: "Node.js", svg: "/icons/nodejs.svg", iconLucide: null },
      { name: "Laravel", svg: "/icons/laravel.svg", iconLucide: null },
      { name: "NestJS", svg: "/icons/nestjs.svg", iconLucide: null },
      { name: "MySQL", svg: "/icons/mysql.svg", iconLucide: null },
      { name: "PostgreSQL", svg: "/icons/postgre.svg", iconLucide: null },
      { name: "Firebase", svg: "/icons/firebase.svg", iconLucide: null },
      { name: "Supabase", svg: "/icons/supabase.svg", iconLucide: null },
      { name: "Docker", svg: "/icons/docker.svg", iconLucide: null },
      { name: "Apicalypse", svg: null, iconLucide: Code2 },
    ],
  },
];

// One accent cue per category (the top border). Icons and titles stay
// neutral: brand SVGs already carry colour, so tinted fallbacks competed.
const accentBorder = {
  primary: "border-t-primary/25",
  accent: "border-t-accent/25",
  glow: "border-t-primary-glow/25",
} as const;

function TechIcon({ item }: { item: TechItem }) {
  if (item.svg) {
    return <img src={item.svg} alt={item.name} className="h-[18px] w-[18px] shrink-0 object-contain" />;
  }
  if (item.iconLucide) {
    const Icon = item.iconLucide;
    return <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />;
  }
  return null;
}

export function TechBento() {
  const { t } = useLanguage();

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CATEGORIES.map((cat) => {
        const HeaderIcon = cat.icon;

        return (
          <div
            key={cat.titleKey}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
            }}
            className={`specular glass rounded-lg border-t-2 p-6 transition-all duration-300 hover:bg-neutral-tint/[0.03] hover:-translate-y-0.5 ${accentBorder[cat.accent]} ${cat.featured ? "sm:col-span-2" : ""}`}
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-sm bg-neutral-tint/[0.04] p-2 text-muted-foreground">
                <HeaderIcon className="h-4 w-4" />
              </div>
              <h3
                className="font-mono text-label font-medium uppercase tracking-label text-foreground"
              >
                {t(cat.titleKey)}
              </h3>
            </div>

            {/* Chips — flex layout: 3 per row, last 2 fill 50% each */}
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <span
                  key={item.name}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-neutral-tint/[0.08] bg-neutral-tint/[0.04] px-3 py-2.5 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-all duration-200 hover:border-neutral-tint/[0.15] hover:bg-neutral-tint/[0.08] hover:text-foreground hover:shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
                  style={{ minWidth: "calc(33.333% - 6px)", flex: "1 1 0" }}
                >
                  <TechIcon item={item} />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
