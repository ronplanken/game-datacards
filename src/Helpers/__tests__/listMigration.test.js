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
    it("should convert a single datasource with one list", () => {
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
      expect(result[0].cards[0].card.name).toBe("Marine");
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

    it("should preserve card data unchanged", () => {
      const cardData = { card: { name: "Unit" }, points: { cost: 150 }, enhancement: { name: "Buff", cost: 10 } };
      const input = { "40k-10e": [{ name: "List", datacards: [cardData] }] };

      const result = migrateListsToCategories(input);
      expect(result[0].cards[0]).toEqual(cardData);
    });
  });
});
