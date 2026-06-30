import { useEffect, useState, useCallback } from "react";
import { type ThemeId, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

export function applyTheme(theme: ThemeId) {
  if (theme === DEFAULT_THEME) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    return stored ?? DEFAULT_THEME;
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => setThemeState(next), []);

  return { theme, setTheme };
}
