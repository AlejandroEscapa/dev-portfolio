import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DockItemProps {
  children: ReactNode;
  /** Visible name in the expanded rail / tooltip when collapsed (i18n'd). */
  label: string;
  /** Optional longer accessible name (e.g. "Open terminal" vs "Terminal"). */
  ariaLabel?: string;
  onClick?: () => void;
  active?: boolean;
  scale: number;
  accentClass?: string;
  /** Expanded rail: icon + label inline, magnify off. */
  showLabel?: boolean;
  /** Optional popover rendered as a sibling of the button (never nested
      inside it), positioned to the right of the rail. */
  popup?: ReactNode;
}

export function DockItem({
  children,
  label,
  ariaLabel,
  onClick,
  active,
  scale,
  accentClass,
  showLabel = false,
  popup,
}: DockItemProps) {
  return (
    <div className="group relative flex">
      <button
        type="button"
        data-dock-item
        onClick={onClick}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-tint/[0.06] bg-neutral-tint/[0.03] transition-all duration-200",
          "hover:bg-neutral-tint/[0.08] hover:border-neutral-tint/[0.12] hover:shadow-dock-item",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70",
          showLabel && "w-full justify-start gap-3 px-3",
          active && "dock-item-active"
        )}
        aria-label={ariaLabel ?? label}
        aria-pressed={active}
      >
        {/* The GLYPH nudges toward the pointer, not the button: the mark stays
            inside its hit area at every magnify level, nothing leaves the rail. */}
        <motion.span
          animate={showLabel ? { scale: 1, x: 0 } : { scale: 1 + scale * 0.18, x: scale * 3 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className={cn(
            "flex shrink-0 items-center justify-center transition-colors duration-200",
            accentClass,
            !accentClass && !showLabel && "group-hover:text-foreground"
          )}
        >
          {children}
        </motion.span>
        {showLabel && (
          <span className="truncate whitespace-nowrap font-mono text-xs text-foreground/90">
            {label}
          </span>
        )}
      </button>
      {active && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent dock-item-active-dot"
        />
      )}
      {!showLabel && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-popover/85 px-2 py-1 font-mono text-[10px] text-foreground opacity-0 shadow-lg ring-1 ring-neutral-tint/10 backdrop-blur-sm transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
        >
          {label}
        </span>
      )}
      {popup && <AnimatePresence>{popup}</AnimatePresence>}
    </div>
  );
}
