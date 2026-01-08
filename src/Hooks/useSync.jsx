import React, { useState, useEffect, useCallback, useRef, useContext, createContext } from "react";
import { message } from "../Components/Toast/message";
import { supabase } from "../config/supabase";
import { useAuth } from "./useAuth";
import { useCardStorage } from "./useCardStorage";
import { useSubscription } from "./useSubscription";
import { mapCardsToFactionStructure, extractCardsFromFaction } from "../Helpers/customDatasource.helpers";

// Debounce delay for auto-sync (ms)
const SYNC_DEBOUNCE_DELAY = 2000;

// Parse subscription limit error from database trigger
const parseSubscriptionLimitError = (errorMessage) => {
  if (!errorMessage) return null;
  const match = errorMessage.match(/SUBSCRIPTION_LIMIT_EXCEEDED:(\w+):(\d+):(\d+);(\w+)/);
  if (match) {
    return {
      resource: match[1], // 'categories' or 'datasources'
      current: parseInt(match[2], 10),
      limit: parseInt(match[3], 10),
      tier: match[4], // 'free', 'premium', 'creator'
    };
  }
  return null;
};

// Generate or retrieve a unique device ID for conflict tracking
const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

// Transform cloud record to local category format
const transformCloudToLocal = (cloudRecord) => ({
  uuid: cloudRecord.uuid,
  name: cloudRecord.name,
  type: cloudRecord.type,
  parentId: cloudRecord.parent_id,
  cards: cloudRecord.cards || [],
  closed: cloudRecord.closed || false,
  syncEnabled: true,
  syncStatus: "synced",
  lastSyncedAt: cloudRecord.last_modified,
  localVersion: cloudRecord.version,
  cloudVersion: cloudRecord.version,
  cloudId: cloudRecord.id, // Database row ID for DELETE event matching
  syncError: null,
  syncedToUserId: cloudRecord.user_id, // Track which user owns this synced category
});

// Create context for sync state
const SyncContext = createContext(null);

