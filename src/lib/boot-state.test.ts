import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BOOTED_EVENT, isBooted, markBooted } from "./boot-state";

const KEY = "portfolio-booted";

describe("boot-state", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("isBooted is false without the storage key and true after markBooted", () => {
    expect(isBooted()).toBe(false);

    markBooted();

    expect(isBooted()).toBe(true);
    expect(localStorage.getItem(KEY)).toBe("1");
  });

  it("markBooted dispatches the BOOTED_EVENT", () => {
    const listener = vi.fn();
    window.addEventListener(BOOTED_EVENT, listener);

    markBooted();

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(BOOTED_EVENT, listener);
  });
});
