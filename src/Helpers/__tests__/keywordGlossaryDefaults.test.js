import { describe, it, expect } from "vitest";
import { WARHAMMER_40K_10E_KEYWORD_GLOSSARY } from "../keywordGlossaryDefaults";

describe("WARHAMMER_40K_10E_KEYWORD_GLOSSARY", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(WARHAMMER_40K_10E_KEYWORD_GLOSSARY)).toBe(true);
    expect(WARHAMMER_40K_10E_KEYWORD_GLOSSARY.length).toBeGreaterThan(0);
  });

  it("includes the canonical weapon keywords from the built-in 10e tooltip", () => {
    const names = WARHAMMER_40K_10E_KEYWORD_GLOSSARY.map((entry) => entry.name);
    [
      "Anti-",
      "Assault",
      "Blast",
      "Devastating Wounds",
      "Extra Attacks",
      "Feel No Pain",
      "Hazardous",
      "Heavy",
      "Ignores Cover",
      "Indirect Fire",
      "Lance",
      "Lethal Hits",
      "Linked Fire",
      "Melta",
      "One Shot",
      "Pistol",
      "Plasma Warhead",
      "Precision",
      "Psychic",
      "Rapid Fire",
      "Sustained Hits",
      "Torrent",
      "Twin-linked",
    ].forEach((name) => {
      expect(names).toContain(name);
    });
  });

  it("has unique stable keys per entry", () => {
    const keys = WARHAMMER_40K_10E_KEYWORD_GLOSSARY.map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every entry carries a non-empty description and a valid matchType", () => {
    for (const entry of WARHAMMER_40K_10E_KEYWORD_GLOSSARY) {
      expect(typeof entry.key).toBe("string");
      expect(entry.key.length).toBeGreaterThan(0);
      expect(typeof entry.name).toBe("string");
      expect(entry.name.length).toBeGreaterThan(0);
      expect(typeof entry.description).toBe("string");
      expect(entry.description.length).toBeGreaterThan(0);
      expect(["exact", "prefix"]).toContain(entry.matchType);
    }
  });

  it("every entry declares appliesTo: ['weapons']", () => {
    for (const entry of WARHAMMER_40K_10E_KEYWORD_GLOSSARY) {
      expect(Array.isArray(entry.appliesTo)).toBe(true);
      expect(entry.appliesTo).toContain("weapons");
    }
  });

  it("uses prefix matching for parametrised rules", () => {
    const byName = Object.fromEntries(WARHAMMER_40K_10E_KEYWORD_GLOSSARY.map((e) => [e.name, e]));
    expect(byName["Anti-"].matchType).toBe("prefix");
    expect(byName["Melta"].matchType).toBe("prefix");
    expect(byName["Rapid Fire"].matchType).toBe("prefix");
    expect(byName["Sustained Hits"].matchType).toBe("prefix");
    expect(byName["Feel No Pain"].matchType).toBe("prefix");
  });
});
