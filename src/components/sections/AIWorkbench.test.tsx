import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";
import { AIWorkbench } from "./AIWorkbench";

describe("AIWorkbench", () => {
  beforeEach(() => localStorage.clear());

  it("renders the English workbench content (anchor owned by the Index chrome)", () => {
    render(
      <LanguageProvider>
        <AIWorkbench />
      </LanguageProvider>,
    );

    // The #ai-workbench anchor lives on the sheet section in
    // Index.tsx (hoja continua); the section itself carries no id.
    expect(screen.getByRole("heading", { level: 2, name: "AI in the loop, not at the wheel." })).toBeInTheDocument();
    expect(screen.getByText(/Cursor with MCP integrations/)).toBeInTheDocument();
    expect(screen.getByText(/inspect the diff/)).toBeInTheDocument();
  });

  it("renders the Spanish workbench when that locale is stored", () => {
    localStorage.setItem("portfolio-lang", "es");

    render(
      <LanguageProvider>
        <AIWorkbench />
      </LanguageProvider>,
    );

    expect(screen.getByRole("heading", { level: 2, name: "IA en el proceso, no al volante." })).toBeInTheDocument();
    expect(screen.getByText(/integraciones MCP/)).toBeInTheDocument();
    expect(screen.getByText(/inspecciono el diff/)).toBeInTheDocument();
  });
});
