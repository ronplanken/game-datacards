import { describe, it, expect } from "vitest";
import {
  getCardBaseCost,
  computeCategoryPoints,
  getCategoryPointsTotal,
  getSelectablePointsTiers,
  isSamePointsTier,
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
