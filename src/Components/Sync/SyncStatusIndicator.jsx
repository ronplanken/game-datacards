import React, { useState, useRef, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from "lucide-react";
import { useSync } from "../../Hooks/useSync";
import { useAuth } from "../../Hooks/useAuth";
import { Tooltip } from "../Tooltip/Tooltip";
import "./SyncStatusIndicator.css";

// Format relative time
const formatRelativeTime = (date) => {
  if (!date) return "Never";

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

export function SyncStatusIndicator() {
  const { user } = useAuth();
  const {
    globalSyncStatus,
    syncAll,
    syncAllDatasources,
    syncedCount,
    syncedCategoryCount,
    syncedDatasourceCount,
    pendingCount,
    errorCount,
    conflictCount,
    isSyncing,
    lastSyncTime,
    isOnline,
  } = useSync();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  // Get icon and styling based on status
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        className: "sync-status-indicator offline",
        tooltip: "Offline",
        showBadge: false,
      };
    }

    switch (globalSyncStatus) {
      case "syncing":
        return {
          icon: RefreshCw,
          className: "sync-status-indicator syncing",
          tooltip: "Syncing...",
          showBadge: false,
          isSpinning: true,
        };
      case "synced":
        return {
          icon: Cloud,
          className: "sync-status-indicator synced",
          tooltip: `All synced${lastSyncTime ? ` - ${formatRelativeTime(lastSyncTime)}` : ""}`,
          showBadge: false,
        };
      case "pending":
        return {
          icon: Cloud,
          className: "sync-status-indicator pending",
          tooltip: `${pendingCount} pending`,
          showBadge: true,
          badgeCount: pendingCount,
          badgeType: "warning",
        };
      case "error":
        return {
          icon: AlertCircle,
          className: "sync-status-indicator error",
          tooltip: `${errorCount} sync error${errorCount > 1 ? "s" : ""}`,
          showBadge: true,
          badgeCount: errorCount,
          badgeType: "error",
        };
      case "conflict":
        return {
          icon: AlertCircle,
          className: "sync-status-indicator conflict",
          tooltip: `${conflictCount} conflict${conflictCount > 1 ? "s" : ""}`,
          showBadge: true,
          badgeCount: conflictCount,
          badgeType: "warning",
        };
      default:
        // idle - no synced categories
        if (syncedCount === 0) {
          return null; // Don't show anything
        }
        return {
          icon: Cloud,
          className: "sync-status-indicator idle",
          tooltip: "Cloud sync",
          showBadge: false,
        };
    }
  };

  const config = getStatusConfig();

  // Don't render if no config (no synced categories)
  if (!config) {
    return null;
  }

  const IconComponent = config.icon;

  const handleSyncNow = async (e) => {
    e.stopPropagation();
    // Sync both categories and datasources
    await Promise.all([syncAll(), syncAllDatasources()]);
  };

  // Build the synced items description
  const getSyncedDescription = () => {
    const parts = [];
    if (syncedCategoryCount > 0) {
      parts.push(`${syncedCategoryCount} categor${syncedCategoryCount === 1 ? "y" : "ies"}`);
    }
    if (syncedDatasourceCount > 0) {
      parts.push(`${syncedDatasourceCount} datasource${syncedDatasourceCount === 1 ? "" : "s"}`);
    }
    if (parts.length === 0) return "Nothing synced";
    return parts.join(", ") + " synced";
  };

  return (
    <div className="sync-status-wrapper" ref={dropdownRef}>
      <Tooltip content={config.tooltip} placement="bottom">
        <button
          className={config.className}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-label={config.tooltip}>
          <IconComponent size={18} className={config.isSpinning ? "spinning" : ""} />
          {config.showBadge && (
            <span className={`sync-status-badge ${config.badgeType}`}>
              {config.badgeCount > 9 ? "9+" : config.badgeCount}
            </span>
          )}
        </button>
      </Tooltip>

      {isDropdownOpen && (
        <div className="sync-status-dropdown">
          <div className="sync-status-dropdown-header">
            <span className="sync-status-dropdown-title">Cloud Sync</span>
            {!isOnline && <span className="sync-status-offline-badge">Offline</span>}
          </div>

          <div className="sync-status-dropdown-content">
            <div className="sync-status-stat">
              <Cloud size={14} />
              <span>{getSyncedDescription()}</span>
            </div>

            {lastSyncTime && (
              <div className="sync-status-stat muted">
                <Check size={14} />
                <span>Last synced {formatRelativeTime(lastSyncTime)}</span>
              </div>
            )}

            {pendingCount > 0 && (
              <div className="sync-status-stat warning">
                <Cloud size={14} />
                <span>
                  {pendingCount} pending change{pendingCount > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {errorCount > 0 && (
              <div className="sync-status-stat error">
                <AlertCircle size={14} />
                <span>
                  {errorCount} sync error{errorCount > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {conflictCount > 0 && (
              <div className="sync-status-stat warning">
                <AlertCircle size={14} />
                <span>
                  {conflictCount} conflict{conflictCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {(pendingCount > 0 || errorCount > 0) && isOnline && (
            <div className="sync-status-dropdown-footer">
              <button className="sync-status-sync-btn" onClick={handleSyncNow} disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <RefreshCw size={14} className="spinning" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Sync Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
