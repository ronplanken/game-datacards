import { describe, it, expect } from "vitest";
import {
  resolveWeaponKeywordEntry,
  collectWeaponKeywordExplanations,
  getDefaultWeaponKeywordGlossary,
  validateSchema,
  create40kPreset,
} from "../customSchema.helpers";

const glossary = [
  { key: "one-shot", name: "One Shot", description: "Once per battle.", matchType: "exact" },
  { key: "anti", name: "Anti-", description: "Critical Wound vs matching keyword.", matchType: "prefix" },
  { key: "rapid-fire", name: "Rapid Fire", description: "Extra attacks at half range.", matchType: "prefix" },
  { key: "twin-linked", name: "Twin-linked", description: "Re-roll wounds.", matchType: "exact" },
];

describe("resolveWeaponKeywordEntry", () => {
  it("returns null for empty input", () => {
    expect(resolveWeaponKeywordEntry("", glossary)).toBeNull();
    expect(resolveWeaponKeywordEntry("One Shot", [])).toBeNull();
    expect(resolveWeaponKeywordEntry("One Shot", null)).toBeNull();
    expect(resolveWeaponKeywordEntry(null, glossary)).toBeNull();
  });

  it("matches exact entries case-insensitively", () => {
    expect(resolveWeaponKeywordEntry("One Shot", glossary)?.key).toBe("one-shot");
    expect(resolveWeaponKeywordEntry("one shot", glossary)?.key).toBe("one-shot");
    expect(resolveWeaponKeywordEntry("  ONE SHOT  ", glossary)?.key).toBe("one-shot");
  });

  it("matches prefix entries against parametrised keywords", () => {
    expect(resolveWeaponKeywordEntry("Anti-Infantry 4+", glossary)?.key).toBe("anti");
    expect(resolveWeaponKeywordEntry("Anti-Psyker 5+", glossary)?.key).toBe("anti");
    expect(resolveWeaponKeywordEntry("Rapid Fire 2", glossary)?.key).toBe("rapid-fire");
  });

  it("does not match unrelated keywords", () => {
    expect(resolveWeaponKeywordEntry("Some Custom Keyword", glossary)).toBeNull();
  });

  it("prefers the longer matching name when multiple entries collide", () => {
    const ambiguous = [
      { key: "power", name: "Power", description: "short", matchType: "prefix" },
      { key: "power-fist", name: "Power Fist", description: "specific", matchType: "exact" },
    ];
    expect(resolveWeaponKeywordEntry("Power Fist", ambiguous)?.key).toBe("power-fist");
  });

  it("treats matchType `prefix` as default-safe (defaults to exact)", () => {
    const noMatchType = [{ key: "one-shot", name: "One Shot", description: "..." }];
    expect(resolveWeaponKeywordEntry("One Shot", noMatchType)?.key).toBe("one-shot");
    expect(resolveWeaponKeywordEntry("One Shot Stuff", noMatchType)).toBeNull();
  });
});

describe("collectWeaponKeywordExplanations", () => {
  it("returns deduplicated entries in first-encountered order", () => {
    const explanations = collectWeaponKeywordExplanations(
      ["One Shot", "Anti-Infantry 4+", "One Shot", "Twin-linked", "Anti-Psyker 5+"],
      glossary,
    );
    expect(explanations.map((e) => e.key)).toEqual(["one-shot", "anti", "twin-linked"]);
  });

  it("skips unmatched keywords silently", () => {
    const explanations = collectWeaponKeywordExplanations(["Custom Thing", "One Shot"], glossary);
    expect(explanations.map((e) => e.key)).toEqual(["one-shot"]);
  });

  it("returns [] when inputs are missing", () => {
    expect(collectWeaponKeywordExplanations([], glossary)).toEqual([]);
    expect(collectWeaponKeywordExplanations(null, glossary)).toEqual([]);
    expect(collectWeaponKeywordExplanations(["One Shot"], null)).toEqual([]);
    expect(collectWeaponKeywordExplanations(["One Shot"], [])).toEqual([]);
  });
});

describe("getDefaultWeaponKeywordGlossary", () => {
  it("returns a populated array for 40k-10e", () => {
    const defaults = getDefaultWeaponKeywordGlossary("40k-10e");
    expect(defaults.length).toBeGreaterThan(0);
    expect(defaults.find((e) => e.name === "One Shot")).toBeTruthy();
  });

  it("returns an empty array for other base systems", () => {
    expect(getDefaultWeaponKeywordGlossary("aos")).toEqual([]);
    expect(getDefaultWeaponKeywordGlossary("blank")).toEqual([]);
    expect(getDefaultWeaponKeywordGlossary(undefined)).toEqual([]);
  });

  it("returns fresh copies so callers can mutate without side effects", () => {
    const a = getDefaultWeaponKeywordGlossary("40k-10e");
    a[0].description = "tampered";
    const b = getDefaultWeaponKeywordGlossary("40k-10e");
    expect(b[0].description).not.toBe("tampered");
  });
});

describe("create40kPreset seeds the glossary", () => {
  it("includes weaponKeywordGlossary at schema root", () => {
    const schema = create40kPreset();
    expect(Array.isArray(schema.weaponKeywordGlossary)).toBe(true);
    expect(schema.weaponKeywordGlossary.length).toBeGreaterThan(0);
  });
});

describe("validateSchema with weaponKeywordGlossary", () => {
  const baseValid = create40kPreset();

  it("accepts a valid glossary", () => {
    const result = validateSchema(baseValid);
    expect(result.valid).toBe(true);
  });

  it("accepts an empty glossary", () => {
    const result = validateSchema({ ...baseValid, weaponKeywordGlossary: [] });
    expect(result.valid).toBe(true);
  });

  it("accepts a missing glossary (optional field)", () => {
    const { weaponKeywordGlossary, ...rest } = baseValid;
    const result = validateSchema(rest);
    expect(result.valid).toBe(true);
  });

  it("rejects non-array glossary", () => {
    const result = validateSchema({ ...baseValid, weaponKeywordGlossary: "nope" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("must be an array"))).toBe(true);
  });

  it("rejects entries missing key", () => {
    const result = validateSchema({
      ...baseValid,
      weaponKeywordGlossary: [{ name: "One Shot", description: "x" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('missing or invalid "key"'))).toBe(true);
  });

  it("rejects duplicate keys", () => {
    const result = validateSchema({
      ...baseValid,
      weaponKeywordGlossary: [
        { key: "one-shot", name: "One Shot", description: "..." },
        { key: "one-shot", name: "Two Shots", description: "..." },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("duplicate"))).toBe(true);
  });

  it("rejects invalid matchType", () => {
    const result = validateSchema({
      ...baseValid,
      weaponKeywordGlossary: [{ key: "k", name: "K", description: "", matchType: "regex" }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("matchType"))).toBe(true);
  });
});
