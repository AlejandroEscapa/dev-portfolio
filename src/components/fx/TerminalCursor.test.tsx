import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { portfolioConfig } from "@/lib/config";
import { TerminalCursor } from "./TerminalCursor";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn() }));
vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: vi.fn() }));
vi.mock("@/lib/config", () => ({
  portfolioConfig: { features: { terminalCursor: true } },
}));

const setFlag = (on: boolean) => {
  (portfolioConfig.features as { terminalCursor: boolean }).terminalCursor = on;
};

const renderCursor = () =>
  render(
    <LanguageProvider>
      <TerminalCursor />
    </LanguageProvider>,
  );

const renderWithTargets = () =>
  render(
    <LanguageProvider>
      <div data-cursor="view">card</div>
      <button data-cursor="open">dialog</button>
      <input data-cursor="text" aria-label="field" />
      <TerminalCursor />
    </LanguageProvider>,
  );

const POINTER_FINE = "(pointer: fine)";

describe("TerminalCursor mount gates", () => {
  beforeEach(() => {
    localStorage.clear();
    setFlag(true);
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing and leaves no dataset trace when the flag is off", () => {
    setFlag(false);

    const { container } = renderCursor();

    expect(container.innerHTML).toBe("");
    expect(document.documentElement.dataset.customCursor).toBeUndefined();
  });

  it("renders nothing with a coarse pointer", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    const { container } = renderCursor();

    expect(container.innerHTML).toBe("");
    expect(useMediaQuery).toHaveBeenCalledWith(POINTER_FINE);
  });

  it("renders nothing under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = renderCursor();

    expect(container.innerHTML).toBe("");
  });

  it("marks the document on mount and cleans the dataset on unmount", () => {
    const { unmount } = renderCursor();

    expect(document.documentElement.dataset.customCursor).toBe("on");

    unmount();

    expect(document.documentElement.dataset.customCursor).toBeUndefined();
  });
});

describe("TerminalCursor contextual state", () => {
  beforeEach(() => {
    localStorage.clear();
    setFlag(true);
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("labels a [data-cursor='view'] target and falls back to rest", () => {
    renderWithTargets();

    expect(screen.queryByText("View")).not.toBeInTheDocument();

    fireEvent.mouseOver(screen.getByText("card"));
    expect(screen.getByText("View")).toBeInTheDocument();

    fireEvent.mouseOver(document.body);
    expect(screen.queryByText("View")).not.toBeInTheDocument();
  });

  it("labels a [data-cursor='open'] target", () => {
    renderWithTargets();

    fireEvent.mouseOver(screen.getByText("dialog"));
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("switches to the I-beam with no label on a [data-cursor='text'] target", async () => {
    const { container } = renderWithTargets();

    fireEvent.mouseOver(screen.getByLabelText("field"));

    expect(screen.queryByText("View")).not.toBeInTheDocument();
    expect(screen.queryByText("Open")).not.toBeInTheDocument();

    const beam = container.querySelector('[data-testid="cursor-beam"]');
    expect(beam).not.toBeNull();
    expect(beam).toHaveStyle({ width: "2px", height: "20px" });
    await vi.waitFor(() => {
      expect(beam).toHaveStyle({ opacity: "1" });
    });
  });
});
