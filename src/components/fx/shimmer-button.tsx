import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

// Adaptado de Magic UI "Shimmer Button" (MIT), item @magicui/shimmer-button:
// colores hardcodeados sustituidos por tokens semánticos; contenedor de
// chunks con [container-type:size] (Tailwind v4); animaciones con
// motion-safe: para respetar prefers-reduced-motion.

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "hsl(var(--primary))",
      shimmerSize = "0.1em",
      shimmerDuration = "3s",
      borderRadius = "var(--radius-md)",
      background = "transparent",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex items-center justify-center overflow-hidden border-neutral-tint/10 bg-neutral-tint/[0.03] whitespace-nowrap text-foreground backdrop-blur-sm",
          "[border-radius:var(--radius)] [background:var(--bg)] border",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "[container-type:size] absolute inset-0 overflow-visible"
          )}
        >
          {/* spark */}
          <div className="absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none] motion-safe:animate-shimmer-slide">
            {/* spark before */}
            <div className="absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] motion-safe:animate-spin-around" />
          </div>
        </div>
        {children}

        {/* Highlight */}
        <div
          className={cn(
            "absolute inset-0 size-full",

            "rounded-[inherit] px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_hsl(var(--primary)/0.12)]",

            // transition
            "transform-gpu transition-all duration-300 ease-in-out",

            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_hsl(var(--primary)/0.2)]",

            // on click
            "group-active:shadow-[inset_0_-10px_10px_hsl(var(--primary)/0.2)]"
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
          )}
        />
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
