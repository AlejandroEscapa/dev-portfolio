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
      // Anclas internas: certifications vive dentro del bloque IA,
      // education dentro de formación; ambas deben sobrevivir únicas.
      "certifications",
      "education",
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

  it("numbers all nine sheet sections in page order and gives each a heading", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </MemoryRouter>,
    );

    // La serie visible no puede tener huecos: 01..09 en el orden de la hoja.
    const sections: Array<[string, string]> = [
      ["about", "01 - Stack"],
      ["projects", "02 - Projects"],
      ["ai-workbench", "03 - AI workflow"],
      ["trayectoria", "04 - Journey"],
      ["contributions", "05 - Contributions"],
      ["formacion", "06 - Education"],
      ["sidequests", "07 - Side quests"],
      ["stats", "08 - Stats"],
      ["contact", "09 - Contact"],
    ];

    sections.forEach(([id, label]) => {
      const section = container.querySelector(`#${CSS.escape(id)}`);
      expect(section?.textContent, `#${id} must show its numerator`).toContain(label);
      expect(
        section?.querySelector("h2")?.textContent?.trim().length ?? 0,
        `#${id} must expose a visible h2`,
      ).toBeGreaterThan(0);
    });
  });

  it("links the navbar to every numbered section", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <Index />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const hrefs = [...container.querySelectorAll("nav a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([
      "#about",
      "#projects",
      "#ai-workbench",
      "#trayectoria",
      "#contributions",
      "#formacion",
      "#sidequests",
      "#stats",
      "#contact",
    ]);
  });
});
