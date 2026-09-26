import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

export function BentoCard({ children, colSpan = 1, rowSpan = 1, className, title, icon }: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-neutral-tint/10 glass p-5 transition-all duration-300 hover-glow",
        colSpan === 2 && "md:col-span-2",
        colSpan === 3 && "md:col-span-3",
        colSpan === 4 && "md:col-span-4",
        rowSpan === 2 && "md:row-span-2",
        className
      )}
    >
      {(title || icon) && (
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {icon}
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
