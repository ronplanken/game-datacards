import { describe, it, expect } from "vitest";
import {
  BATTLE_SIZES,
  canAddDetachment,
  describeRepricedCards,
  getArmyFactionKeywords,
  getBattleSize,
  getDetachmentCost,
  getDetachmentNamesEn,
  getEnhancementUsage,
  getForceDispositions,
  getSpentDetachmentPoints,
  isDetachmentSelected,
  isEnhancementInDetachments,
  toggleDetachment,
  getListFactionId,
  getArmyContext,
  repriceListCards,
} from "../listRoster.helpers";

const det = (name, points, id, disposition) => ({
  id,
  name: { en: name },
  detachmentPoints: points,
  forceDisposition: disposition ? { name: { en: disposition } } : undefined,
});

describe("battle sizes", () => {
  it("matches the 11e Select Battle Size table", () => {
    expect(BATTLE_SIZES.map((b) => [b.key, b.points, b.dp, b.enhancementLimit, b.unitLimit])).toEqual([
      ["incursion", 1000, 2, 2, 2],
      ["strikeForce", 2000, 3, 4, 3],
    ]);
  });

  it("falls back to Strike Force for unknown keys", () => {
    expect(getBattleSize("nope").key).toBe("strikeForce");
    expect(getBattleSize("incursion").points).toBe(1000);
  });
});

describe("detachment points", () => {
  it("reads a detachment's DP cost, defaulting to 1", () => {
    expect(getDetachmentCost(det("A", 3, "a"))).toBe(3);
    expect(getDetachmentCost({ name: { en: "B" } })).toBe(1);
  });

  it("sums the spent DP", () => {
    expect(getSpentDetachmentPoints([det("A", 2, "a"), det("B", 1, "b")])).toBe(3);
    expect(getSpentDetachmentPoints([])).toBe(0);
  });
});

describe("selecting multiple detachments", () => {
  const a = det("Lions of the Emperor", 2, "a");
  const b = det("Shield Host", 1, "b");
  const c = det("Talons", 3, "c");

  it("allows several detachments while the DP budget lasts", () => {
    // Strike Force = 3 DP: 2 + 1 fits.
    expect(canAddDetachment([a], b, "strikeForce")).toBe(true);
    expect(getSpentDetachmentPoints(toggleDetachment([a], b, "strikeForce"))).toBe(3);
  });

  it("refuses a detachment that would exceed the DP budget", () => {
    // Incursion = 2 DP: a (2) already fills it.
    expect(canAddDetachment([a], b, "incursion")).toBe(false);
    expect(toggleDetachment([a], b, "incursion")).toHaveLength(1);
    expect(canAddDetachment([], c, "strikeForce")).toBe(true);
    expect(canAddDetachment([b], c, "strikeForce")).toBe(false);
  });

  it("never selects the same detachment twice", () => {
    expect(isDetachmentSelected([a], det("Lions of the Emperor", 2, "a"))).toBe(true);
    expect(canAddDetachment([a], a, "strikeForce")).toBe(false);
  });

  it("toggles a selected detachment off", () => {
    expect(toggleDetachment([a, b], a, "strikeForce").map((d) => d.id)).toEqual(["b"]);
  });
});

describe("force dispositions", () => {
  it("lists one disposition per selected detachment", () => {
    const list = [det("Lions of the Emperor", 2, "a", "Disruption"), det("Shield Host", 1, "b", "Vanguard")];
    expect(getForceDispositions(list)).toEqual([
      { detachment: "Lions of the Emperor", disposition: "Disruption" },
      { detachment: "Shield Host", disposition: "Vanguard" },
    ]);
  });
});

describe("enhancement availability across detachments", () => {
  const list = [det("Lions of the Emperor", 2, "a"), det("Shield Host", 1, "b")];

  it("offers enhancements from any selected detachment", () => {
    expect(getDetachmentNamesEn(list)).toEqual(["Lions of the Emperor", "Shield Host"]);
    expect(isEnhancementInDetachments({ detachment: "Shield Host" }, list)).toBe(true);
    expect(isEnhancementInDetachments({ detachment: "Auric Champions" }, list)).toBe(false);
  });

  it("always offers detachment-less enhancements", () => {
    expect(isEnhancementInDetachments({ name: "X" }, list)).toBe(true);
  });

  it("falls back to the legacy single detachment when none are selected", () => {
    expect(isEnhancementInDetachments({ detachment: "Shield Host" }, [], "Shield Host")).toBe(true);
    expect(isEnhancementInDetachments({ detachment: "Shield Host" }, [], "Lions of the Emperor")).toBe(false);
    // No army detachments and no fallback: stay permissive.
    expect(isEnhancementInDetachments({ detachment: "Shield Host" }, [])).toBe(true);
  });
});

