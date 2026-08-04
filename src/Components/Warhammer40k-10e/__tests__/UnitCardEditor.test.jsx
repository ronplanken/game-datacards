import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockUpdateActiveCard = vi.fn();
const mockActiveCard = {
  ref: {
    showWeapons: { rangedWeapons: true, meleeWeapons: true },
    showAbilities: { core: true, faction: true, other: true, wargear: true, special: true },
    abilities: {
      core: [],
      faction: [],
      other: [],
      wargear: [],
      special: [],
      primarch: [],
      damaged: { showDamagedAbility: false, range: "", description: "" },
      invul: { showInvulnerableSave: false, value: "", info: "" },
    },
  },
};

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

// Mock all child components to isolate parent toggle behavior
vi.mock("../UnitCardEditor/UnitBasicInfo", () => ({ UnitBasicInfo: () => <div data-testid="unit-basic-info" /> }));
vi.mock("../UnitCardEditor/UnitStylingInfo", () => ({
  UnitStylingInfo: () => <div data-testid="unit-styling-info" />,
}));
vi.mock("../UnitCardEditor/UnitStats", () => ({ UnitStats: () => <div data-testid="unit-stats" /> }));
vi.mock("../UnitCardEditor/UnitPoints", () => ({ UnitPoints: () => <div data-testid="unit-points" /> }));
vi.mock("../UnitCardEditor/UnitWeapons", () => ({
  UnitWeapons: ({ type }) => <div data-testid={`unit-weapons-${type}`} />,
}));
vi.mock("../UnitCardEditor/UnitBasicAbility", () => ({
  UnitBasicAbility: ({ type }) => <div data-testid={`unit-basic-ability-${type}`} />,
}));
vi.mock("../UnitCardEditor/UnitExtendedAbilities", () => ({
  UnitExtendedAbilities: ({ type }) => <div data-testid={`unit-extended-abilities-${type}`} />,
}));
vi.mock("../UnitCardEditor/UnitDamageTable", () => ({
  UnitDamageTable: () => <div data-testid="unit-damage-table" />,
}));
vi.mock("../UnitCardEditor/UnitPrimarchAbilities", () => ({
  UnitPrimarchAbilities: () => <div data-testid="unit-primarch-abilities" />,
}));
vi.mock("../UnitCardEditor/UnitInvulnerableSave", () => ({
  UnitInvulnerableSave: () => <div data-testid="unit-invulnerable-save" />,
}));
vi.mock("../UnitCardEditor/UnitKeywords", () => ({
  UnitKeywords: ({ type }) => <div data-testid={`unit-keywords-${type}`} />,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { UnitCardEditor } from "../UnitCardEditor";

describe("UnitCardEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveCard.ref = {
      showWeapons: { rangedWeapons: true, meleeWeapons: true },
      showAbilities: { core: true, faction: true, other: true, wargear: true, special: true },
      abilities: {
        core: [],
        faction: [],
        other: [],
        wargear: [],
        special: [],
        primarch: [],
        damaged: { showDamagedAbility: false, range: "", description: "" },
        invul: { showInvulnerableSave: false, value: "", info: "" },
      },
    };
  });

  it("renders all expected panels", () => {
    render(<UnitCardEditor />);
    expect(screen.getByText("Basic information")).toBeInTheDocument();
    expect(screen.getByText("Styling")).toBeInTheDocument();
    expect(screen.getByText("Datasheets")).toBeInTheDocument();
    expect(screen.getByText("Points")).toBeInTheDocument();
    expect(screen.getByText("Ranged weapons")).toBeInTheDocument();
    expect(screen.getByText("Melee weapons")).toBeInTheDocument();
    expect(screen.getByText("Core abilities")).toBeInTheDocument();
    expect(screen.getByText("Faction abilities")).toBeInTheDocument();
    expect(screen.getByText("Extended abilities")).toBeInTheDocument();
    expect(screen.getByText("Wargear abilities")).toBeInTheDocument();
    expect(screen.getByText("Special abilities")).toBeInTheDocument();
    expect(screen.getByText("Damaged ability")).toBeInTheDocument();
    expect(screen.getByText("Primarch ability")).toBeInTheDocument();
    expect(screen.getByText("Invulnerable save")).toBeInTheDocument();
    expect(screen.getByText("Keywords")).toBeInTheDocument();
  });

  it("renders 9 switch toggles on panels with visibility controls", () => {
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    expect(switches.length).toBe(9);
  });

  it("renders weapons toggles as checked when visible", () => {
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    expect(switches[0].classList.contains("ant-switch-checked")).toBe(true);
    expect(switches[1].classList.contains("ant-switch-checked")).toBe(true);
  });

  it("renders weapons toggles as unchecked when hidden", () => {
    mockActiveCard.ref.showWeapons = { rangedWeapons: false, meleeWeapons: false };
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    expect(switches[0].classList.contains("ant-switch-checked")).toBe(false);
    expect(switches[1].classList.contains("ant-switch-checked")).toBe(false);
  });

  it("renders ability toggles as checked when visible", () => {
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    // Switches 2-6: core, faction, other, wargear, special
    for (let i = 2; i <= 6; i++) {
      expect(switches[i].classList.contains("ant-switch-checked")).toBe(true);
    }
  });

  it("renders damaged and invul toggles as unchecked by default", () => {
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    expect(switches[7].classList.contains("ant-switch-checked")).toBe(false);
    expect(switches[8].classList.contains("ant-switch-checked")).toBe(false);
  });

  it("renders damaged and invul toggles as checked when enabled", () => {
    mockActiveCard.ref.abilities.damaged.showDamagedAbility = true;
    mockActiveCard.ref.abilities.invul.showInvulnerableSave = true;
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    expect(switches[7].classList.contains("ant-switch-checked")).toBe(true);
    expect(switches[8].classList.contains("ant-switch-checked")).toBe(true);
  });

  it("does not render switch toggles on non-toggleable panels", () => {
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    // Panels without toggles: Basic info(0), Styling(1), Datasheets(2), Points(3), Primarch(12), Keywords(14)
    [0, 1, 2, 3, 12, 14].forEach((index) => {
      const switchEl = panels[index].querySelector(".ant-collapse-extra .ant-switch");
      expect(switchEl).toBeNull();
    });
  });

  it("defaults showWeapons to visible when undefined", () => {
    mockActiveCard.ref.showWeapons = undefined;
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    expect(switches[0].classList.contains("ant-switch-checked")).toBe(true);
    expect(switches[1].classList.contains("ant-switch-checked")).toBe(true);
  });

  it("defaults showAbilities to visible when undefined", () => {
    mockActiveCard.ref.showAbilities = undefined;
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    for (let i = 2; i <= 6; i++) {
      expect(switches[i].classList.contains("ant-switch-checked")).toBe(true);
    }
  });

  it("disables weapon panels when toggled off", () => {
    mockActiveCard.ref.showWeapons = { rangedWeapons: false, meleeWeapons: false };
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    // Ranged weapons (4) and Melee weapons (5) panels
    expect(panels[4].classList.contains("ant-collapse-item-disabled")).toBe(true);
    expect(panels[5].classList.contains("ant-collapse-item-disabled")).toBe(true);
  });

  it("does not disable weapon panels when toggled on", () => {
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    expect(panels[4].classList.contains("ant-collapse-item-disabled")).toBe(false);
    expect(panels[5].classList.contains("ant-collapse-item-disabled")).toBe(false);
  });

  it("disables ability panels when toggled off", () => {
    mockActiveCard.ref.showAbilities = { core: false, faction: false, other: false, wargear: false, special: false };
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    // Core(6), Faction(7), Extended(8), Wargear(9), Special(10)
    [6, 7, 8, 9, 10].forEach((index) => {
      expect(panels[index].classList.contains("ant-collapse-item-disabled")).toBe(true);
    });
  });

  it("disables damaged panel when showDamagedAbility is false", () => {
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    // Damaged ability panel (11)
    expect(panels[11].classList.contains("ant-collapse-item-disabled")).toBe(true);
  });

  it("does not disable damaged panel when showDamagedAbility is true", () => {
    mockActiveCard.ref.abilities.damaged.showDamagedAbility = true;
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    expect(panels[11].classList.contains("ant-collapse-item-disabled")).toBe(false);
  });

  it("disables invulnerable save panel when showInvulnerableSave is false", () => {
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    // Invulnerable save panel (13)
    expect(panels[13].classList.contains("ant-collapse-item-disabled")).toBe(true);
  });

  it("does not disable invulnerable save panel when showInvulnerableSave is true", () => {
    mockActiveCard.ref.abilities.invul.showInvulnerableSave = true;
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    expect(panels[13].classList.contains("ant-collapse-item-disabled")).toBe(false);
  });
});
