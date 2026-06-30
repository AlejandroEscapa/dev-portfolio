import { useState, useCallback } from "react";

export type TerminalEntry = { id: number; kind: "user" | "bot"; text: string };

let _id = 0;
const nextId = () => ++_id;

export function useTerminalHistory() {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [commandStack, setCommandStack] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number>(-1);

  const push = useCallback((kind: "user" | "bot", text: string) => {
    if (!text) return;
    setEntries((e) => [...e, { id: nextId(), kind, text }]);
  }, []);

  const pushCommand = useCallback((cmd: string) => {
    if (!cmd.trim()) return;
    setCommandStack((s) => [...s, cmd]);
    setCursor(-1);
  }, []);

  const prev = useCallback(() => {
    if (commandStack.length === 0) return "";
    const next = cursor === -1 ? commandStack.length - 1 : Math.max(0, cursor - 1);
    setCursor(next);
    return commandStack[next];
  }, [commandStack, cursor]);

  const next = useCallback(() => {
    if (cursor === -1) return "";
    const nextC = cursor + 1;
    if (nextC >= commandStack.length) { setCursor(-1); return ""; }
    setCursor(nextC);
    return commandStack[nextC];
  }, [commandStack, cursor]);

  const clear = useCallback(() => { setEntries([]); }, []);

  return { entries, push, pushCommand, prev, next, clear };
}
