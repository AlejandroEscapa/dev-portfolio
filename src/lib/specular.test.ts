import { describe, it, expect } from "vitest";
import { localPointer } from "./specular";

describe("localPointer", () => {
  it("resta el origen de la tarjeta al puntero", () => {
    expect(localPointer(340, 220, { left: 40, top: 20 })).toEqual({ x: 300, y: 200 });
  });

  it("acepta coordenadas negativas (puntero fuera de la tarjeta)", () => {
    expect(localPointer(10, 10, { left: 40, top: 20 })).toEqual({ x: -30, y: -10 });
  });
});
