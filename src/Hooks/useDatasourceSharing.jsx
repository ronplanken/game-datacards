import React, { useState, useEffect, useCallback, useRef, useContext, createContext } from "react";
import { message } from "../Components/Toast/message";
import localForage from "localforage";
import { supabase } from "../config/supabase";
import { useAuth } from "./useAuth";
import { useSettingsStorage } from "./useSettingsStorage";
import { useSubscription } from "./useSubscription";
import { validateCustomDatasource, createRegistryEntry } from "../Helpers/customDatasource.helpers";

// Debounce delay for update checks (ms)
const UPDATE_CHECK_DEBOUNCE = 30000;

// Create localForage instance for datasource data
var dataStore = localForage.createInstance({
  name: "data",
});

// Create context for datasource sharing state
const DatasourceSharingContext = createContext(null);

// Game system options
export const GAME_SYSTEMS = [
  { value: "40k-10e", label: "Warhammer 40k (10th Edition)" },
  { value: "40k", label: "Warhammer 40k (Legacy)" },
  { value: "aos", label: "Age of Sigmar" },
  { value: "necromunda", label: "Necromunda" },
  { value: "horus-heresy", label: "Horus Heresy" },
  { value: "basic", label: "Basic/Generic" },
  { value: "other", label: "Other" },
];

// Sort options
export const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "new", label: "Newest" },
  { value: "subscribers", label: "Most Subscribers" },
];

