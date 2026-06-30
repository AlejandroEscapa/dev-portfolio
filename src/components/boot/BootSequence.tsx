import { motion, AnimatePresence } from "framer-motion";
import { BOOT_LINES } from "@/lib/boot-messages";
import { useBootSequence } from "@/hooks/useBootSequence";

export function BootSequence() {
  const { running, step, skip } = useBootSequence(BOOT_LINES.length, 180);

  return (
    <AnimatePresence>
      {running && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          onClick={skip}
          className="fixed inset-0 z-[100] flex flex-col items-start justify-center gap-1 bg-black p-8 font-mono text-xs text-green-400 sm:text-sm md:p-16 cursor-pointer"
          aria-label="Boot sequence, click to skip"
        >
          {BOOT_LINES.slice(0, step).map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
              {line || "\u00A0"}
            </motion.div>
          ))}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="inline-block h-4 w-2 bg-green-400"
          />
          <p className="absolute bottom-8 right-8 text-[10px] text-green-700">(click anywhere to skip)</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
