import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CustomCardWeapons } from "../CustomCardWeapons";

const make40kWeaponTypes = () => ({
  label: "Weapon Types",
  allowMultiple: true,
  types: [
    {
      key: "ranged",
      label: "Ranged Weapons",
      hasKeywords: true,
      hasProfiles: true,
      columns: [
        { key: "range", label: "Range", type: "string", required: true },
        { key: "a", label: "A", type: "string", required: true },
        { key: "bs", label: "BS", type: "string", required: true },
        { key: "s", label: "S", type: "string", required: true },
        { key: "ap", label: "AP", type: "string", required: true },
        { key: "d", label: "D", type: "string", required: true },
      ],
    },
    {
      key: "melee",
      label: "Melee Weapons",
      hasKeywords: true,
      hasProfiles: true,
      columns: [
        { key: "range", label: "Range", type: "string", required: true },
        { key: "a", label: "A", type: "string", required: true },
        { key: "ws", label: "WS", type: "string", required: true },
        { key: "s", label: "S", type: "string", required: true },
        { key: "ap", label: "AP", type: "string", required: true },
        { key: "d", label: "D", type: "string", required: true },
      ],
    },
  ],
});

const makeRangedWeapon = (overrides = {}) => ({
  profiles: [
    {
      name: "Bolt Rifle",
      active: true,
      range: '24"',
      a: "2",
      bs: "3+",
      s: "4",
      ap: "-1",
      d: "1",
      keywords: ["Rapid Fire 1"],
      ...overrides,
    },
  ],
});

const makeMeleeWeapon = (overrides = {}) => ({
  profiles: [
    {
      name: "Power Sword",
      active: true,
      range: "Melee",
      a: "4",
      ws: "3+",
      s: "5",
      ap: "-2",
      d: "1",
      keywords: [],
      ...overrides,
    },
  ],
});

