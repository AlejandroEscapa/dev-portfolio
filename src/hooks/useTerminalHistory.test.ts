import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useTerminalHistory } from "./useTerminalHistory";

describe("useTerminalHistory", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useTerminalHistory());
    expect(result.current.entries).toEqual([]);
  });

  it("pushes entries", () => {
    const { result } = renderHook(() => useTerminalHistory());
    act(() => result.current.push("user", "help"));
    act(() => result.current.push("bot", "available commands..."));
    expect(result.current.entries).toHaveLength(2);
  });

  it("navigates back with prev()", () => {
    const { result } = renderHook(() => useTerminalHistory());
    act(() => result.current.pushCommand("a"));
    act(() => result.current.pushCommand("b"));
    expect(result.current.prev()).toBe("b");
  });

  it("clear() empties history", () => {
    const { result } = renderHook(() => useTerminalHistory());
    act(() => result.current.push("user", "x"));
    act(() => result.current.clear());
    expect(result.current.entries).toEqual([]);
  });
});
