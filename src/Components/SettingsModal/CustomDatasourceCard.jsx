import React from "react";
import { Globe, FileJson, Trash2, Upload, Share2, Link, User } from "lucide-react";
import { Toggle } from "./Toggle";
import "./CustomDatasourceCard.css";

export const CustomDatasourceCard = ({
  datasource,
  isActive,
  isGhost,
  onToggle,
  onDelete,
  onCheckUpdate,
  isCheckingUpdate,
  onUpload,
  onPublish,
  isUploading,
  canUpload = false,
}) => {
  const { name, cardCount, sourceType, version, author, lastUpdated, isSubscribed, authorName, isPublished, cloudId } =
    datasource;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!isGhost && !isSubscribed) onDelete?.();
  };

  const handleCheckUpdate = (e) => {
    e.stopPropagation();
    if (!isGhost) onCheckUpdate?.();
  };

  const handleUpload = (e) => {
    e.stopPropagation();
    if (canUpload && onUpload) onUpload();
  };

  const handlePublish = (e) => {
    e.stopPropagation();
    if (cloudId && onPublish) onPublish();
  };

  // Only show delete button if not active, not ghost, and not subscribed
  const showDeleteButton = !isActive && !isGhost && !isSubscribed && onDelete;
  // Show upload button for non-subscribed, non-uploaded datasources when user can upload
  const showUploadButton = isActive && !isSubscribed && !cloudId && canUpload && onUpload;
  // Show publish button for uploaded but not published datasources
  const showPublishButton = isActive && !isSubscribed && cloudId && !isPublished && onPublish;

  return (
    <div
      className={`datasource-card custom ${isActive ? "active" : ""} ${isGhost ? "ghost" : ""} ${
        isSubscribed ? "subscribed" : ""
      }`}>
      <div className="datasource-card-header">
        <div className="datasource-card-title-group">
          <span className="datasource-card-source-icon">
            {isSubscribed ? <Link size={12} /> : sourceType === "url" ? <Globe size={12} /> : <FileJson size={12} />}
          </span>
          <span className="datasource-card-title">{name}</span>
          {isSubscribed && <span className="datasource-subscribed-badge">Subscribed</span>}
          <span className="datasource-card-count-badge">
            {cardCount || 0} card{cardCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="datasource-card-actions">
          {isActive && sourceType === "url" && onCheckUpdate && !isSubscribed && (
            <button className="datasource-update-btn" onClick={handleCheckUpdate} disabled={isCheckingUpdate}>
              {isCheckingUpdate && <span className="loading-spinner" />}
              Check for updates
            </button>
          )}
          {showUploadButton && (
            <button className="datasource-upload-btn" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? <span className="loading-spinner" /> : <Upload size={14} />}
              Upload
            </button>
          )}
          {showPublishButton && (
            <button className="datasource-publish-btn" onClick={handlePublish}>
              <Share2 size={14} />
              Publish
            </button>
          )}
          {showDeleteButton && (
            <button className="datasource-delete-btn" onClick={handleDelete} title="Delete datasource">
              <Trash2 size={14} />
            </button>
          )}
          {(isGhost || !isActive) && !isSubscribed && (
            <Toggle checked={isGhost} onChange={onToggle} disabled={isGhost} />
          )}
        </div>
      </div>
      {isActive && (
        <div className="datasource-details">
          <div className="datasource-detail-item">
            <span className="datasource-detail-label">Version</span>
            <span className="datasource-detail-value">{version}</span>
          </div>
          {(author || authorName) && (
            <div className="datasource-detail-item">
              <span className="datasource-detail-label">Author</span>
              <span className="datasource-detail-value">
                {isSubscribed && <User size={10} style={{ marginRight: 4 }} />}
                {authorName || author}
              </span>
            </div>
          )}
          <div className="datasource-detail-item">
            <span className="datasource-detail-label">Updated</span>
            <span className="datasource-detail-value">{formatDate(lastUpdated)}</span>
          </div>
          <div className="datasource-detail-item">
            <span className="datasource-detail-label">Source</span>
            <span className="datasource-detail-value">
              {isSubscribed ? "Community" : sourceType === "url" ? "External URL" : "Local File"}
            </span>
          </div>
          {isPublished && (
            <div className="datasource-detail-item">
              <span className="datasource-detail-label">Status</span>
              <span className="datasource-detail-value datasource-published-status">
                <Share2 size={10} /> Published
              </span>
            </div>
          )}
          {cloudId && !isPublished && (
            <div className="datasource-detail-item">
              <span className="datasource-detail-label">Status</span>
              <span className="datasource-detail-value datasource-uploaded-status">
                <Upload size={10} /> Uploaded (Private)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
