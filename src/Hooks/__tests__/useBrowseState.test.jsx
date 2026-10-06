import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBrowseState } from "../useBrowseState";

// Mock the Toast message module
vi.mock("../../Components/Toast/message", () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

function createMockSupabase(rpcResults = {}) {
  return {
    rpc: vi.fn((name, params) => {
      const result = rpcResults[name] || { data: null, error: null };
      return Promise.resolve(result);
    }),
  };
}

describe("useBrowseState", () => {
  it("initializes with default state", () => {
    const supabase = createMockSupabase();
    const { result } = renderHook(() =>
      useBrowseState({
        supabase,
        browseRpc: "browse_public_datasources",
        featuredRpc: "get_featured_datasources",
        shareCodeRpc: "get_datasource_by_share_code",
        entityLabel: "datasources",
      }),
    );

    expect(result.current.publicItems).toEqual([]);
    expect(result.current.isLoadingPublic).toBe(false);
    expect(result.current.browseFilters).toEqual({
      gameSystem: null,
      search: "",
      sortBy: "popular",
    });
    expect(result.current.pagination).toEqual({ offset: 0, hasMore: true });
  });

  it("browsePublic fetches results and updates state", async () => {
    const mockItems = [{ id: 1, name: "Test DS" }];
    const supabase = createMockSupabase({
      browse_public_datasources: { data: mockItems, error: null },
    });

    const { result } = renderHook(() =>
      useBrowseState({
        supabase,
        browseRpc: "browse_public_datasources",
        featuredRpc: "get_featured_datasources",
        shareCodeRpc: "get_datasource_by_share_code",
        entityLabel: "datasources",
      }),
    );

    await act(async () => {
      await result.current.browsePublic({}, true);
    });

    expect(result.current.publicItems).toEqual(mockItems);
    expect(result.current.pagination.offset).toBe(1);
    expect(result.current.pagination.hasMore).toBe(false);
  });

  it("browsePublic appends results when not reset", async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const page2 = [{ id: 20 }, { id: 21 }];
    const supabase = createMockSupabase();

    // First call returns page1, second call returns page2
    let callCount = 0;
    supabase.rpc = vi.fn(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: page1, error: null });
      return Promise.resolve({ data: page2, error: null });
    });

    const { result } = renderHook(() =>
      useBrowseState({
        supabase,
        browseRpc: "browse_public_datasources",
        featuredRpc: "get_featured_datasources",
        shareCodeRpc: "get_datasource_by_share_code",
        entityLabel: "datasources",
      }),
    );

    // First page (reset)
    await act(async () => {
      await result.current.browsePublic({}, true);
    });

    expect(result.current.publicItems).toHaveLength(20);
    expect(result.current.pagination.hasMore).toBe(true);

    // Second page (append)
    await act(async () => {
      await result.current.browsePublic({});
    });

    expect(result.current.publicItems).toHaveLength(22);
    expect(result.current.pagination.hasMore).toBe(false);
  });

  it("getFeatured calls the correct RPC", async () => {
    const mockFeatured = [{ id: 1, featured: true }];
    const supabase = createMockSupabase({
      get_featured_datasources: { data: mockFeatured, error: null },
    });

    const { result } = renderHook(() =>
      useBrowseState({
        supabase,
        browseRpc: "browse_public_datasources",
        featuredRpc: "get_featured_datasources",
        shareCodeRpc: "get_datasource_by_share_code",
        entityLabel: "datasources",
      }),
    );

    let featured;
    await act(async () => {
      featured = await result.current.getFeatured();
    });

    expect(featured).toEqual(mockFeatured);
    expect(supabase.rpc).toHaveBeenCalledWith("get_featured_datasources", { p_limit: 6 });
  });

  it("getByShareCode calls the correct RPC", async () => {
    const mockItem = { id: 1, share_code: "abc" };
    const supabase = createMockSupabase({
      get_datasource_by_share_code: { data: [mockItem], error: null },
    });

    const { result } = renderHook(() =>
      useBrowseState({
        supabase,
        browseRpc: "browse_public_datasources",
        featuredRpc: "get_featured_datasources",
        shareCodeRpc: "get_datasource_by_share_code",
        entityLabel: "datasources",
      }),
    );

    let item;
    await act(async () => {
      item = await result.current.getByShareCode("abc");
    });

    expect(item).toEqual(mockItem);
  });

  it("updatePublicItem updates a specific item", async () => {
    const mockItems = [
      { id: 1, name: "A", is_subscribed: false },
      { id: 2, name: "B", is_subscribed: false },
    ];
    const supabase = createMockSupabase({
      browse_public_datasources: { data: mockItems, error: null },
    });

    const { result } = renderHook(() =>
      useBrowseState({
        supabase,
        browseRpc: "browse_public_datasources",
        featuredRpc: "get_featured_datasources",
        shareCodeRpc: "get_datasource_by_share_code",
        entityLabel: "datasources",
      }),
    );

    await act(async () => {
      await result.current.browsePublic({}, true);
    });

    act(() => {
      result.current.updatePublicItem(1, { is_subscribed: true });
    });

    expect(result.current.publicItems[0].is_subscribed).toBe(true);
    expect(result.current.publicItems[1].is_subscribed).toBe(false);
  });
});
