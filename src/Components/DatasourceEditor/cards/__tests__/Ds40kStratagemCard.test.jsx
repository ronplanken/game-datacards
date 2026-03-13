import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Ds40kStratagemCard } from "../Ds40kStratagemCard";

vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

vi.mock("../../../MarkdownSpanWrapDisplay", () => ({
  MarkdownSpanWrapDisplay: ({ content }) => <span>{content}</span>,
}));

vi.mock("../../../Icons/PhaseIcon", () => ({
  PhaseIcon: ({ phase }) => <span data-testid={`phase-${phase}`} />,
}));

const cardTypeDef = {
  key: "stratagem",
  baseType: "stratagem",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "cost", label: "Cost", type: "string" },
      { key: "type", label: "Type", type: "string" },
      { key: "detachment", label: "Detachment", type: "string" },
      { key: "when", label: "When", type: "richtext" },
      { key: "target", label: "Target", type: "richtext" },
      { key: "effect", label: "Effect", type: "richtext" },
    ],
  },
};

describe("Ds40kStratagemCard", () => {
  it("wraps output in .data-40k-10e scope class", () => {
    const card = { name: "Test Stratagem", cost: "1 CP" };
    const { container } = render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".data-40k-10e")).toBeTruthy();
  });

  it("renders with native stratagem CSS class", () => {
    const card = { name: "Test Stratagem", cost: "1 CP", turn: "your" };
    const { container } = render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".stratagem")).toBeTruthy();
    expect(container.querySelector(".stratagem.own")).toBeTruthy();
  });

  it("applies opponents turn class", () => {
    const card = { name: "Counter", turn: "opponents" };
    const { container } = render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".stratagem.other")).toBeTruthy();
  });

  it("applies either turn class", () => {
    const card = { name: "React", turn: "either" };
    const { container } = render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".stratagem.either")).toBeTruthy();
  });

  it("renders name from schema field", () => {
    const card = { name: "Overwatch" };
    render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Overwatch")).toBeTruthy();
  });

  it("renders content fields with labels", () => {
    const card = { name: "Strike", when: "Your shooting phase", effect: "Re-roll hits" };
    render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("When:")).toBeTruthy();
    expect(screen.getByText("Your shooting phase")).toBeTruthy();
    expect(screen.getByText("Effect:")).toBeTruthy();
    expect(screen.getByText("Re-roll hits")).toBeTruthy();
  });

  it("renders cost value", () => {
    const card = { name: "Strike", cost: "2 CP" };
    render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("2 CP")).toBeTruthy();
  });

  it("renders phase icon from schema enum (single string)", () => {
    const card = { name: "Strike", phase: "shooting" };
    render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("phase-shooting")).toBeTruthy();
  });

  it("renders phase icons from array format", () => {
    const card = { name: "Strike", phase: ["shooting", "fight"] };
    render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("phase-shooting")).toBeTruthy();
    expect(screen.getByTestId("phase-fight")).toBeTruthy();
  });

  it("does not render phase as content field", () => {
    const card = { name: "Strike", phase: "shooting", description: "Some effect" };
    const { container } = render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    const sections = container.querySelectorAll(".section");
    const labels = Array.from(sections).map((s) => s.querySelector(".title")?.textContent);
    expect(labels).not.toContain("Phase:");
  });

  it("renders type and detachment combined", () => {
    const card = { name: "Strike", type: "Battle Tactic", detachment: "Gladius" };
    render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Gladius - Battle Tactic")).toBeTruthy();
  });

  it("has data-testid for testing", () => {
    const card = { name: "Test" };
    render(<Ds40kStratagemCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("ds-40k-stratagem")).toBeTruthy();
  });
});
