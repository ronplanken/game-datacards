import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Ds40kEnhancementCard } from "../Ds40kEnhancementCard";

vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

vi.mock("../../../MarkdownSpanWrapDisplay", () => ({
  MarkdownSpanWrapDisplay: ({ content }) => <span>{content}</span>,
}));

const cardTypeDef = {
  key: "enhancement",
  baseType: "enhancement",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "cost", label: "Cost", type: "string" },
      { key: "detachment", label: "Detachment", type: "string" },
      { key: "description", label: "Description", type: "richtext" },
    ],
  },
};

describe("Ds40kEnhancementCard", () => {
  it("wraps output in .data-40k-10e scope class", () => {
    const card = { name: "Iron Will" };
    const { container } = render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".data-40k-10e")).toBeTruthy();
  });

  it("renders with native enhancement CSS class", () => {
    const card = { name: "Iron Will" };
    const { container } = render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".enhancement")).toBeTruthy();
  });

  it("renders name from schema field", () => {
    const card = { name: "Iron Will" };
    render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Iron Will")).toBeTruthy();
  });

  it("renders description content", () => {
    const card = { name: "Iron Will", description: "Add 1 to saves" };
    render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Add 1 to saves")).toBeTruthy();
  });

  it("renders cost value", () => {
    const card = { name: "Iron Will", cost: "25 pts" };
    render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("25 pts")).toBeTruthy();
  });

  it("renders detachment in type area", () => {
    const card = { name: "Iron Will", detachment: "Gladius" };
    render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Gladius")).toBeTruthy();
  });

  it("has data-testid for testing", () => {
    const card = { name: "Test" };
    render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("ds-40k-enhancement")).toBeTruthy();
  });

  it("renders keywords from schema collection", () => {
    const card = {
      name: "Iron Will",
      keywords: [
        { keyword: "Infantry", active: true },
        { keyword: "Character", active: true },
      ],
    };
    render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Infantry, Character")).toBeTruthy();
  });

  it("filters out active: false keywords", () => {
    const card = {
      name: "Iron Will",
      keywords: [
        { keyword: "Infantry", active: true },
        { keyword: "Hidden", active: false },
      ],
    };
    render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Infantry")).toBeTruthy();
    expect(screen.queryByText(/Hidden/)).toBeNull();
  });

  it("does not render keywords section when empty", () => {
    const card = { name: "Iron Will", keywords: [] };
    const { container } = render(<Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".keywords")).toBeNull();
  });

  it("adds shared-enhancement class when isMobile is true", () => {
    const card = { name: "Mobile Enh" };
    const { container } = render(
      <Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} isMobile />,
    );
    expect(container.querySelector(".shared-enhancement")).toBeTruthy();
  });

  it("does not add shared-enhancement class when isMobile is false", () => {
    const card = { name: "Desktop Enh" };
    const { container } = render(
      <Ds40kEnhancementCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} isMobile={false} />,
    );
    expect(container.querySelector(".shared-enhancement")).toBeNull();
  });
});
