import { describe, expect, it } from "vitest";
import { certifications } from "./certifications";
import { translations } from "../i18n/translations";

describe("certifications", () => {
  it("contains 3 entries with the pinned ids", () => {
    expect(certifications).toHaveLength(3);
    expect(certifications.map((c) => c.id)).toEqual(["elev8", "big_school", "ibm"]);
    const ids = certifications.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links to LinkedIn and carries a UUID credential when it exists", () => {
    certifications.forEach((c) => {
      expect(c.url).toMatch(/^https:\/\/www\.linkedin\.com\//);
      expect(c.date).toBeTruthy();
      if (c.credentialId) {
        expect(c.credentialId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      }
    });
    // elev8 e ibm llevan credential verificable; big_school no
    expect(certifications.find((c) => c.id === "elev8")?.credentialId).toBeTruthy();
    expect(certifications.find((c) => c.id === "ibm")?.credentialId).toBeTruthy();
    expect(certifications.find((c) => c.id === "big_school")?.credentialId).toBeUndefined();
  });

  it("every referenced i18n key exists in both es and en, without long dashes", () => {
    certifications.forEach((c) => {
      for (const lang of ["es", "en"] as const) {
        const resolved = translations[lang][c.titleKey];
        expect(resolved).toBeTruthy();
        expect(resolved).not.toMatch(/[—–]/);
      }
    });
  });

  it("only elev8 declares validUntil", () => {
    expect(certifications.find((c) => c.id === "elev8")?.validUntil).toBe("2030");
    certifications.filter((c) => c.id !== "elev8").forEach((c) => {
      expect(c.validUntil).toBeUndefined();
    });
  });
});
