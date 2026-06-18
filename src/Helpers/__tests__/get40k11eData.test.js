import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { get40k11eData } from "../external.helpers";

// A minimal single-faction fixture covering every card type. Returned for every
// faction fetch so we can assert the mapping the helper applies.
const faction = {
  id: "fac-uuid",
  name: "Space Marines",
  source: "40k-11e",
  updated: "2026-06-18T00:00:00.000Z",
  colours: { header: "#111111", banner: "#222222" },
  datasheets: [
    {
      id: "d1",
      name: { en: "Unit One" },
      source: "40k-11e",
      stats: [{ name: { en: "Unit One" }, m: '6"', t: "4", sv: "3+", w: "5", ld: "6+", oc: "1" }],
      rangedWeapons: [],
      meleeWeapons: [],
      abilities: { core: [], faction: [], other: [] },
    },
  ],
  stratagems: [{ id: "s1", name: { en: "Strat", de: "Strat DE" }, cost: 1, phase: ["fight"] }],
  enhancements: [{ id: "e1", name: { en: "Enh" }, cardType: "enhancement", description: { en: "desc" }, cost: "15" }],
  rules: {
    army: [{ name: { en: "Army Rule" }, rules: [{ order: 1, type: "text", text: { en: "army text" } }] }],
    detachment: [{ detachment: "Det", rules: [{ name: { en: "Det Rule" }, rules: [] }] }],
  },
};

describe("get40k11eData", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_DATASOURCE_11TH_URL", "https://example.test/11th");
    vi.stubEnv("VITE_VERSION", "9.9.9");
    global.fetch = vi.fn(async () => ({ ok: true, text: async () => JSON.stringify(faction) }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("injects cardType and source and resolves top-level names for the selected language", async () => {
    const result = await get40k11eData("de");
    const f = result.data[0];

    expect(f.datasheets[0].cardType).toBe("DataCard");
    expect(f.datasheets[0].source).toBe("40k-11e");
    expect(f.datasheets[0].name).toBe("Unit One"); // en fallback (no de in fixture)

    expect(f.stratagems[0].cardType).toBe("stratagem");
    expect(f.stratagems[0].name).toBe("Strat DE"); // de present

    expect(f.enhancements[0].cardType).toBe("enhancement");
    expect(f.enhancements[0].name).toBe("Enh");

    expect(f.rules.army[0].name).toBe("Army Rule");
    expect(f.rules.detachment[0].rules[0].name).toBe("Det Rule");
  });

  it("keeps body fields multilingual (only names are resolved at load time)", async () => {
    const result = await get40k11eData("en");
    const f = result.data[0];
    expect(f.enhancements[0].description).toEqual({ en: "desc" });
    expect(f.rules.army[0].rules[0].text).toEqual({ en: "army text" });
  });

  it("sets the standard wrapper fields, records the language and empties basicStratagems", async () => {
    const result = await get40k11eData("fr");
    expect(result.version).toBe("9.9.9");
    expect(result.language).toBe("fr");
    expect(result.noStratagemOptions).toBe(false);
    expect(result.data[0].basicStratagems).toEqual([]);
    expect(typeof result.lastCheckedForUpdate).toBe("string");
  });

  it("fetches one file per faction (29 factions)", async () => {
    await get40k11eData("en");
    expect(global.fetch).toHaveBeenCalledTimes(29);
    const url = global.fetch.mock.calls[0][0];
    expect(url).toMatch(/^https:\/\/example\.test\/11th\/[a-z_]+\.json\?\d+$/);
  });
});
