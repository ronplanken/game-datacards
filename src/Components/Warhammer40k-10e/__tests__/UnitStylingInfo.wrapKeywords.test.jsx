import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// The desktop Styling panel's "Wrap Keywords" toggle. It writes a plain
// `wrapKeywords` boolean on the card, which UnitWeapons turns into the
// `keywords-nowrap` class (see WeaponKeywordWrapping.test.jsx).

const mockUpdateActiveCard = vi.fn();
const mockSaveActiveCard = vi.fn();
const mockActiveCard = { ref: {} };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
    saveActiveCard: mockSaveActiveCard,
  }),
}));

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: {}, updateSettings: vi.fn() }),
}));

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: [] } }),
}));

vi.mock("../../../Hooks/useIndexedDBImages", () => ({
  useIndexedDBImages: () => ({
    saveImage: vi.fn(),
    deleteImage: vi.fn(),
    getImageData: vi.fn().mockResolvedValue(null),
    saveFactionSymbol: vi.fn(),
    deleteFactionSymbol: vi.fn(),
    getFactionSymbolData: vi.fn().mockResolvedValue(null),
    isReady: true,
  }),
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

import { UnitStylingInfo as UnitStylingInfo10e } from "../UnitCardEditor/UnitStylingInfo";
import { UnitStylingInfo as UnitStylingInfo11e } from "../../Warhammer40k-11e/UnitCardEditor/UnitStylingInfo";

describe.each([
  ["10th edition", UnitStylingInfo10e],
  ["11th edition", UnitStylingInfo11e],
])("%s Styling panel: Wrap Keywords", (_edition, UnitStylingInfo) => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveCard.ref = {};
  });

  const wrapSwitch = () => {
    const label = screen.getByText("Wrap Keywords");
    return label.closest(".ant-form-item").querySelector("button[role='switch']");
  };

  // Cards saved before the toggle existed carry no flag and must still wrap.
  it("shows as on when the card carries no flag", () => {
    render(<UnitStylingInfo />);

    expect(wrapSwitch()).toHaveAttribute("aria-checked", "true");
  });

  it("shows as off when the card opted out", () => {
    mockActiveCard.ref = { wrapKeywords: false };
    render(<UnitStylingInfo />);

    expect(wrapSwitch()).toHaveAttribute("aria-checked", "false");
  });

  it("writes the flag when switched off", () => {
    render(<UnitStylingInfo />);

    fireEvent.click(wrapSwitch());

    expect(mockUpdateActiveCard).toHaveBeenCalledWith(expect.objectContaining({ wrapKeywords: false }));
  });

  it("writes the flag when switched back on", () => {
    mockActiveCard.ref = { wrapKeywords: false };
    render(<UnitStylingInfo />);

    fireEvent.click(wrapSwitch());

    expect(mockUpdateActiveCard).toHaveBeenCalledWith(expect.objectContaining({ wrapKeywords: true }));
  });
});
