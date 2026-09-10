import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { get40k11eData, get40k11eCombatPatrolData } from "../external.helpers";
import { expand11ePatrols, patrolRosterLabel, patrolRouteQuery, resolveUnitRoute } from "../datasource11e.helpers";
import { buildFactionDatasheetList } from "../browseList.helpers";

const normal = {
  id: "orks",
  name: "Orks",
  source: "40k-11e",
  datasheets: [{ id: "normal", name: { en: "Boyz", de: "Boyz DE" } }],
  stratagems: [],
  enhancements: [],
  rules: { army: [], detachment: [] },
};
const legends = {
  ...normal,
  isLegends: true,
  datasheets: [{ id: "legend", sourceDatasheetId: "gw-legend", name: { en: "Boss", de: "Boss DE" }, isLegends: true }],
};
const patrols = {
  ...normal,
  isCombatPatrol: true,
  datasheets: [
    { id: "cp1", sourceDatasheetId: "gw1", name: { en: "Twin" } },
    { id: "cp2", sourceDatasheetId: "gw2", name: { en: "Twin" } },
  ],
  detachments: [
    { id: "p1", name: { en: "Box One" } },
    { id: "p2", name: { en: "Box Two" } },
  ],
  stratagems: [
    { id: "s1", detachment_id: "p1", name: { en: "Strat One" } },
    { id: "s2", detachment_id: "p2", name: { en: "Strat Two" } },
  ],
  enhancements: [
    { id: "e1", detachment_id: "p1", name: { en: "Enh One" } },
    { id: "e2", detachment_id: "p2", name: { en: "Enh Two" } },
  ],
  rules: {
    army: [],
    detachment: [
      { detachment_id: "p1", rules: [] },
      { detachment_id: "p2", rules: [] },
    ],
  },
  patrols: [
    {
      id: "p1",
      name: { en: "Box One", de: "Box Eins" },
      detachmentId: "p1",
      roster: [{ datasheetId: "cp1", sourceDatasheetId: "gw1", count: 2, isWarlord: true }],
      stratagemIds: ["s1"],
      enhancementIds: ["e1"],
      detachmentRuleIds: ["p1"],
    },
    {
      id: "p2",
      name: { en: "Box Two" },
      detachmentId: "p2",
      roster: [{ datasheetId: "cp2", sourceDatasheetId: "gw2", count: 1, isWarlord: false }],
      stratagemIds: ["s2"],
      enhancementIds: ["e2"],
      detachmentRuleIds: ["p2"],
    },
  ],
};
const index = {
  schemaVersion: 1,
  source: "40k-11e",
  updated: "2026-09-07",
  factions: [{ id: "orks", file: "orks.json" }],
  legends: [{ id: "orks", file: "legends/orks.json" }],
  combatPatrol: [{ id: "orks", file: "combatpatrol/orks.json" }],
};
let documents;

