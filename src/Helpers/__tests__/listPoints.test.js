import { describe, it, expect } from "vitest";
import {
  computeCategoryPoints,
  filterPointsTiersForArmy,
  getCardBaseCost,
  getCardDisplayCost,
  getCardWargearCost,
  getCategoryPointsTotal,
  getPaidWargearOptions,
  getPointsTierRestrictionLabel,
  getSelectablePointsTiers,
  getWargearQuantity,
  getWargearQuantityMax,
  isSamePointsTier,
  setWargearQuantity,
} from "../listPoints.helpers";

const atrapos = (over = {}) => ({
  id: "atrapos",
  source: "40k-11e",
  name: "Cerastus Knight Atrapos",
  points: [{ cost: "405", models: "1" }],
  additionalCost: { cost: "20", afterSelections: 1 },
  ...over,
});

describe("getSelectablePointsTiers", () => {
  it("keeps 10e tiers flagged active and drops inactive ones", () => {
    const card = {
      points: [
        { models: 5, cost: 90, active: true },
        { models: 10, cost: 170, active: false },
      ],
    };
    expect(getSelectablePointsTiers(card)).toEqual([{ models: 5, cost: 90, active: true }]);
  });

  it("keeps 11e tiers that carry no active flag at all", () => {
    const card = {
      points: [
        { models: "1", cost: "405", keyword: null, detachment: null },
        { models: "2", cost: "425", keyword: null, detachment: null },
      ],
    };
    expect(getSelectablePointsTiers(card)).toHaveLength(2);
  });

  it("returns an empty array for missing points", () => {
    expect(getSelectablePointsTiers({})).toEqual([]);
    expect(getSelectablePointsTiers(undefined)).toEqual([]);
  });
});

describe("isSamePointsTier", () => {
  it("matches tiers by value across storage round-trips (different references)", () => {
    const tier = { models: "2", cost: "425", keyword: { en: "Imperium" } };
    const roundTripped = JSON.parse(JSON.stringify(tier));
    expect(isSamePointsTier(roundTripped, tier)).toBe(true);
  });

  it("distinguishes tiers by models and by keyword", () => {
    const base = { models: "1", cost: "100", keyword: null };
    expect(isSamePointsTier(base, { models: "2", cost: "100", keyword: null })).toBe(false);
    expect(isSamePointsTier(base, { models: "1", cost: "100", keyword: { en: "Imperium" } })).toBe(false);
  });

  it("treats plain-string and language-keyed keywords with the same text as equal", () => {
    expect(isSamePointsTier({ models: 5, keyword: "Imperium" }, { models: 5, keyword: { en: "Imperium" } })).toBe(true);
  });

  it("is false when either side is missing", () => {
    expect(isSamePointsTier(undefined, { models: 1 })).toBe(false);
    expect(isSamePointsTier({ models: 1 }, undefined)).toBe(false);
  });
});

describe("getCardBaseCost", () => {
  it("uses the chosen unitSize cost when configured", () => {
    expect(getCardBaseCost({ source: "40k-10e", unitSize: { cost: "150", models: "10" } })).toBe(150);
  });

  it("defaults an unconfigured 11e card to its cheapest points tier", () => {
    const card = {
      source: "40k-11e",
      points: [
        { cost: "160", models: "10" },
        { cost: "85", models: "5" },
      ],
    };
    expect(getCardBaseCost(card)).toBe(85);
  });

  it("returns 0 for an unconfigured 10e card (config still required)", () => {
    expect(getCardBaseCost({ source: "40k-10e", points: [{ cost: "100", models: "5" }] })).toBe(0);
  });

  it("returns 0 when there is nothing to price", () => {
    expect(getCardBaseCost({ source: "aos" })).toBe(0);
    expect(getCardBaseCost(undefined)).toBe(0);
  });
});

