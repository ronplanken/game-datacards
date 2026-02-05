import React, { useState } from "react";
import { Globe, Upload, X, Loader2 } from "lucide-react";
import { useDatasourceSharing, GAME_SYSTEMS } from "../../Hooks/useDatasourceSharing";
import { useCardStorage } from "../../Hooks/useCardStorage";
import "./PublishDatasourceModal.css";

export const PublishDatasourceModal = ({ datasource, isOpen, onClose, onSuccess }) => {
  const { publishLocalDatasource, pushDatasourceUpdate } = useDatasourceSharing();
  const { updateDatasourceCloudState } = useCardStorage();

  const [description, setDescription] = useState("");
  const [gameSystem, setGameSystem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is a publish or push update modal
  const isPublished = datasource?.isPublished;
  const mode = isPublished ? "push" : "publish";

  const handlePublish = async () => {
    if (!datasource?.cloudId) return;

    setIsLoading(true);
    try {
      const result = await publishLocalDatasource(datasource.cloudId, {
        description: description.trim() || null,
        gameSystem: gameSystem || null,
      });

      if (result.success) {
        // Update local state
        updateDatasourceCloudState(datasource.uuid, {
          isPublished: true,
          shareCode: result.shareCode,
          publishedVersion: result.versionNumber,
        });
        onSuccess?.(result.shareCode);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushUpdate = async () => {
    if (!datasource?.cloudId) return;

    setIsLoading(true);
    try {
      const result = await pushDatasourceUpdate(datasource.cloudId);

      if (result.success) {
        // Update local state with new version
        updateDatasourceCloudState(datasource.uuid, {
          publishedVersion: result.newVersionNumber,
        });
        onSuccess?.(null, result.newVersionNumber);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !datasource) return null;

  return (
    <div className="pdm-modal-overlay" onClick={handleOverlayClick}>
      <div className="pdm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pdm-modal-header">
          <span className="pdm-modal-title">
            {mode === "push" ? <Upload size={18} /> : <Globe size={18} />}
            {mode === "push" ? "Push Update" : "Publish Datasource"}
          </span>
          <button className="pdm-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="pdm-modal-content">
          {mode === "push" ? (
            <>
              <p className="pdm-description">
                Push your latest changes to &quot;{datasource.name}&quot; to all subscribers.
              </p>

              {datasource.publishedVersion && (
                <div className="pdm-version-info">
                  <span className="pdm-version-label">Current version:</span>
                  <span className="pdm-version-number">v{datasource.publishedVersion}</span>
                  <span className="pdm-version-arrow">→</span>
                  <span className="pdm-version-number new">v{datasource.publishedVersion + 1}</span>
                </div>
              )}

              <div className="pdm-info-box">
                <p>Subscribers will be notified of this update and can sync to get your latest changes.</p>
              </div>
            </>
          ) : (
            <>
              <p className="pdm-description">
                Publishing &quot;{datasource.name}&quot; will make it available for other users to discover and
                subscribe to.
              </p>

              <div className="pdm-form-group">
                <label className="pdm-label">Description (optional)</label>
                <textarea
                  className="pdm-textarea"
                  placeholder="Describe what this datasource contains..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
                <span className="pdm-char-count">{description.length}/500</span>
              </div>

              <div className="pdm-form-group">
                <label className="pdm-label">Game System</label>
                <select className="pdm-select" value={gameSystem} onChange={(e) => setGameSystem(e.target.value)}>
                  <option value="">Select a game system...</option>
                  {GAME_SYSTEMS.map((gs) => (
                    <option key={gs.value} value={gs.value}>
                      {gs.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pdm-info-box">
                <p>Once published, you can:</p>
                <ul>
                  <li>Share a direct link with others</li>
                  <li>Update the datasource and subscribers will be notified</li>
                  <li>See download and subscriber counts</li>
                  <li>Unpublish at any time</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pdm-modal-footer">
          <button className="pdm-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="pdm-btn primary"
            onClick={mode === "push" ? handlePushUpdate : handlePublish}
            disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={14} className="pdm-spinner" />
                {mode === "push" ? "Pushing..." : "Publishing..."}
              </>
            ) : (
              <>
                {mode === "push" ? <Upload size={14} /> : <Globe size={14} />}
                {mode === "push" ? "Push Update" : "Publish"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