describe("11e companion loading", () => {
  beforeEach(() => {
    documents = {
      "index.json": index,
      "orks.json": normal,
      "legends/orks.json": legends,
      "combatpatrol/orks.json": patrols,
      "keywords.json": { keywords: [] },
      "core.json": { stratagems: [{ id: "core", name: { en: "Matched core" } }] },
    };
    vi.stubEnv("VITE_DATASOURCE_11TH_URL", "https://test.local/11th");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const file = new URL(url).pathname.replace("/11th/", "");
        const body = documents[file];
        return { ok: !!body, status: body ? 200 : 404, text: async () => JSON.stringify(body) };
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("loads only indexed companions and makes Legends obey the existing filter", async () => {
    const result = await get40k11eData("de");
    expect(result.schemaVersion).toBe(2);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].datasheets[1]).toMatchObject({
      id: "legend",
      name: "Boss DE",
      legends: true,
      isLegends: true,
      source: "40k-11e",
    });
    const rows = (showLegends) =>
      buildFactionDatasheetList({
        dataSource: result,
        selectedFaction: result.data[0],
        settings: { selectedDataSource: "40k-11e", showLegends, groupByFaction: true },
      }).filter((r) => !r.type);
    expect(rows(false).map((r) => r.id)).toEqual(["normal"]);
    expect(rows(true)).toHaveLength(2);
    expect(fetch.mock.calls.some(([url]) => url.includes("combatpatrol/"))).toBe(false);
  });

  it("expands each box into its own roster with localized names and scoped rules", async () => {
    const result = await get40k11eCombatPatrolData("de");
    expect(result.isCombatPatrol).toBe(true);
    expect(result.data.map((f) => f.id)).toEqual(["p1", "p2"]);
    const one = result.data[0];
    expect(one.name).toBe("Orks - Box Eins");
    expect(one.datasheets[0]).toMatchObject({
      id: "cp1",
      faction_id: "p1",
      source: "40k-11e",
      patrolCount: 2,
      isWarlord: true,
    });
    expect(one.stratagems.map((s) => s.id)).toEqual(["s1"]);
    expect(one.enhancements.map((s) => s.id)).toEqual(["e1"]);
    expect(one.basicStratagems).toEqual([]);
    expect(result.data[1].datasheets.map((u) => u.id)).toEqual(["cp2"]);
    expect(patrolRosterLabel(one.datasheets[0])).toBe("2 units · Warlord");
    expect(fetch.mock.calls.some(([url]) => /\/legends\/|\/core.json/.test(url))).toBe(false);
  });

  it("rejects an indexed file failure instead of caching partial Legends data", async () => {
    delete documents["legends/orks.json"];
    await expect(get40k11eData()).rejects.toThrow(/Failed to fetch/);
  });

  it("rejects an index outage rather than falling back as though Legends were absent", async () => {
    fetch.mockImplementationOnce(async () => ({ ok: false, status: 503, statusText: "Unavailable" }));
    await expect(get40k11eData()).rejects.toThrow(/503/);
  });

  it("does not silently serve 10th-edition patrols when the index is missing", async () => {
    delete documents["index.json"];
    await expect(get40k11eCombatPatrolData()).rejects.toThrow(/not available yet/);
  });

  it("rejects unsafe index paths and mismatched faction identities", async () => {
    documents["index.json"] = { ...index, legends: [{ id: "orks", file: "../secrets.json" }] };
    await expect(get40k11eData()).rejects.toThrow(/Invalid legends/);
    documents["index.json"] = index;
    documents["legends/orks.json"] = { ...legends, id: "wrong" };
    await expect(get40k11eData()).rejects.toThrow(/identity mismatch/);
  });

  it("rejects a mixed-version fetch before replacing cached data", async () => {
    documents["index.json"] = { ...index, compatibleDataVersion: 946 };
    documents["orks.json"] = { ...normal, compatibleDataVersion: 925 };
    await expect(get40k11eData()).rejects.toThrow(/version mismatch/);
  });

  it("rejects an unresolved roster or missing rule reference", () => {
    const invalid = structuredClone(patrols);
    invalid.patrols[0].roster[0].datasheetId = "absent";
    expect(() => expand11ePatrols([invalid], "en")).toThrow(/Invalid roster/);
    invalid.patrols[0].roster[0].datasheetId = "cp1";
    invalid.patrols[0].stratagemIds = ["missing"];
    expect(() => expand11ePatrols([invalid], "en")).toThrow(/Unresolved patrol reference/);
  });

  it("uses card identity to distinguish same-name patrol variants in URLs", () => {
    const cards = [
      { id: "one", name: "Twin", isCombatPatrol: true },
      { id: "two", name: "Twin", isCombatPatrol: true },
    ];
    expect(resolveUnitRoute(cards, "twin", patrolRouteQuery(cards[1]))).toBe(cards[1]);
    expect(resolveUnitRoute(cards, "twin", "?cardId=missing")).toBeUndefined();
    expect(resolveUnitRoute(cards, "twin", "")).toBe(cards[0]);
    expect(patrolRouteQuery({ id: "normal" })).toBe("");
  });
});