describe("enhancement limit", () => {
  it("counts used enhancements against the battle size limit", () => {
    const cards = [{ selectedEnhancement: { name: "A" } }, { selectedEnhancement: { name: "B" } }, {}];
    expect(getEnhancementUsage(cards, "strikeForce")).toEqual({ used: 2, limit: 4, exceeded: false });
    expect(getEnhancementUsage(cards, "incursion")).toEqual({ used: 2, limit: 2, exceeded: false });
    expect(getEnhancementUsage([...cards, { selectedEnhancement: { name: "C" } }], "incursion").exceeded).toBe(true);
  });
});

describe("Incursion 3DP exception", () => {
  const threeDp = det("Talons of the Emperor", 3, "d-talons");
  const oneDp = det("Shield Host", 1, "d-shield");

  it("allows a 3DP detachment as the army's only detachment at Incursion", () => {
    // Incursion has a 2 DP budget, but a single 3DP detachment is allowed.
    expect(canAddDetachment([], threeDp, "incursion")).toBe(true);
    expect(getSpentDetachmentPoints(toggleDetachment([], threeDp, "incursion"))).toBe(3);
  });

  it("blocks anything else once the over-budget detachment is taken", () => {
    expect(canAddDetachment([threeDp], oneDp, "incursion")).toBe(false);
  });

  it("still blocks a second detachment that would exceed the budget", () => {
    // 1 DP spent, budget 2: a 3DP detachment no longer fits and is not solo.
    expect(canAddDetachment([oneDp], threeDp, "incursion")).toBe(false);
  });

  it("is scoped to Incursion — other battle sizes get no solo over-budget pick", () => {
    // Not reachable with today's data (nothing costs more than Strike Force's
    // 3 DP), but the allowance must not leak to other battle sizes.
    const fourDp = det("Oversized", 4, "d-over");
    expect(canAddDetachment([], fourDp, "incursion")).toBe(true);
    expect(canAddDetachment([], fourDp, "strikeForce")).toBe(false);
  });
});

describe("enhancement usage counting", () => {
  const regular = (name) => ({ name });
  const upgrade = (name) => ({ name, equipableByNonCharacter: true });
  const card = (enhancement) => ({ selectedEnhancement: enhancement });

  it("counts each regular enhancement", () => {
    const cards = [card(regular("A")), card(regular("B"))];
    expect(getEnhancementUsage(cards, "strikeForce").used).toBe(2);
  });

  it("counts repeated Upgrades only once", () => {
    // "the second and third instances of the same Upgrade do not count towards
    // the total number of enhancements in your army"
    const cards = [card(upgrade("Vexilla")), card(upgrade("Vexilla")), card(upgrade("Vexilla"))];
    expect(getEnhancementUsage(cards, "strikeForce").used).toBe(1);
  });

  it("counts distinct Upgrades separately", () => {
    const cards = [card(upgrade("Vexilla")), card(upgrade("Sarcophagus")), card(upgrade("Vexilla"))];
    expect(getEnhancementUsage(cards, "strikeForce").used).toBe(2);
  });

  it("flags exceeding the battle size limit", () => {
    const cards = [card(regular("A")), card(regular("B")), card(regular("C"))];
    expect(getEnhancementUsage(cards, "incursion").exceeded).toBe(true);
    expect(getEnhancementUsage(cards, "strikeForce").exceeded).toBe(false);
  });
});

describe("getArmyFactionKeywords", () => {
  it("collects every faction keyword in the list, deduplicated", () => {
    const cards = [
      { factions: ["Adeptus Astartes"] },
      { factions: ["Adeptus Astartes", "Blood Angels"] },
      { factions: ["Blood Angels"] },
    ];
    expect(getArmyFactionKeywords(cards).sort()).toEqual(["Adeptus Astartes", "Blood Angels"]);
  });

  it("resolves language-keyed keywords to English", () => {
    expect(getArmyFactionKeywords([{ factions: [{ en: "Blood Angels", de: "Blutengel" }] }])).toEqual(["Blood Angels"]);
  });

  it("returns nothing for an empty or missing list", () => {
    expect(getArmyFactionKeywords([])).toEqual([]);
    expect(getArmyFactionKeywords(undefined)).toEqual([]);
    expect(getArmyFactionKeywords([{}, { factions: [] }])).toEqual([]);
  });
});

