import { describe, expect, it } from "vitest";
import { SECRET_THEMES, THEMES, isSecretTheme, isThemeId } from "./themes";

describe("catálogo de temas", () => {
  it("el menú lista exactamente los cuatro temas públicos", () => {
    expect(Object.keys(THEMES)).toEqual([
      "indigo",
      "catppuccin",
      "dracula",
      "tokyo-night",
    ]);
  });

  it("ámbar existe como tema pero NO está en el menú", () => {
    expect(Object.keys(SECRET_THEMES)).toEqual(["amber"]);
    expect(Object.keys(THEMES)).not.toContain("amber");
    expect(isSecretTheme("amber")).toBe(true);
  });

  it("isThemeId acepta los públicos y el secreto, y rechaza lo que no es tema", () => {
    expect(isThemeId("dracula")).toBe(true);
    expect(isThemeId("amber")).toBe(true);
    expect(isThemeId("neon")).toBe(false);
    expect(isThemeId("")).toBe(false);
  });

  it("isSecretTheme no confunde un tema público con uno oculto", () => {
    expect(isSecretTheme("indigo")).toBe(false);
    expect(isSecretTheme("neon")).toBe(false);
  });
});
