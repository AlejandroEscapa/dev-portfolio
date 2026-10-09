/**
 * Single owner of the boot flag.
 *
 * The choreography that follows the boot sequence (hero title + CTAs today)
 * needs two things the hook alone could not give:
 *  - a SYNCHRONOUS read, because a returning visitor renders its first frame
 *    with `portfolio-booted=1` already stored and no event will ever fire to
 *    un-hide that content (the review focus of the Next Level plan);
 *  - a window event, so consumers mounted before the sequence finishes can
 *    react without polling.
 */
const BOOTED_KEY = "portfolio-booted";

export const BOOTED_EVENT = "portfolio:booted";

/** Synchronous on purpose: first render of a returning visitor is booted. */
export function isBooted(): boolean {
  return localStorage.getItem(BOOTED_KEY) === "1";
}

/** Marks the boot as done and notifies every waiting choreography. */
export function markBooted(): void {
  localStorage.setItem(BOOTED_KEY, "1");
  window.dispatchEvent(new CustomEvent(BOOTED_EVENT));
}
