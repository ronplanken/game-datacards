import { Cloud, CloudOff, RefreshCw, AlertTriangle, AlertCircle, Check } from "lucide-react";
import { useSync } from "../../../../Hooks/useSync";
import { useSubscription } from "../../../../Hooks/useSubscription";
import { useCloudCategories } from "../../../../Hooks/useCloudCategories";
import { BottomSheet } from "../BottomSheet";
import "./MobileSync.css";

// Format relative time
const formatRelativeTime = (date) => {
  if (!date) return "Never";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
};

// Get status display info
const getStatusInfo = (status, isOnline) => {
  if (!isOnline) {
    return {
      icon: CloudOff,
      title: "Offline",
      subtitle: "Changes will sync when back online",
      iconClass: "sync-status-icon--offline",
    };
  }

  switch (status) {
    case "syncing":
      return {
        icon: RefreshCw,
        title: "Syncing...",
        subtitle: "Uploading your changes",
        iconClass: "sync-status-icon--syncing",
      };
    case "pending":
      return {
        icon: Cloud,
        title: "Pending",
        subtitle: "Changes waiting to sync",
        iconClass: "sync-status-icon--pending",
      };
    case "conflict":
      return {
        icon: AlertTriangle,
        title: "Conflict Detected",
        subtitle: "Action needed to resolve",
        iconClass: "sync-status-icon--conflict",
      };
    case "error":
      return {
        icon: AlertCircle,
        title: "Sync Error",
        subtitle: "Some items failed to sync",
        iconClass: "sync-status-icon--error",
      };
    case "synced":
      return {
        icon: Check,
        title: "All Synced",
        subtitle: "Everything is up to date",
        iconClass: "sync-status-icon--synced",
      };
    default:
      return {
        icon: Cloud,
        title: "Cloud Sync",
        subtitle: "Your data syncs across devices",
        iconClass: "sync-status-icon--synced",
      };
  }
};

export const MobileSyncSheet = ({ isVisible, setIsVisible, onResolveConflict }) => {
  const {
    globalSyncStatus,
    pendingCount,
    errorCount,
    conflictCount,
    conflicts,
    lastSyncTime,
    isOnline,
    isSyncing,
    syncAll,
  } = useSync();
  const { usage } = useSubscription();
  const { lastFetchTime } = useCloudCategories();

  // Use actual cloud count for consistency with usage bar
  const cloudCategoryCount = usage?.categories || 0;

  // Use lastFetchTime from cloud categories (mobile) or lastSyncTime from sync (desktop)
  const displayLastSync = lastFetchTime || lastSyncTime;

  const handleClose = () => setIsVisible(false);

  const handleSyncNow = async () => {
    await syncAll();
  };

  const handleResolveConflict = () => {
    handleClose();
    if (onResolveConflict) {
      onResolveConflict();
    }
  };

  const statusInfo = getStatusInfo(globalSyncStatus, isOnline);
  const StatusIcon = statusInfo.icon;

  // Show empty state if no synced items (use cloud count)
  const hasNoSyncedItems = cloudCategoryCount === 0 && pendingCount === 0;

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title="Cloud Sync" dark>
      <div className="sync-sheet sync-sheet-content">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="sync-offline-banner sync-fade-in">
            <CloudOff size={18} />
            <span>You&apos;re offline. Changes will sync when reconnected.</span>
          </div>
        )}

        {/* Empty State */}
        {hasNoSyncedItems && isOnline && (
          <div className="sync-empty-state sync-fade-in">
            <div className="sync-empty-icon">
              <Cloud size={28} />
            </div>
            <h3 className="sync-empty-title">No Synced Lists</h3>
            <p className="sync-empty-description">
              Enable sync on your lists to keep them backed up and accessible across all your devices.
            </p>
          </div>
        )}

        {/* Status Card */}
        {!hasNoSyncedItems && (
          <div className="sync-status-card sync-fade-in">
            <div className={`sync-status-icon ${statusInfo.iconClass}`}>
              <StatusIcon size={22} />
            </div>
            <div className="sync-status-info">
              <h3 className="sync-status-title">{statusInfo.title}</h3>
              <p className="sync-status-subtitle">{statusInfo.subtitle}</p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        {!hasNoSyncedItems && (
          <div className="sync-stats-row sync-fade-in">
            <div className="sync-stat">
              <span className="sync-stat-value">{cloudCategoryCount}</span>
              <span className="sync-stat-label">Synced</span>
            </div>
            <div className="sync-stat">
              <span className="sync-stat-value">{pendingCount}</span>
              <span className="sync-stat-label">Pending</span>
            </div>
            <div className="sync-stat">
              <span className="sync-stat-value sync-stat-value--text">{formatRelativeTime(displayLastSync)}</span>
              <span className="sync-stat-label">Last Sync</span>
            </div>
          </div>
        )}

        {/* Conflict Alert */}
        {conflictCount > 0 && (
          <div className="sync-conflict-alert sync-fade-in">
            <div className="sync-conflict-icon">
              <AlertTriangle size={18} />
            </div>
            <div className="sync-conflict-content">
              <h4 className="sync-conflict-title">
                {conflictCount} conflict{conflictCount > 1 ? "s" : ""} detected
              </h4>
              <p className="sync-conflict-subtitle">{conflicts[0]?.name || "List"} needs attention</p>
            </div>
            <button className="sync-conflict-action" onClick={handleResolveConflict} type="button">
              Fix
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorCount > 0 && conflictCount === 0 && (
          <div className="sync-error-alert sync-fade-in">
            <div className="sync-error-icon">
              <AlertCircle size={18} />
            </div>
            <div className="sync-error-content">
              <h4 className="sync-error-title">
                {errorCount} item{errorCount > 1 ? "s" : ""} failed to sync
              </h4>
              <p className="sync-error-subtitle">Tap retry to try again</p>
            </div>
            <button className="sync-error-action" onClick={handleSyncNow} type="button">
              Retry
            </button>
          </div>
        )}

        {/* Sync Now Button */}
        {!hasNoSyncedItems && isOnline && (
          <button
            className={`sync-now-button sync-fade-in ${isSyncing ? "sync-now-button--syncing" : ""}`}
            onClick={handleSyncNow}
            disabled={isSyncing}
            type="button">
            {isSyncing ? (
              <>
                <RefreshCw size={18} className="spinning" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                <span>Sync Now</span>
              </>
            )}
          </button>
        )}
      </div>
    </BottomSheet>
  );
};
