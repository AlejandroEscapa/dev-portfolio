/**
 * Decisión de reproducir o pausar un vídeo de proyecto.
 *
 * Los dos mp4 son 1920×1080 y siguen decodificando mientras la sección está
 * fuera de pantalla (auditoría 2026-10-17), así que el play/pausa se decide
 * aquí y el componente solo ejecuta `video.play()` / `video.pause()`.
 *
 * Modo por defecto: basta con que la sección esté en el viewport, así que las
 * tarjetas laterales del carrusel se siguen viendo animándose igual que antes.
 * Con `gateIsActiveOnly` se exige además que sea la tarjeta activa (congela
 * las laterales: es una decisión de diseño, no la de por defecto).
 */
export function shouldPlayVideo({
  sectionVisible,
  isActive = false,
  gateIsActiveOnly = false,
}: {
  sectionVisible: boolean;
  isActive?: boolean;
  gateIsActiveOnly?: boolean;
}): boolean {
  if (!sectionVisible) return false;
  if (gateIsActiveOnly) return isActive;
  return true;
}

/**
 * Reproduce un vídeo sin romperse cuando `play()` no devuelve promesa (jsdom,
 * webviews antiguos) y sin dejar un rechazo sin capturar cuando el navegador
 * bloquea el autoplay.
 */
export function safePlay(video: HTMLVideoElement): void {
  const result: unknown = video.play();
  if (result && typeof (result as Promise<void>).catch === "function") {
    (result as Promise<void>).catch(() => {});
  }
}
