import { useEffect, useState, useCallback } from "react";

const KEY = "portfolio-crt";
const DEFAULT = false;

export function useCRTToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return DEFAULT;
    return localStorage.getItem(KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(KEY, enabled ? "1" : "0");
    document.documentElement.classList.toggle("crt-on", enabled);
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((e) => !e), []);
  return { enabled, toggle };
}
