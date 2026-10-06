import React from "react";

export const WarscrollStatWheel = ({ stats, grandAlliance }) => {
  const filterId = `textShadow${React.useId().replace(/:/g, "")}`;

  if (!stats) return null;

  return (
    <div className="stat-wheel-wrapper">
      <svg viewBox="0 0 100 100" className="stat-wheel-svg">
        {/* Drop shadow filter for text readability */}
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="1" floodColor="#000" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* Main Ring Border */}
        <circle cx="50" cy="50" r="48" className="wheel-ring" />

        {/* Quadrants */}
        {/* Top: Move (Black) */}
        <path d="M50 50 L16 16 A48 48 0 0 1 84 16 Z" className="wheel-quadrant" />
        {/* Right: Save (Green - always) */}
        <path d="M50 50 L84 16 A48 48 0 0 1 84 84 Z" className="wheel-quadrant-save" />
        {/* Bottom: Control (Black) */}
        <path d="M50 50 L84 84 A48 48 0 0 1 16 84 Z" className="wheel-quadrant" />
        {/* Left: Health (Black) */}
        <path d="M50 50 L16 84 A48 48 0 0 1 16 16 Z" className="wheel-quadrant" />

        {/* Gold Cross Dividers - meet in the middle */}
        <path d="M16 16 L84 84" className="wheel-divider" />
        <path d="M84 16 L16 84" className="wheel-divider" />

        {/* Text Labels */}
        {/* Move */}
        <text x="50" y="12" className="stat-label" filter={`url(#${filterId})`}>
          Move
        </text>
        <text x="50" y="26" className="stat-value" filter={`url(#${filterId})`}>
          {stats.move || "-"}
        </text>

        {/* Save */}
        <text x="88" y="52" className="stat-label rotate-90" filter={`url(#${filterId})`}>
          Save
        </text>
        <text x="74" y="52" className="stat-value" filter={`url(#${filterId})`}>
          {stats.save || "-"}
        </text>

        {/* Control */}
        <text x="50" y="91" className="stat-label" filter={`url(#${filterId})`}>
          Control
        </text>
        <text x="50" y="74" className="stat-value" filter={`url(#${filterId})`}>
          {stats.control || "-"}
        </text>

        {/* Health */}
        <text x="12" y="52" className="stat-label rotate-minus-90" filter={`url(#${filterId})`}>
          Health
        </text>
        <text x="26" y="52" className="stat-value" filter={`url(#${filterId})`}>
          {stats.health || "-"}
        </text>

        {/* Spikes on the rim (Decorative) */}
        <path d="M50 0 L52.4 4 L47.6 4 Z" className="wheel-spike" />
        <path d="M100 50 L96 52.4 L96 47.6 Z" className="wheel-spike" />
        <path d="M50 100 L47.6 96 L52.4 96 Z" className="wheel-spike" />
        <path d="M0 50 L4 47.6 L4 52.4 Z" className="wheel-spike" />
      </svg>
    </div>
  );
};
