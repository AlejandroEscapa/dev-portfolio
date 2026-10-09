import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Reveal } from "./Reveal";
import { RevealStagger } from "./RevealStagger";

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(),
}));

// jsdom no tiene layout ni IntersectionObserver real, así que el umbral de
// entrada solo se puede fijar doblando framer-motion y exponiendo el prop
// `viewport` en el DOM.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const capture = (Tag: "div") =>
    function MotionElement(props: Record<string, unknown>) {
      const { whileInView, viewport, children, ...rest } = props;
      return React.createElement(
        Tag,
        {
          ...rest,
          "data-while-in-view": whileInView ?? "",
          "data-viewport-amount": String((viewport as { amount?: unknown } | undefined)?.amount),
        },
        children as React.ReactNode,
      );
    };
  return { motion: { div: capture("div") } };
});

const staggeredWrapper = () => {
  const wrapper = document.querySelector('[data-while-in-view="show"]');
  expect(wrapper).not.toBeNull();
  return wrapper as HTMLElement;
};

describe("Reveal entry threshold", () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("triggers on any visible part so a container taller than the viewport still reveals", () => {
    // Un contenedor más alto que ~3.3 viewports nunca alcanza el 30% visible:
    // con un umbral proporcional se queda invisible para siempre (pantalla
    // corta, ventana pequeña o zoom del navegador).
    render(
      <RevealStagger>
        <Reveal>Item</Reveal>
      </RevealStagger>,
    );

    expect(staggeredWrapper()).toHaveAttribute("data-viewport-amount", "some");
  });

  it("uses the same non-proportional threshold for a standalone Reveal", () => {
    render(<Reveal>Standalone</Reveal>);

    expect(staggeredWrapper()).toHaveAttribute("data-viewport-amount", "some");
  });
});
