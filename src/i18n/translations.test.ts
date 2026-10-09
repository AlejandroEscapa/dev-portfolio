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
});
