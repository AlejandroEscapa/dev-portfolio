/**
 * Vitest unit test for scripts/build-tokens.mjs.
 *
 * Verifies the build pipeline without touching the file system:
 *   - `_flatten` preserves dot-paths for primitives (palette.indigo.500 etc.)
 *   - `_resolveAliases` substitutes {a.b.c} references against ctx
 *   - `_emitCSS` produces :root + @theme inline + [data-theme="..."] blocks
 *   - All three preset themes (catppuccin / dracula / tokyo-night) keep
 *     their original community-palette values 1:1
 *   - Indigo (default) mesh-4 reflects the green-teal change that
 *     harmonizes with pexels.jpg (the user's stated design intent)
 */

import { describe, it, expect } from "vitest";
import {
  _flatten,
  _resolveAliases,
  _emitCSS,
} from "../../scripts/build-tokens.mjs";

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

  it("resolveAliases leaves unresolved alias literal + warns", () => {
    const out = _resolveAliases("{missing}", {});
    expect(out).toBe("{missing}");
  });

  it("resolveAliases ignores non-string input", () => {
    expect(_resolveAliases(null, {})).toBe(null);
    expect(_resolveAliases(undefined, {})).toBe(undefined);
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
});
