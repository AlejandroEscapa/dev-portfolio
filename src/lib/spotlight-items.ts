import { THEMES, type ThemeId } from "./themes";

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
  const sections: SpotlightItem[] = [
    "hero", "about", "profile", "stack", "experience", "projects", "education", "contact",
  ].map((id) => ({
    id: `section-${id}`,
    label: `Go to ${id}`,
    group: "Sections",
    keywords: [id, "scroll", "navigate"],
    action: () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
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
