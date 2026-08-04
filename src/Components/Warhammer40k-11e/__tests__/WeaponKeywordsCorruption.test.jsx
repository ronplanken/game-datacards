import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Regression cover for the production crash
// `TypeError: (x.keywords || []).map is not a function`.
//
// A datasource weapon column keyed `keywords` used to render a plain text input
// over the profile's keywords array, so the first keystroke replaced
// `["Assault"]` with `"A"`. Every consumer then did `(profile.keywords || [])
// .map(...)` — and `"A" || []` is `"A"` — so opening the weapons tab threw and
// the card white-screened. The corrupted value lives in the saved card, so the
// crash survived refreshes.

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

vi.mock("../../../Hooks/use11eKeywordGlossary", () => ({
  use11eKeywordGlossary: () => [],
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

import { UnitWeapon as UnitWeaponEditor } from "../UnitCardEditor/UnitWeapon";
import { UnitWeapon as UnitWeaponCard } from "../UnitCard/UnitWeapon";

const corruptedWeapon = {
  profiles: [
    {
      name: { en: "Bolt rifle" },
      range: "24",
      attacks: "2",
      skill: "3+",
      strength: "4",
      ap: "-1",
      damage: "1",
      // The corrupted shape: a string where an array belongs.
      keywords: "T",
    },
  ],
};

describe("11e weapons with a corrupted string keywords value", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveCard.ref = { rangedWeapons: [corruptedWeapon] };
  });

  it("renders the weapons editor panel without throwing", () => {
    expect(() => render(<UnitWeaponEditor weapon={corruptedWeapon} index={0} type="rangedWeapons" />)).not.toThrow();
  });

  it("shows the stray keyword as an editable keyword the user can delete", () => {
    render(<UnitWeaponEditor weapon={corruptedWeapon} index={0} type="rangedWeapons" />);
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add keyword/i })).toBeInTheDocument();
  });

  it("renders the card itself without throwing and shows the keyword", () => {
    expect(() => render(<UnitWeaponCard weapon={corruptedWeapon} />)).not.toThrow();
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("still renders a profile with a proper keywords array", () => {
    const healthy = {
      profiles: [{ ...corruptedWeapon.profiles[0], keywords: ["Assault", "Torrent"] }],
    };
    render(<UnitWeaponCard weapon={healthy} />);
    expect(screen.getByText("Assault")).toBeInTheDocument();
    expect(screen.getByText("Torrent")).toBeInTheDocument();
  });
});
