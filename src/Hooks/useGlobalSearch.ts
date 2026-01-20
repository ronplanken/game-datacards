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

    // Track seen basic/core cards to avoid duplicates across factions
    const seenBasicCards = new Set();

    for (const faction of factions) {
      // Helper to safely get array from potentially non-array value
      const toArray = (val) => (Array.isArray(val) ? val : []);

      // Build list of all searchable card collections
      // isBasic flag indicates core/basic items that are duplicated across factions
      const cardCollections = [
        { items: toArray(faction.datasheets || faction.warscrolls), type: "unit", isBasic: false },
        { items: toArray(faction.stratagems), type: "stratagem", isBasic: false },
        { items: toArray(faction.basicStratagems), type: "stratagem", isBasic: true },
        { items: toArray(faction.enhancements), type: "enhancement", isBasic: false },
        { items: toArray(faction.rules?.army), type: "rule", isBasic: false },
        { items: toArray(faction.rules?.detachment).flatMap((d) => toArray(d.rules)), type: "rule", isBasic: false },
        // AoS lores
        { items: toArray(faction.lores).flatMap((l) => toArray(l.spells)), type: "spell", isBasic: false },
        {
          items: toArray(faction.manifestationLores).flatMap((l) => toArray(l.spells)),
          type: "manifestation",
          isBasic: false,
        },
      ];

      for (const { items, type, isBasic } of cardCollections) {
        for (const card of items) {
          // Skip non-active cards if they have an active flag
          if (card.active === false) continue;

          // Match against card name
          const nameMatch = card.name?.toLowerCase().includes(searchLower);
          if (!nameMatch) continue;

          // Deduplicate basic/core cards - only add once with "Core" label
          if (isBasic) {
            const dedupeKey = `${type}-${card.name}`;
            if (seenBasicCards.has(dedupeKey)) continue;
            seenBasicCards.add(dedupeKey);

            matches.push({
              ...card,
              cardType: type,
              factionName: "Core",
              factionId: faction.id, // Use first faction found for navigation
            });
          } else {
            matches.push({
              ...card,
              cardType: type,
              factionName: faction.name,
              factionId: faction.id,
            });
          }
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
