import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockUpdateActiveCard = vi.fn();
const mockActiveCard = { ref: {} };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

vi.mock("../../../Hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({ designerEnabled: false }),
}));

vi.mock("../FactionSelect", () => ({
  FactionSelect: () => <div data-testid="faction-select" />,
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

import { UnitBasicInfo } from "../UnitCardEditor/UnitBasicInfo";

const enhancedCard = {
  name: "Overlord",
  source: "40k-11e",
  selectedEnhancement: { name: "Veil of Darkness", cost: "25" },
};

describe("11e UnitBasicInfo enhancement toggle", () => {
  beforeEach(() => {
    mockUpdateActiveCard.mockClear();
  });

  it("offers the toggle, switched on, when the card has an enhancement", () => {
    mockActiveCard.ref = enhancedCard;
    render(<UnitBasicInfo />);
    expect(screen.getByText("Show enhancement")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Show enhancement" })).toBeChecked();
  });

  it("stores showEnhancement false when switched off", () => {
    mockActiveCard.ref = enhancedCard;
    render(<UnitBasicInfo />);
    fireEvent.click(screen.getByRole("switch", { name: "Show enhancement" }));
    expect(mockUpdateActiveCard).toHaveBeenCalledWith({ ...enhancedCard, showEnhancement: false });
  });

  it("shows the toggle switched off when the card hides its enhancement", () => {
    mockActiveCard.ref = { ...enhancedCard, showEnhancement: false };
    render(<UnitBasicInfo />);
    expect(screen.getByRole("switch", { name: "Show enhancement" })).not.toBeChecked();
  });

  it("leaves the toggle out when the card has no enhancement", () => {
    mockActiveCard.ref = { name: "Overlord", source: "40k-11e" };
    render(<UnitBasicInfo />);
    expect(screen.queryByText("Show enhancement")).not.toBeInTheDocument();
  });
});
