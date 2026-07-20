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

// The shared keyword glossary file (keywords.json) the 11e datasource ships
// alongside the faction files. Entries use the custom-datasource glossary shape
// (name/description strings, matchType, appliesTo) with optional nameLoc/
// descriptionLoc language maps for translated entries.
const keywordsFile = {
  source: "40k-11e",
  cardType: "keywords",
  keywords: [
    {
      key: "rapid-fire",
      name: "Rapid Fire",
      description: "Increase the Attacks characteristic by X when targeting units within half range.",
      matchType: "parameterized",
      appliesTo: ["weapons"],
    },
  ],
};

// The shared core stratagems file (core.json) — the stratagems every army can
// use, mirroring the 10th edition core.json shape.
const coreFile = {
  source: "40k-11e",
  compatibleDataVersion: 886,
  stratagems: [
    {
      id: "core-1",
      name: { en: "Command Re-roll", de: "Befehl neu würfeln" },
      cost: 1,
      type: "Core Stratagem",
      phase: ["any"],
      effect: { en: "Re-roll that roll." },
    },
  ],
};

const bodyFor = (url) => {
  if (url.includes("keywords.json")) return keywordsFile;
  if (url.includes("core.json")) return coreFile;
  return faction;
};

describe("get40k11eData", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_DATASOURCE_11TH_URL", "https://example.test/11th");
    vi.stubEnv("VITE_VERSION", "9.9.9");
    global.fetch = vi.fn(async (url) => ({
      ok: true,
      text: async () => JSON.stringify(bodyFor(url)),
    }));
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

  it("sets the standard wrapper fields and records the language", async () => {
    const result = await get40k11eData("fr");
    expect(result.version).toBe("9.9.9");
    expect(result.language).toBe("fr");
    expect(result.noStratagemOptions).toBe(false);
    expect(typeof result.lastCheckedForUpdate).toBe("string");
  });

  it("exposes core.json stratagems as basicStratagems on every faction", async () => {
    const result = await get40k11eData("de");
    const basics = result.data[0].basicStratagems;
    expect(basics).toHaveLength(1);
    expect(basics[0]).toMatchObject({ cardType: "stratagem", source: "40k-11e", type: "Core Stratagem" });
    // Top-level name resolves to the selected language; body fields stay multilingual.
    expect(basics[0].name).toBe("Befehl neu würfeln");
    expect(basics[0].effect).toEqual({ en: "Re-roll that roll." });
  });

  it("fetches one file per faction (29) plus keywords.json and core.json", async () => {
    await get40k11eData("en");
    const shared = (u) => u.includes("keywords.json") || u.includes("core.json");
    const factionCalls = global.fetch.mock.calls.filter(([u]) => !shared(u));
    expect(factionCalls).toHaveLength(29);
    expect(global.fetch.mock.calls.filter(([u]) => u.includes("keywords.json"))).toHaveLength(1);
    expect(global.fetch.mock.calls.filter(([u]) => u.includes("core.json"))).toHaveLength(1);
    expect(factionCalls[0][0]).toMatch(/^https:\/\/example\.test\/11th\/[a-z_]+\.json\?\d+$/);
  });

  it("attaches the keyword glossary from keywords.json", async () => {
    const result = await get40k11eData("en");
    expect(result.keywordGlossary).toHaveLength(1);
    expect(result.keywordGlossary[0]).toMatchObject({
      key: "rapid-fire",
      name: "Rapid Fire",
      matchType: "parameterized",
      appliesTo: ["weapons"],
    });
  });

  it("degrades gracefully when keywords.json and core.json are unavailable", async () => {
    const shared = (u) => u.includes("keywords.json") || u.includes("core.json");
    global.fetch = vi.fn(async (url) => ({
      ok: !shared(url),
      status: shared(url) ? 404 : 200,
      statusText: shared(url) ? "Not Found" : "OK",
      text: async () => JSON.stringify(faction),
    }));
    const result = await get40k11eData("en");
    expect(result.keywordGlossary).toEqual([]);
    expect(result.data[0].basicStratagems).toEqual([]);
    // Factions still load fine when the shared files are missing.
    expect(result.data).toHaveLength(29);
  });
});
