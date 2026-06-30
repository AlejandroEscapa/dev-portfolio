import { Monitor, MonitorOff } from "lucide-react";
import { useCRTToggle } from "@/hooks/useCRTToggle";

export function CRTToggle() {
  const { enabled, toggle } = useCRTToggle();
  return (
    <button
      onClick={toggle}
      className="fixed right-4 top-20 z-30 flex h-9 w-9 items-center justify-center rounded-full glass text-xs"
      aria-label={enabled ? "Disable CRT effect" : "Enable CRT effect"}
      title="CRT"
    >
      {enabled ? <Monitor className="h-4 w-4 text-accent" /> : <MonitorOff className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}
