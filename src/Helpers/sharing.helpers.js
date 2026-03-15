import { message } from "../Components/Toast/message";

// ============================================
// SHARED CONSTANTS
// ============================================

export const GAME_SYSTEMS = [
  { value: "40k-10e", label: "Warhammer 40k (10th Edition)" },
  { value: "40k", label: "Warhammer 40k (Legacy)" },
  { value: "aos", label: "Age of Sigmar" },
  { value: "necromunda", label: "Necromunda" },
  { value: "horus-heresy", label: "Horus Heresy" },
  { value: "basic", label: "Basic/Generic" },
  { value: "other", label: "Other" },
];

export const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "new", label: "Newest" },
  { value: "subscribers", label: "Most Subscribers" },
];

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Creates a browse function that calls an RPC with standard filter/pagination params.
 * Returns { results, error } — caller manages React state.
 */
export function createBrowseFunction(supabase, rpcName, label) {
  return async (filters, offset) => {
    try {
      const { data, error } = await supabase.rpc(rpcName, {
        p_game_system: filters.gameSystem || null,
        p_search_query: filters.search || null,
        p_sort_by: filters.sortBy || "popular",
        p_limit: 20,
        p_offset: offset,
      });

      if (error) {
        console.error(`Browse ${label} error:`, error);
        message.error(`Failed to load ${label}`);
        return { results: [], error };
      }

      return { results: data || [], error: null };
    } catch (err) {
      console.error(`Browse ${label} exception:`, err);
      message.error(`Failed to load ${label}`);
      return { results: [], error: err };
    }
  };
}

/**
 * Creates a function that fetches featured items via RPC.
 */
export function createFeaturedFunction(supabase, rpcName) {
  return async (limit = 6) => {
    try {
      const { data, error } = await supabase.rpc(rpcName, { p_limit: limit });
      if (error) {
        console.error(`Get featured error:`, error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error(`Get featured exception:`, err);
      return [];
    }
  };
}

/**
 * Creates a function that looks up an item by share code via RPC.
 */
export function createShareCodeFunction(supabase, rpcName) {
  return async (shareCode) => {
    try {
      const { data, error } = await supabase.rpc(rpcName, { p_share_code: shareCode });
      if (error) {
        console.error("Get by share code error:", error);
        return null;
      }
      return data?.[0] || null;
    } catch (err) {
      console.error("Get by share code exception:", err);
      return null;
    }
  };
}

/**
 * Creates a function that fetches the user's own items via RPC.
 * Returns data array on success, empty array on failure.
 */
export function createFetchFunction(supabase, rpcName, label) {
  return async () => {
    try {
      const { data, error } = await supabase.rpc(rpcName);
      if (error) {
        console.error(`Get ${label} error:`, error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error(`Get ${label} exception:`, err);
      return [];
    }
  };
}

/**
 * Creates a publish function that calls an RPC with id + options.
 * Returns { success, shareCode } or { success: false, error }.
 */
export function createPublishFunction(supabase, rpcName, label) {
  return async (id, options = {}) => {
    try {
      const { description, gameSystem } = options;
      const params = rpcName === "publish_template" ? { p_template_id: id } : { p_datasource_db_id: id };

      const { data: result, error } = await supabase.rpc(rpcName, {
        ...params,
        p_description: description || null,
        p_game_system: gameSystem || null,
      });

      if (error) {
        console.error(`Publish ${label} error:`, error);
        message.error(`Failed to publish ${label}`);
        return { success: false, error: error.message };
      }

      if (!result?.success) {
        message.error(result?.error || `Failed to publish`);
        return { success: false, error: result?.error };
      }

      return { success: true, shareCode: result.share_code, publishedVersion: result.published_version };
    } catch (err) {
      console.error(`Publish ${label} exception:`, err);
      message.error(`Failed to publish ${label}`);
      return { success: false, error: err.message };
    }
  };
}

/**
 * Creates an unpublish function that calls an RPC with an id.
 * Returns { success } or { success: false, error }.
 */
export function createUnpublishFunction(supabase, rpcName, label) {
  return async (id) => {
    try {
      const params = rpcName === "unpublish_template" ? { p_template_id: id } : { p_datasource_db_id: id };

      const { data: result, error } = await supabase.rpc(rpcName, params);

      if (error) {
        console.error(`Unpublish ${label} error:`, error);
        message.error(`Failed to unpublish`);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error(`Unpublish ${label} exception:`, err);
      message.error(`Failed to unpublish`);
      return { success: false, error: err.message };
    }
  };
}

/**
 * Creates a push-update function that calls an RPC to increment published version.
 * Returns { success, newVersionNumber } or { success: false, error }.
 */
export function createPushUpdateFunction(supabase, rpcName, label) {
  return async (id) => {
    try {
      const params = rpcName === "push_template_update" ? { p_template_id: id } : { p_datasource_db_id: id };

      const { data: result, error } = await supabase.rpc(rpcName, params);

      if (error) {
        console.error(`Push ${label} update error:`, error);
        message.error("Failed to push update");
        return { success: false, error: error.message };
      }

      if (!result?.success) {
        message.error(result?.error || "Failed to push update");
        return { success: false, error: result?.error };
      }

      return { success: true, newVersionNumber: result.new_version_number };
    } catch (err) {
      console.error(`Push ${label} update exception:`, err);
      message.error("Failed to push update");
      return { success: false, error: err.message };
    }
  };
}
