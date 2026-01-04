import { reorder } from "../generic.helpers";
import {
  getBackgroundColor,
  getMinHeight,
  reorder as treeviewReorder,
  move,
  getListFactionId,
} from "../treeview.helpers";
import { BaseCard } from "../gamedatacards.helpers";
import { capitalizeSentence, extractWarpChargeValue } from "../external.helpers";
import {
  categorize40kUnits,
  categorizeAoSUnits,
  sortCards,
  format40kListText,
  formatAoSListText,
  SECTIONS_40K,
  SECTIONS_AOS,
} from "../listCategories.helpers";
import {
  validateCustomDatasource,
  generateDatasourceFilename,
  generateIdFromName,
  getTargetArray,
  countDatasourceCards,
  compareVersions,
  countCardsByType,
  formatCardBreakdown,
} from "../customDatasource.helpers";
import {
  parseGwAppText,
  classifyMatchScore,
  matchFaction,
  countMatchStatuses,
  getImportableUnits,
  filterCardWeapons,
} from "../gwAppImport.helpers";
import { Costs, Compare, CompareWeapon, Weapon } from "../battlescribe.40k.helpers";

// ============================================
// generic.helpers
// ============================================
describe("generic.helpers", () => {
  describe("reorder", () => {
    it("should move item from start to end", () => {
      const list = ["a", "b", "c", "d"];
      const result = reorder(list, 0, 3);
      expect(result).toEqual(["b", "c", "d", "a"]);
    });

    it("should move item from end to start", () => {
      const list = ["a", "b", "c", "d"];
      const result = reorder(list, 3, 0);
      expect(result).toEqual(["d", "a", "b", "c"]);
    });

    it("should move item to adjacent position", () => {
      const list = ["a", "b", "c"];
      const result = reorder(list, 0, 1);
      expect(result).toEqual(["b", "a", "c"]);
    });

    it("should not mutate original array", () => {
      const list = ["a", "b", "c"];
      reorder(list, 0, 2);
      expect(list).toEqual(["a", "b", "c"]);
    });
  });
});

