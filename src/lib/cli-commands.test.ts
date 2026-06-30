import { describe, it, expect, vi } from "vitest";
import { executeCommand } from "./cli-commands";

describe("executeCommand", () => {
  it("returns help text for 'help'", () => {
    const out = executeCommand("help", { setTheme: vi.fn(), clear: vi.fn() });
    expect(out).toContain("help");
    expect(out).toContain("whoami");
  });

  it("returns 'command not found' for unknown", () => {
    const out = executeCommand("rm -rf /", { setTheme: vi.fn(), clear: vi.fn() });
    expect(out).toMatch(/disabled/i);
  });

  it("returns ASCII art for 'sudo'", () => {
    const out = executeCommand("sudo", { setTheme: vi.fn(), clear: vi.fn() });
    expect(out).toContain("Nice try");
  });

  it("switches theme when valid theme name given", () => {
    const setTheme = vi.fn();
    const out = executeCommand("theme dracula", { setTheme, clear: vi.fn() });
    expect(setTheme).toHaveBeenCalledWith("dracula");
    expect(out).toContain("dracula");
  });

  it("returns theme list when no arg given", () => {
    const out = executeCommand("theme", { setTheme: vi.fn(), clear: vi.fn() });
    expect(out).toContain("indigo");
    expect(out).toContain("catppuccin");
  });
});
