import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DockItemProps {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  scale: number;
  accentClass?: string;
}

export function DockItem({
  children,
  label,
  onClick,
  active,
  scale,
  accentClass,
}: DockItemProps) {
  return (
    <motion.button
      data-dock-item
      onClick={onClick}
      animate={{ scale: 1 + scale * 0.4, y: -scale * 20 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={cn(
        "group relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] transition-all duration-200",
        "hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(190_95%_60%/0.7)]",
        active && "dock-item-active"
      )}
      aria-label={label}
      aria-pressed={active}
    >
      <span
        className={cn(
          "transition-colors duration-200",
          accentClass,
          !accentClass && "group-hover:text-foreground"
        )}
      >
        {children}
      </span>
      {active && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[hsl(190_95%_60%)] dock-item-active-dot"
        />
      )}
      <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md bg-zinc-900/85 px-2 py-1 text-[10px] font-mono text-foreground opacity-0 backdrop-blur-sm shadow-lg ring-1 ring-white/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100">
        {label}
      </span>
    </motion.button>
  );
}
