import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/context/LanguageContext";
import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const captureLayoutId = (Tag: "div" | "h2" | "h3") =>
    function MotionElement({ layoutId, children, ...props }: React.PropsWithChildren<{ layoutId?: string; className?: string }>) {
      return React.createElement(Tag, { ...props, "data-layout-id": layoutId }, children);
    };

  return {
    motion: {
      div: captureLayoutId("div"),
      h2: captureLayoutId("h2"),
      h3: captureLayoutId("h3"),
    },
  };
});

const renderCard = (enableSharedLayout: boolean) =>
  render(
    <LanguageProvider>
      <ProjectCard
        project={projects[0]}
        position={3}
        isActive
        onSelect={() => {}}
        enableSharedLayout={enableSharedLayout}
      />
    </LanguageProvider>,
  );

const renderDetail = (enableSharedLayout: boolean) =>
  render(
    <LanguageProvider>
      <ProjectDetail
        project={projects[0]}
        isExiting={false}
        onBack={() => {}}
        enableSharedLayout={enableSharedLayout}
      />
    </LanguageProvider>,
  );

describe("Project shared elements", () => {
  it("assigns per-project layout identities to media and title on the desktop card", () => {
    renderCard(true);

    expect(document.querySelector('[data-layout-id="proj-media-gamevision"]')).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GameVision" })).toHaveAttribute(
      "data-layout-id",
      "proj-title-gamevision",
    );
  });

  it("uses the same media and title identities in the selected detail", () => {
    renderDetail(true);

    expect(document.querySelector('[data-layout-id="proj-media-gamevision"]')).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GameVision" })).toHaveAttribute(
      "data-layout-id",
      "proj-title-gamevision",
    );
  });

  it("leaves shared layout disabled when using the CSS fallback", () => {
    const { unmount } = renderCard(false);
    expect(document.querySelectorAll("[data-layout-id]")).toHaveLength(0);
    unmount();

    renderDetail(false);
    expect(document.querySelectorAll("[data-layout-id]")).toHaveLength(0);
  });
});
