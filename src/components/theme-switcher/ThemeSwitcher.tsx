import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { THEMES, type ThemeId } from "@/lib/themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 transition-all hover:scale-110 hover:bg-white/10"
        aria-label="Change theme"
        data-testid="theme-switcher-trigger"
      >
        <Palette className="h-5 w-5 text-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-xl glass-strong p-2 min-w-[200px]"
            onMouseLeave={() => setOpen(false)}
          >
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <button
                key={id}
                onClick={() => { setTheme(id); setOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  theme === id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <span>{THEMES[id].emoji}</span>
                <span>{THEMES[id].label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
