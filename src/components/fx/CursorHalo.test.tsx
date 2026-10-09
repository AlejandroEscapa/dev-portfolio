import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { portfolioConfig } from "@/lib/config";
import { CursorHalo } from "./CursorHalo";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn() }));
vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: vi.fn() }));
vi.mock("@/lib/config", () => ({
  portfolioConfig: { features: { cursorHalo: true } },
}));

const setFlag = (on: boolean) => {
  (portfolioConfig.features as { cursorHalo: boolean }).cursorHalo = on;
};

const renderHalo = () =>
  render(
    <LanguageProvider>
      <CursorHalo />
    </LanguageProvider>,
  );

const POINTER_FINE = "(pointer: fine)";
const pointerCalls = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.filter(([type]) => type === "mousemove" || type === "mouseover" || type === "mouseout");

describe("CursorHalo mount gates", () => {
  beforeEach(() => {
    localStorage.clear();
    setFlag(true);
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing and registers no listeners when the flag is off", () => {
    setFlag(false);
    const addSpy = vi.spyOn(document, "addEventListener");

    const { container } = renderHalo();

    expect(container.firstElementChild).toBeNull();
    expect(pointerCalls(addSpy)).toHaveLength(0);
  });

  it("renders nothing with a coarse pointer", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    const { container } = renderHalo();

    expect(container.firstElementChild).toBeNull();
    expect(useMediaQuery).toHaveBeenCalledWith(POINTER_FINE);
  });

  it("renders nothing under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = renderHalo();

    expect(container.firstElementChild).toBeNull();
  });

  it("mounts an aria-hidden halo that never captures pointer events", () => {
    const { container } = renderHalo();
    const halo = container.firstElementChild as HTMLElement;

    expect(halo).not.toBeNull();
    expect(halo).toHaveAttribute("aria-hidden", "true");
    expect(halo).toHaveStyle({ pointerEvents: "none" });
    expect(halo).toHaveStyle({ mixBlendMode: "difference" });
  });
});

describe("CursorHalo contextual state", () => {
  beforeEach(() => {
    localStorage.clear();
    setFlag(true);
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("labels a [data-cursor='view'] target and falls back to rest", () => {
    render(
      <LanguageProvider>
        <div data-cursor="view">card</div>
        <CursorHalo />
      </LanguageProvider>,
    );

    expect(screen.queryByText("View")).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByText("card"));
    expect(screen.getByText("View")).toBeInTheDocument();

    fireEvent.mouseOver(document.body);
    expect(screen.queryByText("View")).not.toBeInTheDocument();
  });
});
