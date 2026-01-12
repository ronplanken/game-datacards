import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { supabase } from "../config/supabase";
import { useAuth } from "./useAuth";

/**
 * Context for cloud categories.
 * Using a Provider pattern ensures the subscription stays alive
 * even when consuming components (like BottomSheets) unmount.
 */
const CloudCategoriesContext = createContext(null);

// Transform cloud record to local format
const transformCloudCategory = (cloudRecord) => ({
  uuid: cloudRecord.uuid,
  name: cloudRecord.name,
  type: cloudRecord.type,
  cards: cloudRecord.cards || [],
  lastModified: cloudRecord.last_modified,
  version: cloudRecord.version,
  cloudId: cloudRecord.id,
});

// Detect game system from category cards
const getGameSystem = (category) => {
  const firstCard = category.cards?.[0];
  if (!firstCard) return "custom";

  const source = firstCard.source || firstCard.cardType;
  switch (source) {
    case "40k-10e":
      return "40k";
    case "aos":
      return "aos";
    case "necromunda":
      return "necro";
    default:
      return "custom";
  }
};

/**
 * Provider component that manages cloud categories state and realtime subscription.
 * This should wrap the mobile app so the subscription stays alive.
 */
export function CloudCategoriesProvider({ children }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Fetch all categories from cloud
  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("user_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (fetchError) {
        console.error("Error fetching cloud categories:", fetchError);
        setError(fetchError.message);
        setCategories([]);
      } else {
        const transformed = (data || []).map((cat) => {
          const category = transformCloudCategory(cat);
          return {
            ...category,
            gameSystem: getGameSystem(category),
            cardCount: category.cards?.length || 0,
          };
        });
        setCategories(transformed);
        setLastFetchTime(new Date());
      }
    } catch (err) {
      console.error("Error fetching cloud categories:", err);
      setError(err.message);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Handle realtime changes
  const handleRealtimeChange = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === "INSERT") {
      const category = transformCloudCategory(newRecord);
      const enriched = {
        ...category,
        gameSystem: getGameSystem(category),
        cardCount: category.cards?.length || 0,
      };
      setCategories((prev) => [...prev, enriched].sort((a, b) => a.name.localeCompare(b.name)));
      setLastFetchTime(new Date());
    } else if (eventType === "UPDATE") {
      const category = transformCloudCategory(newRecord);
      const enriched = {
        ...category,
        gameSystem: getGameSystem(category),
        cardCount: category.cards?.length || 0,
      };
      setCategories((prev) =>
        prev.map((cat) => (cat.uuid === enriched.uuid ? enriched : cat)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setLastFetchTime(new Date());
    } else if (eventType === "DELETE") {
      const deletedUuid = oldRecord?.uuid;
      if (deletedUuid) {
        setCategories((prev) => prev.filter((cat) => cat.uuid !== deletedUuid));
        setLastFetchTime(new Date());
      }
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Subscribe to realtime changes - this subscription stays alive as long as the provider is mounted
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`mobile-cloud-categories-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_categories",
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleRealtimeChange]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const value = {
    categories,
    isLoading,
    error,
    refresh,
    lastFetchTime,
  };

  return <CloudCategoriesContext.Provider value={value}>{children}</CloudCategoriesContext.Provider>;
}

/**
 * Hook to access cloud categories.
 * Must be used within a CloudCategoriesProvider.
 */
export function useCloudCategories() {
  const context = useContext(CloudCategoriesContext);
  if (!context) {
    throw new Error("useCloudCategories must be used within a CloudCategoriesProvider");
  }
  return context;
}
