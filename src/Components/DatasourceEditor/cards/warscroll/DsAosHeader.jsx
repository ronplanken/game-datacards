import React from "react";
import { DsAosRightStats, DsAosAboveStats } from "./DsAosStatBadges";

const resolvePoints = (points) => {
  if (points == null) return null;
  if (typeof points === "number" || typeof points === "string") return points;
  if (Array.isArray(points)) {
    const active = points.find((p) => p.active) || points[0];
    return active?.cost ?? null;
  }
  return null;
};

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
  metadata,
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

  const hasAboveStats = (statFields || []).some((f) => f.position === "above");
  const headerClassName = `warscroll-header${hasAboveStats ? " has-above-stats" : ""}`;

  return (
    <div className={headerClassName}>
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
          {resolvePoints(card.points) != null && (
            <div className="points-badge">
              <span className="points-value">{resolvePoints(card.points)}</span>
              <span className="points-label">PTS</span>
            </div>
          )}
          <DsAosRightStats stats={stats} statFields={statFields} grandAlliance={grandAlliance} inline />
        </div>
      )}

      {/* Above stats - rendered above the name, pushes name down */}
      <DsAosAboveStats stats={stats} statFields={statFields} />

      {/* Header Content */}
      <div className="header-content">
        {(() => {
          const bannerType = metadata?.bannerType || "faction";
          if (bannerType === "hidden") return null;
          let bannerText;
          if (bannerType === "custom") {
            bannerText = metadata?.bannerCustomText;
          } else {
            bannerText = `• ${faction?.name?.toUpperCase() || card.factions?.[0]?.toUpperCase()} WARSCROLL •`;
          }
          return bannerText ? <div className="warscroll-faction-banner">{bannerText}</div> : null;
        })()}
        <h1 className="warscroll-unit-name">{card.name || "Untitled Warscroll"}</h1>
        {card.subname && <div className="warscroll-subtitle">{card.subname}</div>}
      </div>

      {/* Mobile Badges Row - below unit name */}
      {isMobile && (
        <div className="mobile-badges-row">
          <DsAosRightStats stats={stats} statFields={statFields} grandAlliance={grandAlliance} flat />
          {resolvePoints(card.points) != null && (
            <div className="points-badge">
              <span className="points-value">{resolvePoints(card.points)}</span>
              <span className="points-label">PTS</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
