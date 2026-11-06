import { describe, it, expect } from "vitest";
import {
  collectCustomDetachments,
  collectCustomEnhancements,
  getCustomDetachmentId,
  isCustomDetachment,
  refreshCustomDetachments,
  splitRosterDetachments,
  withCustomContent,
} from "../customDetachments.helpers";
import { getUnitDetachmentOptions } from "../listRoster.helpers";

const FACTION_ID = "faction-custodes";

const faction = {
  id: FACTION_ID,
  name: "Adeptus Custodes",
  detachments: [{ id: "d-shield", name: { en: "Shield Host" }, detachmentPoints: 1 }],
  enhancements: [{ name: "Auric Mantle", detachment: "Shield Host", cost: "15", keywords: ["Character"] }],
};

const ruleCard = (detachment, extra = {}) => ({
  uuid: `rule-${JSON.stringify(detachment)}-${extra.uuid || ""}`,
  source: "40k-11e",
  cardType: "rule",
  ruleType: "detachment",
  faction_id: FACTION_ID,
  name: "Some rule",
  detachment,
  ...extra,
});

const enhancementCard = (name, detachment, extra = {}) => ({
  uuid: `enh-${name}`,
  source: "40k-11e",
  cardType: "enhancement",
  faction_id: FACTION_ID,
  name,
  description: { en: "Does a thing" },
  detachment,
  cost: "20",
  keywords: ["Character"],
  ...extra,
});

const categories = (...cards) => [{ uuid: "cat-1", name: "My cards", cards }];

describe("collectCustomDetachments", () => {
  it("turns a detachment rule card into a detachment of the list's faction", () => {
    const result = collectCustomDetachments(
      categories(
        ruleCard("Wrath of the Doomed", {
          detachmentPoints: 2,
          forceDispositions: [{ name: "Purge the Foe" }],
        }),
      ),
      faction,
    );
    expect(result).toEqual([
      {
        id: getCustomDetachmentId(FACTION_ID, "Wrath of the Doomed"),
        name: "Wrath of the Doomed",
        detachmentPoints: 2,
        custom: true,
        forceDispositions: [{ name: "Purge the Foe" }],
        forceDisposition: { name: "Purge the Foe" },
      },
    ]);
  });

  it("defaults to 1 DP and no force disposition", () => {
    const [detachment] = collectCustomDetachments(categories(ruleCard("Encarmine Speartip")), faction);
    expect(detachment.detachmentPoints).toBe(1);
    expect(detachment.forceDispositions).toBeUndefined();
  });

  it("merges several rule cards of the same detachment into one", () => {
    const result = collectCustomDetachments(
      categories(
        ruleCard("Wrath of the Doomed", {
          uuid: "a",
          detachmentPoints: 2,
          forceDispositions: [{ name: "Purge the Foe" }],
        }),
        ruleCard({ en: "wrath of the doomed" }, { uuid: "b", forceDispositions: [{ name: "Take and Hold" }] }),
      ),
      faction,
    );
    expect(result).toHaveLength(1);
    expect(result[0].detachmentPoints).toBe(2);
    expect(result[0].forceDispositions.map((d) => d.name)).toEqual(["Purge the Foe", "Take and Hold"]);
  });

  it("only offers cards bound to the list's faction", () => {
    const result = collectCustomDetachments(
      categories(ruleCard("Other army", { faction_id: "faction-other" }), ruleCard("No faction", { faction_id: "" })),
      faction,
    );
    expect(result).toEqual([]);
  });

  it("skips copies of official detachments, army rules and other editions", () => {
    const result = collectCustomDetachments(
      categories(
        ruleCard({ en: "Shield Host" }),
        ruleCard("Army thing", { ruleType: "army" }),
        ruleCard("Tenth edition", { source: "40k-10e" }),
        ruleCard(""),
      ),
      faction,
    );
    expect(result).toEqual([]);
  });

  it("finds cards in any category, including lists", () => {
    const result = collectCustomDetachments(
      [
        { uuid: "a", cards: [] },
        { uuid: "list", type: "list", cards: [ruleCard("Angelic Inheritors")] },
      ],
      faction,
    );
    expect(result.map((d) => d.name)).toEqual(["Angelic Inheritors"]);
  });

  it("returns nothing without a faction", () => {
    expect(collectCustomDetachments(categories(ruleCard("X")), undefined)).toEqual([]);
  });
});

