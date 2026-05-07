import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SYMBOLS = [
  "\t", "<", ">", "{", "}", "[", "]", "(", ")", 
  "=>", "===", "!=", "/", "*", ";", ":", 
  "</", "/>", "?", "&&", "||", "..."
];

interface SymbolParticle {
  id: number;
  symbol: string;
  x: number;
  y: number;
  duration: number;
  size: number;
  opacity: number;
  isSpecial: boolean;
}

export const CodeBackground: React.FC = () => {
  const [particles, setParticles] = useState<SymbolParticle[]>([]);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setParticles((prev) => {
        if (prev.length >= 60) return prev; // Increased density limit

        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Define Safe-Zone / Protected Areas (Central Column and Header/Footer)
        const isCenterX = x > 20 && x < 80;
        const isTopY = y < 15;
        const isBottomY = y > 85;
        const inProtectedZone = isCenterX || isTopY || isBottomY;

        // Probability filter: only 10% chance to spawn in protected zones
        if (inProtectedZone && Math.random() > 0.1) return prev;

        const newParticle: SymbolParticle = {
          id: Date.now() + Math.random(),
          symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          x,
          y,
          duration: 2 + Math.random() * 3,
          size: inProtectedZone ? 20 + Math.random() * 4 : 14 + Math.random() * 4,
          opacity: inProtectedZone ? 0.12 + Math.random() * 0.08 : 0.04 + Math.random() * 0.04,
          isSpecial: inProtectedZone,
        };

        return [...prev, newParticle];
      });
    }, 150); // Faster spawn rate for higher density

    return () => clearInterval(spawnInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setParticles((prev) => {
        const now = Date.now();
        return prev.filter((p) => (now - p.id) < p.duration * 1000);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none"
      aria-hidden="true"
    >
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0 }}
            animate={{ 
              opacity: p.opacity, 
              y: -50, 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: p.duration / 2, ease: "easeInOut" },
              y: { duration: p.duration, ease: "linear" },
            }}
            className="absolute font-mono text-foreground"
            style={{ 
              left: `${p.x}%`, 
              top: `${p.y}%`, 
            }}
          >
            <motion.div
              animate={{ 
                x: [0, -0.5, 0.5, 0],
                y: [0, 0.5, -0.5, 0],
              }}
              transition={{ 
                duration: 0.3, // Slightly slower for subtlety
                repeat: Infinity, 
                repeatType: "mirror", 
                ease: "linear" 
              }}
              style={{ 
                fontSize: `${p.size}px`,
              }}
            >
              {p.symbol}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
