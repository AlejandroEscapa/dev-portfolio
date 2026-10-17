// scripts/check-bundle-budget.mjs
//
// CLI: lee dist/assets/*, comprime cada fichero con zlib y aplica el
// presupuesto de scripts/bundle-budget.mjs. Sale con código 1 si algo se pasa.
//
// Uso:  npm run build && npm run perf:budget
// No está enganchado a `build` a propósito: un presupuesto que rompe el deploy
// de Vercel es peor que un presupuesto que se consulta.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BUDGETS, evaluateBudget } from "./bundle-budget.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = path.join(root, "dist", "assets");

let entries = [];
try {
  entries = readdirSync(assetsDir)
    .filter((name) => /\.(js|css)$/.test(name))
    .map((name) => {
      const file = path.join(assetsDir, name);
      const bytes = statSync(file).size;
      const gzipBytes = gzipSync(readFileSync(file)).length;
      return { path: `assets/${name}`, bytes, gzipBytes };
    })
    .sort((a, b) => b.gzipBytes - a.gzipBytes);
} catch {
  console.error("[perf:budget] no hay dist/assets — ejecuta `npm run build` antes");
  process.exit(1);
}

const { failures, report } = evaluateBudget(entries, BUDGETS);

console.log("[perf:budget] presupuesto de bundle (gzip)");
for (const line of report) console.log(`  ${line}`);

if (failures.length > 0) {
  console.error("\n[perf:budget] FUERA DE PRESUPUESTO:");
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}

console.log("\n[perf:budget] OK — todo dentro de presupuesto");
