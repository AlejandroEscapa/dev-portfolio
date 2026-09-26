import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { BootSequence } from "@/components/boot/BootSequence";
import { Dock } from "@/components/dock/Dock";
import { CliTerminal } from "@/components/cli/CliTerminal";
import { Spotlight, useSpotlightToggle } from "@/components/spotlight/Spotlight";
import { CrtOverlay } from "@/components/crt/CrtOverlay";
import { CRTToggle } from "@/components/crt/CRTToggle";

const queryClient = new QueryClient();

const App = () => {
  const { open, setOpen } = useSpotlightToggle();
  const [terminalOpen, setTerminalOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
