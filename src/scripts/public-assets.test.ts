// Guardia de assets: todo recurso público referenciado desde la app debe
// existir en public/. Nace del 404 silencioso de cv.pdf (Fase 0, purrias).
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../public");
// Las rutas públicas se escriben con "/" inicial; en disco no.
const toPublicPath = (src: string) => join(PUBLIC_DIR, src.replace(/^\//, ""));

const FIXED = [
  "/cv.pdf",
  "/og.png",
  "/logo1.svg",
  "/robots.txt",
  "/pexels-640.webp",
  "/pexels-1280.webp",
  "/pexels-1920.webp",
  "/pexels-2560.webp",
  "/3d/zoro-fanko-pop-draco.glb",
];

describe("guardia de assets públicos", () => {
  it("todo asset referenciado existe en public/", () => {
    const media = projects.map((p) => p.media.src);
    const missing = [...FIXED, ...media].filter((src) => !existsSync(toPublicPath(src)));
    expect(missing).toEqual([]);
  });
});
