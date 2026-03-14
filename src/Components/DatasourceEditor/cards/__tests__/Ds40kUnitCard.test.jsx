import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Ds40kUnitCard } from "../Ds40kUnitCard";

vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

vi.mock("../../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({
    getImageUrl: vi.fn(),
    getFactionSymbolUrl: vi.fn(),
    isReady: false,
  }),
}));

// Mock antd
vi.mock("antd", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Popover: ({ children }) => <>{children}</>,
  Grid: { useBreakpoint: () => ({}) },
}));

const cardTypeDef = {
  key: "unit",
  baseType: "unit",
  schema: {
    stats: {
      label: "Stats",
      fields: [
        { key: "m", label: "M", displayOrder: 0 },
        { key: "t", label: "T", displayOrder: 1 },
        { key: "sv", label: "SV", displayOrder: 2 },
      ],
    },
    weaponTypes: {
      label: "Weapons",
      types: [],
    },
    abilities: {
      label: "Abilities",
      categories: [],
    },
    metadata: {
      hasKeywords: true,
      hasFactionKeywords: true,
    },
  },
};

describe("Ds40kUnitCard", () => {
  it("wraps output in .data-40k-10e scope class", () => {
    const card = { name: "Space Marine", stats: [], abilities: [] };
    const { container } = render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".data-40k-10e")).toBeTruthy();
  });

  it("renders with native unit CSS classes", () => {
    const card = { name: "Space Marine", stats: [], abilities: [] };
    const { container } = render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".unit-card-front-wrapper")).toBeTruthy();
    expect(container.querySelector(".unit.front")).toBeTruthy();
  });

  it("renders unit name", () => {
    const card = { name: "Intercessors", stats: [], abilities: [] };
    render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Intercessors")).toBeTruthy();
  });

  it("renders schema-driven stat headers", () => {
    const card = {
      name: "Unit",
      stats: [{ active: true, m: '6"', t: "4", sv: "3+" }],
      abilities: [],
    };
    render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("M")).toBeTruthy();
    expect(screen.getByText("T")).toBeTruthy();
    expect(screen.getByText("SV")).toBeTruthy();
  });

  it("renders stat values", () => {
    const card = {
      name: "Unit",
      stats: [{ active: true, m: '6"', t: "4", sv: "3+" }],
      abilities: [],
    };
    render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText('6"')).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("3+")).toBeTruthy();
  });

  it("renders keywords when schema enables them", () => {
    const card = {
      name: "Unit",
      stats: [],
      abilities: [],
      keywords: ["Infantry", "Imperium"],
    };
    render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("keywords")).toBeTruthy();
  });

  it("renders faction keywords when schema enables them", () => {
    const card = {
      name: "Unit",
      stats: [],
      abilities: [],
      factions: ["Adeptus Astartes"],
    };
    render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("faction keywords")).toBeTruthy();
    expect(screen.getByText("Adeptus Astartes")).toBeTruthy();
  });

  it("has data-testid for testing", () => {
    const card = { name: "Test", stats: [], abilities: [] };
    render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("ds-40k-unit")).toBeTruthy();
  });

  it("adds viewer class to wrapper when isMobile is true", () => {
    const card = { name: "Mobile Unit", stats: [], abilities: [] };
    const { container } = render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} isMobile />);
    expect(container.querySelector(".unit-card-front-wrapper.viewer")).toBeTruthy();
  });

  it("does not add viewer class when isMobile is false", () => {
    const card = { name: "Desktop Unit", stats: [], abilities: [] };
    const { container } = render(
      <Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} isMobile={false} />,
    );
    const wrapper = container.querySelector(".unit-card-front-wrapper");
    expect(wrapper).toBeTruthy();
    expect(wrapper.classList.contains("viewer")).toBe(false);
  });

  it("always has ds-unit class on wrapper", () => {
    const card = { name: "DS Unit", stats: [], abilities: [] };
    const { container } = render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(container.querySelector(".unit-card-front-wrapper.ds-unit")).toBeTruthy();
  });

  it("has both ds-unit and viewer classes when isMobile is true", () => {
    const card = { name: "Mobile DS Unit", stats: [], abilities: [] };
    const { container } = render(<Ds40kUnitCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} isMobile />);
    expect(container.querySelector(".unit-card-front-wrapper.ds-unit.viewer")).toBeTruthy();
  });
});
