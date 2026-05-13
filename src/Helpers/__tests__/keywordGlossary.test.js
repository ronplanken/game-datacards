import { describe, it, expect } from "vitest";
import {
  resolveKeywordEntry,
  collectKeywordExplanations,
  filterGlossaryByScope,
  getDefaultKeywordGlossary,
  migrateLegacyKeywordGlossary,
  readKeywordGlossary,
  validateSchema,
  create40kPreset,
  VALID_GLOSSARY_SCOPES,
} from "../customSchema.helpers";

const glossary = [
  {
    key: "one-shot",
    name: "One Shot",
    description: "Once per battle.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "anti",
    name: "Anti-",
    description: "Critical Wound vs matching keyword.",
    matchType: "prefix",
    appliesTo: ["weapons"],
  },
  {
    key: "rapid-fire",
    name: "Rapid Fire",
    description: "Extra attacks at half range.",
    matchType: "prefix",
    appliesTo: ["weapons"],
  },
  {
    key: "twin-linked",
    name: "Twin-linked",
    description: "Re-roll wounds.",
    matchType: "exact",
    appliesTo: ["weapons", "abilities"],
  },
  {
    key: "infantry",
    name: "Infantry",
    description: "A foot-soldier keyword.",
    matchType: "exact",
    appliesTo: ["unit-keywords"],
  },
];

describe("VALID_GLOSSARY_SCOPES", () => {
  it("includes the agreed set of scope identifiers", () => {
    expect(VALID_GLOSSARY_SCOPES).toEqual([
      "weapons",
      "abilities",
      "unit-keywords",
      "rules",
      "stratagems",
      "enhancements",
    ]);
  });
});

describe("filterGlossaryByScope", () => {
  it("returns only entries whose appliesTo includes the given scope", () => {
    const filtered = filterGlossaryByScope(glossary, "weapons");
    expect(filtered.map((e) => e.key)).toEqual(["one-shot", "anti", "rapid-fire", "twin-linked"]);
  });

  it("returns an entry to multiple scopes when listed", () => {
    expect(filterGlossaryByScope(glossary, "abilities").map((e) => e.key)).toEqual(["twin-linked"]);
    expect(filterGlossaryByScope(glossary, "unit-keywords").map((e) => e.key)).toEqual(["infantry"]);
  });

  it("returns [] for missing input or empty/missing scope", () => {
    expect(filterGlossaryByScope(null, "weapons")).toEqual([]);
    expect(filterGlossaryByScope(glossary, "")).toEqual([]);
    expect(filterGlossaryByScope(glossary, undefined)).toEqual([]);
  });

  it("skips entries with missing or non-array appliesTo", () => {
    const bad = [
      { key: "a", name: "A", description: "", appliesTo: ["weapons"] },
      { key: "b", name: "B", description: "" },
      { key: "c", name: "C", description: "", appliesTo: "weapons" },
    ];
    expect(filterGlossaryByScope(bad, "weapons").map((e) => e.key)).toEqual(["a"]);
  });
});

describe("resolveKeywordEntry", () => {
  it("returns null for empty input", () => {
    expect(resolveKeywordEntry("", glossary, "weapons")).toBeNull();
    expect(resolveKeywordEntry("One Shot", [], "weapons")).toBeNull();
    expect(resolveKeywordEntry("One Shot", null, "weapons")).toBeNull();
    expect(resolveKeywordEntry(null, glossary, "weapons")).toBeNull();
  });

  it("matches exact entries case-insensitively in scope", () => {
    expect(resolveKeywordEntry("One Shot", glossary, "weapons")?.key).toBe("one-shot");
    expect(resolveKeywordEntry("one shot", glossary, "weapons")?.key).toBe("one-shot");
    expect(resolveKeywordEntry("  ONE SHOT  ", glossary, "weapons")?.key).toBe("one-shot");
  });

  it("matches prefix entries against parametrised keywords", () => {
    expect(resolveKeywordEntry("Anti-Infantry 4+", glossary, "weapons")?.key).toBe("anti");
    expect(resolveKeywordEntry("Anti-Psyker 5+", glossary, "weapons")?.key).toBe("anti");
    expect(resolveKeywordEntry("Rapid Fire 2", glossary, "weapons")?.key).toBe("rapid-fire");
  });

  it("does not match unrelated keywords", () => {
    expect(resolveKeywordEntry("Some Custom Keyword", glossary, "weapons")).toBeNull();
  });

  it("only resolves entries in the requested scope", () => {
    // "Infantry" is scoped to unit-keywords, not weapons
    expect(resolveKeywordEntry("Infantry", glossary, "weapons")).toBeNull();
    expect(resolveKeywordEntry("Infantry", glossary, "unit-keywords")?.key).toBe("infantry");
  });

  it("prefers the longer matching name when multiple entries collide", () => {
    const ambiguous = [
      { key: "power", name: "Power", description: "short", matchType: "prefix", appliesTo: ["weapons"] },
      { key: "power-fist", name: "Power Fist", description: "specific", matchType: "exact", appliesTo: ["weapons"] },
    ];
    expect(resolveKeywordEntry("Power Fist", ambiguous, "weapons")?.key).toBe("power-fist");
  });
});

