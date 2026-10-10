/**
 * Geometría del magnetismo de CTAs (`src/components/fx/Magnetic.tsx`).
 *
 * Vive fuera del componente a propósito: son funciones puras, se testean sin
 * montar nada, y así el fichero del componente solo exporta el componente
 * (la regla react-refresh avisa cuando un .tsx exporta también funciones).
 */

/** Fracción del desplazamiento del puntero que sigue el contenido. */
export const MAGNET_STRENGTH = 0.25;
/** Margen exterior (px) en el que el campo empieza a tirar. */
export const MAGNET_RADIUS = 24;

export interface MagneticOffset {
  dx: number;
  dy: number;
}

/** Desplazamiento del contenido, recortado al radio del campo. */
export function magneticOffset(
  pointer: { x: number; y: number },
  center: { x: number; y: number },
  radius = MAGNET_RADIUS,
  strength = MAGNET_STRENGTH,
): MagneticOffset {
  const clamp = (value: number) => Math.max(-radius, Math.min(radius, value));
  return {
    dx: clamp(pointer.x - center.x) * strength,
    dy: clamp(pointer.y - center.y) * strength,
  };
}

/**
 * Distancia del puntero a la caja (0 si está dentro), comparada con el radio.
 * Se mide contra la caja y no contra el centro: así el campo envuelve la forma
 * del botón en lugar de ser una esfera que la ignora.
 */
export function isWithinMagnet(
  pointer: { x: number; y: number },
  rect: DOMRect,
  radius = MAGNET_RADIUS,
): boolean {
  const dx = Math.max(rect.left - pointer.x, 0, pointer.x - (rect.left + rect.width));
  const dy = Math.max(rect.top - pointer.y, 0, pointer.y - (rect.top + rect.height));
  return Math.hypot(dx, dy) <= radius;
}
