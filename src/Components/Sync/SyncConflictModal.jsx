import React from "react";
import { X, Cloud, Monitor, Copy, Trash2 } from "lucide-react";
import { useSync } from "../../Hooks/useSync";
import "./SyncConflictModal.css";

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleString();
};

export function SyncConflictModal({ conflict, onClose }) {
  const { resolveConflict } = useSync();

  if (!conflict) return null;

  const { uuid, name, localCategory, cloudCategory, localVersion, cloudVersion, type } = conflict;
  const isDeletedFromCloud = type === "deleted_from_cloud" || !cloudCategory;

  const handleKeepLocal = async () => {
    await resolveConflict(uuid, "local");
    onClose();
  };

  const handleKeepCloud = async () => {
    await resolveConflict(uuid, "cloud");
    onClose();
  };

  const handleKeepBoth = async () => {
    await resolveConflict(uuid, "both");
    onClose();
  };

  // Handlers for deleted_from_cloud case
  const handleKeepLocally = async () => {
    await resolveConflict(uuid, "keep_local");
    onClose();
  };

  const handleDeleteLocal = async () => {
    await resolveConflict(uuid, "delete_local");
    onClose();
  };

  // Render different UI for deleted_from_cloud case
  if (isDeletedFromCloud) {
    return (
      <div className="sync-conflict-overlay" onClick={onClose}>
        <div className="sync-conflict-modal" onClick={(e) => e.stopPropagation()}>
          <div className="sync-conflict-header">
            <h2 className="sync-conflict-title">Category Deleted</h2>
            <button className="sync-conflict-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="sync-conflict-body">
            <p className="sync-conflict-description">
              <strong>&ldquo;{name}&rdquo;</strong> was deleted on another device. What would you like to do with your
              local copy?
            </p>

            <div className="sync-conflict-deleted-info">
              <div className="sync-conflict-version local full-width">
                <div className="sync-conflict-version-header">
                  <Monitor size={16} />
                  <span>Local Copy</span>
                </div>
                <div className="sync-conflict-version-details">
                  <div className="sync-conflict-detail">
                    <span className="label">Cards:</span>
                    <span className="value">{localCategory?.cards?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sync-conflict-footer">
            <div className="sync-conflict-footer-main full-width">
              <button className="sync-conflict-btn primary" onClick={handleKeepLocally}>
                <Monitor size={14} />
                Keep Locally
              </button>
              <button className="sync-conflict-btn danger" onClick={handleDeleteLocal}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard version conflict UI
  return (
    <div className="sync-conflict-overlay" onClick={onClose}>
      <div className="sync-conflict-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sync-conflict-header">
          <h2 className="sync-conflict-title">Sync Conflict</h2>
          <button className="sync-conflict-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sync-conflict-body">
          <p className="sync-conflict-description">
            <strong>&ldquo;{name}&rdquo;</strong> was modified on another device. Choose which version to keep.
          </p>

          <div className="sync-conflict-comparison">
            <div className="sync-conflict-version local">
              <div className="sync-conflict-version-header">
                <Monitor size={16} />
                <span>Local Version</span>
              </div>
              <div className="sync-conflict-version-details">
                <div className="sync-conflict-detail">
                  <span className="label">Version:</span>
                  <span className="value">{localVersion}</span>
                </div>
                <div className="sync-conflict-detail">
                  <span className="label">Cards:</span>
                  <span className="value">{localCategory?.cards?.length || 0}</span>
                </div>
                <div className="sync-conflict-detail">
                  <span className="label">Modified:</span>
                  <span className="value">This device</span>
                </div>
              </div>
            </div>

            <div className="sync-conflict-vs">VS</div>

            <div className="sync-conflict-version cloud">
              <div className="sync-conflict-version-header">
                <Cloud size={16} />
                <span>Cloud Version</span>
              </div>
              <div className="sync-conflict-version-details">
                <div className="sync-conflict-detail">
                  <span className="label">Version:</span>
                  <span className="value">{cloudVersion}</span>
                </div>
                <div className="sync-conflict-detail">
                  <span className="label">Cards:</span>
                  <span className="value">{cloudCategory?.cards?.length || 0}</span>
                </div>
                <div className="sync-conflict-detail">
                  <span className="label">Modified:</span>
                  <span className="value">{formatDate(cloudCategory?.lastSyncedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sync-conflict-footer">
          <button className="sync-conflict-btn secondary" onClick={handleKeepBoth}>
            <Copy size={14} />
            Keep Both
          </button>
          <div className="sync-conflict-footer-main">
            <button className="sync-conflict-btn primary" onClick={handleKeepLocal}>
              <Monitor size={14} />
              Keep Local
            </button>
            <button className="sync-conflict-btn primary" onClick={handleKeepCloud}>
              <Cloud size={14} />
              Keep Cloud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component to show all conflicts and handle them one by one
export function SyncConflictHandler() {
  const { conflicts } = useSync();
  const [currentConflictIndex, setCurrentConflictIndex] = React.useState(0);

  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  const currentConflict = conflicts[currentConflictIndex];

  const handleClose = () => {
    if (currentConflictIndex < conflicts.length - 1) {
      setCurrentConflictIndex(currentConflictIndex + 1);
    } else {
      setCurrentConflictIndex(0);
    }
  };

  return <SyncConflictModal conflict={currentConflict} onClose={handleClose} />;
}
