import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { THEMES, type ThemeId } from "@/lib/themes";
import { DURATION_FAST, EASE_OUT_EXPO } from "@/lib/motion";

/** Popover listing the available themes. The dock item owns the trigger
    button, so there is exactly one button per dock slot (no nested buttons)
    and the menu opens to the right of the rail. */
export function ThemeMenu({ onPick }: { onPick: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8, scale: 0.96 }}
      transition={{ duration: DURATION_FAST, ease: EASE_OUT_EXPO }}
      className="absolute left-full top-1/2 z-40 ml-2 min-w-[180px] -translate-y-1/2 rounded-lg glass-strong p-2 shadow-xl"
      onMouseLeave={onPick}
    >
      {(Object.keys(THEMES) as ThemeId[]).map((id) => (
        <button
          key={id}
          onClick={() => { setTheme(id); onPick(); }}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
            theme === id ? "bg-neutral-tint/10 text-foreground" : "text-muted-foreground hover:bg-neutral-tint/5 hover:text-foreground"
          }`}
        >
          <span>{THEMES[id].emoji}</span>
          <span>{THEMES[id].label}</span>
        </button>
      ))}
    </motion.div>
  );
}
