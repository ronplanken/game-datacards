import { describe, it, expect } from "vitest";
import {
  FACTION_SYMBOL_BASE_URL,
  buildFactionIconCandidates,
  factionNamesFromCard,
  factionSymbolUrl,
  resolveFactionSymbolUrl,
  resolveFactionSymbolUrlForValue,
  isLegacyFactionCode,
  normalizeFactionName,
  resolveFactionCode,
  resolveFactionCodes,
} from "../factionSymbol.helpers";

describe("normalizeFactionName", () => {
  it("ignores case, punctuation, accents and a leading 'the'", () => {
    expect(normalizeFactionName("T'au Empire")).toBe("tauempire");
    expect(normalizeFactionName("  Tau   Empire ")).toBe("tauempire");
    expect(normalizeFactionName("The Emperor's Children")).toBe("emperorschildren");
    expect(normalizeFactionName("Adeptus-Mechanicus")).toBe("adeptusmechanicus");
  });

  it("survives missing values", () => {
    expect(normalizeFactionName(undefined)).toBe("");
    expect(normalizeFactionName(null)).toBe("");
  });
});

describe("resolveFactionCode", () => {
  it("resolves faction keywords that are not the datasource faction name", () => {
    // The bug: 11e cards print FACTION: Heretic Astartes, which used to resolve
    // to nothing and left the badge empty.
    expect(resolveFactionCode(["Heretic Astartes"])).toBe("CSM");
    expect(resolveFactionCode(["Adeptus Astartes"])).toBe("SM");
    expect(resolveFactionCode(["Asuryani"])).toBe("AE");
  });

  it("resolves sub-factions onto their parent symbol", () => {
    expect(resolveFactionCode(["Farsight Enclaves"])).toBe("TAU");
    expect(resolveFactionCode(["Crimson Fists"])).toBe("CHIF");
  });

  it("returns null for an unknown faction", () => {
    expect(resolveFactionCode(["Squats of Mars"])).toBeNull();
    expect(resolveFactionCode([])).toBeNull();
    expect(resolveFactionCode([undefined, null])).toBeNull();
  });

  it("keeps every distinct match, most specific first", () => {
    expect(resolveFactionCodes(["Ultramarines", "Space Marines"])).toEqual(["CHUL", "SM"]);
    expect(resolveFactionCodes(["Space Marines", "Adeptus Astartes"])).toEqual(["SM"]);
  });
});

describe("isLegacyFactionCode", () => {
  it("accepts 10th edition symbol codes only", () => {
    expect(isLegacyFactionCode("CSM")).toBe(true);
    expect(isLegacyFactionCode("AoI")).toBe(true);
    expect(isLegacyFactionCode("farsight-enclaves")).toBe(false);
    // A generated slug is always lowercase, so it is never a code.
    expect(isLegacyFactionCode("orks")).toBe(false);
    expect(isLegacyFactionCode("2f1c4b9e-9a1e-4d64-9d0e-0f7bb7f1c4aa")).toBe(false);
    expect(isLegacyFactionCode(undefined)).toBe(false);
  });
});

describe("factionNamesFromCard", () => {
  it("returns the most specific faction keyword first", () => {
    expect(factionNamesFromCard({ factions: ["Chaos", "Heretic Astartes"] })).toEqual(["Heretic Astartes", "Chaos"]);
  });

  it("prefers the custom datasource field, which is the one its card prints", () => {
    expect(factionNamesFromCard({ factionKeywords: ["Necrons"] })).toEqual(["Necrons"]);
    expect(factionNamesFromCard({ factionKeywords: ["Necrons"], factions: ["Orks"] })).toEqual(["Necrons"]);
  });

  it("treats an empty array as absent and tolerates missing values", () => {
    expect(factionNamesFromCard({ factions: [], factionKeywords: ["Necrons"] })).toEqual(["Necrons"]);
    expect(factionNamesFromCard({ factionKeywords: [], factions: ["Orks"] })).toEqual(["Orks"]);
    expect(factionNamesFromCard({})).toEqual([]);
    expect(factionNamesFromCard(undefined)).toEqual([]);
  });
});

