import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionDivider } from "./SectionDivider";

describe("SectionDivider", () => {
  it("renders a single rule with the section label as aria-label", () => {
    render(<SectionDivider index={2} total={9} label="Proyectos" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-label", "Proyectos");
    expect(sep).toHaveClass("section-y");
    expect(sep.querySelector(".rule-single")).toBeInTheDocument();
  });

  it("renders a single rule shape regardless of index/folio numbers", () => {
    const a = render(<SectionDivider index={1} total={9} label="Proyectos" />);
    const b = render(<SectionDivider index={5} total={9} label="Contacto" />);
    const ruleA = a.container.querySelector(".rule-single");
    const ruleB = b.container.querySelector(".rule-single");
    expect(ruleA).not.toBe(ruleB);
    expect(ruleA?.textContent).toBe("");
    expect(ruleB?.textContent).toBe("");
  });

  it("renders a numbered folio when showFolio is set", () => {
    render(<SectionDivider index={2} total={9} label="Proyectos" showFolio />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-label", "02 / 09 · Proyectos");
    const folio = sep.querySelector("p.folio");
    expect(folio).toBeInTheDocument();
    expect(folio?.textContent).toContain("02");
    expect(folio?.textContent).toContain("09");
    expect(sep.querySelector(".rule-double")).toBeInTheDocument();
  });

  it("renders a single rule rather than a folio when showFolio is false", () => {
    render(<SectionDivider index={2} total={9} label="Proyectos" />);
    const sep = screen.getByRole("separator");
    expect(sep.querySelector(".rule-single")).toBeInTheDocument();
    expect(sep.querySelector(".folio")).not.toBeInTheDocument();
  });
});