describe("collectCustomEnhancements", () => {
  const custom = [{ name: "Wrath of the Doomed" }];

  it("collects enhancement cards of a custom detachment", () => {
    const result = collectCustomEnhancements(
      categories(enhancementCard("Blade of Ruin", { en: "Wrath of the Doomed" }, { equipableByNonCharacter: true })),
      faction,
      custom,
    );
    expect(result).toEqual([
      {
        id: undefined,
        name: "Blade of Ruin",
        description: { en: "Does a thing" },
        detachment: "Wrath of the Doomed",
        cost: "20",
        keywords: ["Character"],
        excludes: [],
        equipableByNonCharacter: true,
        faction_id: FACTION_ID,
        source: "40k-11e",
        custom: true,
      },
    ]);
  });

  it("resolves a language-keyed name in the user's language", () => {
    const [enhancement] = collectCustomEnhancements(
      categories(enhancementCard({ en: "Blade of Ruin", de: "Klinge" }, "Wrath of the Doomed")),
      faction,
      custom,
      "de",
    );
    expect(enhancement.name).toBe("Klinge");
  });

  it("ignores enhancements of official detachments, other factions and duplicates", () => {
    const result = collectCustomEnhancements(
      categories(
        enhancementCard("Auric Mantle", "Shield Host"),
        enhancementCard("Copied", "Wrath of the Doomed", { faction_id: "faction-other" }),
        enhancementCard("Blade of Ruin", "Wrath of the Doomed"),
        { ...enhancementCard("Blade of Ruin", "Wrath of the Doomed"), uuid: "dupe" },
      ),
      faction,
      custom,
    );
    expect(result.map((e) => e.name)).toEqual(["Blade of Ruin"]);
  });

  it("returns nothing when there are no custom detachments", () => {
    expect(collectCustomEnhancements(categories(enhancementCard("X", "Y")), faction, [])).toEqual([]);
  });
});

describe("withCustomContent", () => {
  it("returns the faction untouched when the user has no custom detachments", () => {
    expect(withCustomContent(faction, categories(enhancementCard("X", "Shield Host")))).toBe(faction);
  });

  it("appends custom detachments and their enhancements", () => {
    const merged = withCustomContent(
      faction,
      categories(ruleCard("Wrath of the Doomed"), enhancementCard("Blade of Ruin", "Wrath of the Doomed")),
    );
    expect(merged.detachments.map((d) => d.id)).toEqual([
      "d-shield",
      getCustomDetachmentId(FACTION_ID, "Wrath of the Doomed"),
    ]);
    expect(merged.enhancements.map((e) => e.name)).toEqual(["Auric Mantle", "Blade of Ruin"]);
    expect(faction.detachments).toHaveLength(1);
  });

  it("offers a custom enhancement to a unit once its detachment is in the army", () => {
    const merged = withCustomContent(
      faction,
      categories(ruleCard("Wrath of the Doomed"), enhancementCard("Blade of Ruin", "Wrath of the Doomed")),
    );
    const captain = { keywords: ["Character", "Infantry"], factions: ["Adeptus Custodes"] };
    const army = [merged.detachments[1]];

    const { enhancements } = getUnitDetachmentOptions(merged, captain, army);
    expect(enhancements.map((e) => e.name)).toEqual(["Blade of Ruin"]);
  });

  it("passes a missing faction through", () => {
    expect(withCustomContent(undefined, categories(ruleCard("X")))).toBeUndefined();
  });
});

describe("refreshCustomDetachments", () => {
  const stale = { id: "custom:f:x", name: "X", detachmentPoints: 1, custom: true };
  const fresh = { ...stale, detachmentPoints: 3 };
  const official = { id: "d-shield", name: "Shield Host", detachmentPoints: 1 };

  it("swaps a stored custom detachment for its current version", () => {
    expect(refreshCustomDetachments([official, stale], [official, fresh])).toEqual([official, fresh]);
  });

  it("keeps the same array when nothing changed", () => {
    const selected = [official, fresh];
    expect(refreshCustomDetachments(selected, [official, fresh])).toBe(selected);
  });

  it("keeps a stored custom detachment whose card is gone", () => {
    expect(refreshCustomDetachments([stale], [official])).toEqual([stale]);
  });
});

describe("splitRosterDetachments", () => {
  const official = { id: "d-shield", name: "Shield Host" };
  const custom = { id: "custom:f:x", name: "X", custom: true };
  const orphan = { id: "custom:f:gone", name: "Gone", custom: true };

  it("separates official and custom detachments", () => {
    expect(splitRosterDetachments([official, custom], [])).toEqual({ official: [official], custom: [custom] });
  });

  it("keeps selected custom detachments that are no longer available so they can be removed", () => {
    expect(splitRosterDetachments([official, custom], [orphan, official]).custom).toEqual([custom, orphan]);
  });

  it("recognises custom detachments by their id", () => {
    expect(isCustomDetachment({ id: "custom:f:x" })).toBe(true);
    expect(isCustomDetachment(official)).toBe(false);
  });
});
