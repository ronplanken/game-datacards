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
  isMobile = false,
}) => {
  const opacity = (imageOpacity ?? 30) / 100;
  const posX = imagePositionX || 0;
  const posY = imagePositionY || 0;
  const scale = (imageScale ?? 100) / 100;

  const ward = warscroll.stats?.ward;
  const wizard = warscroll.stats?.wizard;
  const priest = warscroll.stats?.priest;

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

      {/* Points Badge and stat badges - desktop only */}
      {!isMobile && (
        <div className="desktop-badges">
          {warscroll.points && (
            <div className="points-badge">
              <span className="points-value">{warscroll.points}</span>
              <span className="points-label">PTS</span>
            </div>
          )}
          {ward && (
            <div className="stat-badge ward-badge">
              <span className="badge-value">{ward}</span>
              <span className="badge-label">Ward</span>
            </div>
          )}
          {wizard && (
            <div className="stat-badge wizard-badge">
              <span className="badge-value">{wizard}</span>
              <span className="badge-label">Wizard</span>
            </div>
          )}
          {priest && (
            <div className="stat-badge priest-badge">
              <span className="badge-value">{priest}</span>
              <span className="badge-label">Priest</span>
            </div>
          )}
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

      {/* Mobile Badges Row */}
      {isMobile && (
        <div className="mobile-badges-row">
          {ward && (
            <div className="stat-badge ward-badge">
              <span className="badge-value">{ward}</span>
              <span className="badge-label">Ward</span>
            </div>
          )}
          {warscroll.points && (
            <div className="points-badge">
              <span className="points-value">{warscroll.points}</span>
              <span className="points-label">PTS</span>
            </div>
          )}
          {wizard && (
            <div className="stat-badge wizard-badge">
              <span className="badge-value">{wizard}</span>
              <span className="badge-label">Wizard</span>
            </div>
          )}
          {priest && (
            <div className="stat-badge priest-badge">
              <span className="badge-value">{priest}</span>
              <span className="badge-label">Priest</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
