import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MobileListProvider, useMobileList } from "../useMobileList";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn(() => `uuid-${Math.random().toString(36).slice(2, 8)}`),
}));

// Mock useSettingsStorage
const mockSettings = { selectedDataSource: "40k-10e" };
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: mockSettings }),
}));

// Mock useCardStorage
const mockImportCategory = vi.fn();
const mockUpdateCategory = vi.fn();
const mockRemoveCategory = vi.fn();
const mockRenameCategory = vi.fn();
const mockMarkCategoryPending = vi.fn();
let mockCategories = [];

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    cardStorage: { categories: mockCategories },
    importCategory: mockImportCategory,
    updateCategory: mockUpdateCategory,
    removeCategory: mockRemoveCategory,
    renameCategory: mockRenameCategory,
    markCategoryPending: mockMarkCategoryPending,
  }),
}));

// Mock migrateListsToCategories
vi.mock("../../../Helpers/listMigration.helpers", () => ({
  migrateListsToCategories: vi.fn(() => []),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, val) => {
      store[key] = val;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useMobileList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockCategories = [];
    mockSettings.selectedDataSource = "40k-10e";
  });

  const wrapper = ({ children }) => <MobileListProvider>{children}</MobileListProvider>;

  describe("context requirement", () => {
    it("should throw if used outside MobileListProvider", () => {
      // Suppress console.error for expected error
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => renderHook(() => useMobileList())).toThrow(
        "`useMobileList` must be used with an `MobileListProvider`",
      );
      consoleSpy.mockRestore();
    });
  });

  describe("list derivation", () => {
    it("should return only list-type categories for current datasource", () => {
      mockCategories = [
        { uuid: "1", name: "My List", type: "list", dataSource: "40k-10e", cards: [] },
        { uuid: "2", name: "Regular Cat", type: "category", dataSource: "40k-10e", cards: [] },
        { uuid: "3", name: "AoS List", type: "list", dataSource: "aos", cards: [] },
      ];

      const { result } = renderHook(() => useMobileList(), { wrapper });
      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].name).toBe("My List");
    });

    it("should return empty array when no categories exist", () => {
      mockCategories = [];
      const { result } = renderHook(() => useMobileList(), { wrapper });
      expect(result.current.lists).toEqual([]);
    });
  });

  describe("addDatacard", () => {
    it("should call updateCategory with flat card appended and then markCategoryPending", () => {
      mockCategories = [{ uuid: "cat-1", name: "Test", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.addDatacard({ name: "Marine" }, { cost: 100 }, null, false);
      });

      expect(mockUpdateCategory).toHaveBeenCalledTimes(1);
      const [updatedCat, uuid] = mockUpdateCategory.mock.calls[0];
      expect(uuid).toBe("cat-1");
      expect(updatedCat.cards).toHaveLength(1);
      expect(updatedCat.cards[0].name).toBe("Marine");
      expect(updatedCat.cards[0].unitSize).toEqual({ cost: 100 });
      expect(updatedCat.cards[0].isWarlord).toBe(false);
      expect(updatedCat.cards[0].isCustom).toBe(true);
      expect(updatedCat.cards[0]).toHaveProperty("uuid");

      expect(mockMarkCategoryPending).toHaveBeenCalledWith("cat-1");
    });

    it("should not call updateCategory when no datacard is provided", () => {
      mockCategories = [{ uuid: "cat-1", name: "Test", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.addDatacard(null, { cost: 100 }, null, false);
      });

      expect(mockUpdateCategory).not.toHaveBeenCalled();
    });
  });

  describe("removeDatacard", () => {
    it("should call updateCategory with card removed and then markCategoryPending", () => {
      mockCategories = [
        {
          uuid: "cat-1",
          name: "Test",
          type: "list",
          dataSource: "40k-10e",
          cards: [
            { name: "A", unitSize: { cost: 100 }, uuid: "card-1", isCustom: true },
            { name: "B", unitSize: { cost: 200 }, uuid: "card-2", isCustom: true },
          ],
        },
      ];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.removeDatacard("card-1");
      });

      expect(mockUpdateCategory).toHaveBeenCalledTimes(1);
      const [updatedCat] = mockUpdateCategory.mock.calls[0];
      expect(updatedCat.cards).toHaveLength(1);
      expect(updatedCat.cards[0].uuid).toBe("card-2");

      expect(mockMarkCategoryPending).toHaveBeenCalledWith("cat-1");
    });

    it("should not call updateCategory when id is null", () => {
      mockCategories = [{ uuid: "cat-1", name: "Test", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.removeDatacard(null);
      });

      expect(mockUpdateCategory).not.toHaveBeenCalled();
    });
  });

  describe("createList", () => {
    it("should call importCategory with a new list category", () => {
      mockCategories = [{ uuid: "cat-1", name: "Default", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.createList("My New List");
      });

      expect(mockImportCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "My New List",
          type: "list",
          dataSource: "40k-10e",
          cards: [],
        }),
      );
    });

    it("should default name to 'New List' when name is empty", () => {
      mockCategories = [{ uuid: "cat-1", name: "Default", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.createList("");
      });

      expect(mockImportCategory).toHaveBeenCalledWith(expect.objectContaining({ name: "New List" }));
    });
  });

  describe("renameList", () => {
    it("should call renameCategory with the correct uuid and name", () => {
      mockCategories = [{ uuid: "cat-1", name: "Old Name", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.renameList(0, "New Name");
      });

      expect(mockRenameCategory).toHaveBeenCalledWith("cat-1", "New Name");
    });

    it("should not rename with empty name", () => {
      mockCategories = [{ uuid: "cat-1", name: "Old Name", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.renameList(0, "");
      });

      expect(mockRenameCategory).not.toHaveBeenCalled();
    });
  });

  describe("deleteList", () => {
    it("should call removeCategory with the correct uuid", () => {
      mockCategories = [
        { uuid: "cat-1", name: "List A", type: "list", dataSource: "40k-10e", cards: [] },
        { uuid: "cat-2", name: "List B", type: "list", dataSource: "40k-10e", cards: [] },
      ];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      let deleted;
      act(() => {
        deleted = result.current.deleteList(1);
      });

      expect(deleted).toBe(true);
      expect(mockRemoveCategory).toHaveBeenCalledWith("cat-2");
    });

    it("should not delete the last remaining list", () => {
      mockCategories = [{ uuid: "cat-1", name: "Only List", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      let deleted;
      act(() => {
        deleted = result.current.deleteList(0);
      });

      expect(deleted).toBe(false);
      expect(mockRemoveCategory).not.toHaveBeenCalled();
    });
  });

  describe("getListPoints", () => {
    it("should calculate total points including enhancements", () => {
      mockCategories = [
        {
          uuid: "cat-1",
          name: "Test",
          type: "list",
          dataSource: "40k-10e",
          cards: [
            { name: "A", unitSize: { cost: 100 }, selectedEnhancement: { cost: 15 }, uuid: "1", isCustom: true },
            { name: "B", unitSize: { cost: 200 }, uuid: "2", isCustom: true },
          ],
        },
      ];

      const { result } = renderHook(() => useMobileList(), { wrapper });
      expect(result.current.getListPoints(0)).toBe(315);
    });

    it("should return 0 for non-existent list index", () => {
      mockCategories = [];
      const { result } = renderHook(() => useMobileList(), { wrapper });
      expect(result.current.getListPoints(99)).toBe(0);
    });
  });

  describe("selectedList", () => {
    it("should default to 0", () => {
      mockCategories = [{ uuid: "cat-1", name: "Test", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });
      expect(result.current.selectedList).toBe(0);
    });

    it("should update selected list when setSelectedList is called", () => {
      mockCategories = [
        { uuid: "cat-1", name: "List A", type: "list", dataSource: "40k-10e", cards: [] },
        { uuid: "cat-2", name: "List B", type: "list", dataSource: "40k-10e", cards: [] },
      ];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.setSelectedList(1);
      });

      expect(result.current.selectedList).toBe(1);
    });

    it("should clear cloud category selection when selecting a list", () => {
      mockCategories = [{ uuid: "cat-1", name: "Test", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.selectCloudCategory("cloud-uuid");
      });
      expect(result.current.selectedCloudCategoryId).toBe("cloud-uuid");

      act(() => {
        result.current.setSelectedList(0);
      });
      expect(result.current.selectedCloudCategoryId).toBeNull();
    });
  });

  describe("cloud category selection", () => {
    it("should select and clear cloud categories", () => {
      mockCategories = [{ uuid: "cat-1", name: "Test", type: "list", dataSource: "40k-10e", cards: [] }];

      const { result } = renderHook(() => useMobileList(), { wrapper });

      act(() => {
        result.current.selectCloudCategory("cloud-1");
      });
      expect(result.current.selectedCloudCategoryId).toBe("cloud-1");

      act(() => {
        result.current.clearCloudCategory();
      });
      expect(result.current.selectedCloudCategoryId).toBeNull();
    });
  });
});
