import { describe, it, expect } from "vitest";
import { buildGwAppListText, groupUnitsForExport } from "../gwAppExport.helpers";
import { parseArmyList } from "../armyListParser.helpers";

const unit = (overrides = {}) => ({
  name: "Intercessor Squad",
  keywords: ["Infantry", "Battleline"],
  unitSize: { models: 5, cost: 80 },
  ...overrides,
});

describe("groupUnitsForExport", () => {
  it("sorts cards into the GW app sections", () => {
    const cards = [
      unit({ name: "Captain", keywords: ["Character"] }),
      unit({ name: "Intercessor Squad" }),
      unit({ name: "Impulsor", keywords: ["Dedicated Transport"] }),
      unit({ name: "Ballistus Dreadnought", keywords: ["Vehicle"] }),
      unit({ name: "Callidus Assassin", keywords: ["Vehicle"], faction_id: "AoI" }),
    ];

    const sections = groupUnitsForExport(cards, "SM");

    expect(sections.characters.map((c) => c.name)).toEqual(["Captain"]);
    expect(sections.battleline.map((c) => c.name)).toEqual(["Intercessor Squad"]);
    expect(sections.transports.map((c) => c.name)).toEqual(["Impulsor"]);
    expect(sections.other.map((c) => c.name)).toEqual(["Ballistus Dreadnought"]);
    expect(sections.allied.map((c) => c.name)).toEqual(["Callidus Assassin"]);
  });

  it("reads 11th edition language-keyed keywords", () => {
    const cards = [unit({ name: "Lieutenant", keywords: [{ en: "Character", de: "Charakter" }] })];

    expect(groupUnitsForExport(cards, "SM").characters.map((c) => c.name)).toEqual(["Lieutenant"]);
  });
});

describe("buildGwAppListText", () => {
  const category = {
    name: "Strike Force Argent",
    type: "list",
    factionId: "SM",
    factionName: "Space Marines",
    dataSource: "40k-11e",
    battleSize: "strikeForce",
    detachments: [
      { name: { en: "Gladius Task Force" }, detachmentPoints: 2, forceDisposition: { name: { en: "Take and Hold" } } },
    ],
  };

  it("writes the battle size and the detachment with its points", () => {
    const text = buildGwAppListText(category, [unit()]);

    expect(text).toContain("Strike Force Argent (80 points)");
    expect(text).toContain("Space Marines");
    expect(text).toContain("Gladius Task Force (2 Detachment Points)");
    expect(text).toContain("Force Dispositions: Take and Hold");
    expect(text).toContain("Strike Force (2000 Points)");
  });

  it("writes every detachment the army holds", () => {
    const text = buildGwAppListText(
      { ...category, detachments: [{ name: "Gladius Task Force" }, { name: "Ironstorm Spearhead" }] },
      [unit()],
    );

    expect(text).toContain("Gladius Task Force (1 Detachment Points)");
    expect(text).toContain("Ironstorm Spearhead (1 Detachment Points)");
  });

  it("leaves out the battle size for a list that has none", () => {
    const text = buildGwAppListText({ ...category, dataSource: "40k-10e", battleSize: undefined }, [unit()]);

    expect(text).not.toContain("Strike Force (");
  });

  it("defaults an 11th edition list without a stored battle size to Strike Force", () => {
    const text = buildGwAppListText({ ...category, battleSize: undefined }, [unit()]);

    expect(text).toContain("Strike Force (2000 Points)");
  });

  it("lists paid wargear with its quantity", () => {
    const cards = [
      unit({
        name: "Redemptor Dreadnought",
        keywords: ["Vehicle"],
        unitSize: { models: 1, cost: 210 },
        selectedWargear: [{ name: { en: "Macro plasma incinerator" }, cost: 10, quantity: 2 }],
      }),
    ];

    const text = buildGwAppListText(category, cards);

    expect(text).toContain("Redemptor Dreadnought (230 pts)");
    expect(text).toContain("   • 2x Macro plasma incinerator");
  });

  it("counts enhancements, wargear and the roster surcharge in the unit cost", () => {
    const cards = [
      unit({
        name: "Captain",
        keywords: ["Character"],
        unitSize: { models: 1, cost: 80 },
        isWarlord: true,
        selectedEnhancement: { name: "artificer armour", cost: 15 },
        selectedWargear: [{ name: "Power fist", cost: 5, quantity: 1 }],
      }),
    ];

    const text = buildGwAppListText(category, cards);

    expect(text).toContain("Captain (100 pts)");
    expect(text).toContain("   • Warlord");
    expect(text).toContain("   • Enhancements: Artificer Armour (+15 pts)");
    expect(text).toContain("Strike Force Argent (100 points)");
  });

  it("marks a unit of several models with its model count", () => {
    expect(buildGwAppListText(category, [unit()])).toContain("Intercessor Squad 5x (80 pts)");
  });

  it("returns an empty string without a category", () => {
    expect(buildGwAppListText(null, [unit()])).toBe("");
  });

  it("reads back through the army list parser", () => {
    const cards = [
      unit({ name: "Captain", keywords: ["Character"], unitSize: { models: 1, cost: 80 }, isWarlord: true }),
      unit(),
      unit({ name: "Impulsor", keywords: ["Dedicated Transport"], unitSize: { models: 1, cost: 80 } }),
    ];

    const parsed = parseArmyList(buildGwAppListText(category, cards));

    expect(parsed.name).toBe("Strike Force Argent");
    expect(parsed.faction).toBe("Space Marines");
    expect(parsed.detachment).toBe("Gladius Task Force");
    expect(parsed.detachmentPoints).toBe(2);
    expect(parsed.disposition).toBe("Take and Hold");
    expect(parsed.battleSize).toBe("Strike Force");
    expect(parsed.points).toBe(240);
    expect(parsed.units.map((u) => u.category)).toEqual(["characters", "battleline", "transports"]);
  });
});
