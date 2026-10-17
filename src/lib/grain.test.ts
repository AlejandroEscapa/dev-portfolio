import { describe, it, expect } from "vitest";
import { fillGrainBuffer, grainIntervalMs } from "./grain";

describe("fillGrainBuffer", () => {
  it("pinta gris uniforme con el alpha pedido, píxel a píxel", () => {
    const buf = new Uint8ClampedArray(12); // 3 píxeles RGBA
    let n = 0;
    fillGrainBuffer(buf, 8, () => (n++ === 0 ? 0.5 : 0));

    expect(Array.from(buf.slice(0, 4))).toEqual([128, 128, 128, 8]);
    expect(Array.from(buf.slice(4, 8))).toEqual([0, 0, 0, 8]);
    expect(Array.from(buf.slice(8, 12))).toEqual([0, 0, 0, 8]);
  });
});

describe("grainIntervalMs", () => {
  it("traduce frames de referencia (60 fps) a milisegundos", () => {
    expect(grainIntervalMs(6)).toBe(100);
    expect(grainIntervalMs(2)).toBeCloseTo(1000 / 30, 5);
  });
});
