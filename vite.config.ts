import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { spawnSync } from "node:child_process";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * watch-tokens Vite plugin: rebuilds src/styles/generated/* whenever a
 * JSON token source under src/styles/tokens/** changes during `vite dev`.
 * `build` and `build:dev` rely on the `prebuild` npm script (see
 * package.json) which runs build-tokens.mjs synchronously.
 */
function watchTokensPlugin() {
  return {
    name: "watch-tokens",
    apply: "serve",
    buildStart() {
      const out = spawnSync("node", ["scripts/build-tokens.mjs"], {
        stdio: "inherit",
        cwd: path.resolve(__dirname),
      });
      if (out.status !== 0) this.error("build-tokens.mjs failed at dev startup");
    },
    configureServer(server: any) {
      server.watcher.add("src/styles/tokens/**/*.json");
      const run = (file: string) => {
        if (!file.includes("tokens")) return;
        server.config.logger.info(
          `[tokens] ${path.relative(process.cwd(), file)} changed -> regenerating`,
        );
        const out = spawnSync("node", ["scripts/build-tokens.mjs"], { stdio: "inherit" });
        if (out.status !== 0) {
          server.config.logger.error("[tokens] regeneration failed");
        } else {
          server.moduleGraph.invalidateAll(); // force HMR pick-up of generated CSS
        }
      };
      server.watcher.on("change", run);
      server.watcher.on("add", run);
      server.watcher.on("unlink", run);
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    tailwindcss(),
    watchTokensPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
