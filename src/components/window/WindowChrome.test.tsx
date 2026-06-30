import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WindowChrome } from "./WindowChrome";

describe("WindowChrome", () => {
  it("renders traffic lights and title", () => {
    render(
      <WindowChrome title="~/projects" id="projects">
        <p>content</p>
      </WindowChrome>
    );
    expect(screen.getByText("~/projects")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders all three traffic light buttons", () => {
    const { container } = render(
      <WindowChrome title="x" id="x">y</WindowChrome>
    );
    const lights = container.querySelectorAll("[data-traffic-light]");
    expect(lights).toHaveLength(3);
  });
});
