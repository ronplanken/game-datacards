import { describe, it, expect } from "vitest";
import { resolve11eKeywordEntry, collect11eKeywordEntries } from "../keyword11eGlossary.helpers";

// A trimmed-down glossary mirroring the real 11th edition keywords.json shape:
// multilingual name/description, keyed by category.
const glossary = [
  { key: "anti", category: "weapon", name: { en: "Anti" }, description: { en: "Anti desc <b>X</b>" } },
  { key: "assault", category: "weapon", name: { en: "Assault" }, description: { en: "Assault desc" } },
  { key: "blast", category: "weapon", name: { en: "Blast" }, description: { en: "Blast desc" } },
  { key: "rapid-fire", category: "weapon", name: { en: "Rapid Fire" }, description: { en: "Rapid Fire desc" } },
  { key: "sustained-hits", category: "weapon", name: { en: "Sustained Hits" }, description: { en: "Sustained desc" } },
  { key: "twin-linked", category: "weapon", name: { en: "Twin-linked" }, description: { en: "Twin desc" } },
  { key: "deadly-demise", category: "core", name: { en: "Deadly Demise" }, description: { en: "Demise desc" } },
  { key: "feel-no-pain", category: "core", name: { en: "Feel No Pain" }, description: { en: "FNP desc" } },
  { key: "scouts", category: "core", name: { en: "Scouts" }, description: { en: "Scouts desc" } },
  { key: "leader", category: "core", name: { en: "Leader" }, description: { en: "Leader desc" } },
];

describe("resolve11eKeywordEntry", () => {
  it("matches an exact bare keyword", () => {
    expect(resolve11eKeywordEntry("Assault", glossary)?.key).toBe("assault");
  });

  it("matches a keyword carrying an integer value", () => {
    expect(resolve11eKeywordEntry("Rapid Fire 1", glossary)?.key).toBe("rapid-fire");
    expect(resolve11eKeywordEntry("Sustained Hits 2", glossary)?.key).toBe("sustained-hits");
  });

  it("matches a bare keyword that usually carries a value", () => {
    expect(resolve11eKeywordEntry("Blast", glossary)?.key).toBe("blast");
  });

  it("matches dice, save and inch-mark values", () => {
    expect(resolve11eKeywordEntry("Deadly Demise D3", glossary)?.key).toBe("deadly-demise");
    expect(resolve11eKeywordEntry("Feel No Pain 5+", glossary)?.key).toBe("feel-no-pain");
    expect(resolve11eKeywordEntry('Scouts 6"', glossary)?.key).toBe("scouts");
  });

  it("matches the hyphenated Anti-X form", () => {
    expect(resolve11eKeywordEntry("Anti-Vehicle 4+", glossary)?.key).toBe("anti");
    expect(resolve11eKeywordEntry("Anti-Psyker 2+", glossary)?.key).toBe("anti");
  });

  it("matches hyphenated full names", () => {
    expect(resolve11eKeywordEntry("Twin-linked", glossary)?.key).toBe("twin-linked");
  });

  it("is case-insensitive", () => {
    expect(resolve11eKeywordEntry("rapid fire 1", glossary)?.key).toBe("rapid-fire");
  });

  it("restricts to a category when given", () => {
    expect(resolve11eKeywordEntry('Scouts 6"', glossary, "core")?.key).toBe("scouts");
    expect(resolve11eKeywordEntry('Scouts 6"', glossary, "weapon")).toBeNull();
    expect(resolve11eKeywordEntry("Assault", glossary, "weapon")?.key).toBe("assault");
    expect(resolve11eKeywordEntry("Assault", glossary, "core")).toBeNull();
  });

  it("returns null for non-matches and bad input", () => {
    expect(resolve11eKeywordEntry("Meltagun", glossary)).toBeNull();
    expect(resolve11eKeywordEntry("", glossary)).toBeNull();
    expect(resolve11eKeywordEntry("Assault", [])).toBeNull();
    expect(resolve11eKeywordEntry(undefined, glossary)).toBeNull();
  });

  it("prefers the longest matching name", () => {
    const overlap = [
      { key: "sustained", category: "weapon", name: { en: "Sustained" }, description: { en: "x" } },
      ...glossary,
    ];
    expect(resolve11eKeywordEntry("Sustained Hits 1", overlap)?.key).toBe("sustained-hits");
  });
});

describe("collect11eKeywordEntries", () => {
  it("dedupes matched entries preserving first-seen order", () => {
    const tags = ["Rapid Fire 1", "Assault", "Rapid Fire 2", "Nonsense"];
    const entries = collect11eKeywordEntries(tags, glossary, "weapon");
    expect(entries.map((e) => e.key)).toEqual(["rapid-fire", "assault"]);
  });

  it("returns an empty array for empty input", () => {
    expect(collect11eKeywordEntries([], glossary)).toEqual([]);
    expect(collect11eKeywordEntries(["Assault"], [])).toEqual([]);
  });
});
