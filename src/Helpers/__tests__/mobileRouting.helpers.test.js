import { describe, it, expect } from "vitest";
import { getMobileCardPath } from "../mobileRouting.helpers";

describe("getMobileCardPath", () => {
  it("returns the bare path for unit cards (no type segment)", () => {
    expect(getMobileCardPath("space-marines", "intercessors", "unit")).toBe("/mobile/space-marines/intercessors");
  });

  it("inserts a stratagem type segment", () => {
    expect(getMobileCardPath("space-marines", "rapid-fire", "stratagem")).toBe(
      "/mobile/space-marines/stratagem/rapid-fire",
    );
  });

  it("inserts an enhancement type segment", () => {
    expect(getMobileCardPath("space-marines", "artificer-armour", "enhancement")).toBe(
      "/mobile/space-marines/enhancement/artificer-armour",
    );
  });

  it("inserts a rule type segment", () => {
    expect(getMobileCardPath("space-marines", "oath-of-moment", "rule")).toBe(
      "/mobile/space-marines/rule/oath-of-moment",
    );
  });

  it("maps spell cards to the spell-lore segment", () => {
    expect(getMobileCardPath("nighthaunt", "soul-cage", "spell")).toBe("/mobile/nighthaunt/spell-lore/soul-cage");
  });

  it("maps manifestation cards to the manifestation-lore segment", () => {
    expect(getMobileCardPath("nighthaunt", "chronomantic-cogs", "manifestation")).toBe(
      "/mobile/nighthaunt/manifestation-lore/chronomantic-cogs",
    );
  });

  it("falls back to the bare path for unknown or missing types", () => {
    expect(getMobileCardPath("space-marines", "mystery-card", "warscroll")).toBe("/mobile/space-marines/mystery-card");
    expect(getMobileCardPath("space-marines", "mystery-card", undefined)).toBe("/mobile/space-marines/mystery-card");
  });
});
