import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Magnetic } from "./Magnetic";

vi.mock("@/hooks/useMediaQuery", () => ({ useMediaQuery: vi.fn() }));
vi.mock("@/hooks/useReducedMotion", () => ({ useReducedMotion: vi.fn() }));

const POINTER_FINE = "(pointer: fine)";

const renderMagnetic = () =>
  render(
    <Magnetic>
      <button>CTA</button>
    </Magnetic>,
  );

describe("Magnetic mount gates", () => {
  beforeEach(() => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("monta el campo magnético solo con puntero fino y sin reduced motion", () => {
    const { container } = renderMagnetic();

    expect(container.querySelector("[data-magnetic]")).not.toBeNull();
    expect(useMediaQuery).toHaveBeenCalledWith(POINTER_FINE);
  });

  it("renderiza el hijo sin campo magnético con puntero grueso", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { container } = renderMagnetic();

    expect(container.querySelector("[data-magnetic]")).toBeNull();
    expect(screen.getByRole("button", { name: "CTA" })).toBeInTheDocument();
  });

  it("renderiza el hijo sin campo magnético bajo reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = renderMagnetic();

    expect(container.querySelector("[data-magnetic]")).toBeNull();
    expect(screen.getByRole("button", { name: "CTA" })).toBeInTheDocument();
  });
});

describe("Magnetic field", () => {
  beforeEach(() => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("desplaza el botón hacia el puntero y lo devuelve al salir del campo", async () => {
    const { container } = renderMagnetic();
    const field = container.querySelector("[data-magnetic]") as HTMLElement;
    // jsdom no maqueta: la caja se declara a mano (160×44 en 100,200).
    field.getBoundingClientRect = () =>
      ({ left: 100, top: 200, width: 160, height: 44, right: 260, bottom: 244 }) as DOMRect;

    fireEvent.mouseMove(field, { clientX: 196, clientY: 222 });

    // 16px a la derecha del centro con fuerza 0.25 -> ~4px de desplazamiento.
    await vi.waitFor(() => {
      expect(field.style.transform).toContain("translateX(4px)");
    });

    fireEvent.mouseMove(field, { clientX: 900, clientY: 222 });

    await vi.waitFor(() => {
      expect(field.style.transform).toBe("none");
    });
  });
});
