import { describe, it, expect } from "vitest";
import {
  buildFactionDatasheetList,
  getCardSectionKey,
  getSectionKey,
  groupSheetsByRole,
  groupStratagemsByDetachment,
  is40kBrowseSource,
} from "../browseList.helpers";

// 10th edition keywords are plain strings, 11th edition keywords are
// language-keyed objects. Both must group.
const sheet10e = (name, ...keywords) => ({ id: name, name, keywords });
const sheet11e = (name, ...keywords) => ({ id: name, name, keywords: keywords.map((k) => ({ en: k, de: `${k}-de` })) });

const names = (rows) => rows.map((row) => row.name);
const separators = (rows) => rows.filter((row) => row.type === "role").map((row) => row.name);

describe("is40kBrowseSource", () => {
  it("covers every 40k edition that browses datasheets", () => {
    expect(["40k-10e", "40k-10e-cp", "40k-11e"].every(is40kBrowseSource)).toBe(true);
  });

  it("excludes the other datasources", () => {
    expect(["aos", "40k", "basic", "necromunda", "custom-1234", undefined].some(is40kBrowseSource)).toBe(false);
  });
});

describe("groupSheetsByRole", () => {
  it("splits 10e string keywords into role sections", () => {
    const rows = groupSheetsByRole([
      sheet10e("Warboss", "Infantry", "Character"),
      sheet10e("Boyz", "Infantry", "Battleline"),
      sheet10e("Trukk", "Vehicle", "Dedicated Transport"),
      sheet10e("Stompa", "Vehicle", "Titanic"),
    ]);

    expect(names(rows)).toEqual([
      "Character",
      "Warboss",
      "Battleline",
      "Boyz",
      "Dedicated Transport",
      "Trukk",
      "Other",
      "Stompa",
    ]);
  });

  it("splits 11e language-keyed keywords into the same role sections", () => {
    const rows = groupSheetsByRole([
      sheet11e("Warboss", "Infantry", "Character"),
      sheet11e("Boyz", "Infantry", "Battleline"),
      sheet11e("Stompa", "Vehicle", "Titanic"),
    ]);

    expect(names(rows)).toEqual([
      "Character",
      "Warboss",
      "Battleline",
      "Boyz",
      "Dedicated Transport",
      "Other",
      "Stompa",
    ]);
  });

  it("tags each sheet with its role so the list can collapse the section", () => {
    const rows = groupSheetsByRole([sheet11e("Warboss", "Character")]);
    expect(rows.find((row) => row.name === "Warboss").role).toBe("Character");
  });

  it("drops structural rows, which carry no keywords", () => {
    const rows = groupSheetsByRole([{ type: "category", name: "Orks", id: "orks" }, sheet11e("Boyz", "Battleline")]);
    expect(rows.some((row) => row.type === "category")).toBe(false);
  });
});

describe("groupStratagemsByDetachment", () => {
  const strat = (name, detachment) => ({ id: name, name, detachment });

  it("keeps the datasource's detachment order and groups each one", () => {
    const rows = groupStratagemsByDetachment([
      strat("Ere We Go", "Blitz Brigade"),
      strat("Unbridled Carnage", "Kult of Speed"),
      strat("Ramming Speed", "Blitz Brigade"),
    ]);

    expect(names(rows)).toEqual(["Blitz Brigade", "Ere We Go", "Ramming Speed", "Kult of Speed", "Unbridled Carnage"]);
    expect(rows.find((row) => row.name === "Ere We Go").role).toBe("Blitz Brigade");
  });

  it("resolves language-keyed detachment names for the chosen language", () => {
    const rows = groupStratagemsByDetachment([strat("Ere We Go", { en: "Blitz Brigade", de: "Blitzbrigade" })], "de");
    expect(separators(rows)).toEqual(["Blitzbrigade"]);
  });

  it("sorts stratagems without a detachment into a trailing Other section", () => {
    const rows = groupStratagemsByDetachment([strat("Command Re-roll", ""), strat("Ere We Go", "Blitz Brigade")]);
    expect(separators(rows)).toEqual(["Blitz Brigade", "Other"]);
  });

  it("returns nothing for a faction with no stratagems", () => {
    expect(groupStratagemsByDetachment(undefined)).toEqual([]);
  });
});

