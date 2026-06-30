import { renderHook, act } from "@testing-library/react";
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
});

describe("applyTheme", () => {
  it("removes data-theme when indigo (default)", () => {
    document.documentElement.setAttribute("data-theme", "dracula");
    applyTheme("indigo");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
