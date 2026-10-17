/**
 * Geometría del rail del dock, fuera del componente para poder medirla sin
 * DOM. El rail es vertical: los "centros" son coordenadas Y de la ventana.
 *
 * Antes cada `mousemove` hacía `querySelectorAll` + 8
 * `getBoundingClientRect()` + un `setState` (auditoría 2026-10-17): ahora los
 * centros se cachean por gesto y el cálculo corre una vez por frame.
 */

/** Radio del campo de magnificación en px. */
export const DOCK_MAGNIFY_RADIUS = 56;
/** Caída de escala por item de distancia. */
export const DOCK_MAGNIFY_STEP = 26;

/** Índice del item cuyo centro está más cerca del puntero (`null` sin items). */
export function nearestIndex(centers: readonly number[], pointer: number): number | null {
  if (centers.length === 0) return null;

  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < centers.length; i++) {
    const distance = Math.abs(centers[i] - pointer);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return bestIndex;
}

/** Escala de magnificación de un item según el índice con hover. */
export function magnifyScale(
  index: number,
  hovered: number | null,
  radius = DOCK_MAGNIFY_RADIUS,
  step = DOCK_MAGNIFY_STEP,
): number {
  if (hovered === null) return 0;
  return 1 - Math.min(radius, Math.abs(index - hovered) * step) / radius;
}
