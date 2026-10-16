import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionDivider } from "./SectionDivider";

describe("SectionDivider", () => {
  it("renders folio with index and label", () => {
    render(<SectionDivider index={2} total={9} label="Proyectos" />);
    expect(screen.getByRole("separator")).toHaveTextContent("02 / 09");
    expect(screen.getByRole("separator")).toHaveTextContent("proyectos");
  });
});
