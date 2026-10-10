export type ThemeId = "indigo" | "catppuccin" | "dracula" | "tokyo-night" | "amber";

/** Tema que existe en el pipeline pero no se anuncia en ninguna superficie. */
export type SecretThemeId = "amber";

/** Temas públicos: los únicos que ven el menú del dock y el Spotlight. */
export type PublicThemeId = Exclude<ThemeId, SecretThemeId>;

export const THEMES: Record<PublicThemeId, { label: string; emoji: string }> = {
  indigo: { label: "Indigo", emoji: "🟣" },
  catppuccin: { label: "Catppuccin Mocha", emoji: "🌸" },
  dracula: { label: "Dracula", emoji: "🧛" },
  "tokyo-night": { label: "Tokyo Night", emoji: "🌃" },
};

/**
 * Easter egg (BRAINSTORM §5 C2): el tema ámbar CRT no se lista en el menú ni
 * en Spotlight. Solo lo desbloquea `sudo theme amber` en la terminal, y queda
 * persistido en `localStorage` como cualquier otro. Vive en este catálogo
 * separado para que añadirlo al pipeline no lo haga visible por accidente.
 */
export const SECRET_THEMES: Record<SecretThemeId, { label: string; emoji: string }> = {
  amber: { label: "Amber CRT", emoji: "🟠" },
};

export const DEFAULT_THEME: ThemeId = "indigo";
export const THEME_STORAGE_KEY = "portfolio-theme";

export const isSecretTheme = (value: string): value is SecretThemeId =>
  value in SECRET_THEMES;

export const isThemeId = (value: string): value is ThemeId =>
  value in THEMES || isSecretTheme(value);
