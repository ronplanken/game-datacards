import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

// 11e components read the language from settings; pin it to English.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

// Stub the glossary hook with a small fixture in the custom-datasource glossary
// shape (name/description strings, matchType, appliesTo) so the shared
// resolveKeywordEntry matcher resolves tooltips without the data-source provider.
vi.mock("../../../Hooks/use11eKeywordGlossary", () => ({
  use11eKeywordGlossary: () => [
    {
      key: "rapid-fire",
      name: "Rapid Fire",
      description: "Rapid Fire rule.",
      matchType: "parameterized",
      appliesTo: ["weapons"],
    },
    {
      key: "scouts",
      name: "Scouts",
      description: "Scouts rule.",
      matchType: "parameterized",
      appliesTo: ["abilities"],
    },
    {
      key: "lone-operative",
      name: "Lone Operative",
      description: "Lone Operative rule.",
      matchType: "exact",
      appliesTo: ["abilities"],
    },
    {
      key: "lethal-hits",
      name: "Lethal Hits",
      nameLoc: { en: "Lethal Hits", de: "Tödliche Treffer" },
      description: "Lethal Hits rule.",
      matchType: "exact",
      appliesTo: ["weapons"],
    },
    {
      key: "anti",
      name: "Anti-",
      description: "Anti rule.",
      matchType: "prefix",
      appliesTo: ["weapons"],
    },
  ],
}));

import { UnitWeaponKeywords } from "../UnitCard/UnitWeaponKeyword";
import { UnitCoreAbilities } from "../UnitCard/UnitCoreAbilities";
import { UnitExtra } from "../UnitCard/UnitExtra";
import { UnitPrimarchAbilities } from "../UnitCard/UnitPrimarchAbilities";
import { UnitLoadout } from "../UnitCard/UnitLoadout";
import { MarkupText } from "../UnitCard/UnitAbilityDescription";

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

describe("Unit ability description text (11e glossary tooltips)", () => {
  const text = (body) => ({ en: body });

  it("flags glossary keywords in other, wargear, special and Damaged ability text", () => {
    const unit = {
      abilities: {
        other: [
          { name: text("Servile Pawns"), description: text("This model has the <b>Lone Operative</b> ability.") },
        ],
        wargear: [{ name: text("Shroud"), description: text("The bearer's unit has <b>Scouts 6\"</b>.") }],
        special: [{ name: text("Special"), description: text("Weapons gain <k>[Lethal Hits]</k>.") }],
        damaged: { range: text("1-4 wounds remaining"), description: text("Loses <b>Lone Operative</b>.") },
      },
    };
    const { getAllByText, getByText } = render(<UnitExtra unit={unit} />);
    getAllByText("Lone Operative").forEach((el) => expect(el).toHaveClass("keyword-info"));
    expect(getAllByText("Lone Operative")).toHaveLength(2);
    expect(getByText('Scouts 6"')).toHaveClass("keyword-info");
    expect(getByText("[Lethal Hits]")).toHaveClass("keyword-info", "gdc-keyword");
  });

  it("flags glossary keywords in primarch ability text", () => {
    const unit = {
      abilities: {
        primarch: [
          { name: text("Lord"), abilities: [{ name: text("Ghost"), description: text("Has <b>Lone Operative</b>.") }] },
        ],
      },
    };
    const { getByText } = render(<UnitPrimarchAbilities unit={unit} />);
    expect(getByText("Lone Operative")).toHaveClass("keyword-info");
  });

  it("shows the keyword rule text on hover", async () => {
    const unit = { abilities: { other: [{ name: text("Pawns"), description: text("Has <b>Lone Operative</b>.") }] } };
    const { getByText, findByText } = render(<UnitExtra unit={unit} />);
    fireEvent.mouseEnter(getByText("Lone Operative"));
    expect(await findByText("Lone Operative rule.")).toBeInTheDocument();
  });

  it("matches markdown bold, full-width brackets, localised names and non-breaking hyphens", () => {
    const unit = {
      abilities: {
        other: [
          {
            name: text("Pawns"),
            description: text(
              "**Lone Operative**, <k>［Lethal Hits］</k>, <k>[Tödliche Treffer]</k> and <k>[Anti\u2011Vehicle 4+]</k>.",
            ),
          },
        ],
      },
    };
    const { getByText } = render(<UnitExtra unit={unit} />);
    expect(getByText("Lone Operative").tagName).toBe("STRONG");
    expect(getByText("Lone Operative")).toHaveClass("keyword-info");
    expect(getByText("［Lethal Hits］")).toHaveClass("keyword-info");
    expect(getByText("[Tödliche Treffer]")).toHaveClass("keyword-info");
    expect(getByText("[Anti\u2011Vehicle 4+]")).toHaveClass("keyword-info");
  });

  it("leaves unmatched keywords and non-keyword bold text plain", () => {
    const unit = {
      abilities: {
        other: [
          {
            name: text("Pawns"),
            description: text(
              "<b>hit rolls</b>, <k>Infantry</k>, <b>Stealth</b>, <k>[Lone Operative]</k> and <b><i>Lone Operative</i></b>.",
            ),
          },
        ],
      },
    };
    const { getByText } = render(<UnitExtra unit={unit} />);
    expect(getByText("hit rolls")).not.toHaveClass("keyword-info");
    expect(getByText("Infantry")).not.toHaveClass("keyword-info");
    expect(getByText("Infantry")).toHaveClass("gdc-keyword");
    expect(getByText("Stealth")).not.toHaveClass("keyword-info");
    // Bracketed ability keywords still resolve against the abilities scope.
    expect(getByText("[Lone Operative]")).toHaveClass("keyword-info");
    // Nested markup is not looked up.
    expect(getByText("Lone Operative").closest("b")).not.toHaveClass("keyword-info");
  });

  it("only resolves weapon-scoped entries for bracketed keywords", () => {
    const unit = { abilities: { other: [{ name: text("Pawns"), description: text("Gains <b>Lethal Hits</b>.") }] } };
    const { getByText } = render(<UnitExtra unit={unit} />);
    expect(getByText("Lethal Hits")).not.toHaveClass("keyword-info");
  });

  it("does not add tooltips without a glossary (stratagem, enhancement and rule cards)", () => {
    const { getByText } = render(<MarkupText content="Gains <b>Lone Operative</b>." />);
    expect(getByText("Lone Operative")).not.toHaveClass("keyword-info");
  });

  it("does not add tooltips to loadout text", () => {
    const unit = { loadout: text("This model has <b>Lone Operative</b> and <k>[Lethal Hits]</k>.") };
    const { getByText } = render(<UnitLoadout unit={unit} />);
    expect(getByText("Lone Operative")).not.toHaveClass("keyword-info");
    expect(getByText("[Lethal Hits]")).not.toHaveClass("keyword-info");
  });
});
