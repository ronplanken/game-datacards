import { describe, expect, it } from "vitest";
import { getKeywordGroups, joinKeywords, splitKeywords, withModelKeywords } from "../unitKeywords.helpers";

const loc = (en) => ({ en, de: `${en}-de` });

describe("getKeywordGroups", () => {
  it("returns null for data without model keywords", () => {
    expect(getKeywordGroups([loc("Infantry")], undefined)).toBeNull();
    expect(getKeywordGroups([loc("Infantry")], [])).toBeNull();
  });

  it("splits shared keywords from the ones only some models have", () => {
    const groups = getKeywordGroups(
      [loc("Infantry"), loc("Imperium"), loc("Character")],
      [{ name: loc("Ancient"), keywords: [loc("Character")] }],
    );
    expect(groups).toEqual([
      { name: null, keywords: [loc("Infantry"), loc("Imperium")] },
      { name: loc("Ancient"), keywords: [loc("Character")] },
    ]);
  });

  it("leaves out the shared group when no keyword is shared", () => {
    const groups = getKeywordGroups(
      [loc("Infantry"), loc("Beasts")],
      [
        { name: loc("Headtaker"), keywords: [loc("Infantry")] },
        { name: loc("Hunting Wolf"), keywords: [loc("Beasts")] },
      ],
    );
    expect(groups.map((group) => group.name?.en ?? null)).toEqual(["Headtaker", "Hunting Wolf"]);
  });

  it("matches plain string keywords from edited cards", () => {
    const groups = getKeywordGroups(["Infantry", "Character"], [{ name: "Ancient", keywords: ["Character"] }]);
    expect(groups[0]).toEqual({ name: null, keywords: ["Infantry"] });
  });
});

describe("splitKeywords / joinKeywords", () => {
  const models = [{ name: loc("Ancient"), keywords: [loc("Character")] }];

  it("returns the keywords every model shares", () => {
    expect(splitKeywords([loc("Infantry"), loc("Character")], models)).toEqual([loc("Infantry")]);
    expect(splitKeywords([loc("Infantry")], undefined)).toEqual([loc("Infantry")]);
  });

  it("joins shared and model keywords without duplicates", () => {
    expect(joinKeywords([loc("Infantry"), loc("Character")], models)).toEqual([loc("Infantry"), loc("Character")]);
  });

  it("rewrites the full keyword list when the model keywords change", () => {
    const next = [{ name: loc("Ancient"), keywords: [loc("Standard")] }];
    expect(withModelKeywords([loc("Infantry"), loc("Character")], models, next)).toEqual({
      modelKeywords: next,
      keywords: [loc("Infantry"), loc("Standard")],
    });
  });

  it("accepts a key function for projected entries", () => {
    const keyOf = (item) => item.name;
    expect(
      splitKeywords([{ name: "Infantry" }, { name: "Character" }], [{ keywords: [{ name: "Character" }] }], keyOf),
    ).toEqual([{ name: "Infantry" }]);
  });
});
