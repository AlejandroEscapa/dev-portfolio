import { useEffect, useState } from 'react';

/**
 * Resolves a design-token CSS variable into a `THREE.Color`-compatible
 * string and keeps it in sync with theme switches.
 *
 * Token colour values are stored as raw HSL triples (`248 90% 66%`), so
 * the resolved value is wrapped in `hsl(...)` — the same convention the
 * CSS uses (`hsl(var(--primary) / α)`). Only pass TRIPLE-valued vars
 * (`--primary`, `--accent`, `--secondary`, …); full colour tokens like
 * `--shadow-glow-accent` would be double-wrapped and break.
 */
function resolveVar(varName: string): string | null {
  const triple = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  // Comma-separated hsl() — THREE.Color.setStyle's parser is not guaranteed
  // to accept the modern space-separated CSS syntax.
  if (!triple) return null;
  const [h, s, l] = triple.split(/\s+/);
  return `hsl(${h}, ${s}, ${l})`;
}

export function useCssColor(varName: string, fallback: string): string {
  const [color, setColor] = useState(() => resolveVar(varName) ?? fallback);

  useEffect(() => {
    const update = () => setColor(resolveVar(varName) ?? fallback);
    update();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') update();
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [varName, fallback]);

  return color;
}
