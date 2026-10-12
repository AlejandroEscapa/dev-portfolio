import { describe, expect, it } from "vitest";
import { contributions } from "./contributions";
import { translations } from "../i18n/translations";

describe("contributions", () => {
  it("contains 3 entries in chronological order", () => {
    expect(contributions).toHaveLength(3);
    expect(contributions.map((c) => c.id)).toEqual(["leasba", "mas", "creators"]);
  });

  it("has unique ids and fake 7-hex hashes", () => {
    const ids = contributions.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    contributions.forEach((c) => {
      expect(c.hash).toMatch(/^[0-9a-f]{7}$/);
    });
  });

  it("has the 3 story parts present", () => {
    contributions.forEach((c) => {
      expect(c.storyKeys.problema).toBeTruthy();
      expect(c.storyKeys.hilo).toBeTruthy();
      expect(c.storyKeys.resolucion).toBeTruthy();
    });
  });

  it("every referenced i18n key exists in both es and en", () => {
    contributions.forEach((c) => {
      const keys = [
        c.companyKey,
        c.period,
        c.titleKey,
        c.storyKeys.problema,
        c.storyKeys.hilo,
        c.storyKeys.resolucion,
      ];
      keys.forEach((k) => {
        for (const lang of ["es", "en"] as const) {
          expect(translations[lang][k]).toBeTruthy();
        }
      });
    });
  });
});
