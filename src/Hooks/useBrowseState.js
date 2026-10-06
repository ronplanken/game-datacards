import { useState, useCallback, useMemo } from "react";
import { createBrowseFunction, createFeaturedFunction, createShareCodeFunction } from "../Helpers/sharing.helpers";

/**
 * Composable hook for browse/pagination/filters state.
 * Used by both useDatasourceSharing and useTemplateSharing.
 *
 * @param {Object} opts
 * @param {Object} opts.supabase - Supabase client
 * @param {string} opts.browseRpc - RPC name for browsing (e.g. "browse_public_datasources")
 * @param {string} opts.featuredRpc - RPC name for featured items
 * @param {string} opts.shareCodeRpc - RPC name for share code lookup
 * @param {string} opts.entityLabel - Label for error messages (e.g. "datasources")
 */
export function useBrowseState({ supabase, browseRpc, featuredRpc, shareCodeRpc, entityLabel }) {
  const [publicItems, setPublicItems] = useState([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [browseFilters, setBrowseFilters] = useState({
    gameSystem: null,
    search: "",
    sortBy: "popular",
  });
  const [pagination, setPagination] = useState({ offset: 0, hasMore: true });

  // Create stable RPC wrappers
  const browseFn = useMemo(
    () => createBrowseFunction(supabase, browseRpc, entityLabel),
    [supabase, browseRpc, entityLabel],
  );
  const featuredFn = useMemo(() => createFeaturedFunction(supabase, featuredRpc), [supabase, featuredRpc]);
  const shareCodeFn = useMemo(() => createShareCodeFunction(supabase, shareCodeRpc), [supabase, shareCodeRpc]);

  const browsePublic = useCallback(
    async (filters = {}, reset = false) => {
      setIsLoadingPublic(true);

      const mergedFilters = { ...browseFilters, ...filters };
      const offset = reset ? 0 : pagination.offset;

      const { results } = await browseFn(mergedFilters, offset);

      if (reset) {
        setPublicItems(results);
        setPagination({ offset: results.length, hasMore: results.length === 20 });
      } else {
        setPublicItems((prev) => [...prev, ...results]);
        setPagination((prev) => ({
          offset: prev.offset + results.length,
          hasMore: results.length === 20,
        }));
      }

      setBrowseFilters(mergedFilters);
      setIsLoadingPublic(false);
      return results;
    },
    [browseFilters, pagination.offset, browseFn],
  );

  const getFeatured = useCallback(() => featuredFn(), [featuredFn]);

  const getByShareCode = useCallback((code) => shareCodeFn(code), [shareCodeFn]);

  /**
   * Update a single item in the publicItems list (e.g. to toggle is_subscribed).
   */
  const updatePublicItem = useCallback((id, updater) => {
    setPublicItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updater } : item)));
  }, []);

  return {
    publicItems,
    isLoadingPublic,
    browseFilters,
    setBrowseFilters,
    pagination,
    browsePublic,
    getFeatured,
    getByShareCode,
    updatePublicItem,
  };
}
