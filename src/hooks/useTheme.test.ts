import { render, renderHook, act } from "@testing-library/react";
import { createElement, useState } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { useTheme, applyTheme } from "./useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("applies default theme when storage is empty", () => {
    renderHook(() => useTheme());
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("persists theme to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dracula"));
    expect(localStorage.getItem("portfolio-theme")).toBe("dracula");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dracula");
  });

  it("reads existing theme from localStorage on mount", () => {
    localStorage.setItem("portfolio-theme", "tokyo-night");
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute("data-theme")).toBe("tokyo-night");
  });

  it("persists the choice even when the picker unmounts in the same commit", () => {
    // Reproduce el menú del dock: elegir un tema cierra el popover, así que
    // quien llamó a setTheme se desmonta antes de ejecutar sus efectos.
    // Sin JSX: este fichero es .ts.
    function Picker({ onPick }: { onPick: () => void }) {
      const { setTheme } = useTheme();
      return createElement("button", { onClick: () => { setTheme("dracula"); onPick(); } }, "Pick");
    }

    function Host() {
      const [open, setOpen] = useState(true);
      return open ? createElement(Picker, { onPick: () => setOpen(false) }) : createElement("span", null, "closed");
    }

    const { getByRole } = render(createElement(Host));
    act(() => getByRole("button", { name: "Pick" }).click());

    expect(localStorage.getItem("portfolio-theme")).toBe("dracula");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dracula");
  });
});

describe("applyTheme", () => {
  it("removes data-theme when indigo (default)", () => {
    document.documentElement.setAttribute("data-theme", "dracula");
    applyTheme("indigo");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
