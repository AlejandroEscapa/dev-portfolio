import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";

// La escena 3D va en chunk lazy: en jsdom resolvemos el import con un stub
// para que el render de la página no dependa de WebGL.
vi.mock("@/components/three/HeroScene", () => ({
  default: () => null,
}));

// Lenis necesita viewport real: en jsdom el smooth-scroll no existe.
vi.mock("@/hooks/useLenis", () => ({
  useLenis: () => {},
}));

import Index from "./Index";

describe("Index anchors", () => {
  it("exposes each navigation anchor exactly once (un chrome = un anchor)", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const ids = [
      "projects",
      "ai-workbench",
      "contributions",
      "formacion",
      "sidequests",
      "stats",
      "contact",
    ];
    ids.forEach((id) => {
      expect(
        container.querySelectorAll(`#${CSS.escape(id)}`).length,
        `anchor #${id} must appear exactly once`,
      ).toBe(1);
    });
  });
});
