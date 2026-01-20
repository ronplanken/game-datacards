import React from "react";
import { Globe, FileJson, Trash2 } from "lucide-react";
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
}) => {
  const { name, cardCount, sourceType, version, author, lastUpdated } = datasource;

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
    if (!isGhost) onDelete();
  };

  const handleCheckUpdate = (e) => {
    e.stopPropagation();
    if (!isGhost) onCheckUpdate();
  };

  return (
    <div className={`datasource-card custom ${isActive ? "active" : ""} ${isGhost ? "ghost" : ""}`}>
      <div className="datasource-card-header">
        <div className="datasource-card-title-group">
          <span className="datasource-card-source-icon">
            {sourceType === "url" ? <Globe size={12} /> : <FileJson size={12} />}
          </span>
          <span className="datasource-card-title">{name}</span>
          <span className="datasource-card-count-badge">
            {cardCount || 0} card{cardCount !== 1 ? "s" : ""}
          </span>
          {isGhost && <span className="datasource-card-ghost-label">Currently active</span>}
        </div>
        {!isGhost && (
          <div className="datasource-card-actions">
            {isActive && sourceType === "url" && onCheckUpdate && (
              <button className="datasource-update-btn" onClick={handleCheckUpdate} disabled={isCheckingUpdate}>
                {isCheckingUpdate && <span className="loading-spinner" />}
                Check for updates
              </button>
            )}
            <button className="datasource-delete-btn" onClick={handleDelete} title="Delete datasource">
              <Trash2 size={14} />
            </button>
            <Toggle checked={isActive} onChange={onToggle} disabled={isActive} />
          </div>
        )}
      </div>
      {isActive && (
        <div className="datasource-details">
          <div className="datasource-detail-item">
            <span className="datasource-detail-label">Version</span>
            <span className="datasource-detail-value">{version}</span>
          </div>
          {author && (
            <div className="datasource-detail-item">
              <span className="datasource-detail-label">Author</span>
              <span className="datasource-detail-value">{author}</span>
            </div>
          )}
          <div className="datasource-detail-item">
            <span className="datasource-detail-label">Updated</span>
            <span className="datasource-detail-value">{formatDate(lastUpdated)}</span>
          </div>
          <div className="datasource-detail-item">
            <span className="datasource-detail-label">Source</span>
            <span className="datasource-detail-value">{sourceType === "url" ? "External URL" : "Local File"}</span>
          </div>
        </div>
      )}
    </div>
  );
};