describe("list faction and army context", () => {
  it("prefers the faction recorded on the list", () => {
    expect(getListFactionId({ factionId: "CHBA", cards: [{ faction_id: "SM" }] })).toBe("CHBA");
  });

  it("falls back to the first card's faction for older lists", () => {
    expect(getListFactionId({ cards: [{}, { faction_id: "SM" }] })).toBe("SM");
    expect(getListFactionId({ cards: [] })).toBeUndefined();
  });

  it("counts the list's own faction keyword before any card is added", () => {
    // The Blood Angels case: an empty list already reads as Blood Angels, so
    // faction-scoped prices apply to the first unit added.
    expect(getArmyFactionKeywords([], "Blood Angels")).toEqual(["Blood Angels"]);
  });

  it("merges the list faction with the keywords its cards field", () => {
    const cards = [{ factions: ["Adeptus Astartes", "Blood Angels"] }];
    expect(getArmyFactionKeywords(cards, "Blood Angels").sort()).toEqual(["Adeptus Astartes", "Blood Angels"]);
  });

  it("builds the army context from the list's detachments and faction", () => {
    const category = {
      factionId: "CHBA",
      detachments: [{ name: { en: "Liberator Assault Group" } }],
      cards: [{ factions: ["Adeptus Astartes"] }],
    };
    expect(getArmyContext(category, { name: "Blood Angels" })).toEqual({
      detachments: ["Liberator Assault Group"],
      factions: ["Blood Angels", "Adeptus Astartes"],
    });
  });
});

describe("repriceListCards", () => {
  // Assault Intercessors: 75 for 5 generally, 80 in a Blood Angels army.
  const assaultIntercessors = (unitSize) => ({
    uuid: "a",
    name: "Assault Intercessor Squad",
    unitSize,
    points: [
      { models: "5", cost: "75", keyword: null },
      { models: "5", cost: "80", keyword: null, faction: "Blood Angels" },
      { models: "10", cost: "150", keyword: null },
    ],
  });

  it("raises the price when the army matches a faction-scoped tier", () => {
    const cards = [assaultIntercessors({ models: "5", cost: "75", keyword: null })];
    const { cards: repriced, changes } = repriceListCards(cards, { factions: ["Blood Angels"] });
    expect(repriced[0].unitSize.cost).toBe("80");
    expect(changes).toEqual([{ name: "Assault Intercessor Squad", from: 75, to: 80 }]);
  });

  it("restores the generic price when the army no longer matches", () => {
    const cards = [assaultIntercessors({ models: "5", cost: "80", keyword: null })];
    const { cards: repriced, changes } = repriceListCards(cards, { factions: [] });
    expect(repriced[0].unitSize.cost).toBe("75");
    expect(changes[0]).toMatchObject({ from: 80, to: 75 });
  });

  it("keeps the chosen size, only swapping its price", () => {
    const cards = [assaultIntercessors({ models: "10", cost: "150", keyword: null })];
    const { cards: repriced, changes } = repriceListCards(cards, { factions: ["Blood Angels"] });
    expect(repriced[0].unitSize.models).toBe("10");
    expect(changes).toEqual([]);
  });

  it("returns the original array when nothing changes", () => {
    const cards = [assaultIntercessors({ models: "5", cost: "75", keyword: null })];
    const result = repriceListCards(cards, { factions: [] });
    expect(result.cards).toBe(cards);
    expect(result.changes).toEqual([]);
  });

  it("follows a detachment-scoped price", () => {
    const ctan = {
      uuid: "c",
      name: "C'tan Shard",
      unitSize: { models: "1", cost: "270", keyword: null },
      points: [
        { models: "1", cost: "270", keyword: null },
        { models: "1", cost: "300", keyword: null, detachment: "Pantheon of Woe" },
      ],
    };
    const { cards, changes } = repriceListCards([ctan], { detachments: ["Pantheon of Woe"] });
    expect(cards[0].unitSize.cost).toBe("300");
    expect(changes[0]).toMatchObject({ from: 270, to: 300 });
  });

  it("leaves unconfigured cards alone", () => {
    const cards = [{ uuid: "x", name: "Unset", points: [{ models: "5", cost: "75" }] }];
    expect(repriceListCards(cards, { factions: ["Blood Angels"] }).changes).toEqual([]);
  });
});

describe("describeRepricedCards", () => {
  it("is empty when nothing changed", () => {
    expect(describeRepricedCards([])).toBe("");
    expect(describeRepricedCards(undefined)).toBe("");
  });

  it("names the units whose points changed", () => {
    expect(describeRepricedCards([{ name: "Assault Intercessor Squad", from: 75, to: 80 }])).toBe(
      "Points updated: Assault Intercessor Squad 75 to 80 pts",
    );
  });

  it("summarises the tail once more than three units changed", () => {
    const changes = ["A", "B", "C", "D", "E"].map((name) => ({ name, from: 10, to: 20 }));
    const summary = describeRepricedCards(changes);
    expect(summary).toContain("A 10 to 20 pts");
    expect(summary).toContain("C 10 to 20 pts");
    expect(summary).not.toContain("D 10 to 20 pts");
    expect(summary).toContain("and 2 more");
  });
});
