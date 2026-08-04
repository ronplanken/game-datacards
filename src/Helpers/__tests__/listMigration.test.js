import { describe, it, expect, vi } from "vitest";
import { migrateListsToCategories } from "../listMigration.helpers";

vi.mock("uuid", () => ({
  v4: vi.fn(() => "mocked-uuid"),
}));

describe("migrateListsToCategories", () => {
  describe("null/undefined input handling", () => {
    it("should return empty array for null", () => {
      expect(migrateListsToCategories(null)).toEqual([]);
    });

    it("should return empty array for undefined", () => {
      expect(migrateListsToCategories(undefined)).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      expect(migrateListsToCategories("")).toEqual([]);
    });

    it("should return empty array for a number", () => {
      expect(migrateListsToCategories(42)).toEqual([]);
    });
  });

  describe("object format (per-datasource)", () => {
    it("should convert a single datasource with one list (flat card format)", () => {
      const input = {
        "40k-10e": [{ name: "My Army", datacards: [{ card: { name: "Marine" }, points: { cost: 100 }, id: "c1" }] }],
      };

      const result = migrateListsToCategories(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        uuid: "mocked-uuid",
        name: "My Army",
        type: "list",
        dataSource: "40k-10e",
      });
      expect(result[0].cards).toHaveLength(1);
      expect(result[0].cards[0].name).toBe("Marine");
      expect(result[0].cards[0].unitSize).toEqual({ cost: 100 });
      expect(result[0].cards[0].uuid).toBe("c1");
      expect(result[0].cards[0].isCustom).toBe(true);
    });

    it("should convert multiple datasources", () => {
      const input = {
        "40k-10e": [{ name: "40k List", datacards: [] }],
        aos: [{ name: "AoS List", datacards: [] }],
      };

      const result = migrateListsToCategories(input);
      expect(result).toHaveLength(2);
      expect(result[0].dataSource).toBe("40k-10e");
      expect(result[1].dataSource).toBe("aos");
    });

    it("should convert multiple lists within one datasource", () => {
      const input = {
        "40k-10e": [
          { name: "List A", datacards: [] },
          { name: "List B", datacards: [] },
        ],
      };

      const result = migrateListsToCategories(input);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("List A");
      expect(result[1].name).toBe("List B");
    });

    it("should use 'Imported List' as default name when name is missing", () => {
      const input = {
        "40k-10e": [{ datacards: [] }],
      };

      const result = migrateListsToCategories(input);
      expect(result[0].name).toBe("Imported List");
    });

    it("should handle missing datacards by defaulting to empty array", () => {
      const input = {
        "40k-10e": [{ name: "Empty List" }],
      };

      const result = migrateListsToCategories(input);
      expect(result[0].cards).toEqual([]);
    });

    it("should skip non-array datasource values", () => {
      const input = {
        "40k-10e": "not-an-array",
        aos: [{ name: "Valid", datacards: [] }],
      };

      const result = migrateListsToCategories(input);
      expect(result).toHaveLength(1);
      expect(result[0].dataSource).toBe("aos");
    });

    it("should skip null list entries", () => {
      const input = {
        "40k-10e": [null, { name: "Valid", datacards: [] }],
      };

      const result = migrateListsToCategories(input);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Valid");
    });

    it("should return empty array for empty object", () => {
      expect(migrateListsToCategories({})).toEqual([]);
    });
  });

  describe("legacy array format", () => {
    it("should treat array input as 40k-10e datasource", () => {
      const input = [{ name: "Legacy List", datacards: [] }];

      const result = migrateListsToCategories(input);
      expect(result).toHaveLength(1);
      expect(result[0].dataSource).toBe("40k-10e");
      expect(result[0].name).toBe("Legacy List");
    });

    it("should handle empty legacy array", () => {
      expect(migrateListsToCategories([])).toEqual([]);
    });
  });

  describe("output structure", () => {
    it("should produce categories with all required fields", () => {
      const input = {
        "40k-10e": [{ name: "Test", datacards: [{ id: "1" }] }],
      };

      const result = migrateListsToCategories(input);
      const cat = result[0];
      expect(cat).toHaveProperty("uuid");
      expect(cat).toHaveProperty("name");
      expect(cat).toHaveProperty("type", "list");
      expect(cat).toHaveProperty("dataSource");
      expect(cat).toHaveProperty("cards");
    });

    it("should flatten card data with correct property mapping", () => {
      const cardData = {
        card: { name: "Unit", keywords: ["Infantry"] },
        points: { cost: 150 },
        enhancement: { name: "Buff", cost: 10 },
        warlord: true,
        id: "card-id",
      };
      const input = { "40k-10e": [{ name: "List", datacards: [cardData] }] };

      const result = migrateListsToCategories(input);
      const card = result[0].cards[0];
      expect(card.name).toBe("Unit");
      expect(card.keywords).toEqual(["Infantry"]);
      expect(card.unitSize).toEqual({ cost: 150 });
      expect(card.selectedEnhancement).toEqual({ name: "Buff", cost: 10 });
      expect(card.isWarlord).toBe(true);
      expect(card.uuid).toBe("card-id");
      expect(card.isCustom).toBe(true);
    });
  });

  describe("card flattening edge cases", () => {
    it("should handle card with no card property (undefined spread)", () => {
      const input = {
        "40k-10e": [{ name: "List", datacards: [{ points: { cost: 100 }, id: "c1" }] }],
      };

      const result = migrateListsToCategories(input);
      const card = result[0].cards[0];
      expect(card.unitSize).toEqual({ cost: 100 });
      expect(card.uuid).toBe("c1");
      expect(card.isCustom).toBe(true);
      expect(card.name).toBeUndefined();
    });

    it("should generate uuid when card has no id", () => {
      const input = {
        "40k-10e": [{ name: "List", datacards: [{ card: { name: "Marine" }, points: { cost: 80 } }] }],
      };

      const result = migrateListsToCategories(input);
      const card = result[0].cards[0];
      expect(card.uuid).toBe("mocked-uuid");
      expect(card.name).toBe("Marine");
    });

    it("should handle card with no enhancement or warlord", () => {
      const input = {
        "40k-10e": [{ name: "List", datacards: [{ card: { name: "Trooper" }, points: { cost: 60 }, id: "t1" }] }],
      };

      const result = migrateListsToCategories(input);
      const card = result[0].cards[0];
      expect(card.selectedEnhancement).toBeUndefined();
      expect(card.isWarlord).toBeUndefined();
      expect(card.unitSize).toEqual({ cost: 60 });
      expect(card.isCustom).toBe(true);
    });

    it("should handle card with no points", () => {
      const input = {
        "40k-10e": [{ name: "List", datacards: [{ card: { name: "Freebie" }, id: "f1" }] }],
      };

      const result = migrateListsToCategories(input);
      const card = result[0].cards[0];
      expect(card.name).toBe("Freebie");
      expect(card.unitSize).toBeUndefined();
      expect(card.uuid).toBe("f1");
      expect(card.isCustom).toBe(true);
    });

    it("should not carry over old wrapped properties (card, points, enhancement, warlord, id)", () => {
      const input = {
        "40k-10e": [
          {
            name: "List",
            datacards: [
              {
                card: { name: "Captain", source: "40k" },
                points: { cost: 100 },
                enhancement: { name: "Shield", cost: 15 },
                warlord: true,
                id: "old-id",
              },
            ],
          },
        ],
      };

      const result = migrateListsToCategories(input);
      const card = result[0].cards[0];
      // Should have flat properties
      expect(card.name).toBe("Captain");
      expect(card.source).toBe("40k");
      expect(card.unitSize).toEqual({ cost: 100 });
      expect(card.selectedEnhancement).toEqual({ name: "Shield", cost: 15 });
      expect(card.isWarlord).toBe(true);
      expect(card.uuid).toBe("old-id");
      // Should NOT have the old wrapped card property
      expect(card).not.toHaveProperty("card");
    });
  });
});
