import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
