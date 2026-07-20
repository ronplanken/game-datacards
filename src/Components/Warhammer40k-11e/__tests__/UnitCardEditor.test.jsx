import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockUpdateActiveCard = vi.fn();
const mockActiveCard = { ref: {} };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

// Mock child components to isolate parent panel/toggle behaviour.
vi.mock("../UnitCardEditor/UnitBasicInfo", () => ({ UnitBasicInfo: () => <div data-testid="basic" /> }));
vi.mock("../UnitCardEditor/UnitStylingInfo", () => ({ UnitStylingInfo: () => <div data-testid="styling" /> }));
vi.mock("../UnitCardEditor/UnitStats", () => ({ UnitStats: () => <div data-testid="stats" /> }));
vi.mock("../UnitCardEditor/UnitPoints", () => ({ UnitPoints: () => <div data-testid="points" /> }));
vi.mock("../UnitCardEditor/UnitWeapons", () => ({
  UnitWeapons: ({ type }) => <div data-testid={`weapons-${type}`} />,
}));
vi.mock("../UnitCardEditor/UnitBasicAbility", () => ({
  UnitBasicAbility: ({ type }) => <div data-testid={`basic-ability-${type}`} />,
}));
vi.mock("../UnitCardEditor/UnitExtendedAbilities", () => ({
  UnitExtendedAbilities: ({ type }) => <div data-testid={`extended-${type}`} />,
}));
vi.mock("../UnitCardEditor/UnitDamageTable", () => ({ UnitDamageTable: () => <div data-testid="damaged" /> }));
vi.mock("../UnitCardEditor/UnitInvulnerableSave", () => ({ UnitInvulnerableSave: () => <div data-testid="invul" /> }));
vi.mock("../UnitCardEditor/UnitKeywords", () => ({
  UnitKeywords: ({ type }) => <div data-testid={`keywords-${type}`} />,
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

describe("UnitCardEditor (11e)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveCard.ref = {};
  });

  it("renders all expected panels", () => {
    render(<UnitCardEditor />);
    [
      "Basic information",
      "Styling",
      "Datasheets",
      "Points",
      "Ranged weapons",
      "Melee weapons",
      "Core abilities",
      "Faction abilities",
      "Other abilities",
      "Damaged ability",
      "Invulnerable save",
      "Keywords",
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it("renders 7 visibility toggles", () => {
    const { container } = render(<UnitCardEditor />);
    expect(container.querySelectorAll(".ant-collapse-extra .ant-switch").length).toBe(7);
  });

  it("defaults every visibility toggle to checked when no flags are set", () => {
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    switches.forEach((sw) => expect(sw.classList.contains("ant-switch-checked")).toBe(true));
  });

  it("renders weapon toggles unchecked when explicitly hidden", () => {
    mockActiveCard.ref = { showWeapons: { rangedWeapons: false, meleeWeapons: false } };
    const { container } = render(<UnitCardEditor />);
    const switches = container.querySelectorAll(".ant-collapse-extra .ant-switch");
    expect(switches[0].classList.contains("ant-switch-checked")).toBe(false);
    expect(switches[1].classList.contains("ant-switch-checked")).toBe(false);
  });

  it("disables the damaged and invul panels when their flags are false", () => {
    mockActiveCard.ref = { showDamaged: false, showInvul: false };
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    // Damaged ability (9) and Invulnerable save (10)
    expect(panels[9].classList.contains("ant-collapse-item-disabled")).toBe(true);
    expect(panels[10].classList.contains("ant-collapse-item-disabled")).toBe(true);
  });
});
