import { describe, it, expect } from "vitest";
import {
  resolveKeywordEntry,
  collectKeywordExplanations,
  filterGlossaryByScope,
  findGlossaryMatchesInText,
  resolveKeywordStyle,
  getDefaultKeywordGlossary,
  validateSchema,
  create40kPreset,
  DEFAULT_KEYWORD_STYLE,
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
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "sustained-hits",
    name: "Sustained Hits",
    description: "Extra hits on critical hits.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "melta",
    name: "Melta",
    description: "Extra damage within half range.",
    matchType: "parameterized",
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
    expect(filtered.map((e) => e.key)).toEqual([
      "one-shot",
      "anti",
      "rapid-fire",
      "sustained-hits",
      "melta",
      "twin-linked",
    ]);
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

  it("matches parameterized entries with text-plus-save values", () => {
    expect(resolveKeywordEntry("Anti-Infantry 4+", glossary, "weapons")?.key).toBe("anti");
    expect(resolveKeywordEntry("Anti-Psyker 5+", glossary, "weapons")?.key).toBe("anti");
    expect(resolveKeywordEntry("Anti-Heavy Vehicles 4+", glossary, "weapons")?.key).toBe("anti");
  });

  it("matches text-only values for hyphenated parameterized entries", () => {
    expect(resolveKeywordEntry("Anti-Vehicle", glossary, "weapons")?.key).toBe("anti");
    expect(resolveKeywordEntry("Anti-Heavy Vehicles", glossary, "weapons")?.key).toBe("anti");
  });

  it("matches parameterized entries with numeric, save, dice, and dice-plus values", () => {
    expect(resolveKeywordEntry("Rapid Fire 2", glossary, "weapons")?.key).toBe("rapid-fire");
    expect(resolveKeywordEntry("Sustained Hits 2", glossary, "weapons")?.key).toBe("sustained-hits");
    expect(resolveKeywordEntry("Melta D6", glossary, "weapons")?.key).toBe("melta");
    expect(resolveKeywordEntry("Melta D6+2", glossary, "weapons")?.key).toBe("melta");
    expect(resolveKeywordEntry("Melta 2D6+2", glossary, "weapons")?.key).toBe("melta");
  });

  it("matches parameterized entries with inch-mark distance values", () => {
    const scoped = [
      {
        key: "scouts",
        name: "Scouts",
        description: "Pre-battle move.",
        matchType: "parameterized",
        appliesTo: ["abilities"],
      },
    ];
    expect(resolveKeywordEntry('Scouts 6"', scoped, "abilities")?.key).toBe("scouts");
    expect(resolveKeywordEntry('Scouts 9"', scoped, "abilities")?.key).toBe("scouts");
    expect(resolveKeywordEntry("Scouts", scoped, "abilities")?.key).toBe("scouts");
  });

  it("matches a bare parameterized keyword name but not unrelated trailing text", () => {
    expect(resolveKeywordEntry("Sustained Hits", glossary, "weapons")?.key).toBe("sustained-hits");
    expect(resolveKeywordEntry("Sustained Hits in melee", glossary, "weapons")).toBeNull();
  });

  it("does not consume unbounded words before a parameter value", () => {
    expect(resolveKeywordEntry("Sustained Hits also gives extra Pain 5+", glossary, "weapons")).toBeNull();
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

describe("findGlossaryMatchesInText", () => {
  const abilityGlossary = [
    {
      key: "feel-no-pain",
      name: "Feel No Pain",
      description: "Roll to ignore a lost wound.",
      matchType: "parameterized",
      appliesTo: ["abilities"],
      displayMode: "tooltip",
    },
    {
      key: "pain",
      name: "Pain",
      description: "A shorter keyword.",
      matchType: "exact",
      appliesTo: ["abilities"],
      displayMode: "tooltip",
    },
    {
      key: "scout",
      name: "Scout",
      description: "Make a pre-game move.",
      matchType: "exact",
      appliesTo: ["abilities"],
      displayMode: "explanation",
    },
    {
      key: "stealth",
      name: "Stealth",
      description: "Subtract 1 from hit rolls.",
      matchType: "exact",
      appliesTo: ["weapons"],
      displayMode: "tooltip",
    },
  ];

  it("matches a tooltip entry name as a whole word, case-insensitively", () => {
    const matches = findGlossaryMatchesInText("This model has feel no pain in melee", abilityGlossary, "abilities");
    expect(matches).toHaveLength(1);
    expect(matches[0].entry.key).toBe("feel-no-pain");
    expect(matches[0].text).toBe("feel no pain");
  });

  it("includes parameterized keyword values in the matched tooltip span", () => {
    const matches = findGlossaryMatchesInText(
      "This model has Feel No Pain 5+ and Sustained Hits D6+2.",
      [
        ...abilityGlossary,
        {
          key: "sustained-hits",
          name: "Sustained Hits",
          description: "Extra hits.",
          matchType: "parameterized",
          appliesTo: ["abilities"],
          displayMode: "tooltip",
        },
      ],
      "abilities",
    );
    expect(matches.map((m) => m.text)).toEqual(["Feel No Pain 5+", "Sustained Hits D6+2"]);
  });

  it("does not underline long prose as a parameterized keyword value", () => {
    const matches = findGlossaryMatchesInText(
      "Sustained Hits also gives extra Pain 5+ models.",
      [
        {
          key: "sustained-hits",
          name: "Sustained Hits",
          description: "Extra hits.",
          matchType: "parameterized",
          appliesTo: ["abilities"],
          displayMode: "tooltip",
        },
      ],
      "abilities",
    );
    expect(matches.map((m) => m.text)).toEqual(["Sustained Hits"]);
  });

  it("returns multiple matches sorted by position", () => {
    const matches = findGlossaryMatchesInText("Feel No Pain now, more Pain later", abilityGlossary, "abilities");
    expect(matches.map((m) => m.entry.key)).toEqual(["feel-no-pain", "pain"]);
    expect(matches[0].start).toBeLessThan(matches[1].start);
  });

  it("prefers the longer entry name when two would overlap", () => {
    const matches = findGlossaryMatchesInText("It has Feel No Pain.", abilityGlossary, "abilities");
    expect(matches).toHaveLength(1);
    expect(matches[0].entry.key).toBe("feel-no-pain");
  });

  it("does not match a name inside a larger word", () => {
    expect(findGlossaryMatchesInText("A painful situation", abilityGlossary, "abilities")).toEqual([]);
  });

  it("ignores entries that are not in tooltip display mode", () => {
    expect(findGlossaryMatchesInText("Use Scout to redeploy", abilityGlossary, "abilities")).toEqual([]);
  });

  it("ignores entries outside the requested scope", () => {
    expect(findGlossaryMatchesInText("This weapon has Stealth", abilityGlossary, "abilities")).toEqual([]);
    expect(findGlossaryMatchesInText("This weapon has Stealth", abilityGlossary, "weapons")).toHaveLength(1);
  });

  it("returns [] for missing or empty inputs", () => {
    expect(findGlossaryMatchesInText("", abilityGlossary, "abilities")).toEqual([]);
    expect(findGlossaryMatchesInText(null, abilityGlossary, "abilities")).toEqual([]);
    expect(findGlossaryMatchesInText("Feel No Pain", null, "abilities")).toEqual([]);
    expect(findGlossaryMatchesInText("Feel No Pain", [], "abilities")).toEqual([]);
  });

  it("skips tooltip entries that have no description", () => {
    const noDesc = [
      {
        key: "k",
        name: "Rampage",
        description: "",
        matchType: "exact",
        appliesTo: ["abilities"],
        displayMode: "tooltip",
      },
    ];
    expect(findGlossaryMatchesInText("Goes on a Rampage", noDesc, "abilities")).toEqual([]);
  });
});

describe("resolveKeywordStyle", () => {
  it("returns the default style for a null entry", () => {
    expect(resolveKeywordStyle(null)).toEqual(DEFAULT_KEYWORD_STYLE);
  });

  it("returns the default style for an entry with no style object", () => {
    expect(resolveKeywordStyle({ key: "k", name: "K" })).toEqual(DEFAULT_KEYWORD_STYLE);
  });

  it("keeps valid per-field overrides and fills the rest from defaults", () => {
    const resolved = resolveKeywordStyle({ style: { casing: "normal", brackets: "none" } });
    expect(resolved).toEqual({ casing: "normal", brackets: "none", weight: "bold" });
  });

  it("falls back to defaults for unknown values", () => {
    const resolved = resolveKeywordStyle({ style: { casing: "tiny", weight: "ultra", brackets: "round" } });
    expect(resolved).toEqual(DEFAULT_KEYWORD_STYLE);
  });
});

describe("getDefaultKeywordGlossary", () => {
  it("returns a populated array for 40k-10e with appliesTo: ['weapons']", () => {
    const defaults = getDefaultKeywordGlossary("40k-10e");
    expect(defaults.length).toBeGreaterThan(0);
    expect(defaults.find((e) => e.name === "One Shot")).toBeTruthy();
    expect(defaults.every((e) => e.appliesTo?.includes("weapons"))).toBe(true);
  });

  it("returns the 11e seed (weapons + abilities scopes) for 40k-11e", () => {
    const defaults = getDefaultKeywordGlossary("40k-11e");
    expect(defaults.length).toBeGreaterThan(0);
    expect(defaults.some((e) => e.appliesTo.includes("weapons"))).toBe(true);
    expect(defaults.some((e) => e.appliesTo.includes("abilities"))).toBe(true);
    expect(defaults.find((e) => e.name === "Rapid Fire")?.matchType).toBe("parameterized");
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

  it("accepts displayMode 'explanation' and 'tooltip'", () => {
    for (const mode of ["explanation", "tooltip"]) {
      const result = validateSchema({
        ...baseValid,
        keywordGlossary: [{ key: "k", name: "K", description: "", appliesTo: ["weapons"], displayMode: mode }],
      });
      expect(result.valid).toBe(true);
    }
  });

  it("rejects an invalid displayMode", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ key: "k", name: "K", description: "", appliesTo: ["weapons"], displayMode: "banner" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("displayMode"))).toBe(true);
  });

  it("accepts a valid style object", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [
        {
          key: "k",
          name: "K",
          description: "",
          appliesTo: ["weapons"],
          style: { casing: "normal", brackets: "none", weight: "bold" },
        },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects a non-object style", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ key: "k", name: "K", description: "", appliesTo: ["weapons"], style: "bold" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("style"))).toBe(true);
  });

  it("rejects an invalid style field value", () => {
    const result = validateSchema({
      ...baseValid,
      keywordGlossary: [{ key: "k", name: "K", description: "", appliesTo: ["weapons"], style: { casing: "huge" } }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("style.casing"))).toBe(true);
  });
});
