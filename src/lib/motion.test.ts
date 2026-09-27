import { describe, it, expect } from "vitest";
import {
  DURATION_FAST,
  DURATION_BASE,
  DURATION_SLOW,
  EASE_OUT_EXPO,
  fadeUp,
  fadeUpSm,
  stagger,
} from "./motion";

describe("motion tokens", () => {
  it("converts pipeline ms durations to framer seconds", () => {
    expect(DURATION_FAST).toBe(0.2);
    expect(DURATION_BASE).toBe(0.5);
    expect(DURATION_SLOW).toBe(0.7);
  });

  it("parses the easing token into a framer cubic-bezier array", () => {
    expect(EASE_OUT_EXPO).toEqual([0.22, 1, 0.36, 1]);
  });
});

describe("shared reveal variants", () => {
  it("fadeUp rises 40px with the slow duration", () => {
    expect(fadeUp.hidden).toEqual({ opacity: 0, y: 40 });
    expect(fadeUp.show).toMatchObject({
      opacity: 1,
      y: 0,
      transition: { duration: DURATION_SLOW, ease: EASE_OUT_EXPO },
    });
  });

  it("fadeUpSm is the lighter label step", () => {
    expect(fadeUpSm.hidden).toEqual({ opacity: 0, y: 24 });
    expect(fadeUpSm.show).toMatchObject({
      transition: { duration: DURATION_BASE, ease: EASE_OUT_EXPO },
    });
  });

  it("stagger orchestrates children on the same hidden/show keys", () => {
    const container = stagger(0.09, 0.1);
    expect(container.show).toEqual({ transition: { staggerChildren: 0.09, delayChildren: 0.1 } });
    expect(stagger().show).toEqual({ transition: { staggerChildren: 0.08, delayChildren: 0 } });
  });
});
