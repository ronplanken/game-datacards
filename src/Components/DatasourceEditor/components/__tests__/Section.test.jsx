import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Settings } from "lucide-react";
import { Section } from "../Section";

describe("Section", () => {
  it("renders title text", () => {
    render(<Section title="Test Section">Content</Section>);
    expect(screen.getByText("Test Section")).toBeInTheDocument();
  });

  it("renders children when defaultOpen is true (default)", () => {
    render(<Section title="Open Section">Visible content</Section>);
    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });

  it("hides children when defaultOpen is false", () => {
    render(
      <Section title="Closed Section" defaultOpen={false}>
        Hidden content
      </Section>,
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("toggles content visibility on header click", () => {
    render(<Section title="Toggle Section">Toggle content</Section>);

    expect(screen.getByText("Toggle content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Toggle content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Toggle content")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <Section title="With Icon" icon={Settings}>
        Content
      </Section>,
    );
    expect(container.querySelector(".props-section-icon")).toBeInTheDocument();
  });

  it("does not render icon element when icon is not provided", () => {
    const { container } = render(<Section title="No Icon">Content</Section>);
    expect(container.querySelector(".props-section-icon")).not.toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    const { container } = render(<Section title="CSS Test">Content</Section>);

    expect(container.querySelector(".props-section")).toBeInTheDocument();
    expect(container.querySelector(".props-section-header")).toBeInTheDocument();
    expect(container.querySelector(".props-section-title")).toBeInTheDocument();
    expect(container.querySelector(".props-section-content")).toBeInTheDocument();
  });

  it("removes props-section-content when collapsed", () => {
    const { container } = render(<Section title="Collapse Test">Content</Section>);

    fireEvent.click(screen.getByRole("button"));
    expect(container.querySelector(".props-section-content")).not.toBeInTheDocument();
  });
});
