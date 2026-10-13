import { describe, expect, it } from "vitest";
import { sidequests } from "./sidequests";
import { translations } from "../i18n/translations";

const ICON_SET = new Set(["Disc3", "AudioWaveform", "Gamepad2"]);

describe("sidequests", () => {
  it("contains 3 entries with the pinned ids", () => {
    expect(sidequests).toHaveLength(3);
    expect(sidequests.map((s) => s.id)).toEqual(["dj", "voz", "gaming"]);
    const ids = sidequests.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses icons from the closed Lucide set and has both copy keys", () => {
    sidequests.forEach((s) => {
      expect(ICON_SET.has(s.icon)).toBe(true);
      expect(s.title).toBeTruthy();
      expect(s.bodyKey).toBeTruthy();
      expect(s.transferKey).toBeTruthy();
    });
  });

  it("every referenced i18n key exists in both es and en, without long dashes", () => {
    sidequests.forEach((s) => {
      const keys = [s.title, s.bodyKey, s.transferKey];
      keys.forEach((k) => {
        for (const lang of ["es", "en"] as const) {
          const resolved = translations[lang][k];
          expect(resolved).toBeTruthy();
          expect(resolved).not.toMatch(/[—–]/);
        }
      });
    });
  });
});
