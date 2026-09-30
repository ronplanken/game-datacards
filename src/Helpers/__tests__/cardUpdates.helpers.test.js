import { describe, it, expect } from "vitest";
import {
  CARD_UPDATE_STATUS,
  applyCardUpdates,
  applySourceUpdate,
  buildDatasourceCardIndex,
  checkCardsForUpdates,
  collectFactionCards,
  diffCardContent,
  findSourceCard,
  formatChangePath,
  formatChangeValue,
  getCardUpdateStatus,
} from "../cardUpdates.helpers";

const intercessors = {
  id: "unit-1",
  name: "Intercessors",
  cardType: "DataCard",
  source: "40k-10e",
  faction_id: "SM",
  stats: [{ m: '6"', t: "4", sv: "3+", w: "2", ld: "6+", oc: "2", active: true, showName: false }],
  rangedWeapons: [
    {
      active: true,
      profiles: [
        {
          active: true,
          name: "Bolt rifle",
          range: '24"',
          attacks: "2",
          skill: "3+",
          strength: "4",
          ap: "-1",
          damage: "1",
        },
      ],
    },
  ],
  abilities: { core: ["Deep Strike"], faction: ["Oath of Moment"], other: [] },
  keywords: ["Infantry", "Battleline", "Imperium"],
  points: [
    { models: "5", cost: "80", active: true },
    { models: "10", cost: "160", active: true },
  ],
};

const dataSource = {
  data: [
    {
      id: "SM",
      name: "Space Marines",
      datasheets: [intercessors],
      stratagems: [{ id: "strat-1", name: "Armour of Contempt", cardType: "stratagem", source: "40k-10e", cp_cost: 1 }],
      enhancements: [{ id: "enh-1", name: "Artificer Armour", cost: "10", faction_id: "SM" }],
      detachments: [{ id: "det-1", name: "Gladius" }],
      rules: {
        army: [{ name: "Oath of Moment", rule: [{ text: "Re-roll hits." }] }],
        detachment: [{ detachment: "Gladius", rules: [{ name: "Combat Doctrines", rule: [] }] }],
      },
    },
    {
      id: "BA",
      name: "Blood Angels",
      datasheets: [{ ...intercessors, faction_id: "BA", points: [{ models: "5", cost: "85", active: true }] }],
    },
  ],
};

const saved = (overrides = {}) => ({
  ...JSON.parse(JSON.stringify(intercessors)),
  uuid: "card-uuid",
  isCustom: true,
  ...overrides,
});

describe("collectFactionCards", () => {
  it("returns datasheets, stratagems, enhancements and rule cards in their added shape", () => {
    const cards = collectFactionCards(dataSource.data[0], "40k-10e");
    const keys = cards.map((card) => `${card.cardType}:${card.id}`);
    expect(keys).toContain("DataCard:unit-1");
    expect(keys).toContain("stratagem:strat-1");
    expect(keys).toContain("enhancement:enh-1");
    expect(keys).toContain("rule:army-rule-Oath of Moment");
    expect(keys).toContain("rule:detachment-rule-Gladius-Combat Doctrines");
    expect(keys.some((key) => key.includes("det-1"))).toBe(false);
  });

  it("shapes AoS warscrolls and spells like the browse list", () => {
    const cards = collectFactionCards(
      {
        id: "STD",
        warscrolls: [{ id: "w1", name: "Liberators" }],
        lores: [{ name: "Lore of Sigmar", spells: [{ id: "s1", name: "Bolt" }] }],
        manifestationLores: [{ name: "Manifestations", faction_id: "GENERIC", spells: [{ id: "m1", name: "Orb" }] }],
      },
      "aos",
    );
    expect(cards.find((card) => card.id === "w1")).toMatchObject({
      cardType: "warscroll",
      source: "aos",
      faction_id: "STD",
    });
    expect(cards.find((card) => card.id === "s1")).toMatchObject({ cardType: "spell", spellType: "spell" });
    expect(cards.find((card) => card.id === "m1")).toMatchObject({
      spellType: "manifestation",
      faction_id: "GENERIC",
    });
  });
});

describe("findSourceCard", () => {
  const index = buildDatasourceCardIndex(dataSource, "40k-10e");

  it("prefers the candidate from the card's own faction", () => {
    expect(findSourceCard(saved({ faction_id: "BA" }), index).faction_id).toBe("BA");
    expect(findSourceCard(saved(), index).faction_id).toBe("SM");
  });

  it("ignores candidates from another source", () => {
    expect(findSourceCard(saved({ source: "40k-11e" }), index)).toBeUndefined();
  });
});

