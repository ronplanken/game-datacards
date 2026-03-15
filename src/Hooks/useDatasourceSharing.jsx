import React, { useState, useEffect, useCallback, useRef, useContext, createContext } from "react";
import { message } from "../Components/Toast/message";
import localForage from "localforage";
import { supabase } from "../config/supabase";
import { useSettingsStorage } from "./useSettingsStorage";
import { validateCustomDatasource } from "../Helpers/customDatasource.helpers";
import { useBrowseState } from "./useBrowseState";
import {
  GAME_SYSTEMS as _GAME_SYSTEMS,
  SORT_OPTIONS as _SORT_OPTIONS,
  createFetchFunction,
  createPublishFunction,
  createUnpublishFunction,
  createPushUpdateFunction,
} from "../Helpers/sharing.helpers";

// Re-export constants for existing consumers
export const GAME_SYSTEMS = _GAME_SYSTEMS;
export const SORT_OPTIONS = _SORT_OPTIONS;

// Create localForage instance for datasource data
var dataStore = localForage.createInstance({
  name: "data",
});

// Create context for datasource sharing state
const DatasourceSharingContext = createContext(null);

// Polling interval for subscription updates (ms)
const SUBSCRIPTION_POLL_INTERVAL = 30000;

// Provider component
export function DatasourceSharingProvider({ children, user = null, canPerformAction = () => true }) {
  const { settings, updateSettings } = useSettingsStorage();

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState([]);
  const [availableUpdates, setAvailableUpdates] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

  // My published datasources state
  const [myDatasources, setMyDatasources] = useState([]);
  const [isLoadingMine, setIsLoadingMine] = useState(false);

  // Upload/publish state
  const [isUploading, setIsUploading] = useState(false);

  // Polling ref
  const pollIntervalRef = useRef(null);

  // Browse state via composable hook
  const {
    publicItems: publicDatasources,
    isLoadingPublic,
    browseFilters,
    setBrowseFilters,
    pagination,
    browsePublic: browsePublicDatasources,
    getFeatured: getFeaturedDatasources,
    getByShareCode: getDatasourceByShareCode,
    updatePublicItem,
  } = useBrowseState({
    supabase,
    browseRpc: "browse_public_datasources",
    featuredRpc: "get_featured_datasources",
    shareCodeRpc: "get_datasource_by_share_code",
    entityLabel: "datasources",
  });

  // ============================================
  // RPC WRAPPERS (via factory functions)
  // ============================================

  const fetchMySubscriptionsRpc = useCallback(
    () => createFetchFunction(supabase, "get_my_subscriptions", "subscriptions")(),
    [],
  );
  const fetchMyDatasourcesRpc = useCallback(
    () => createFetchFunction(supabase, "get_my_datasources", "my datasources")(),
    [],
  );
  const publishDatasourceRpc = useCallback(
    (id, opts) => createPublishFunction(supabase, "publish_datasource", "datasource")(id, opts),
    [],
  );
  const unpublishDatasourceRpc = useCallback(
    (id) => createUnpublishFunction(supabase, "unpublish_datasource", "datasource")(id),
    [],
  );
  const pushDatasourceUpdateRpc = useCallback(
    (id) => createPushUpdateFunction(supabase, "push_datasource_update", "datasource")(id),
    [],
  );

  // ============================================
  // SUBSCRIPTION FUNCTIONS
  // ============================================

  const fetchMySubscriptions = useCallback(async () => {
    if (!user) return [];
    setIsLoadingSubscriptions(true);
    try {
      const data = await fetchMySubscriptionsRpc();
      setSubscriptions(data);
      return data;
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, [user, fetchMySubscriptionsRpc]);

  const subscribeToDatasource = useCallback(
    async (datasourceId) => {
      if (!user) {
        message.error("Please sign in to subscribe");
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { data: result, error } = await supabase.rpc("subscribe_to_datasource", {
          p_datasource_id: datasourceId,
        });

        if (error) {
          console.error("Subscribe error:", error);
          message.error("Failed to subscribe");
          return { success: false, error: error.message };
        }

        if (!result?.success) {
          message.error(result?.error || "Failed to subscribe");
          return { success: false, error: result?.error };
        }

        // Download full datasource data
        const { data: datasource, error: fetchError } = await supabase
          .from("user_datasources")
          .select("*")
          .eq("id", datasourceId)
          .single();

        if (fetchError || !datasource) {
          console.error("Fetch datasource error:", fetchError);
          message.error("Failed to download datasource");
          return { success: false, error: "Failed to download" };
        }

        await importFromSubscription(datasource);
        await fetchMySubscriptions();
        updatePublicItem(datasourceId, { is_subscribed: true });

        message.success(`Subscribed to "${datasource.name}"`);
        return { success: true };
      } catch (err) {
        console.error("Subscribe exception:", err);
        message.error("Failed to subscribe");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMySubscriptions, updatePublicItem],
  );

  const unsubscribeFromDatasource = useCallback(
    async (datasourceId, removeLocal = true) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { data: result, error } = await supabase.rpc("unsubscribe_from_datasource", {
          p_datasource_id: datasourceId,
        });

        if (error) {
          console.error("Unsubscribe error:", error);
          message.error("Failed to unsubscribe");
          return { success: false, error: error.message };
        }

        if (removeLocal) {
          await removeSubscribedDatasource(datasourceId);
        }

        await fetchMySubscriptions();
        updatePublicItem(datasourceId, { is_subscribed: false });
        setAvailableUpdates((prev) => prev.filter((u) => u.datasource_id !== datasourceId));

        message.success("Unsubscribed successfully");
        return { success: true };
      } catch (err) {
        console.error("Unsubscribe exception:", err);
        message.error("Failed to unsubscribe");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMySubscriptions, updatePublicItem],
  );

  const syncSubscription = useCallback(
    async (subscriptionId, datasourceId) => {
      if (!user) return { success: false };

      try {
        const { data: datasource, error: fetchError } = await supabase
          .from("user_datasources")
          .select("*")
          .eq("id", datasourceId)
          .single();

        if (fetchError || !datasource) {
          console.error("Fetch datasource error:", fetchError);
          return { success: false, error: "Failed to fetch" };
        }

        await updateSubscribedDatasource(datasource);

        const { error: markError } = await supabase.rpc("mark_subscription_synced", {
          p_subscription_id: subscriptionId,
          p_version: datasource.version_number,
        });

        if (markError) {
          console.error("Mark synced error:", markError);
        }

        setAvailableUpdates((prev) => prev.filter((u) => u.subscription_id !== subscriptionId));
        await fetchMySubscriptions();

        message.success(`Updated "${datasource.name}"`);
        return { success: true };
      } catch (err) {
        console.error("Sync subscription exception:", err);
        return { success: false, error: err.message };
      }
    },
    [user, fetchMySubscriptions],
  );

  const syncAllSubscriptions = useCallback(async () => {
    for (const update of availableUpdates) {
      await syncSubscription(update.subscription_id, update.datasource_id);
    }
  }, [availableUpdates, syncSubscription]);

  // ============================================
  // LOCAL STORAGE FUNCTIONS
  // ============================================

  const importFromSubscription = useCallback(
    async (subscriptionData) => {
      const { id, name, data, version, version_number, author_name, user_id } = subscriptionData;

      const localId = `subscribed-${id}`;
      const prepared = { ...data, id: localId };
      await dataStore.setItem(localId, prepared);

      const cardCount = (data.data || []).reduce((sum, faction) => {
        const cards = faction?.datasheets?.length || faction?.units?.length || faction?.cards?.length || 0;
        return sum + cards;
      }, 0);

      const registryEntry = {
        id: localId,
        name,
        cardCount,
        sourceType: "subscription",
        version,
        author: author_name,
        lastUpdated: new Date().toISOString(),
        cloudId: id,
        isSubscribed: true,
        authorId: user_id,
        authorName: author_name,
        lastCloudVersion: version_number,
        isReadOnly: true,
      };

      const currentCustomDatasources = settings.customDatasources || [];
      const existingIndex = currentCustomDatasources.findIndex((ds) => ds.cloudId === id);
      let updatedDatasources;

      if (existingIndex >= 0) {
        updatedDatasources = [...currentCustomDatasources];
        updatedDatasources[existingIndex] = registryEntry;
      } else {
        updatedDatasources = [...currentCustomDatasources, registryEntry];
      }

      updateSettings({ ...settings, customDatasources: updatedDatasources });
    },
    [settings, updateSettings],
  );

  const updateSubscribedDatasource = useCallback(
    async (subscriptionData) => {
      const localId = `subscribed-${subscriptionData.id}`;
      await dataStore.setItem(localId, { ...subscriptionData.data, id: localId });

      const updated = (settings.customDatasources || []).map((ds) =>
        ds.cloudId === subscriptionData.id
          ? {
              ...ds,
              version: subscriptionData.version,
              lastCloudVersion: subscriptionData.version_number,
              lastUpdated: new Date().toISOString(),
            }
          : ds,
      );

      updateSettings({ ...settings, customDatasources: updated });
    },
    [settings, updateSettings],
  );

  const removeSubscribedDatasource = useCallback(
    async (cloudId) => {
      const entry = (settings.customDatasources || []).find((ds) => ds.cloudId === cloudId);
      if (!entry) return;

      await dataStore.removeItem(entry.id);

      updateSettings({
        ...settings,
        customDatasources: (settings.customDatasources || []).filter((ds) => ds.cloudId !== cloudId),
        selectedDataSource: settings.selectedDataSource === entry.id ? "basic" : settings.selectedDataSource,
      });
    },
    [settings, updateSettings],
  );

  const getSubscribedDatasources = useCallback(() => {
    return (settings.customDatasources || []).filter((ds) => ds.isSubscribed);
  }, [settings.customDatasources]);

  // ============================================
  // PUBLISHING FUNCTIONS
  // ============================================

  const fetchMyDatasources = useCallback(async () => {
    if (!user) return [];
    setIsLoadingMine(true);
    try {
      const data = await fetchMyDatasourcesRpc();
      setMyDatasources(data);
      return data;
    } finally {
      setIsLoadingMine(false);
    }
  }, [user, fetchMyDatasourcesRpc]);

  const uploadDatasource = useCallback(
    async (datasourceData, metadata) => {
      if (!user) {
        message.error("Please sign in to upload");
        return { success: false, error: "Not authenticated" };
      }

      if (!canPerformAction("upload_datasource")) {
        message.error("Upgrade your subscription to upload datasources");
        return { success: false, error: "Subscription required" };
      }

      const validation = validateCustomDatasource(datasourceData);
      if (!validation.isValid) {
        message.error(`Invalid datasource: ${validation.errors.join(", ")}`);
        return { success: false, error: validation.errors.join(", ") };
      }

      setIsUploading(true);
      try {
        const { name, version, authorName, displayFormat } = metadata;

        const { data, error } = await supabase.rpc("upsert_datasource", {
          p_datasource_id: datasourceData.id || `ds-${Date.now()}`,
          p_name: name,
          p_data: datasourceData,
          p_version: version || "1.0.0",
          p_author_name: authorName || user.email?.split("@")[0] || "Anonymous",
          p_display_format: displayFormat,
        });

        if (error) {
          console.error("Upload error:", error);
          message.error("Failed to upload datasource");
          return { success: false, error: error.message };
        }

        if (!data?.success) {
          message.error(data?.error || "Failed to upload datasource");
          return { success: false, error: data?.error };
        }

        const updatedDatasources = (settings.customDatasources || []).map((ds) =>
          ds.id === datasourceData.id ? { ...ds, cloudId: data.id, isUploaded: true } : ds,
        );

        updateSettings({ ...settings, customDatasources: updatedDatasources });
        await fetchMyDatasources();

        if (data.restored) {
          message.success("Datasource restored from cloud");
        } else {
          message.success("Datasource uploaded to cloud");
        }
        return { success: true, cloudId: data.id };
      } catch (err) {
        console.error("Upload exception:", err);
        message.error("Failed to upload datasource");
        return { success: false, error: err.message };
      } finally {
        setIsUploading(false);
      }
    },
    [user, canPerformAction, settings, updateSettings, fetchMyDatasources],
  );

  const publishDatasource = useCallback(
    async (datasourceDbId, options = {}) => {
      if (!user) return { success: false, error: "Not authenticated" };
      const result = await publishDatasourceRpc(datasourceDbId, options);
      if (result.success) {
        await fetchMyDatasources();
        message.success("Datasource published! Share code: " + result.shareCode);
      }
      return result;
    },
    [user, publishDatasourceRpc, fetchMyDatasources],
  );

  const unpublishDatasource = useCallback(
    async (datasourceDbId) => {
      if (!user) return { success: false, error: "Not authenticated" };
      const result = await unpublishDatasourceRpc(datasourceDbId);
      if (result.success) {
        await fetchMyDatasources();
        message.success("Datasource is now private");
      }
      return result;
    },
    [user, unpublishDatasourceRpc, fetchMyDatasources],
  );

  const updatePublishedDatasource = useCallback(
    async (datasourceDbId, newData) => {
      if (!user) return { success: false, error: "Not authenticated" };

      try {
        const { data: result, error } = await supabase.rpc("update_published_datasource", {
          p_datasource_db_id: datasourceDbId,
          p_data: newData,
          p_version: newData.version || "1.0.0",
        });

        if (error) {
          console.error("Update published error:", error);
          message.error("Failed to update datasource");
          return { success: false, error: error.message };
        }

        if (!result?.success) {
          message.error(result?.error || "Failed to update");
          return { success: false, error: result?.error };
        }

        await fetchMyDatasources();
        message.success("Datasource updated");
        return { success: true, newVersion: result.new_version_number };
      } catch (err) {
        console.error("Update published exception:", err);
        message.error("Failed to update datasource");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMyDatasources],
  );

  const publishLocalDatasource = useCallback(
    async (cloudId, options = {}) => {
      if (!user) return { success: false, error: "Not authenticated" };

      try {
        const { description, gameSystem } = options;

        const { data: result, error } = await supabase.rpc("publish_local_datasource", {
          p_datasource_db_id: cloudId,
          p_description: description || null,
          p_game_system: gameSystem || null,
        });

        if (error) {
          console.error("Publish local datasource error:", error);
          message.error("Failed to publish datasource");
          return { success: false, error: error.message };
        }

        if (!result?.success) {
          message.error(result?.error || "Failed to publish");
          return { success: false, error: result?.error };
        }

        await fetchMyDatasources();
        message.success("Datasource published! Share code: " + result.share_code);
        return { success: true, shareCode: result.share_code, versionNumber: result.version_number };
      } catch (err) {
        console.error("Publish local datasource exception:", err);
        message.error("Failed to publish datasource");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMyDatasources],
  );

  const pushDatasourceUpdate = useCallback(
    async (cloudId) => {
      if (!user) return { success: false, error: "Not authenticated" };
      const result = await pushDatasourceUpdateRpc(cloudId);
      if (result.success) {
        await fetchMyDatasources();
        message.success(`Update pushed (version ${result.newVersionNumber})`);
      }
      return result;
    },
    [user, pushDatasourceUpdateRpc, fetchMyDatasources],
  );

  const deleteDatasource = useCallback(
    async (datasourceDbId) => {
      if (!user) return { success: false, error: "Not authenticated" };

      try {
        const { data, error } = await supabase.rpc("delete_local_datasource", {
          p_datasource_db_id: datasourceDbId,
        });

        if (error) {
          console.error("Delete datasource error:", error);
          message.error("Failed to delete datasource");
          return { success: false, error: error.message };
        }

        if (!data?.success) {
          message.error(data?.error || "Failed to delete datasource");
          return { success: false, error: data?.error };
        }

        const updatedDatasources = (settings.customDatasources || []).map((ds) =>
          ds.cloudId === datasourceDbId ? { ...ds, cloudId: null, isUploaded: false } : ds,
        );

        updateSettings({ ...settings, customDatasources: updatedDatasources });
        await fetchMyDatasources();

        message.success("Datasource deleted from cloud");
        return { success: true };
      } catch (err) {
        console.error("Delete datasource exception:", err);
        message.error("Failed to delete datasource");
        return { success: false, error: err.message };
      }
    },
    [user, settings, updateSettings, fetchMyDatasources],
  );

  // ============================================
  // POLLING FOR SUBSCRIPTION UPDATES
  // ============================================

  const checkForUpdates = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("get_subscription_updates");

      if (error) {
        console.error("Check subscription updates error:", error);
        return;
      }

      const updates = data || [];

      // Detect removals: subscribed datasources missing from results
      const subscribedLocal = getSubscribedDatasources();
      const returnedIds = new Set(updates.map((u) => u.datasource_id));

      for (const local of subscribedLocal) {
        if (local.cloudId && !returnedIds.has(local.cloudId)) {
          // Check if still in subscriptions list - if not, it was removed/unpublished
          const stillSubscribed = subscriptions.some((s) => s.datasource_id === local.cloudId);
          if (stillSubscribed) {
            // The datasource was deleted or unpublished by author
            setSubscriptions((prev) => prev.filter((s) => s.datasource_id !== local.cloudId));
            setAvailableUpdates((prev) => prev.filter((u) => u.datasource_id !== local.cloudId));
            message.warning(`Subscribed datasource "${local.name}" was removed by its author`);
          }
        }
      }

      // Set available updates
      const newUpdates = updates.filter((u) => u.has_update);
      setAvailableUpdates(newUpdates);
    } catch (err) {
      console.error("Check subscription updates exception:", err);
    }
  }, [user, subscriptions, getSubscribedDatasources]);

  // ============================================
  // EFFECTS
  // ============================================

  // Fetch subscriptions on user login
  useEffect(() => {
    if (user) {
      fetchMySubscriptions();
      fetchMyDatasources();
    } else {
      setSubscriptions([]);
      setMyDatasources([]);
      setAvailableUpdates([]);
    }
  }, [user]);

  // Poll for subscription updates every 30 seconds
  useEffect(() => {
    if (!user || subscriptions.length === 0) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkForUpdates();

    // Set up polling interval
    pollIntervalRef.current = setInterval(checkForUpdates, SUBSCRIPTION_POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [user, subscriptions.length, checkForUpdates]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    // Browse
    publicDatasources,
    isLoadingPublic,
    browseFilters,
    pagination,
    browsePublicDatasources,
    getFeaturedDatasources,
    getDatasourceByShareCode,
    setBrowseFilters,

    // Subscriptions
    subscriptions,
    availableUpdates,
    isLoadingSubscriptions,
    fetchMySubscriptions,
    subscribeToDatasource,
    unsubscribeFromDatasource,
    syncSubscription,
    syncAllSubscriptions,
    getSubscribedDatasources,

    // Publishing
    myDatasources,
    isLoadingMine,
    isUploading,
    fetchMyDatasources,
    uploadDatasource,
    publishDatasource,
    unpublishDatasource,
    updatePublishedDatasource,
    deleteDatasource,

    // Local datasource publishing
    publishLocalDatasource,
    pushDatasourceUpdate,

    // Update count for badges
    updateCount: availableUpdates.length,
  };

  return <DatasourceSharingContext.Provider value={value}>{children}</DatasourceSharingContext.Provider>;
}

// Hook to use datasource sharing context
export function useDatasourceSharing() {
  const context = useContext(DatasourceSharingContext);
  if (!context) {
    return {
      publicDatasources: [],
      isLoadingPublic: false,
      browseFilters: { gameSystem: null, search: "", sortBy: "popular" },
      pagination: { offset: 0, hasMore: true },
      browsePublicDatasources: () => Promise.resolve([]),
      getFeaturedDatasources: () => Promise.resolve([]),
      getDatasourceByShareCode: () => Promise.resolve(null),
      setBrowseFilters: () => {},
      subscriptions: [],
      availableUpdates: [],
      isLoadingSubscriptions: false,
      fetchMySubscriptions: () => Promise.resolve([]),
      subscribeToDatasource: () => Promise.resolve({ success: false }),
      unsubscribeFromDatasource: () => Promise.resolve({ success: false }),
      syncSubscription: () => Promise.resolve({ success: false }),
      syncAllSubscriptions: () => Promise.resolve(),
      getSubscribedDatasources: () => [],
      myDatasources: [],
      isLoadingMine: false,
      isUploading: false,
      fetchMyDatasources: () => Promise.resolve([]),
      uploadDatasource: () => Promise.resolve({ success: false }),
      publishDatasource: () => Promise.resolve({ success: false }),
      unpublishDatasource: () => Promise.resolve({ success: false }),
      updatePublishedDatasource: () => Promise.resolve({ success: false }),
      deleteDatasource: () => Promise.resolve({ success: false }),
      publishLocalDatasource: () => Promise.resolve({ success: false }),
      pushDatasourceUpdate: () => Promise.resolve({ success: false }),
      updateCount: 0,
    };
  }
  return context;
}
