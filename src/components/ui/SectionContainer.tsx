import { type ReactNode } from "react";
import type { MotionValue } from "framer-motion";

interface SectionContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

const maxWidthMap = {
  sm: "max-w-5xl",
  md: "max-w-6xl",
  lg: "max-w-7xl",
  xl: "max-w-screen-xl",
};

export const SectionContainer = ({
  children,
  maxWidth = "md",
  className = "",
  id,
  innerRef,
  motionStyle,
}: SectionContainerProps) => {
  return (
    <section
      id={id}
      ref={innerRef}
      style={{
        scale: motionStyle?.scale,
        y: motionStyle?.y,
        opacity: motionStyle?.opacity,
        willChange: "transform, opacity",
      }}
      // Section-to-section spacing is owned by .section-y, declared once in
      // the page flow. Horizontal padding is provided by the outer .section-px
      // wrapper. This container adds NO rhythm of its own — it only centers
      // content inside whatever window encloses it.
      className={`relative flex flex-col justify-center ${className}`}
    >
      <div className={`container mx-auto ${maxWidthMap[maxWidth]}`}>
        {children}
      </div>
    </section>
  );
};
