import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "game-datacards-recent-searches";
const MAX_RECENT_SEARCHES = 10;

/**
 * Custom hook for managing recent search history
 * @returns {{ recentSearches: Array, addRecentSearch: Function, clearRecentSearches: Function }}
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  }, []);

  // Save to localStorage whenever recentSearches changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
    } catch (error) {
      console.error("Failed to save recent searches:", error);
    }
  }, [recentSearches]);

  /**
   * Add a unit to recent searches
   * @param {object} unit - The unit object with id, name
   * @param {string} factionName - The faction name
   * @param {string} factionId - The faction ID
   */
  const addRecentSearch = useCallback((unit, factionName, factionId) => {
    if (!unit || !unit.name) return;

    const newEntry = {
      unitId: unit.id,
      unitName: unit.name,
      factionName,
      factionId,
      timestamp: Date.now(),
    };

    setRecentSearches((prev) => {
      // Remove any existing entry for the same unit
      const filtered = prev.filter((entry) => !(entry.unitId === unit.id && entry.factionId === factionId));

      // Add new entry at the beginning and limit to max
      return [newEntry, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  /**
   * Clear all recent searches
   */
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
