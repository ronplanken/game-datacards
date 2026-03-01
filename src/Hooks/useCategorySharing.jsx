import React, { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { supabase, isSupabaseConfigured } from "../config/supabase";

const CategorySharingContext = React.createContext(undefined);

export function useCategorySharing() {
  const context = React.useContext(CategorySharingContext);
  if (context === undefined) {
    throw new Error("`useCategorySharing` must be used with a `CategorySharingProvider`");
  }
  return context;
}

/**
 * Clean category cards for sharing:
 * - Filter inactive datasheets/keywords/wargear/abilities
 * - Remove link properties
 */
function cleanCardsForSharing(category) {
  const cleanCards = category.cards.map((card) => {
    const cleaned = { ...card };
    delete cleaned.link;

    if (cleaned.cardType === "datasheet") {
      return {
        ...cleaned,
        datasheet: (cleaned.datasheet ?? [])
          .filter((sheet) => sheet.active)
          .map((sheet) => {
            const s = { ...sheet };
            delete s.link;
            return s;
          }),
        keywords: (cleaned.keywords ?? []).filter((keyword) => keyword.active),
        wargear: (cleaned.wargear ?? []).filter((wargear) => wargear.active),
        abilities: (cleaned.abilities ?? []).filter((ability) => ability.showAbility),
      };
    }
    return cleaned;
  });

  return { ...category, cards: cleanCards };
}

export const CategorySharingProvider = ({ children, isAuthenticated = false }) => {
  const [myShares, setMyShares] = useState([]);
  const [isLoadingMyShares, setIsLoadingMyShares] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  /**
   * Share a category anonymously (community feature)
   */
  const shareAnonymous = useCallback(async (category) => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: "Supabase not configured" };
    }

    if (category.cards?.length > 100) {
      return { success: false, error: "Maximum 100 cards per share" };
    }

    setIsSharing(true);
    try {
      const shareId = nanoid(16);
      const cleanCategory = cleanCardsForSharing(category);

      const { data, error } = await supabase.rpc("share_category_anonymous", {
        p_share_id: shareId,
        p_category: cleanCategory,
        p_version: import.meta.env.VITE_VERSION || "dev",
      });

      if (error) throw error;

      return { success: true, shareId: data.share_id };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsSharing(false);
    }
  }, []);

  /**
   * Share a category as an authenticated user (premium feature)
   */
  const shareOwned = useCallback(
    async (category, isPublic = true) => {
      if (!isSupabaseConfigured() || !isAuthenticated) {
        return { success: false, error: "Authentication required" };
      }

      if (category.cards?.length > 100) {
        return { success: false, error: "Maximum 100 cards per share" };
      }

      setIsSharing(true);
      try {
        const cleanCategory = cleanCardsForSharing(category);

        const { data, error } = await supabase.rpc("share_category_owned", {
          p_category_uuid: category.uuid || null,
          p_category: cleanCategory,
          p_version: import.meta.env.VITE_VERSION || "dev",
          p_is_public: isPublic,
        });

        if (error) throw error;

        return { success: true, shareId: data.share_id };
      } catch (err) {
        return { success: false, error: err.message };
      } finally {
        setIsSharing(false);
      }
    },
    [isAuthenticated],
  );

  /**
   * Update an existing shared category (full replacement)
   */
  const updateShare = useCallback(
    async (shareId, category) => {
      if (!isSupabaseConfigured() || !isAuthenticated) {
        return { success: false, error: "Authentication required" };
      }

      if (category.cards?.length > 100) {
        return { success: false, error: "Maximum 100 cards per share" };
      }

      setIsSharing(true);
      try {
        const cleanCategory = cleanCardsForSharing(category);

        const { data, error } = await supabase.rpc("update_shared_category", {
          p_share_id: shareId,
          p_category: cleanCategory,
        });

        if (error) throw error;

        return { success: true, versionNumber: data.version_number };
      } catch (err) {
        return { success: false, error: err.message };
      } finally {
        setIsSharing(false);
      }
    },
    [isAuthenticated],
  );

  /**
   * Toggle share visibility (public/private)
   */
  const toggleVisibility = useCallback(
    async (shareId, isPublic) => {
      if (!isSupabaseConfigured() || !isAuthenticated) {
        return { success: false, error: "Authentication required" };
      }

      try {
        const { error } = await supabase.rpc("toggle_share_visibility", {
          p_share_id: shareId,
          p_is_public: isPublic,
        });

        if (error) throw error;

        setMyShares((prev) => prev.map((s) => (s.share_id === shareId ? { ...s, is_public: isPublic } : s)));

        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [isAuthenticated],
  );

  /**
   * Soft delete a shared category
   */
  const deleteShare = useCallback(
    async (shareId) => {
      if (!isSupabaseConfigured() || !isAuthenticated) {
        return { success: false, error: "Authentication required" };
      }

      try {
        const { error } = await supabase.rpc("delete_shared_category", {
          p_share_id: shareId,
        });

        if (error) throw error;

        setMyShares((prev) => prev.filter((s) => s.share_id !== shareId));

        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [isAuthenticated],
  );

  /**
   * Get a shared category by share ID (public access)
   */
  const getSharedCategory = useCallback(async (shareId) => {
    if (!isSupabaseConfigured() || !shareId) {
      return null;
    }

    try {
      const { data, error } = await supabase.rpc("get_shared_category", {
        p_share_id: shareId,
      });

      if (error) throw error;

      return data;
    } catch {
      return null;
    }
  }, []);

  /**
   * Get user's own shared categories
   */
  const getMyShares = useCallback(async () => {
    if (!isSupabaseConfigured() || !isAuthenticated) {
      return [];
    }

    setIsLoadingMyShares(true);
    try {
      const { data, error } = await supabase.rpc("get_my_shared_categories");

      if (error) throw error;

      const shares = data || [];
      setMyShares(shares);
      return shares;
    } catch {
      return [];
    } finally {
      setIsLoadingMyShares(false);
    }
  }, [isAuthenticated]);

  /**
   * Check if a category already has an existing share
   */
  const getExistingShare = useCallback(
    async (categoryUuid) => {
      if (!isSupabaseConfigured() || !isAuthenticated || !categoryUuid) {
        return null;
      }

      try {
        const { data, error } = await supabase.rpc("get_existing_share_for_category", {
          p_category_uuid: categoryUuid,
        });

        if (error) throw error;

        return data;
      } catch {
        return null;
      }
    },
    [isAuthenticated],
  );

  const context = {
    shareAnonymous,
    shareOwned,
    updateShare,
    toggleVisibility,
    deleteShare,
    getSharedCategory,
    getMyShares,
    getExistingShare,
    myShares,
    isLoadingMyShares,
    isSharing,
  };

  return <CategorySharingContext.Provider value={context}>{children}</CategorySharingContext.Provider>;
};
