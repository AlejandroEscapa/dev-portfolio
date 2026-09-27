import type { Variants } from "framer-motion";
import { TOKENS_DEFAULT } from "@/styles/generated/tokens";

/** The pipeline stores durations as "500ms"; framer-motion wants seconds. */
const durationToSeconds = (ms: string): number => Number.parseFloat(ms) / 1000;

/** The easing token is a CSS cubic-bezier() string; framer wants the 4-number array. */
const parseCubicBezier = (value: string): [number, number, number, number] => {
  const nums = value.match(/-?[\d.]+/g)?.map(Number) ?? [];
  if (nums.length !== 4) throw new Error(`ease-out-expo token is not a cubic-bezier: ${value}`);
  return nums as [number, number, number, number];
};

export const DURATION_FAST = durationToSeconds(TOKENS_DEFAULT.durationFast);
export const DURATION_BASE = durationToSeconds(TOKENS_DEFAULT.durationBase);
export const DURATION_SLOW = durationToSeconds(TOKENS_DEFAULT.durationSlow);
export const EASE_OUT_EXPO = parseCubicBezier(TOKENS_DEFAULT.easeOutExpo);

/** Section-header step: the full 40px rise for headlines. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_SLOW, ease: EASE_OUT_EXPO },
  },
};

/** Lighter step for labels, paragraphs and card grids. */
export const fadeUpSm: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_BASE, ease: EASE_OUT_EXPO },
  },
};

/** Parent container: one whileInView on the wrapper, children cascade. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});