describe("collectKeywordExplanations", () => {
  it("returns deduplicated entries in first-encountered order, in scope", () => {
    const explanations = collectKeywordExplanations(
      ["One Shot", "Anti-Infantry 4+", "One Shot", "Twin-linked", "Anti-Psyker 5+"],
      glossary,
      "weapons",
    );
    expect(explanations.map((e) => e.key)).toEqual(["one-shot", "anti", "twin-linked"]);
  });

  it("filters by scope before matching", () => {
    // "Infantry" only resolves in unit-keywords scope
    expect(collectKeywordExplanations(["Infantry"], glossary, "weapons")).toEqual([]);
    expect(collectKeywordExplanations(["Infantry"], glossary, "unit-keywords").map((e) => e.key)).toEqual(["infantry"]);
  });

  it("returns [] when inputs are missing", () => {
    expect(collectKeywordExplanations([], glossary, "weapons")).toEqual([]);
    expect(collectKeywordExplanations(null, glossary, "weapons")).toEqual([]);
    expect(collectKeywordExplanations(["One Shot"], null, "weapons")).toEqual([]);
    expect(collectKeywordExplanations(["One Shot"], [], "weapons")).toEqual([]);
  });
});

describe("getDefaultKeywordGlossary", () => {
  it("returns a populated array for 40k-10e with appliesTo: ['weapons']", () => {
    const defaults = getDefaultKeywordGlossary("40k-10e");
    expect(defaults.length).toBeGreaterThan(0);
    expect(defaults.find((e) => e.name === "One Shot")).toBeTruthy();
    expect(defaults.every((e) => e.appliesTo?.includes("weapons"))).toBe(true);
  });

  it("returns an empty array for other base systems", () => {
    expect(getDefaultKeywordGlossary("aos")).toEqual([]);
    expect(getDefaultKeywordGlossary("blank")).toEqual([]);
    expect(getDefaultKeywordGlossary(undefined)).toEqual([]);
  });

  it("returns fresh copies so callers can mutate without side effects", () => {
    const a = getDefaultKeywordGlossary("40k-10e");
    a[0].description = "tampered";
    a[0].appliesTo.push("abilities");
    const b = getDefaultKeywordGlossary("40k-10e");
    expect(b[0].description).not.toBe("tampered");
    expect(b[0].appliesTo).toEqual(["weapons"]);
  });
});

describe("create40kPreset seeds the glossary", () => {
  it("includes keywordGlossary at schema root", () => {
    const schema = create40kPreset();
    expect(Array.isArray(schema.keywordGlossary)).toBe(true);
    expect(schema.keywordGlossary.length).toBeGreaterThan(0);
  });

  it("every seeded entry declares an appliesTo scope", () => {
    const schema = create40kPreset();
    for (const entry of schema.keywordGlossary) {
      expect(Array.isArray(entry.appliesTo)).toBe(true);
      expect(entry.appliesTo.length).toBeGreaterThan(0);
    }
  });
});

describe("validateSchema with keywordGlossary", () => {
  const baseValid = create40kPreset();

  it("accepts a valid glossary", () => {
    const result = validateSchema(baseValid);
    expect(result.valid).toBe(true);
  });

  it("accepts an empty glossary", () => {
    const result = validateSchema({ ...baseValid, keywordGlossary: [] });
    expect(result.valid).toBe(true);
  });

  it("accepts a missing glossary (optional field)", () => {
    const { keywordGlossary, ...rest } = baseValid;
    const result = validateSchema(rest);
    expect(result.valid).toBe(true);
  });

  it("rejects non-array glossary", () => {
    const result = validateSchema({ ...baseValid, keywordGlossary: "nope" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be an array"))).toBe(true);
  });

  it("rejects entries missing key", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ name: "One Shot", description: "x", appliesTo: ["weapons"] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing or invalid "key"'))).toBe(true);
  });

  it("rejects duplicate keys", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [
        { key: "one-shot", name: "One Shot", description: "...", appliesTo: ["weapons"] },
        { key: "one-shot", name: "Two Shots", description: "...", appliesTo: ["weapons"] },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicate"))).toBe(true);
  });

  it("rejects invalid matchType", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ key: "k", name: "K", description: "", matchType: "regex", appliesTo: ["weapons"] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("matchType"))).toBe(true);
  });

  it("rejects entries without appliesTo", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ key: "k", name: "K", description: "" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("appliesTo"))).toBe(true);
  });

  it("rejects entries with an empty appliesTo array", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ key: "k", name: "K", description: "", appliesTo: [] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("appliesTo"))).toBe(true);
  });

  it("rejects entries with an invalid scope in appliesTo", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ key: "k", name: "K", description: "", appliesTo: ["bogus"] }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("bogus"))).toBe(true);
  });
});

