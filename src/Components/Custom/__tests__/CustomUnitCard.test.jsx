import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CustomUnitCard } from "../CustomUnitCard";

// Mock react-fitty
vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span data-testid="react-fitty">{children}</span>,
}));

const make40kStatFields = () => [
  { key: "m", label: "M", type: "string", displayOrder: 1 },
  { key: "t", label: "T", type: "string", displayOrder: 2 },
  { key: "sv", label: "SV", type: "string", displayOrder: 3 },
  { key: "w", label: "W", type: "string", displayOrder: 4 },
  { key: "ld", label: "LD", type: "string", displayOrder: 5 },
  { key: "oc", label: "OC", type: "string", displayOrder: 6 },
];

const makeCardTypeDef = (overrides = {}) => ({
  key: "infantry",
  label: "Infantry",
  baseType: "unit",
  schema: {
    stats: {
      label: "Stat Profiles",
      allowMultipleProfiles: true,
      fields: make40kStatFields(),
    },
    metadata: {
      hasKeywords: true,
      hasFactionKeywords: true,
      hasPoints: true,
      pointsFormat: "per-model",
    },
    ...overrides,
  },
});

const makeUnit = (overrides = {}) => ({
  name: "Space Marine",
  subname: "Intercessor",
  cardType: "infantry",
  faction_id: "f1",
  stats: [{ active: true, m: '6"', t: "4", sv: "3+", w: "2", ld: "6+", oc: "1" }],
  keywords: ["INFANTRY", "IMPERIUM"],
  factions: ["Adeptus Astartes"],
  ...overrides,
});

