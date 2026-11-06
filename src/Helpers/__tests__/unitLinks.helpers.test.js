import { describe, it, expect } from "vitest";
import {
  UNIT_LINK_PRESETS,
  collectLinkableUnitCards,
  createUnitLinkGroup,
  findCardInFactions,
  getUnitLinkEntries,
  getUnitLinkGroups,
  getUnitLinkViewerPath,
  normalizeUnitLinkEntry,
  pickNextLinkableCard,
  resolveUnitLink,
  setUnitLinkEntries,
} from "../unitLinks.helpers";

const schema = {
  cardTypes: [
    { key: "infantry", baseType: "unit", schema: {} },
    { key: "stratagem", baseType: "stratagem", schema: {} },
  ],
};

const factions = [
  {
    id: "f1",
    name: "Space Wolves",
    datasheets: [
      { id: "c1", name: "Wolf Lord", cardType: "infantry" },
      { id: "c2", name: "Blood Claws", cardType: "infantry" },
    ],
    stratagems: [{ id: "s1", name: "Big Hit", cardType: "stratagem" }],
  },
  {
    id: "f2",
    name: "Dark Angels",
    datasheets: [{ id: "c3", name: "Azrael", cardType: "infantry" }],
  },
];

describe("getUnitLinkGroups", () => {
  it("returns an empty array when the schema has no unit links", () => {
    expect(getUnitLinkGroups({ schema: {} })).toEqual([]);
    expect(getUnitLinkGroups(null)).toEqual([]);
  });

  it("drops groups without a key", () => {
    const def = { schema: { unitLinks: { groups: [{ key: "leads", label: "Leader" }, { label: "No key" }] } } };
    expect(getUnitLinkGroups(def)).toEqual([{ key: "leads", label: "Leader" }]);
  });
});

describe("createUnitLinkGroup", () => {
  it("returns the Leader preset first, then Support", () => {
    const first = createUnitLinkGroup([]);
    expect(first).toEqual(UNIT_LINK_PRESETS[0]);
    expect(createUnitLinkGroup([first])).toEqual(UNIT_LINK_PRESETS[1]);
  });

  it("falls back to a numbered group when all presets are used", () => {
    const group = createUnitLinkGroup([...UNIT_LINK_PRESETS]);
    expect(group.key).toBe("links_3");
    expect(group.label).toBe("Linked units 3");
  });

  it("returns copies that can be edited without touching the presets", () => {
    const group = createUnitLinkGroup([]);
    group.label = "Changed";
    expect(UNIT_LINK_PRESETS[0].label).toBe("Leader");
  });
});

describe("entries", () => {
  it("normalizes strings and objects", () => {
    expect(normalizeUnitLinkEntry("Wolf Lord")).toEqual({ name: "Wolf Lord" });
    expect(normalizeUnitLinkEntry({ cardId: "c1", name: "Wolf Lord", extra: 1 })).toEqual({
      cardId: "c1",
      name: "Wolf Lord",
    });
    expect(normalizeUnitLinkEntry(null)).toEqual({ name: "" });
  });

  it("reads and writes entries per group without touching other groups", () => {
    const card = { unitLinks: { leads: ["Blood Claws"], supports: [{ cardId: "c3", name: "Azrael" }] } };
    expect(getUnitLinkEntries(card, "leads")).toEqual([{ name: "Blood Claws" }]);
    expect(getUnitLinkEntries(card, "missing")).toEqual([]);

    const updated = setUnitLinkEntries(card, "leads", [{ cardId: "c2", name: "Blood Claws" }]);
    expect(updated.unitLinks.leads).toEqual([{ cardId: "c2", name: "Blood Claws" }]);
    expect(updated.unitLinks.supports).toEqual(card.unitLinks.supports);
    expect(card.unitLinks.leads).toEqual(["Blood Claws"]);
  });
});

describe("resolving links", () => {
  it("finds a card and its faction by id", () => {
    const match = findCardInFactions(factions, "c3");
    expect(match.card.name).toBe("Azrael");
    expect(match.faction.id).toBe("f2");
    expect(findCardInFactions(factions, "nope")).toBeNull();
  });

  it("uses the current name of the linked card", () => {
    const resolved = resolveUnitLink({ cardId: "c2", name: "Old name" }, factions);
    expect(resolved.name).toBe("Blood Claws");
    expect(resolved.card.id).toBe("c2");
    expect(resolved.missing).toBe(false);
  });

  it("marks links to deleted cards as missing", () => {
    const resolved = resolveUnitLink({ cardId: "gone", name: "Deleted unit" }, factions);
    expect(resolved.missing).toBe(true);
    expect(resolved.name).toBe("Deleted unit");
  });

  it("keeps free-text entries as plain names", () => {
    const resolved = resolveUnitLink({ name: "Some unit" }, factions);
    expect(resolved).toMatchObject({ name: "Some unit", card: null, missing: false });
  });
});

describe("collectLinkableUnitCards", () => {
  it("lists unit cards from every faction, sorted, without the excluded card", () => {
    const cards = collectLinkableUnitCards(factions, schema, "c1");
    expect(cards.map((c) => c.id)).toEqual(["c3", "c2"]);
    expect(cards[0]).toMatchObject({ name: "Azrael", factionName: "Dark Angels" });
  });

  it("skips non-unit cards", () => {
    const ids = collectLinkableUnitCards(factions, schema).map((c) => c.id);
    expect(ids).not.toContain("s1");
  });

  it("returns an empty list without factions", () => {
    expect(collectLinkableUnitCards(undefined, schema)).toEqual([]);
  });
});

describe("getUnitLinkViewerPath", () => {
  const resolved = resolveUnitLink({ cardId: "c2" }, factions);

  it("builds the desktop viewer path", () => {
    expect(getUnitLinkViewerPath(resolved)).toBe("/viewer/space-wolves/blood-claws");
  });

  it("builds the mobile path", () => {
    expect(getUnitLinkViewerPath(resolved, { mobile: true })).toBe("/mobile/space-wolves/blood-claws");
  });

  it("returns null for unresolved links", () => {
    expect(getUnitLinkViewerPath(resolveUnitLink({ name: "Free text" }, factions))).toBeNull();
  });
});

describe("pickNextLinkableCard", () => {
  const cards = [{ id: "c2" }, { id: "c3" }];

  it("skips cards that are already linked", () => {
    expect(pickNextLinkableCard(cards, [{ cardId: "c2" }, { name: "Free" }])).toEqual({ id: "c3" });
  });

  it("returns null when every card is linked", () => {
    expect(pickNextLinkableCard(cards, [{ cardId: "c2" }, { cardId: "c3" }])).toBeNull();
  });
});
