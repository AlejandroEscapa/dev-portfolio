import { describe, expect, it } from "vitest";
import { statBar, stats } from "./stats";
import { translations } from "../i18n/translations";

describe("stats", () => {
  it("contains 5 rows with the pinned ids in order", () => {
    expect(stats).toHaveLength(5);
    expect(stats.map((s) => s.id)).toEqual([
      "frontend",
      "backend",
      "mobile",
      "erp_legacy",
      "ai_tooling",
    ]);
    const ids = stats.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps values within 0..max with max 16", () => {
    stats.forEach((s) => {
      expect(s.max).toBe(16);
      expect(s.value).toBeGreaterThanOrEqual(0);
      expect(s.value).toBeLessThanOrEqual(s.max);
    });
  });

  it("every referenced i18n key exists in both es and en, without long dashes", () => {
    stats.forEach((s) => {
      for (const lang of ["es", "en"] as const) {
        const resolved = translations[lang][s.captionKey];
        expect(resolved).toBeTruthy();
        expect(resolved).not.toMatch(/[—–]/);
      }
    });
  });

  it("statBar renders ASCII bars with filled and empty glyphs", () => {
    expect(statBar(13, 16)).toBe("█".repeat(13) + "░".repeat(3));
    expect(statBar(0, 16)).toBe("░".repeat(16));
    expect(statBar(16, 16)).toBe("█".repeat(16));
    expect(statBar(13, 16).length).toBe(16);
  });
});
