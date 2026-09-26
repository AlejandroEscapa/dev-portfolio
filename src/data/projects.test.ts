import { describe, it, expect } from "vitest";
import { projects, projectCategories, type Project, type ProjectCategoryId } from "./projects";

describe("projects data", () => {
  it("exports a non-empty list of projects", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("every project has a unique id", () => {
    const ids = projects.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every project has at least one category", () => {
    for (const p of projects) {
      expect(p.categories.length).toBeGreaterThan(0);
    }
  });

  it("every project has at least one tech tag", () => {
    for (const p of projects) {
      expect(p.techTags.length).toBeGreaterThan(0);
    }
  });

  it("every category in projects is a known category", () => {
    const known = new Set<ProjectCategoryId>(projectCategories.map((c) => c.id));
    for (const p of projects) {
      for (const cat of p.categories) {
        expect(known.has(cat)).toBe(true);
      }
    }
  });

  it("every project with a liveUrl uses https", () => {
    for (const p of projects) {
      if (p.liveUrl) expect(p.liveUrl.startsWith("https://")).toBe(true);
    }
  });

  it("every githubUrl points to github.com", () => {
    for (const p of projects) {
      expect(p.githubUrl.startsWith("https://github.com/")).toBe(true);
    }
  });

  it("image media has a non-empty alt", () => {
    for (const p of projects) {
      if (p.media.type === "image") {
        expect(p.media.alt.length).toBeGreaterThan(0);
      }
    }
  });

  it("video media has a non-empty src", () => {
    for (const p of projects) {
      if (p.media.type === "video") {
        expect(p.media.src.length).toBeGreaterThan(0);
      }
    }
  });

  it("filtering by a known category returns only matching projects", () => {
    const mobileProjects = projects.filter((p: Project) => p.categories.includes("mobile"));
    for (const p of mobileProjects) {
      expect(p.categories).toContain("mobile");
    }
  });
});
