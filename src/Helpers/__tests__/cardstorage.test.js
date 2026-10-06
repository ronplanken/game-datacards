import { parseStorageJson } from "../cardstorage.helpers";

// Mock uuid to return predictable values
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

describe("cardstorage.helpers", () => {
  describe("parseStorageJson", () => {
    describe("null/undefined input handling", () => {
      it("should return defaultCategories when savedJson is null", () => {
        const result = parseStorageJson(null);
        expect(result).toHaveProperty("categories");
        expect(result.categories).toHaveLength(1);
        expect(result.categories[0].name).toBe("My Cards");
        expect(result.categories[0].cards).toEqual([]);
      });

      it("should return defaultCategories when savedJson is undefined", () => {
        const result = parseStorageJson(undefined);
        expect(result).toHaveProperty("categories");
        expect(result.categories).toHaveLength(1);
      });

      it("should return defaultCategories when savedJson is empty string", () => {
        const result = parseStorageJson("");
        expect(result).toHaveProperty("categories");
      });
    });

    describe("invalid JSON handling", () => {
      it("should return defaultCategories when JSON is malformed", () => {
        const result = parseStorageJson("not valid json {");
        expect(result).toHaveProperty("categories");
        expect(result.categories[0].name).toBe("My Cards");
      });

      it("should return defaultCategories when version is missing", () => {
        const result = parseStorageJson(JSON.stringify({ categories: [] }));
        expect(result).toHaveProperty("categories");
        expect(result.categories[0].name).toBe("My Cards");
      });
    });

    describe("version >= 1.5.0 (no upgrade needed)", () => {
      it("should return parsed JSON with sync fields added for version 1.5.0", () => {
        const input = {
          version: "1.5.0",
          categories: [
            {
              uuid: "existing-uuid",
              name: "Test Category",
              cards: [{ id: "card-1", name: "Test Card", source: "40k-10e" }],
            },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        // parseStorageJson adds sync fields to categories
        expect(result.version).toBe("1.5.0");
        expect(result.categories[0].uuid).toBe("existing-uuid");
        expect(result.categories[0].name).toBe("Test Category");
        expect(result.categories[0].cards).toEqual(input.categories[0].cards);
        // Verify sync fields are added
        expect(result.categories[0]).toHaveProperty("syncEnabled", false);
        expect(result.categories[0]).toHaveProperty("syncStatus", "local");
      });

      it("should return parsed JSON with sync fields added for version 2.0.0", () => {
        const input = {
          version: "2.0.0",
          categories: [{ uuid: "uuid-1", name: "Category", cards: [] }],
        };
        const result = parseStorageJson(JSON.stringify(input));
        // parseStorageJson adds sync fields to categories
        expect(result.version).toBe("2.0.0");
        expect(result.categories[0].uuid).toBe("uuid-1");
        expect(result.categories[0].name).toBe("Category");
        // Verify sync fields are added
        expect(result.categories[0]).toHaveProperty("syncEnabled", false);
      });
    });

    describe("version < 1.2.0 handling", () => {
      it("should return defaultCategories for array without version (JSON loses array properties)", () => {
        // Note: When JSON.stringify is used on an array with added properties,
        // those properties are lost. This tests the current guard behavior.
        const oldFormatArray = [
          { id: "card-1", name: "Card 1" },
          { id: "card-2", name: "Card 2" },
        ];
        // This property is lost when JSON.stringify is called
        oldFormatArray.version = "1.0.0";

        const result = parseStorageJson(JSON.stringify(oldFormatArray));
        // Returns defaultCategories because version is lost in JSON serialization
        expect(result).toHaveProperty("categories");
        expect(result.categories).toHaveLength(1);
        expect(result.categories[0].name).toBe("My Cards");
        expect(result.categories[0].cards).toEqual([]);
      });

      it("should preserve existing categories if present in old version", () => {
        const input = {
          version: "1.1.0",
          categories: [{ uuid: "cat-1", name: "Existing", cards: [] }],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].name).toBe("Existing");
      });
    });

    describe("version = 1.2.0 (add source field)", () => {
      it("should add source 40k to all cards", () => {
        const input = {
          version: "1.2.0",
          categories: [
            {
              uuid: "cat-1",
              name: "Test",
              cards: [
                { id: "card-1", name: "Card 1" },
                { id: "card-2", name: "Card 2" },
              ],
            },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].cards[0].source).toBe("40k");
        expect(result.categories[0].cards[1].source).toBe("40k");
      });

      it("should preserve existing card properties", () => {
        const input = {
          version: "1.2.0",
          categories: [
            {
              uuid: "cat-1",
              name: "Test",
              cards: [{ id: "card-1", name: "Card 1", customProp: "value" }],
            },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].cards[0].customProp).toBe("value");
      });
    });

    describe("version <= 1.4.2 (icon variant extraction)", () => {
      it("should extract no-icons from variant to icons field", () => {
        const input = {
          version: "1.4.0",
          categories: [
            {
              uuid: "cat-1",
              name: "Test",
              cards: [{ id: "card-1", variant: "dark-no-icons" }],
            },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].cards[0].icons).toBe("no-icons");
        expect(result.categories[0].cards[0].variant).toBe("dark");
      });

      it("should set icons to icons when no-icons not present", () => {
        const input = {
          version: "1.4.2",
          categories: [
            {
              uuid: "cat-1",
              name: "Test",
              cards: [{ id: "card-1", variant: "light" }],
            },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].cards[0].icons).toBe("icons");
        expect(result.categories[0].cards[0].variant).toBe("light");
      });

      it("should handle variant with multiple no-icons occurrences", () => {
        const input = {
          version: "1.4.1",
          categories: [
            {
              uuid: "cat-1",
              name: "Test",
              cards: [{ id: "card-1", variant: "theme-no-icons-no-icons" }],
            },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].cards[0].icons).toBe("no-icons");
        // Should remove all occurrences of -no-icons
        expect(result.categories[0].cards[0].variant).toBe("theme");
      });

      it("should handle cards without variant property", () => {
        const input = {
          version: "1.4.0",
          categories: [
            {
              uuid: "cat-1",
              name: "Test",
              cards: [{ id: "card-1", name: "Card without variant" }],
            },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].cards[0].icons).toBe("icons");
      });
    });

    describe("multiple categories handling", () => {
      it("should upgrade all cards across multiple categories", () => {
        const input = {
          version: "1.2.0",
          categories: [
            { uuid: "cat-1", name: "Category 1", cards: [{ id: "c1" }] },
            { uuid: "cat-2", name: "Category 2", cards: [{ id: "c2" }, { id: "c3" }] },
          ],
        };
        const result = parseStorageJson(JSON.stringify(input));
        expect(result.categories[0].cards[0].source).toBe("40k");
        expect(result.categories[1].cards[0].source).toBe("40k");
        expect(result.categories[1].cards[1].source).toBe("40k");
      });
    });
  });
});
