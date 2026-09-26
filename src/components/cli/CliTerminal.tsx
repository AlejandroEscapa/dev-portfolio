import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";
import { executeCommand } from "@/lib/cli-commands";
import { useTheme } from "@/hooks/useTheme";
import { useTerminalHistory } from "@/hooks/useTerminalHistory";
import { cn } from "@/lib/utils";

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
            animate={{ opacity: 1, transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
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
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1], delay: 0.16 } }}
            exit={{ opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.20, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label="CLI terminal"
        >
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-3 py-2">
            <button
              onClick={() => onOpenChange(false)}
              className="h-3 w-3 rounded-full bg-[#ff5f57] transition-transform hover:scale-110"
              aria-label="Close terminal"
            />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]/40" aria-hidden="true" />
            <span className="flex-1 text-center text-xs text-muted-foreground font-mono">
              cli@alejandro — {theme}
            </span>
            <TerminalIcon className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
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
                  e.kind === "user" ? "text-cyan-300" : "text-zinc-300"
                )}
              >
                {e.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-white/5 bg-white/[0.02] px-3 py-2 font-mono text-xs"
          >
            <span className="text-cyan-400">alejandro@dev:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type 'help' and press ↵"
              className="flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600"
              aria-label="Terminal input"
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
