import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MockHeaderBar } from "../MockHeaderBar";
import { MockTreeRow } from "../MockTreeRow";
import { MockConflictDialog } from "../MockConflictDialog";

describe("MockHeaderBar", () => {
  it("renders without crashing", () => {
    const { container } = render(<MockHeaderBar highlight="sync" />);
    expect(container.querySelector(".mock-header-bar")).toBeInTheDocument();
  });

  it("renders the title text", () => {
    render(<MockHeaderBar highlight="sync" />);
    expect(screen.getByText("Game Datacards")).toBeInTheDocument();
  });

  it("highlights the cloud icon with tooltip when highlight is sync", () => {
    const { container } = render(<MockHeaderBar highlight="sync" />);
    expect(container.querySelector(".mock-header-icon-btn--highlight")).toBeInTheDocument();
    const tooltip = container.querySelector(".mock-header-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Sync Status");
  });

  it("highlights the sign-in button with tooltip when highlight is account", () => {
    const { container } = render(<MockHeaderBar highlight="account" />);
    expect(container.querySelector(".mock-header-signin--highlight")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    const tooltip = container.querySelector(".mock-header-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Account");
  });

  it("renders in compact mode", () => {
    const { container } = render(<MockHeaderBar highlight="sync" compact />);
    expect(container.querySelector(".mock--compact")).toBeInTheDocument();
  });
});

describe("MockTreeRow", () => {
  it("renders without crashing", () => {
    const { container } = render(<MockTreeRow />);
    expect(container.querySelector(".mock-tree-row")).toBeInTheDocument();
  });

  it("renders the category name", () => {
    render(<MockTreeRow />);
    expect(screen.getByText("My Army")).toBeInTheDocument();
  });

  it("renders cloud icon with highlight", () => {
    const { container } = render(<MockTreeRow />);
    expect(container.querySelector(".mock-tree-sync--highlight")).toBeInTheDocument();
  });

  it("renders tooltip with arrow pointing to the cloud icon", () => {
    const { container } = render(<MockTreeRow />);
    const tooltip = container.querySelector(".mock-tree-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Tap to sync");
  });

  it("renders in compact mode", () => {
    const { container } = render(<MockTreeRow compact />);
    expect(container.querySelector(".mock--compact")).toBeInTheDocument();
  });
});

describe("MockConflictDialog", () => {
  it("renders without crashing", () => {
    const { container } = render(<MockConflictDialog />);
    expect(container.querySelector(".mock-conflict-dialog")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<MockConflictDialog />);
    expect(screen.getByText("Sync Conflict")).toBeInTheDocument();
  });

  it("renders the body text", () => {
    render(<MockConflictDialog />);
    expect(screen.getByText("Changes detected on another device")).toBeInTheDocument();
  });

  it("renders all three resolution buttons", () => {
    render(<MockConflictDialog />);
    expect(screen.getByText("Keep Local")).toBeInTheDocument();
    expect(screen.getByText("Keep Cloud")).toBeInTheDocument();
    expect(screen.getByText("Keep Both")).toBeInTheDocument();
  });

  it("renders in compact mode", () => {
    const { container } = render(<MockConflictDialog compact />);
    expect(container.querySelector(".mock--compact")).toBeInTheDocument();
  });
});
