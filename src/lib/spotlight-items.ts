import { THEMES, type ThemeId } from "./themes";
import { scrollToSection } from "./scroll";

export interface SpotlightItem {
  id: string;
  label: string;
  group: string;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
}

interface Ctx { setTheme: (t: ThemeId) => void; }

export function getSpotlightItems(ctx: Ctx): SpotlightItem[] {
  // Keys MUST be real DOM ids (WindowChrome wrappers in Index.tsx) or the
  // scroll no-ops silently. Labels may differ from the key when the
  // window title reads better (about = "~/stack", trayectoria = experience).
  const sections: SpotlightItem[] = [
    { key: "hero", label: "Go to hero" },
    { key: "about", label: "Go to stack" },
    { key: "projects", label: "Go to projects" },
    { key: "trayectoria", label: "Go to experience" },
    { key: "education", label: "Go to education" },
    { key: "contact", label: "Go to contact" },
  ].map(({ key, label }) => ({
    id: `section-${key}`,
    label,
    group: "Sections",
    keywords: [key, "scroll", "navigate"],
    action: () => scrollToSection(key),
  }));

  const socials: SpotlightItem[] = [
    { id: "social-github", label: "Open GitHub", group: "Social", shortcut: "@gh", action: () => window.open("https://github.com/alejandrooliesc", "_blank") },
    { id: "social-linkedin", label: "Open LinkedIn", group: "Social", shortcut: "@li", action: () => window.open("https://www.linkedin.com/in/alejandro-olivares-escapa/", "_blank") },
    { id: "social-email", label: "Send email", group: "Social", shortcut: "@mail", action: () => { window.location.href = "mailto:alejandro.oliesc97@gmail.com"; } },
  ];

  const themes: SpotlightItem[] = (Object.keys(THEMES) as ThemeId[]).map((id) => ({
    id: `theme-${id}`,
    label: `Theme: ${THEMES[id].label}`,
    group: "Themes",
    keywords: ["color", "palette", id],
    action: () => ctx.setTheme(id),
  }));

  const actions: SpotlightItem[] = [
    { id: "action-cmd-palette", label: "Open this palette", group: "Actions", shortcut: "⌘K", action: () => {} },
  ];

  return [...sections, ...socials, ...themes, ...actions];
}
