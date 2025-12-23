import React from "react";

export const WarscrollStatBadges = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stat-badges-wrapper">
      <div className="stat-badges-row">
        <div className="core-stat-badge move-badge">
          <span className="badge-value">{stats.move || "-"}</span>
          <span className="badge-label">Move</span>
        </div>
        <div className="core-stat-badge save-badge">
          <span className="badge-value">{stats.save || "-"}</span>
          <span className="badge-label">Save</span>
        </div>
        <div className="core-stat-badge control-badge">
          <span className="badge-value">{stats.control || "-"}</span>
          <span className="badge-label">Control</span>
        </div>
        <div className="core-stat-badge health-badge">
          <span className="badge-value">{stats.health || "-"}</span>
          <span className="badge-label">Health</span>
        </div>
      </div>
    </div>
  );
};
