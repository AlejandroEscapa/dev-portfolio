import { useEffect, useState, useRef } from "react";

interface Options {
  speed?: number;
  startDelay?: number;
  threshold?: number;
}

export function useTypewriter(text: string, { speed = 14, startDelay = 0, threshold = 0.2 }: Options = {}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [out, setOut] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(id);
      }, speed);
      return () => clearInterval(id);
    }, startDelay);
    return () => clearTimeout(t);
  }, [visible, text, speed, startDelay]);

  return { ref, display: out };
}
