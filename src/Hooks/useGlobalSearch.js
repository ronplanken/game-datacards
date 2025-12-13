import { useMemo } from "react";
import { useDataSourceStorage } from "./useDataSourceStorage";
import { useDebounce } from "./useDebounce";

/**
 * Custom hook for cross-faction search
 * @param {string} searchText - The search query
 * @param {object|null} factionFilter - Optional faction to filter results
 * @returns {{ results: Array, isSearching: boolean }}
 */
export function useGlobalSearch(searchText, factionFilter = null) {
  const { dataSource } = useDataSourceStorage();
  const debouncedSearch = useDebounce(searchText, 150);

  const results = useMemo(() => {
    // Need at least 2 characters to search
    if (!debouncedSearch || debouncedSearch.length < 2) {
      return [];
    }

    const searchLower = debouncedSearch.toLowerCase();
    const factions = factionFilter ? [factionFilter] : dataSource?.data || [];
    const matches = [];

    for (const faction of factions) {
      // Support both datasheets (40K) and warscrolls (AoS)
      const units = faction.datasheets || faction.warscrolls || [];

      for (const unit of units) {
        // Skip non-active units if they have an active flag
        if (unit.active === false) continue;

        // Match against unit name
        const nameMatch = unit.name?.toLowerCase().includes(searchLower);

        if (nameMatch) {
          matches.push({
            ...unit,
            factionName: faction.name,
            factionId: faction.id,
          });
        }
      }
    }

    // Sort results: exact matches first, then by name alphabetically
    const sorted = matches.sort((a, b) => {
      const aName = a.name?.toLowerCase() || "";
      const bName = b.name?.toLowerCase() || "";

      // Exact match gets priority
      const aExact = aName === searchLower;
      const bExact = bName === searchLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Starts with search term gets secondary priority
      const aStartsWith = aName.startsWith(searchLower);
      const bStartsWith = bName.startsWith(searchLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Alphabetical sort
      return aName.localeCompare(bName);
    });

    // Limit to 20 results for performance
    return sorted.slice(0, 20);
  }, [debouncedSearch, factionFilter, dataSource]);

  return {
    results,
    isSearching: searchText !== debouncedSearch,
  };
}
