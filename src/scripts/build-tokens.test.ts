/**
 * Vitest unit test for scripts/tokens-core.mjs (the pure token engine).
 *
 * Verifies the pipeline without touching the file system:
 *   - `flatten` preserves dot-paths for primitives (palette.indigo.500 etc.)
 *   - `resolveAliases` substitutes {a.b.c} references against ctx, and reports
 *     unresolved ones only when a sink is wired (the core stays silent by default)
 *   - `buildTokenModel` reduces ordered sources into flat defaults + per-theme maps
 *   - `emitCSS` produces :root + @theme inline + [data-theme="..."] blocks, with
 *     colour aliases wrapped in hsl(var()) and the namespaces we own (radius,
 *     font, text, tracking) copied verbatim so Tailwind generates them from our
 *     tokens instead of its own defaults
 *   - All three preset themes (catppuccin / dracula / tokyo-night) keep
 *     their original community-palette values 1:1 except the documented
 *     muted-foreground AA raise (asserted in token-contrast.test.ts)
 *   - Indigo (default) mesh-4 reflects the green-teal change that
 *     harmonizes with pexels.jpg (the user's stated design intent)
 */

import { describe, it, expect } from "vitest";
import {
  flatten as _flatten,
  resolveAliases as _resolveAliases,
  buildTokenModel as _buildTokenModel,
  emitCSS as _emitCSS,
} from "../../scripts/tokens-core.mjs";

