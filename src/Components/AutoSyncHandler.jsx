import { useEffect, useRef } from "react";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useSync } from "../Premium";
import { runDebouncedSync } from "../Helpers/sync.helpers";

const AUTO_SYNC_DELAY_MS = 3000;

/**
 * Watches for categories with syncStatus "pending" and automatically
 * triggers a debounced sync so users don't have to manually press "Sync Now".
 */
export const AutoSyncHandler = () => {
  const { cardStorage } = useCardStorage();
  const { syncAll, isSyncing, globalSyncStatus } = useSync();
  const timeoutRef = useRef(null);
  const pendingRef = useRef(new Set());

  useEffect(() => {
    // Only auto-sync when sync is active (not disabled/community)
    if (globalSyncStatus === "disabled" || isSyncing) return;

    const categories = cardStorage?.categories || [];
    return runDebouncedSync({
      items: categories,
      isPending: (cat) => cat.syncEnabled && cat.syncStatus === "pending",
      getKey: (cat) => `${cat.uuid}:${cat.localVersion}`,
      syncFn: syncAll,
      timeoutRef,
      pendingRef,
      delay: AUTO_SYNC_DELAY_MS,
    });
  }, [cardStorage?.categories, syncAll, isSyncing, globalSyncStatus]);

  return null;
};
