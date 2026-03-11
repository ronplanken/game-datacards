import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CustomEnhancementCard } from "../CustomEnhancementCard";

const enhancementCardTypeDef = {
  key: "warlord-trait",
  label: "Warlord Trait",
  baseType: "enhancement",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "cost", label: "Cost", type: "string", required: true },
      { key: "description", label: "Description", type: "richtext", required: true },
    ],
    keywords: {
      label: "Keywords",
      allowMultiple: true,
      fields: [{ key: "keyword", label: "Keyword", type: "string", required: true }],
    },
  },
};

const makeCard = (overrides = {}) => ({
  name: "Iron Will",
  cost: "25pts",
  description: "This model gains +1 Toughness.",
  detachment: "Strike Force",
  keywords: [{ keyword: "Infantry" }, { keyword: "Character" }],
  ...overrides,
});

describe("CustomEnhancementCard", () => {
  it("renders with correct test id", () => {
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("custom-enhancement-card")).toBeInTheDocument();
  });

  it("displays card name in header", () => {
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Iron Will")).toBeInTheDocument();
  });

  it("displays detachment in type area", () => {
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Strike Force")).toBeInTheDocument();
  });

  it("displays description field", () => {
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("This model gains +1 Toughness.")).toBeInTheDocument();
  });

  it("displays cost in container", () => {
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("25pts")).toBeInTheDocument();
  });

  it("renders keywords collection", () => {
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Infantry, Character")).toBeInTheDocument();
  });

  it("shows fallback name when card has no name", () => {
    render(<CustomEnhancementCard card={{}} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Untitled Enhancement")).toBeInTheDocument();
  });

  it("applies card style CSS variables", () => {
    const cardStyle = { "--header-colour": "#cc0000", "--banner-colour": "#dd0000" };
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={cardStyle} />);
    const card = screen.getByTestId("custom-enhancement-card");
    expect(card.style.getPropertyValue("--header-colour")).toBe("#cc0000");
  });

  it("hides cost container when no cost value", () => {
    const card = makeCard({ cost: "" });
    const { container } = render(
      <CustomEnhancementCard card={card} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />,
    );
    expect(container.querySelector(".cost-container")).not.toBeInTheDocument();
  });

  it("hides keywords when no keywords data", () => {
    const card = makeCard({ keywords: [] });
    render(<CustomEnhancementCard card={card} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    expect(screen.queryByText("Keywords:")).not.toBeInTheDocument();
  });

  it("renders with border and decorative elements", () => {
    const { container } = render(
      <CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />,
    );
    expect(container.querySelector(".border")).toBeInTheDocument();
    expect(container.querySelector(".background-side-bar")).toBeInTheDocument();
    expect(container.querySelector(".background-header-bar")).toBeInTheDocument();
  });

  it("sets default --width and --height CSS variables", () => {
    render(<CustomEnhancementCard card={makeCard()} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    const card = screen.getByTestId("custom-enhancement-card");
    expect(card.style.getPropertyValue("--width")).toBe("260px");
    expect(card.style.getPropertyValue("--height")).toBe("458px");
  });

  it("respects card.styling overrides for width and height", () => {
    const card = makeCard({ styling: { width: 300, height: 500 } });
    render(<CustomEnhancementCard card={card} cardTypeDef={enhancementCardTypeDef} cardStyle={{}} />);
    const el = screen.getByTestId("custom-enhancement-card");
    expect(el.style.getPropertyValue("--width")).toBe("300px");
    expect(el.style.getPropertyValue("--height")).toBe("500px");
  });
});
