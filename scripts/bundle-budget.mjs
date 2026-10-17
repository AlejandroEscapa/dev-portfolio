// scripts/bundle-budget.mjs
//
// Política del presupuesto de bundle: pura, sin sistema de ficheros ni
// logging. El CLI (scripts/check-bundle-budget.mjs) lee `dist/assets/*`, lo
// comprime y le pasa las entradas; los tests importan ESTE fichero.
//
// Los topes salen de la auditoría de rendimiento de 2026-10-17 (baseline
// 278,67 KB gzip en el JS principal) y están puestos justo por encima de lo
// medido, no holgados: si una tarea vuelve a inflar el bundle, el comando
// falla y se ve.

/**
 * @typedef {{ pattern: string, maxGzipBytes: number }} Budget
 *   `pattern` se busca con `includes` sobre el nombre del fichero.
 * @typedef {{ path: string, gzipBytes: number }} BundleEntry
 */

/** Presupuestos por artefacto. */
export const BUDGETS = [
  // JS principal (index-*.js): medido 228,8 KB gzip tras T5+T6.
  { pattern: "index-", maxGzipBytes: 240 * 1024 },
  // Chunk del hero 3D (three + drei + postprocessing + GLB): medido 300,2 KB.
  { pattern: "HeroScene-", maxGzipBytes: 320 * 1024 },
  // CSS generado por Tailwind + tokens: medido 26,1 KB gzip.
  { pattern: ".css", maxGzipBytes: 30 * 1024 },
];

/**
 * Aplica los presupuestos a las entradas.
 *
 * @param {BundleEntry[]} entries
 * @param {Budget[]} budgets
 * @returns {{ failures: string[], report: string[] }}
 */
export function evaluateBudget(entries, budgets) {
  const failures = [];
  const report = [];

  for (const entry of entries) {
    const matching = budgets.filter((budget) => entry.path.includes(budget.pattern));
    const kb = (entry.gzipBytes / 1024).toFixed(1);

    if (matching.length === 0) {
      report.push(`${entry.path}: ${kb} KB gzip (sin presupuesto)`);
      continue;
    }

    for (const budget of matching) {
      const excess = entry.gzipBytes - budget.maxGzipBytes;
      if (excess > 0) {
        failures.push(
          `${entry.path} ${entry.gzipBytes}B gzip > ${budget.maxGzipBytes}B (+${excess}B)`,
        );
      }
    }

    const tightest = matching.reduce((a, b) => (a.maxGzipBytes < b.maxGzipBytes ? a : b));
    report.push(
      `${entry.path}: ${kb} KB gzip / ${(tightest.maxGzipBytes / 1024).toFixed(0)} KB ` +
        `(${Math.round((entry.gzipBytes / tightest.maxGzipBytes) * 100)}%)`,
    );
  }

  return { failures, report };
}
