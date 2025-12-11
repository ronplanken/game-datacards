import React from "react";

export const WarscrollHeader = ({
  warscroll,
  faction,
  grandAlliance,
  imageUrl,
  imageOpacity,
  imagePositionX,
  imagePositionY,
  imageScale,
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
