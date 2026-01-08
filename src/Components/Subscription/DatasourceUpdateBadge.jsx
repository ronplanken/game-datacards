import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, Download, ChevronDown, Loader2 } from "lucide-react";
import { useDatasourceSharing } from "../../Hooks/useDatasourceSharing";
import { useAuth } from "../../Hooks/useAuth";
import "./DatasourceUpdateBadge.css";

export const DatasourceUpdateBadge = () => {
  const { user } = useAuth();
  const { availableUpdates, syncSubscription, syncAllSubscriptions, updateCount } = useDatasourceSharing();

  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSyncOne = async (update) => {
    setSyncingId(update.subscription_id);
    try {
      await syncSubscription(update.subscription_id, update.datasource_id);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await syncAllSubscriptions();
      setIsOpen(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if not logged in or no updates
  if (!user || updateCount === 0) {
    return null;
  }

  return (
    <div className="dub-container" ref={dropdownRef}>
      <button className="dub-badge-btn" onClick={() => setIsOpen(!isOpen)}>
        <RefreshCw size={14} className={isSyncing ? "dub-spinning" : ""} />
        <span className="dub-count">{updateCount}</span>
        <ChevronDown size={12} className={`dub-chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="dub-dropdown">
          <div className="dub-dropdown-header">
            <span className="dub-header-title">Datasource Updates</span>
            <span className="dub-header-subtitle">Subscribed datasources have new versions available</span>
          </div>

          <div className="dub-dropdown-content">
            {availableUpdates.map((update) => (
              <div key={update.subscription_id} className="dub-update-item">
                <div className="dub-update-info">
                  <span className="dub-update-name">{update.datasource_name}</span>
                  <span className="dub-update-version">
                    v{update.subscribed_version} → v{update.current_version}
                  </span>
                </div>
                <button
                  className="dub-update-btn"
                  onClick={() => handleSyncOne(update)}
                  disabled={syncingId === update.subscription_id}>
                  {syncingId === update.subscription_id ? (
                    <Loader2 size={12} className="dub-spinning" />
                  ) : (
                    <Download size={12} />
                  )}
                </button>
              </div>
            ))}
          </div>

          {availableUpdates.length > 1 && (
            <div className="dub-dropdown-footer">
              <button className="dub-update-all-btn" onClick={handleSyncAll} disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <Loader2 size={12} className="dub-spinning" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} />
                    Update All
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
