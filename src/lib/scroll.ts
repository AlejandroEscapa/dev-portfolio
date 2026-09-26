import { getLenis } from "@/hooks/useLenis";
import { ScrollTrigger } from "@/lib/gsap";

const NAV_HEIGHT = 60;
const SCROLL_MARGIN = 8;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Single entry point for programmatic section navigation (Nav links,
 * Spotlight). All scrolling must go through the live Lenis instance: native
 * window.scrollTo races Lenis's own smooth animations (its per-frame
 * setScroll cancels the native scroll mid-flight), which made nav links
 * appear to need a second click. Falls back to scrollIntoView when Lenis
 * isn't mounted (tests, SSR).
 */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = getLenis();
  const reduced = prefersReducedMotion();

  // Pinned sections (Trayectoria) are transform-moved by ScrollTrigger while
  // pinned, so their live rect points at the wrong offset — scroll to the
  // pin's start position instead.
  const pin = ScrollTrigger.getAll().find((st) => st.trigger === el && st.pin);
  if (pin) {
    const target = pin.start + 1;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2, immediate: reduced });
    } else {
      window.scrollTo({ top: target, behavior: reduced ? "instant" : "smooth" });
    }
    return;
  }

  // Numeric target: bypasses Lenis's own scroll-margin handling and corrects
  // for the translateY that WindowChrome's whileInView entrance keeps on
  // not-yet-seen windows (it inflates rect.top and makes landings undershoot).
  const transform = getComputedStyle(el).transform;
  const translateY =
    transform && transform !== "none" ? new DOMMatrixReadOnly(transform).m42 : 0;
  const target =
    el.getBoundingClientRect().top + window.scrollY - translateY - (NAV_HEIGHT + SCROLL_MARGIN);

  if (lenis) {
    lenis.scrollTo(target, { duration: 1.2, immediate: reduced });
  } else {
    window.scrollTo({ top: target, behavior: reduced ? "instant" : "smooth" });
  }
}
