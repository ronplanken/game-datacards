import { describe, expect, it } from "vitest";
import { RESERVED_WEAPON_PROFILE_KEYS, isReservedWeaponProfileKey, normalizeKeywords } from "../weaponProfile.helpers";

describe("normalizeKeywords", () => {
  it("returns arrays unchanged (same reference)", () => {
    const keywords = ["Assault", "Rapid Fire 1"];
    expect(normalizeKeywords(keywords)).toBe(keywords);
  });

  it("returns an empty array unchanged", () => {
    expect(normalizeKeywords([])).toEqual([]);
  });

  it("wraps a non-empty string in an array", () => {
    expect(normalizeKeywords("T")).toEqual(["T"]);
    expect(normalizeKeywords("Torrent")).toEqual(["Torrent"]);
  });

  it("trims a wrapped string", () => {
    expect(normalizeKeywords("  Torrent  ")).toEqual(["Torrent"]);
  });

  it("returns an empty array for empty or whitespace-only strings", () => {
    expect(normalizeKeywords("")).toEqual([]);
    expect(normalizeKeywords("   ")).toEqual([]);
  });

  it("returns an empty array for null and undefined", () => {
    expect(normalizeKeywords(null)).toEqual([]);
    expect(normalizeKeywords(undefined)).toEqual([]);
  });

  it("returns an empty array for numbers, booleans and objects", () => {
    expect(normalizeKeywords(0)).toEqual([]);
    expect(normalizeKeywords(42)).toEqual([]);
    expect(normalizeKeywords(true)).toEqual([]);
    expect(normalizeKeywords({ 0: "T", length: 1 })).toEqual([]);
  });
});

describe("isReservedWeaponProfileKey", () => {
  it("flags every reserved profile field", () => {
    RESERVED_WEAPON_PROFILE_KEYS.forEach((key) => {
      expect(isReservedWeaponProfileKey(key)).toBe(true);
    });
  });

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    expect(isReservedWeaponProfileKey("Keywords")).toBe(true);
    expect(isReservedWeaponProfileKey("KEYWORDS")).toBe(true);
    expect(isReservedWeaponProfileKey("  keywords ")).toBe(true);
  });

  it("allows ordinary column keys", () => {
    ["range", "attacks", "skill", "strength", "ap", "damage", "keyword", "keywordsNote"].forEach((key) => {
      expect(isReservedWeaponProfileKey(key)).toBe(false);
    });
  });

  it("is safe for non-string input", () => {
    expect(isReservedWeaponProfileKey(undefined)).toBe(false);
    expect(isReservedWeaponProfileKey(null)).toBe(false);
    expect(isReservedWeaponProfileKey(7)).toBe(false);
  });
});
