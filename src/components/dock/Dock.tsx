import { Github, Linkedin, Mail, FileText, Terminal as TerminalIcon, Search } from "lucide-react";
import { useDockHover } from "@/hooks/useDockHover";
import { DockItem } from "./DockItem";
import { ThemeSwitcher } from "@/components/theme-switcher/ThemeSwitcher";

interface DockProps {
  onOpenSpotlight: () => void;
}

const RADIUS = 80;

export function Dock({ onOpenSpotlight }: DockProps) {
  const { ref, hoveredIdx, onMouseMove, onMouseLeave } = useDockHover();

  const items = [
    { id: "spotlight", node: <Search className="h-5 w-5 text-foreground" />, label: "Spotlight (⌘K)", onClick: onOpenSpotlight },
    { id: "cli", node: <TerminalIcon className="h-5 w-5 text-cyan-400" />, label: "Terminal", onClick: () => document.querySelector<HTMLElement>("[aria-label='Open terminal']")?.click() },
    { id: "github", node: <Github className="h-5 w-5 text-foreground" />, label: "GitHub", onClick: () => window.open("https://github.com/alejandrooliesc", "_blank") },
    { id: "linkedin", node: <Linkedin className="h-5 w-5 text-foreground" />, label: "LinkedIn", onClick: () => window.open("https://www.linkedin.com/in/alejandro-olivares-escapa/", "_blank") },
    { id: "mail", node: <Mail className="h-5 w-5 text-foreground" />, label: "Email", onClick: () => { window.location.href = "mailto:alejandro.oliesc97@gmail.com"; } },
    { id: "resume", node: <FileText className="h-5 w-5 text-foreground" />, label: "Resume", onClick: () => window.open("mailto:alejandro.oliesc97@gmail.com?subject=Resume%20request", "_blank") },
    { id: "theme", node: <ThemeSwitcher />, label: "Theme" },
  ];

  return (
    <>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="fixed bottom-3 left-1/2 z-30 hidden -translate-x-1/2 items-end gap-1.5 rounded-2xl border border-white/10 glass-strong px-3 py-2 md:flex"
      >
        {items.map((it, i) => {
          const dist = hoveredIdx === null ? 0 : Math.min(RADIUS, Math.abs(i - hoveredIdx) * 24) / RADIUS;
          const scale = 1 - dist;
          return (
            <DockItem key={it.id} label={it.label} onClick={it.onClick} scale={scale}>
              {it.node}
            </DockItem>
          );
        })}
      </div>
      <div className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-2xl border border-white/10 glass-strong px-2 py-1.5 md:hidden">
        {items.slice(0, 4).map((it) => (
          <button key={it.id} onClick={it.onClick} aria-label={it.label} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            {it.node}
          </button>
        ))}
      </div>
    </>
  );
}
