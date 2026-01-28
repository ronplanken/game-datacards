import React, { useState } from "react";
import { ArrowLeft, X, Download, Users, Database, Check, Share2, Copy, Loader2 } from "lucide-react";
import { message } from "../Toast/message";
import { useDatasourceSharing, GAME_SYSTEMS } from "../../Hooks/useDatasourceSharing";
import { useAuth } from "../../Premium";
import "./DatasourceDetailModal.css";

export const DatasourceDetailModal = ({ datasource, isOpen, onClose }) => {
  const { user } = useAuth();
  const { subscribeToDatasource, unsubscribeFromDatasource } = useDatasourceSharing();

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(datasource?.is_subscribed || false);

  const gameSystemLabel =
    GAME_SYSTEMS.find((gs) => gs.value === datasource?.game_system)?.label || datasource?.game_system;

  const handleSubscribe = async () => {
    if (!user) {
      message.warning("Please sign in to subscribe to datasources");
      return;
    }

    setIsSubscribing(true);
    try {
      const result = await subscribeToDatasource(datasource.id);
      if (result.success) {
        setIsSubscribed(true);
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsSubscribing(true);
    try {
      const result = await unsubscribeFromDatasource(datasource.id);
      if (result.success) {
        setIsSubscribed(false);
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/d/${datasource.share_code}`;
    navigator.clipboard.writeText(shareUrl);
    message.success("Share link copied to clipboard");
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !datasource) return null;

  return (
    <div className="dsd-modal-overlay" onClick={handleOverlayClick}>
      <div className="dsd-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dsd-modal-header">
          <button className="dsd-back-btn" onClick={onClose}>
            <ArrowLeft size={18} />
          </button>
          <span className="dsd-modal-title">{datasource.name}</span>
          <button className="dsd-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="dsd-modal-content">
          {/* Meta info */}
          <div className="dsd-meta-bar">
            <div className="dsd-author">
              <Database size={14} />
              <span>by {datasource.author_name || "Unknown"}</span>
            </div>
            <div className="dsd-meta-badges">
              {gameSystemLabel && <span className="dsd-game-badge">{gameSystemLabel}</span>}
              <span className="dsd-version-badge">v{datasource.version || "1.0"}</span>
            </div>
          </div>

          {/* Description */}
          {datasource.description && (
            <div className="dsd-description">
              <p>{datasource.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="dsd-stats-row">
            <div className="dsd-stat-item">
              <Download size={16} />
              <span className="dsd-stat-value">{formatNumber(datasource.downloads || 0)}</span>
              <span className="dsd-stat-label">Downloads</span>
            </div>
            <div className="dsd-stat-item">
              <Users size={16} />
              <span className="dsd-stat-value">{formatNumber(datasource.subscriber_count || 0)}</span>
              <span className="dsd-stat-label">Subscribers</span>
            </div>
          </div>

          {/* Share link */}
          {datasource.share_code && (
            <div className="dsd-share-section">
              <div className="dsd-share-label">
                <Share2 size={14} />
                <span>Share Link</span>
              </div>
              <div className="dsd-share-input-group">
                <input
                  type="text"
                  className="dsd-share-input"
                  value={`${window.location.origin}/d/${datasource.share_code}`}
                  readOnly
                />
                <button className="dsd-copy-btn" onClick={handleCopyShareLink}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dsd-modal-footer">
          <button className="dsd-btn secondary" onClick={onClose}>
            Close
          </button>

          {isSubscribed ? (
            <button className="dsd-btn danger" onClick={handleUnsubscribe} disabled={isSubscribing}>
              {isSubscribing ? (
                <>
                  <Loader2 size={14} className="dsd-spinner" />
                  Processing...
                </>
              ) : (
                "Unsubscribe"
              )}
            </button>
          ) : (
            <button
              className="dsd-btn primary"
              onClick={handleSubscribe}
              disabled={isSubscribing || datasource.author_id === user?.id}>
              {isSubscribing ? (
                <>
                  <Loader2 size={14} className="dsd-spinner" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Subscribe
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}
