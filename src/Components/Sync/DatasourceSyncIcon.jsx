import React from "react";
import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { Tooltip } from "../Tooltip/Tooltip";
import { useAuth } from "../../Hooks/useAuth";
import { useSync } from "../../Hooks/useSync";
import "./DatasourceSyncIcon.css";

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

export function DatasourceSyncIcon({ datasource }) {
  const { user } = useAuth();
  const { enableSync, uploadLocalDatasource, isOnline } = useSync();

  // Don't render anything if user is not logged in
  if (!user) {
    return null;
  }

  const { syncEnabled, syncStatus, lastSyncedAt, syncError } = datasource;

  // Handle click on sync icon
  const handleClick = async (e) => {
    e.stopPropagation();

    if (!syncEnabled) {
      // Enable sync for datasource
      await enableSync(datasource.uuid);
    } else if (syncStatus === "error" || syncStatus === "pending") {
      // Retry/force sync
      await uploadLocalDatasource(datasource);
    }
  };

  // Determine icon and styles based on sync status (same logic as CategorySyncIcon)
  const getIconConfig = () => {
    if (!syncEnabled) {
      return {
        icon: Cloud,
        className: "datasource-sync-icon local",
        tooltip: "Click to enable cloud sync",
      };
    }

    if (!isOnline) {
      return {
        icon: CloudOff,
        className: "datasource-sync-icon offline",
        tooltip: "Offline - will sync when connected",
      };
    }

    switch (syncStatus) {
      case "synced":
        return {
          icon: Cloud,
          className: "datasource-sync-icon synced",
          tooltip: `Synced ${formatRelativeTime(lastSyncedAt)}`,
        };
      case "pending":
        return {
          icon: Cloud,
          className: "datasource-sync-icon pending",
          tooltip: "Pending sync - click to sync now",
          hasBadge: true,
        };
      case "syncing":
        return {
          icon: RefreshCw,
          className: "datasource-sync-icon syncing",
          tooltip: "Syncing...",
          isSpinning: true,
        };
      case "error":
        return {
          icon: AlertCircle,
          className: "datasource-sync-icon error",
          tooltip: `Sync error: ${syncError || "Unknown error"} - click to retry`,
        };
      default:
        return {
          icon: Cloud,
          className: "datasource-sync-icon local",
          tooltip: "Click to enable cloud sync",
        };
    }
  };

  const config = getIconConfig();
  const IconComponent = config.icon;

  return (
    <div className="datasource-sync-icon-wrapper">
      <Tooltip content={config.tooltip} placement="top">
        <button className={config.className} onClick={handleClick} aria-label={config.tooltip}>
          <IconComponent size={12} className={config.isSpinning ? "spinning" : ""} />
          {config.hasBadge && <span className="sync-badge" />}
        </button>
      </Tooltip>
    </div>
  );
}