describe("buildFactionIconCandidates", () => {
  it("keeps the 10th edition faction id first", () => {
    expect(buildFactionIconCandidates({ factionId: "CSM", names: ["Heretic Astartes"] })).toEqual(["CSM"]);
    expect(buildFactionIconCandidates({ factionId: "SM", names: ["Ultramarines"] })).toEqual(["SM", "CHUL"]);
  });

  it("falls back to the faction names for ids that are not symbol codes", () => {
    // 11th edition (UUID) and custom datasource (slug) faction ids.
    expect(buildFactionIconCandidates({ factionId: "3f0a-uuid-9931", names: ["Heretic Astartes"] })).toEqual(["CSM"]);
    expect(buildFactionIconCandidates({ factionId: "farsight-enclaves", names: ["T'au Empire"] })).toEqual(["TAU"]);
    // A slug short enough to look like a code is not requested first.
    expect(buildFactionIconCandidates({ factionId: "orks", names: ["Orks"] })).toEqual(["ORK"]);
  });

  it("returns an empty list when nothing resolves", () => {
    expect(buildFactionIconCandidates({ factionId: "my-own-faction", names: ["My Own Faction"] })).toEqual([]);
    expect(buildFactionIconCandidates()).toEqual([]);
  });
});

describe("resolveFactionSymbolUrl", () => {
  it("builds the symbol url for a 10th edition faction id", () => {
    expect(resolveFactionSymbolUrl({ faction_id: "CSM" })).toBe(`${FACTION_SYMBOL_BASE_URL}/CSM.svg`);
  });

  it("uses the faction keywords when the id is not a symbol code", () => {
    expect(resolveFactionSymbolUrl({ faction_id: "3f0a-uuid", factions: ["Adeptus Astartes", "Ultramarines"] })).toBe(
      `${FACTION_SYMBOL_BASE_URL}/CHUL.svg`,
    );
  });

  it("uses the datasource faction name as a last candidate", () => {
    expect(resolveFactionSymbolUrl({ faction_id: "necrons-slug" }, { name: "Necrons" })).toBe(
      `${FACTION_SYMBOL_BASE_URL}/NEC.svg`,
    );
  });

  it("prefers an uploaded external symbol", () => {
    expect(
      resolveFactionSymbolUrl({
        faction_id: "CSM",
        hasCustomFactionSymbol: true,
        externalFactionSymbol: "https://example.com/logo.png",
      }),
    ).toBe("https://example.com/logo.png");
  });

  it("returns null when nothing resolves", () => {
    expect(resolveFactionSymbolUrl({ faction_id: "my-own-faction" })).toBeNull();
    expect(resolveFactionSymbolUrl()).toBeNull();
    expect(factionSymbolUrl(null)).toBeNull();
  });
});

describe("resolveFactionSymbolUrlForValue", () => {
  it("returns a url value unchanged", () => {
    expect(resolveFactionSymbolUrlForValue("https://example.com/a.svg", {})).toBe("https://example.com/a.svg");
    expect(resolveFactionSymbolUrlForValue("data:image/png;base64,AAA", {})).toBe("data:image/png;base64,AAA");
  });

  it("resolves a symbol code or a faction name", () => {
    expect(resolveFactionSymbolUrlForValue("TYR", {})).toBe(`${FACTION_SYMBOL_BASE_URL}/TYR.svg`);
    expect(resolveFactionSymbolUrlForValue("Death Guard", {})).toBe(`${FACTION_SYMBOL_BASE_URL}/DG.svg`);
  });

  it("falls back to the card when the value resolves to nothing", () => {
    expect(resolveFactionSymbolUrlForValue("9f1c-uuid", { factions: ["Orks"] })).toBe(
      `${FACTION_SYMBOL_BASE_URL}/ORK.svg`,
    );
    expect(resolveFactionSymbolUrlForValue("", { faction_id: "my-own-faction" })).toBeNull();
  });
});
