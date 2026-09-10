import { describe, it, expect } from "vitest";
import {
  parseGwAppText,
  matchBattleSize,
  matchDetachmentsToFaction,
  getImportRoster,
  getImportUnitSize,
} from "../gwAppImport.helpers";
import { IRONSTORM, BARK_AT_THE_MOON } from "./armyListParser.fixtures";

// An 11th edition faction carries its detachments, each with a DP cost.
const spaceMarines = {
  id: "SM",
  name: "Space Marines",
  detachments: [
    { id: "ironstorm", name: { en: "Ironstorm Spearhead" }, detachmentPoints: 2 },
    { id: "marshal", name: { en: "Marshal's Household" }, detachmentPoints: 1 },
    { id: "gladius", name: { en: "Gladius Task Force" }, detachmentPoints: 3 },
    // Two detachments that share a word, to prove the longer one claims it.
    { id: "saga-song", name: { en: "Legends of Saga and Song" }, detachmentPoints: 2 },
    { id: "beastslayer", name: { en: "Saga of the Beastslayer" }, detachmentPoints: 1 },
  ],
};

describe("matchBattleSize", () => {
  it("reads the battle sizes this edition has", () => {
    expect(matchBattleSize("Strike Force")).toBe("strikeForce");
    expect(matchBattleSize("Incursion")).toBe("incursion");
  });

  it("ignores case and spacing", () => {
    expect(matchBattleSize("strike  force")).toBe("strikeForce");
  });

  it("returns null for a size this edition does not have, and for nothing at all", () => {
    expect(matchBattleSize("Onslaught")).toBeNull();
    expect(matchBattleSize(null)).toBeNull();
    expect(matchBattleSize("")).toBeNull();
  });
});

describe("matchDetachmentsToFaction", () => {
  it("reads both detachments out of a line that joins them with 'and'", () => {
    const found = matchDetachmentsToFaction("Ironstorm Spearhead and Marshal's Household", spaceMarines, "strikeForce");
    expect(found.map((d) => d.id)).toEqual(["ironstorm", "marshal"]);
  });

  it("does not split a detachment whose own name contains the joiner", () => {
    const found = matchDetachmentsToFaction(
      "Legends of Saga and Song and Saga of the Beastslayer",
      spaceMarines,
      "strikeForce",
    );
    expect(found.map((d) => d.id)).toEqual(["saga-song", "beastslayer"]);
  });

  it("keeps the order the export names them in", () => {
    const found = matchDetachmentsToFaction("Marshal's Household + Ironstorm Spearhead", spaceMarines, "strikeForce");
    expect(found.map((d) => d.id)).toEqual(["marshal", "ironstorm"]);
  });

  it("stops at what the battle size can pay for", () => {
    // Incursion grants 2 DP; Ironstorm costs 2, so the Marshal's Household does
    // not fit alongside it.
    const found = matchDetachmentsToFaction("Ironstorm Spearhead and Marshal's Household", spaceMarines, "incursion");
    expect(found.map((d) => d.id)).toEqual(["ironstorm"]);
  });

  it("takes a lone over-budget detachment at Incursion, which the rules allow", () => {
    const found = matchDetachmentsToFaction("Gladius Task Force", spaceMarines, "incursion");
    expect(found.map((d) => d.id)).toEqual(["gladius"]);
  });

  it("returns nothing for a faction with no detachments of its own", () => {
    expect(matchDetachmentsToFaction("Gladius Task Force", { id: "SM" }, "strikeForce")).toEqual([]);
  });

  it("returns nothing when the export names no detachment", () => {
    expect(matchDetachmentsToFaction(null, spaceMarines, "strikeForce")).toEqual([]);
    expect(matchDetachmentsToFaction("", spaceMarines, "strikeForce")).toEqual([]);
  });

  it("does not match a detachment the export never names", () => {
    expect(matchDetachmentsToFaction("Anvil Siege Force", spaceMarines, "strikeForce")).toEqual([]);
  });
});

describe("getImportRoster", () => {
  it("reads the battle size and both detachments off an 11th edition export", () => {
    const roster = getImportRoster(parseGwAppText(IRONSTORM), spaceMarines);
    expect(roster.battleSize).toBe("strikeForce");
    expect(roster.detachments.map((d) => d.id)).toEqual(["ironstorm", "marshal"]);
  });

  it("reads the battle size of an export whose detachments this faction does not have", () => {
    const roster = getImportRoster(parseGwAppText(BARK_AT_THE_MOON), { id: "SM", detachments: [] });
    expect(roster.battleSize).toBe("strikeForce");
    expect(roster.detachments).toEqual([]);
  });

  it("is empty for an export that states no roster at all", () => {
    expect(getImportRoster({}, spaceMarines)).toEqual({ battleSize: null, detachments: [] });
  });
});

