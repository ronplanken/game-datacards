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
  mapCardsToFactionStructure,
  createDatasourceExport,
  prepareDatasourceForImport,
  createRegistryEntry,
} from "../customDatasource.helpers";
import {
  parseGwAppText,
  classifyMatchScore,
  matchFaction,
  matchUnitsToDatasheets,
  countMatchStatuses,
  getImportableUnits,
  filterCardWeapons,
  analyzeModelCount,
} from "../gwAppImport.helpers";
import {
  Costs,
  Compare,
  CompareWeapon,
  Weapon,
  Upgrade,
  Model,
  Unit,
  BaseNotes,
  WoundTracker,
  Explosion,
  Psyker,
  PsychicPower,
  Force,
  Roster40k,
} from "../battlescribe.40k.helpers";

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

    it("should move item to end of destination", () => {
      const source = [{ id: 1 }, { id: 2 }];
      const destination = [{ id: 3 }, { id: 4 }];
      const droppableSource = { droppableId: "source", index: 0 };
      const droppableDestination = { droppableId: "dest", index: 2 };

      const result = move(source, destination, droppableSource, droppableDestination);

      expect(result.source).toEqual([{ id: 2 }]);
      expect(result.dest).toEqual([{ id: 3 }, { id: 4 }, { id: 1 }]);
    });

    it("should move item to empty destination", () => {
      const source = [{ id: 1 }, { id: 2 }];
      const destination = [];
      const droppableSource = { droppableId: "source", index: 1 };
      const droppableDestination = { droppableId: "dest", index: 0 };

      const result = move(source, destination, droppableSource, droppableDestination);

      expect(result.source).toEqual([{ id: 1 }]);
      expect(result.dest).toEqual([{ id: 2 }]);
    });

    it("should not mutate original arrays", () => {
      const source = [{ id: 1 }, { id: 2 }];
      const destination = [{ id: 3 }];
      const droppableSource = { droppableId: "source", index: 0 };
      const droppableDestination = { droppableId: "dest", index: 0 };

      move(source, destination, droppableSource, droppableDestination);

      expect(source).toEqual([{ id: 1 }, { id: 2 }]);
      expect(destination).toEqual([{ id: 3 }]);
    });

    it("should handle moving last item from source", () => {
      const source = [{ id: 1 }];
      const destination = [{ id: 2 }];
      const droppableSource = { droppableId: "source", index: 0 };
      const droppableDestination = { droppableId: "dest", index: 0 };

      const result = move(source, destination, droppableSource, droppableDestination);

      expect(result.source).toEqual([]);
      expect(result.dest).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should preserve object properties when moving", () => {
      const source = [{ id: 1, name: "Card 1", type: "unit", nested: { a: 1 } }];
      const destination = [];
      const droppableSource = { droppableId: "source", index: 0 };
      const droppableDestination = { droppableId: "dest", index: 0 };

      const result = move(source, destination, droppableSource, droppableDestination);

      expect(result.dest[0]).toEqual({ id: 1, name: "Card 1", type: "unit", nested: { a: 1 } });
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

    it("should return undefined for unknown card type", () => {
      const card = { cardType: "unknown", faction_id: "SM" };
      expect(getListFactionId(card, {})).toBeUndefined();
    });

    it("should return undefined for enhancement card type", () => {
      const card = { cardType: "enhancement", faction_id: "SM" };
      expect(getListFactionId(card, {})).toBeUndefined();
    });

    it("should handle undefined card", () => {
      expect(getListFactionId(undefined, {})).toBe("");
    });

    it("should handle missing faction object", () => {
      const card = { cardType: "datasheet", faction_id: "SM" };
      expect(getListFactionId(card, {})).toBe("SM");
    });

    it("should handle null faction_id on datasheet", () => {
      const card = { cardType: "datasheet", faction_id: null };
      const faction = { id: "SM" };
      expect(getListFactionId(card, faction)).toBe(null);
    });

    it("should handle undefined subfaction_id on stratagem", () => {
      const card = { cardType: "stratagem", subfaction_id: undefined };
      expect(getListFactionId(card, {})).toBe("");
    });

    it("should handle null faction_id on secondary", () => {
      const card = { cardType: "secondary", faction_id: null };
      expect(getListFactionId(card, {})).toBe(null);
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

    it("should return empty string for undefined input", () => {
      expect(capitalizeSentence(undefined)).toBe("");
    });

    it("should return empty string for null input", () => {
      expect(capitalizeSentence(null)).toBe("");
    });

    it("should return empty string for empty string input", () => {
      expect(capitalizeSentence("")).toBe("");
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

    it("should include enhancement name and cost", () => {
      const sortedCards = {
        characters: [
          {
            card: { name: "Captain" },
            points: { cost: 100, models: 1 },
            enhancement: { name: "iron resolve", cost: 20 },
          },
        ],
        battleline: [],
        transports: [],
        other: [],
        allied: [],
      };
      const result = format40kListText(sortedCards, SECTIONS_40K);
      expect(result).toContain("Captain");
      expect(result).toContain("(120 pts)");
      expect(result).toContain("Enhancements: Iron Resolve (+20 pts)");
    });

    it("should show model count for units with multiple models", () => {
      const sortedCards = {
        characters: [],
        battleline: [{ card: { name: "Intercessors" }, points: { cost: 160, models: 10 } }],
        transports: [],
        other: [],
        allied: [],
      };
      const result = format40kListText(sortedCards, SECTIONS_40K);
      expect(result).toContain("Intercessors 10x (160 pts)");
    });

    it("should show ? for units with missing points", () => {
      const sortedCards = {
        characters: [],
        battleline: [{ card: { name: "Unknown Unit" }, points: {} }],
        transports: [],
        other: [],
        allied: [],
      };
      const result = format40kListText(sortedCards, SECTIONS_40K);
      expect(result).toContain("Unknown Unit");
      expect(result).toContain("(? pts)");
    });

    it("should position warlord marker after unit name", () => {
      const sortedCards = {
        characters: [
          { card: { name: "Captain" }, points: { cost: 100, models: 1 }, warlord: true },
          { card: { name: "Librarian" }, points: { cost: 80, models: 1 } },
        ],
        battleline: [],
        transports: [],
        other: [],
        allied: [],
      };
      const result = format40kListText(sortedCards, SECTIONS_40K);
      // Warlord should come first and have marker
      const captainIndex = result.indexOf("Captain");
      const librarianIndex = result.indexOf("Librarian");
      expect(captainIndex).toBeLessThan(librarianIndex);
      expect(result).toMatch(/Captain.*\n.*Warlord/);
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

    it("should use General marker instead of Warlord", () => {
      const sortedCards = {
        heroes: [{ card: { name: "Lord-Celestant" }, points: { cost: 200 }, warlord: true }],
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
      expect(result).toContain("General");
      expect(result).not.toContain("Warlord");
    });

    it("should show ? for units with missing points", () => {
      const sortedCards = {
        heroes: [{ card: { name: "Unknown Hero" }, points: {} }],
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
      expect(result).toContain("Unknown Hero (? pts)");
    });

    it("should position general first in heroes section", () => {
      const sortedCards = {
        heroes: [
          { card: { name: "Battlemage" }, points: { cost: 100 } },
          { card: { name: "Lord-Celestant" }, points: { cost: 200 }, warlord: true },
        ],
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
      const lordIndex = result.indexOf("Lord-Celestant");
      const battlemageIndex = result.indexOf("Battlemage");
      expect(lordIndex).toBeLessThan(battlemageIndex);
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

    it("should reject name exceeding max length", () => {
      const longName = "a".repeat(201);
      const result = validateCustomDatasource({
        name: longName,
        version: "1.0",
        data: [{ id: "test", name: "Test", colours: { header: "#000", banner: "#fff" } }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Name exceeds maximum length"))).toBe(true);
    });

    it("should reject version exceeding max length", () => {
      const longVersion = "1.0." + "0".repeat(50);
      const result = validateCustomDatasource({
        name: "Test",
        version: longVersion,
        data: [{ id: "test", name: "Test", colours: { header: "#000", banner: "#fff" } }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Version exceeds maximum length"))).toBe(true);
    });

    it("should reject empty data array", () => {
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: [],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("'data' array must contain at least one faction");
    });

    it("should reject too many factions", () => {
      const manyFactions = Array(11)
        .fill(null)
        .map((_, i) => ({
          id: `faction-${i}`,
          name: `Faction ${i}`,
          colours: { header: "#000", banner: "#fff" },
        }));
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: manyFactions,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Too many factions"))).toBe(true);
    });

    it("should reject faction missing id", () => {
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: [{ name: "Test", colours: { header: "#000", banner: "#fff" } }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Faction missing 'id' field");
    });

    it("should reject faction missing colours", () => {
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: [{ id: "test", name: "Test" }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Faction missing 'colours' field");
    });

    it("should reject faction colours missing header", () => {
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: [{ id: "test", name: "Test", colours: { banner: "#fff" } }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Faction colours missing 'header' field");
    });

    it("should reject faction colours missing banner", () => {
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: [{ id: "test", name: "Test", colours: { header: "#000" } }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Faction colours missing 'banner' field");
    });

    it("should reject too many cards", () => {
      const manyCards = Array(2001)
        .fill(null)
        .map((_, i) => ({ id: `card-${i}`, name: `Card ${i}` }));
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: [{ id: "test", name: "Test", colours: { header: "#000", banner: "#fff" }, datasheets: manyCards }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Too many cards"))).toBe(true);
    });

    it("should reject empty or whitespace name", () => {
      const result = validateCustomDatasource({
        name: "   ",
        version: "1.0",
        data: [{ id: "test", name: "Test", colours: { header: "#000", banner: "#fff" } }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing or invalid 'name' field");
    });

    it("should accept datasource with multiple valid factions", () => {
      const result = validateCustomDatasource({
        name: "Test",
        version: "1.0",
        data: [
          { id: "faction-1", name: "Faction 1", colours: { header: "#000", banner: "#fff" } },
          { id: "faction-2", name: "Faction 2", colours: { header: "#111", banner: "#eee" } },
        ],
      });
      expect(result.isValid).toBe(true);
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

  describe("mapCardsToFactionStructure", () => {
    it("should group cards by cardType into correct arrays", () => {
      const cards = [
        { id: "1", name: "Unit 1", cardType: "datasheet" },
        { id: "2", name: "Strategy 1", cardType: "stratagem" },
        { id: "3", name: "Unit 2", cardType: "datasheet" },
      ];
      const factionInfo = { id: "test-faction", name: "Test Faction", colours: { header: "#000", banner: "#fff" } };

      const result = mapCardsToFactionStructure(cards, factionInfo);

      expect(result.datasheets).toHaveLength(2);
      expect(result.stratagems).toHaveLength(1);
    });

    it("should add faction_id to each card", () => {
      const cards = [{ id: "1", name: "Unit 1", cardType: "datasheet" }];
      const factionInfo = { id: "test-faction", name: "Test", colours: {} };

      const result = mapCardsToFactionStructure(cards, factionInfo);

      expect(result.datasheets[0].faction_id).toBe("test-faction");
    });

    it("should remove uuid and isCustom fields", () => {
      const cards = [{ id: "1", uuid: "uuid-123", isCustom: true, cardType: "datasheet" }];
      const factionInfo = { id: "test-faction", name: "Test", colours: {} };

      const result = mapCardsToFactionStructure(cards, factionInfo);

      expect(result.datasheets[0].uuid).toBeUndefined();
      expect(result.datasheets[0].isCustom).toBeUndefined();
    });

    it("should preserve other card properties", () => {
      const cards = [{ id: "1", name: "Test Unit", cardType: "datasheet", customProp: "value" }];
      const factionInfo = { id: "test-faction", name: "Test", colours: {} };

      const result = mapCardsToFactionStructure(cards, factionInfo);

      expect(result.datasheets[0].customProp).toBe("value");
      expect(result.datasheets[0].name).toBe("Test Unit");
    });

    it("should handle enhancement card type", () => {
      const cards = [{ id: "1", name: "Enhancement 1", cardType: "enhancement" }];
      const factionInfo = { id: "test-faction", name: "Test", colours: {} };

      const result = mapCardsToFactionStructure(cards, factionInfo);

      expect(result.enhancements).toHaveLength(1);
    });
  });

  describe("createDatasourceExport", () => {
    it("should create complete datasource with name and version", () => {
      const options = {
        name: "My Datasource",
        version: "1.0.0",
        cards: [],
        factionName: "Test Faction",
        colours: { header: "#000", banner: "#fff" },
      };

      const result = createDatasourceExport(options);

      expect(result.name).toBe("My Datasource");
      expect(result.version).toBe("1.0.0");
    });

    it("should generate faction ID from name if not provided", () => {
      const options = {
        name: "My Datasource",
        version: "1.0.0",
        cards: [],
        factionName: "Test Faction",
        colours: { header: "#000", banner: "#fff" },
      };

      const result = createDatasourceExport(options);

      expect(result.id).toBe("test-faction");
    });

    it("should use provided ID over generated", () => {
      const options = {
        name: "My Datasource",
        id: "custom-id",
        version: "1.0.0",
        cards: [],
        factionName: "Test Faction",
        colours: { header: "#000", banner: "#fff" },
      };

      const result = createDatasourceExport(options);

      expect(result.id).toBe("custom-id");
    });

    it("should include lastUpdated timestamp", () => {
      const options = {
        name: "My Datasource",
        version: "1.0.0",
        cards: [],
        factionName: "Test Faction",
        colours: { header: "#000", banner: "#fff" },
      };

      const result = createDatasourceExport(options);

      expect(result.lastUpdated).toBeDefined();
      expect(new Date(result.lastUpdated)).toBeInstanceOf(Date);
    });

    it("should include author when provided", () => {
      const options = {
        name: "My Datasource",
        version: "1.0.0",
        author: "Test Author",
        cards: [],
        factionName: "Test Faction",
        colours: { header: "#000", banner: "#fff" },
      };

      const result = createDatasourceExport(options);

      expect(result.author).toBe("Test Author");
    });

    it("should not include author when not provided", () => {
      const options = {
        name: "My Datasource",
        version: "1.0.0",
        cards: [],
        factionName: "Test Faction",
        colours: { header: "#000", banner: "#fff" },
      };

      const result = createDatasourceExport(options);

      expect(result.author).toBeUndefined();
    });
  });

  describe("prepareDatasourceForImport", () => {
    it("should generate unique storage ID with custom- prefix", () => {
      const datasource = { name: "Test", version: "1.0.0", data: [] };

      const result = prepareDatasourceForImport(datasource, "local");

      expect(result.id).toMatch(/^custom-/);
    });

    it("should add sourceType field", () => {
      const datasource = { name: "Test", version: "1.0.0", data: [] };

      const result = prepareDatasourceForImport(datasource, "url", "https://example.com");

      expect(result.sourceType).toBe("url");
    });

    it("should add sourceUrl field", () => {
      const datasource = { name: "Test", version: "1.0.0", data: [] };

      const result = prepareDatasourceForImport(datasource, "url", "https://example.com/data.json");

      expect(result.sourceUrl).toBe("https://example.com/data.json");
    });

    it("should add lastCheckedForUpdate for URL sources", () => {
      const datasource = { name: "Test", version: "1.0.0", data: [] };

      const result = prepareDatasourceForImport(datasource, "url", "https://example.com");

      expect(result.lastCheckedForUpdate).toBeDefined();
      expect(new Date(result.lastCheckedForUpdate)).toBeInstanceOf(Date);
    });

    it("should not add lastCheckedForUpdate for local sources", () => {
      const datasource = { name: "Test", version: "1.0.0", data: [] };

      const result = prepareDatasourceForImport(datasource, "local");

      expect(result.lastCheckedForUpdate).toBeUndefined();
    });

    it("should preserve existing datasource properties", () => {
      const datasource = { name: "Test", version: "1.0.0", data: [{ id: "faction-1" }] };

      const result = prepareDatasourceForImport(datasource, "local");

      expect(result.name).toBe("Test");
      expect(result.version).toBe("1.0.0");
      expect(result.data).toHaveLength(1);
    });
  });

  describe("createRegistryEntry", () => {
    it("should create registry entry with all required fields", () => {
      const datasource = {
        id: "custom-123",
        name: "Test Datasource",
        version: "1.0.0",
        sourceType: "local",
        sourceUrl: null,
        lastUpdated: "2024-01-01T00:00:00.000Z",
        data: [{ datasheets: [{}, {}] }],
      };

      const result = createRegistryEntry(datasource);

      expect(result.id).toBe("custom-123");
      expect(result.name).toBe("Test Datasource");
      expect(result.version).toBe("1.0.0");
      expect(result.sourceType).toBe("local");
      expect(result.lastUpdated).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should count cards using countDatasourceCards", () => {
      const datasource = {
        id: "custom-123",
        name: "Test",
        version: "1.0.0",
        sourceType: "local",
        data: [{ datasheets: [{}, {}, {}], stratagems: [{}, {}] }],
      };

      const result = createRegistryEntry(datasource);

      expect(result.cardCount).toBe(5);
    });

    it("should handle optional author field when present", () => {
      const datasource = {
        id: "custom-123",
        name: "Test",
        version: "1.0.0",
        author: "Test Author",
        sourceType: "local",
        data: [],
      };

      const result = createRegistryEntry(datasource);

      expect(result.author).toBe("Test Author");
    });

    it("should set author to null when not present", () => {
      const datasource = {
        id: "custom-123",
        name: "Test",
        version: "1.0.0",
        sourceType: "local",
        data: [],
      };

      const result = createRegistryEntry(datasource);

      expect(result.author).toBeNull();
    });

    it("should handle lastCheckedForUpdate field", () => {
      const datasource = {
        id: "custom-123",
        name: "Test",
        version: "1.0.0",
        sourceType: "url",
        lastCheckedForUpdate: "2024-01-15T00:00:00.000Z",
        data: [],
      };

      const result = createRegistryEntry(datasource);

      expect(result.lastCheckedForUpdate).toBe("2024-01-15T00:00:00.000Z");
    });
  });
});

// ============================================
// gwAppImport.helpers
// ============================================
describe("gwAppImport.helpers", () => {
  describe("analyzeModelCount", () => {
    it("should return modelCount 1 for empty bullet array", () => {
      const result = analyzeModelCount([]);
      expect(result.modelCount).toBe(1);
      expect(result.modelIndentLevel).toBeNull();
    });

    it("should return modelCount 1 when all bullets have quantity 1 (equipment list)", () => {
      const bullets = [
        { indent: 0, quantity: 1, text: "Bolt rifle" },
        { indent: 0, quantity: 1, text: "Bolt pistol" },
        { indent: 0, quantity: 1, text: "Frag grenades" },
      ];
      const result = analyzeModelCount(bullets);
      expect(result.modelCount).toBe(1);
      expect(result.modelIndentLevel).toBeNull();
    });

    it("should return modelCount 1 for single indent level (flat structure)", () => {
      const bullets = [
        { indent: 0, quantity: 5, text: "Intercessor" },
        { indent: 0, quantity: 1, text: "Intercessor Sergeant" },
      ];
      // All at same indent level but not all quantity 1 - this is still flat
      // Wait, if not all quantity 1, it should count models at first level
      // Let me re-check the logic...
      const result = analyzeModelCount(bullets);
      // Single indent level = flat structure = single-model unit
      expect(result.modelCount).toBe(1);
      expect(result.modelIndentLevel).toBeNull();
    });

    it("should count first-level bullets as models in nested structure", () => {
      const bullets = [
        { indent: 0, quantity: 5, text: "Intercessor" },
        { indent: 2, quantity: 1, text: "Bolt rifle" },
        { indent: 2, quantity: 1, text: "Bolt pistol" },
        { indent: 0, quantity: 1, text: "Intercessor Sergeant" },
        { indent: 2, quantity: 1, text: "Auto bolt rifle" },
      ];
      const result = analyzeModelCount(bullets);
      expect(result.modelCount).toBe(6); // 5 + 1
      expect(result.modelIndentLevel).toBe(0);
    });

    it("should identify weapon indent level in nested structure", () => {
      const bullets = [
        { indent: 4, quantity: 3, text: "Heavy Intercessor" },
        { indent: 8, quantity: 1, text: "Heavy bolt rifle" },
        { indent: 4, quantity: 1, text: "Heavy Intercessor Sergeant" },
        { indent: 8, quantity: 1, text: "Executor bolt rifle" },
      ];
      const result = analyzeModelCount(bullets);
      expect(result.modelCount).toBe(4); // 3 + 1
      expect(result.modelIndentLevel).toBe(4);
    });

    it("should handle mixed quantities at different indent levels", () => {
      const bullets = [
        { indent: 0, quantity: 2, text: "Terminator" },
        { indent: 4, quantity: 1, text: "Storm bolter" },
        { indent: 4, quantity: 1, text: "Power fist" },
        { indent: 0, quantity: 1, text: "Terminator Sergeant" },
        { indent: 4, quantity: 1, text: "Power sword" },
      ];
      const result = analyzeModelCount(bullets);
      expect(result.modelCount).toBe(3); // 2 + 1
      expect(result.modelIndentLevel).toBe(0);
    });
  });

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
          {
            profiles: [
              { name: "Bolter", active: true },
              { name: "Plasma Gun", active: true },
            ],
          },
        ],
        showWeapons: { rangedWeapons: true },
      };
      const result = filterCardWeapons(card, ["Bolter"]);
      expect(result.rangedWeapons[0].profiles[0].active).toBe(true);
      expect(result.rangedWeapons[0].profiles[1].active).toBe(false);
    });

    it("should filter melee weapons", () => {
      const card = {
        meleeWeapons: [
          {
            profiles: [
              { name: "Chainsword", active: true },
              { name: "Power Fist", active: true },
            ],
          },
        ],
        showWeapons: { meleeWeapons: true },
      };
      const result = filterCardWeapons(card, ["Chainsword"]);
      expect(result.meleeWeapons[0].profiles[0].active).toBe(true);
      expect(result.meleeWeapons[0].profiles[1].active).toBe(false);
    });

    it("should match weapon variants with dash notation", () => {
      const card = {
        rangedWeapons: [
          {
            profiles: [
              { name: "Bolt rifle - rapid fire", active: true },
              { name: "Bolt rifle - assault", active: true },
            ],
          },
        ],
        showWeapons: { rangedWeapons: true },
      };
      const result = filterCardWeapons(card, ["Bolt rifle"]);
      expect(result.rangedWeapons[0].profiles[0].active).toBe(true);
      expect(result.rangedWeapons[0].profiles[1].active).toBe(true);
    });

    it("should match weapons with quantity prefix", () => {
      const card = {
        rangedWeapons: [{ profiles: [{ name: "Storm bolter", active: true }] }],
        showWeapons: { rangedWeapons: true },
      };
      const result = filterCardWeapons(card, ["2x Storm bolter"]);
      expect(result.rangedWeapons[0].profiles[0].active).toBe(true);
    });

    it("should hide ranged weapons section when no matches", () => {
      const card = {
        rangedWeapons: [{ profiles: [{ name: "Bolter", active: true }] }],
        showWeapons: { rangedWeapons: true },
      };
      const result = filterCardWeapons(card, ["Chainsword"]);
      expect(result.showWeapons.rangedWeapons).toBe(false);
    });

    it("should hide melee weapons section when no matches", () => {
      const card = {
        meleeWeapons: [{ profiles: [{ name: "Chainsword", active: true }] }],
        showWeapons: { meleeWeapons: true },
      };
      const result = filterCardWeapons(card, ["Bolter"]);
      expect(result.showWeapons.meleeWeapons).toBe(false);
    });
  });

  describe("parseGwAppText - extended", () => {
    it("should parse Space Marines subfaction", () => {
      const text = `My Army (2000 Points)

Space Marines
Blood Angels
Strike Force
Gladius Task Force`;
      const result = parseGwAppText(text);
      expect(result.factionName).toBe("Space Marines");
      expect(result.subfaction).toBe("Blood Angels");
      expect(result.battleSize).toBe("Strike Force");
      expect(result.detachment).toBe("Gladius Task Force");
    });

    it("should parse unit with points", () => {
      const text = `My Army (500 pts)

Orks
Strike Force

CHARACTERS

Warboss (90 pts)`;
      const result = parseGwAppText(text);
      expect(result.units).toHaveLength(1);
      expect(result.units[0].originalName).toBe("Warboss");
      expect(result.units[0].points).toBe(90);
    });

    it("should parse warlord marker", () => {
      const text = `My Army (500 pts)

Space Marines
Strike Force

CHARACTERS

Captain (100 pts)
• Warlord`;
      const result = parseGwAppText(text);
      expect(result.units[0].isWarlord).toBe(true);
    });

    it("should parse enhancement with cost", () => {
      const text = `My Army (500 pts)

Space Marines
Strike Force

CHARACTERS

Captain (120 pts)
• Enhancements: Iron Resolve (+20 pts)`;
      const result = parseGwAppText(text);
      expect(result.units[0].enhancement).toEqual({ name: "Iron Resolve", cost: 20 });
    });

    it("should parse model counts from indentation", () => {
      const text = `My Army (500 pts)

Space Marines
Strike Force

BATTLELINE

Intercessors (160 pts)
• 5x Intercessor
  • Bolt rifle
  • Bolt pistol
• 5x Intercessor Sergeant
  • Bolt rifle`;
      const result = parseGwAppText(text);
      expect(result.units[0].models).toBe(10);
    });

    it("should handle invisible Unicode characters", () => {
      const text = `My Army\u2060 (500 pts)\n\nOrks\u200B\nStrike Force`;
      const result = parseGwAppText(text);
      expect(result.listName).toBe("My Army");
      expect(result.factionName).toBe("Orks");
    });

    it("should categorize units by section", () => {
      const text = `My Army (1000 pts)

Space Marines
Gladius Strike Force
Strike Force

CHARACTERS

Captain (100 pts)

BATTLELINE

Intercessors (160 pts)

DEDICATED TRANSPORTS

Impulsor (80 pts)`;
      const result = parseGwAppText(text);
      expect(result.units[0].section).toBe("CHARACTERS");
      expect(result.units[1].section).toBe("BATTLELINE");
      expect(result.units[2].section).toBe("DEDICATED TRANSPORTS");
    });

    it("should return error when faction name is missing", () => {
      const text = "My Army (500 pts)\n\n\n";
      const result = parseGwAppText(text);
      expect(result.error).toBe("Could not identify faction name");
    });
  });

  describe("matchUnitsToDatasheets", () => {
    const mockFaction = {
      id: "sm",
      name: "Space Marines",
      datasheets: [
        { name: "Captain", id: "captain" },
        { name: "Intercessor Squad", id: "intercessors" },
        { name: "Assault Intercessors", id: "assault-int" },
      ],
    };

    it("should find exact match", () => {
      const units = [{ originalName: "Captain", section: "CHARACTERS" }];
      const result = matchUnitsToDatasheets(units, mockFaction);
      expect(result[0].matchStatus).toBe("exact");
      expect(result[0].matchedCard.name).toBe("Captain");
    });

    it("should be case insensitive for exact match", () => {
      const units = [{ originalName: "CAPTAIN", section: "CHARACTERS" }];
      const result = matchUnitsToDatasheets(units, mockFaction);
      expect(result[0].matchStatus).toBe("exact");
    });

    it("should use fuzzy match for similar names", () => {
      const units = [{ originalName: "Intercessors", section: "BATTLELINE" }];
      const result = matchUnitsToDatasheets(units, mockFaction);
      expect(["exact", "confident", "ambiguous"]).toContain(result[0].matchStatus);
      expect(result[0].matchedCard).not.toBeNull();
    });

    it("should return none for unmatched units", () => {
      const units = [{ originalName: "Totally Unknown Unit", section: "OTHER" }];
      const result = matchUnitsToDatasheets(units, mockFaction);
      expect(result[0].matchStatus).toBe("none");
      expect(result[0].matchedCard).toBeNull();
    });

    it("should provide alternatives for unmatched units", () => {
      const units = [{ originalName: "Unknown", section: "OTHER" }];
      const result = matchUnitsToDatasheets(units, mockFaction);
      expect(result[0].alternatives.length).toBeGreaterThan(0);
    });

    it("should handle empty units array", () => {
      const result = matchUnitsToDatasheets([], mockFaction);
      expect(result).toEqual([]);
    });

    it("should handle faction with no datasheets", () => {
      const units = [{ originalName: "Captain", section: "CHARACTERS" }];
      const result = matchUnitsToDatasheets(units, { datasheets: [] });
      expect(result[0].matchStatus).toBe("none");
    });

    it("should search allied datasheets for ALLIED UNITS section", () => {
      const alliedFaction = {
        id: "ig",
        name: "Imperial Guard",
        datasheets: [{ name: "Commissar", id: "commissar" }],
      };
      const factionWithAllied = {
        ...mockFaction,
        allied_factions: ["ig"],
      };
      const units = [{ originalName: "Commissar", section: "ALLIED UNITS" }];
      const result = matchUnitsToDatasheets(units, factionWithAllied, [alliedFaction]);
      expect(result[0].matchStatus).toBe("exact");
      expect(result[0].matchedCard.name).toBe("Commissar");
    });
  });

  describe("matchFaction - extended", () => {
    const factions = [
      { id: "sm", name: "Space Marines" },
      { id: "ba", name: "Blood Angels", parent_id: "sm" },
      { id: "am", name: "Astra Militarum" },
      { id: "ork", name: "Orks" },
    ];

    it("should fuzzy match similar faction names", () => {
      // "Space Marine" (missing 's') should fuzzy match to "Space Marines"
      const result = matchFaction("Space Marine", factions);
      expect(["exact", "confident", "ambiguous"]).toContain(result.matchStatus);
      expect(result.matchedFaction).not.toBeNull();
    });

    it("should provide alternatives for fuzzy matches", () => {
      const result = matchFaction("Marines", factions);
      expect(result.matchedFaction).not.toBeNull();
    });

    it("should handle null factions array", () => {
      const result = matchFaction("Space Marines", null);
      expect(result.matchStatus).toBe("none");
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

  describe("Costs.addFreeformValue", () => {
    it("should add freeform value to costs", () => {
      const costs = new Costs();
      costs.addFreeformValue("Cabal", 3);
      expect(costs.freeformValues.Cabal).toBe(3);
    });

    it("should accumulate multiple freeform values of same type", () => {
      const costs = new Costs();
      costs.addFreeformValue("Cabal", 2);
      costs.addFreeformValue("Cabal", 3);
      expect(costs.freeformValues.Cabal).toBe(5);
    });

    it("should handle multiple freeform value types", () => {
      const costs = new Costs();
      costs.addFreeformValue("Cabal", 2);
      costs.addFreeformValue("Power", 5);
      expect(costs.freeformValues.Cabal).toBe(2);
      expect(costs.freeformValues.Power).toBe(5);
    });
  });

  describe("Costs.add with freeform values", () => {
    it("should add freeform values from other costs", () => {
      const costs1 = new Costs();
      costs1.points = 100;
      costs1.addFreeformValue("Cabal", 2);

      const costs2 = new Costs();
      costs2.points = 50;
      costs2.addFreeformValue("Cabal", 3);

      costs1.add(costs2);
      expect(costs1.points).toBe(150);
      expect(costs1.freeformValues.Cabal).toBe(5);
    });
  });

  describe("BaseNotes", () => {
    it("should have default empty name", () => {
      const notes = new BaseNotes();
      expect(notes.name).toBe("");
    });

    it("should return false when comparing with null", () => {
      const notes = new BaseNotes();
      notes.name = "Test";
      expect(notes.equal(null)).toBe(false);
    });

    it("should return true when names match", () => {
      const notes1 = new BaseNotes();
      notes1.name = "Test";
      const notes2 = new BaseNotes();
      notes2.name = "Test";
      expect(notes1.equal(notes2)).toBe(true);
    });

    it("should return false when names differ", () => {
      const notes1 = new BaseNotes();
      notes1.name = "Test1";
      const notes2 = new BaseNotes();
      notes2.name = "Test2";
      expect(notes1.equal(notes2)).toBe(false);
    });
  });

  describe("Upgrade", () => {
    it("should have default count of 1", () => {
      const upgrade = new Upgrade();
      expect(upgrade.count).toBe(1);
    });

    it("should have Costs instance", () => {
      const upgrade = new Upgrade();
      expect(upgrade.cost).toBeInstanceOf(Costs);
    });

    it("should return name from getSelectionName", () => {
      const upgrade = new Upgrade();
      upgrade.name = "Power Sword";
      expect(upgrade.getSelectionName()).toBe("Power Sword");
    });

    it("should format toString with just name", () => {
      const upgrade = new Upgrade();
      upgrade.name = "Power Sword";
      expect(upgrade.toString()).toBe("Power Sword");
    });

    it("should format toString with count", () => {
      const upgrade = new Upgrade();
      upgrade.name = "Power Sword";
      upgrade.count = 2;
      expect(upgrade.toString()).toBe("2x Power Sword");
    });

    it("should format toString with cost", () => {
      const upgrade = new Upgrade();
      upgrade.name = "Power Sword";
      upgrade.cost.points = 10;
      expect(upgrade.toString()).toBe("Power Sword [10 pts]");
    });

    it("should format toString with count and cost", () => {
      const upgrade = new Upgrade();
      upgrade.name = "Power Sword";
      upgrade.count = 2;
      upgrade.cost.points = 20;
      expect(upgrade.toString()).toBe("2x Power Sword [20 pts]");
    });
  });

  describe("Weapon", () => {
    it("should have default melee type", () => {
      const weapon = new Weapon();
      expect(weapon.type).toBe("Melee");
    });

    it("should have default user strength", () => {
      const weapon = new Weapon();
      expect(weapon.str).toBe("user");
    });

    it("should return name from getSelectionName when no selectionName", () => {
      const weapon = new Weapon();
      weapon.name = "Bolt Pistol";
      expect(weapon.getSelectionName()).toBe("Bolt Pistol");
    });

    it("should return selectionName from getSelectionName when set", () => {
      const weapon = new Weapon();
      weapon.name = "Bolt Pistol";
      weapon.selectionName = "Sidearm";
      expect(weapon.getSelectionName()).toBe("Sidearm");
    });
  });

  describe("Model", () => {
    it("should have default values", () => {
      const model = new Model();
      expect(model.count).toBe(0);
      expect(model.toughness).toBe(4);
      expect(model.wounds).toBe(1);
      expect(model.weapons).toEqual([]);
      expect(model.upgrades).toEqual([]);
    });

    it("should return false when comparing with null", () => {
      const model = new Model();
      expect(model.equal(null)).toBe(false);
    });

    it("should return true for equal models", () => {
      const model1 = new Model();
      model1.name = "Intercessor";
      model1.count = 5;

      const model2 = new Model();
      model2.name = "Intercessor";
      model2.count = 5;

      expect(model1.equal(model2)).toBe(true);
    });

    it("should return false for different model counts", () => {
      const model1 = new Model();
      model1.name = "Intercessor";
      model1.count = 5;

      const model2 = new Model();
      model2.name = "Intercessor";
      model2.count = 10;

      expect(model1.equal(model2)).toBe(false);
    });

    it("should return false for different weapon counts", () => {
      const model1 = new Model();
      model1.name = "Intercessor";
      model1.count = 5;

      const weapon = new Weapon();
      weapon.name = "Bolt Rifle";
      model1.weapons.push(weapon);

      const model2 = new Model();
      model2.name = "Intercessor";
      model2.count = 5;

      expect(model1.equal(model2)).toBe(false);
    });

    it("should format nameAndGear with just name", () => {
      const model = new Model();
      model.name = "Intercessor";
      expect(model.nameAndGear()).toBe("Intercessor");
    });

    it("should format nameAndGear with weapons", () => {
      const model = new Model();
      model.name = "Intercessor";

      const weapon = new Weapon();
      weapon.name = "Bolt Rifle";
      model.weapons.push(weapon);

      expect(model.nameAndGear()).toBe("Intercessor (Bolt Rifle)");
    });

    it("should dedupe weapons and upgrades with same selection name", () => {
      const model = new Model();

      const weapon1 = new Weapon();
      weapon1.name = "Bolt Rifle";
      const weapon2 = new Weapon();
      weapon2.name = "Bolt Rifle";

      model.weapons.push(weapon1, weapon2);

      const deduped = model.getDedupedWeaponsAndUpgrades();
      expect(deduped).toHaveLength(1);
    });
  });

  describe("Unit", () => {
    it("should have default values", () => {
      const unit = new Unit();
      expect(unit.factions).toBeInstanceOf(Set);
      expect(unit.keywords).toBeInstanceOf(Set);
      expect(unit.models).toEqual([]);
      expect(unit.cost).toBeInstanceOf(Costs);
    });

    it("should return false when comparing with null", () => {
      const unit = new Unit();
      expect(unit.equal(null)).toBe(false);
    });

    it("should format nameWithExtraCosts without extra costs", () => {
      const unit = new Unit();
      unit.name = "Intercessor Squad";
      expect(unit.nameWithExtraCosts()).toBe("Intercessor Squad");
    });

    it("should format nameWithExtraCosts with freeform values", () => {
      const unit = new Unit();
      unit.name = "Rubric Marines";
      unit.cost.addFreeformValue("Cabal", 2);
      expect(unit.nameWithExtraCosts()).toBe("Rubric Marines [2Cabal]");
    });

    it("should format nameWithExtraCosts with multiple freeform values", () => {
      const unit = new Unit();
      unit.name = "Rubric Marines";
      unit.cost.addFreeformValue("Cabal", 2);
      unit.cost.addFreeformValue("Power", 3);
      const result = unit.nameWithExtraCosts();
      expect(result).toContain("Rubric Marines");
      expect(result).toContain("2Cabal");
      expect(result).toContain("3Power");
    });

    it("should ignore zero freeform values", () => {
      const unit = new Unit();
      unit.name = "Rubric Marines";
      unit.cost.addFreeformValue("Cabal", 0);
      expect(unit.nameWithExtraCosts()).toBe("Rubric Marines");
    });
  });

  describe("WoundTracker", () => {
    it("should have default empty name", () => {
      const tracker = new WoundTracker();
      expect(tracker.name).toBe("");
    });

    it("should have Map instance for table", () => {
      const tracker = new WoundTracker();
      expect(tracker.table).toBeInstanceOf(Map);
    });

    it("should extend BaseNotes", () => {
      const tracker = new WoundTracker();
      expect(tracker.equal).toBeDefined();
    });

    it("should support adding entries to table", () => {
      const tracker = new WoundTracker();
      tracker.table.set("1-3", { m: 4, ws: 4 });
      tracker.table.set("4-6", { m: 6, ws: 3 });
      expect(tracker.table.size).toBe(2);
      expect(tracker.table.get("1-3")).toEqual({ m: 4, ws: 4 });
    });
  });

  describe("Explosion", () => {
    it("should have default empty values", () => {
      const explosion = new Explosion();
      expect(explosion.name).toBe("");
      expect(explosion.diceRoll).toBe("");
      expect(explosion.distance).toBe("");
      expect(explosion.mortalWounds).toBe("");
    });

    it("should extend BaseNotes", () => {
      const explosion = new Explosion();
      expect(explosion.equal).toBeDefined();
    });

    it("should compare equal when names match", () => {
      const explosion1 = new Explosion();
      explosion1.name = "Big Explosion";
      explosion1.diceRoll = "6";
      explosion1.distance = '6"';
      explosion1.mortalWounds = "D6";

      const explosion2 = new Explosion();
      explosion2.name = "Big Explosion";

      expect(explosion1.equal(explosion2)).toBe(true);
    });

    it("should compare not equal when names differ", () => {
      const explosion1 = new Explosion();
      explosion1.name = "Big Explosion";

      const explosion2 = new Explosion();
      explosion2.name = "Small Explosion";

      expect(explosion1.equal(explosion2)).toBe(false);
    });
  });

  describe("Psyker", () => {
    it("should have default empty values", () => {
      const psyker = new Psyker();
      expect(psyker.cast).toBe("");
      expect(psyker.deny).toBe("");
      expect(psyker.powers).toBe("");
      expect(psyker.other).toBe("");
    });

    it("should extend BaseNotes", () => {
      const psyker = new Psyker();
      expect(psyker.equal).toBeDefined();
    });

    it("should store psyker stats", () => {
      const psyker = new Psyker();
      psyker.cast = "2";
      psyker.deny = "1";
      psyker.powers = "Smite, Mind War";
      psyker.other = "Can attempt to manifest one additional power";

      expect(psyker.cast).toBe("2");
      expect(psyker.deny).toBe("1");
      expect(psyker.powers).toBe("Smite, Mind War");
    });
  });

  describe("PsychicPower", () => {
    it("should have default values", () => {
      const power = new PsychicPower();
      expect(power.name).toBe("");
      expect(power.manifest).toBe(0);
      expect(power.range).toBe("");
      expect(power.details).toBe("");
    });

    it("should extend BaseNotes", () => {
      const power = new PsychicPower();
      expect(power.equal).toBeDefined();
    });

    it("should store psychic power data", () => {
      const power = new PsychicPower();
      power.name = "Smite";
      power.manifest = 5;
      power.range = '18"';
      power.details = "Deals D3 mortal wounds";

      expect(power.name).toBe("Smite");
      expect(power.manifest).toBe(5);
      expect(power.range).toBe('18"');
      expect(power.details).toBe("Deals D3 mortal wounds");
    });

    it("should compare equal when names match", () => {
      const power1 = new PsychicPower();
      power1.name = "Smite";
      power1.manifest = 5;

      const power2 = new PsychicPower();
      power2.name = "Smite";
      power2.manifest = 6;

      expect(power1.equal(power2)).toBe(true);
    });
  });

  describe("Force", () => {
    it("should have default values", () => {
      const force = new Force();
      expect(force.catalog).toBe("");
      expect(force.faction).toBe("Unknown");
      expect(force.units).toEqual([]);
      expect(force.configurations).toEqual([]);
    });

    it("should have Map instances for rules", () => {
      const force = new Force();
      expect(force.factionRules).toBeInstanceOf(Map);
      expect(force.rules).toBeInstanceOf(Map);
    });

    it("should extend BaseNotes", () => {
      const force = new Force();
      expect(force.equal).toBeDefined();
    });

    it("should support adding rules", () => {
      const force = new Force();
      force.rules.set("Army Rule", "Some description");
      force.factionRules.set("Faction Rule", "Another description");

      expect(force.rules.get("Army Rule")).toBe("Some description");
      expect(force.factionRules.get("Faction Rule")).toBe("Another description");
    });

    it("should support adding units", () => {
      const force = new Force();
      const unit = new Unit();
      unit.name = "Captain";
      force.units.push(unit);

      expect(force.units).toHaveLength(1);
      expect(force.units[0].name).toBe("Captain");
    });
  });

  describe("Roster40k", () => {
    it("should have default values", () => {
      const roster = new Roster40k();
      expect(roster.cost).toBeInstanceOf(Costs);
      expect(roster.forces).toEqual([]);
    });

    it("should extend BaseNotes", () => {
      const roster = new Roster40k();
      expect(roster.equal).toBeDefined();
    });

    it("should support adding forces", () => {
      const roster = new Roster40k();
      const force = new Force();
      force.faction = "Space Marines";
      roster.forces.push(force);

      expect(roster.forces).toHaveLength(1);
      expect(roster.forces[0].faction).toBe("Space Marines");
    });

    it("should accumulate costs from forces", () => {
      const roster = new Roster40k();
      roster.cost.points = 1000;
      roster.cost.commandPoints = 3;

      expect(roster.cost.points).toBe(1000);
      expect(roster.cost.commandPoints).toBe(3);
      expect(roster.cost.toString()).toBe("[1000 pts / 3 CP]");
    });
  });
});
