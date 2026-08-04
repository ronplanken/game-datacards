import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MiddlePanel } from "../MiddlePanel";

// Stub the heavy sub-views so the switch logic is tested in isolation
// (CardView pulls in card-display components + ResizeObserver via useAutoFitScale).
vi.mock("../CardView", () => ({
  CardView: (props) => <div data-testid="card-view">{JSON.stringify(Object.keys(props))}</div>,
}));
vi.mock("../GlossaryView", () => ({
  GlossaryView: () => <div data-testid="glossary-view">glossary</div>,
}));

describe("MiddlePanel", () => {
  it("renders the card view by default", () => {
    render(<MiddlePanel view="card" activeCard={null} />);
    expect(screen.getByTestId("card-view")).toBeTruthy();
    expect(screen.queryByTestId("glossary-view")).toBeNull();
  });

  it("renders the glossary view when view is 'glossary'", () => {
    render(<MiddlePanel view="glossary" />);
    expect(screen.getByTestId("glossary-view")).toBeTruthy();
    expect(screen.queryByTestId("card-view")).toBeNull();
  });

  it("forwards card props to CardView", () => {
    render(<MiddlePanel view="card" activeCard={{ id: "x" }} dataSource={{ data: [] }} />);
    const node = screen.getByTestId("card-view");
    expect(node.textContent).toContain("activeCard");
    expect(node.textContent).toContain("dataSource");
  });
});