describe("computeCategoryPoints", () => {
  it("sums base costs and enhancements", () => {
    const cards = [{ source: "40k-10e", unitSize: { cost: "150" }, selectedEnhancement: { cost: "15" } }, atrapos()];
    const { base, surcharge, total } = computeCategoryPoints(cards);
    expect(base).toBe(150 + 15 + 405);
    expect(surcharge).toBe(0); // single Atrapos, afterSelections 1
    expect(total).toBe(570);
  });

  it("adds the roster surcharge for duplicate datasheets beyond afterSelections", () => {
    // 2 Atrapos: first free of surcharge, second +20.
    const { base, surcharge, total } = computeCategoryPoints([atrapos(), atrapos()]);
    expect(base).toBe(810);
    expect(surcharge).toBe(20);
    expect(total).toBe(830);
  });

  it("honours afterSelections > 1", () => {
    // Castigator: afterSelections 2, +10 each after. 3 copies -> +10.
    const castigator = () => ({
      id: "castigator",
      source: "40k-11e",
      points: [{ cost: "165", models: "1" }],
      additionalCost: { cost: "10", afterSelections: 2 },
    });
    const { surcharge } = computeCategoryPoints([castigator(), castigator(), castigator()]);
    expect(surcharge).toBe(10);
  });

  it("groups by datasheet identity — different datasheets do not combine", () => {
    const other = atrapos({ id: "acheron", name: "Cerastus Knight Acheron" });
    const { surcharge } = computeCategoryPoints([atrapos(), other]);
    expect(surcharge).toBe(0); // one of each, neither exceeds afterSelections
  });

  it("leaves 10e-only lists unaffected (no additionalCost)", () => {
    const cards = [
      { source: "40k-10e", unitSize: { cost: "100" } },
      { source: "40k-10e", unitSize: { cost: "100" } },
    ];
    expect(computeCategoryPoints(cards)).toEqual({ base: 200, surcharge: 0, total: 200 });
  });

  it("handles empty / invalid input", () => {
    expect(computeCategoryPoints([])).toEqual({ base: 0, surcharge: 0, total: 0 });
    expect(computeCategoryPoints(undefined)).toEqual({ base: 0, surcharge: 0, total: 0 });
  });
});

describe("getCategoryPointsTotal", () => {
  it("returns the grand total including surcharge", () => {
    expect(getCategoryPointsTotal([atrapos(), atrapos()])).toBe(830);
  });
});

describe("getCardDisplayCost", () => {
  const knight = (uuid) => ({
    uuid,
    name: "Knight Castellan",
    id: "knight-castellan",
    source: "40k-11e",
    unitSize: { models: 1, cost: "400" },
    additionalCost: { cost: "20", afterSelections: 1 },
  });

  it("shows the plain cost for the first copy", () => {
    const cards = [knight("a")];
    expect(getCardDisplayCost(cards[0], cards)).toBe(400);
  });

  it("adds the surcharge to copies beyond the included number", () => {
    // Ron's case: two Knight Castellans, +20 for each copy beyond 1.
    const cards = [knight("a"), knight("b")];
    expect(getCardDisplayCost(cards[0], cards)).toBe(400);
    expect(getCardDisplayCost(cards[1], cards)).toBe(420);
  });

  it("keeps the displayed rows summing to the list total", () => {
    const cards = [knight("a"), knight("b"), knight("c")];
    const rows = cards.map((card) => getCardDisplayCost(card, cards));
    expect(rows).toEqual([400, 420, 420]);
    expect(rows.reduce((sum, n) => sum + n, 0)).toBe(getCategoryPointsTotal(cards));
  });

  it("respects a higher afterSelections threshold", () => {
    const castigator = (uuid) => ({
      uuid,
      id: "castigator",
      source: "40k-11e",
      unitSize: { models: 1, cost: "150" },
      additionalCost: { cost: "10", afterSelections: 2 },
    });
    const cards = [castigator("a"), castigator("b"), castigator("c")];
    expect(cards.map((c) => getCardDisplayCost(c, cards))).toEqual([150, 150, 160]);
  });

  it("includes the enhancement cost", () => {
    const card = { uuid: "a", unitSize: { cost: "80" }, selectedEnhancement: { cost: "15" } };
    expect(getCardDisplayCost(card, [card])).toBe(95);
  });

  it("does not surcharge different datasheets that each appear once", () => {
    const cards = [knight("a"), { ...knight("b"), id: "knight-valiant", name: "Knight Valiant" }];
    expect(cards.map((c) => getCardDisplayCost(c, cards))).toEqual([400, 400]);
  });

  it("is safe without a list and for cards with no surcharge", () => {
    const plain = { uuid: "a", unitSize: { cost: "100" } };
    expect(getCardDisplayCost(plain, undefined)).toBe(100);
    expect(getCardDisplayCost(knight("a"), undefined)).toBe(400);
  });
});

