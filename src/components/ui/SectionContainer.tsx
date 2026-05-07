import { type ReactNode } from "react";
import type { MotionValue } from "framer-motion";

interface SectionContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
  padding?: string;
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
  padding = "py-24",
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
      className={`relative flex min-h-screen flex-col justify-center px-6 ${padding} ${className}`}
    >
      <div className={`container mx-auto ${maxWidthMap[maxWidth]}`}>
        {children}
      </div>
    </section>
  );
};
