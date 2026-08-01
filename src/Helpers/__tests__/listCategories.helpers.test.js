import { describe, it, expect } from "vitest";
import {
  cardHasKeyword,
  cardHasKeywordOrFaction,
  categorize40kUnits,
  isEnhancementSingleUse,
  isUnitEnhancementEligible,
} from "../listCategories.helpers";

describe("cardHasKeyword (edition-agnostic)", () => {
  it("matches 10e plain-string keywords", () => {
    const card = { keywords: ["Infantry", "Character"] };
    expect(cardHasKeyword(card, "Character")).toBe(true);
    expect(cardHasKeyword(card, "Vehicle")).toBe(false);
  });

  it("matches 11e language-keyed object keywords via the English form", () => {
    const card = { keywords: [{ en: "Character", de: "Charaktermodell" }, { en: "Epic Hero" }] };
    expect(cardHasKeyword(card, "Character")).toBe(true);
    expect(cardHasKeyword(card, "Epic Hero")).toBe(true);
    expect(cardHasKeyword(card, "Battleline")).toBe(false);
  });

  it("is case-insensitive and safe on missing keywords", () => {
    expect(cardHasKeyword({ keywords: ["character"] }, "Character")).toBe(true);
    expect(cardHasKeyword({}, "Character")).toBe(false);
    expect(cardHasKeyword(null, "Character")).toBe(false);
  });
});

describe("cardHasKeywordOrFaction", () => {
  it("matches keywords or faction names", () => {
    const card = { keywords: [{ en: "Character" }], factions: ["Salamanders"] };
    expect(cardHasKeywordOrFaction(card, "Character")).toBe(true);
    expect(cardHasKeywordOrFaction(card, "Salamanders")).toBe(true);
    expect(cardHasKeywordOrFaction(card, "Ultramarines")).toBe(false);
  });

  it("accepts a language-keyed object token", () => {
    const card = { keywords: [{ en: "Speeder" }] };
    expect(cardHasKeywordOrFaction(card, { en: "Speeder" })).toBe(true);
  });

  it("resolves single-element array tokens (odd exclude shape) to their value", () => {
    const card = { keywords: [{ en: "Solitaire" }] };
    // Enhancement excludes sometimes wrap a keyword in an array, e.g. ["Solitaire"].
    expect(cardHasKeywordOrFaction(card, ["Solitaire"])).toBe(true);
    expect(cardHasKeywordOrFaction({ keywords: [{ en: "Character" }] }, ["Solitaire"])).toBe(false);
  });

  it("never matches empty or nullish tokens", () => {
    const card = { keywords: [{ en: "Solitaire" }] };
    expect(cardHasKeywordOrFaction(card, "")).toBe(false);
    expect(cardHasKeywordOrFaction(card, null)).toBe(false);
    expect(cardHasKeywordOrFaction(card, undefined)).toBe(false);
  });
});

describe("categorize40kUnits with 11e object keywords", () => {
  it("routes 11e characters/battleline/transports to the right sections instead of Other", () => {
    const cards = [
      { name: "Captain", keywords: [{ en: "Character" }] },
      { name: "Intercessors", keywords: [{ en: "Battleline" }, { en: "Infantry" }] },
      { name: "Rhino", keywords: [{ en: "Dedicated Transport" }] },
      { name: "Aggressors", keywords: [{ en: "Infantry" }] },
    ];
    const result = categorize40kUnits(cards);
    expect(result.characters.map((c) => c.name)).toEqual(["Captain"]);
    expect(result.battleline.map((c) => c.name)).toEqual(["Intercessors"]);
    expect(result.transports.map((c) => c.name)).toEqual(["Rhino"]);
    expect(result.other.map((c) => c.name)).toEqual(["Aggressors"]);
  });

  it("still categorizes 10e string keywords", () => {
    const result = categorize40kUnits([{ name: "Captain", keywords: ["Character"] }]);
    expect(result.characters).toHaveLength(1);
  });
});

describe("isUnitEnhancementEligible", () => {
  const character = { keywords: [{ en: "Character" }, { en: "Infantry" }], factions: ["Adeptus Custodes"] };
  const walker = { keywords: [{ en: "Walker" }], factions: ["Adeptus Custodes"] };
  const epicHero = { keywords: [{ en: "Character" }, { en: "Epic Hero" }], factions: ["Adeptus Custodes"] };

  const regularEnhancement = { name: "Superior Creation", keywords: ["Adeptus Custodes"] };
  const upgrade = { name: "Auramite Sarcophagus (Upgrade)", keywords: ["Walker"], equipableByNonCharacter: true };

  it("lets a character take a matching regular enhancement", () => {
    expect(isUnitEnhancementEligible(character, regularEnhancement)).toBe(true);
  });

  it("does NOT let a non-character take a regular (non-upgrade) enhancement", () => {
    expect(isUnitEnhancementEligible(walker, { name: "X", keywords: ["Walker"] })).toBe(false);
  });

  it("lets a non-character take a matching upgrade (equipableByNonCharacter)", () => {
    expect(isUnitEnhancementEligible(walker, upgrade)).toBe(true);
  });

  it("does not offer an upgrade whose keyword the unit lacks", () => {
    expect(isUnitEnhancementEligible({ keywords: [{ en: "Infantry" }] }, upgrade)).toBe(false);
  });

  it("never offers enhancements or upgrades to Epic Heroes", () => {
    expect(isUnitEnhancementEligible(epicHero, regularEnhancement)).toBe(false);
    expect(
      isUnitEnhancementEligible({ ...epicHero, keywords: [...epicHero.keywords, { en: "Walker" }] }, upgrade),
    ).toBe(false);
  });

  it("respects excludes", () => {
    const excluded = { name: "Y", keywords: ["Adeptus Custodes"], excludes: [{ en: "Infantry" }] };
    expect(isUnitEnhancementEligible(character, excluded)).toBe(false);
  });
});

describe("isEnhancementSingleUse", () => {
  it("treats character enhancements as once-per-army", () => {
    expect(isEnhancementSingleUse({ name: "Superior Creation" })).toBe(true);
  });

  it("lets unit upgrades be handed out multiple times", () => {
    expect(isEnhancementSingleUse({ name: "Vexilla (Upgrade)", equipableByNonCharacter: true })).toBe(false);
  });
});