describe("CustomCardWeapons", () => {
  it("renders null when weaponTypes is null", () => {
    const { container } = render(<CustomCardWeapons unit={{}} weaponTypes={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders null when weaponTypes has no types", () => {
    const { container } = render(<CustomCardWeapons unit={{}} weaponTypes={{ types: [] }} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders weapon type sections with schema-defined column headers", () => {
    const unit = {
      ranged: [makeRangedWeapon()],
      melee: [makeMeleeWeapon()],
    };
    render(<CustomCardWeapons unit={unit} weaponTypes={make40kWeaponTypes()} />);

    expect(screen.getByTestId("custom-weapon-type-ranged")).toBeInTheDocument();
    expect(screen.getByTestId("custom-weapon-type-melee")).toBeInTheDocument();
    expect(screen.getByText("Ranged Weapons")).toBeInTheDocument();
    expect(screen.getByText("Melee Weapons")).toBeInTheDocument();
  });

  it("renders column headers from schema", () => {
    const unit = { ranged: [makeRangedWeapon()] };
    const weaponTypes = {
      types: [
        {
          key: "ranged",
          label: "Ranged Weapons",
          hasKeywords: true,
          columns: [
            { key: "range", label: "Range" },
            { key: "a", label: "A" },
            { key: "bs", label: "BS" },
          ],
        },
      ],
    };
    render(<CustomCardWeapons unit={unit} weaponTypes={weaponTypes} />);
    expect(screen.getByText("Range")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("BS")).toBeInTheDocument();
  });

  it("renders weapon profile values mapped by column key", () => {
    const unit = { ranged: [makeRangedWeapon()] };
    render(<CustomCardWeapons unit={unit} weaponTypes={make40kWeaponTypes()} />);

    expect(screen.getByText("Bolt Rifle")).toBeInTheDocument();
    expect(screen.getByText('24"')).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3+")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("renders dash for missing profile values", () => {
    const unit = {
      ranged: [{ profiles: [{ name: "Empty Gun", active: true }] }],
    };
    const weaponTypes = {
      types: [
        {
          key: "ranged",
          label: "Ranged",
          columns: [{ key: "range", label: "Range" }],
        },
      ],
    };
    render(<CustomCardWeapons unit={unit} weaponTypes={weaponTypes} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("shows weapon keywords when hasKeywords is true", () => {
    const unit = { ranged: [makeRangedWeapon({ keywords: ["Rapid Fire 1", "Assault"] })] };
    render(<CustomCardWeapons unit={unit} weaponTypes={make40kWeaponTypes()} />);
    expect(screen.getByText("Rapid Fire 1, Assault")).toBeInTheDocument();
  });

  it("hides weapon keywords when hasKeywords is false", () => {
    const weaponTypes = {
      types: [
        {
          key: "ranged",
          label: "Ranged",
          hasKeywords: false,
          columns: [{ key: "range", label: "Range" }],
        },
      ],
    };
    const unit = { ranged: [makeRangedWeapon({ keywords: ["Rapid Fire 1"] })] };
    render(<CustomCardWeapons unit={unit} weaponTypes={weaponTypes} />);
    expect(screen.queryByText("Rapid Fire 1")).not.toBeInTheDocument();
  });

  it("filters out inactive profiles", () => {
    const unit = {
      ranged: [
        {
          profiles: [
            { name: "Active Gun", active: true, range: '24"' },
            { name: "Inactive Gun", active: false, range: '12"' },
          ],
        },
      ],
    };
    const weaponTypes = {
      types: [
        {
          key: "ranged",
          label: "Ranged",
          columns: [{ key: "range", label: "Range" }],
        },
      ],
    };
    render(<CustomCardWeapons unit={unit} weaponTypes={weaponTypes} />);
    expect(screen.getByText("Active Gun")).toBeInTheDocument();
    expect(screen.queryByText("Inactive Gun")).not.toBeInTheDocument();
  });

  it("renders multi-profile weapons with multi-line class", () => {
    const unit = {
      ranged: [
        {
          profiles: [
            { name: "Standard", active: true, range: '24"' },
            { name: "Overcharge", active: true, range: '24"' },
          ],
        },
      ],
    };
    const weaponTypes = {
      types: [
        {
          key: "ranged",
          label: "Ranged",
          columns: [{ key: "range", label: "Range" }],
        },
      ],
    };
    const { container } = render(<CustomCardWeapons unit={unit} weaponTypes={weaponTypes} />);
    const multiLines = container.querySelectorAll(".weapon.multi-line");
    expect(multiLines).toHaveLength(2);
  });

  it("skips weapon types with no weapons on the unit", () => {
    const unit = { ranged: [makeRangedWeapon()] };
    render(<CustomCardWeapons unit={unit} weaponTypes={make40kWeaponTypes()} />);
    expect(screen.getByTestId("custom-weapon-type-ranged")).toBeInTheDocument();
    expect(screen.queryByTestId("custom-weapon-type-melee")).not.toBeInTheDocument();
  });

  it("supports suffixed weapon keys (e.g. rangedWeapons)", () => {
    const unit = { rangedWeapons: [makeRangedWeapon()] };
    render(<CustomCardWeapons unit={unit} weaponTypes={make40kWeaponTypes()} />);
    expect(screen.getByTestId("custom-weapon-type-ranged")).toBeInTheDocument();
    expect(screen.getByText("Bolt Rifle")).toBeInTheDocument();
  });

  it("renders weapon abilities", () => {
    const weapon = {
      profiles: [{ name: "Flamer", active: true, range: '12"' }],
      abilities: [{ name: "Torrent", description: "Auto-hits", showAbility: true, showDescription: true }],
    };
    const unit = { ranged: [weapon] };
    const weaponTypes = {
      types: [
        {
          key: "ranged",
          label: "Ranged",
          columns: [{ key: "range", label: "Range" }],
        },
      ],
    };
    render(<CustomCardWeapons unit={unit} weaponTypes={weaponTypes} />);
    expect(screen.getByText("Torrent")).toBeInTheDocument();
    expect(screen.getByText("Auto-hits")).toBeInTheDocument();
  });

  it("hides abilities when showAbility is false", () => {
    const weapon = {
      profiles: [{ name: "Gun", active: true }],
      abilities: [{ name: "Hidden", description: "Nope", showAbility: false }],
    };
    const unit = { ranged: [weapon] };
    const weaponTypes = {
      types: [
        {
          key: "ranged",
          label: "Ranged",
          columns: [{ key: "range", label: "Range" }],
        },
      ],
    };
    render(<CustomCardWeapons unit={unit} weaponTypes={weaponTypes} />);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders custom game system weapon types", () => {
    const customWeaponTypes = {
      types: [
        {
          key: "shooting",
          label: "Shooting Attacks",
          hasKeywords: false,
          columns: [
            { key: "range", label: "Rng" },
            { key: "attacks", label: "Atk" },
            { key: "hit", label: "Hit" },
            { key: "wound", label: "Wnd" },
            { key: "rend", label: "Rnd" },
            { key: "damage", label: "Dmg" },
          ],
        },
      ],
    };
    const unit = {
      shooting: [
        {
          profiles: [
            {
              name: "Longbow",
              active: true,
              range: '18"',
              attacks: "2",
              hit: "3+",
              wound: "4+",
              rend: "-1",
              damage: "1",
            },
          ],
        },
      ],
    };
    render(<CustomCardWeapons unit={unit} weaponTypes={customWeaponTypes} />);
    expect(screen.getByTestId("custom-weapon-type-shooting")).toBeInTheDocument();
    expect(screen.getByText("Shooting Attacks")).toBeInTheDocument();
    expect(screen.getByText("Rng")).toBeInTheDocument();
    expect(screen.getByText("Atk")).toBeInTheDocument();
    expect(screen.getByText("Longbow")).toBeInTheDocument();
    expect(screen.getByText('18"')).toBeInTheDocument();
  });
});