describe("buildFactionDatasheetList", () => {
  const faction = {
    id: "orks",
    name: "Orks",
    datasheets: [sheet11e("Boyz", "Battleline"), sheet11e("Warboss", "Character"), sheet11e("Stompa", "Titanic")],
  };
  const dataSource = { data: [faction] };

  it("sorts alphabetically when no grouping is on", () => {
    const rows = buildFactionDatasheetList({ dataSource, selectedFaction: faction, settings: {} });
    expect(rows.filter((row) => !row.type).map((row) => row.name)).toEqual(["Boyz", "Stompa", "Warboss"]);
  });

  it("groups an 11e faction by role", () => {
    const rows = buildFactionDatasheetList({
      dataSource,
      selectedFaction: faction,
      settings: { groupByRole: true },
    });
    expect(separators(rows)).toEqual(["Character", "Battleline", "Dedicated Transport", "Other"]);
    expect(rows.find((row) => row.name === "Boyz").role).toBe("Battleline");
  });

  it("drops role sections a search has emptied", () => {
    const rows = buildFactionDatasheetList({
      dataSource,
      selectedFaction: faction,
      settings: { groupByRole: true },
      searchText: "boyz",
    });
    expect(names(rows)).toEqual(["Battleline", "Boyz"]);
  });

  it("hides Legends sheets unless the setting asks for them", () => {
    const legendsFaction = { ...faction, datasheets: [...faction.datasheets, { name: "Old Boss", legends: true }] };
    const rows = buildFactionDatasheetList({
      dataSource,
      selectedFaction: legendsFaction,
      settings: {},
    });
    expect(rows.some((row) => row.name === "Old Boss")).toBe(false);

    const withLegends = buildFactionDatasheetList({
      dataSource,
      selectedFaction: legendsFaction,
      settings: { showLegends: true },
    });
    expect(withLegends.some((row) => row.name === "Old Boss")).toBe(true);
  });

  it("appends allied faction sections after the faction's own sheets", () => {
    const allies = { id: "agents", name: "Agents of the Imperium", datasheets: [sheet11e("Inquisitor", "Character")] };
    const rows = buildFactionDatasheetList({
      dataSource: { data: [faction, allies] },
      selectedFaction: { ...faction, allied_factions: ["agents"] },
      settings: { combineAlliedFactions: true },
    });

    const allied = rows.findIndex((row) => row.type === "allied");
    expect(allied).toBeGreaterThan(-1);
    expect(rows[allied].name).toBe("Agents of the Imperium");
    expect(rows[allied + 1].name).toBe("Inquisitor");
    expect(rows[allied + 1].allied).toBe(true);
  });
});

// Role sections and detachment sections share one `settings.mobile.closedRoles`
// list, and both have an "Other" bucket, so their collapse keys must not collide.
describe("section collapse keys", () => {
  const otherSheet = groupSheetsByRole([sheet11e("Stompa", "Titanic")]).filter((row) => row.name === "Other");
  const otherStrats = groupStratagemsByDetachment([{ id: "s", name: "Command Re-roll", detachment: "" }]);

  it("namespaces a role section apart from a detachment section of the same name", () => {
    const roleSeparator = otherSheet.find((row) => row.type === "role");
    const detachmentSeparator = otherStrats.find((row) => row.type === "role");
    expect(getSectionKey(roleSeparator)).not.toBe(getSectionKey(detachmentSeparator));
  });

  it("gives a card the same key as the separator it sits under", () => {
    const [separator, card] = groupSheetsByRole([sheet11e("Warboss", "Character")]);
    expect(getCardSectionKey(card)).toBe(getSectionKey(separator));

    const [stratSeparator, strat] = groupStratagemsByDetachment([
      { id: "s", name: "Ere We Go", detachment: "Blitz Brigade" },
    ]);
    expect(getCardSectionKey(strat)).toBe(getSectionKey(stratSeparator));
  });

  it("falls back to the display name for rows built without a key", () => {
    expect(getSectionKey({ type: "role", name: "Heroes" })).toBe("Heroes");
    expect(getCardSectionKey({ name: "Warboss", role: "Character" })).toBe("Character");
  });
});
