import { reorder, reorderWithSubCategories, reorderSubCategories, reorderDatasourceItems } from "../treeview.helpers";

describe("treeview.helpers", () => {
  describe("reorder", () => {
    it("should reorder items in an array", () => {
      const list = ["a", "b", "c"];
      const result = reorder(list, 0, 2);
      expect(result).toEqual(["b", "c", "a"]);
    });
  });

  describe("reorderWithSubCategories", () => {
    const makeCategory = (uuid, name, overrides = {}) => ({
      uuid,
      name,
      type: "category",
      cards: [],
      syncEnabled: false,
      syncStatus: "local",
      ...overrides,
    });

    const makeDatasource = (uuid, name) => ({
      uuid,
      name,
      type: "local-datasource",
      cards: [],
    });

    it("should reorder two top-level categories", () => {
      const categories = [makeCategory("cat-1", "First"), makeCategory("cat-2", "Second")];

      const result = reorderWithSubCategories(categories, 0, 1);

      expect(result[0].uuid).toBe("cat-2");
      expect(result[1].uuid).toBe("cat-1");
    });

    it("should keep sub-categories with their parent after reorder", () => {
      const categories = [
        makeCategory("cat-1", "First"),
        makeCategory("sub-1", "Sub of First", { parentId: "cat-1" }),
        makeCategory("cat-2", "Second"),
      ];

      const result = reorderWithSubCategories(categories, 0, 1);

      // After reorder: cat-2 first, then cat-1 with its sub
      expect(result[0].uuid).toBe("cat-2");
      expect(result[1].uuid).toBe("cat-1");
      expect(result[2].uuid).toBe("sub-1");
      expect(result[2].parentId).toBe("cat-1");
    });

    it("should not affect datasources", () => {
      const categories = [
        makeDatasource("ds-1", "Datasource 1"),
        makeCategory("cat-1", "First"),
        makeCategory("cat-2", "Second"),
      ];

      const result = reorderWithSubCategories(categories, 0, 1);

      // Datasource stays first
      expect(result[0].uuid).toBe("ds-1");
      expect(result[0].type).toBe("local-datasource");
      // Categories reordered
      expect(result[1].uuid).toBe("cat-2");
      expect(result[2].uuid).toBe("cat-1");
    });

    it("should be a no-op when there is only one category", () => {
      const categories = [makeCategory("cat-1", "Only")];

      const result = reorderWithSubCategories(categories, 0, 0);

      expect(result).toEqual(categories);
    });

    it("should preserve all fields on categories", () => {
      const categories = [
        makeCategory("cat-1", "First", {
          syncEnabled: true,
          syncStatus: "synced",
          cards: [{ uuid: "card-1", name: "Card" }],
          closed: true,
        }),
        makeCategory("cat-2", "Second"),
      ];

      const result = reorderWithSubCategories(categories, 0, 1);

      const movedCat = result.find((c) => c.uuid === "cat-1");
      expect(movedCat.syncEnabled).toBe(true);
      expect(movedCat.syncStatus).toBe("synced");
      expect(movedCat.cards).toHaveLength(1);
      expect(movedCat.cards[0].name).toBe("Card");
      expect(movedCat.closed).toBe(true);
    });
  });

  describe("reorderSubCategories", () => {
    const makeCategory = (uuid, name, overrides = {}) => ({
      uuid,
      name,
      type: "category",
      cards: [],
      ...overrides,
    });

    it("should reorder sub-categories within a parent", () => {
      const categories = [
        makeCategory("parent", "Parent"),
        makeCategory("sub-1", "Sub A", { parentId: "parent" }),
        makeCategory("sub-2", "Sub B", { parentId: "parent" }),
        makeCategory("sub-3", "Sub C", { parentId: "parent" }),
      ];

      const result = reorderSubCategories(categories, "parent", 0, 2);

      // Parent unchanged
      expect(result[0].uuid).toBe("parent");
      // Sub-categories reordered: B, C, A
      expect(result[1].uuid).toBe("sub-2");
      expect(result[2].uuid).toBe("sub-3");
      expect(result[3].uuid).toBe("sub-1");
    });

    it("should not affect other categories or datasources", () => {
      const categories = [
        { uuid: "ds-1", name: "DS", type: "local-datasource", cards: [] },
        makeCategory("parent", "Parent"),
        makeCategory("sub-1", "Sub A", { parentId: "parent" }),
        makeCategory("sub-2", "Sub B", { parentId: "parent" }),
        makeCategory("other", "Other Cat"),
      ];

      const result = reorderSubCategories(categories, "parent", 0, 1);

      expect(result[0].uuid).toBe("ds-1");
      expect(result[1].uuid).toBe("parent");
      expect(result[2].uuid).toBe("sub-2");
      expect(result[3].uuid).toBe("sub-1");
      expect(result[4].uuid).toBe("other");
    });

    it("should be a no-op for a single sub-category", () => {
      const categories = [makeCategory("parent", "Parent"), makeCategory("sub-1", "Only Sub", { parentId: "parent" })];

      const result = reorderSubCategories(categories, "parent", 0, 0);

      expect(result[0].uuid).toBe("parent");
      expect(result[1].uuid).toBe("sub-1");
    });

    it("should preserve all fields on reordered sub-categories", () => {
      const categories = [
        makeCategory("parent", "Parent"),
        makeCategory("sub-1", "Sub A", { parentId: "parent", cards: [{ uuid: "c1" }], closed: true }),
        makeCategory("sub-2", "Sub B", { parentId: "parent" }),
      ];

      const result = reorderSubCategories(categories, "parent", 0, 1);

      const movedSub = result.find((c) => c.uuid === "sub-1");
      expect(movedSub.parentId).toBe("parent");
      expect(movedSub.cards).toHaveLength(1);
      expect(movedSub.closed).toBe(true);
    });
  });

  describe("reorderDatasourceItems", () => {
    it("should reorder datasources without affecting categories", () => {
      const categories = [
        { uuid: "ds-1", name: "DS 1", type: "local-datasource", cards: [] },
        { uuid: "ds-2", name: "DS 2", type: "local-datasource", cards: [] },
        { uuid: "cat-1", name: "Cat 1", type: "category", cards: [] },
      ];

      const result = reorderDatasourceItems(categories, 0, 1);

      // Datasources reordered
      expect(result[0].uuid).toBe("ds-2");
      expect(result[1].uuid).toBe("ds-1");
      // Category unchanged
      expect(result[2].uuid).toBe("cat-1");
      expect(result[2].type).toBe("category");
    });

    it("should be a no-op for a single datasource", () => {
      const categories = [
        { uuid: "ds-1", name: "DS 1", type: "local-datasource", cards: [] },
        { uuid: "cat-1", name: "Cat 1", type: "category", cards: [] },
      ];

      const result = reorderDatasourceItems(categories, 0, 0);

      expect(result[0].uuid).toBe("ds-1");
      expect(result[1].uuid).toBe("cat-1");
    });
  });
});
