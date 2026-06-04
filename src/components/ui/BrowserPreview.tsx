import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface BrowserPreviewProps {
  src: string;
  url?: string;
  tilt?: boolean;
}

// TODO [FUTURO - Video]: Sustituir <img> por <video> con autoplay/loop/muted
// cuando se tenga un screencast del recorrido por la web.
// Formato recomendado: MP4, 15-20s, mostrando:
//   1. Hero con widget de reserva
//   2. Scroll a "La Carta"
//   3. Sección de patrimonio/storytelling
//   4. Footer con CTA final
//
// TODO [FUTURO - Iframe]: Alternativa con iframe embebido para preview interactiva:
//   <iframe src="URL_PRODUCCION" sandbox="allow-scripts allow-same-origin" />
//   Requiere que la web permita framing (X-Frame-Options).
//   Ver: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
//
// TODO [FUTURO - Imagen]: La imagen actual es un screenshot estático del hero.
// Reemplazar por: /casahumedo-preview.png (guardar en public/)
// Dimensiones recomendadas: 1280x800px (16:10) para mantener proporción

export const BrowserPreview = ({ src, url, tilt = true }: BrowserPreviewProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={tilt ? { rotate: -1, y: 0 } : {}}
        whileHover={tilt ? { rotate: 0, y: -4, scale: 1.01 } : {}}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Browser frame */}
        <div className="relative w-[540px] max-w-full rounded-xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-[0_30px_80px_-20px_hsl(248_90%_66%/0.5)] overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            {/* macOS-style dots */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>

            {/* URL bar */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-black/30 text-[11px] text-muted-foreground max-w-[280px] truncate">
                <span className="text-green-400">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <span className="truncate">{url || "casahumedo.es"}</span>
              </div>
            </div>

            {/* External link icon */}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Open in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Content area */}
          <div className="relative aspect-[16/10] bg-black overflow-hidden">
            {/* Image preview */}
            <img
              src={src}
              alt="Website preview"
              className="w-full h-full object-cover"
            />

            {/* Hover overlay */}
            <div
              className={`absolute inset-0 bg-primary/5 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>

        {/* Floating glow behind browser */}
        <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl" />
      </motion.div>
    </div>
  );
};
