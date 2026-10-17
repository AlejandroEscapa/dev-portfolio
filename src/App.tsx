import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { BootSequence } from "@/components/boot/BootSequence";
import { Dock } from "@/components/dock/Dock";
import { CliTerminal } from "@/components/cli/CliTerminal";
import { Spotlight, useSpotlightToggle } from "@/components/spotlight/Spotlight";
import { CrtOverlay } from "@/components/crt/CrtOverlay";
import { CRTToggle } from "@/components/crt/CRTToggle";
import { TerminalCursor } from "@/components/fx/TerminalCursor";

// Sin QueryClientProvider (no hay un solo consumidor de datos remotos), sin el
// Toaster de Radix (el toast real es Sonner) y sin TooltipProvider (ningún
// Tooltip fuera de src/components/ui): los tres solo metían bytes y trabajo de
// montaje en el bundle inicial. Ver auditoría de rendimiento 2026-10-17.
const App = () => {
  const { open, setOpen } = useSpotlightToggle();
  const [terminalOpen, setTerminalOpen] = useState(false);
  return (
    <>
      <Sonner />
      <BootSequence />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Spotlight open={open} onOpenChange={setOpen} />
      <CliTerminal open={terminalOpen} onOpenChange={setTerminalOpen} />
      <Dock
        onOpenSpotlight={() => setOpen(true)}
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((o) => !o)}
      />
      <CrtOverlay />
      <CRTToggle />
      <TerminalCursor />
    </>
  );
};

export default App;
