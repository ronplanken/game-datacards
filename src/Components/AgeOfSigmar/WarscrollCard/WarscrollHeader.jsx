import React from "react";

export const WarscrollHeader = ({ warscroll, faction, grandAlliance }) => {
  return (
    <div className="warscroll-header">
      {/* Points Badge */}
      {warscroll.points && (
        <div className="points-badge">
          <span className="points-value">{warscroll.points}</span>
          <span className="points-label">PTS</span>
        </div>
      )}

      {/* Header Content - Centered */}
      <div className="header-content">
        <div className="warscroll-faction-banner">
          • {faction?.name?.toUpperCase() || warscroll.factions?.[0]?.toUpperCase()} WARSCROLL •
        </div>
        <h1 className="warscroll-unit-name">{warscroll.name}</h1>
        {warscroll.subname && <div className="warscroll-subtitle">{warscroll.subname}</div>}
      </div>
    </div>
  );
};