describe("getPaidWargearOptions", () => {
  // The shape of a Terminator Assault Squad: the same group repeated once per
  // model, mixing a free swap with a paid one.
  const assaultTerminators = {
    source: "40k-11e",
    wargearOptions: [
      {
        instruction: { en: "Any number of models can each have their power fist replaced." },
        options: [
          { name: { en: "Thunder hammer" }, cost: "5" },
          { name: { en: "Lightning claw" }, cost: "0" },
        ],
      },
      {
        instruction: { en: "Any number of models can each have their power fist replaced." },
        options: [
          { name: { en: "Thunder hammer" }, cost: "5" },
          { name: { en: "Lightning claw" }, cost: "0" },
        ],
      },
    ],
  };

  it("keeps only the options that cost points", () => {
    expect(getPaidWargearOptions(assaultTerminators)).toEqual([{ name: { en: "Thunder hammer" }, cost: 5 }]);
  });

  it("collapses the duplicate groups the 11e data repeats per model", () => {
    expect(getPaidWargearOptions(assaultTerminators)).toHaveLength(1);
  });

  it("keeps distinct paid options and coerces string costs to numbers", () => {
    const victrix = {
      wargearOptions: [
        {
          options: [
            { name: { en: "Banner of Macragge" }, cost: "15" },
            { name: { en: "Blades of honour" }, cost: "10" },
          ],
        },
      ],
    };
    expect(getPaidWargearOptions(victrix)).toEqual([
      { name: { en: "Banner of Macragge" }, cost: 15 },
      { name: { en: "Blades of honour" }, cost: 10 },
    ]);
  });

  it("treats the same option at two prices as two choices", () => {
    const card = {
      wargearOptions: [
        { options: [{ name: { en: "Storm shield" }, cost: "5" }] },
        { options: [{ name: { en: "Storm shield" }, cost: "10" }] },
      ],
    };
    expect(getPaidWargearOptions(card)).toHaveLength(2);
  });

  it("returns nothing for cards without (or with only free) wargear options", () => {
    expect(
      getPaidWargearOptions({ wargearOptions: [{ options: [{ name: { en: "Chainsword" }, cost: "0" }] }] }),
    ).toEqual([]);
    expect(getPaidWargearOptions({ source: "40k-10e" })).toEqual([]);
    expect(getPaidWargearOptions(undefined)).toEqual([]);
  });
});

describe("getWargearQuantity / setWargearQuantity", () => {
  const hammer = { name: { en: "Thunder hammer" }, cost: 5 };

  it("reports 0 for an option that is not taken", () => {
    expect(getWargearQuantity([], hammer)).toBe(0);
    expect(getWargearQuantity(undefined, hammer)).toBe(0);
  });

  it("adds, updates and removes an option", () => {
    let selected = setWargearQuantity([], hammer, 2);
    expect(selected).toEqual([{ name: { en: "Thunder hammer" }, cost: 5, quantity: 2 }]);
    expect(getWargearQuantity(selected, hammer)).toBe(2);

    selected = setWargearQuantity(selected, hammer, 3);
    expect(selected).toHaveLength(1);
    expect(getWargearQuantity(selected, hammer)).toBe(3);

    // Dropping to zero removes the entry rather than storing a zero quantity.
    expect(setWargearQuantity(selected, hammer, 0)).toEqual([]);
  });

  it("keeps existing entries in place so the list does not reshuffle", () => {
    const banner = { name: { en: "Banner of Macragge" }, cost: 15 };
    const selected = setWargearQuantity(setWargearQuantity([], hammer, 1), banner, 1);
    const updated = setWargearQuantity(selected, hammer, 2);
    expect(updated.map((entry) => entry.name.en)).toEqual(["Thunder hammer", "Banner of Macragge"]);
  });

  it("matches a selection saved as a plain string name", () => {
    const selected = [{ name: "Thunder hammer", cost: 5, quantity: 2 }];
    expect(getWargearQuantity(selected, hammer)).toBe(2);
  });

  it("counts a legacy entry with no quantity as one", () => {
    expect(getWargearQuantity([{ name: { en: "Thunder hammer" }, cost: 5 }], hammer)).toBe(1);
  });
});

describe("getWargearQuantityMax", () => {
  it("caps quantities at the model count of the chosen tier", () => {
    expect(getWargearQuantityMax({ models: "5", cost: "170" })).toBe(5);
    expect(getWargearQuantityMax({ models: 10 })).toBe(10);
  });

  it("falls back to a sane cap when the tier says nothing useful", () => {
    expect(getWargearQuantityMax(undefined)).toBe(10);
    expect(getWargearQuantityMax({ models: "0" })).toBe(10);
    expect(getWargearQuantityMax({ models: "?" })).toBe(10);
  });
});

describe("getCardWargearCost", () => {
  it("multiplies each selection by its quantity", () => {
    const card = {
      selectedWargear: [
        { name: { en: "Thunder hammer" }, cost: 5, quantity: 3 },
        { name: { en: "Banner of Macragge" }, cost: 15, quantity: 1 },
      ],
    };
    expect(getCardWargearCost(card)).toBe(30);
  });

  it("counts an entry with no quantity once", () => {
    expect(getCardWargearCost({ selectedWargear: [{ cost: 10 }] })).toBe(10);
  });

  it("accepts string costs", () => {
    expect(getCardWargearCost({ selectedWargear: [{ cost: "10", quantity: 2 }] })).toBe(20);
  });

  it("is 0 for cards with no (or invalid) wargear selection", () => {
    expect(getCardWargearCost({ source: "40k-10e" })).toBe(0);
    expect(getCardWargearCost({ selectedWargear: [] })).toBe(0);
    expect(getCardWargearCost({ selectedWargear: [{ cost: "free" }, null] })).toBe(0);
    expect(getCardWargearCost({ selectedWargear: "nonsense" })).toBe(0);
    expect(getCardWargearCost(undefined)).toBe(0);
  });
});

