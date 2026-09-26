import { describe, it, expect } from "vitest";
import { getSpotlightItems } from "./spotlight-items";

describe("spotlight items", () => {
  it("includes all sections", () => {
    const items = getSpotlightItems({ setTheme: () => {} });
    const ids = items.map((i) => i.id);
    ["section-hero", "section-about", "section-projects", "section-contact", "theme-catppuccin"].forEach((id) => expect(ids).toContain(id));
  });

  it("targets only real DOM section ids", () => {
    // A key that is not a real element id makes the action a silent no-op.
    const items = getSpotlightItems({ setTheme: () => {} });
    const sectionKeys = items
      .filter((i) => i.group === "Sections")
      .map((i) => i.id.replace("section-", ""));
    expect(sectionKeys).toEqual([
      "hero", "about", "profile", "projects", "trayectoria", "education", "contact",
    ]);
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
