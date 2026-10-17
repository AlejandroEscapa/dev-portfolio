/**
 * Vitest unit test for scripts/bundle-budget.mjs (la política, sin ficheros).
 *
 * Comprueba que el presupuesto pasa cuando todo entra, que falla nombrando el
 * desvío en bytes y que los ficheros sin regla no cuentan.
 */
import { describe, it, expect } from "vitest";
import { evaluateBudget } from "../../scripts/bundle-budget.mjs";

describe("evaluateBudget", () => {
  const budgets = [{ pattern: "index-", maxGzipBytes: 1000 }];

  it("pasa cuando todo entra en presupuesto", () => {
    const r = evaluateBudget([{ path: "assets/index-abc.js", gzipBytes: 900 }], budgets);
    expect(r.failures).toEqual([]);
    expect(r.report[0]).toContain("index-abc.js");
  });

  it("falla con el desvío en bytes", () => {
    const r = evaluateBudget([{ path: "assets/index-abc.js", gzipBytes: 1300 }], budgets);
    expect(r.failures).toHaveLength(1);
    expect(r.failures[0]).toContain("index-abc.js");
    expect(r.failures[0]).toContain("(+300B)");
  });

  it("ignora los ficheros sin presupuesto", () => {
    const r = evaluateBudget(
      [{ path: "assets/other.js", gzipBytes: 99999 }],
      budgets,
    );
    expect(r.failures).toEqual([]);
  });
});