describe("diffCardContent", () => {
  it("reports no changes for an unmodified copy", () => {
    expect(diffCardContent(saved({ unitSize: { models: "5", cost: "80" }, isWarlord: true }), intercessors)).toEqual(
      [],
    );
  });

  it("ignores display toggles the user changed", () => {
    const card = saved();
    card.rangedWeapons[0].active = false;
    card.stats[0].showName = true;
    expect(diffCardContent(card, intercessors)).toEqual([]);
  });

  it("describes changed values by named path", () => {
    const card = saved();
    card.rangedWeapons[0].profiles[0].ap = "0";
    card.points[0].cost = "75";
    const changes = diffCardContent(card, intercessors);
    expect(changes).toContainEqual({
      kind: "changed",
      path: ["rangedWeapons", "Bolt rifle", "profiles", "Bolt rifle", "ap"],
      before: "0",
      after: "-1",
    });
    expect(changes).toContainEqual({
      kind: "changed",
      path: ["points", "5 models", "cost"],
      before: "75",
      after: "80",
    });
  });

  it("treats keyword lists as sets", () => {
    const card = saved({ keywords: ["Imperium", "Infantry", "Grenades"] });
    expect(diffCardContent(card, intercessors)).toEqual([
      { kind: "removed", path: ["keywords"], before: "Grenades" },
      { kind: "added", path: ["keywords"], after: "Battleline" },
    ]);
  });

  it("matches named items regardless of case", () => {
    const card = saved();
    card.rangedWeapons[0].profiles[0].name = "Bolt Rifle";
    expect(diffCardContent(card, intercessors)).toEqual([
      {
        kind: "changed",
        path: ["rangedWeapons", "Bolt rifle", "profiles", "Bolt rifle", "name"],
        before: "Bolt Rifle",
        after: "Bolt rifle",
      },
    ]);
  });

  it("reports added and removed named items", () => {
    const card = saved();
    card.rangedWeapons = [];
    const changes = diffCardContent(card, intercessors);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ kind: "added", path: ["rangedWeapons", "Bolt rifle"] });
  });

  it("compares language-keyed values in the requested language", () => {
    const before = { id: "x", cardType: "DataCard", fluff: { en: "Old", de: "Alt" } };
    const after = { id: "x", cardType: "DataCard", fluff: { en: "New", de: "Alt" } };
    expect(diffCardContent(before, after)).toEqual([
      { kind: "changed", path: ["fluff"], before: before.fluff, after: after.fluff },
    ]);
    expect(diffCardContent(before, after, "de")).toEqual([]);
  });
});

describe("getCardUpdateStatus", () => {
  const index = buildDatasourceCardIndex(dataSource, "40k-10e");

  it("flags cards whose content differs", () => {
    const result = getCardUpdateStatus(saved({ keywords: ["Infantry"] }), index);
    expect(result.status).toBe(CARD_UPDATE_STATUS.CHANGED);
    expect(result.changes.length).toBeGreaterThan(0);
  });

  it("flags cards that match", () => {
    expect(getCardUpdateStatus(saved(), index).status).toBe(CARD_UPDATE_STATUS.UP_TO_DATE);
  });

  it("flags cards missing from the datasource", () => {
    expect(getCardUpdateStatus(saved({ id: "gone", name: "Gone" }), index).status).toBe(CARD_UPDATE_STATUS.NOT_FOUND);
  });

  it("falls back to a unique name match when the id changed", () => {
    const result = getCardUpdateStatus(saved({ id: "old-id" }), index);
    expect(result.status).toBe(CARD_UPDATE_STATUS.CHANGED);
    expect(result.matchedBy).toBe("name");
    expect(result.sourceCard.id).toBe("unit-1");
    expect(result.changes).toEqual([{ kind: "changed", path: ["id"], before: "old-id", after: "unit-1" }]);
  });

  it("does not guess between several name matches", () => {
    const result = getCardUpdateStatus(saved({ id: "old-id", faction_id: "DA" }), index);
    expect(result.status).toBe(CARD_UPDATE_STATUS.NOT_FOUND);
  });

  it("compares language-keyed text in the card language", () => {
    const multi = {
      id: "m1",
      cardType: "stratagem",
      source: "40k-11e",
      name: "Oath",
      when: { en: "Now", de: "Jetzt" },
    };
    const multiIndex = buildDatasourceCardIndex({ data: [{ id: "X", stratagems: [multi] }] }, "40k-11e");
    const card = { ...multi, uuid: "s", when: { en: "Now", de: "Gleich" } };
    expect(getCardUpdateStatus(card, multiIndex, "en").status).toBe(CARD_UPDATE_STATUS.UP_TO_DATE);
    expect(getCardUpdateStatus(card, multiIndex, "de").status).toBe(CARD_UPDATE_STATUS.CHANGED);
  });

  it("marks cards from a datasource that is not loaded as unavailable", () => {
    expect(getCardUpdateStatus(saved({ source: "aos" }), index).status).toBe(CARD_UPDATE_STATUS.UNAVAILABLE);
    expect(getCardUpdateStatus({ name: "Custom", uuid: "x" }, index).status).toBe(CARD_UPDATE_STATUS.UNAVAILABLE);
  });
});

