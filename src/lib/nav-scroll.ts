/**
 * Lógica de scroll del nav, fuera del componente para poder medirla y
 * testearla sin DOM.
 *
 * `anchors` lleva el centro de cada sección en coordenadas ABSOLUTAS del
 * documento (scrollY + rect.top + rect.height/2), y quien la consume compara
 * contra el centro del viewport también en absolutas (scrollY + innerHeight/2).
 * Antes esto se recalculaba con 9 getBoundingClientRect por evento de scroll.
 */

export type SectionAnchor = { id: string; center: number };

/** Sección cuyo centro queda más cerca del centro del viewport. */
export function resolveActiveSection(
  anchors: readonly SectionAnchor[],
  viewportCenter: number,
  fallback = "hero",
): string {
  if (anchors.length === 0) return fallback;

  let bestId = anchors[0].id;
  let bestDistance = Infinity;

  for (const anchor of anchors) {
    const distance = Math.abs(anchor.center - viewportCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = anchor.id;
    }
  }

  return bestId;
}

/** El nav solo entra a partir del umbral (el ancla previa a #projects). */
export function isNavVisible(scrollY: number, threshold: number): boolean {
  return scrollY >= threshold;
}