describe("wargear points in list totals", () => {
  const redemptor = (uuid) => ({
    uuid,
    id: "redemptor",
    source: "40k-11e",
    unitSize: { models: 1, cost: "210" },
    selectedWargear: [{ name: { en: "Macro plasma incinerator" }, cost: 10, quantity: 1 }],
  });

  it("adds wargear to a card's displayed cost", () => {
    const cards = [redemptor("a")];
    expect(getCardDisplayCost(cards[0], cards)).toBe(220);
  });

  it("adds wargear to the category base, alongside the enhancement", () => {
    const cards = [{ ...redemptor("a"), selectedEnhancement: { cost: "15" } }];
    expect(computeCategoryPoints(cards)).toEqual({ base: 235, surcharge: 0, total: 235 });
  });

  it("keeps the displayed rows summing to the list total", () => {
    const cards = [redemptor("a"), redemptor("b")];
    const rows = cards.map((card) => getCardDisplayCost(card, cards));
    expect(rows).toEqual([220, 220]);
    expect(rows.reduce((sum, n) => sum + n, 0)).toBe(getCategoryPointsTotal(cards));
  });

  it("leaves cards without a wargear selection untouched", () => {
    const cards = [{ source: "40k-10e", unitSize: { cost: "100" } }];
    expect(computeCategoryPoints(cards)).toEqual({ base: 100, surcharge: 0, total: 100 });
  });
});

describe("filterPointsTiersForArmy", () => {
  const generic = { models: "5", cost: "75" };
  const bloodAngels = { models: "5", cost: "80", faction: { en: "Blood Angels" } };
  const tenGeneric = { models: "10", cost: "150" };
  const ctanGeneric = { models: "1", cost: "330" };
  const ctanPantheon = { models: "1", cost: "375", detachment: { en: "Pantheon of Woe" } };

  it("leaves unrestricted tiers untouched", () => {
    const tiers = [tenGeneric, generic];
    expect(filterPointsTiersForArmy(tiers, { detachments: [], factions: [] })).toEqual(tiers);
  });

  it("hides a faction price the army does not have", () => {
    const result = filterPointsTiersForArmy([tenGeneric, generic, bloodAngels], {
      factions: ["Adeptus Astartes"],
    });
    expect(result).toEqual([tenGeneric, generic]);
  });

  it("shows only the faction price when the army has that keyword", () => {
    const result = filterPointsTiersForArmy([tenGeneric, generic, bloodAngels], {
      factions: ["Adeptus Astartes", "Blood Angels"],
    });
    expect(result).toEqual([tenGeneric, bloodAngels]);
  });

  it("applies the same rule to detachment-scoped prices", () => {
    expect(filterPointsTiersForArmy([ctanGeneric, ctanPantheon], { detachments: [] })).toEqual([ctanGeneric]);
    expect(filterPointsTiersForArmy([ctanGeneric, ctanPantheon], { detachments: ["Pantheon of Woe"] })).toEqual([
      ctanPantheon,
    ]);
  });

  it("matches names case-insensitively", () => {
    const result = filterPointsTiersForArmy([generic, bloodAngels], { factions: ["blood angels"] });
    expect(result).toEqual([bloodAngels]);
  });

  it("only replaces within the same tier, leaving other sizes alone", () => {
    const result = filterPointsTiersForArmy([tenGeneric, generic, bloodAngels], { factions: ["Blood Angels"] });
    expect(result).toContain(tenGeneric);
  });

  it("keeps a tier that would otherwise have no option left", () => {
    // A datasheet priced only inside a detachment must not become unselectable.
    const onlyRestricted = [{ models: "1", cost: "115", detachment: { en: "Veiled Blade Elimination Force" } }];
    expect(filterPointsTiersForArmy(onlyRestricted, { detachments: [] })).toEqual(onlyRestricted);
  });

  it("treats a missing army as having nothing selected", () => {
    expect(filterPointsTiersForArmy([generic, bloodAngels])).toEqual([generic]);
  });
});

describe("getPointsTierRestrictionLabel", () => {
  it("prefers the detachment, then the faction, in the reader's language", () => {
    expect(
      getPointsTierRestrictionLabel({ detachment: { en: "Pantheon of Woe", de: "Pantheon des Wehs" } }, "de"),
    ).toBe("Pantheon des Wehs");
    expect(getPointsTierRestrictionLabel({ faction: { en: "Blood Angels" } }, "en")).toBe("Blood Angels");
    expect(getPointsTierRestrictionLabel({ models: "5", cost: "75" }, "en")).toBe("");
  });
});
