import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Globe, Mail, Palette, Search, SquareTerminal, ChevronLeft, ChevronRight } from "lucide-react";
import { siGithub } from "simple-icons";
import { useDockHover } from "@/hooks/useDockHover";
import { DockItem } from "./DockItem";
import { ThemeMenu } from "@/components/theme-switcher/ThemeMenu";
import { EASE_OUT_EXPO, DURATION_BASE } from "@/lib/motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface DockProps {
  onOpenSpotlight: () => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
}

const RADIUS = 56;
const ICON_SIZE = 20;

// simple-icons dropped the LinkedIn mark in v11 (trademark policy); this is
// the official glyph path from the last published version, kept in-repo.
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

function BrandIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" aria-hidden="true" className={cn("h-[18px] w-[18px] fill-current", className)}>
      <path d={path} />
    </svg>
  );
}

function LanguageIcon() {
  const { lang } = useLanguage();
  return (
    <div className="relative h-5 w-5 [perspective:600px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={lang}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
          className="absolute inset-0 flex items-center justify-center text-foreground"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Globe size={ICON_SIZE} strokeWidth={2} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Dock({ onOpenSpotlight, terminalOpen, onToggleTerminal }: DockProps) {
  const { ref, hoveredIdx, onMouseMove, onMouseLeave } = useDockHover("y");
  const { t } = useLanguage();
  const { lang, toggleLang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [resumeFeedback, setResumeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeFeedback) return;
    const id = setTimeout(() => setResumeFeedback(null), 2200);
    return () => clearTimeout(id);
  }, [resumeFeedback]);

  const items = [
    {
      id: "spotlight",
      dockIdx: 0,
      node: <Search size={ICON_SIZE} strokeWidth={2} className="text-foreground" />,
      label: t("dock.spotlight"),
      onClick: onOpenSpotlight,
    },
    {
      id: "cli",
      dockIdx: 1,
      node: <SquareTerminal size={ICON_SIZE} strokeWidth={2} className="text-accent" />,
      label: t("dock.terminal"),
      ariaLabel: terminalOpen ? t("dock.close_terminal") : t("dock.open_terminal"),
      onClick: onToggleTerminal,
      active: terminalOpen,
      accentClass: "text-accent",
    },
    {
      id: "divider-1",
      divider: true,
    },
    {
      id: "github",
      dockIdx: 2,
      node: <BrandIcon path={siGithub.path} className="text-foreground" />,
      label: t("dock.github"),
      onClick: () => window.open("https://github.com/alejandrooliesc", "_blank"),
    },
    {
      id: "linkedin",
      dockIdx: 3,
      node: <BrandIcon path={LINKEDIN_PATH} className="text-icon-linkedin" />,
      label: t("dock.linkedin"),
      onClick: () =>
        window.open(
          "https://www.linkedin.com/in/alejandro-olivares-escapa/",
          "_blank"
        ),
      accentClass: "text-icon-linkedin",
    },
    {
      id: "mail",
      dockIdx: 4,
      node: <Mail size={ICON_SIZE} strokeWidth={2} className="text-icon-mail" />,
      label: t("dock.email"),
      onClick: () => {
        window.location.href = "mailto:alejandro.oliesc97@gmail.com";
      },
      accentClass: "text-icon-mail",
    },
    {
      id: "resume",
      dockIdx: 5,
      node: <FileText size={ICON_SIZE} strokeWidth={2} className="text-icon-resume" />,
      label: resumeFeedback ?? t("dock.resume"),
      onClick: () => {
        // TODO: drop the actual CV at public/cv.pdf — until then the click 404s.
        const link = document.createElement("a");
        link.href = "/cv.pdf";
        link.download = "Alejandro-Olivares-Escapa-CV.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setResumeFeedback(t("dock.downloading"));
      },
      accentClass: "text-icon-resume",
    },
    {
      id: "divider-2",
      divider: true,
    },
    {
      id: "lang",
      dockIdx: 6,
      node: null,
      label: t("dock.language"),
      onClick: toggleLang,
      isLanguage: true,
    },
    {
      id: "theme",
      dockIdx: 7,
      node: <Palette size={ICON_SIZE} strokeWidth={2} className="text-foreground" />,
      label: t("dock.theme"),
      onClick: () => setThemeMenuOpen((o) => !o),
      active: themeMenuOpen,
      popup: themeMenuOpen ? <ThemeMenu onPick={() => setThemeMenuOpen(false)} /> : null,
    },
  ];

  return (
    <>
      <motion.div
        ref={ref}
        id="app-dock"
        role="toolbar"
        aria-label={t("aria.dock")}
        aria-orientation="vertical"
        onMouseMove={onMouseMove}
        onMouseLeave={() => { onMouseLeave(); setThemeMenuOpen(false); }}
        animate={{ width: expanded ? 184 : 52 }}
        transition={{ duration: DURATION_BASE, ease: EASE_OUT_EXPO }}
        className="fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-stretch gap-1 rounded-lg border border-neutral-tint/[0.06] bg-background/25 px-2 py-2 shadow-dock backdrop-blur-xl md:flex"
      >
        {items.map((it) => {
          if ("divider" in it && it.divider) {
            return (
              <span
                key={it.id}
                aria-hidden="true"
                className="my-1 h-px w-full bg-neutral-tint/[0.08]"
              />
            );
          }
          const scale = expanded || hoveredIdx === null
            ? 0
            : 1 - Math.min(RADIUS, Math.abs(("dockIdx" in it ? it.dockIdx : 0) - hoveredIdx) * 26) / RADIUS;
          const showLabel = expanded;
          if ("isLanguage" in it && it.isLanguage) {
            return (
              <LanguageItem
                key={it.id}
                scale={scale}
                showLabel={showLabel}
                onClick={it.onClick!}
                active={false}
              />
            );
          }
          return (
            <DockItem
              key={it.id}
              label={it.label}
              ariaLabel={"ariaLabel" in it ? it.ariaLabel : undefined}
              onClick={it.onClick}
              scale={scale}
              active={"active" in it ? it.active : false}
              accentClass={"accentClass" in it ? it.accentClass : undefined}
              showLabel={showLabel}
              popup={"popup" in it ? it.popup : undefined}
            >
              {it.node}
            </DockItem>
          );
        })}

        {/* Expand / collapse disclosure */}
        <button
          onClick={() => setExpanded((o) => !o)}
          aria-expanded={expanded}
          aria-controls="app-dock"
          aria-label={expanded ? t("dock.collapse") : t("dock.expand")}
          className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-neutral-tint/[0.06] bg-neutral-tint/[0.03] px-3 text-muted-foreground transition-all duration-200 hover:bg-neutral-tint/[0.08] hover:border-neutral-tint/[0.12] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        >
          {expanded ? <ChevronLeft size={16} strokeWidth={2} /> : <ChevronRight size={16} strokeWidth={2} />}
          {expanded && (
            <span className="whitespace-nowrap font-mono text-xs">
              {t("dock.collapse")}
            </span>
          )}
        </button>
      </motion.div>

      {/* Mobile: keep the compact bottom bar */}
      <div className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-md border border-neutral-tint/[0.06] bg-background/25 backdrop-blur-xl px-2.5 py-1.5 shadow-dock md:hidden">
        {items
          .filter((it) => !("divider" in it) && !("isLanguage" in it))
          .slice(0, 4)
          .map((it) => (
            <button
              key={it.id}
              onClick={"onClick" in it ? it.onClick : undefined}
              aria-label={"ariaLabel" in it && it.ariaLabel ? it.ariaLabel : it.label}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-tint/[0.06] bg-neutral-tint/[0.03] transition-all duration-200 hover:bg-neutral-tint/[0.08] hover:border-neutral-tint/[0.12]"
            >
              {it.node}
            </button>
          ))}
      </div>
    </>
  );
}

function LanguageItem({
  scale,
  showLabel,
  onClick,
  active,
}: {
  scale: number;
  showLabel: boolean;
  onClick: () => void;
  active: boolean;
}) {
  const { lang, t } = useLanguage();
  const label =
    lang === "en" ? t("nav.lang_switch_to_es") : t("nav.lang_switch_to_en");
  return (
    <DockItem
      label={showLabel ? t("dock.language") : label}
      onClick={onClick}
      scale={scale}
      showLabel={showLabel}
      active={active}
      accentClass="text-foreground"
    >
      <LanguageIcon />
    </DockItem>
  );
}
