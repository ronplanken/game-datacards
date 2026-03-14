import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CustomStratagemCard } from "../CustomStratagemCard";

const stratagemCardTypeDef = {
  key: "battle-tactic",
  label: "Battle Tactic",
  baseType: "stratagem",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string", required: true },
      { key: "cost", label: "Cost", type: "string", required: true },
      {
        key: "phase",
        label: "Phase",
        type: "enum",
        required: true,
        options: ["command", "movement", "shooting", "charge", "fight", "any"],
      },
      { key: "type", label: "Stratagem Type", type: "string", required: true },
      { key: "description", label: "Description", type: "richtext", required: true },
    ],
  },
};

const makeCard = (overrides = {}) => ({
  name: "Overwatch",
  cost: "1 CP",
  phase: "shooting",
  type: "Battle Tactic",
  description: "Fire at an approaching enemy unit.",
  turn: "your",
  ...overrides,
});

describe("CustomStratagemCard", () => {
  it("renders with correct test id", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("custom-stratagem-card")).toBeInTheDocument();
  });

  it("displays card name in header", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Overwatch")).toBeInTheDocument();
  });

  it("displays type in type area", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Battle Tactic")).toBeInTheDocument();
  });

  it("displays content fields (phase, description)", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("shooting")).toBeInTheDocument();
    expect(screen.getByText("Fire at an approaching enemy unit.")).toBeInTheDocument();
  });

  it("displays CP cost in container", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("1 CP")).toBeInTheDocument();
  });

  it("shows fallback name when card has no name", () => {
    render(<CustomStratagemCard card={{}} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Untitled Stratagem")).toBeInTheDocument();
  });

  it("applies card style CSS variables", () => {
    const cardStyle = { "--header-colour": "#ee0000", "--banner-colour": "#ff0000" };
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={cardStyle} />);
    const card = screen.getByTestId("custom-stratagem-card");
    expect(card.style.getPropertyValue("--header-colour")).toBe("#ee0000");
  });

  it("applies own turn class by default", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    const card = screen.getByTestId("custom-stratagem-card");
    expect(card.classList.contains("own")).toBe(true);
  });

  it("applies other turn class for opponent stratagems", () => {
    const card = makeCard({ turn: "opponents" });
    render(<CustomStratagemCard card={card} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    const cardEl = screen.getByTestId("custom-stratagem-card");
    expect(cardEl.classList.contains("other")).toBe(true);
  });

  it("applies either turn class for either-turn stratagems", () => {
    const card = makeCard({ turn: "either" });
    render(<CustomStratagemCard card={card} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    const cardEl = screen.getByTestId("custom-stratagem-card");
    expect(cardEl.classList.contains("either")).toBe(true);
  });

  it("hides CP container when no cost", () => {
    const card = makeCard({ cost: "" });
    const { container } = render(<CustomStratagemCard card={card} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".cp-container")).not.toBeInTheDocument();
  });

  it("renders with border and decorative elements", () => {
    const { container } = render(
      <CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />,
    );
    expect(container.querySelector(".border")).toBeInTheDocument();
    expect(container.querySelector(".background-side-bar")).toBeInTheDocument();
    expect(container.querySelector(".background-header-bar")).toBeInTheDocument();
  });

  it("sets default --width and --height CSS variables", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    const card = screen.getByTestId("custom-stratagem-card");
    expect(card.style.getPropertyValue("--width")).toBe("260px");
    expect(card.style.getPropertyValue("--height")).toBe("458px");
  });

  it("respects card.styling overrides for width and height", () => {
    const card = makeCard({ styling: { width: 300, height: 500 } });
    render(<CustomStratagemCard card={card} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} />);
    const el = screen.getByTestId("custom-stratagem-card");
    expect(el.style.getPropertyValue("--width")).toBe("300px");
    expect(el.style.getPropertyValue("--height")).toBe("500px");
  });

  it("adds custom-card-mobile class when isMobile is true", () => {
    render(<CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} isMobile />);
    const card = screen.getByTestId("custom-stratagem-card");
    expect(card.classList.contains("custom-card-mobile")).toBe(true);
  });

  it("does not add custom-card-mobile class when isMobile is false", () => {
    render(
      <CustomStratagemCard card={makeCard()} cardTypeDef={stratagemCardTypeDef} cardStyle={{}} isMobile={false} />,
    );
    const card = screen.getByTestId("custom-stratagem-card");
    expect(card.classList.contains("custom-card-mobile")).toBe(false);
  });
});
