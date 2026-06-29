import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

// 11e components read the language from settings; pin it to English.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

// Stub the glossary hook with a small fixture so the components resolve tooltips
// without needing the data-source provider.
vi.mock("../../../Hooks/use11eKeywordGlossary", () => ({
  use11eKeywordGlossary: () => [
    { key: "rapid-fire", category: "weapon", name: { en: "Rapid Fire" }, description: { en: "Rapid Fire rule." } },
    { key: "scouts", category: "core", name: { en: "Scouts" }, description: { en: "Scouts rule." } },
  ],
}));

import { UnitWeaponKeywords } from "../UnitCard/UnitWeaponKeyword";
import { UnitCoreAbilities } from "../UnitCard/UnitCoreAbilities";

describe("UnitWeaponKeywords (11e glossary tooltips)", () => {
  it("flags glossary-matched keywords and leaves unmatched ones plain", () => {
    const { getByText } = render(<UnitWeaponKeywords keywords={["Rapid Fire 1", "Plasma"]} />);
    expect(getByText("Rapid Fire 1").closest("button")).toHaveClass("keyword-button--has-info");
    expect(getByText("Plasma").closest("button")).not.toHaveClass("keyword-button--has-info");
  });
});

describe("UnitCoreAbilities (11e glossary tooltips)", () => {
  it("flags glossary-matched core abilities and leaves unmatched ones plain", () => {
    const abilities = [{ name: { en: 'Scouts 6"' } }, { name: { en: "Feel No Pain 5+" } }];
    const { getByText } = render(<UnitCoreAbilities abilities={abilities} />);
    expect(getByText('Scouts 6"')).toHaveClass("keyword-info");
    expect(getByText("Feel No Pain 5+")).not.toHaveClass("keyword-info");
  });

  it("renders nothing when there are no core abilities", () => {
    const { container } = render(<UnitCoreAbilities abilities={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
