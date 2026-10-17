import { useEffect, useState, type RefObject } from "react";

/**
 * Visibilidad de un elemento según `IntersectionObserver`, sin `once`: entra y
 * sale. Se usa para dejar de decodificar los vídeos de Projects cuando la
 * sección no se ve.
 *
 * El margen por defecto (200px) hace que la decisión se tome un poco antes de
 * que el elemento entre, para que el cambio de play/pausa no se note. Sin
 * `IntersectionObserver` disponible (o sin nodo todavía) devuelve `true`:
 * nunca dejar un vídeo parado por una capacidad que falta.
 */
export function useInViewport<T extends Element>(
  ref: RefObject<T>,
  options?: { rootMargin?: string },
): boolean {
  const rootMargin = options?.rootMargin ?? "200px";
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
