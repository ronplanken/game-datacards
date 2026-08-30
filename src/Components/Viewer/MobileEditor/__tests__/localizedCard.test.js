import { describe, it, expect } from "vitest";
import { getLocalizationSpec, I18N_KEY, mergeCard, projectCard } from "../localizedCard";

// A trimmed 11e unit carrying one of every localized shape the spec covers.
const unit11e = () => ({
  uuid: "unit-1",
  source: "40k-11e",
  cardType: "DataCard",
  name: "Intercessor Squad",
  subname: "Battleline",
  stats: [{ name: { en: "Intercessor", de: "Intercessor DE" }, m: '6"', t: "4", sv: "3+", w: "2", ld: "6+", oc: "2" }],
  rangedWeapons: [
    {
      profiles: [{ name: { en: "Bolt rifle", de: "Boltgewehr" }, range: "24", attacks: "2", keywords: ["Assault"] }],
      abilities: [{ name: { en: "Overcharge", de: "Überladen" }, description: { en: "Boom", de: "Bumm" } }],
    },
  ],
  meleeWeapons: [{ profiles: [{ name: { en: "Close combat weapon", de: "Nahkampfwaffe" }, range: "Melee" }] }],
  abilities: {
    core: [{ name: { en: 'Scouts 6"', de: 'Späher 6"' } }],
    faction: [{ name: { en: "Oath of Moment", de: "Eid des Augenblicks" } }],
    other: [{ name: { en: "Combat Squads", de: "Kampftrupps" }, description: { en: "Split", de: "Teilen" } }],
    primarch: [
      {
        name: { en: "Rites of Battle", de: "Riten der Schlacht" },
        abilities: [{ name: { en: "Tactical Precision", de: "Präzision" }, description: { en: "Re-roll", de: "Neu" } }],
      },
    ],
    damaged: { range: { en: "1-3 wounds", de: "1-3 LP" }, description: { en: "Hurts", de: "Schmerzt" } },
    invul: { value: "4+" },
  },
  keywords: [
    { en: "Infantry", de: "Infanterie" },
    { en: "Imperium", de: "Imperium" },
  ],
  factions: ["Adeptus Astartes"],
  composition: [{ en: "5 Intercessors", de: "5 Intercessors DE" }],
  wargearOptions: [
    {
      instruction: { en: "Replace the bolt rifle", de: "Ersetze das Boltgewehr" },
      options: [{ name: { en: "Plasma incinerator", de: "Plasmabrenner" }, cost: "5" }],
    },
  ],
  loadout: { en: "Equipped with a bolt rifle", de: "Ausgerüstet mit Boltgewehr" },
  transport: { en: "Capacity 6", de: "Kapazität 6" },
  leader: { en: "Can lead Assault Squads", de: "Kann Sturmtrupps führen" },
  points: [
    { models: "5", cost: "80", keyword: { en: "", de: "" }, detachment: null, faction: null },
    { models: "10", cost: "160", keyword: { en: "" }, detachment: { en: "Gladius Task Force" }, faction: null },
  ],
});

const project = (card, language = "de") => projectCard(card, getLocalizationSpec(card, "40k-11e"), language);
const merge = (card, view, language = "de") => mergeCard(view, getLocalizationSpec(card, "40k-11e"), language);

describe("getLocalizationSpec", () => {
  it("returns no spec for single-language sources", () => {
    expect(getLocalizationSpec({ source: "40k-10e", stats: [] }, "40k-10e")).toBeNull();
    expect(getLocalizationSpec({ source: "aos" }, "aos")).toBeNull();
    expect(getLocalizationSpec({ source: "my-custom-ds" }, "my-custom-ds")).toBeNull();
  });

  it("returns a spec for 11e cards, falling back to the game system", () => {
    expect(getLocalizationSpec({ cardType: "DataCard" }, "40k-11e")).not.toBeNull();
    expect(getLocalizationSpec({ source: "40k-11e", cardType: "stratagem" }, "aos")).not.toBeNull();
  });

  it("picks the spec by card type", () => {
    const stratagem = { source: "40k-11e", cardType: "stratagem", when: { en: "W" }, effect: { en: "E" } };
    const view = projectCard(stratagem, getLocalizationSpec(stratagem, "40k-11e"), "en");
    expect(view.when).toBe("W");
  });

  it("falls back to the card shape when cardType is missing", () => {
    const rule = { source: "40k-11e", rules: [{ order: 0, type: "text", text: { en: "Body", de: "Körper" } }] };
    const view = projectCard(rule, getLocalizationSpec(rule, "40k-11e"), "de");
    expect(view.rules[0].text).toBe("Körper");
  });
});

describe("projectCard", () => {
  const view = project(unit11e());

  it("resolves localized fields to the active language", () => {
    expect(view.stats[0].name).toBe("Intercessor DE");
    expect(view.rangedWeapons[0].profiles[0].name).toBe("Boltgewehr");
    expect(view.rangedWeapons[0].abilities[0].description).toBe("Bumm");
    expect(view.abilities.other[0].name).toBe("Kampftrupps");
    expect(view.abilities.primarch[0].abilities[0].description).toBe("Neu");
    expect(view.abilities.damaged.range).toBe("1-3 LP");
    expect(view.loadout).toBe("Ausgerüstet mit Boltgewehr");
    expect(view.wargearOptions[0].options[0].name).toBe("Plasmabrenner");
  });

  it("leaves plain fields untouched", () => {
    expect(view.name).toBe("Intercessor Squad");
    expect(view.subname).toBe("Battleline");
    expect(view.stats[0].sv).toBe("3+");
    expect(view.abilities.invul.value).toBe("4+");
    expect(view.factions).toEqual(["Adeptus Astartes"]);
    expect(view.rangedWeapons[0].profiles[0].keywords).toEqual(["Assault"]);
    expect(view.wargearOptions[0].options[0].cost).toBe("5");
  });

  it("projects arrays of localized strings as name objects", () => {
    expect(view.keywords.map((k) => k.name)).toEqual(["Infanterie", "Imperium"]);
    expect(view.composition[0].name).toBe("5 Intercessors DE");
  });

  it("falls back to English when the active language is missing", () => {
    const card = unit11e();
    card.loadout = { en: "Only English" };
    expect(project(card).loadout).toBe("Only English");
  });
});

