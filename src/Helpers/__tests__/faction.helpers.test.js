import { describe, it, expect } from "vitest";
import { getBrowsableEnhancements, getDetachmentName, getDetachmentFaction } from "../faction.helpers";

describe("getDetachmentName", () => {
  it("handles the string, object and language-keyed formats", () => {
    expect(getDetachmentName("Gladius Task Force")).toBe("Gladius Task Force");
    expect(getDetachmentName({ name: "Gladius Task Force" })).toBe("Gladius Task Force");
    expect(getDetachmentName({ name: { en: "Gladius Task Force", de: "Gladius-Einsatztruppe" } })).toBe(
      "Gladius Task Force",
    );
    expect(getDetachmentName(undefined)).toBe("");
  });
});

describe("getDetachmentFaction", () => {
  it("returns the faction only for the object format", () => {
    expect(getDetachmentFaction({ name: "Gladius", faction: "Ultramarines" })).toBe("Ultramarines");
    expect(getDetachmentFaction("Gladius")).toBeNull();
    expect(getDetachmentFaction({ name: "Gladius" })).toBeNull();
  });
});

describe("getBrowsableEnhancements", () => {
  it("returns a 40K faction's flat array unchanged", () => {
    const enhancements = [{ name: "Artificer Armour" }];
    expect(getBrowsableEnhancements({ enhancements })).toBe(enhancements);
  });

  it("flattens an AoS faction's groups in order, tagging each with its group label", () => {
    const faction = {
      enhancements: {
        artefacts: [{ name: "Pennant of Azyrite Majesty" }],
        heroicTraits: [{ name: "Staunch Defender" }],
        other: [{ name: "Uncaged Lightning" }],
      },
    };

    expect(getBrowsableEnhancements(faction)).toEqual([
      { name: "Pennant of Azyrite Majesty", enhancementGroup: "Artefacts of Power" },
      { name: "Staunch Defender", enhancementGroup: "Heroic Traits" },
      { name: "Uncaged Lightning", enhancementGroup: "Other Enhancements" },
    ]);
  });

  it("humanises an unrecognised group key rather than dropping the group", () => {
    const faction = { enhancements: { battleTraits: [{ name: "Grudgebound" }] } };
    expect(getBrowsableEnhancements(faction)).toEqual([{ name: "Grudgebound", enhancementGroup: "Battle Traits" }]);
  });

  it("returns none for empty groups, a missing faction, or a non-collection value", () => {
    expect(getBrowsableEnhancements({ enhancements: { artefacts: [], heroicTraits: [], other: [] } })).toEqual([]);
    expect(getBrowsableEnhancements(undefined)).toEqual([]);
    expect(getBrowsableEnhancements({})).toEqual([]);
    expect(getBrowsableEnhancements({ enhancements: null })).toEqual([]);
    expect(getBrowsableEnhancements({ enhancements: "none" })).toEqual([]);
  });
});
