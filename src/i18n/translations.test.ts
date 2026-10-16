import { describe, expect, it } from "vitest";
import { translations } from "./translations";

describe("translations", () => {
  it("keeps en and es key sets symmetric", () => {
    const en = Object.keys(translations.en).sort();
    const es = Object.keys(translations.es).sort();

    expect(es).toEqual(en);
  });

  it("has the contextual cursor labels in both locales", () => {
    for (const lang of ["en", "es"] as const) {
      expect(translations[lang]["cursor.view"]).toBeTruthy();
      expect(translations[lang]["cursor.open"]).toBeTruthy();
    }
  });

  it("positions the profile without overstating Angular experience", () => {
    expect(translations.en["hero.description"]).toMatch(/full[- ]stack/i);
    expect(translations.en["hero.description"]).toMatch(/mobile/i);
    expect(translations.en["hero.description"]).toMatch(/React/i);
    expect(translations.en["hero.description"]).not.toMatch(/tech lead|production angular/i);
    expect(translations.es["hero.description"]).toMatch(/full stack/i);
    expect(translations.es["hero.description"]).toMatch(/móvil/i);
    expect(translations.es["hero.description"]).toMatch(/React/i);
    expect(translations.es["hero.description"]).not.toMatch(/tech lead|angular en producción/i);
    expect(translations.en["trayectoria.item_mas_title"]).toMatch(/intern/i);
    expect(translations.en["trayectoria.item_mas_title"]).not.toMatch(/lead/i);
    expect(translations.es["trayectoria.item_mas_title"]).toMatch(/prácticas/i);
    expect(translations.es["trayectoria.item_mas_title"]).not.toMatch(/lead/i);
  });

  it("uses the confirmed Tokio School dates in both locales", () => {
    expect(translations.en["education.tokio_period"]).toBe("Jan 2024 – Mar 2026");
    expect(translations.es["education.tokio_period"]).toBe("Ene 2024 – Mar 2026");
  });

  it("keeps the Workbench workflow bilingual and explicit about verification", () => {
    for (const lang of ["en", "es"] as const) {
      expect(translations[lang]["workbench.heading"]).toBeTruthy();
      expect(translations[lang]["workbench.tools_body"]).toMatch(/Cursor/);
      expect(translations[lang]["workbench.tools_body"]).toMatch(/MCP/);
      expect(translations[lang]["workbench.tools_body"]).toMatch(/GSD/);
      expect(translations[lang]["workbench.tools_body"]).toMatch(/skills/i);
      expect(translations[lang]["workbench.review_body"]).toMatch(/test/i);
      expect(translations[lang]["workbench.review_body"]).toMatch(/diff/i);
    }
  });

  it("keeps the project case descriptions specific without implying production launches", () => {
    expect(translations.en["projects.gamevision_long"]).toMatch(/RAWG.*Twitch|Twitch.*RAWG/);
    expect(translations.es["projects.gamevision_long"]).toMatch(/RAWG.*Twitch|Twitch.*RAWG/);
    expect(translations.en["projects.matchvision_long"]).toMatch(/API-Football/);
    expect(translations.es["projects.matchvision_long"]).toMatch(/API-Football/);
    expect(translations.en["projects.casahumedo_long"]).toMatch(/demo/i);
    expect(translations.es["projects.casahumedo_long"]).toMatch(/demo/i);
    expect(translations.en["projects.casahumedo_long"]).not.toMatch(/launched in production/i);
    expect(translations.es["projects.casahumedo_long"]).not.toMatch(/lanzada en producción/i);
  });

  it("labels MAS as internship work rather than a leadership role", () => {
    for (const lang of ["en", "es"] as const) {
      expect(translations[lang]["contributions.mas_title"]).toMatch(/intern|prácticas/i);
      expect(translations[lang]["contributions.mas_resolucion"]).toMatch(/intern|prácticas/i);
      expect(translations[lang]["contributions.mas_title"]).not.toMatch(/tech lead/i);
    }
  });

  it("keeps the profile title consistent in public metadata", () => {
    // This tests the runtime profile copy; index.html is checked by diff review.
    expect(translations.en["hero.description"]).toContain("Full-Stack Developer focused on mobile");
    expect(translations.es["hero.description"]).toContain("Desarrollador Full Stack con foco en móvil");
  });


});
