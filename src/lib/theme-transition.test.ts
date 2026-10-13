import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveThemeOrigin, startThemeTransition } from "./theme-transition";

/** jsdom no trae viewport propio más allá de estos defaults. */
const VIEWPORT = { w: 1024, h: 768 };
const CENTER = { x: VIEWPORT.w / 2, y: VIEWPORT.h / 2 };

type FakeTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

/** Instala una API de View Transitions falsa; devuelve su espía. */
function stubViewTransition(impl?: () => void) {
  const start = vi.fn((cb: () => void) => {
    cb();
    impl?.();
    const fake: FakeTransition = {
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      skipTransition: vi.fn(),
    };
    return fake;
  });
  Object.defineProperty(document, "startViewTransition", {
    value: start,
    writable: true,
    configurable: true,
  });
  return start;
}

function stubAnimate() {
  const animate = vi.fn();
  Object.defineProperty(document.documentElement, "animate", {
    value: animate,
    writable: true,
    configurable: true,
  });
  return animate;
}

/** jsdom no usa la consulta, solo el booleano: basta con distinguir reduce. */
function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) => ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  );
}

describe("startThemeTransition", () => {
  beforeEach(() => {
    stubMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (document as unknown as Record<string, unknown>).startViewTransition;
    delete (document.documentElement as unknown as Record<string, unknown>).animate;
  });

  it("aplica el cambio de forma síncrona cuando el navegador no tiene la API", () => {
    const apply = vi.fn();

    startThemeTransition(apply);

    expect(apply).toHaveBeenCalledTimes(1);
  });

  it("con la API disponible ejecuta el cambio dentro de la transición y hace el wipe circular", async () => {
    const start = stubViewTransition();
    const animate = stubAnimate();
    const apply = vi.fn();

    startThemeTransition(apply);
    await Promise.resolve();

    expect(start).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(animate).toHaveBeenCalledTimes(1);

    const [frames, options] = animate.mock.calls[0] as [
      { clipPath: [string, string] },
      { duration: number; easing: string; pseudoElement: string },
    ];
    expect(frames.clipPath[0]).toBe(`circle(0px at ${CENTER.x}px ${CENTER.y}px)`);
    // Radio = esquina más lejana: desde el centro de 1024×768 son 640px.
    expect(frames.clipPath[1]).toBe(`circle(640px at ${CENTER.x}px ${CENTER.y}px)`);
    expect(options.pseudoElement).toBe("::view-transition-new(root)");
    expect(options.duration).toBeGreaterThan(0);
    expect(options.easing).toContain("cubic-bezier");
  });

  it("no abre ninguna transición bajo prefers-reduced-motion", () => {
    stubMatchMedia(true);
    const start = stubViewTransition();
    const animate = stubAnimate();
    const apply = vi.fn();

    startThemeTransition(apply);

    expect(start).not.toHaveBeenCalled();
    expect(animate).not.toHaveBeenCalled();
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it("aplica el cambio igual si abrir la transición falla", () => {
    const start = stubViewTransition(() => {
      throw new Error("transition already running");
    });
    stubAnimate();
    const apply = vi.fn();

    expect(() => startThemeTransition(apply)).not.toThrow();
    expect(apply).toHaveBeenCalledTimes(1);
  });
});

describe("resolveThemeOrigin", () => {
  afterEach(() => {
    document.getElementById("app-dock")?.remove();
    vi.restoreAllMocks();
  });

  it("un punto explícito gana a todo lo demás", () => {
    document.body.innerHTML = '<div id="app-dock"></div>';

    expect(resolveThemeOrigin({ x: 10, y: 20 })).toEqual({ x: 10, y: 20 });
  });

  it("sin punto explícito usa el centro del dock", () => {
    const dock = document.createElement("div");
    dock.id = "app-dock";
    dock.getBoundingClientRect = () =>
      ({ left: 12, top: 300, width: 52, height: 200 }) as DOMRect;
    document.body.appendChild(dock);

    expect(resolveThemeOrigin()).toEqual({ x: 38, y: 400 });
  });

  it("un dock sin área (oculto) cae al centro del viewport", () => {
    const dock = document.createElement("div");
    dock.id = "app-dock";
    dock.getBoundingClientRect = () => ({ left: 0, top: 0, width: 0, height: 0 }) as DOMRect;
    document.body.appendChild(dock);

    expect(resolveThemeOrigin()).toEqual(CENTER);
  });

  it("sin dock en el DOM cae al centro del viewport", () => {
    expect(resolveThemeOrigin()).toEqual(CENTER);
  });

  it("acepta un elemento como origen", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () =>
      ({ left: 100, top: 100, width: 40, height: 40 }) as DOMRect;

    expect(resolveThemeOrigin(el)).toEqual({ x: 120, y: 120 });
  });
});