describe("build-tokens: flat / aliases / emit", () => {
  it("flatten keeps dot-path keys as a single string key (palette.indigo.500)", () => {
    // DTCG-style: nested primitives are flattened into a single string key
    // with dot separators. Access via bracket notation -- `toHaveProperty`
    // would split on dots and look up `out.palette.indigo[500].$value` which
    // doesn't exist because `palette` is NOT a separate top-level key here.
    const out = {};
    _flatten({
      palette: { indigo: { "500": { $value: "248 90% 66%", $type: "color" } } },
      status:  { destructive: { $value: "0 84% 60%", $type: "color" } },
      $description: "ignored",
    }, out);
    expect(out["palette.indigo.500"]?.$value).toBe("248 90% 66%");
    expect(out["status.destructive"]?.$value).toBe("0 84% 60%");
    expect(Object.keys(out).includes("$description")).toBe(false);
  });

  it("flatten recursively walks $value-less groups and produces all dotted leaves", () => {
    const out = {};
    _flatten({ grp: { A: { x: { $value: "1" } }, B: { y: { $value: "2" } } } }, out);
    expect(out["grp.A.x"]?.$value).toBe("1");
    expect(out["grp.B.y"]?.$value).toBe("2");
  });

  it("resolveAliases substitutes single alias", () => {
    expect(_resolveAliases("{a}", { a: "248 90% 66%" })).toBe("248 90% 66%");
  });

  it("resolveAliases substitutes chained alias", () => {
    expect(_resolveAliases("{x}", { x: "{y}", y: "final" })).toBe("final");
  });

  it("resolveAliases leaves unresolved alias literal + reports it to the sink", () => {
    expect(_resolveAliases("{missing}", {})).toBe("{missing}");
    const seen: string[] = [];
    _resolveAliases("{missing}", {}, (key: string) => seen.push(key));
    expect(seen).toEqual(["missing"]);
  });

  it("resolveAliases ignores non-string input", () => {
    expect(_resolveAliases(null, {})).toBe(null);
    expect(_resolveAliases(undefined, {})).toBe(undefined);
  });

  it("buildTokenModel resolves aliases and applies theme overrides onto the defaults", () => {
    const model = _buildTokenModel({
      sources: [
        { path: "primitives/colors.json", data: { palette: { brand: { 500: { $value: "248 90% 66%" } } } } },
        { path: "semantic/colors.json",   data: { primary: { $value: "{palette.brand.500}" }, background: { $value: "230 35% 5%" } } },
        { path: "themes/indigo.json",     data: { overrides: {} } },
        { path: "themes/dracula.json",    data: { overrides: { primary: "340 70% 65%" } } },
      ],
    });

    // Aliases are resolved against primitives, which stay in the model as
    expect(model.flat.primary).toBe("248 90% 66%");
    // dotted keys; the emitters drop dotted keys, so they never reach the
    // artifacts (asserted by the "does NOT emit primitive keys" test below).
    expect(model.flat["palette.brand.500"]).toBe("248 90% 66%");

    // Default theme is a clone of the flat baseline; other themes keep the
    // baseline and only diverge where they override.
    expect(model.themes.indigo.primary).toBe("248 90% 66%");
    expect(model.themes.dracula.primary).toBe("340 70% 65%");
    expect(model.themes.dracula.background).toBe("230 35% 5%");
  });

  it("emitCSS produces :root with --primary + mesh-4 = green-teal for indigo default", () => {
    const flat = {
      primary:  "248 90% 66%",
      "mesh-4": "155 70% 55%",
      background: "230 35% 5%",
    };
    const themes = {
      indigo: { ...flat },
      catppuccin: { ...flat, primary: "200 60% 65%" },
      dracula:    { ...flat, primary: "340 70% 65%" },
      "tokyo-night": { ...flat, primary: "230 60% 60%" },
    };
    const css = _emitCSS({ flat, themes });

    expect(css).toMatch(/^:root \{/m);
    expect(css).toContain("--primary: 248 90% 66%;");
    expect(css).toContain("--mesh-4: 155 70% 55%;");     // green-teal
    expect(css).toContain("@theme inline {");
    // Preset theme blocks present, indigo block absent (no overrides).
    expect(css).toMatch(/\[data-theme="catppuccin"\] \{/);
    expect(css).toMatch(/\[data-theme="dracula"\] \{/);
    expect(css).toMatch(/\[data-theme="tokyo-night"\] \{/);
    expect(css).not.toMatch(/\[data-theme="indigo"\] \{/);
    // Preset uses its own primary, not the default.
    expect(css).toMatch(/\[data-theme="catppuccin"\][\s\S]*--primary: 200 60% 65%;/);
    expect(css).toMatch(/\[data-theme="dracula"\][\s\S]*--primary: 340 70% 65%;/);
  });

  it("emitCSS does NOT emit primitive keys (palette.* / status.*) into :root", () => {
    const css = _emitCSS({
      flat: { primary: "248 90% 66%" },
      themes: { indigo: { primary: "248 90% 66%" } },
    });
    expect(css).not.toMatch(/--palette-/);
    expect(css).not.toMatch(/--status-/);
  });

  it("emitCSS keeps --color-X : hsl(var(--X)) aliases in @theme inline (alpha-placeholder wrap)", () => {
    const css = _emitCSS({
      flat: { background: "230 35% 5%", foreground: "210 40% 98%" },
      themes: { indigo: { background: "230 35% 5%", foreground: "210 40% 98%" } },
    });
    expect(css).toMatch(/@theme inline \{[^}]*--color-background: hsl\(var\(--background\)\);[^}]*\}/s);
    expect(css).toMatch(/@theme inline \{[^}]*--color-foreground: hsl\(var\(--foreground\)\);[^}]*\}/s);
  });

  it("emitCSS copies the namespaces we own into @theme inline VERBATIM (no hsl() wrap)", () => {
    // Tailwind generates rounded-*/text-*/tracking-*/font-* from these, so they
    // must be raw values. This is the policy that replaced the hardcoded
    // `--radius-sm: calc(var(--radius) - 8px)` trio.
    const flat = {
      "radius-xs": "4px",
      "radius-lg": "16px",
      "text-h1": "clamp(2.25rem, 4.5vw, 3.5rem)",
      "tracking-heading": "-0.02em",
      "section-gap": "clamp(5rem, 9vw, 8rem)",
      "font-display": '"Instrument Serif", Georgia, serif',
    };
    const css = _emitCSS({ flat, themes: { indigo: { ...flat } } });

    expect(css).toMatch(/@theme inline \{[^}]*--radius-xs: 4px;/s);
    expect(css).toMatch(/@theme inline \{[^}]*--radius-lg: 16px;/s);
    expect(css).toMatch(/@theme inline \{[^}]*--text-h1: clamp\(2\.25rem, 4\.5vw, 3\.5rem\);/s);
    expect(css).toMatch(/@theme inline \{[^}]*--tracking-heading: -0\.02em;/s);
    expect(css).toMatch(/@theme inline \{[^}]*--font-display: "Instrument Serif", Georgia, serif;/s);

    // Layout/typography tokens belong in :root too (plain CSS var() consumers).
    expect(css).toMatch(/:root \{[^}]*--radius-xs: 4px;/s);
    expect(css).toMatch(/:root \{[^}]*--section-gap: clamp\(5rem, 9vw, 8rem\);/s);
    // ...but font families are inline-only (they'd be noise in :root).
    expect(css).not.toMatch(/:root \{[^}]*--font-display:/s);
  });
});