describe("getImportUnitSize", () => {
  // An 11th edition datasheet: priced per size, and more expensive under one
  // faction keyword than the generic price.
  const intercessors = {
    name: "Assault Intercessor Squad",
    points: [
      { models: "5", cost: "75" },
      { models: "5", cost: "80", faction: { en: "Blood Angels" } },
      { models: "10", cost: "150" },
    ],
  };

  it("picks the tier whose size and price both match the export", () => {
    const size = getImportUnitSize(intercessors, { points: 150, models: 10 });
    expect(size).toMatchObject({ models: "10", cost: "150" });
  });

  it("picks by price when the parser miscounted the models", () => {
    const size = getImportUnitSize(intercessors, { points: 150, models: 1 });
    expect(size).toMatchObject({ models: "10", cost: "150" });
  });

  it("picks by size when the export's price matches no tier", () => {
    const size = getImportUnitSize(intercessors, { points: 999, models: 5 });
    expect(size).toMatchObject({ models: "5" });
  });

  it("takes the price this army pays over the generic one", () => {
    const size = getImportUnitSize(intercessors, { points: 80, models: 5 }, { factions: ["Blood Angels"] });
    expect(size).toMatchObject({ cost: "80", faction: { en: "Blood Angels" } });
  });

  it("subtracts the enhancement from the unit's points before matching a tier", () => {
    const captain = { name: "Captain", points: [{ models: "1", cost: "80" }] };
    const size = getImportUnitSize(captain, { points: 100, models: 1, enhancement: { name: "Artificer", cost: 20 } });
    expect(size).toMatchObject({ models: "1", cost: "80" });
  });

  it("falls back to the pasted points for a card with no tiers of its own", () => {
    const size = getImportUnitSize({ name: "Captain" }, { points: 100, models: 1 });
    expect(size).toEqual({ cost: 100, models: 1 });
  });

  it("falls back to the pasted points when no tier matches at all", () => {
    const size = getImportUnitSize(intercessors, { points: 999, models: 7 });
    expect(size).toEqual({ cost: 999, models: 7 });
  });
});

describe("parseGwAppText - 11th edition exports", () => {
  const parsed = parseGwAppText(IRONSTORM);

  it("reads the whole 11th edition header", () => {
    expect(parsed.factionName).toBe("Space Marines");
    expect(parsed.subfaction).toBe("Black Templars");
    expect(parsed.detachment).toBe("Ironstorm Spearhead and Marshal's Household");
    expect(parsed.detachmentPoints).toBe(3);
    expect(parsed.disposition).toBe("Priority Assets");
    expect(parsed.battleSize).toBe("Strike Force");
    expect(parsed.totalPoints).toBe(1990);
  });

  it("reads the units of an attached block, which the old parser had no section for", () => {
    expect(parsed.units.map((u) => u.originalName)).toEqual([
      "Chaplain Grimaldus",
      "Apothecary",
      "Sword Brethren Squad",
      "Techmarine",
      "Infiltrator Squad",
    ]);
  });

  it("routes an attached leader to the characters and its bodyguard to the other datasheets", () => {
    const byName = Object.fromEntries(parsed.units.map((u) => [u.originalName, u]));
    expect(byName["Chaplain Grimaldus"].category).toBe("characters");
    expect(byName["Sword Brethren Squad"].category).toBe("other");
  });

  it("names the characters that joined a unit", () => {
    const brethren = parsed.units.find((u) => u.originalName === "Sword Brethren Squad");
    expect(brethren.leaders.map((l) => l.name)).toEqual(["Chaplain Grimaldus", "Apothecary"]);
  });

  it("keeps the enhancement and the warlord flag", () => {
    const byName = Object.fromEntries(parsed.units.map((u) => [u.originalName, u]));
    expect(byName["Chaplain Grimaldus"].isWarlord).toBe(true);
    expect(byName["Sword Brethren Squad"].enhancement).toEqual({ name: "Fervent Exemplars", cost: 0 });
    expect(byName["Techmarine"].enhancement).toEqual({ name: "Target Augury Web", cost: 0 });
  });

  it("counts the models of a character that brings a bodyguard of its own", () => {
    const grimaldus = parsed.units.find((u) => u.originalName === "Chaplain Grimaldus");
    expect(grimaldus.models).toBe(4);
  });

  it("drops the battle size and the app version stamp from the units", () => {
    const names = parsed.units.map((u) => u.originalName);
    expect(names).not.toContain("Strike Force");
    expect(names.some((n) => n.startsWith("Exported with"))).toBe(false);
  });
});