// ============================================
// treeview.helpers
// ============================================
describe("treeview.helpers", () => {
  describe("getBackgroundColor", () => {
    it("should return dragging over color when isDraggingOver is true", () => {
      expect(getBackgroundColor({ isDraggingOver: true })).toBe("#f8f8f8");
    });

    it("should return dragging from color when draggingFromThisWith is set", () => {
      expect(getBackgroundColor({ draggingFromThisWith: "some-id" })).toBe("#e6f6ff");
    });

    it("should return white by default", () => {
      expect(getBackgroundColor({})).toBe("white");
    });
  });

  describe("getMinHeight", () => {
    it("should return 36px when dragging over", () => {
      expect(getMinHeight({ isDraggingOver: true })).toBe("36px");
    });

    it("should return 0px by default", () => {
      expect(getMinHeight({})).toBe("0px");
    });
  });

  describe("reorder", () => {
    it("should reorder items in list", () => {
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = treeviewReorder(list, 0, 2);
      expect(result).toEqual([{ id: 2 }, { id: 3 }, { id: 1 }]);
    });

    it("should not mutate original array", () => {
      const list = [{ id: 1 }, { id: 2 }];
      treeviewReorder(list, 0, 1);
      expect(list).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe("move", () => {
    it("should move item between lists", () => {
      const source = [{ id: 1 }, { id: 2 }];
      const destination = [{ id: 3 }];
      const droppableSource = { droppableId: "source", index: 0 };
      const droppableDestination = { droppableId: "dest", index: 0 };

      const result = move(source, destination, droppableSource, droppableDestination);

      expect(result.source).toEqual([{ id: 2 }]);
      expect(result.dest).toEqual([{ id: 1 }, { id: 3 }]);
    });
  });

  describe("getListFactionId", () => {
    it("should return empty string for null card", () => {
      expect(getListFactionId(null, {})).toBe("");
    });

    it("should return empty string for datasheet with matching faction", () => {
      const card = { cardType: "datasheet", faction_id: "SM" };
      const faction = { id: "SM" };
      expect(getListFactionId(card, faction)).toBe("");
    });

    it("should return faction_id for datasheet with different faction", () => {
      const card = { cardType: "datasheet", faction_id: "ORK" };
      const faction = { id: "SM" };
      expect(getListFactionId(card, faction)).toBe("ORK");
    });

    it("should return subfaction_id for stratagem with subfaction", () => {
      const card = { cardType: "stratagem", subfaction_id: "BA" };
      expect(getListFactionId(card, {})).toBe("BA");
    });

    it("should return empty string for stratagem without subfaction", () => {
      const card = { cardType: "stratagem", subfaction_id: null };
      expect(getListFactionId(card, {})).toBe("");
    });

    it("should return basic for secondary with empty faction", () => {
      const card = { cardType: "secondary", faction_id: "" };
      expect(getListFactionId(card, {})).toBe("basic");
    });

    it("should return faction_id for secondary with faction", () => {
      const card = { cardType: "secondary", faction_id: "SM" };
      expect(getListFactionId(card, {})).toBe("SM");
    });
  });
});

// ============================================
// gamedatacards.helpers - functions
// ============================================
describe("gamedatacards.helpers - functions", () => {
  describe("BaseCard.equal", () => {
    it("should return false when comparing with null", () => {
      const card = new BaseCard();
      expect(card.equal(null)).toBe(false);
    });

    it("should return true when names match", () => {
      const card1 = new BaseCard();
      card1.name = "Test";
      const card2 = new BaseCard();
      card2.name = "Test";
      expect(card1.equal(card2)).toBe(true);
    });

    it("should return false when names differ", () => {
      const card1 = new BaseCard();
      card1.name = "Test1";
      const card2 = new BaseCard();
      card2.name = "Test2";
      expect(card1.equal(card2)).toBe(false);
    });
  });
});

// ============================================
// external.helpers
// ============================================
describe("external.helpers", () => {
  describe("capitalizeSentence", () => {
    it("should capitalize each word", () => {
      expect(capitalizeSentence("hello world")).toBe("Hello World");
    });

    it("should handle single word", () => {
      expect(capitalizeSentence("hello")).toBe("Hello");
    });

    it("should handle already capitalized text", () => {
      expect(capitalizeSentence("HELLO WORLD")).toBe("Hello World");
    });

    it("should handle mixed case", () => {
      expect(capitalizeSentence("hElLo WoRlD")).toBe("Hello World");
    });
  });

  describe("extractWarpChargeValue", () => {
    it("should extract warp charge value from text", () => {
      expect(extractWarpChargeValue("This power has a warp charge value of 7")).toBe(7);
    });

    it("should return null when no match", () => {
      expect(extractWarpChargeValue("This power has no warp charge")).toBeNull();
    });

    it("should handle different numbers", () => {
      expect(extractWarpChargeValue("has a warp charge value of 5")).toBe(5);
      expect(extractWarpChargeValue("has a warp charge value of 10")).toBe(10);
    });
  });
});

// ============================================
// listCategories.helpers
// ============================================
describe("listCategories.helpers", () => {
  describe("categorize40kUnits", () => {
    it("should categorize characters", () => {
      const datacards = [{ card: { keywords: ["Character", "Infantry"] } }];
      const result = categorize40kUnits(datacards);
      expect(result.characters).toHaveLength(1);
      expect(result.battleline).toHaveLength(0);
    });

    it("should categorize battleline", () => {
      const datacards = [{ card: { keywords: ["Battleline", "Infantry"] } }];
      const result = categorize40kUnits(datacards);
      expect(result.battleline).toHaveLength(1);
    });

    it("should categorize transports", () => {
      const datacards = [{ card: { keywords: ["Dedicated Transport", "Vehicle"] } }];
      const result = categorize40kUnits(datacards);
      expect(result.transports).toHaveLength(1);
    });

    it("should categorize allied units", () => {
      const datacards = [{ card: { keywords: ["Infantry"], _isAllied: true } }];
      const result = categorize40kUnits(datacards);
      expect(result.allied).toHaveLength(1);
    });

    it("should categorize other units", () => {
      const datacards = [{ card: { keywords: ["Infantry"] } }];
      const result = categorize40kUnits(datacards);
      expect(result.other).toHaveLength(1);
    });

    it("should handle null/undefined input", () => {
      expect(categorize40kUnits(null)).toBeUndefined();
      expect(categorize40kUnits(undefined)).toBeUndefined();
    });
  });

  describe("categorizeAoSUnits", () => {
    it("should categorize heroes", () => {
      const datacards = [{ card: { keywords: ["Hero", "Infantry"] } }];
      const result = categorizeAoSUnits(datacards);
      expect(result.heroes).toHaveLength(1);
    });

    it("should categorize monsters", () => {
      const datacards = [{ card: { keywords: ["Monster"] } }];
      const result = categorizeAoSUnits(datacards);
      expect(result.monsters).toHaveLength(1);
    });

    it("should categorize cavalry", () => {
      const datacards = [{ card: { keywords: ["Cavalry"] } }];
      const result = categorizeAoSUnits(datacards);
      expect(result.cavalry).toHaveLength(1);
    });
  });

  describe("sortCards", () => {
    it("should sort warlord first", () => {
      const cards = [
        { warlord: false, card: { name: "Unit A" } },
        { warlord: true, card: { name: "Unit B" } },
      ];
      const result = sortCards(cards);
      expect(result[0].warlord).toBe(true);
    });

    it("should sort alphabetically after warlord", () => {
      const cards = [
        { warlord: false, card: { name: "Zebra" } },
        { warlord: false, card: { name: "Alpha" } },
      ];
      const result = sortCards(cards);
      expect(result[0].card.name).toBe("Alpha");
      expect(result[1].card.name).toBe("Zebra");
    });
  });

  describe("format40kListText", () => {
    it("should format list with header", () => {
      const sortedCards = { characters: [], battleline: [], transports: [], other: [], allied: [] };
      const result = format40kListText(sortedCards, SECTIONS_40K);
      expect(result).toContain("Warhammer 40K List");
      expect(result).toContain("Created with https://game-datacards.eu");
    });

    it("should include unit details", () => {
      const sortedCards = {
        characters: [{ card: { name: "Captain" }, points: { cost: 100, models: 1 }, warlord: true }],
        battleline: [],
        transports: [],
        other: [],
        allied: [],
      };
      const result = format40kListText(sortedCards, SECTIONS_40K);
      expect(result).toContain("Captain");
      expect(result).toContain("100 pts");
      expect(result).toContain("Warlord");
    });
  });

  describe("formatAoSListText", () => {
    it("should format AoS list with header", () => {
      const sortedCards = {
        heroes: [],
        battleline: [],
        monsters: [],
        cavalry: [],
        infantry: [],
        warMachines: [],
        terrain: [],
        manifestations: [],
        other: [],
      };
      const result = formatAoSListText(sortedCards, SECTIONS_AOS);
      expect(result).toContain("Age of Sigmar List");
    });
  });
});

// ============================================
// customDatasource.helpers
// ============================================
describe("customDatasource.helpers", () => {
  describe("validateCustomDatasource", () => {
    it("should reject null data", () => {
      const result = validateCustomDatasource(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid data: datasource is empty or undefined");
    });

    it("should reject missing name", () => {
      const result = validateCustomDatasource({ version: "1.0", data: [{ id: "test", name: "Test", colours: {} }] });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing or invalid 'name' field");
    });

    it("should reject missing version", () => {
      const result = validateCustomDatasource({ name: "Test", data: [{ id: "test", name: "Test", colours: {} }] });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing or invalid 'version' field");
    });

    it("should reject missing data array", () => {
      const result = validateCustomDatasource({ name: "Test", version: "1.0" });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing or invalid 'data' array");
    });

    it("should validate valid datasource", () => {
      const validData = {
        name: "Test Datasource",
        version: "1.0.0",
        data: [
          {
            id: "test-faction",
            name: "Test Faction",
            colours: { header: "#000", banner: "#fff" },
          },
        ],
      };
      const result = validateCustomDatasource(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("generateDatasourceFilename", () => {
    it("should generate safe filename", () => {
      expect(generateDatasourceFilename("My Custom Datasource")).toBe("my-custom-datasource-datasource.json");
    });

    it("should handle special characters", () => {
      expect(generateDatasourceFilename("Test@#$%Faction")).toBe("testfaction-datasource.json");
    });

    it("should handle multiple spaces", () => {
      expect(generateDatasourceFilename("Test   Multiple   Spaces")).toBe("test-multiple-spaces-datasource.json");
    });
  });

  describe("generateIdFromName", () => {
    it("should generate slug from name", () => {
      expect(generateIdFromName("Space Marines")).toBe("space-marines");
    });

    it("should handle special characters", () => {
      expect(generateIdFromName("Test's Faction!")).toBe("tests-faction");
    });
  });

  describe("getTargetArray", () => {
    it("should return datasheets for DataCard type", () => {
      expect(getTargetArray("DataCard")).toBe("datasheets");
      expect(getTargetArray("datasheet")).toBe("datasheets");
    });

    it("should return stratagems for stratagem type", () => {
      expect(getTargetArray("stratagem")).toBe("stratagems");
    });

    it("should return default for unknown type", () => {
      expect(getTargetArray("unknown")).toBe("datasheets");
    });
  });

  describe("countDatasourceCards", () => {
    it("should count cards across factions", () => {
      const datasource = {
        data: [
          { datasheets: [{}, {}, {}], stratagems: [{}, {}] },
          { datasheets: [{}], enhancements: [{}, {}] },
        ],
      };
      const count = countDatasourceCards(datasource);
      expect(count).toBe(8);
    });

    it("should handle empty datasource", () => {
      const datasource = { data: [] };
      expect(countDatasourceCards(datasource)).toBe(0);
    });
  });

  describe("compareVersions", () => {
    it("should compare equal versions", () => {
      expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    });

    it("should compare major versions", () => {
      expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
      expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
    });

    it("should compare minor versions", () => {
      expect(compareVersions("1.2.0", "1.1.0")).toBe(1);
      expect(compareVersions("1.1.0", "1.2.0")).toBe(-1);
    });

    it("should compare patch versions", () => {
      expect(compareVersions("1.0.2", "1.0.1")).toBe(1);
      expect(compareVersions("1.0.1", "1.0.2")).toBe(-1);
    });

    it("should handle different version lengths", () => {
      expect(compareVersions("1.0", "1.0.0")).toBe(0);
      expect(compareVersions("1.0.1", "1.0")).toBe(1);
    });
  });

  describe("countCardsByType", () => {
    it("should count cards by type", () => {
      const cards = [
        { cardType: "datasheet" },
        { cardType: "datasheet" },
        { cardType: "stratagem" },
        { cardType: "enhancement" },
      ];
      const result = countCardsByType(cards);
      expect(result.counts.datasheet).toBe(2);
      expect(result.counts.stratagem).toBe(1);
      expect(result.counts.enhancement).toBe(1);
      expect(result.total).toBe(4);
    });

    it("should handle unknown card types", () => {
      const cards = [{ notCardType: "test" }];
      const result = countCardsByType(cards);
      expect(result.counts.unknown).toBe(1);
    });
  });

  describe("formatCardBreakdown", () => {
    it("should format single type", () => {
      expect(formatCardBreakdown({ datasheet: 5 })).toBe("5 datasheets");
    });

    it("should format multiple types", () => {
      const result = formatCardBreakdown({ datasheet: 2, stratagem: 3 });
      expect(result).toContain("2 datasheets");
      expect(result).toContain("3 stratagems");
    });

    it("should handle singular form", () => {
      expect(formatCardBreakdown({ datasheet: 1 })).toBe("1 datasheet");
    });
  });
});

// ============================================
// gwAppImport.helpers
// ============================================
describe("gwAppImport.helpers", () => {
  describe("parseGwAppText", () => {
    it("should return error for empty text", () => {
      const result = parseGwAppText("");
      expect(result.error).toBe("No text provided");
      expect(result.units).toEqual([]);
    });

    it("should return error for whitespace only", () => {
      const result = parseGwAppText("   ");
      expect(result.error).toBe("No text provided");
    });

    it("should parse list name and points", () => {
      const text = "My Army (2000 Points)\n\nSpace Marines\nGladiator Strike Force";
      const result = parseGwAppText(text);
      expect(result.listName).toBe("My Army");
      expect(result.totalPoints).toBe(2000);
    });

    it("should parse faction name", () => {
      const text = "My List (1000 pts)\n\nAstra Militarum\nStrike Force";
      const result = parseGwAppText(text);
      expect(result.factionName).toBe("Astra Militarum");
    });
  });

  describe("classifyMatchScore", () => {
    it("should return exact for score 0", () => {
      expect(classifyMatchScore(0)).toBe("exact");
    });

    it("should return confident for low scores", () => {
      expect(classifyMatchScore(0.1)).toBe("confident");
    });

    it("should return ambiguous for medium scores", () => {
      expect(classifyMatchScore(0.3)).toBe("ambiguous");
    });

    it("should return none for high scores", () => {
      expect(classifyMatchScore(0.5)).toBe("none");
    });
  });

  describe("matchFaction", () => {
    const factions = [
      { id: "sm", name: "Space Marines" },
      { id: "am", name: "Astra Militarum" },
      { id: "ork", name: "Orks" },
    ];

    it("should find exact match", () => {
      const result = matchFaction("Space Marines", factions);
      expect(result.matchStatus).toBe("exact");
      expect(result.matchedFaction.id).toBe("sm");
    });

    it("should be case insensitive", () => {
      const result = matchFaction("space marines", factions);
      expect(result.matchStatus).toBe("exact");
    });

    it("should return none for empty input", () => {
      const result = matchFaction("", factions);
      expect(result.matchStatus).toBe("none");
    });

    it("should return none for no factions", () => {
      const result = matchFaction("Space Marines", []);
      expect(result.matchStatus).toBe("none");
    });
  });

  describe("countMatchStatuses", () => {
    it("should count ready units", () => {
      const units = [{ matchStatus: "exact" }, { matchStatus: "confident" }];
      const result = countMatchStatuses(units);
      expect(result.ready).toBe(2);
    });

    it("should count units needing review", () => {
      const units = [{ matchStatus: "ambiguous" }];
      const result = countMatchStatuses(units);
      expect(result.needsReview).toBe(1);
    });

    it("should count not matched units", () => {
      const units = [{ matchStatus: "none" }];
      const result = countMatchStatuses(units);
      expect(result.notMatched).toBe(1);
    });

    it("should count skipped units", () => {
      const units = [{ matchStatus: "exact", skipped: true }];
      const result = countMatchStatuses(units);
      expect(result.skipped).toBe(1);
      expect(result.ready).toBe(0);
    });
  });

  describe("getImportableUnits", () => {
    it("should return matched non-skipped units", () => {
      const units = [
        { matchedCard: { name: "Unit 1" }, skipped: false },
        { matchedCard: { name: "Unit 2" }, skipped: true },
        { matchedCard: null, skipped: false },
      ];
      const result = getImportableUnits(units);
      expect(result).toHaveLength(1);
      expect(result[0].matchedCard.name).toBe("Unit 1");
    });
  });

  describe("filterCardWeapons", () => {
    it("should return card unchanged when no weapons imported", () => {
      const card = { name: "Test", rangedWeapons: [{ profiles: [{ name: "Bolter", active: true }] }] };
      const result = filterCardWeapons(card, []);
      expect(result).toEqual(card);
    });

    it("should filter ranged weapons", () => {
      const card = {
        rangedWeapons: [
          { profiles: [{ name: "Bolter", active: true }, { name: "Plasma Gun", active: true }] },
        ],
        showWeapons: { rangedWeapons: true },
      };
      const result = filterCardWeapons(card, ["Bolter"]);
      expect(result.rangedWeapons[0].profiles[0].active).toBe(true);
      expect(result.rangedWeapons[0].profiles[1].active).toBe(false);
    });
  });
});

// ============================================
// battlescribe.40k.helpers - functions
// ============================================
describe("battlescribe.40k.helpers - functions", () => {
  describe("Costs.hasValues", () => {
    it("should return false when no values", () => {
      const costs = new Costs();
      expect(costs.hasValues()).toBe(false);
    });

    it("should return true when points set", () => {
      const costs = new Costs();
      costs.points = 100;
      expect(costs.hasValues()).toBe(true);
    });

    it("should return true when command points set", () => {
      const costs = new Costs();
      costs.commandPoints = 1;
      expect(costs.hasValues()).toBe(true);
    });
  });

  describe("Costs.toString", () => {
    it("should format points", () => {
      const costs = new Costs();
      costs.points = 100;
      expect(costs.toString()).toBe("[100 pts]");
    });

    it("should format command points", () => {
      const costs = new Costs();
      costs.commandPoints = 2;
      expect(costs.toString()).toBe("[2 CP]");
    });

    it("should format both", () => {
      const costs = new Costs();
      costs.points = 100;
      costs.commandPoints = 1;
      expect(costs.toString()).toBe("[100 pts / 1 CP]");
    });
  });

  describe("Costs.add", () => {
    it("should add costs together", () => {
      const costs1 = new Costs();
      costs1.points = 50;
      costs1.commandPoints = 1;

      const costs2 = new Costs();
      costs2.points = 30;
      costs2.commandPoints = 2;

      costs1.add(costs2);
      expect(costs1.points).toBe(80);
      expect(costs1.commandPoints).toBe(3);
    });
  });

  describe("Compare", () => {
    it("should return 1 when a > b", () => {
      expect(Compare("b", "a")).toBe(1);
    });

    it("should return 0 when a == b", () => {
      expect(Compare("a", "a")).toBe(0);
    });

    it("should return -1 when a < b", () => {
      expect(Compare("a", "b")).toBe(-1);
    });
  });

  describe("CompareWeapon", () => {
    it("should sort ranged before melee", () => {
      const ranged = new Weapon();
      ranged.name = "Bolter";
      ranged.type = "Rapid Fire 1";

      const melee = new Weapon();
      melee.name = "Chainsword";
      melee.type = "Melee";

      expect(CompareWeapon(ranged, melee)).toBeLessThan(0);
    });

    it("should sort melee before grenades", () => {
      const melee = new Weapon();
      melee.name = "Chainsword";
      melee.type = "Melee";

      const grenade = new Weapon();
      grenade.name = "Frag Grenade";
      grenade.type = "Grenade D6";

      expect(CompareWeapon(melee, grenade)).toBeLessThan(0);
    });

    it("should sort alphabetically within type", () => {
      const weapon1 = new Weapon();
      weapon1.name = "Bolter";
      weapon1.type = "Rapid Fire 1";

      const weapon2 = new Weapon();
      weapon2.name = "Autocannon";
      weapon2.type = "Heavy 2";

      expect(CompareWeapon(weapon1, weapon2)).toBeGreaterThan(0);
    });
  });
});
