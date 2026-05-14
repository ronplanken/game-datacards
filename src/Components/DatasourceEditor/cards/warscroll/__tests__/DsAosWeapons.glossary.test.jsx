import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DsAosWeapons } from "../DsAosWeapons";

vi.mock("../../../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <span data-tooltip-content={typeof content === "string" ? content : "rich"}>{children}</span>
  ),
}));

const weaponTypeDef = {
  key: "missile",
  label: "Missile Weapons",
  columns: [
    { key: "rng", label: "Rng" },
    { key: "atk", label: "Atk" },
  ],
};

const glossary = [
  {
    key: "crit",
    name: "Crit",
    description: "An unmodified hit roll of 6 scores a Critical Hit.",
    matchType: "exact",
    appliesTo: ["weapons"],
    displayMode: "explanation",
  },
  {
    key: "shoot-in-combat",
    name: "Shoot in Combat",
    description: "This weapon can be used while in combat.",
    matchType: "exact",
    appliesTo: ["weapons"],
    displayMode: "tooltip",
  },
];

const weaponsWith = (keywords) => [
  {
    name: "Bow",
    profiles: [{ name: "Bow", active: true, rng: "18", atk: "2", keywords }],
  },
];

describe("DsAosWeapons keyword glossary", () => {
  it("renders an explanation row for an explanation-mode keyword", () => {
    render(
      <DsAosWeapons
        weapons={weaponsWith(["Crit"])}
        weaponTypeDef={weaponTypeDef}
        grandAlliance="order"
        maxColumns={2}
        glossary={glossary}
      />,
    );
    expect(screen.getByTestId("ds-kw-explanations")).toBeInTheDocument();
    expect(screen.getByText("Crit")).toBeInTheDocument();
    expect(screen.getByText(/scores a Critical Hit/i)).toBeInTheDocument();
  });

  it("renders a hover tooltip and no explanation row for a tooltip-mode keyword", () => {
    const { container } = render(
      <DsAosWeapons
        weapons={weaponsWith(["Shoot in Combat"])}
        weaponTypeDef={weaponTypeDef}
        grandAlliance="order"
        maxColumns={2}
        glossary={glossary}
      />,
    );
    expect(screen.queryByTestId("ds-kw-explanations")).toBeNull();
    const trigger = container.querySelector("[data-tooltip-content]");
    expect(trigger.getAttribute("data-tooltip-content")).toMatch(/used while in combat/i);
    expect(trigger.querySelector(".ds-kw-tag--has-info")).toBeTruthy();
  });

  it("falls back to plain badges when no glossary is supplied", () => {
    const { container } = render(
      <DsAosWeapons
        weapons={weaponsWith(["Crit"])}
        weaponTypeDef={weaponTypeDef}
        grandAlliance="order"
        maxColumns={2}
      />,
    );
    expect(container.querySelector(".weapon-ability-badge")).toBeTruthy();
    expect(container.querySelector(".ds-kw-tag")).toBeNull();
    expect(screen.queryByTestId("ds-kw-explanations")).toBeNull();
  });

  it("deduplicates explanation rows shared across profiles", () => {
    const weapons = [
      {
        name: "Bow",
        profiles: [
          { name: "Long", active: true, keywords: ["Crit"] },
          { name: "Short", active: true, keywords: ["Crit"] },
        ],
      },
    ];
    render(
      <DsAosWeapons
        weapons={weapons}
        weaponTypeDef={weaponTypeDef}
        grandAlliance="order"
        maxColumns={2}
        glossary={glossary}
      />,
    );
    expect(screen.getAllByText(/scores a Critical Hit/i)).toHaveLength(1);
  });
});
