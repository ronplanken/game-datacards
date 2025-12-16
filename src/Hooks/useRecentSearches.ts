import { useState, useEffect, useCallback } from "react";
import { useSettingsStorage } from "./useSettingsStorage";

const STORAGE_KEY = "game-datacards-recent-searches";
const MAX_RECENT_SEARCHES = 10;

/**
 * Custom hook for managing recent search history per datasource
 * @returns {{ recentSearches: Array, addRecentSearch: Function, clearRecentSearches: Function }}
 */
export function useRecentSearches() {
  const { settings } = useSettingsStorage();
  const dataSource = settings.selectedDataSource || "basic";

  // Store all searches per datasource
  const [allSearches, setAllSearches] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle migration from old format (array) to new format (object)
        if (Array.isArray(parsed)) {
          // Migrate old array format to 40k-10e (the original datasource)
          setAllSearches({ "40k-10e": parsed });
        } else if (typeof parsed === "object" && parsed !== null) {
          setAllSearches(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  }, []);

  // Save to localStorage whenever allSearches changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));
    } catch (error) {
      console.error("Failed to save recent searches:", error);
    }
  }, [allSearches]);

  // Get searches for current datasource
  const recentSearches = allSearches[dataSource] || [];

  /**
   * Add a unit to recent searches for the current datasource
   * @param {object} unit - The unit object with id, name
   * @param {string} factionName - The faction name
   * @param {string} factionId - The faction ID
   */
  const addRecentSearch = useCallback(
    (unit, factionName, factionId) => {
      if (!unit || !unit.name) return;

      const newEntry = {
        unitId: unit.id,
        unitName: unit.name,
        factionName,
        factionId,
        timestamp: Date.now(),
      };

      setAllSearches((prev) => {
        const currentSearches = prev[dataSource] || [];
        // Remove any existing entry for the same unit
        const filtered = currentSearches.filter(
          (entry) => !(entry.unitId === unit.id && entry.factionId === factionId)
        );

        // Add new entry at the beginning and limit to max
        return {
          ...prev,
          [dataSource]: [newEntry, ...filtered].slice(0, MAX_RECENT_SEARCHES),
        };
      });
    },
    [dataSource]
  );

  /**
   * Clear all recent searches for the current datasource
   */
  const clearRecentSearches = useCallback(() => {
    setAllSearches((prev) => ({
      ...prev,
      [dataSource]: [],
    }));
  }, [dataSource]);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