// Provider component
export function DatasourceSharingProvider({ children }) {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettingsStorage();
  const { canPerformAction } = useSubscription();

  // Browse state
  const [publicDatasources, setPublicDatasources] = useState([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [browseFilters, setBrowseFilters] = useState({
    gameSystem: null,
    search: "",
    sortBy: "popular",
  });
  const [pagination, setPagination] = useState({ offset: 0, hasMore: true });

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState([]);
  const [availableUpdates, setAvailableUpdates] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

  // My published datasources state
  const [myDatasources, setMyDatasources] = useState([]);
  const [isLoadingMine, setIsLoadingMine] = useState(false);

  // Upload/publish state
  const [isUploading, setIsUploading] = useState(false);

  // Refs
  const updateCheckTimeoutRef = useRef(null);
  const lastUpdateCheckRef = useRef(null);

  // ============================================
  // BROWSING FUNCTIONS
  // ============================================

  /**
   * Browse public datasources with filters and pagination
   */
  const browsePublicDatasources = useCallback(
    async (filters = {}, reset = false) => {
      setIsLoadingPublic(true);

      const mergedFilters = { ...browseFilters, ...filters };
      const offset = reset ? 0 : pagination.offset;

      try {
        const { data, error } = await supabase.rpc("browse_public_datasources", {
          p_game_system: mergedFilters.gameSystem || null,
          p_search_query: mergedFilters.search || null,
          p_sort_by: mergedFilters.sortBy || "popular",
          p_limit: 20,
          p_offset: offset,
        });

        if (error) {
          console.error("Browse datasources error:", error);
          message.error("Failed to load datasources");
          return [];
        }

        const results = data || [];

        if (reset) {
          setPublicDatasources(results);
          setPagination({ offset: results.length, hasMore: results.length === 20 });
        } else {
          setPublicDatasources((prev) => [...prev, ...results]);
          setPagination((prev) => ({
            offset: prev.offset + results.length,
            hasMore: results.length === 20,
          }));
        }

        setBrowseFilters(mergedFilters);
        return results;
      } catch (err) {
        console.error("Browse datasources exception:", err);
        message.error("Failed to load datasources");
        return [];
      } finally {
        setIsLoadingPublic(false);
      }
    },
    [browseFilters, pagination.offset]
  );

  /**
   * Get featured datasources
   */
  const getFeaturedDatasources = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_featured_datasources", {
        p_limit: 6,
      });

      if (error) {
        console.error("Get featured error:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Get featured exception:", err);
      return [];
    }
  }, []);

  /**
   * Get datasource by share code
   */
  const getDatasourceByShareCode = useCallback(async (shareCode) => {
    try {
      const { data, error } = await supabase.rpc("get_datasource_by_share_code", {
        p_share_code: shareCode,
      });

      if (error) {
        console.error("Get by share code error:", error);
        return null;
      }

      return data?.[0] || null;
    } catch (err) {
      console.error("Get by share code exception:", err);
      return null;
    }
  }, []);

  // ============================================
  // SUBSCRIPTION FUNCTIONS
  // ============================================

  /**
   * Fetch user's subscriptions
   */
  const fetchMySubscriptions = useCallback(async () => {
    if (!user) return [];

    setIsLoadingSubscriptions(true);
    try {
      const { data, error } = await supabase.rpc("get_my_subscriptions");

      if (error) {
        console.error("Get subscriptions error:", error);
        return [];
      }

      setSubscriptions(data || []);
      return data || [];
    } catch (err) {
      console.error("Get subscriptions exception:", err);
      return [];
    } finally {
      setIsLoadingSubscriptions(false);
    }
  }, [user]);

  /**
   * Subscribe to a public datasource
   */
  const subscribeToDatasource = useCallback(
    async (datasourceId) => {
      if (!user) {
        message.error("Please sign in to subscribe");
        return { success: false, error: "Not authenticated" };
      }

      try {
        // Call RPC to create subscription
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

        // Import to local storage as read-only
        await importFromSubscription(datasource);

        // Refresh subscriptions list
        await fetchMySubscriptions();

        // Update browse list to show subscribed state
        setPublicDatasources((prev) =>
          prev.map((ds) => (ds.id === datasourceId ? { ...ds, is_subscribed: true } : ds))
        );

        message.success(`Subscribed to "${datasource.name}"`);
        return { success: true };
      } catch (err) {
        console.error("Subscribe exception:", err);
        message.error("Failed to subscribe");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMySubscriptions]
  );

  /**
   * Unsubscribe from a datasource
   */
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

        // Remove from local storage if requested
        if (removeLocal) {
          await removeSubscribedDatasource(datasourceId);
        }

        // Refresh subscriptions list
        await fetchMySubscriptions();

        // Update browse list
        setPublicDatasources((prev) =>
          prev.map((ds) => (ds.id === datasourceId ? { ...ds, is_subscribed: false } : ds))
        );

        // Remove from available updates
        setAvailableUpdates((prev) => prev.filter((u) => u.datasource_id !== datasourceId));

        message.success("Unsubscribed successfully");
        return { success: true };
      } catch (err) {
        console.error("Unsubscribe exception:", err);
        message.error("Failed to unsubscribe");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMySubscriptions]
  );

  /**
   * Check for available updates on subscriptions
   */
  const checkForUpdates = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.rpc("get_subscription_updates");

      if (error) {
        console.error("Check updates error:", error);
        return [];
      }

      setAvailableUpdates(data || []);
      lastUpdateCheckRef.current = Date.now();
      return data || [];
    } catch (err) {
      console.error("Check updates exception:", err);
      return [];
    }
  }, [user]);

  /**
   * Sync a single subscription to get the latest version
   */
  const syncSubscription = useCallback(
    async (subscriptionId, datasourceId) => {
      if (!user) return { success: false };

      try {
        // Download latest data
        const { data: datasource, error: fetchError } = await supabase
          .from("user_datasources")
          .select("*")
          .eq("id", datasourceId)
          .single();

        if (fetchError || !datasource) {
          console.error("Fetch datasource error:", fetchError);
          return { success: false, error: "Failed to fetch" };
        }

        // Update local storage
        await updateSubscribedDatasource(datasource);

        // Mark as synced in database
        const { error: markError } = await supabase.rpc("mark_subscription_synced", {
          p_subscription_id: subscriptionId,
          p_version: datasource.version_number,
        });

        if (markError) {
          console.error("Mark synced error:", markError);
        }

        // Remove from available updates
        setAvailableUpdates((prev) => prev.filter((u) => u.subscription_id !== subscriptionId));

        // Refresh subscriptions
        await fetchMySubscriptions();

        message.success(`Updated "${datasource.name}"`);
        return { success: true };
      } catch (err) {
        console.error("Sync subscription exception:", err);
        return { success: false, error: err.message };
      }
    },
    [user, fetchMySubscriptions]
  );

  /**
   * Sync all subscriptions with available updates
   */
  const syncAllSubscriptions = useCallback(async () => {
    for (const update of availableUpdates) {
      await syncSubscription(update.subscription_id, update.datasource_id);
    }
  }, [availableUpdates, syncSubscription]);

  // ============================================
  // LOCAL STORAGE FUNCTIONS
  // ============================================

  /**
   * Import a subscribed datasource as read-only
   */
  const importFromSubscription = useCallback(
    async (subscriptionData) => {
      const { id, name, data, version, version_number, author_name, user_id } = subscriptionData;

      // Generate local ID for storage
      const localId = `subscribed-${id}`;

      // Prepare datasource with subscription metadata
      // data.data is always an array of factions (standard format)
      const prepared = {
        ...data,
        id: localId,
      };

      // Store in localForage
      await dataStore.setItem(localId, prepared);

      // Count cards in the datasource
      // data.data is an array of factions, each faction has cards/datasheets/units
      const cardCount = (data.data || []).reduce((sum, faction) => {
        const cards = faction?.datasheets?.length || faction?.units?.length || faction?.cards?.length || 0;
        return sum + cards;
      }, 0);

      // Create registry entry with subscription info
      const registryEntry = {
        id: localId,
        name,
        cardCount,
        sourceType: "subscription",
        version,
        author: author_name,
        lastUpdated: new Date().toISOString(),
        // Subscription-specific fields
        cloudId: id,
        isSubscribed: true,
        authorId: user_id,
        authorName: author_name,
        lastCloudVersion: version_number,
        isReadOnly: true,
      };

      // Update settings with new datasource
      const currentCustomDatasources = settings.customDatasources || [];

      // Check if already exists (update instead of add)
      const existingIndex = currentCustomDatasources.findIndex((ds) => ds.cloudId === id);
      let updatedDatasources;

      if (existingIndex >= 0) {
        updatedDatasources = [...currentCustomDatasources];
        updatedDatasources[existingIndex] = registryEntry;
      } else {
        updatedDatasources = [...currentCustomDatasources, registryEntry];
      }

      updateSettings({
        ...settings,
        customDatasources: updatedDatasources,
      });
    },
    [settings, updateSettings]
  );

  /**
   * Update a subscribed datasource with new version
   */
  const updateSubscribedDatasource = useCallback(
    async (subscriptionData) => {
      const localId = `subscribed-${subscriptionData.id}`;

      // Update localForage
      await dataStore.setItem(localId, { ...subscriptionData.data, id: localId });

      // Update registry entry
      const updated = (settings.customDatasources || []).map((ds) =>
        ds.cloudId === subscriptionData.id
          ? {
              ...ds,
              version: subscriptionData.version,
              lastCloudVersion: subscriptionData.version_number,
              lastUpdated: new Date().toISOString(),
            }
          : ds
      );

      updateSettings({ ...settings, customDatasources: updated });
    },
    [settings, updateSettings]
  );

  /**
   * Remove a subscribed datasource from local storage
   */
  const removeSubscribedDatasource = useCallback(
    async (cloudId) => {
      const entry = (settings.customDatasources || []).find((ds) => ds.cloudId === cloudId);
      if (!entry) return;

      // Remove from localForage
      await dataStore.removeItem(entry.id);

      // Remove from registry
      updateSettings({
        ...settings,
        customDatasources: (settings.customDatasources || []).filter((ds) => ds.cloudId !== cloudId),
        // If this was selected, switch to basic
        selectedDataSource: settings.selectedDataSource === entry.id ? "basic" : settings.selectedDataSource,
      });
    },
    [settings, updateSettings]
  );

  /**
   * Get all subscribed datasources
   */
  const getSubscribedDatasources = useCallback(() => {
    return (settings.customDatasources || []).filter((ds) => ds.isSubscribed);
  }, [settings.customDatasources]);

  // ============================================
  // PUBLISHING FUNCTIONS
  // ============================================

  /**
   * Fetch user's own uploaded/published datasources
   */
  const fetchMyDatasources = useCallback(async () => {
    if (!user) return [];

    setIsLoadingMine(true);
    try {
      const { data, error } = await supabase.rpc("get_my_datasources");

      if (error) {
        console.error("Get my datasources error:", error);
        return [];
      }

      setMyDatasources(data || []);
      return data || [];
    } catch (err) {
      console.error("Get my datasources exception:", err);
      return [];
    } finally {
      setIsLoadingMine(false);
    }
  }, [user]);

  /**
   * Upload a local datasource to the cloud
   */
  const uploadDatasource = useCallback(
    async (datasourceData, metadata) => {
      if (!user) {
        message.error("Please sign in to upload");
        return { success: false, error: "Not authenticated" };
      }

      // Check tier permissions
      if (!canPerformAction("upload_datasource")) {
        message.error("Upgrade your subscription to upload datasources");
        return { success: false, error: "Subscription required" };
      }

      // Validate datasource
      const validation = validateCustomDatasource(datasourceData);
      if (!validation.isValid) {
        message.error(`Invalid datasource: ${validation.errors.join(", ")}`);
        return { success: false, error: validation.errors.join(", ") };
      }

      setIsUploading(true);
      try {
        const { name, version, authorName, displayFormat } = metadata;

        const { data, error } = await supabase
          .from("user_datasources")
          .insert({
            user_id: user.id,
            datasource_id: datasourceData.id || `ds-${Date.now()}`,
            name,
            data: datasourceData,
            version: version || "1.0.0",
            author_name: authorName || user.email?.split("@")[0] || "Anonymous",
            display_format: displayFormat,
            is_public: false,
          })
          .select()
          .single();

        if (error) {
          console.error("Upload error:", error);
          message.error("Failed to upload datasource");
          return { success: false, error: error.message };
        }

        // Update local registry with cloudId
        const updatedDatasources = (settings.customDatasources || []).map((ds) =>
          ds.id === datasourceData.id
            ? {
                ...ds,
                cloudId: data.id,
                isUploaded: true,
              }
            : ds
        );

        updateSettings({ ...settings, customDatasources: updatedDatasources });

        // Refresh my datasources
        await fetchMyDatasources();

        message.success("Datasource uploaded to cloud");
        return { success: true, cloudId: data.id };
      } catch (err) {
        console.error("Upload exception:", err);
        message.error("Failed to upload datasource");
        return { success: false, error: err.message };
      } finally {
        setIsUploading(false);
      }
    },
    [user, canPerformAction, settings, updateSettings, fetchMyDatasources]
  );

  /**
   * Publish an uploaded datasource (make public)
   */
  const publishDatasource = useCallback(
    async (datasourceDbId, options = {}) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { description, gameSystem } = options;

        const { data: result, error } = await supabase.rpc("publish_datasource", {
          p_datasource_db_id: datasourceDbId,
          p_description: description || null,
          p_game_system: gameSystem || null,
        });

        if (error) {
          console.error("Publish error:", error);
          message.error("Failed to publish datasource");
          return { success: false, error: error.message };
        }

        if (!result?.success) {
          message.error(result?.error || "Failed to publish");
          return { success: false, error: result?.error };
        }

        // Refresh my datasources
        await fetchMyDatasources();

        message.success("Datasource published! Share code: " + result.share_code);
        return { success: true, shareCode: result.share_code };
      } catch (err) {
        console.error("Publish exception:", err);
        message.error("Failed to publish datasource");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMyDatasources]
  );

  /**
   * Unpublish a datasource (make private)
   */
  const unpublishDatasource = useCallback(
    async (datasourceDbId) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { data: result, error } = await supabase.rpc("unpublish_datasource", {
          p_datasource_db_id: datasourceDbId,
        });

        if (error) {
          console.error("Unpublish error:", error);
          message.error("Failed to unpublish");
          return { success: false, error: error.message };
        }

        // Refresh my datasources
        await fetchMyDatasources();

        message.success("Datasource is now private");
        return { success: true };
      } catch (err) {
        console.error("Unpublish exception:", err);
        message.error("Failed to unpublish");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMyDatasources]
  );

  /**
   * Update a published datasource (increments version)
   */
  const updatePublishedDatasource = useCallback(
    async (datasourceDbId, newData) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

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

        // Refresh my datasources
        await fetchMyDatasources();

        message.success("Datasource updated");
        return { success: true, newVersion: result.new_version_number };
      } catch (err) {
        console.error("Update published exception:", err);
        message.error("Failed to update datasource");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMyDatasources]
  );

  /**
   * Publish a local datasource (copy edit_data to published_data, make public)
   * Used for datasources that were created in the treeview and uploaded via useSync
   */
  const publishLocalDatasource = useCallback(
    async (cloudId, options = {}) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { description, gameSystem } = options;

        // Call RPC function that copies edit_data to published_data
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

        // Refresh my datasources list
        await fetchMyDatasources();

        message.success("Datasource published! Share code: " + result.share_code);
        return {
          success: true,
          shareCode: result.share_code,
          versionNumber: result.version_number,
        };
      } catch (err) {
        console.error("Publish local datasource exception:", err);
        message.error("Failed to publish datasource");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMyDatasources]
  );

  /**
   * Push update to subscribers (copy edit_data to published_data, increment version)
   * Used after making changes to a published local datasource
   */
  const pushDatasourceUpdate = useCallback(
    async (cloudId) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        // Call RPC function that copies edit_data to published_data and increments version
        const { data: result, error } = await supabase.rpc("push_datasource_update", {
          p_datasource_db_id: cloudId,
        });

        if (error) {
          console.error("Push update error:", error);
          message.error("Failed to push update");
          return { success: false, error: error.message };
        }

        if (!result?.success) {
          message.error(result?.error || "Failed to push update");
          return { success: false, error: result?.error };
        }

        // Refresh my datasources list
        await fetchMyDatasources();

        message.success(`Update pushed (version ${result.new_version_number})`);
        return {
          success: true,
          newVersionNumber: result.new_version_number,
        };
      } catch (err) {
        console.error("Push update exception:", err);
        message.error("Failed to push update");
        return { success: false, error: err.message };
      }
    },
    [user, fetchMyDatasources]
  );

  /**
   * Delete a datasource from cloud
   */
  const deleteDatasource = useCallback(
    async (datasourceDbId) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const { error } = await supabase
          .from("user_datasources")
          .delete()
          .eq("id", datasourceDbId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Delete datasource error:", error);
          message.error("Failed to delete datasource");
          return { success: false, error: error.message };
        }

        // Remove cloudId from local registry
        const updatedDatasources = (settings.customDatasources || []).map((ds) =>
          ds.cloudId === datasourceDbId ? { ...ds, cloudId: null, isUploaded: false } : ds
        );

        updateSettings({ ...settings, customDatasources: updatedDatasources });

        // Refresh my datasources
        await fetchMyDatasources();

        message.success("Datasource deleted from cloud");
        return { success: true };
      } catch (err) {
        console.error("Delete datasource exception:", err);
        message.error("Failed to delete datasource");
        return { success: false, error: err.message };
      }
    },
    [user, settings, updateSettings, fetchMyDatasources]
  );

  // ============================================
  // REALTIME SUBSCRIPTIONS
  // ============================================

  /**
   * Handle realtime updates for subscribed datasources
   */
  const handleRealtimeUpdate = useCallback(
    (payload) => {
      const { eventType, new: newRecord } = payload;

      if (eventType !== "UPDATE") return;

      // Check if this is a datasource we're subscribed to
      const subscription = subscriptions.find((s) => s.datasource_id === newRecord.id);
      if (!subscription) return;

      // Check if there's a new version
      if (newRecord.version_number > subscription.subscribed_version) {
        // Add to available updates
        setAvailableUpdates((prev) => {
          if (prev.some((u) => u.datasource_id === newRecord.id)) return prev;
          return [
            ...prev,
            {
              subscription_id: subscription.subscription_id,
              datasource_id: newRecord.id,
              datasource_name: newRecord.name,
              current_version: newRecord.version_number,
              subscribed_version: subscription.subscribed_version,
              updated_at: newRecord.updated_at,
            },
          ];
        });
      }
    },
    [subscriptions]
  );

  // Subscribe to realtime changes for subscribed datasources
  useEffect(() => {
    if (!user || subscriptions.length === 0) return;

    const subscribedIds = subscriptions.map((s) => s.datasource_id);
    if (subscribedIds.length === 0) return;

    // Create channel for datasource updates
    const channel = supabase
      .channel(`datasource-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_datasources",
        },
        (payload) => {
          // Filter to only subscribed datasources
          if (subscribedIds.includes(payload.new?.id)) {
            handleRealtimeUpdate(payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, subscriptions, handleRealtimeUpdate]);

  // ============================================
  // EFFECTS
  // ============================================

  // Fetch subscriptions on user login
  useEffect(() => {
    if (user) {
      fetchMySubscriptions();
      fetchMyDatasources();
      // Debounced update check
      updateCheckTimeoutRef.current = setTimeout(() => {
        checkForUpdates();
      }, 1000);
    } else {
      setSubscriptions([]);
      setMyDatasources([]);
      setAvailableUpdates([]);
    }

    return () => {
      if (updateCheckTimeoutRef.current) {
        clearTimeout(updateCheckTimeoutRef.current);
      }
    };
  }, [user]);

  // Periodic update check
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Only check if enough time has passed
      if (!lastUpdateCheckRef.current || Date.now() - lastUpdateCheckRef.current > UPDATE_CHECK_DEBOUNCE) {
        checkForUpdates();
      }
    }, UPDATE_CHECK_DEBOUNCE);

    return () => clearInterval(interval);
  }, [user, checkForUpdates]);

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
    checkForUpdates,
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
    // Return safe defaults if used outside provider
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
      checkForUpdates: () => Promise.resolve([]),
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