// Provider component
export function SyncProvider({ children }) {
  const { user } = useAuth();
  const {
    cardStorage,
    updateCategorySyncStatus,
    setCategorySyncEnabled,
    bulkUpdateCategories,
    removeCategory,
    importCategory,
    getLocalDatasources,
    updateDatasourceCloudState,
  } = useCardStorage();
  const { fetchUsage } = useSubscription();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const syncTimeoutRef = useRef(null);
  const datasourceSyncTimeoutRef = useRef(null);
  const pendingCategoriesRef = useRef(new Set());
  const pendingDatasourcesRef = useRef(new Set());
  const initialSyncCheckDoneRef = useRef(false);
  const wasOfflineRef = useRef(!navigator.onLine); // Track previous online state for offline->online detection

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Helper function to check cloud version for a specific category
  // Returns { hasNewer: boolean, cloudVersion: number } or null if no cloud record
  const checkCloudVersion = useCallback(
    async (categoryUuid) => {
      if (!user) return null;

      try {
        const { data: cloudRecord, error } = await supabase
          .from("user_categories")
          .select("version, last_modified")
          .eq("user_id", user.id)
          .eq("uuid", categoryUuid)
          .maybeSingle(); // Use maybeSingle to handle 0 rows without error

        if (error) {
          console.error("Error checking cloud version:", error);
          return null;
        }

        if (!cloudRecord) {
          return null; // No cloud record exists
        }

        return {
          cloudVersion: cloudRecord.version || 1,
          lastModified: cloudRecord.last_modified,
        };
      } catch (err) {
        console.error("Error checking cloud version:", err);
        return null;
      }
    },
    [user]
  );

  // Upload a single category to Supabase
  const uploadCategory = useCallback(
    async (category, skipVersionCheck = false) => {
      if (!user || !category.syncEnabled) {
        return { success: false, error: "Not authenticated or sync not enabled" };
      }

      // Reject local datasources - they should use uploadLocalDatasource instead
      if (category.type === "local-datasource") {
        console.warn("uploadCategory called with local-datasource - use uploadLocalDatasource instead");
        return { success: false, error: "Use uploadLocalDatasource for local datasources" };
      }

      try {
        updateCategorySyncStatus(category.uuid, "syncing");

        // Check if cloud has newer version before uploading (defensive layer)
        // Skip this check when explicitly requested (e.g., after conflict resolution)
        if (!skipVersionCheck) {
          const cloudInfo = await checkCloudVersion(category.uuid);
          if (cloudInfo) {
            const lastSyncedCloudVersion = category.cloudVersion || 0;

            if (cloudInfo.cloudVersion > lastSyncedCloudVersion) {
              // Cloud has changes we don't know about - trigger conflict check
              console.log(
                `[Sync] Cloud has newer version (${cloudInfo.cloudVersion}) than our last sync (${lastSyncedCloudVersion})`
              );
              updateCategorySyncStatus(category.uuid, "conflict", {
                syncError: "Cloud has newer changes",
              });

              return {
                success: false,
                error: "conflict_detected",
                message: "Cloud has newer changes that need to be resolved first",
              };
            }
          }
        }

        const { data, error } = await supabase
          .from("user_categories")
          .upsert(
            {
              user_id: user.id,
              uuid: category.uuid,
              name: category.name,
              type: category.type || "category",
              parent_id: category.parentId || null,
              cards: category.cards || [],
              closed: category.closed || false,
              version: category.localVersion || 1,
              last_modified: new Date().toISOString(),
              device_id: getDeviceId(),
            },
            {
              onConflict: "user_id,uuid",
            }
          )
          .select("id")
          .single();

        if (error) {
          console.error("Sync upload error:", error);

          // Check for subscription limit error from database trigger
          const limitError = parseSubscriptionLimitError(error.message);
          if (limitError) {
            const errorMsg = `Category limit reached (${limitError.current}/${limitError.limit})`;
            updateCategorySyncStatus(category.uuid, "error", {
              syncError: errorMsg,
            });
            return {
              success: false,
              error: "limit_exceeded",
              limitDetails: limitError,
            };
          }

          updateCategorySyncStatus(category.uuid, "error", {
            syncError: error.message,
          });
          return { success: false, error: error.message };
        }

        // Update sync status to synced, including the cloud row ID for realtime matching
        updateCategorySyncStatus(category.uuid, "synced", {
          lastSyncedAt: new Date().toISOString(),
          cloudVersion: category.localVersion,
          cloudId: data?.id, // Store database row ID for DELETE event matching
          syncError: null,
        });

        return { success: true };
      } catch (err) {
        console.error("Sync upload exception:", err);
        updateCategorySyncStatus(category.uuid, "error", {
          syncError: err.message,
        });
        return { success: false, error: err.message };
      }
    },
    [user, updateCategorySyncStatus, checkCloudVersion]
  );

  // Download all categories from cloud for the current user
  const downloadCategories = useCallback(async () => {
    if (!user) {
      return { success: false, error: "Not authenticated", data: [] };
    }

    try {
      const { data, error } = await supabase.from("user_categories").select("*").eq("user_id", user.id);

      if (error) {
        console.error("Download categories error:", error);
        return { success: false, error: error.message, data: [] };
      }

      // Transform cloud data to local format
      const cloudCategories = (data || []).map((cloudCat) => transformCloudToLocal(cloudCat));

      return { success: true, data: cloudCategories };
    } catch (err) {
      console.error("Download categories exception:", err);
      return { success: false, error: err.message, data: [] };
    }
  }, [user]);

  // Download all local datasources from cloud for the current user
  const downloadLocalDatasources = useCallback(async () => {
    if (!user) {
      return { success: false, error: "Not authenticated", data: [] };
    }

    try {
      // Fetch datasources that are uploaded (not deleted)
      const { data, error } = await supabase
        .from("user_datasources")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_uploaded", true)
        .eq("deleted", false);

      if (error) {
        console.error("Download datasources error:", error);
        return { success: false, error: error.message, data: [] };
      }

      // Transform cloud data to local datasource format
      const cloudDatasources = (data || []).map((cloudDs) => {
        // Cards are stored in typed arrays (datasheets, stratagems, etc.) within the faction
        const editData = cloudDs.edit_data || {};
        const publishedData = cloudDs.data || [];
        // Try edit_data first (for synced datasources), then published data
        const dataArray = Array.isArray(editData.data) ? editData.data : Array.isArray(publishedData) ? publishedData : [];
        // Extract cards from all typed arrays back into a flat array for local editing
        const faction = dataArray[0] || {};
        const cards = extractCardsFromFaction(faction);

        return {
          uuid: cloudDs.datasource_id, // Use datasource_id as local uuid
          name: cloudDs.name,
          type: "local-datasource",
          cards,
          closed: false, // Default to expanded
          // Sync fields
          syncEnabled: true,
          syncStatus: "synced",
          lastSyncedAt: cloudDs.last_edit_sync || cloudDs.updated_at,
          localVersion: cloudDs.edit_version || 1,
          cloudVersion: cloudDs.edit_version || 1,
          syncError: null,
          syncedToUserId: user.id,
          cloudId: cloudDs.id, // Database UUID
          // Datasource metadata
          datasourceId: cloudDs.datasource_id,
          version: cloudDs.version || "1.0.0",
          author: cloudDs.author_name,
          displayFormat: cloudDs.display_format,
          colours: editData.colours || { header: "#1a1a1a", banner: "#4a4a4a" },
          // Publishing state
          isUploaded: true,
          isPublished: cloudDs.is_public || false,
          shareCode: cloudDs.share_code,
          publishedVersion: cloudDs.version_number,
        };
      });

      return { success: true, data: cloudDatasources };
    } catch (err) {
      console.error("Download datasources exception:", err);
      return { success: false, error: err.message, data: [] };
    }
  }, [user]);

  // Sync datasources from cloud on login (merge with local)
  const syncDatasourcesFromCloud = useCallback(async () => {
    if (!user) return { success: false };

    console.log("[Sync] Starting datasource sync from cloud...");
    const { success, data: cloudDatasources } = await downloadLocalDatasources();
    if (!success || !cloudDatasources.length) {
      console.log("[Sync] No cloud datasources found or download failed");
      return { success, imported: 0 };
    }

    console.log(`[Sync] Found ${cloudDatasources.length} datasources in cloud`);

    // Get current local datasources
    const localDatasources = cardStorage.categories.filter((cat) => cat.type === "local-datasource");
    console.log(`[Sync] Found ${localDatasources.length} local datasources`);

    // Find datasources that exist in cloud but not locally
    const newDatasources = cloudDatasources.filter((cloudDs) => {
      const match = localDatasources.some(
        (localDs) =>
          localDs.uuid === cloudDs.uuid ||
          localDs.cloudId === cloudDs.cloudId ||
          localDs.datasourceId === cloudDs.datasourceId
      );
      if (!match) {
        console.log(
          `[Sync] Cloud datasource "${cloudDs.name}" (uuid: ${cloudDs.uuid}, cloudId: ${cloudDs.cloudId}) not found locally`
        );
      }
      return !match;
    });

    // Find datasources that exist both locally and in cloud (may need update)
    const existingDatasources = cloudDatasources.filter((cloudDs) =>
      localDatasources.some(
        (localDs) =>
          localDs.uuid === cloudDs.uuid ||
          localDs.cloudId === cloudDs.cloudId ||
          localDs.datasourceId === cloudDs.datasourceId
      )
    );

    if (newDatasources.length > 0) {
      // Import new datasources from cloud - bulkUpdateCategories expects an array
      bulkUpdateCategories(newDatasources);
      console.log(`[Sync] Imported ${newDatasources.length} datasources from cloud`);
    }

    // Update existing datasources if cloud version is newer
    const datasourcesToUpdate = [];
    for (const cloudDs of existingDatasources) {
      const localDs = localDatasources.find(
        (ds) => ds.uuid === cloudDs.uuid || ds.cloudId === cloudDs.cloudId || ds.datasourceId === cloudDs.datasourceId
      );
      if (localDs && (cloudDs.cloudVersion || 0) > (localDs.localVersion || 0)) {
        // Cloud is newer, prepare update with local UUID preserved
        datasourcesToUpdate.push({
          ...cloudDs,
          uuid: localDs.uuid, // Keep local UUID for matching
        });
        console.log(`[Sync] Will update datasource "${cloudDs.name}" from cloud`);
      }
    }

    if (datasourcesToUpdate.length > 0) {
      bulkUpdateCategories(datasourcesToUpdate);
      console.log(`[Sync] Updated ${datasourcesToUpdate.length} datasources from cloud`);
    }

    return { success: true, imported: newDatasources.length, updated: existingDatasources.length };
  }, [user, downloadLocalDatasources, cardStorage.categories, bulkUpdateCategories]);

  // Enable sync for a category (uploads it to cloud)
  // Note: For local datasources, this just marks them as sync-enabled
  // The actual upload happens via uploadLocalDatasource through auto-sync
  const enableSync = useCallback(
    async (categoryUuid, forceOverride = false) => {
      if (!user) {
        message.error("Please sign in to enable cloud sync");
        return { success: false, error: "Not authenticated" };
      }

      const category = cardStorage.categories.find((cat) => cat.uuid === categoryUuid);
      if (!category) {
        return { success: false, error: "Category not found" };
      }

      // Handle local datasources differently - they sync to user_datasources
      if (category.type === "local-datasource") {
        // Just mark as pending - the auto-sync will handle the upload
        updateDatasourceCloudState(categoryUuid, {
          syncEnabled: true,
          syncStatus: "pending",
        });
        message.info("Datasource will be uploaded shortly...");
        return { success: true };
      }

      // Check if this category was previously synced to a different user
      // (unless forceOverride is true, meaning user confirmed the claim)
      if (!forceOverride && category.syncedToUserId && category.syncedToUserId !== user.id) {
        return {
          success: false,
          error: "owned_by_other_user",
          requiresConfirmation: true,
          categoryName: category.name,
        };
      }

      const version = category.localVersion || 1;

      // First mark as sync enabled and set initial cloudVersion to prevent false conflicts
      // Pass user.id to track which user this category is synced to
      setCategorySyncEnabled(categoryUuid, true, user.id);
      updateCategorySyncStatus(categoryUuid, "syncing", {
        cloudVersion: version, // Set cloudVersion = localVersion to prevent false conflict detection
        syncedToUserId: user.id, // Ensure user ID is set
      });

      // Then upload to cloud
      const result = await uploadCategory({
        ...category,
        syncEnabled: true,
        localVersion: version,
        syncedToUserId: user.id,
      });

      if (result.success) {
        message.success(`"${category.name}" is now synced to cloud`);
        // Refresh usage counts in the UI
        fetchUsage();
      } else {
        message.error(`Failed to sync "${category.name}": ${result.error}`);
      }

      return result;
    },
    [
      user,
      cardStorage.categories,
      setCategorySyncEnabled,
      updateCategorySyncStatus,
      uploadCategory,
      updateDatasourceCloudState,
      fetchUsage,
    ]
  );

  // Disable sync for a category
  const disableSync = useCallback(
    async (categoryUuid, deleteFromCloud = false) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      const category = cardStorage.categories.find((cat) => cat.uuid === categoryUuid);
      if (!category) {
        return { success: false, error: "Category not found" };
      }

      try {
        if (deleteFromCloud) {
          const { error } = await supabase
            .from("user_categories")
            .delete()
            .eq("user_id", user.id)
            .eq("uuid", categoryUuid);

          if (error) {
            console.error("Delete from cloud error:", error);
            message.error(`Failed to delete from cloud: ${error.message}`);
            return { success: false, error: error.message };
          }
        }

        setCategorySyncEnabled(categoryUuid, false);
        message.success(`"${category.name}" is now local only`);
        // Refresh usage counts in the UI
        if (deleteFromCloud) {
          fetchUsage();
        }
        return { success: true };
      } catch (err) {
        console.error("Disable sync exception:", err);
        return { success: false, error: err.message };
      }
    },
    [user, cardStorage.categories, setCategorySyncEnabled, fetchUsage]
  );

  // Sync all pending categories
  const syncAll = useCallback(async () => {
    if (!user || !isOnline) {
      return { success: false, error: "Not authenticated or offline" };
    }

    // Filter out local datasources - they sync to user_datasources, not user_categories
    const pendingCategories = cardStorage.categories.filter(
      (cat) => cat.syncEnabled && cat.syncStatus === "pending" && cat.type !== "local-datasource"
    );

    if (pendingCategories.length === 0) {
      return { success: true, synced: 0 };
    }

    setIsSyncing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const category of pendingCategories) {
      const result = await uploadCategory(category);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    // Update sync metadata
    await supabase
      .from("sync_metadata")
      .update({
        last_sync_at: new Date().toISOString(),
        device_id: getDeviceId(),
      })
      .eq("user_id", user.id);

    setLastSyncTime(new Date());
    setIsSyncing(false);

    if (errorCount > 0) {
      message.warning(`Synced ${successCount} categories, ${errorCount} failed`);
    } else if (successCount > 0) {
      message.success(`Synced ${successCount} categories`);
    }

    return { success: errorCount === 0, synced: successCount, failed: errorCount };
  }, [user, isOnline, cardStorage.categories, uploadCategory]);

  // Check for conflicts between local and cloud versions
  const checkConflicts = useCallback(async () => {
    if (!user) {
      return { success: false, conflicts: [] };
    }

    const { success, data: cloudCategories } = await downloadCategories();
    if (!success) {
      return { success: false, conflicts: [] };
    }

    const newConflicts = [];

    // Only consider local categories that belong to THIS user (or have no syncedToUserId for backwards compat)
    // Exclude local datasources - they sync to user_datasources, not user_categories
    const localCategoriesForCurrentUser = cardStorage.categories.filter(
      (cat) => cat.type !== "local-datasource" && (!cat.syncedToUserId || cat.syncedToUserId === user.id)
    );

    for (const cloudCat of cloudCategories) {
      const localCat = localCategoriesForCurrentUser.find((cat) => cat.uuid === cloudCat.uuid);

      // Skip categories that are currently syncing to avoid false positives
      if (localCat && localCat.syncEnabled && localCat.syncStatus !== "syncing") {
        // Both exist - check versions
        const localVersion = localCat.localVersion || 1;
        const cloudVersion = cloudCat.cloudVersion || 1;
        const lastSyncedCloudVersion = localCat.cloudVersion || 0;

        // Conflict: cloud has newer version than what we last synced, AND we have local changes
        if (cloudVersion > lastSyncedCloudVersion && localVersion > lastSyncedCloudVersion) {
          newConflicts.push({
            uuid: cloudCat.uuid,
            name: localCat.name,
            localCategory: localCat,
            cloudCategory: cloudCat,
            localVersion,
            cloudVersion,
          });

          updateCategorySyncStatus(localCat.uuid, "conflict");
        } else if (cloudVersion > localVersion) {
          // Cloud is newer, no local changes - auto-update from cloud
          bulkUpdateCategories([cloudCat]);
        } else if (localCat.syncStatus === "conflict") {
          // No conflict detected but status was conflict - reset to synced
          updateCategorySyncStatus(localCat.uuid, "synced");
        }
      } else if (!localCat) {
        // Category exists in cloud but not locally - import it
        bulkUpdateCategories([cloudCat]);
      }
    }

    // Check for local synced categories that no longer exist in cloud
    // This handles the case where another device deleted the category from cloud
    // CRITICAL: Only check categories that are synced to THIS user to avoid false "deleted" conflicts
    // when switching between accounts on the same device
    // Exclude local datasources - they sync to user_datasources, not user_categories
    const cloudUuids = new Set(cloudCategories.map((c) => c.uuid));
    const localSyncedCategories = cardStorage.categories.filter(
      (c) =>
        c.type !== "local-datasource" &&
        c.syncEnabled &&
        c.syncStatus !== "syncing" &&
        // Only check categories synced to current user (or with no syncedToUserId for backwards compat)
        (!c.syncedToUserId || c.syncedToUserId === user.id)
    );

    for (const localCat of localSyncedCategories) {
      if (!cloudUuids.has(localCat.uuid)) {
        newConflicts.push({
          uuid: localCat.uuid,
          name: localCat.name,
          localCategory: localCat,
          cloudCategory: null,
          localVersion: localCat.localVersion,
          cloudVersion: null,
          type: "deleted_from_cloud",
        });
        updateCategorySyncStatus(localCat.uuid, "conflict");
      }
    }

    setConflicts(newConflicts);
    return { success: true, conflicts: newConflicts };
  }, [user, downloadCategories, cardStorage.categories, updateCategorySyncStatus, bulkUpdateCategories]);

  // Resolve a conflict by choosing a version
  const resolveConflict = useCallback(
    async (categoryUuid, choice) => {
      const conflict = conflicts.find((c) => c.uuid === categoryUuid);
      if (!conflict) {
        return { success: false, error: "Conflict not found" };
      }

      if (choice === "local") {
        // Keep local, upload to cloud (overwrites cloud)
        // Skip version check since we're intentionally resolving a conflict
        const result = await uploadCategory(
          {
            ...conflict.localCategory,
            localVersion: Math.max(conflict.localVersion, conflict.cloudVersion || 0) + 1,
          },
          true // skipVersionCheck - we've already resolved the conflict
        );
        if (result.success) {
          setConflicts((prev) => prev.filter((c) => c.uuid !== categoryUuid));
        }
        return result;
      } else if (choice === "cloud") {
        // Keep cloud version
        bulkUpdateCategories([conflict.cloudCategory]);
        setConflicts((prev) => prev.filter((c) => c.uuid !== categoryUuid));
        return { success: true };
      } else if (choice === "both") {
        // Keep both - create a copy of local with new UUID
        const { v4: uuidv4 } = await import("uuid");
        const localCopy = {
          ...conflict.localCategory,
          uuid: uuidv4(),
          name: `${conflict.localCategory.name} (Local Copy)`,
          syncEnabled: false,
          syncStatus: "local",
          cloudVersion: null,
          cloudId: null,
          syncedToUserId: null,
        };

        // Update the original category with cloud version (keeps sync enabled)
        bulkUpdateCategories([conflict.cloudCategory]);

        // Add the local copy as a new local-only category
        importCategory(localCopy);

        setConflicts((prev) => prev.filter((c) => c.uuid !== categoryUuid));
        message.success(`Kept cloud version and created "${localCopy.name}"`);

        return { success: true, localCopy };
      } else if (choice === "keep_local") {
        // For deleted_from_cloud: Keep local copy but stop syncing
        setCategorySyncEnabled(conflict.uuid, false);
        setConflicts((prev) => prev.filter((c) => c.uuid !== categoryUuid));
        message.success(`"${conflict.name}" is now local only`);
        return { success: true };
      } else if (choice === "delete_local") {
        // For deleted_from_cloud: Delete local copy too
        removeCategory(conflict.uuid);
        setConflicts((prev) => prev.filter((c) => c.uuid !== categoryUuid));
        message.success(`"${conflict.name}" has been deleted`);
        return { success: true };
      }

      return { success: false, error: "Invalid choice" };
    },
    [conflicts, uploadCategory, bulkUpdateCategories, setCategorySyncEnabled, removeCategory, importCategory]
  );

  // Delete a category from cloud
  const deleteFromCloud = useCallback(
    async (categoryUuid) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { error } = await supabase
          .from("user_categories")
          .delete()
          .eq("user_id", user.id)
          .eq("uuid", categoryUuid);

        if (error) {
          console.error("Delete from cloud error:", error);
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err) {
        console.error("Delete from cloud exception:", err);
        return { success: false, error: err.message };
      }
    },
    [user]
  );

  // =============================================
  // LOCAL DATASOURCE SYNC FUNCTIONS
  // =============================================

  // Convert local datasource to export JSON format for cloud storage
  // Uses standard format: data is an array of factions (single faction for local datasources)
  // Cards are organized by type (datasheets, stratagems, etc.) using mapCardsToFactionStructure
  const datasourceToExportFormat = (datasource) => {
    // Use helper to organize cards by type (datasheets, stratagems, warscrolls, etc.)
    const faction = mapCardsToFactionStructure(datasource.cards || [], {
      id: "default",
      name: datasource.name,
      colours: datasource.colours || { header: "#1a1a1a", banner: "#4a4a4a" },
    });

    return {
      name: datasource.name,
      datasource_id: datasource.datasourceId || datasource.uuid,
      version: datasource.version || "1.0.0",
      author: datasource.author || "",
      display_format: datasource.displayFormat || "basic",
      colours: datasource.colours || { header: "#1a1a1a", banner: "#4a4a4a" },
      // data is an array of factions - local datasources have a single faction
      data: [faction],
    };
  };

  // Upload a local datasource to user_datasources.edit_data
  const uploadLocalDatasource = useCallback(
    async (datasource) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      if (!datasource.syncEnabled) {
        return { success: false, error: "Sync not enabled for this datasource" };
      }

      try {
        // Update local state to syncing
        updateDatasourceCloudState(datasource.uuid, { syncStatus: "syncing" });

        // Convert to export format
        const editData = datasourceToExportFormat(datasource);

        // Check if this datasource already exists in cloud
        const existingCloudId = datasource.cloudId;

        if (existingCloudId) {
          // Update existing record
          const { data, error } = await supabase
            .from("user_datasources")
            .update({
              name: datasource.name,
              edit_data: editData,
              edit_version: (datasource.editVersion || 0) + 1,
              last_edit_sync: new Date().toISOString(),
            })
            .eq("id", existingCloudId)
            .eq("user_id", user.id)
            .select("id")
            .single();

          if (error) {
            console.error("Datasource sync update error:", error);
            updateDatasourceCloudState(datasource.uuid, {
              syncStatus: "error",
              syncError: error.message,
            });
            return { success: false, error: error.message };
          }

          // Update local state
          updateDatasourceCloudState(datasource.uuid, {
            syncStatus: "synced",
            syncError: null,
            lastSyncedAt: new Date().toISOString(),
            isUploaded: true,
            editVersion: (datasource.editVersion || 0) + 1,
          });

          return { success: true, cloudId: data.id };
        } else {
          // Insert new record
          // Note: 'data' column is for the published version, but has NOT NULL constraint
          // We use editData as initial value; it gets replaced when publishing
          const { data, error } = await supabase
            .from("user_datasources")
            .insert({
              user_id: user.id,
              name: datasource.name,
              datasource_id: datasource.datasourceId || datasource.uuid,
              version_number: 1,
              edit_data: editData,
              edit_version: 1,
              last_edit_sync: new Date().toISOString(),
              is_uploaded: true,
              is_public: false,
              data: editData, // Use editData as initial value (NOT NULL constraint)
            })
            .select("id")
            .single();

          if (error) {
            console.error("Datasource sync insert error:", error);

            // Check for subscription limit error
            const limitError = parseSubscriptionLimitError(error.message);
            if (limitError) {
              const errorMsg = `Datasource limit reached (${limitError.current}/${limitError.limit})`;
              updateDatasourceCloudState(datasource.uuid, {
                syncStatus: "error",
                syncError: errorMsg,
              });
              return {
                success: false,
                error: "limit_exceeded",
                limitDetails: limitError,
              };
            }

            updateDatasourceCloudState(datasource.uuid, {
              syncStatus: "error",
              syncError: error.message,
            });
            return { success: false, error: error.message };
          }

          // Update local state with cloud ID
          updateDatasourceCloudState(datasource.uuid, {
            syncStatus: "synced",
            syncError: null,
            lastSyncedAt: new Date().toISOString(),
            isUploaded: true,
            cloudId: data.id,
            editVersion: 1,
          });

          message.success(`"${datasource.name}" uploaded to cloud`);
          // Refresh usage counts in the UI (new datasource added)
          fetchUsage();
          return { success: true, cloudId: data.id };
        }
      } catch (err) {
        console.error("Datasource upload exception:", err);
        updateDatasourceCloudState(datasource.uuid, {
          syncStatus: "error",
          syncError: err.message,
        });
        return { success: false, error: err.message };
      }
    },
    [user, updateDatasourceCloudState, fetchUsage]
  );

  // Sync all pending local datasources
  const syncAllDatasources = useCallback(async () => {
    if (!user || !isOnline) {
      return { success: false, error: "Not authenticated or offline" };
    }

    const localDatasources = getLocalDatasources();
    const pendingDatasources = localDatasources.filter((ds) => ds.syncEnabled && ds.syncStatus === "pending");

    if (pendingDatasources.length === 0) {
      return { success: true, synced: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const datasource of pendingDatasources) {
      const result = await uploadLocalDatasource(datasource);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (errorCount > 0) {
      message.warning(`Synced ${successCount} datasources, ${errorCount} failed`);
    } else if (successCount > 0) {
      message.success(`Synced ${successCount} datasources`);
    }

    return { success: errorCount === 0, synced: successCount, failed: errorCount };
  }, [user, isOnline, getLocalDatasources, uploadLocalDatasource]);

  // Delete a local datasource from cloud
  const deleteLocalDatasourceFromCloud = useCallback(
    async (datasource) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      const cloudId = datasource.cloudId || datasource.id;
      if (!cloudId) {
        return { success: false, error: "No cloud ID found" };
      }

      try {
        // Use RPC function for soft delete (sets deleted=true server-side)
        const { data, error } = await supabase.rpc("delete_local_datasource", {
          p_datasource_db_id: cloudId,
        });

        if (error) {
          console.error("Delete datasource from cloud error:", error);
          return { success: false, error: error.message };
        }

        if (!data?.success) {
          return { success: false, error: data?.error || "Delete failed" };
        }

        // Refresh usage counts in the UI (datasource removed)
        fetchUsage();
        return { success: true, removedSubscriptions: data.removed_subscriptions };
      } catch (err) {
        console.error("Delete datasource from cloud exception:", err);
        return { success: false, error: err.message };
      }
    },
    [user, fetchUsage]
  );

  // Auto-sync effect: watch for pending categories and sync after debounce
  useEffect(() => {
    if (!user || !isOnline) return;

    // Filter out local datasources - they sync to user_datasources, not user_categories
    const pendingCategories = cardStorage.categories.filter(
      (cat) => cat.syncEnabled && cat.syncStatus === "pending" && cat.type !== "local-datasource"
    );

    // Track which categories are pending
    const currentPending = new Set(pendingCategories.map((c) => c.uuid));

    // If there are new pending categories, reset the debounce timer
    const hasNewPending = [...currentPending].some((uuid) => !pendingCategoriesRef.current.has(uuid));

    if (hasNewPending && pendingCategories.length > 0) {
      // Clear existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Set new timeout for auto-sync
      syncTimeoutRef.current = setTimeout(() => {
        syncAll();
      }, SYNC_DEBOUNCE_DELAY);
    }

    pendingCategoriesRef.current = currentPending;

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, isOnline, cardStorage.categories, syncAll]);

  // Auto-sync effect: watch for pending datasources and sync after debounce
  useEffect(() => {
    if (!user || !isOnline) return;

    // Filter for local datasources that are pending sync
    const pendingDatasources = cardStorage.categories.filter(
      (cat) => cat.type === "local-datasource" && cat.syncEnabled && cat.syncStatus === "pending"
    );

    // Track which datasources are pending
    const currentPending = new Set(pendingDatasources.map((ds) => ds.uuid));

    // If there are new pending datasources, reset the debounce timer
    const hasNewPending = [...currentPending].some((uuid) => !pendingDatasourcesRef.current.has(uuid));

    if (hasNewPending && pendingDatasources.length > 0) {
      // Clear existing timeout
      if (datasourceSyncTimeoutRef.current) {
        clearTimeout(datasourceSyncTimeoutRef.current);
      }

      // Set new timeout for auto-sync
      datasourceSyncTimeoutRef.current = setTimeout(() => {
        syncAllDatasources();
      }, SYNC_DEBOUNCE_DELAY);
    }

    pendingDatasourcesRef.current = currentPending;

    return () => {
      if (datasourceSyncTimeoutRef.current) {
        clearTimeout(datasourceSyncTimeoutRef.current);
      }
    };
  }, [user, isOnline, cardStorage.categories, syncAllDatasources]);

  // Initial sync check on login - only runs once per session
  useEffect(() => {
    if (user && isOnline && !initialSyncCheckDoneRef.current) {
      initialSyncCheckDoneRef.current = true;
      // Check for conflicts/updates from cloud on login
      checkConflicts();
      // Also sync datasources from cloud (imports any missing datasources)
      syncDatasourcesFromCloud();
    }
    // Reset when user logs out
    if (!user) {
      initialSyncCheckDoneRef.current = false;
    }
  }, [user, isOnline]); // Removed checkConflicts and syncDatasourcesFromCloud from dependencies

  // Offline -> Online recovery: check for conflicts when coming back online
  // This catches changes made by other devices while this browser was offline
  useEffect(() => {
    // Detect transition from offline -> online
    if (isOnline && wasOfflineRef.current && user && initialSyncCheckDoneRef.current) {
      console.log("[Sync] Came back online, checking for conflicts and syncing datasources...");
      checkConflicts();
      syncDatasourcesFromCloud();
    }
    wasOfflineRef.current = !isOnline;
  }, [isOnline, user]); // Removed checkConflicts and syncDatasourcesFromCloud from dependencies to avoid loops

  // Handle realtime changes from other devices
  const handleRealtimeChange = useCallback(
    (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      const deviceId = getDeviceId();

      // Ignore changes from this device
      if (newRecord?.device_id === deviceId) {
        return;
      }

      const recordUuid = newRecord?.uuid || oldRecord?.uuid;
      const recordId = oldRecord?.id; // Database row ID (for DELETE events)

      // Try to find by uuid first, then by cloudId (database row ID) for DELETE events
      let localCat = cardStorage.categories.find((c) => c.uuid === recordUuid);
      if (!localCat && recordId) {
        localCat = cardStorage.categories.find((c) => c.cloudId === recordId);
      }

      // If we found a local category, check if it belongs to a different user
      // This prevents false conflicts when switching accounts on the same device
      if (localCat && localCat.syncedToUserId && localCat.syncedToUserId !== user?.id) {
        // This category belongs to a different user - ignore the realtime event
        return;
      }

      if (eventType === "DELETE") {
        // Category was deleted from cloud by another device
        if (localCat?.syncEnabled) {
          // Add to conflicts for user to decide
          setConflicts((prev) => {
            // Don't add duplicate conflicts
            if (prev.some((c) => c.uuid === localCat.uuid)) return prev;
            return [
              ...prev,
              {
                uuid: localCat.uuid,
                name: localCat.name,
                localCategory: localCat,
                cloudCategory: null,
                localVersion: localCat.localVersion,
                cloudVersion: null,
                type: "deleted_from_cloud",
              },
            ];
          });
          updateCategorySyncStatus(localCat.uuid, "conflict");
        }
        return;
      }

      if (eventType === "INSERT" && !localCat) {
        // New category from another device - import it
        bulkUpdateCategories([transformCloudToLocal(newRecord)]);
        return;
      }

      if (eventType === "UPDATE" && localCat) {
        // Check if we have pending local changes
        const hasLocalPendingChanges = localCat.syncStatus === "pending";

        if (!hasLocalPendingChanges) {
          // No local changes - auto-update from cloud
          bulkUpdateCategories([transformCloudToLocal(newRecord)]);
        } else {
          // We have local changes - check for card-level overlap
          const localCardIds = new Set((localCat.cards || []).map((c) => c.uuid));
          const cloudCardIds = new Set((newRecord.cards || []).map((c) => c.uuid));

          // Check if any cards exist in both (potential conflict)
          const hasOverlap = [...localCardIds].some((id) => cloudCardIds.has(id));

          if (hasOverlap) {
            // Cards overlap - show conflict modal
            setConflicts((prev) => {
              // Don't add duplicate conflicts
              if (prev.some((c) => c.uuid === localCat.uuid)) return prev;
              return [
                ...prev,
                {
                  uuid: localCat.uuid,
                  name: localCat.name,
                  localCategory: localCat,
                  cloudCategory: transformCloudToLocal(newRecord),
                  localVersion: localCat.localVersion,
                  cloudVersion: newRecord.version,
                  type: "realtime_conflict",
                },
              ];
            });
            updateCategorySyncStatus(localCat.uuid, "conflict");
          } else {
            // No card overlap - safe to auto-update (cloud wins for metadata)
            bulkUpdateCategories([transformCloudToLocal(newRecord)]);
          }
        }
      }
    },
    [user, cardStorage.categories, bulkUpdateCategories, updateCategorySyncStatus]
  );

  // Subscribe to realtime changes for user's categories
  useEffect(() => {
    if (!user || !isOnline) return;

    const channel = supabase
      .channel(`user-categories-${user.id}`)
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
  }, [user, isOnline, handleRealtimeChange]);

  // Compute global sync status - include BOTH categories AND datasources
  const syncedCategories = cardStorage.categories.filter((cat) => cat.syncEnabled && cat.type !== "local-datasource");
  const syncedDatasources = cardStorage.categories.filter((cat) => cat.syncEnabled && cat.type === "local-datasource");

  // Combine all synced items for global status calculation
  const allSynced = [...syncedCategories, ...syncedDatasources];
  const pendingCount = allSynced.filter((item) => item.syncStatus === "pending").length;
  const errorCount = allSynced.filter((item) => item.syncStatus === "error").length;
  const conflictCount = conflicts.length;
  const syncingCount = allSynced.filter((item) => item.syncStatus === "syncing").length;

  let globalSyncStatus = "idle";
  if (!isOnline) {
    globalSyncStatus = "offline";
  } else if (syncingCount > 0 || isSyncing) {
    globalSyncStatus = "syncing";
  } else if (conflictCount > 0) {
    globalSyncStatus = "conflict";
  } else if (errorCount > 0) {
    globalSyncStatus = "error";
  } else if (pendingCount > 0) {
    globalSyncStatus = "pending";
  } else if (allSynced.length > 0) {
    globalSyncStatus = "synced";
  }

  const value = {
    // Category Actions
    uploadCategory,
    downloadCategories,
    enableSync,
    disableSync,
    syncAll,
    checkConflicts,
    resolveConflict,
    deleteFromCloud,

    // Local Datasource Actions
    uploadLocalDatasource,
    downloadLocalDatasources,
    syncAllDatasources,
    syncDatasourcesFromCloud,
    deleteLocalDatasourceFromCloud,

    // State
    isSyncing,
    isOnline,
    lastSyncTime,
    conflicts,
    globalSyncStatus,

    // Stats - separate counts for categories and datasources
    syncedCount: allSynced.length,
    syncedCategoryCount: syncedCategories.length,
    syncedDatasourceCount: syncedDatasources.length,
    pendingCount,
    errorCount,
    conflictCount,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

// Hook to use sync context
export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    // Return a safe default if used outside provider (for components that render before provider)
    return {
      // Category Actions
      uploadCategory: () => Promise.resolve({ success: false }),
      downloadCategories: () => Promise.resolve({ success: false, data: [] }),
      enableSync: () => Promise.resolve({ success: false }),
      disableSync: () => Promise.resolve({ success: false }),
      syncAll: () => Promise.resolve({ success: false }),
      checkConflicts: () => Promise.resolve({ success: false, conflicts: [] }),
      resolveConflict: () => Promise.resolve({ success: false }),
      deleteFromCloud: () => Promise.resolve({ success: false }),
      // Local Datasource Actions
      uploadLocalDatasource: () => Promise.resolve({ success: false }),
      downloadLocalDatasources: () => Promise.resolve({ success: false, data: [] }),
      syncAllDatasources: () => Promise.resolve({ success: false }),
      syncDatasourcesFromCloud: () => Promise.resolve({ success: false, imported: 0 }),
      deleteLocalDatasourceFromCloud: () => Promise.resolve({ success: false }),
      // State
      isSyncing: false,
      isOnline: true,
      lastSyncTime: null,
      conflicts: [],
      globalSyncStatus: "idle",
      syncedCount: 0,
      syncedCategoryCount: 0,
      syncedDatasourceCount: 0,
      pendingCount: 0,
      errorCount: 0,
      conflictCount: 0,
    };
  }
  return context;
}
