import { describe, it, expect } from "vitest";
import { getSpotlightItems } from "./spotlight-items";

describe("spotlight items", () => {
  it("includes all sections", () => {
    const items = getSpotlightItems({ setTheme: () => {} });
    const ids = items.map((i) => i.id);
    ["section-hero", "section-about", "section-contributions", "section-certifications", "section-sidequests", "section-stats", "section-contact", "theme-catppuccin"].forEach((id) => expect(ids).toContain(id));
  });

  it("targets only real DOM section ids", () => {
    // A key that is not a real element id makes the action a silent no-op.
    const items = getSpotlightItems({ setTheme: () => {} });
    const sectionKeys = items
      .filter((i) => i.group === "Sections")
      .map((i) => i.id.replace("section-", ""));
    expect(sectionKeys).toEqual([
      "hero", "about", "projects", "trayectoria", "contributions", "education",
      "certifications", "sidequests", "stats", "contact",
    ]);
  });

  it("labels the new sections for the palette", () => {
    const items = getSpotlightItems({ setTheme: () => {} });
    const byLabel = Object.fromEntries(items.filter((i) => i.group === "Sections").map((i) => [i.id, i.label]));
    expect(byLabel["section-contributions"]).toBe("Go to impact");
    expect(byLabel["section-certifications"]).toBe("Go to certifications");
    expect(byLabel["section-sidequests"]).toBe("Go to side quests");
    expect(byLabel["section-stats"]).toBe("Go to stats");
  });

  it("exposes theme items per theme id", () => {
    const items = getSpotlightItems({ setTheme: () => {} });
    expect(items.find((i) => i.id === "theme-dracula")).toBeDefined();
  });

  it("includes social links", () => {
    const items = getSpotlightItems({ setTheme: () => {} });
    expect(items.find((i) => i.id === "social-github")).toBeDefined();
    expect(items.find((i) => i.id === "social-linkedin")).toBeDefined();
  });
});
