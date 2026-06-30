export type ThemeId = "indigo" | "catppuccin" | "dracula" | "tokyo-night";

export const THEMES: Record<ThemeId, { label: string; emoji: string }> = {
  indigo: { label: "Indigo", emoji: "🟣" },
  catppuccin: { label: "Catppuccin Mocha", emoji: "🌸" },
  dracula: { label: "Dracula", emoji: "🧛" },
  "tokyo-night": { label: "Tokyo Night", emoji: "🌃" },
};

export const DEFAULT_THEME: ThemeId = "indigo";
export const THEME_STORAGE_KEY = "portfolio-theme";
