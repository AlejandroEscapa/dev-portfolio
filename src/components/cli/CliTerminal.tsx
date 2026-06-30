import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, Minus, X } from "lucide-react";
import { executeCommand } from "@/lib/cli-commands";
import { useTheme } from "@/hooks/useTheme";
import { useTerminalHistory } from "@/hooks/useTerminalHistory";
import { cn } from "@/lib/utils";

export function CliTerminal() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const { theme, setTheme } = useTheme();
  const { entries, push, pushCommand, prev, next, clear } = useTerminalHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
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
    <>
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-[90vw] max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-3 py-2">
              <button onClick={() => setOpen(false)} className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-label="Close" />
              <button onClick={() => setMinimized(true)} className="h-3 w-3 rounded-full bg-[#febc2e]" aria-label="Minimize" />
              <span className="flex-1 text-center text-xs text-muted-foreground font-mono">cli@alejandro — {theme}</span>
            </div>
            <div ref={scrollRef} className="h-80 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
              {entries.map((e) => (
                <div key={e.id} className={cn("whitespace-pre-wrap", e.kind === "user" ? "text-cyan-300" : "text-zinc-300")}>
                  {e.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/5 bg-white/[0.02] px-3 py-2 font-mono text-xs">
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

      <button
        onClick={() => { setOpen((o) => !o); setMinimized(false); }}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900/90 text-cyan-400 shadow-2xl ring-1 ring-white/10 transition-all hover:scale-110 hover:bg-zinc-800"
        aria-label="Open terminal"
      >
        {open && !minimized ? <X className="h-5 w-5" /> : <TerminalIcon className="h-5 w-5" />}
      </button>

      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-2xl bg-zinc-900/90 px-4 text-xs font-mono text-cyan-400 shadow-2xl ring-1 ring-white/10"
        >
          <Minus className="h-4 w-4" /> cli
        </button>
      )}
    </>
  );
}
