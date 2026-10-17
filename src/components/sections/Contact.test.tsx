import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";

// El toast real arrastra next-themes + sonner: no aporta nada a este montaje.
vi.mock("@/components/ui/sonner", () => ({ toast: vi.fn() }));

import { Contact } from "./Contact";

describe("Contact", () => {
  it("monta el formulario diferido con sus tres campos", async () => {
    render(
      <LanguageProvider>
        <Contact />
      </LanguageProvider>,
    );

    expect(await screen.findByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
  });
});
