import { useEffect, useState } from "react";

const KEY = "portfolio-booted";

export function useBootSequence(totalSteps: number, stepMs = 220) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY) === "1") { setDone(true); return; }
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (step >= totalSteps) {
      localStorage.setItem(KEY, "1");
      setRunning(false);
      setDone(true);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), stepMs);
    return () => clearTimeout(t);
  }, [step, running, totalSteps, stepMs]);

  const skip = () => {
    localStorage.setItem(KEY, "1");
    setStep(totalSteps);
    setRunning(false);
    setDone(true);
  };

  return { running, done, step, skip };
}