describe("applySourceUpdate", () => {
  it("replaces content and keeps list choices, styling and display toggles", () => {
    const card = saved({
      keywords: ["Old"],
      unitSize: { models: "5", cost: "75", active: true },
      isWarlord: true,
      selectedEnhancement: { name: "Artificer Armour", cost: "10" },
      attachedTo: "leader-uuid",
      variant: "full",
      customHeaderColour: "#ff0000",
      homebrew: "removed on update",
    });
    card.rangedWeapons[0].active = false;

    const updated = applySourceUpdate(card, intercessors);

    expect(updated.uuid).toBe("card-uuid");
    expect(updated.isCustom).toBe(true);
    expect(updated.keywords).toEqual(intercessors.keywords);
    expect(updated.isWarlord).toBe(true);
    expect(updated.selectedEnhancement).toEqual({ name: "Artificer Armour", cost: "10" });
    expect(updated.attachedTo).toBe("leader-uuid");
    expect(updated.variant).toBe("full");
    expect(updated.customHeaderColour).toBe("#ff0000");
    expect(updated.rangedWeapons[0].active).toBe(false);
    expect(updated.homebrew).toBeUndefined();
    expect(updated.unitSize).toEqual({ models: "5", cost: "80", active: true });
    expect(intercessors.rangedWeapons[0].active).toBe(true);
  });

  it("keeps the chosen size when the tier no longer exists", () => {
    const card = saved({ unitSize: { models: "3", cost: "50" } });
    expect(applySourceUpdate(card, intercessors).unitSize).toEqual({ models: "3", cost: "50" });
  });

  it("resolves a restricted price for the army", () => {
    const source = {
      ...intercessors,
      source: "40k-11e",
      points: [
        { models: 5, cost: 75 },
        { models: 5, cost: 80, faction: { en: "Blood Angels" } },
      ],
    };
    const card = saved({ source: "40k-11e", unitSize: { models: 5, cost: 70 } });
    expect(applySourceUpdate(card, source, { factions: ["Blood Angels"] }).unitSize.cost).toBe(80);
    expect(applySourceUpdate(card, source, { factions: [] }).unitSize.cost).toBe(75);
  });
});

describe("applyCardUpdates", () => {
  it("updates only the selected changed cards", () => {
    const index = buildDatasourceCardIndex(dataSource, "40k-10e");
    const cards = [
      saved({ uuid: "a", keywords: ["Old"] }),
      saved({ uuid: "b", keywords: ["Old"] }),
      saved({ uuid: "c" }),
    ];
    const results = checkCardsForUpdates(cards, index);
    const { cards: next, updatedUuids } = applyCardUpdates(cards, results, ["a", "c"]);
    expect(updatedUuids).toEqual(["a"]);
    expect(next[0].keywords).toEqual(intercessors.keywords);
    expect(next[1]).toBe(cards[1]);
    expect(next[2]).toBe(cards[2]);
  });
});

describe("formatting", () => {
  it("labels the first path segment", () => {
    expect(formatChangePath(["rangedWeapons", "Bolt rifle", "ap"])).toBe("Ranged weapons > Bolt rifle > AP");
    expect(formatChangePath(["someNewField"])).toBe("Some New Field");
  });

  it("drops repeated names and container keys from paths", () => {
    expect(formatChangePath(["rangedWeapons", "Bolt rifle", "profiles", "Bolt rifle", "strength"])).toBe(
      "Ranged weapons > Bolt rifle > Strength",
    );
    expect(formatChangePath(["stats", "Belial", "t"])).toBe("Stats > Belial > T");
    expect(formatChangePath(["points", "5 models", "cost"])).toBe("Points > 5 models > Cost");
  });

  it("formats values for display", () => {
    expect(formatChangeValue(undefined)).toBe("(empty)");
    expect(formatChangeValue(3)).toBe("3");
    expect(formatChangeValue({ en: "Leader", de: "Anführer" }, "de")).toBe("Anführer");
    expect(formatChangeValue({ name: "Bolt rifle", range: '24"' })).toBe("Bolt rifle");
  });
});
