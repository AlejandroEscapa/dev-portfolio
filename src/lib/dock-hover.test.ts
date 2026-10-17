import { describe, it, expect } from "vitest";
import { nearestIndex, magnifyScale } from "./dock-hover";

describe("nearestIndex", () => {
  const centers = [100, 160, 220];

  it("devuelve el índice del centro más cercano al puntero", () => {
    expect(nearestIndex(centers, 90)).toBe(0);
    expect(nearestIndex(centers, 165)).toBe(1);
    expect(nearestIndex(centers, 999)).toBe(2);
  });

  it("devuelve null sin items", () => {
    expect(nearestIndex([], 10)).toBeNull();
  });
});

describe("magnifyScale", () => {
  it("es 0 sin hover y decrece con la distancia", () => {
    expect(magnifyScale(3, null)).toBe(0);
    expect(magnifyScale(3, 3)).toBe(1);
    expect(magnifyScale(4, 3)).toBeCloseTo(1 - 26 / 56, 5);
    expect(magnifyScale(9, 3)).toBe(0);
  });
});
