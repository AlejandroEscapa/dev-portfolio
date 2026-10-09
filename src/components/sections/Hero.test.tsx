import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BOOTED_EVENT } from "@/lib/boot-state";
import { Hero } from "./Hero";

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(),
}));

const renderHero = () =>
  render(
    <LanguageProvider>
      <Hero />
    </LanguageProvider>,
  );

const ctaRow = () =>
  screen.getByRole("button", { name: /view my projects|ver mis proyectos/i }).parentElement;

/** DecryptedText renders the readable text inside a .sr-only span. */
const titleIsDecrypted = () => !!document.querySelector("h1 .sr-only");

describe("Hero post-boot choreography", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the plain title and hides the CTAs while the boot is pending", () => {
    renderHero();

    expect(screen.getByText("Alejandro")).toBeInTheDocument();
    expect(titleIsDecrypted()).toBe(false);
    expect(ctaRow()).toHaveStyle({ opacity: "0" });
  });

  it("swaps to the decrypting title and shows the CTAs when the boot ends", async () => {
    renderHero();

    act(() => {
      window.dispatchEvent(new CustomEvent(BOOTED_EVENT));
    });

    expect(titleIsDecrypted()).toBe(true);
    await waitFor(() => expect(ctaRow()).not.toHaveStyle({ opacity: "0" }));
  });

  it("starts already booted for a returning visitor (no event involved)", () => {
    localStorage.setItem("portfolio-booted", "1");

    renderHero();

    expect(titleIsDecrypted()).toBe(true);
  });

  it("renders static visible content under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    renderHero();

    expect(titleIsDecrypted()).toBe(false);
    expect(ctaRow()).not.toHaveStyle({ opacity: "0" });
  });
});
