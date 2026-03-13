import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Ds40kRuleCard } from "../Ds40kRuleCard";

vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

vi.mock("../../../MarkdownDisplay", () => ({
  MarkdownDisplay: ({ content }) => <div>{content}</div>,
}));

vi.mock("../../../Icons/FactionIcon", () => ({
  FactionIcon: ({ factionId }) => <span data-testid={`faction-icon-${factionId}`} />,
}));

const cardTypeDef = {
  key: "rule",
  baseType: "rule",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "ruleType", label: "Rule Type", type: "string" },
      { key: "detachment", label: "Detachment", type: "string" },
    ],
  },
};

describe("Ds40kRuleCard", () => {
  it("wraps output in .data-40k-10e scope class", () => {
    const card = { name: "Core Rules" };
    const { container } = render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".data-40k-10e")).toBeTruthy();
  });

  it("renders with native rule-card CSS class", () => {
    const card = { name: "Core Rules" };
    const { container } = render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".rule-card")).toBeTruthy();
  });

  it("renders name from schema field", () => {
    const card = { name: "Oath of Moment" };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Oath of Moment")).toBeTruthy();
  });

  it("renders Army Rule label for army ruleType", () => {
    const card = { name: "Oath of Moment", ruleType: "army" };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Army Rule")).toBeTruthy();
  });

  it("renders Detachment Rule label with detachment name", () => {
    const card = { name: "Combat Doctrine", ruleType: "detachment", detachment: "Gladius" };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Detachment Rule - Gladius")).toBeTruthy();
  });

  it("renders rules in name-description format", () => {
    const card = {
      name: "Rule",
      rules: [
        { title: "Rule Header", description: "Some rule text", format: "name-description", active: true },
        { title: "Section Header", format: "name-only", active: true },
      ],
    };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Some rule text")).toBeTruthy();
    expect(screen.getByText("Section Header")).toBeTruthy();
  });

  it("renders faction icon", () => {
    const card = { name: "Rule", faction_id: "SM" };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("faction-icon-SM")).toBeTruthy();
  });

  it("has data-testid for testing", () => {
    const card = { name: "Test" };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("ds-40k-rule")).toBeTruthy();
  });

  it("renders rules in datasource schema format (name-description)", () => {
    const card = {
      name: "Rule",
      rules: [{ title: "Oath of Moment", description: "Re-roll hits", format: "name-description", active: true }],
    };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Oath of Moment")).toBeTruthy();
    expect(screen.getByText("Re-roll hits")).toBeTruthy();
  });

  it("renders rules in datasource schema format (name-only)", () => {
    const card = {
      name: "Rule",
      rules: [{ title: "Header Only", format: "name-only", active: true }],
    };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Header Only")).toBeTruthy();
  });

  it("renders rules in datasource schema format (table/accordion)", () => {
    const card = {
      name: "Rule",
      rules: [{ title: "Accordion Title", description: "Accordion body", format: "table", active: true }],
    };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Accordion Title")).toBeTruthy();
    expect(screen.getByText("Accordion body")).toBeTruthy();
  });

  it("filters out active: false rules in schema format", () => {
    const card = {
      name: "Rule",
      rules: [
        { title: "Visible", description: "Show this", format: "name-description", active: true },
        { title: "Hidden", description: "Hide this", format: "name-description", active: false },
      ],
    };
    render(<Ds40kRuleCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Visible")).toBeTruthy();
    expect(screen.queryByText("Hidden")).toBeNull();
  });
});
