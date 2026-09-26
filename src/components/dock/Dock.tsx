import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GithubLogo,
  LinkedinLogo,
  EnvelopeSimple,
  FileText,
  Terminal,
  MagnifyingGlass,
  GlobeHemisphereWest,
  Palette,
} from "@phosphor-icons/react";
import { useDockHover } from "@/hooks/useDockHover";
import { DockItem } from "./DockItem";
import { ThemeSwitcher } from "@/components/theme-switcher/ThemeSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface DockProps {
  onOpenSpotlight: () => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
}

const RADIUS = 68;
const ICON_SIZE = 22;

function LanguageIcon({ weight = "duotone" as const }) {
  const { lang } = useLanguage();
  return (
    <div className="relative h-6 w-6 [perspective:600px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={lang}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-foreground"
          style={{ transformStyle: "preserve-3d" }}
        >
          <GlobeHemisphereWest size={ICON_SIZE} weight={weight} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LanguageItem({
  scale,
  onClick,
  active,
}: {
  scale: number;
  onClick: () => void;
  active: boolean;
}) {
  const { lang, t } = useLanguage();
  const label =
    lang === "en" ? t("nav.lang_switch_to_es") : t("nav.lang_switch_to_en");
  return (
    <DockItem
      label={label}
      onClick={onClick}
      scale={scale}
      active={active}
      accentClass="text-foreground"
    >
      <LanguageIcon />
    </DockItem>
  );
}

export function Dock({ onOpenSpotlight, terminalOpen, onToggleTerminal }: DockProps) {
  const { ref, hoveredIdx, onMouseMove, onMouseLeave } = useDockHover();
  const { lang, toggleLang } = useLanguage();
  const [resumeFeedback, setResumeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeFeedback) return;
    const id = setTimeout(() => setResumeFeedback(null), 2200);
    return () => clearTimeout(id);
  }, [resumeFeedback]);

  const items = [
    {
      id: "spotlight",
      node: <MagnifyingGlass size={ICON_SIZE} weight="duotone" className="text-foreground" />,
      label: "Spotlight (⌘K)",
      onClick: onOpenSpotlight,
    },
    {
      id: "cli",
      node: (
        <Terminal
          size={ICON_SIZE}
          weight="duotone"
          className="text-accent transition-colors"
        />
      ),
      label: terminalOpen ? "Close terminal" : "Open terminal",
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
      node: <GithubLogo size={ICON_SIZE} weight="duotone" className="text-foreground" />,
      label: "GitHub",
      onClick: () => window.open("https://github.com/alejandrooliesc", "_blank"),
    },
    {
      id: "linkedin",
      node: (
        <LinkedinLogo
          size={ICON_SIZE}
          weight="duotone"
          className="text-icon-linkedin"
        />
      ),
      label: "LinkedIn",
      onClick: () =>
        window.open(
          "https://www.linkedin.com/in/alejandro-olivares-escapa/",
          "_blank"
        ),
      accentClass: "text-icon-linkedin",
    },
    {
      id: "mail",
      node: (
        <EnvelopeSimple
          size={ICON_SIZE}
          weight="duotone"
          className="text-icon-mail"
        />
      ),
      label: "Email",
      onClick: () => {
        window.location.href = "mailto:alejandro.oliesc97@gmail.com";
      },
      accentClass: "text-icon-mail",
    },
    {
      id: "resume",
      node: (
        <FileText
          size={ICON_SIZE}
          weight="duotone"
          className="text-icon-resume"
        />
      ),
      label: resumeFeedback ?? "Resume",
      onClick: () => {
        // TODO: drop the actual CV at public/cv.pdf — until then the click 404s.
        const link = document.createElement("a");
        link.href = "/cv.pdf";
        link.download = "Alejandro-Olivares-Escapa-CV.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setResumeFeedback("Downloading…");
      },
      accentClass: "text-icon-resume",
    },
    {
      id: "divider-2",
      divider: true,
    },
    {
      id: "lang",
      node: null,
      label:
        lang === "en" ? "Switch to Spanish" : "Switch to English",
      onClick: toggleLang,
      isLanguage: true,
    },
    {
      id: "theme",
      node: <ThemeSwitcher />,
      label: "Theme",
    },
  ];

  return (
    <>
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="fixed bottom-3 left-1/2 z-30 hidden -translate-x-1/2 items-end gap-1.5 rounded-md border border-neutral-tint/[0.06] bg-background/25 backdrop-blur-xl px-3 py-2 shadow-dock md:flex"
      >
        {items.map((it, i) => {
          if ("divider" in it && it.divider) {
            return (
              <span
                key={it.id}
                aria-hidden="true"
                className="mx-1 h-7 w-px bg-neutral-tint/[0.08]"
              />
            );
          }
          const scale =
            hoveredIdx === null
              ? 0
              : 1 - Math.min(RADIUS, Math.abs(i - hoveredIdx) * 28) / RADIUS;
          if ("isLanguage" in it && it.isLanguage) {
            return (
              <LanguageItem
                key={it.id}
                scale={scale}
                onClick={it.onClick!}
                active={false}
              />
            );
          }
          return (
            <DockItem
              key={it.id}
              label={it.label}
              onClick={it.onClick}
              scale={scale}
              active={"active" in it ? it.active : false}
              accentClass={"accentClass" in it ? it.accentClass : undefined}
            >
              {it.node}
            </DockItem>
          );
        })}
      </div>
      <div className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-md border border-neutral-tint/[0.06] bg-background/25 backdrop-blur-xl px-2.5 py-1.5 shadow-dock md:hidden">
        {items
          .filter((it) => !("divider" in it) && !("isLanguage" in it))
          .slice(0, 4)
          .map((it) => (
            <button
              key={it.id}
              onClick={"onClick" in it ? it.onClick : undefined}
              aria-label={it.label}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-tint/[0.06] bg-neutral-tint/[0.03] transition-all duration-200 hover:bg-neutral-tint/[0.08] hover:border-neutral-tint/[0.12]"
            >
              {it.node}
            </button>
          ))}
      </div>
    </>
  );
}