describe("CustomUnitCard", () => {
  it("renders with data-testid", () => {
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByTestId("custom-unit-card")).toBeInTheDocument();
  });

  it("displays unit name", () => {
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText("Space Marine")).toBeInTheDocument();
  });

  it("displays fallback name when unit has no name", () => {
    render(<CustomUnitCard unit={makeUnit({ name: undefined })} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText("Untitled Unit")).toBeInTheDocument();
  });

  it("displays subname when present", () => {
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText("Intercessor")).toBeInTheDocument();
  });

  it("renders dynamic stat headers from schema", () => {
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("SV")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("LD")).toBeInTheDocument();
    expect(screen.getByText("OC")).toBeInTheDocument();
  });

  it("renders stat values from unit data", () => {
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText('6"')).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("3+")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("6+")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders custom stat headers for non-40K schemas", () => {
    const customFields = [
      { key: "move", label: "Move", type: "string", displayOrder: 1 },
      { key: "save", label: "Save", type: "string", displayOrder: 2 },
      { key: "health", label: "Health", type: "string", displayOrder: 3 },
    ];
    const cardTypeDef = makeCardTypeDef({
      stats: { label: "Stats", allowMultipleProfiles: false, fields: customFields },
    });
    const unit = makeUnit({
      stats: [{ active: true, move: '8"', save: "4+", health: "10" }],
    });

    render(<CustomUnitCard unit={unit} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("Move")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getByText('8"')).toBeInTheDocument();
    expect(screen.getByText("4+")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("sorts stat headers by displayOrder", () => {
    const fields = [
      { key: "c", label: "C", type: "string", displayOrder: 3 },
      { key: "a", label: "A", type: "string", displayOrder: 1 },
      { key: "b", label: "B", type: "string", displayOrder: 2 },
    ];
    const cardTypeDef = makeCardTypeDef({
      stats: { label: "Stats", fields },
    });
    const unit = makeUnit({ stats: [{ active: true, a: "1", b: "2", c: "3" }] });

    const { container } = render(<CustomUnitCard unit={unit} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    const captions = container.querySelectorAll(".caption");
    expect(captions[0].textContent).toBe("A");
    expect(captions[1].textContent).toBe("B");
    expect(captions[2].textContent).toBe("C");
  });

  it("renders dash for missing stat values", () => {
    const fields = [{ key: "x", label: "X", type: "string", displayOrder: 1 }];
    const cardTypeDef = makeCardTypeDef({ stats: { label: "Stats", fields } });
    const unit = makeUnit({ stats: [{ active: true }] });

    render(<CustomUnitCard unit={unit} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("filters out inactive stat lines", () => {
    const unit = makeUnit({
      stats: [
        { active: true, m: "6", t: "4", sv: "3+", w: "2", ld: "6+", oc: "1" },
        { active: false, m: "8", t: "5", sv: "2+", w: "3", ld: "5+", oc: "2" },
      ],
    });
    const { container } = render(<CustomUnitCard unit={unit} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    // Header + 1 active stat line = 2 stats_containers
    const statContainers = container.querySelectorAll(".stats_container");
    expect(statContainers).toHaveLength(2);
  });

  it("renders multiple active stat profiles", () => {
    const unit = makeUnit({
      stats: [
        { active: true, m: "6", t: "4", sv: "3+", w: "2", ld: "6+", oc: "1" },
        { active: true, m: "8", t: "5", sv: "2+", w: "3", ld: "5+", oc: "2", showName: true, name: "Leader" },
      ],
    });
    const { container } = render(<CustomUnitCard unit={unit} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    // Header + 2 active stat lines = 3 stats_containers
    const statContainers = container.querySelectorAll(".stats_container");
    expect(statContainers).toHaveLength(3);
    expect(screen.getByText("Leader")).toBeInTheDocument();
  });

  it("renders keywords when schema has hasKeywords enabled", () => {
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText("keywords")).toBeInTheDocument();
    expect(screen.getByText("INFANTRY, IMPERIUM")).toBeInTheDocument();
  });

  it("renders faction keywords when schema has hasFactionKeywords enabled", () => {
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText("faction keywords")).toBeInTheDocument();
    expect(screen.getByText("Adeptus Astartes")).toBeInTheDocument();
  });

  it("hides keywords when schema has hasKeywords disabled", () => {
    const cardTypeDef = makeCardTypeDef({
      metadata: { hasKeywords: false, hasFactionKeywords: false, hasPoints: false },
    });
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.queryByText("keywords")).not.toBeInTheDocument();
    expect(screen.queryByText("faction keywords")).not.toBeInTheDocument();
  });

  it("applies card style CSS variables", () => {
    const cardStyle = { "--header-colour": "#ff0000", "--banner-colour": "#00ff00" };
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={makeCardTypeDef()} cardStyle={cardStyle} />);
    const card = screen.getByTestId("custom-unit-card");
    expect(card.style.getPropertyValue("--header-colour")).toBe("#ff0000");
    expect(card.style.getPropertyValue("--banner-colour")).toBe("#00ff00");
  });

  it("handles empty stats array gracefully", () => {
    const unit = makeUnit({ stats: [] });
    const { container } = render(<CustomUnitCard unit={unit} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    // Only header stats_container (no stat lines)
    const statContainers = container.querySelectorAll(".stats_container");
    expect(statContainers).toHaveLength(1);
  });

  it("renders CSS class structure for header-colour and banner-colour styling", () => {
    const cardStyle = { "--header-colour": "#1a1a2e", "--banner-colour": "#16213e" };
    const unit = makeUnit({
      abilities: {
        core: ["Deep Strike"],
        unit: [{ name: "Oath of Moment", description: "Re-roll hits", showAbility: true }],
      },
    });
    const cardTypeDef = makeCardTypeDef({
      weaponTypes: {
        label: "Weapon Types",
        types: [
          {
            key: "ranged",
            label: "Ranged Weapons",
            hasKeywords: true,
            hasProfiles: true,
            columns: [{ key: "range", label: "Range", type: "string", required: true }],
          },
        ],
      },
      abilities: {
        label: "Abilities",
        categories: [
          { key: "core", label: "Core", format: "name-only" },
          { key: "unit", label: "Unit Abilities", format: "name-description" },
        ],
        hasInvulnerableSave: false,
        hasDamagedAbility: false,
      },
    });
    unit.ranged = [{ profiles: [{ active: true, name: "Bolt Rifle", range: '24"', keywords: [] }] }];

    const { container } = render(<CustomUnitCard unit={unit} cardTypeDef={cardTypeDef} cardStyle={cardStyle} />);

    // Root element has both custom-card and custom-unit-card classes
    const root = container.querySelector(".custom-card.custom-unit-card");
    expect(root).toBeInTheDocument();
    expect(root.style.getPropertyValue("--header-colour")).toBe("#1a1a2e");
    expect(root.style.getPropertyValue("--banner-colour")).toBe("#16213e");

    // Header structure for banner-colour background
    expect(container.querySelector(".unit .header")).toBeInTheDocument();
    expect(container.querySelector(".header .header_container")).toBeInTheDocument();

    // Data container uses header-colour as border/background
    expect(container.querySelector(".data_container .data")).toBeInTheDocument();

    // Weapon heading uses header-colour background
    expect(container.querySelector(".weapons .heading")).toBeInTheDocument();

    // Abilities heading uses header-colour background
    expect(container.querySelector(".abilities .heading")).toBeInTheDocument();

    // Footer uses header-colour for borders
    expect(container.querySelector(".footer")).toBeInTheDocument();
  });

  it("handles missing schema gracefully", () => {
    const cardTypeDef = { key: "infantry", label: "Infantry", baseType: "unit" };
    render(<CustomUnitCard unit={makeUnit()} cardTypeDef={cardTypeDef} cardStyle={{}} />);
    expect(screen.getByTestId("custom-unit-card")).toBeInTheDocument();
  });

  it("renders points when available", () => {
    const unit = makeUnit({
      points: [{ active: true, primary: true, cost: 100, models: 5 }],
    });
    render(<CustomUnitCard unit={unit} cardTypeDef={makeCardTypeDef()} cardStyle={{}} />);
    expect(screen.getByText("100 pts")).toBeInTheDocument();
  });
});
