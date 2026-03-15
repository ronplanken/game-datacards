import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GAME_SYSTEMS,
  SORT_OPTIONS,
  createBrowseFunction,
  createFeaturedFunction,
  createShareCodeFunction,
  createFetchFunction,
  createPublishFunction,
  createUnpublishFunction,
  createPushUpdateFunction,
} from "../sharing.helpers";

// Mock the Toast message module
vi.mock("../../Components/Toast/message", () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

function createMockSupabase(rpcResult = { data: null, error: null }) {
  return {
    rpc: vi.fn().mockResolvedValue(rpcResult),
  };
}

describe("sharing.helpers", () => {
  describe("constants", () => {
    it("GAME_SYSTEMS has expected entries", () => {
      expect(GAME_SYSTEMS).toHaveLength(7);
      expect(GAME_SYSTEMS[0]).toEqual({ value: "40k-10e", label: "Warhammer 40k (10th Edition)" });
      expect(GAME_SYSTEMS.map((g) => g.value)).toContain("other");
    });

    it("SORT_OPTIONS has expected entries", () => {
      expect(SORT_OPTIONS).toHaveLength(3);
      expect(SORT_OPTIONS.map((s) => s.value)).toEqual(["popular", "new", "subscribers"]);
    });
  });

  describe("createBrowseFunction", () => {
    it("calls RPC with correct params and returns results", async () => {
      const mockData = [{ id: 1, name: "Test" }];
      const supabase = createMockSupabase({ data: mockData, error: null });
      const browse = createBrowseFunction(supabase, "browse_public_datasources", "datasources");

      const result = await browse({ gameSystem: "40k-10e", search: "space", sortBy: "new" }, 10);

      expect(supabase.rpc).toHaveBeenCalledWith("browse_public_datasources", {
        p_game_system: "40k-10e",
        p_search_query: "space",
        p_sort_by: "new",
        p_limit: 20,
        p_offset: 10,
      });
      expect(result).toEqual({ results: mockData, error: null });
    });

    it("returns empty results on error", async () => {
      const supabase = createMockSupabase({ data: null, error: { message: "fail" } });
      const browse = createBrowseFunction(supabase, "browse_public_datasources", "datasources");

      const result = await browse({}, 0);

      expect(result.results).toEqual([]);
      expect(result.error).toBeTruthy();
    });

    it("handles null filters gracefully", async () => {
      const supabase = createMockSupabase({ data: [], error: null });
      const browse = createBrowseFunction(supabase, "browse_public_datasources", "datasources");

      await browse({}, 0);

      expect(supabase.rpc).toHaveBeenCalledWith("browse_public_datasources", {
        p_game_system: null,
        p_search_query: null,
        p_sort_by: "popular",
        p_limit: 20,
        p_offset: 0,
      });
    });

    it("handles exception gracefully", async () => {
      const supabase = { rpc: vi.fn().mockRejectedValue(new Error("network error")) };
      const browse = createBrowseFunction(supabase, "browse_public_datasources", "datasources");

      const result = await browse({}, 0);

      expect(result.results).toEqual([]);
      expect(result.error).toBeInstanceOf(Error);
    });
  });

  describe("createFeaturedFunction", () => {
    it("returns featured items from RPC", async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const supabase = createMockSupabase({ data: mockData, error: null });
      const getFeatured = createFeaturedFunction(supabase, "get_featured_datasources");

      const result = await getFeatured(6);

      expect(supabase.rpc).toHaveBeenCalledWith("get_featured_datasources", { p_limit: 6 });
      expect(result).toEqual(mockData);
    });

    it("returns empty array on error", async () => {
      const supabase = createMockSupabase({ data: null, error: { message: "fail" } });
      const getFeatured = createFeaturedFunction(supabase, "get_featured_datasources");

      const result = await getFeatured();

      expect(result).toEqual([]);
    });
  });

  describe("createShareCodeFunction", () => {
    it("returns first item from RPC result", async () => {
      const mockItem = { id: 1, name: "Test", share_code: "abc123" };
      const supabase = createMockSupabase({ data: [mockItem], error: null });
      const getByCode = createShareCodeFunction(supabase, "get_datasource_by_share_code");

      const result = await getByCode("abc123");

      expect(supabase.rpc).toHaveBeenCalledWith("get_datasource_by_share_code", { p_share_code: "abc123" });
      expect(result).toEqual(mockItem);
    });

    it("returns null when no results", async () => {
      const supabase = createMockSupabase({ data: [], error: null });
      const getByCode = createShareCodeFunction(supabase, "get_datasource_by_share_code");

      const result = await getByCode("nonexistent");

      expect(result).toBeNull();
    });

    it("returns null on error", async () => {
      const supabase = createMockSupabase({ data: null, error: { message: "fail" } });
      const getByCode = createShareCodeFunction(supabase, "get_datasource_by_share_code");

      const result = await getByCode("abc");

      expect(result).toBeNull();
    });
  });

  describe("createFetchFunction", () => {
    it("returns data from RPC", async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const supabase = createMockSupabase({ data: mockData, error: null });
      const fetch = createFetchFunction(supabase, "get_my_subscriptions", "subscriptions");

      const result = await fetch();

      expect(supabase.rpc).toHaveBeenCalledWith("get_my_subscriptions");
      expect(result).toEqual(mockData);
    });

    it("returns empty array on error", async () => {
      const supabase = createMockSupabase({ data: null, error: { message: "fail" } });
      const fetch = createFetchFunction(supabase, "get_my_subscriptions", "subscriptions");

      const result = await fetch();

      expect(result).toEqual([]);
    });
  });

  describe("createPublishFunction", () => {
    it("calls RPC with datasource params and returns result", async () => {
      const supabase = createMockSupabase({
        data: { success: true, share_code: "abc123" },
        error: null,
      });
      const publish = createPublishFunction(supabase, "publish_datasource", "datasource");

      const result = await publish("ds-1", { description: "desc", gameSystem: "40k-10e" });

      expect(supabase.rpc).toHaveBeenCalledWith("publish_datasource", {
        p_datasource_db_id: "ds-1",
        p_description: "desc",
        p_game_system: "40k-10e",
      });
      expect(result).toEqual({ success: true, shareCode: "abc123", publishedVersion: undefined });
    });

    it("calls RPC with template params", async () => {
      const supabase = createMockSupabase({
        data: { success: true, share_code: "xyz", published_version: 2 },
        error: null,
      });
      const publish = createPublishFunction(supabase, "publish_template", "template");

      const result = await publish("tpl-1", { description: "desc" });

      expect(supabase.rpc).toHaveBeenCalledWith("publish_template", {
        p_template_id: "tpl-1",
        p_description: "desc",
        p_game_system: null,
      });
      expect(result).toEqual({ success: true, shareCode: "xyz", publishedVersion: 2 });
    });

    it("returns failure on RPC error", async () => {
      const supabase = createMockSupabase({ data: null, error: { message: "forbidden" } });
      const publish = createPublishFunction(supabase, "publish_datasource", "datasource");

      const result = await publish("ds-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("forbidden");
    });
  });

  describe("createUnpublishFunction", () => {
    it("calls correct RPC for datasources", async () => {
      const supabase = createMockSupabase({ data: { success: true }, error: null });
      const unpublish = createUnpublishFunction(supabase, "unpublish_datasource", "datasource");

      const result = await unpublish("ds-1");

      expect(supabase.rpc).toHaveBeenCalledWith("unpublish_datasource", { p_datasource_db_id: "ds-1" });
      expect(result).toEqual({ success: true });
    });

    it("calls correct RPC for templates", async () => {
      const supabase = createMockSupabase({ data: { success: true }, error: null });
      const unpublish = createUnpublishFunction(supabase, "unpublish_template", "template");

      const result = await unpublish("tpl-1");

      expect(supabase.rpc).toHaveBeenCalledWith("unpublish_template", { p_template_id: "tpl-1" });
      expect(result).toEqual({ success: true });
    });
  });

  describe("createPushUpdateFunction", () => {
    it("returns new version number on success", async () => {
      const supabase = createMockSupabase({
        data: { success: true, new_version_number: 5 },
        error: null,
      });
      const push = createPushUpdateFunction(supabase, "push_datasource_update", "datasource");

      const result = await push("ds-1");

      expect(supabase.rpc).toHaveBeenCalledWith("push_datasource_update", { p_datasource_db_id: "ds-1" });
      expect(result).toEqual({ success: true, newVersionNumber: 5 });
    });

    it("returns failure when result indicates error", async () => {
      const supabase = createMockSupabase({
        data: { success: false, error: "not found" },
        error: null,
      });
      const push = createPushUpdateFunction(supabase, "push_datasource_update", "datasource");

      const result = await push("ds-1");

      expect(result.success).toBe(false);
    });
  });
});
