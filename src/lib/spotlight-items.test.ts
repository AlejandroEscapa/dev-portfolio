import { describe, it, expect } from "vitest";
import { getSpotlightItems } from "./spotlight-items";

describe("spotlight items", () => {
  it("includes all sections", () => {
    const items = getSpotlightItems({ setTheme: () => {} });
    const ids = items.map((i) => i.id);
    ["section-hero", "section-about", "section-projects", "section-contact", "theme-catppuccin"].forEach((id) => expect(ids).toContain(id));
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
