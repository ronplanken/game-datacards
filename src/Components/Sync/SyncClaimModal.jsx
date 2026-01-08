import React from "react";
import { X, Cloud, AlertTriangle } from "lucide-react";
import "./SyncClaimModal.css";

export function SyncClaimModal({ isOpen, categoryName, onConfirm, onCancel }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="sync-claim-overlay" onClick={handleOverlayClick}>
      <div className="sync-claim-modal">
        <div className="sync-claim-header">
          <h3 className="sync-claim-title">Sync to your account?</h3>
          <button className="sync-claim-close" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="sync-claim-body">
          <div className="sync-claim-icon-wrapper">
            <div className="sync-claim-icon">
              <Cloud size={24} />
              <div className="sync-claim-icon-badge">
                <AlertTriangle size={12} />
              </div>
            </div>
          </div>

          <p className="sync-claim-description">
            <strong>&ldquo;{categoryName}&rdquo;</strong> was previously synced to another account.
          </p>
          <p className="sync-claim-subdescription">
            If you sync it to your account, it will be uploaded to your cloud storage. The original owner will no longer
            see updates to this category.
          </p>
        </div>

        <div className="sync-claim-footer">
          <button className="sync-claim-btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="sync-claim-btn primary" onClick={onConfirm}>
            <Cloud size={14} />
            Yes, sync to my account
          </button>
        </div>
      </div>
    </div>
  );
}