describe("mergeCard", () => {
  it("round-trips an untouched card back to its original shape", () => {
    const card = unit11e();
    expect(merge(card, project(card))).toEqual(card);
  });

  it("writes only the active language and keeps the others", () => {
    const card = unit11e();
    const view = project(card);
    view.loadout = "Neuer Text";
    view.stats[0].name = "Neuer Name";

    const merged = merge(card, view);
    expect(merged.loadout).toEqual({ en: "Equipped with a bolt rifle", de: "Neuer Text" });
    expect(merged.stats[0].name).toEqual({ en: "Intercessor", de: "Neuer Name" });
  });

  it("strips the language sidecar from every level", () => {
    const card = unit11e();
    const merged = merge(card, project(card));
    const json = JSON.stringify(merged);
    expect(json).not.toContain(I18N_KEY);
  });

  it("keeps each entry's translations when an array item is removed", () => {
    const card = unit11e();
    const view = project(card);
    // Drop the first keyword, exactly as the chip editor does.
    view.keywords = view.keywords.slice(1);

    const merged = merge(card, view);
    expect(merged.keywords).toEqual([{ en: "Imperium", de: "Imperium" }]);
  });

  it("keeps each profile's translations when a weapon is removed", () => {
    const card = unit11e();
    card.rangedWeapons.push({ profiles: [{ name: { en: "Grenade", de: "Granate" }, range: "8" }] });
    const view = project(card);
    view.rangedWeapons = view.rangedWeapons.slice(1);

    const merged = merge(card, view);
    expect(merged.rangedWeapons).toHaveLength(1);
    expect(merged.rangedWeapons[0].profiles[0].name).toEqual({ en: "Grenade", de: "Granate" });
  });

  it("seeds a newly added entry as a language-keyed object", () => {
    const card = unit11e();
    const view = project(card);
    view.keywords = [...view.keywords, { name: "Neues Schlüsselwort" }];
    view.composition = [...view.composition, ""];
    view.stats = [...view.stats, { name: "Zweites Profil", m: '8"' }];

    const merged = merge(card, view);
    expect(merged.keywords[2]).toEqual({ de: "Neues Schlüsselwort" });
    expect(merged.composition[1]).toEqual({ de: "" });
    expect(merged.stats[1].name).toEqual({ de: "Zweites Profil" });
  });

  it("keeps a plain-string field plain", () => {
    const card = unit11e();
    card.loadout = "Already resolved";
    const view = project(card);
    view.loadout = "Edited";
    expect(merge(card, view).loadout).toBe("Edited");
  });

  it("omits a field the datasource never had until it has text", () => {
    const stratagem = {
      source: "40k-11e",
      cardType: "stratagem",
      name: "Insane Bravery",
      when: { en: "Battle-shock step", de: "Schlachtschock" },
      effect: { en: "Auto-pass", de: "Automatisch" },
    };
    const spec = getLocalizationSpec(stratagem, "40k-11e");
    const view = projectCard(stratagem, spec, "de");

    view.restrictions = "";
    expect(mergeCard(view, spec, "de")).not.toHaveProperty("restrictions");

    view.restrictions = "Einmal pro Schlacht";
    expect(mergeCard(view, spec, "de").restrictions).toEqual({ de: "Einmal pro Schlacht" });
  });

  it("keeps other languages when a field that has text is cleared", () => {
    const card = unit11e();
    const view = project(card);
    view.loadout = "";
    expect(merge(card, view).loadout).toEqual({ en: "Equipped with a bolt rifle", de: "" });
  });

  it("clears a points tier restriction back to null", () => {
    const card = unit11e();
    const view = project(card);
    expect(view.points[1].detachment).toBe("Gladius Task Force");

    view.points[1].detachment = "";
    const merged = merge(card, view);
    expect(merged.points[1].detachment).toBeNull();
    expect(merged.points[0].detachment).toBeNull();
  });

  it("merges a points tier restriction into the active language", () => {
    const card = unit11e();
    const view = project(card);
    view.points[1].detachment = "Gladius DE";
    expect(merge(card, view).points[1].detachment).toEqual({ en: "Gladius Task Force", de: "Gladius DE" });
  });

  it("leaves the enhancement eligibility keywords as plain strings", () => {
    const enhancement = {
      source: "40k-11e",
      cardType: "enhancement",
      name: "Artificer Armour",
      cost: "10",
      description: { en: "Improve save", de: "Rettung" },
      keywords: ["Infantry"],
      excludes: ["Named Character"],
    };
    const spec = getLocalizationSpec(enhancement, "40k-11e");
    const view = projectCard(enhancement, spec, "de");

    expect(view.keywords).toEqual(["Infantry"]);
    view.keywords = ["Infantry", "Biker"];
    expect(mergeCard(view, spec, "de").keywords).toEqual(["Infantry", "Biker"]);
  });
});
