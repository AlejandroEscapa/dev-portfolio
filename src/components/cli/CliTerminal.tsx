import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";
import { executeCommand } from "@/lib/cli-commands";
import { useTheme } from "@/hooks/useTheme";
import { useTerminalHistory } from "@/hooks/useTerminalHistory";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface CliTerminalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CliTerminal({ open, onOpenChange }: CliTerminalProps) {
  const [input, setInput] = useState("");
  const { theme, setTheme } = useTheme();
  const { entries, push, pushCommand, prev, next, clear } = useTerminalHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); const c = prev(); if (c) setInput(c); }
      if (e.key === "ArrowDown") { e.preventDefault(); const c = next(); if (c) setInput(c); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    push("user", `alejandro@dev:~$ ${input}`);
    pushCommand(input);
    const out = executeCommand(input, { setTheme, clear });
    if (out) push("bot", out);
    setInput("");
  }

  return (
    <AnimatePresence>
        {open && (
          <motion.div
            key="terminal-fog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.14, ease: EASE_OUT_EXPO } }}
            exit={{ opacity: 0, transition: { duration: 0.22, ease: EASE_OUT_EXPO } }}
            className="terminal-fog"
            aria-hidden="true"
          >
            <div className="terminal-fog-blur" />
          </motion.div>
        )}
        {open && (
          <motion.div
            key="terminal-panel"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.16, ease: EASE_OUT_EXPO, delay: 0.16 } }}
            exit={{ opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.20, ease: EASE_OUT_EXPO } }}
          className="fixed top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl overflow-hidden rounded-lg border border-neutral-tint/10 bg-background/95 shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label="CLI terminal"
        >
          <div className="flex items-center gap-2 border-b border-neutral-tint/5 bg-neutral-tint/[0.02] px-3 py-2">
            <button
              onClick={() => onOpenChange(false)}
              className="h-3 w-3 rounded-full bg-[#ff5f57] transition-transform hover:scale-110"
              aria-label="Close terminal"
            />
            {/* macOS traffic lights: intentionally literal — they must stay Apple red/amber in every theme. */}
            <span className="h-3 w-3 rounded-full bg-[#febc2e]/40" aria-hidden="true" />
            <span className="flex-1 text-center text-xs text-muted-foreground font-mono">
              cli@alejandro — {theme}
            </span>
            <TerminalIcon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          </div>
          <div
            ref={scrollRef}
            className="h-80 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
          >
            {entries.map((e) => (
              <div
                key={e.id}
                className={cn(
                  "whitespace-pre-wrap",
                  e.kind === "user" ? "text-accent" : "text-foreground/80"
                )}
              >
                {e.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-neutral-tint/5 bg-neutral-tint/[0.02] px-3 py-2 font-mono text-xs"
          >
            <span className="text-accent">alejandro@dev:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type 'help' and press ↵"
              className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60"
              aria-label="Terminal input"
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