describe("migrateLegacyKeywordGlossary", () => {
  it("renames weaponKeywordGlossary to keywordGlossary", () => {
    const schema = {
      baseSystem: "40k-10e",
      weaponKeywordGlossary: [
        { key: "one-shot", name: "One Shot", description: "Once per battle.", matchType: "exact" },
      ],
    };
    const migrated = migrateLegacyKeywordGlossary(schema);
    expect(migrated).not.toBe(schema);
    expect(migrated.weaponKeywordGlossary).toBeUndefined();
    expect(migrated.keywordGlossary).toHaveLength(1);
  });

  it("backfills appliesTo: ['weapons'] on legacy entries that lack it", () => {
    const schema = {
      weaponKeywordGlossary: [{ key: "one-shot", name: "One Shot", description: "x" }],
    };
    const migrated = migrateLegacyKeywordGlossary(schema);
    expect(migrated.keywordGlossary[0].appliesTo).toEqual(["weapons"]);
  });

  it("preserves an existing appliesTo on legacy entries", () => {
    const schema = {
      weaponKeywordGlossary: [{ key: "k", name: "K", description: "", appliesTo: ["abilities"] }],
    };
    const migrated = migrateLegacyKeywordGlossary(schema);
    expect(migrated.keywordGlossary[0].appliesTo).toEqual(["abilities"]);
  });

  it("returns the same reference when nothing needs migrating", () => {
    const schema = {
      keywordGlossary: [{ key: "one-shot", name: "One Shot", description: "x", appliesTo: ["weapons"] }],
    };
    expect(migrateLegacyKeywordGlossary(schema)).toBe(schema);
  });

  it("returns the same reference when neither field is present", () => {
    const schema = { baseSystem: "blank", cardTypes: [] };
    expect(migrateLegacyKeywordGlossary(schema)).toBe(schema);
  });

  it("drops the legacy field even if both are present, preferring the new field", () => {
    const schema = {
      keywordGlossary: [{ key: "new", name: "N", description: "n", appliesTo: ["weapons"] }],
      weaponKeywordGlossary: [{ key: "old", name: "O", description: "o" }],
    };
    const migrated = migrateLegacyKeywordGlossary(schema);
    expect(migrated.weaponKeywordGlossary).toBeUndefined();
    expect(migrated.keywordGlossary.map((e) => e.key)).toEqual(["new"]);
  });

  it("handles null/undefined input safely", () => {
    expect(migrateLegacyKeywordGlossary(null)).toBeNull();
    expect(migrateLegacyKeywordGlossary(undefined)).toBeUndefined();
  });
});

describe("readKeywordGlossary", () => {
  it("returns the new-shape field when present", () => {
    const list = [{ key: "k", name: "K", description: "", appliesTo: ["weapons"] }];
    expect(readKeywordGlossary({ keywordGlossary: list })).toBe(list);
  });

  it("falls back to the legacy field, backfilling appliesTo", () => {
    const schema = {
      weaponKeywordGlossary: [{ key: "k", name: "K", description: "" }],
    };
    const result = readKeywordGlossary(schema);
    expect(result).toEqual([{ key: "k", name: "K", description: "", appliesTo: ["weapons"] }]);
  });

  it("returns the same migrated reference on repeated reads (cached)", () => {
    const schema = {
      weaponKeywordGlossary: [{ key: "k", name: "K", description: "" }],
    };
    const a = readKeywordGlossary(schema);
    const b = readKeywordGlossary(schema);
    expect(a).toBe(b);
  });

  it("returns undefined when neither field is present", () => {
    expect(readKeywordGlossary({})).toBeUndefined();
    expect(readKeywordGlossary(null)).toBeUndefined();
  });
});
