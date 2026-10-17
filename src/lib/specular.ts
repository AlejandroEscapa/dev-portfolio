/**
 * Brillo especular (`.specular::after` en src/index.css): el puntero, en
 * coordenadas locales de la tarjeta. Es lo que se escribe en `--mx`/`--my`.
 *
 * Antes esto se calculaba en cada `pointermove` (100-200 veces por segundo)
 * con un `getBoundingClientRect()` por evento; ahora el hook lo coalesce a una
 * escritura por frame (auditoría 2026-10-17).
 */
export function localPointer(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number },
): { x: number; y: number } {
  return { x: clientX - rect.left, y: clientY - rect.top };
}
