import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Reveal } from "./Reveal";
import { RevealStagger } from "./RevealStagger";

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(),
}));

describe("Reveal primitives", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders children inside a reveal wrapper", () => {
    render(
      <Reveal className="reveal-test">
        <span>Section content</span>
      </Reveal>,
    );

    expect(screen.getByText("Section content")).toBeInTheDocument();
    expect(screen.getByText("Section content").parentElement).toHaveClass("reveal-test");
  });

  it("starts hidden using the shared fade-up variant", () => {
    const { container } = render(<Reveal>Below-the-fold content</Reveal>);

    expect(container.firstElementChild).toHaveStyle({ opacity: "0" });
    expect(container.firstElementChild).toHaveStyle({ transform: "translateY(24px)" });
  });

  it("renders staggered children in the wrapper", () => {
    render(
      <RevealStagger className="stagger-test">
        <span>First item</span>
        <span>Second item</span>
      </RevealStagger>,
    );

    expect(screen.getByText("First item")).toBeInTheDocument();
    expect(screen.getByText("Second item")).toBeInTheDocument();
    expect(screen.getByText("First item").parentElement).toHaveClass("stagger-test");
  });

  it("renders a plain wrapper for reduced-motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = render(<Reveal>Static content</Reveal>);
    const wrapper = container.firstElementChild;

    expect(screen.getByText("Static content")).toBeInTheDocument();
    expect(wrapper).not.toHaveAttribute("style");
  });

  it("renders RevealStagger as a plain wrapper for reduced-motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    const { container } = render(
      <RevealStagger>
        <span>Static item</span>
      </RevealStagger>,
    );

    expect(screen.getByText("Static item")).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute("style");
  });
});
