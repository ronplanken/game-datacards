import React, { useState } from "react";
import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { Tooltip } from "../Tooltip/Tooltip";
import { useSync } from "../../Hooks/useSync";
import { useAuth } from "../../Hooks/useAuth";
import { SyncClaimModal } from "./SyncClaimModal";
import "./CategorySyncIcon.css";

// Format relative time for "Synced X ago"
const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never synced";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

export function CategorySyncIcon({ category }) {
  const { user } = useAuth();
  const { enableSync, uploadCategory, checkConflicts, isOnline } = useSync();
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimCategoryName, setClaimCategoryName] = useState("");

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  const { syncEnabled, syncStatus, lastSyncedAt, syncError, syncedToUserId } = category;

  // Check if this category is synced to a different user
  // If so, treat it as a local category (don't show sync status for another user's data)
  const isSyncedToCurrentUser = !syncedToUserId || syncedToUserId === user.id;
  const effectiveSyncEnabled = syncEnabled && isSyncedToCurrentUser;

  // Handle click on sync icon
  const handleClick = async (e) => {
    e.stopPropagation();

    if (!effectiveSyncEnabled) {
      // Enable sync (this will trigger confirmation if synced to another user)
      const result = await enableSync(category.uuid);

      // Check if this category was previously synced to a different user
      if (result.requiresConfirmation) {
        setClaimCategoryName(result.categoryName);
        setClaimModalOpen(true);
      }
    } else if (syncStatus === "conflict") {
      // Re-check conflicts to populate the conflicts array and show modal
      await checkConflicts();
    } else if (syncStatus === "error" || syncStatus === "pending") {
      // Retry/force sync
      await uploadCategory(category);
    }
  };

  const handleClaimConfirm = async () => {
    setClaimModalOpen(false);
    await enableSync(category.uuid, true);
  };

  const handleClaimCancel = () => {
    setClaimModalOpen(false);
  };

  // Determine icon and styles based on sync status
  const getIconConfig = () => {
    if (!effectiveSyncEnabled) {
      return {
        icon: Cloud,
        className: "category-sync-icon local",
        tooltip: "Click to enable cloud sync",
      };
    }

    if (!isOnline) {
      return {
        icon: CloudOff,
        className: "category-sync-icon offline",
        tooltip: "Offline - will sync when connected",
      };
    }

    switch (syncStatus) {
      case "synced":
        return {
          icon: Cloud,
          className: "category-sync-icon synced",
          tooltip: `Synced ${formatRelativeTime(lastSyncedAt)}`,
        };
      case "pending":
        return {
          icon: Cloud,
          className: "category-sync-icon pending",
          tooltip: "Pending sync - click to sync now",
          hasBadge: true,
        };
      case "syncing":
        return {
          icon: RefreshCw,
          className: "category-sync-icon syncing",
          tooltip: "Syncing...",
          isSpinning: true,
        };
      case "error":
        return {
          icon: AlertCircle,
          className: "category-sync-icon error",
          tooltip: `Sync error: ${syncError || "Unknown error"} - click to retry`,
        };
      case "conflict":
        return {
          icon: AlertCircle,
          className: "category-sync-icon conflict",
          tooltip: "Conflict detected - click to resolve",
        };
      default:
        return {
          icon: Cloud,
          className: "category-sync-icon local",
          tooltip: "Click to enable cloud sync",
        };
    }
  };

  const config = getIconConfig();
  const IconComponent = config.icon;

  return (
    <>
      <div className="category-sync-icon-wrapper">
        <Tooltip content={config.tooltip} placement="top">
          <button className={config.className} onClick={handleClick} aria-label={config.tooltip}>
            <IconComponent size={12} className={config.isSpinning ? "spinning" : ""} />
            {config.hasBadge && <span className="sync-badge" />}
          </button>
        </Tooltip>
      </div>

      <SyncClaimModal
        isOpen={claimModalOpen}
        categoryName={claimCategoryName}
        onConfirm={handleClaimConfirm}
        onCancel={handleClaimCancel}
      />
    </>
  );
}
