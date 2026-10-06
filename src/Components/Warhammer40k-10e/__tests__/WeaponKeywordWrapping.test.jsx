import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Weapon keyword lists wrap inside the weapon name column by default. The
// card's "Wrap Keywords" styling toggle turns that off, which the renderer
// signals with a `keywords-nowrap` class on the weapons panel — the stylesheet
// hangs the `white-space: nowrap` opt-out off it (see
// src/styles/__tests__/weaponKeywords.styles.test.js).
//
// The flag is per card and absent on every card saved before the toggle
// existed, so an absent flag has to mean wrap.

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

import { UnitWeapons as UnitWeapons10e } from "../UnitCard/UnitWeapons";
import { UnitWeapons as UnitWeapons11e } from "../../Warhammer40k-11e/UnitCard/UnitWeapons";

const unitWith = (overrides) => ({
  abilities: { primarch: [] },
  rangedWeapons: [
    {
      profiles: [
        {
          active: true,
          name: "Bloody Twins",
          keywords: ["Pistol", "Assault"],
          range: '24"',
          attacks: "6",
          skill: "2+",
          strength: "8",
          ap: "-1",
          damage: "2",
        },
      ],
    },
  ],
  meleeWeapons: [
    {
      profiles: [
        {
          active: true,
          name: "Sword of Asur",
          keywords: ["Devastating wounds", "Anti-daemon 3+"],
          range: "Melee",
          attacks: "8",
          skill: "2+",
          strength: "10",
          ap: "-3",
          damage: "2",
        },
      ],
    },
  ],
  ...overrides,
});

describe.each([
  ["10th edition", UnitWeapons10e],
  ["11th edition", UnitWeapons11e],
])("%s weapon keyword wrapping", (_edition, UnitWeapons) => {
  const weaponsPanel = (container) => container.querySelector(".weapons");

  it("wraps keywords by default when the card carries no flag", () => {
    const { container } = render(<UnitWeapons unit={unitWith({})} />);

    expect(weaponsPanel(container).className).not.toContain("keywords-nowrap");
  });

  it("wraps keywords when the toggle is on", () => {
    const { container } = render(<UnitWeapons unit={unitWith({ wrapKeywords: true })} />);

    expect(weaponsPanel(container).className).not.toContain("keywords-nowrap");
  });

  it("opts out of wrapping when the toggle is off", () => {
    const { container } = render(<UnitWeapons unit={unitWith({ wrapKeywords: false })} />);

    expect(weaponsPanel(container).className).toContain("keywords-nowrap");
  });

  // One class governs both weapon types — the bug that started this was ranged
  // and melee disagreeing about keyword layout on the same card.
  it("applies the opt-out to ranged and melee together", () => {
    const { container } = render(<UnitWeapons unit={unitWith({ wrapKeywords: false })} />);
    const panel = weaponsPanel(container);

    expect(panel.querySelector(".ranged")).not.toBeNull();
    expect(panel.querySelector(".melee")).not.toBeNull();
    expect(panel.querySelectorAll(".keywords-nowrap")).toHaveLength(0);
    expect(panel.className).toContain("keywords-nowrap");
  });
});
