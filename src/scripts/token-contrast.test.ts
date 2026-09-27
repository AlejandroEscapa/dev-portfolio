/**
 * Vitest regression test for the accessibility contract of the token set.
 *
 * Reads the REAL token sources through the same loader the build uses, reduces
 * them with the same core model, and asserts WCAG AA (4.5:1) for
 * `muted-foreground` against both surfaces it is rendered on:
 *   - `background` (page)
 *   - `card`       (panels/windows -- the stricter of the two in every theme)
 *
 * Why this exists: muted text is the most common secondary copy in the app
 * (~59 usages) and three of the four themes shipped it below AA on `card`
 * (catppuccin 4.37, dracula 4.00, tokyo-night 4.38). A future palette tweak
 * must not silently reintroduce that.
 *
 * The formula is validated against published reference pairs first, so a
 * broken implementation cannot make the AA assertions pass by accident.
 */

import { describe, it, expect } from "vitest";
import { buildTokenModel, hslContrast } from "../../scripts/tokens-core.mjs";
import { loadTokenSources } from "../../scripts/tokens-sources.mjs";

const MIN_AA = 4.5;
const RAW_HSL_TRIPLE = /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/;

const loadModel = async () => buildTokenModel({ sources: await loadTokenSources() });

describe("token contrast", () => {
  it("sanity: contrast math matches published reference pairs", () => {
    // White on black is the maximum ratio by definition.
    expect(hslContrast("0 0% 100%", "0 0% 0%")).toBeCloseTo(21, 1);
    // #767676 on #ffffff is the canonical "just passes AA" grey (4.54:1).
    expect(hslContrast("0 0% 46.3%", "0 0% 100%")).toBeCloseTo(4.54, 1);
    // #949494 on #ffffff (3.03:1) is the canonical "fails AA, passes AA-large".
    expect(hslContrast("0 0% 58%", "0 0% 100%")).toBeCloseTo(3.03, 1);
  });

  it("muted-foreground is >= 4.5:1 on background and card for every theme", async () => {
    const { themes } = await loadModel();
    const names = Object.keys(themes);

    expect(names).toEqual(["indigo", "catppuccin", "dracula", "tokyo-night"]);

    const failures: string[] = [];
    for (const name of names) {
      const muted = themes[name]["muted-foreground"];
      for (const surface of ["background", "card"]) {
        const surfaceValue = themes[name][surface];
        const ratio = hslContrast(muted, surfaceValue);
        if (ratio < MIN_AA) {
          failures.push(
            `${name}: muted-foreground "${muted}" on ${surface} "${surfaceValue}" = ${ratio.toFixed(2)}:1 (needs >= ${MIN_AA})`,
          );
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it("the surfaces used for the AA check are raw HSL triples, not wrapped colors", async () => {
    // Guards the test itself: if a surface ever becomes `hsl(var(--x))` the
    // contrast check must resolve it differently instead of throwing.
    const { themes } = await loadModel();
    for (const name of Object.keys(themes)) {
      for (const key of ["background", "card", "muted-foreground"]) {
        expect(themes[name][key], `${name}.${key}`).toMatch(RAW_HSL_TRIPLE);
      }
    }
  });
});
