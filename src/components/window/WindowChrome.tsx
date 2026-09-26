import { type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WindowChromeProps {
  title: string;
  id: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  fullHeight?: boolean;
}

export function WindowChrome({ title, id, children, className, defaultOpen = true, fullHeight }: WindowChromeProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [minimized, setMinimized] = useState(false);

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative mx-auto my-8 max-w-5xl", className)}
    >
      {open && (
        <div className={cn("overflow-hidden rounded-lg border border-neutral-tint/10 glass-strong shadow-2xl", fullHeight && "h-full flex flex-col")}>
          <div className="flex items-center gap-2 border-b border-neutral-tint/5 bg-neutral-tint/[0.02] px-4 py-3">
            <div className="flex items-center gap-1.5">
              {/* macOS traffic lights: intentionally literal — they must stay Apple red/amber/green in every theme. */}
              <button
                data-traffic-light="close"
                onClick={() => setOpen(false)}
                className="h-3 w-3 rounded-full bg-[#ff5f57] transition-transform hover:scale-110"
                aria-label="Close"
              />
              <button
                data-traffic-light="min"
                onClick={() => setMinimized((m) => !m)}
                className="h-3 w-3 rounded-full bg-[#febc2e] transition-transform hover:scale-110"
                aria-label="Minimize"
              />
              <button
                data-traffic-light="max"
                onClick={() => setMinimized(false)}
                className="h-3 w-3 rounded-full bg-[#28c840] transition-transform hover:scale-110"
                aria-label="Maximize"
              />
            </div>
            <div className="flex-1 text-center text-xs font-medium text-muted-foreground font-mono">
              {title}
            </div>
            <div className="w-12" />
          </div>
          <motion.div
            animate={fullHeight ? { opacity: minimized ? 0 : 1 } : { height: minimized ? 0 : "auto", opacity: minimized ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className={cn("overflow-hidden", fullHeight && "flex-1 overflow-auto")}
          >
            <div className={cn("p-4 md:p-6", fullHeight && "h-full")}>{children}</div>
          </motion.div>
        </div>
      )}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="mx-auto flex items-center gap-2 rounded-full liquid-glass px-4 py-2 text-xs text-muted-foreground"
        >
          <span className="h-2 w-2 rounded-full bg-[#28c840]" /> {/* macOS traffic light: intentionally literal. */}
          {title}
        </button>
      )}
    </motion.div>
  );
}
