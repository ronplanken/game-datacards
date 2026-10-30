import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Ds40kUnitCard } from "../Ds40kUnitCard";

vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

vi.mock("../../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({ getImageUrl: vi.fn(), getFactionSymbolUrl: vi.fn(), isReady: false }),
}));

vi.mock("antd", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Popover: ({ children }) => <>{children}</>,
  Grid: { useBreakpoint: () => ({}) },
}));

const makeCardType = (hasBackSide) => ({
  key: "unit",
  baseType: "unit",
  schema: {
    stats: { label: "Stats", fields: [{ key: "m", label: "MOVE", displayOrder: 0 }] },
    weaponTypes: {
      label: "Weapons",
      types: [{ key: "melee", label: "Melee Weapons", columns: [] }],
    },
    abilities: {
      label: "Abilities",
      categories: [
        { key: "unit", label: "Unit", format: "name-description" },
        { key: "extra", label: "Extra", format: "name-description", side: "back" },
      ],
    },
    sections: {
      label: "Sections",
      sections: [
        { key: "loadout", label: "Loadout", format: "list", side: "back" },
        { key: "special", label: "Special Rules", format: "list" },
        { key: "lore", label: "Lore", format: "list", side: "back" },
      ],
    },
    metadata: { hasKeywords: true, hasFactionKeywords: true, hasBackSide },
  },
});

const card = {
  name: "Test Unit",
  stats: [{ m: '6"', active: true }],
  weapons: { melee: [{ profiles: [{ name: "Sword", active: true }] }] },
  sections: { loadout: ["Each model has a sword"], special: ["Stays in front"], lore: ["Old stories"] },
  abilities: {
    unit: [{ name: "Front Ability", description: "front text", showAbility: true, showDescription: true }],
    extra: [{ name: "Back Ability", description: "back text", showAbility: true, showDescription: true }],
    invul: { showInvulnerableSave: true, showAtTop: false, value: "4+", info: "" },
    damaged: { showDamagedAbility: true, showDescription: true, range: "1-5", description: "Damaged text" },
  },
  keywords: ["Infantry"],
  factions: ["Test"],
};

const renderCard = (props) => render(<Ds40kUnitCard card={card} {...props} />);

describe("Ds40kUnitCard back side", () => {
  it("renders every item on the front when the option is off", () => {
    const { container } = renderCard({ cardTypeDef: makeCardType(false) });
    ["Each model has a sword", "Stays in front", "Old stories", "Front Ability", "Back Ability"].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
    expect(container.querySelector(".unit-card-back-wrapper")).toBeNull();
  });

  it("renders the same markup when an off schema has no side values at all", () => {
    const stripped = makeCardType(undefined);
    stripped.schema.sections.sections.forEach((section) => delete section.side);
    stripped.schema.abilities.categories.forEach((category) => delete category.side);
    const { container: plain } = renderCard({ cardTypeDef: stripped });
    const { container: off } = renderCard({ cardTypeDef: makeCardType(false), side: "back" });
    expect(off.innerHTML).toBe(plain.innerHTML);
  });

  it("keeps back items off the front", () => {
    const { container } = renderCard({ cardTypeDef: makeCardType(true) });
    expect(screen.queryByText("Each model has a sword")).toBeNull();
    expect(screen.queryByText("Old stories")).toBeNull();
    expect(screen.queryByText("Back Ability")).toBeNull();
    expect(screen.getByText("Stays in front")).toBeInTheDocument();
    expect(screen.getByText("Front Ability")).toBeInTheDocument();
    expect(screen.getByText("Sword")).toBeInTheDocument();
    expect(container.querySelector(".unit.back")).toBeNull();
  });

  it("shows the name and only the back items on the back", () => {
    const { container } = renderCard({ cardTypeDef: makeCardType(true), side: "back" });
    expect(container.querySelector(".unit.front")).toBeNull();
    expect(container.querySelector(".unit.back .header.back")).toBeTruthy();
    expect(screen.getAllByText("Test Unit").length).toBeGreaterThan(0);
    expect(screen.getByText("Each model has a sword")).toBeInTheDocument();
    expect(screen.getByText("Old stories")).toBeInTheDocument();
    expect(screen.getByText("Back Ability")).toBeInTheDocument();
  });

  it("keeps stats, weapons, the invulnerable save and damaged off the back", () => {
    renderCard({ cardTypeDef: makeCardType(true), side: "back" });
    expect(screen.queryByText("MOVE")).toBeNull();
    expect(screen.queryByText("Sword")).toBeNull();
    expect(screen.queryByText("Front Ability")).toBeNull();
    expect(screen.queryByText("Stays in front")).toBeNull();
    expect(screen.queryByText("Damaged text")).toBeNull();
    expect(screen.queryByText("4+")).toBeNull();
  });

  it("renders both faces for frontAndBack", () => {
    const { container } = renderCard({ cardTypeDef: makeCardType(true), side: "frontAndBack" });
    expect(container.querySelector(".unit.front")).toBeTruthy();
    expect(container.querySelector(".unit.back")).toBeTruthy();
  });

  it("renders only the front for frontAndBack when the option is off", () => {
    const { container } = renderCard({ cardTypeDef: makeCardType(false), side: "frontAndBack" });
    expect(container.querySelector(".unit.front")).toBeTruthy();
    expect(container.querySelector(".unit.back")).toBeNull();
  });

  it("uses the same card size classes and keywords on the back", () => {
    const { container } = renderCard({ cardTypeDef: makeCardType(true), side: "back" });
    expect(container.querySelector(".unit-card-back-wrapper.ds-unit.gdc-datacard")).toBeTruthy();
    expect(screen.getByText("Infantry")).toBeInTheDocument();
  });
});
