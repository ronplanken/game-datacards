import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

// antd Grid.useBreakpoint needs window.matchMedia which jsdom lacks; stub it.
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, Grid: { useBreakpoint: () => ({}) } };
});

import { UnitWeapons } from "../UnitCard/UnitWeapons";
import { UnitExtra } from "../UnitCard/UnitExtra";
import { UnitWargear } from "../UnitCard/UnitWargear";

const weaponUnit = (extra) => ({
  rangedWeapons: [{ profiles: [{ name: { en: "Bolter" }, range: "24", attacks: "2", keywords: [] }] }],
  meleeWeapons: [],
  ...extra,
});

const abilityUnit = (extra) => ({
  abilities: { core: [], faction: [], other: [{ name: { en: "Oath" }, description: { en: "Reroll hits." } }] },
  ...extra,
});

describe("11e renderer visibility flags (absent = shown)", () => {
  it("shows ranged weapons when no flag is set", () => {
    const { getByText } = render(<UnitWeapons unit={weaponUnit()} />);
    expect(getByText("Ranged weapons")).toBeInTheDocument();
  });

  it("hides ranged weapons when showWeapons.rangedWeapons is false", () => {
    const { queryByText } = render(<UnitWeapons unit={weaponUnit({ showWeapons: { rangedWeapons: false } })} />);
    expect(queryByText("Ranged weapons")).not.toBeInTheDocument();
  });

  it("shows an other ability when no flag is set", () => {
    const { getByText } = render(<UnitExtra unit={abilityUnit()} />);
    expect(getByText("Oath")).toBeInTheDocument();
  });

  it("hides other abilities when showAbilities.other is false", () => {
    const { queryByText } = render(<UnitExtra unit={abilityUnit({ showAbilities: { other: false } })} />);
    expect(queryByText("Oath")).not.toBeInTheDocument();
  });

  it("shows wargear options when no flag is set", () => {
    const { getByText } = render(<UnitWargear unit={{ wargear: [{ en: "Take a plasma pistol." }] }} />);
    expect(getByText("Wargear Options")).toBeInTheDocument();
  });

  it("hides wargear options when showWargear is false", () => {
    const { queryByText } = render(
      <UnitWargear unit={{ wargear: [{ en: "Take a plasma pistol." }], showWargear: false }} />,
    );
    expect(queryByText("Wargear Options")).not.toBeInTheDocument();
  });
});
