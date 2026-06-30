import { useMemo, useState, useEffect } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { getSpotlightItems } from "@/lib/spotlight-items";
import { useTheme } from "@/hooks/useTheme";

interface SpotlightProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function Spotlight({ open, onOpenChange }: SpotlightProps) {
  const { setTheme } = useTheme();
  const items = useMemo(() => getSpotlightItems({ setTheme }), [setTheme]);
  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    items.forEach((i) => {
      if (!map.has(i.group)) map.set(i.group, []);
      map.get(i.group)!.push(i);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((i) => (
              <CommandItem
                key={i.id}
                value={`${i.label} ${i.keywords?.join(" ") ?? ""}`}
                onSelect={() => { i.action(); onOpenChange(false); }}
              >
                <span>{i.label}</span>
                {i.shortcut && <CommandShortcut>{i.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export function useSpotlightToggle() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
