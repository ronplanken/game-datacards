import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CustomRuleCard } from "../CustomRuleCard";

const ruleCardTypeDef = {
  key: "battle-rules",
  label: "Battle Rules",
  baseType: "rule",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "ruleType", label: "Rule Type", type: "string", required: true },
      { key: "description", label: "Description", type: "richtext", required: false },
    ],
    rules: {
      label: "Rules",
      allowMultiple: true,
      fields: [
        { key: "title", label: "Title", type: "string", required: true },
        { key: "description", label: "Description", type: "richtext", required: true },
      ],
    },
  },
};

const makeCard = (overrides = {}) => ({
  name: "Core Rules",
  ruleType: "Army Rule",
  description: "These rules apply to all units.",
  rules: [
    { title: "Command Phase", description: "Roll for command points.", active: true },
    { title: "Movement Phase", description: "Move your units.", active: true },
  ],
  ...overrides,
});

describe("CustomRuleCard", () => {
  it("renders with correct test id", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("custom-rule-card")).toBeInTheDocument();
  });

  it("displays card name in header", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Core Rules")).toBeInTheDocument();
  });

  it("displays rule type", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Army Rule")).toBeInTheDocument();
  });

  it("displays description field", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("These rules apply to all units.")).toBeInTheDocument();
  });

  it("renders nested rules collection", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Rules")).toBeInTheDocument();
    expect(screen.getByText("Command Phase")).toBeInTheDocument();
    expect(screen.getByText("Roll for command points.")).toBeInTheDocument();
    expect(screen.getByText("Movement Phase")).toBeInTheDocument();
  });

  it("filters out inactive rules", () => {
    const card = makeCard({
      rules: [
        { title: "Active Rule", description: "Visible", active: true },
        { title: "Inactive Rule", description: "Hidden", active: false },
      ],
    });
    render(<CustomRuleCard card={card} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Active Rule")).toBeInTheDocument();
    expect(screen.queryByText("Inactive Rule")).not.toBeInTheDocument();
  });

  it("shows fallback name when card has no name", () => {
    render(<CustomRuleCard card={{ rules: [] }} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Untitled Rule")).toBeInTheDocument();
  });

  it("applies card style CSS variables", () => {
    const cardStyle = { "--header-colour": "#aa0000", "--banner-colour": "#bb0000" };
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={cardStyle} />);
    const card = screen.getByTestId("custom-rule-card");
    expect(card.style.getPropertyValue("--header-colour")).toBe("#aa0000");
  });

  it("hides rules section when no rules data", () => {
    const card = makeCard({ rules: [] });
    render(<CustomRuleCard card={card} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(screen.queryByText("Rules")).not.toBeInTheDocument();
  });

  it("renders with border and decorative elements", () => {
    const { container } = render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".border")).toBeInTheDocument();
    expect(container.querySelector(".background-side-bar")).toBeInTheDocument();
    expect(container.querySelector(".background-header-bar")).toBeInTheDocument();
  });

  it("sets default --width and --height CSS variables", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    const card = screen.getByTestId("custom-rule-card");
    expect(card.style.getPropertyValue("--width")).toBe("458px");
    expect(card.style.getPropertyValue("--height")).toBe("auto");
  });

  it("respects card.styling overrides for width and height", () => {
    const card = makeCard({ styling: { width: 500, height: 600, autoHeight: false } });
    render(<CustomRuleCard card={card} cardTypeDef={ruleCardTypeDef} cardStyle={{}} />);
    const el = screen.getByTestId("custom-rule-card");
    expect(el.style.getPropertyValue("--width")).toBe("500px");
    expect(el.style.getPropertyValue("--height")).toBe("600px");
  });

  it("adds custom-card-mobile class when isMobile is true", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} isMobile />);
    const card = screen.getByTestId("custom-rule-card");
    expect(card.classList.contains("custom-card-mobile")).toBe(true);
  });

  it("does not add custom-card-mobile class when isMobile is false", () => {
    render(<CustomRuleCard card={makeCard()} cardTypeDef={ruleCardTypeDef} cardStyle={{}} isMobile={false} />);
    const card = screen.getByTestId("custom-rule-card");
    expect(card.classList.contains("custom-card-mobile")).toBe(false);
  });
});
