import { describe, it, expect } from "vitest";
import { WARHAMMER_40K_11E_KEYWORD_GLOSSARY } from "../keywordGlossary11eDefaults";
import {
  VALID_KEYWORD_MATCH_TYPES,
  VALID_GLOSSARY_SCOPES,
  resolveKeywordEntry,
  create40k11ePreset,
  validateSchema,
  is40kBaseSystem,
  VALID_BASE_SYSTEMS,
} from "../customSchema.helpers";

describe("WARHAMMER_40K_11E_KEYWORD_GLOSSARY", () => {
  it("is a non-empty array with unique keys", () => {
    expect(WARHAMMER_40K_11E_KEYWORD_GLOSSARY.length).toBeGreaterThan(0);
    const keys = WARHAMMER_40K_11E_KEYWORD_GLOSSARY.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("only uses valid matchTypes and scopes", () => {
    for (const entry of WARHAMMER_40K_11E_KEYWORD_GLOSSARY) {
      expect(VALID_KEYWORD_MATCH_TYPES).toContain(entry.matchType);
      expect(entry.appliesTo.length).toBeGreaterThan(0);
      entry.appliesTo.forEach((scope) => expect(VALID_GLOSSARY_SCOPES).toContain(scope));
    }
  });

  it("covers weapon keywords and core abilities", () => {
    const scopes = (scope) => WARHAMMER_40K_11E_KEYWORD_GLOSSARY.filter((e) => e.appliesTo.includes(scope));
    expect(scopes("weapons").length).toBeGreaterThan(0);
    expect(scopes("abilities").length).toBeGreaterThan(0);
    const names = WARHAMMER_40K_11E_KEYWORD_GLOSSARY.map((e) => e.name);
    ["Anti-", "Rapid Fire", "Sustained Hits", "Deadly Demise", "Feel No Pain", "Scouts"].forEach((n) =>
      expect(names).toContain(n),
    );
  });

  it("carries plain-text descriptions (source markup stripped)", () => {
    for (const entry of WARHAMMER_40K_11E_KEYWORD_GLOSSARY) {
      expect(typeof entry.description).toBe("string");
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.description).not.toMatch(/<\/?(?:k|b|i|u|ul|li)>/);
    }
  });

  it("resolves parameterized 11e tags through the shared matcher", () => {
    const g = WARHAMMER_40K_11E_KEYWORD_GLOSSARY;
    expect(resolveKeywordEntry("Rapid Fire 1", g, "weapons")?.key).toBe("rapid-fire");
    expect(resolveKeywordEntry("Anti-Vehicle 4+", g, "weapons")?.key).toBe("anti");
    expect(resolveKeywordEntry('Scouts 6"', g, "abilities")?.key).toBe("scouts");
    expect(resolveKeywordEntry("Deadly Demise D6+2", g, "abilities")?.key).toBe("deadly-demise");
  });
});

describe("40k-11e base system", () => {
  it("is a valid base system and classified as a 40K system", () => {
    expect(VALID_BASE_SYSTEMS).toContain("40k-11e");
    expect(is40kBaseSystem("40k-11e")).toBe(true);
    expect(is40kBaseSystem("40k-10e")).toBe(true);
    expect(is40kBaseSystem("aos")).toBe(false);
  });

  it("create40k11ePreset produces a valid schema seeded with the 11e glossary", () => {
    const preset = create40k11ePreset();
    expect(preset.baseSystem).toBe("40k-11e");
    expect(preset.cardTypes.map((ct) => ct.baseType)).toEqual(
      expect.arrayContaining(["unit", "rule", "enhancement", "stratagem"]),
    );
    expect(preset.keywordGlossary.length).toBe(WARHAMMER_40K_11E_KEYWORD_GLOSSARY.length);
    const result = validateSchema(preset);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
