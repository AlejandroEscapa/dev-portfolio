/**
 * Grano de película: relleno del buffer RGBA y cadencia de refresco.
 *
 * El trabajo caro (1 048 576 píxeles con `Math.random()`) se paga UNA vez por
 * frame pre-renderizado; el bucle de animación solo intercambia frames. Antes
 * esto se regeneraba en cada refresco: 12,7 ms de CPU y 4,19 MB de basura cada
 * ~100 ms, medido en la auditoría de rendimiento de 2026-10-17.
 */

/** Rellena un buffer RGBA con grano gris uniforme y el alpha pedido. */
export function fillGrainBuffer(
  data: Uint8ClampedArray,
  alpha: number,
  rand: () => number = Math.random,
): void {
  for (let i = 0; i < data.length; i += 4) {
    const value = rand() * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = alpha;
  }
}

/** `refreshInterval` se mide en frames de 60 fps, como hasta ahora. */
export function grainIntervalMs(refreshInterval: number, referenceFps = 60): number {
  return (refreshInterval / referenceFps) * 1000;
}
