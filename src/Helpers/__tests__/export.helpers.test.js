import { describe, expect, it } from "vitest";
import { buildUniqueFilenames } from "../export.helpers";

describe("buildUniqueFilenames", () => {
  it("returns the name unchanged for a single card", () => {
    const result = buildUniqueFilenames([{ name: "Librarian" }]);
    expect(result).toEqual(["librarian"]);
  });

  it("returns unique names unchanged when all cards differ", () => {
    const result = buildUniqueFilenames([{ name: "Librarian" }, { name: "Captain" }, { name: "Chaplain" }]);
    expect(result).toEqual(["librarian", "captain", "chaplain"]);
  });

  it("appends numeric suffixes for duplicate names", () => {
    const result = buildUniqueFilenames([{ name: "Librarian" }, { name: "Librarian" }, { name: "Librarian" }]);
    expect(result).toEqual(["librarian_1", "librarian_2", "librarian_3"]);
  });

  it("uses subname to disambiguate cards with the same name", () => {
    const result = buildUniqueFilenames([
      { name: "Librarian", subname: "In Terminator Armor" },
      { name: "Librarian", subname: "In Phobos Armor" },
    ]);
    expect(result).toEqual(["librarian_in_terminator_armor", "librarian_in_phobos_armor"]);
  });

  it("appends suffixes when name and subname are both the same", () => {
    const result = buildUniqueFilenames([
      { name: "Librarian", subname: "In Terminator Armor" },
      { name: "Librarian", subname: "In Terminator Armor" },
    ]);
    expect(result).toEqual(["librarian_in_terminator_armor_1", "librarian_in_terminator_armor_2"]);
  });

  it("falls back to card-{index} when name is missing", () => {
    const result = buildUniqueFilenames([{}, null, { name: "Captain" }]);
    expect(result).toEqual(["card-0", "card-1", "captain"]);
  });

  it("uses extra field when subname is not present", () => {
    const result = buildUniqueFilenames([
      { name: "Smite", extra: "Psychic" },
      { name: "Smite", extra: "Deny" },
    ]);
    expect(result).toEqual(["smite_psychic", "smite_deny"]);
  });

  it("prefers subname over extra when both are present", () => {
    const result = buildUniqueFilenames([{ name: "Unit", subname: "Alpha", extra: "Beta" }]);
    expect(result).toEqual(["unit_alpha"]);
  });

  it("replaces spaces with underscores and & with 'and'", () => {
    const result = buildUniqueFilenames([{ name: "Fire & Fury Squad" }]);
    expect(result).toEqual(["fire_and_fury_squad"]);
  });

  it("converts names to lowercase", () => {
    const result = buildUniqueFilenames([{ name: "CAPTAIN" }]);
    expect(result).toEqual(["captain"]);
  });

  it("handles an empty array", () => {
    const result = buildUniqueFilenames([]);
    expect(result).toEqual([]);
  });

  it("handles mix of unique and duplicate names", () => {
    const result = buildUniqueFilenames([
      { name: "Captain" },
      { name: "Librarian" },
      { name: "Captain" },
      { name: "Chaplain" },
    ]);
    expect(result).toEqual(["captain_1", "librarian", "captain_2", "chaplain"]);
  });
});
