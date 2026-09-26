import { describe, it, expect } from "vitest";
import { trayectoriaItems } from "./trayectoria";

describe("trayectoria items", () => {
  it("contains 10 items in chronological order", () => {
    expect(trayectoriaItems).toHaveLength(10);
    expect(trayectoriaItems.map((i) => i.id)).toEqual([
      "alsea",
      "dam",
      "leasba",
      "master",
      "pez_tomillo",
      "udon",
      "ibm_ai",
      "mas",
      "big_school",
      "creators",
    ]);
  });

  it("uses milestone variant for short items and experience for long ones", () => {
    const milestoneIds = trayectoriaItems.filter((i) => i.variant === "milestone").map((i) => i.id);
    const experienceIds = trayectoriaItems.filter((i) => i.variant === "experience").map((i) => i.id);
    expect(milestoneIds.sort()).toEqual(["alsea", "big_school", "ibm_ai", "pez_tomillo", "udon"]);
    expect(experienceIds.sort()).toEqual(["creators", "dam", "leasba", "mas", "master"]);
  });

  it("experience items have at most 3 bullets and use i18n keys", () => {
    const experienceItems = trayectoriaItems.filter((i) => i.variant === "experience");
    experienceItems.forEach((item) => {
      expect(item.bulletKeys).toBeDefined();
      expect(item.bulletKeys!.length).toBeGreaterThan(0);
      expect(item.bulletKeys!.length).toBeLessThanOrEqual(3);
      item.bulletKeys!.forEach((k) => expect(k).toMatch(/^trayectoria\.item_.+_bullet_\d$/));
    });
  });

  it("all dates are valid YYYY-MM strings", () => {
    trayectoriaItems.forEach((item) => {
      expect(item.startDate).toMatch(/^\d{4}-\d{2}$/);
      if (item.endDate !== "present") {
        expect(item.endDate).toMatch(/^\d{4}-\d{2}$/);
      }
    });
  });
});
