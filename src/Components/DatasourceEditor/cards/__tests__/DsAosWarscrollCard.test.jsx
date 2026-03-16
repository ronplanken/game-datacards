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

  it("renders abilities group with half layout class", () => {
    const halfCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        abilities: {
          label: "Abilities",
          categories: [{ key: "options", label: "Options", format: "name-only", layout: "half" }],
        },
      },
    };
    const card = {
      name: "Test",
      stats: {},
      abilities: {
        options: [
          { name: "A", showAbility: true },
          { name: "B", showAbility: true },
        ],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={halfCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const group = container.querySelector("[data-testid='abilities-group-options']");
    expect(group).toBeTruthy();
    expect(group.classList.contains("ds-aos-abilities-layout-half")).toBe(true);
  });

  it("renders abilities group with full layout by default", () => {
    const card = {
      name: "Test",
      stats: {},
      abilities: { abilities: [{ name: "Shield", showAbility: true }] },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const group = container.querySelector("[data-testid='abilities-group-abilities']");
    expect(group).toBeTruthy();
    expect(group.classList.contains("ds-aos-abilities-layout-full")).toBe(true);
  });

  it("does not render ability-text for name-only format categories", () => {
    const nameOnlyCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        abilities: {
          label: "Abilities",
          categories: [{ key: "options", label: "Options", format: "name-only" }],
        },
      },
    };
    const card = {
      name: "Test",
      stats: {},
      abilities: {
        options: [{ name: "Shield Wall", description: "Should not render", showAbility: true }],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={nameOnlyCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(screen.getByText("Shield Wall")).toBeTruthy();
    expect(container.querySelector(".ability-text")).toBeNull();
    expect(screen.queryByText("Should not render")).toBeNull();
  });

  it("renders ability-text for name-description format categories", () => {
    const card = {
      name: "Test",
      stats: {},
      abilities: {
        abilities: [{ name: "Sigmarite Shields", description: "Add 1 to save rolls.", showAbility: true }],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".ability-text")).toBeTruthy();
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

  it("adds aos-mobile-wrapper class when isMobile is true", () => {
    const card = { name: "Mobile Warscroll", stats: {} };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} isMobile />,
    );
    expect(container.querySelector(".data-aos.aos-mobile-wrapper")).toBeTruthy();
  });

  it("renders weapon cards in mobile layout when isMobile is true", () => {
    const card = {
      name: "Mobile Weapons",
      stats: {},
      weapons: {
        melee: [
          {
            active: true,
            profiles: [
              { name: "Grandhammer", attacks: "2", hit: "4+", damage: "3", active: true, keywords: ["Crit(Mortal)"] },
            ],
          },
        ],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} isMobile />,
    );
    expect(container.querySelector(".weapon-card")).toBeTruthy();
    expect(container.querySelector(".weapon-card-name").textContent).toBe("Grandhammer");
    expect(container.querySelector(".weapon-card-stats")).toBeTruthy();
    expect(container.querySelectorAll(".weapon-card-stat").length).toBe(3);
    expect(container.querySelector(".weapon-card-abilities")).toBeTruthy();
    expect(container.querySelector(".weapon-ability-badge").textContent).toBe("Crit(Mortal)");
  });

  it("renders weapon table in desktop layout when isMobile is false", () => {
    const card = {
      name: "Desktop Weapons",
      stats: {},
      weapons: {
        melee: [
          {
            active: true,
            profiles: [{ name: "Warblade", attacks: "3", hit: "3+", damage: "1", active: true }],
          },
        ],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} isMobile={false} />,
    );
    expect(container.querySelector(".weapon-card")).toBeNull();
    expect(container.querySelector(".weapon-row.header-row")).toBeTruthy();
  });

  it("does not add aos-mobile-wrapper class when isMobile is false", () => {
    const card = { name: "Desktop Warscroll", stats: {} };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} isMobile={false} />,
    );
    expect(container.querySelector(".data-aos.aos-mobile-wrapper")).toBeNull();
  });

  it("renders back button when isMobile and onBack are provided", () => {
    const onBack = vi.fn();
    const card = { name: "Mobile Back", stats: {} };
    const { container } = render(
      <DsAosWarscrollCard
        card={card}
        cardTypeDef={cardTypeDef}
        cardStyle={{}}
        faction={faction}
        isMobile
        onBack={onBack}
      />,
    );
    const backButton = container.querySelector(".warscroll-back-button");
    expect(backButton).toBeTruthy();
    backButton.click();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("does not render back button when isMobile is false", () => {
    const onBack = vi.fn();
    const card = { name: "Desktop No Back", stats: {} };
    const { container } = render(
      <DsAosWarscrollCard
        card={card}
        cardTypeDef={cardTypeDef}
        cardStyle={{}}
        faction={faction}
        isMobile={false}
        onBack={onBack}
      />,
    );
    expect(container.querySelector(".warscroll-back-button")).toBeNull();
  });

  it("does not render back button when onBack is not provided", () => {
    const card = { name: "No Back", stats: {} };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} isMobile />,
    );
    expect(container.querySelector(".warscroll-back-button")).toBeNull();
  });

  it("renders points when points is a number", () => {
    const card = { name: "Test", stats: {}, points: 150 };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const pointsValue = container.querySelector(".points-badge .points-value");
    expect(pointsValue).toBeTruthy();
    expect(pointsValue.textContent).toBe("150");
  });

  it("renders points when points is a schema-driven array", () => {
    const card = {
      name: "Test",
      stats: {},
      points: [
        { models: "5", cost: 120, active: false },
        { models: "10", cost: 200, active: true },
      ],
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const pointsValue = container.querySelector(".points-badge .points-value");
    expect(pointsValue).toBeTruthy();
    expect(pointsValue.textContent).toBe("200");
  });

  it("does not render points badge when points is null", () => {
    const card = { name: "Test", stats: {}, points: null };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".points-badge")).toBeNull();
  });

  it("does not render points badge when points is undefined", () => {
    const card = { name: "Test", stats: {} };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".points-badge")).toBeNull();
  });

  it("renders above-position stats in the header", () => {
    const aboveCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        stats: {
          ...cardTypeDef.schema.stats,
          fields: [
            { key: "move", label: "Move", position: "left" },
            { key: "type", label: "Type", position: "above" },
          ],
        },
      },
    };
    const card = { name: "Test", stats: { move: '5"', type: "Heavy Infantry" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={aboveCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".ds-aos-above-stats")).toBeTruthy();
    expect(container.querySelector(".warscroll-header.has-above-stats")).toBeTruthy();
  });

  it("renders below-position stats between header and body", () => {
    const belowCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        stats: {
          ...cardTypeDef.schema.stats,
          fields: [
            { key: "move", label: "Move", position: "left" },
            { key: "wounds", label: "Wounds", position: "below", color: "#8b0000" },
          ],
        },
      },
    };
    const card = { name: "Test", stats: { move: '5"', wounds: "10" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={belowCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const belowStats = container.querySelector(".ds-aos-below-stats");
    expect(belowStats).toBeTruthy();
    const badge = belowStats.querySelector(".core-stat-badge");
    expect(badge).toBeTruthy();
    expect(badge.querySelector(".badge-value").textContent).toBe("10");
    expect(badge.style.background).toBe("rgb(139, 0, 0)");
  });

  it("does not render above stats when no fields have position above", () => {
    const card = { name: "Test", stats: { move: '5"' } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".ds-aos-above-stats")).toBeNull();
    expect(container.querySelector(".warscroll-header.has-above-stats")).toBeNull();
  });

  it("does not render below stats when no fields have position below", () => {
    const card = { name: "Test", stats: { move: '5"' } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={cardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector(".ds-aos-below-stats")).toBeNull();
  });

  it("renders row-display columns as text by default below the weapon row", () => {
    const rowColCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        weaponTypes: {
          label: "Weapons",
          types: [
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: false,
              hasProfiles: false,
              columns: [
                { key: "attacks", label: "Atk", type: "string" },
                { key: "hit", label: "Hit", type: "string" },
                { key: "abilities", label: "Abilities", type: "string", display: "row" },
              ],
            },
          ],
        },
      },
    };
    const card = {
      name: "Test",
      stats: {},
      weapons: {
        melee: [
          {
            active: true,
            profiles: [
              { name: "Warblade", attacks: "3", hit: "3+", abilities: ["Crit(Mortal)", "Anti-Infantry"], active: true },
            ],
          },
        ],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={rowColCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    // Column headers should only include Atk and Hit, not Abilities
    const headerCols = container.querySelectorAll(".weapon-row.header-row .w-stat");
    expect(headerCols.length).toBe(2);
    expect(headerCols[0].textContent).toBe("Atk");
    expect(headerCols[1].textContent).toBe("Hit");
    // Row-display field should render below as text (default visual)
    const rowField = container.querySelector("[data-testid='weapon-row-field-abilities']");
    expect(rowField).toBeTruthy();
    expect(rowField.querySelector(".weapon-row-field-label").textContent).toBe("Abilities:");
    expect(rowField.querySelector(".weapon-row-field-text").textContent).toBe("Crit(Mortal), Anti-Infantry");
    expect(rowField.querySelectorAll(".weapon-ability-badge").length).toBe(0);
  });

  it("renders row-display columns as badges when visual is badge", () => {
    const badgeCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        weaponTypes: {
          label: "Weapons",
          types: [
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: false,
              hasProfiles: false,
              columns: [
                { key: "attacks", label: "Atk", type: "string" },
                { key: "kw", label: "Keywords", type: "string", display: "row", visual: "badge" },
              ],
            },
          ],
        },
      },
    };
    const card = {
      name: "Test",
      stats: {},
      weapons: {
        melee: [
          {
            active: true,
            profiles: [{ name: "Sword", attacks: "3", kw: ["Charge", "Impact"], active: true }],
          },
        ],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={badgeCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const rowField = container.querySelector("[data-testid='weapon-row-field-kw']");
    expect(rowField).toBeTruthy();
    expect(rowField.querySelectorAll(".weapon-ability-badge").length).toBe(2);
    expect(rowField.querySelector(".weapon-row-field-text")).toBeNull();
  });

  it("hides label when displayLabel is false on row-display column", () => {
    const noLabelCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        weaponTypes: {
          label: "Weapons",
          types: [
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: false,
              hasProfiles: false,
              columns: [{ key: "abilities", label: "Abilities", type: "string", display: "row", displayLabel: false }],
            },
          ],
        },
      },
    };
    const card = {
      name: "Test",
      stats: {},
      weapons: {
        melee: [
          {
            active: true,
            profiles: [{ name: "Sword", abilities: "Anti-Infantry", active: true }],
          },
        ],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={noLabelCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const rowField = container.querySelector("[data-testid='weapon-row-field-abilities']");
    expect(rowField).toBeTruthy();
    expect(rowField.querySelector(".weapon-row-field-label")).toBeNull();
  });

  it("does not render row-display field when value is empty", () => {
    const rowColCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        weaponTypes: {
          label: "Weapons",
          types: [
            {
              key: "melee",
              label: "Melee Weapons",
              hasKeywords: false,
              hasProfiles: false,
              columns: [
                { key: "attacks", label: "Atk", type: "string" },
                { key: "abilities", label: "Abilities", type: "string", display: "row" },
              ],
            },
          ],
        },
      },
    };
    const card = {
      name: "Test",
      stats: {},
      weapons: {
        melee: [
          {
            active: true,
            profiles: [{ name: "Sword", attacks: "3", active: true }],
          },
        ],
      },
    };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={rowColCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    expect(container.querySelector("[data-testid='weapon-row-field-abilities']")).toBeNull();
  });

  it("applies specialColor to above stats when field is special", () => {
    const specialCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        stats: {
          ...cardTypeDef.schema.stats,
          fields: [{ key: "ward", label: "Ward", position: "above", special: true, specialColor: "#5b21b6" }],
        },
      },
    };
    const card = { name: "Test", stats: { ward: "6+" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={specialCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const badge = container.querySelector(".ds-aos-above-stats .core-stat-badge");
    expect(badge).toBeTruthy();
    expect(badge.style.background).toBe("rgb(91, 33, 182)");
  });

  it("excludes above and below fields from left stats", () => {
    const mixedCardTypeDef = {
      ...cardTypeDef,
      schema: {
        ...cardTypeDef.schema,
        stats: {
          ...cardTypeDef.schema.stats,
          fields: [
            { key: "move", label: "Move", position: "left" },
            { key: "type", label: "Type", position: "above" },
            { key: "wounds", label: "Wounds", position: "below" },
          ],
        },
      },
    };
    const card = { name: "Test", stats: { move: '5"', type: "Infantry", wounds: "10" } };
    const { container } = render(
      <DsAosWarscrollCard card={card} cardTypeDef={mixedCardTypeDef} cardStyle={{}} faction={faction} />,
    );
    const leftStats = container.querySelector("[data-testid='ds-aos-left-stats']");
    expect(leftStats).toBeTruthy();
    const leftBadges = leftStats.querySelectorAll(".core-stat-badge");
    expect(leftBadges.length).toBe(1);
    expect(leftBadges[0].querySelector(".badge-label").textContent).toBe("Move");
  });
});
