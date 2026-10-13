import { useEffect, useState, useCallback } from "react";
import { type ThemeId, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";
import { startThemeTransition, type ThemeOrigin } from "@/lib/theme-transition";

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

  // El cambio se aplica y se persiste DENTRO del callback de la transición:
  //
  // 1. `data-theme` tiene que cambiar ahí (antes del commit de React) o el
  //    snapshot nuevo de la View Transition no incluiría el tema.
  // 2. Persistir aquí, y no solo en el efecto de arriba, evita una carrera
  //    real: quien cambia el tema puede desmontarse en el mismo commit
  //    (`ThemeMenu` cierra el popover al elegir), y entonces su efecto nunca
  //    corre y la elección no se guardaba. El efecto se queda como red de
  //    seguridad para el montaje inicial y HMR, reaplicando el mismo valor.
  //
  // Así los tres puntos de entrada (dock, Spotlight y CLI) se comportan igual.
  const setTheme = useCallback((next: ThemeId, origin?: ThemeOrigin) => {
    startThemeTransition(() => {
      applyTheme(next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }, origin);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
