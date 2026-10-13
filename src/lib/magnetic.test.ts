import { describe, expect, it } from "vitest";
import { isWithinMagnet, magneticOffset } from "./magnetic";

const RECT = { left: 100, top: 200, width: 160, height: 44 } as DOMRect;
const CENTER = { x: 180, y: 222 };

describe("magneticOffset", () => {
  it("desplaza el contenido hacia el puntero en una fracción de la distancia", () => {
    expect(magneticOffset({ x: CENTER.x + 20, y: CENTER.y }, CENTER, 40, 0.25)).toEqual({
      dx: 5,
      dy: 0,
    });
  });

  it("recorta el desplazamiento al radio del campo", () => {
    // 500px de distancia con radio 40 y fuerza 0.25 -> 10, no 125.
    expect(magneticOffset({ x: CENTER.x + 500, y: CENTER.y - 500 }, CENTER, 40, 0.25)).toEqual({
      dx: 10,
      dy: -10,
    });
  });
});

describe("isWithinMagnet", () => {
  it("cuenta como dentro el propio botón y su margen exterior", () => {
    expect(isWithinMagnet({ x: CENTER.x, y: CENTER.y }, RECT, 24)).toBe(true);
    expect(isWithinMagnet({ x: RECT.left - 10, y: CENTER.y }, RECT, 24)).toBe(true);
  });

  it("queda fuera más allá del radio", () => {
    expect(isWithinMagnet({ x: RECT.left - 60, y: RECT.top - 60 }, RECT, 24)).toBe(false);
  });
});
