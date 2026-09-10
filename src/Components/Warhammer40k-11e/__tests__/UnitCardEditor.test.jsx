import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
vi.mock("../UnitCardEditor/UnitPrimarchAbilities", () => ({
  UnitPrimarchAbilities: () => <div data-testid="primarch" />,
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
      "Wargear abilities",
      "Special abilities",
      "Primarch ability",
      "Damaged ability",
      "Invulnerable save",
      "Keywords",
    ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it("renders 10 visibility toggles", () => {
    const { container } = render(<UnitCardEditor />);
    expect(container.querySelectorAll(".ant-collapse-extra .ant-switch").length).toBe(10);
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
    // Damaged ability (12) and Invulnerable save (13)
    expect(panels[12].classList.contains("ant-collapse-item-disabled")).toBe(true);
    expect(panels[13].classList.contains("ant-collapse-item-disabled")).toBe(true);
  });

  it("disables the primarch panel when showAbilities.primarch is false", () => {
    mockActiveCard.ref = { showAbilities: { primarch: false } };
    const { container } = render(<UnitCardEditor />);
    const panels = container.querySelectorAll(".ant-collapse-item");
    expect(panels[11].classList.contains("ant-collapse-item-disabled")).toBe(true);
  });

  // Wargear and special abilities both render on the card (UnitCard/UnitExtra)
  // but had no editor panel, so they could not be edited or hidden.
  describe.each([
    { label: "Wargear abilities", type: "wargear", panelIndex: 9, switchIndex: 5 },
    { label: "Special abilities", type: "special", panelIndex: 10, switchIndex: 6 },
  ])("$label panel", ({ label, type, panelIndex, switchIndex }) => {
    it("edits its ability list when expanded", () => {
      render(<UnitCardEditor />);
      fireEvent.click(screen.getByText(label));
      expect(screen.getByTestId(`extended-${type}`)).toBeInTheDocument();
    });

    it("writes its visibility flag when the toggle is switched off", () => {
      const { container } = render(<UnitCardEditor />);
      fireEvent.click(container.querySelectorAll(".ant-collapse-extra .ant-switch")[switchIndex]);
      expect(mockUpdateActiveCard).toHaveBeenCalledWith(
        expect.objectContaining({ showAbilities: expect.objectContaining({ [type]: false }) }),
      );
    });

    it("disables the panel when its flag is false", () => {
      mockActiveCard.ref = { showAbilities: { [type]: false } };
      const { container } = render(<UnitCardEditor />);
      const panels = container.querySelectorAll(".ant-collapse-item");
      expect(panels[panelIndex].classList.contains("ant-collapse-item-disabled")).toBe(true);
      const toggle = container.querySelectorAll(".ant-collapse-extra .ant-switch")[switchIndex];
      expect(toggle.classList.contains("ant-switch-checked")).toBe(false);
    });
  });

  it("orders the ability panels the way the card renders them", () => {
    const { container } = render(<UnitCardEditor />);
    const headers = [...container.querySelectorAll(".ant-collapse-header")].map((h) => h.textContent);
    expect(headers[8]).toContain("Other abilities");
    expect(headers[9]).toContain("Wargear abilities");
    expect(headers[10]).toContain("Special abilities");
    expect(headers[11]).toContain("Primarch ability");
  });
});
