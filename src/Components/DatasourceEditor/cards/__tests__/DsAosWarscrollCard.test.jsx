import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { DsAosWarscrollCard } from "../DsAosWarscrollCard";

vi.mock("../../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({
    getImageUrl: vi.fn(),
    isReady: false,
  }),
}));

const cardTypeDef = {
  key: "unit",
  baseType: "unit",
  schema: {
    stats: {
      label: "Stats",
      fields: [
        { key: "move", label: "Move", position: "left" },
        { key: "save", label: "Save", position: "left", color: "#3a5228" },
        { key: "control", label: "Control", position: "left" },
        { key: "health", label: "Health", position: "left" },
        { key: "ward", label: "Ward", position: "right" },
      ],
    },
    weaponTypes: {
      label: "Weapons",
      types: [
        {
          key: "melee",
          label: "Melee Weapons",
          hasKeywords: true,
          hasProfiles: false,
          columns: [
            { key: "attacks", label: "Atk", type: "string" },
            { key: "hit", label: "Hit", type: "string" },
            { key: "damage", label: "Dmg", type: "string" },
          ],
        },
      ],
    },
    abilities: {
      label: "Abilities",
      categories: [{ key: "abilities", label: "Abilities", format: "name-description" }],
    },
    sections: {
      label: "Sections",
      sections: [{ key: "notes", label: "Notes", format: "list" }],
    },
    metadata: {
      hasKeywords: true,
      hasFactionKeywords: true,
    },
  },
};

const faction = {
  id: "faction-1",
  name: "Stormcast Eternals",
  grandAlliance: "order",
};

describe("DsAosWarscrollCard", () => {
  it("wraps output in .data-aos scope class", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".data-aos")).toBeTruthy();
  });

  it("renders with native warscroll CSS class", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".warscroll")).toBeTruthy();
  });

  it("renders unit name", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByText("Liberators")).toBeTruthy();
  });

  it("renders left stats as schema-driven badges", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByTestId("ds-aos-left-stats")).toBeTruthy();
    expect(screen.getByText('5"')).toBeTruthy();
    expect(screen.getByText("3+")).toBeTruthy();
  });

  it("renders right stats in header when values are present", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2", ward: "6+" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const headerBadges = container.querySelector(".warscroll-header .desktop-badges");
    expect(headerBadges).toBeTruthy();
    const wardBadge = Array.from(headerBadges.querySelectorAll(".stat-badge")).find(
      (b) => b.querySelector(".badge-label")?.textContent === "Ward",
    );
    expect(wardBadge).toBeTruthy();
    expect(wardBadge.querySelector(".badge-value").textContent).toBe("6+");
  });

  it("does not render right stat badges when values are empty", () => {
    const card = { name: "Liberators", stats: { move: '5"', save: "3+", control: "1", health: "2" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const headerBadges = container.querySelector(".warscroll-header .desktop-badges");
    expect(headerBadges).toBeTruthy();
    expect(headerBadges.querySelectorAll(".stat-badge").length).toBe(0);
  });

  it("applies grand alliance class", () => {
    const card = { name: "Liberators", stats: {}, grandAlliance: "death" };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".data-aos.death")).toBeTruthy();
  });

  it("renders faction name in header banner", () => {
    const card = { name: "Liberators", stats: {} };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByText(/STORMCAST ETERNALS/)).toBeTruthy();
  });

  it("has data-testid for testing", () => {
    const card = { name: "Test", stats: {} };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByTestId("ds-aos-warscroll")).toBeTruthy();
  });

  it("renders schema-driven weapons from profiles", () => {
    const card = {
      name: "Test",
      stats: {},
      weapons: {
        melee: [
          {
            active: true,
            profiles: [{ name: "Warhammer", attacks: "3", hit: "3+", damage: "2", active: true }],
          },
        ],
      },
    };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByTestId("ds-aos-weapons-melee")).toBeTruthy();
    expect(screen.getByText("Warhammer")).toBeTruthy();
    expect(screen.getByText("Melee Weapons")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("renders schema-driven abilities with description", () => {
    const card = {
      name: "Test",
      stats: {},
      abilities: {
        abilities: [{ name: "Sigmarite Shields", description: "Add 1 to save rolls.", showAbility: true }],
      },
    };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByTestId("ds-aos-abilities")).toBeTruthy();
    expect(screen.getByText("Sigmarite Shields")).toBeTruthy();
    expect(screen.getByText("Add 1 to save rolls.")).toBeTruthy();
  });

  it("renders sections in ability-style blocks", () => {
    const card = {
      name: "Test",
      stats: {},
      sections: {
        notes: ["Note 1", "Note 2"],
      },
    };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    expect(screen.getByTestId("ds-aos-sections")).toBeTruthy();
    expect(screen.getByText("Notes")).toBeTruthy();
    expect(screen.getByText("Note 1")).toBeTruthy();
  });

  it("applies custom color to stat badge", () => {
    const card = { name: "Test", stats: { save: "3+" } };
    render(<DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />);
    // The save badge should have green background from field.color
    const badges = screen.getByTestId("ds-aos-left-stats").querySelectorAll(".core-stat-badge");
    const saveBadge = Array.from(badges).find((b) => b.querySelector(".badge-label")?.textContent === "Save");
    expect(saveBadge).toBeTruthy();
    expect(saveBadge.style.background).toBeTruthy();
  });
});
