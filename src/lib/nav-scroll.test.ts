import { describe, it, expect } from "vitest";
import { resolveActiveSection, isNavVisible } from "./nav-scroll";

const anchors = [
  { id: "projects", center: 3000 },
  { id: "trayectoria", center: 9000 },
  { id: "contact", center: 14000 },
];

describe("resolveActiveSection", () => {
  it("elige el anchor cuyo centro queda más cerca del centro del viewport", () => {
    expect(resolveActiveSection(anchors, 100)).toBe("projects");
    expect(resolveActiveSection(anchors, 8800)).toBe("trayectoria");
    expect(resolveActiveSection(anchors, 99999)).toBe("contact");
  });

  it("cae al fallback sin anchors medidos", () => {
    expect(resolveActiveSection([], 500)).toBe("hero");
    expect(resolveActiveSection([], 500, "projects")).toBe("projects");
  });
});

describe("isNavVisible", () => {
  it("solo es visible a partir del umbral", () => {
    expect(isNavVisible(99, 100)).toBe(false);
    expect(isNavVisible(100, 100)).toBe(true);
    expect(isNavVisible(101, 100)).toBe(true);
  });
});
