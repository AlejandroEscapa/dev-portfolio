import { useRef, useEffect } from "react";
import gsap from "gsap";
import { type ReactNode } from "react";

interface Icon3DProps {
  children: ReactNode;
  delay?: number;
}

export function Icon3D({ children, delay = 0 }: Icon3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    let anim: gsap.core.Tween | null = null;

    try {
      anim = gsap.to(el, {
        rotateY: 360,
        duration: 8,
        ease: "none",
        repeat: -1,
        delay,
      });
    } catch (e) {
      // GSAP animation failed, fallback to no animation
    }

    return () => {
      if (anim) anim.kill();
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className="inline-flex"
      style={{
        perspective: "600px",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
