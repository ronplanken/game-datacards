import { renderHook, act } from "@testing-library/react";
import React from "react";
import { CategorySharingProvider, useCategorySharing } from "../useCategorySharing";

// Mock supabase
const mockRpc = vi.fn();
vi.mock("../../config/supabase", () => ({
  supabase: { rpc: (...args) => mockRpc(...args) },
  isSupabaseConfigured: () => true,
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: () => "mock-nanoid-id-1234",
}));

// Mock useAuth
vi.mock("../../Premium", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

const wrapper = ({ children }) => <CategorySharingProvider>{children}</CategorySharingProvider>;

describe("useCategorySharing", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useCategorySharing());
    }).toThrow("`useCategorySharing` must be used with a `CategorySharingProvider`");
  });

  it("returns all expected API methods", () => {
    const { result } = renderHook(() => useCategorySharing(), { wrapper });
    expect(result.current).toHaveProperty("shareAnonymous");
    expect(result.current).toHaveProperty("shareOwned");
    expect(result.current).toHaveProperty("updateShare");
    expect(result.current).toHaveProperty("toggleVisibility");
    expect(result.current).toHaveProperty("deleteShare");
    expect(result.current).toHaveProperty("getSharedCategory");
    expect(result.current).toHaveProperty("getMyShares");
    expect(result.current).toHaveProperty("getExistingShare");
    expect(result.current).toHaveProperty("myShares");
    expect(result.current).toHaveProperty("isLoadingMyShares");
    expect(result.current).toHaveProperty("isSharing");
  });

  it("has correct initial state", () => {
    const { result } = renderHook(() => useCategorySharing(), { wrapper });
    expect(result.current.myShares).toEqual([]);
    expect(result.current.isLoadingMyShares).toBe(false);
    expect(result.current.isSharing).toBe(false);
  });

  describe("shareAnonymous", () => {
    it("calls share_category_anonymous RPC with cleaned data", async () => {
      mockRpc.mockResolvedValue({ data: { share_id: "mock-nanoid-id-1234" }, error: null });

      const { result } = renderHook(() => useCategorySharing(), { wrapper });

      const category = {
        name: "Test",
        cards: [
          {
            cardType: "datasheet",
            link: "/foo",
            datasheet: [
              { active: true, link: "/bar", name: "Sheet1" },
              { active: false, name: "Sheet2" },
            ],
            keywords: [
              { active: true, name: "Infantry" },
              { active: false, name: "Hidden" },
            ],
            wargear: [{ active: true, name: "Bolter" }],
            abilities: [
              { showAbility: true, name: "Ability1" },
              { showAbility: false, name: "Ability2" },
            ],
          },
        ],
      };

      let res;
      await act(async () => {
        res = await result.current.shareAnonymous(category);
      });

      expect(res.success).toBe(true);
      expect(res.shareId).toBe("mock-nanoid-id-1234");
      expect(mockRpc).toHaveBeenCalledWith("share_category_anonymous", expect.any(Object));

      const call = mockRpc.mock.calls[0];
      const payload = call[1].p_category;
      // Verify link properties are removed
      expect(payload.cards[0]).not.toHaveProperty("link");
      // Verify inactive items are filtered
      expect(payload.cards[0].datasheet).toHaveLength(1);
      expect(payload.cards[0].datasheet[0]).not.toHaveProperty("link");
      expect(payload.cards[0].keywords).toHaveLength(1);
      expect(payload.cards[0].abilities).toHaveLength(1);
    });

    it("rejects categories with more than 100 cards", async () => {
      const { result } = renderHook(() => useCategorySharing(), { wrapper });

      const category = {
        name: "Big",
        cards: Array.from({ length: 101 }, (_, i) => ({ name: `Card ${i}` })),
      };

      let res;
      await act(async () => {
        res = await result.current.shareAnonymous(category);
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("100 cards");
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it("handles RPC errors gracefully", async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: "Network error" } });

      const { result } = renderHook(() => useCategorySharing(), { wrapper });

      let res;
      await act(async () => {
        res = await result.current.shareAnonymous({ name: "Test", cards: [] });
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe("Network error");
    });
  });

  describe("getSharedCategory", () => {
    it("calls get_shared_category RPC", async () => {
      const mockData = { share_id: "abc", category: { name: "Shared" }, views: 5 };
      mockRpc.mockResolvedValue({ data: mockData, error: null });

      const { result } = renderHook(() => useCategorySharing(), { wrapper });

      let data;
      await act(async () => {
        data = await result.current.getSharedCategory("abc");
      });

      expect(data).toEqual(mockData);
      expect(mockRpc).toHaveBeenCalledWith("get_shared_category", { p_share_id: "abc" });
    });

    it("returns null for empty share ID", async () => {
      const { result } = renderHook(() => useCategorySharing(), { wrapper });

      let data;
      await act(async () => {
        data = await result.current.getSharedCategory("");
      });

      expect(data).toBeNull();
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it("returns null on error", async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: "Not found" } });

      const { result } = renderHook(() => useCategorySharing(), { wrapper });

      let data;
      await act(async () => {
        data = await result.current.getSharedCategory("notfound");
      });

      expect(data).toBeNull();
    });
  });

  describe("card cleaning", () => {
    it("passes through non-datasheet cards with link removed", async () => {
      mockRpc.mockResolvedValue({ data: { share_id: "id" }, error: null });

      const { result } = renderHook(() => useCategorySharing(), { wrapper });

      const category = {
        name: "Test",
        cards: [{ cardType: "stratagem", name: "Strat", link: "/link" }],
      };

      await act(async () => {
        await result.current.shareAnonymous(category);
      });

      const payload = mockRpc.mock.calls[0][1].p_category;
      expect(payload.cards[0]).not.toHaveProperty("link");
      expect(payload.cards[0].name).toBe("Strat");
    });
  });
});
