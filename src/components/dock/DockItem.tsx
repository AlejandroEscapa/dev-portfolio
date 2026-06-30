import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DockItemProps {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  scale: number;
}

export function DockItem({ children, label, onClick, active, scale }: DockItemProps) {
  return (
    <motion.button
      data-dock-item
      onClick={onClick}
      animate={{ scale: 1 + scale * 0.45, y: -scale * 18 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className={cn(
        "group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition-colors",
        active && "bg-white/15 ring-white/30"
      )}
      aria-label={label}
    >
      {children}
      <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-zinc-900/90 px-2 py-1 text-[10px] font-mono text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </motion.button>
  );
}
