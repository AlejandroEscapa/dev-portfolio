import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import DecryptedText from "@/components/fx/DecryptedText";
import { ShimmerButton } from "@/components/fx/shimmer-button";
import { Magnetic } from "@/components/fx/Magnetic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToSection } from "@/lib/scroll";
import { BOOTED_EVENT, isBooted } from "@/lib/boot-state";
import { fadeUpSm } from "@/lib/motion";

export const Hero = () => {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  // Coreografía post-boot: título y CTAs arrancan cuando termina la
  // secuencia de arranque (o se salta). El visitante recurrente lee la
  // bandera de forma síncrona en su primer render: para él no llegará
  // ningún evento, y aun así no espera nada.
  const [booted, setBooted] = useState(() => isBooted());

  useEffect(() => {
    if (booted) return;
    const onBooted = () => setBooted(true);
    window.addEventListener(BOOTED_EVENT, onBooted);
    return () => window.removeEventListener(BOOTED_EVENT, onBooted);
  }, [booted]);

  // Con el overlay de boot aún cubriendo la pantalla el título se pinta
  // como texto plano; el descifrado empieza cuando el overlay se desvanece.
  const showDecryptedTitle = !prefersReducedMotion && booted;
  // Reduced-motion no entra en el encadenado: contenido estático siempre.
  const ctaAnimationState = prefersReducedMotion || booted ? "show" : "hidden";

  return (
    <section
      // Horizontal padding comes from the outer .section-px wrapper in
      // HeroShowcase / Index — do NOT add px-* here (would stack).
      // No id here: the sheet section in Index owns the "hero" anchor.
      className="relative flex h-full items-center pl-4 md:pl-8"
    >
      <div className="relative z-10 w-full max-w-2xl space-y-10">
        <h1 className="text-display font-bold leading-[0.95] tracking-display">
          {showDecryptedTitle ? (
            <>
              {/* Efecto de descifrado terminal al cargar (DecryptedText, ver attributions) */}
              <DecryptedText
                text="Alejandro"
                className="text-gradient"
                encryptedClassName="text-muted-foreground/60"
                animateOn="view"
                speed={45}
              />
              <DecryptedText
                text="Olivares Escapa"
                className="text-gradient-primary"
                encryptedClassName="text-muted-foreground/60"
                animateOn="view"
                speed={45}
                sequential
                revealDirection="start"
              />
            </>
          ) : (
            <>
              <span className="block text-gradient">Alejandro</span>
              <span className="block text-gradient-primary">Olivares Escapa</span>
            </>
          )}
        </h1>

        {/* Professional summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 font-mono text-label uppercase tracking-label text-muted-foreground">
            <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
            <span>{t("hero.description_label")}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("hero.description")}
          </p>
        </div>

        {/* CTA buttons — entran con el resto de la coreografía post-boot.
            initial explícito para que reduced-motion no anime nunca. */}
        <motion.div
          className="flex flex-wrap gap-3"
          variants={fadeUpSm}
          initial={prefersReducedMotion ? "show" : "hidden"}
          animate={ctaAnimationState}
        >
          <Magnetic>
            <ShimmerButton
              className="rounded-lg px-5 py-2.5 text-sm font-medium"
              shimmerColor="hsl(var(--primary))"
              shimmerDuration="4s"
              onClick={() => scrollToSection("projects")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
              {t("hero.cta_projects")}
            </ShimmerButton>
          </Magnetic>
          <Magnetic>
            <ShimmerButton
              className="rounded-lg px-5 py-2.5 text-sm font-medium"
              shimmerColor="hsl(var(--accent))"
              shimmerDuration="4s"
              onClick={() => scrollToSection("contact")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {t("hero.cta_contact")}
            </ShimmerButton>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
};
