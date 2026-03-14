import React from "react";
import { DsAosRightStats } from "./DsAosStatBadges";

/**
 * Schema-driven AoS warscroll header.
 * Replaces the native WarscrollHeader for datasource cards so that
 * right-position stats (ward/wizard/priest/custom) are fully schema-driven
 * instead of hardcoded.
 */
export const DsAosHeader = ({
  card,
  faction,
  grandAlliance,
  stats,
  statFields,
  imageUrl,
  imageOpacity,
  imagePositionX,
  imagePositionY,
  imageScale,
  isMobile = false,
}) => {
  const opacity = (imageOpacity ?? 30) / 100;
  const posX = imagePositionX || 0;
  const posY = imagePositionY || 0;
  const scale = (imageScale ?? 100) / 100;

  return (
    <div className="warscroll-header">
      {/* Background Image */}
      {imageUrl && (
        <div
          className="warscroll-header-image"
          style={{
            backgroundImage: `url(${imageUrl})`,
            opacity: opacity,
            backgroundPosition: `calc(50% + ${posX}px) calc(50% + ${posY}px)`,
            backgroundSize: `${scale * 100}%`,
          }}
        />
      )}

      {/* Points Badge and right-position stat badges - desktop only */}
      {!isMobile && (
        <div className="desktop-badges">
          {card.points && (
            <div className="points-badge">
              <span className="points-value">{card.points}</span>
              <span className="points-label">PTS</span>
            </div>
          )}
          <DsAosRightStats stats={stats} statFields={statFields} grandAlliance={grandAlliance} inline />
        </div>
      )}

      {/* Header Content */}
      <div className="header-content">
        <div className="warscroll-faction-banner">
          • {faction?.name?.toUpperCase() || card.factions?.[0]?.toUpperCase()} WARSCROLL •
        </div>
        <h1 className="warscroll-unit-name">{card.name || "Untitled Warscroll"}</h1>
        {card.subname && <div className="warscroll-subtitle">{card.subname}</div>}
      </div>

      {/* Mobile Badges Row - below unit name */}
      {isMobile && (
        <div className="mobile-badges-row">
          <DsAosRightStats stats={stats} statFields={statFields} grandAlliance={grandAlliance} flat />
          {card.points && (
            <div className="points-badge">
              <span className="points-value">{card.points}</span>
              <span className="points-label">PTS</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
