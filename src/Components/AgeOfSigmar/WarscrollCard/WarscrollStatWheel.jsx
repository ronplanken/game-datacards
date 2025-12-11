import React from "react";

export const WarscrollStatWheel = ({ stats, grandAlliance }) => {
  if (!stats) return null;

  return (
    <div className="stat-wheel-wrapper">
      <svg viewBox="0 0 100 100" className="stat-wheel-svg">
        {/* Main Ring Border */}
        <circle cx="50" cy="50" r="48" fill="#111" stroke="#8c7335" strokeWidth="3" />

        {/* Quadrants */}
        {/* Top: Move (Black) */}
        <path d="M50 50 L16 16 A48 48 0 0 1 84 16 Z" fill="#050505" stroke="none" />
        {/* Right: Save (Green - always) */}
        <path d="M50 50 L84 16 A48 48 0 0 1 84 84 Z" fill="#3a5228" stroke="none" />
        {/* Bottom: Control (Black) */}
        <path d="M50 50 L84 84 A48 48 0 0 1 16 84 Z" fill="#050505" stroke="none" />
        {/* Left: Health (Black) */}
        <path d="M50 50 L16 84 A48 48 0 0 1 16 16 Z" fill="#050505" stroke="none" />

        {/* Gold Cross Dividers */}
        <path d="M16 16 L84 84" stroke="#8c7335" strokeWidth="2.5" />
        <path d="M84 16 L16 84" stroke="#8c7335" strokeWidth="2.5" />

        {/* Inner Center Circle (Black with gold rim) */}
        <circle cx="50" cy="50" r="14" fill="#000" stroke="#8c7335" strokeWidth="2" />

        {/* Text Labels */}
        {/* Move */}
        <text x="50" y="12" className="stat-label">
          Move
        </text>
        <text x="50" y="26" className="stat-value">
          {stats.move || "-"}
        </text>

        {/* Save */}
        <text x="88" y="52" className="stat-label rotate-90">
          Save
        </text>
        <text x="74" y="52" className="stat-value">
          {stats.save || "-"}
        </text>

        {/* Control */}
        <text x="50" y="91" className="stat-label">
          Control
        </text>
        <text x="50" y="74" className="stat-value">
          {stats.control || "-"}
        </text>

        {/* Health */}
        <text x="12" y="52" className="stat-label rotate-minus-90">
          Health
        </text>
        <text x="26" y="52" className="stat-value">
          {stats.health || "-"}
        </text>

        {/* Spikes on the rim (Decorative) */}
        <path d="M50 0 L53 5 L47 5 Z" fill="#ffe082" />
        <path d="M100 50 L95 53 L95 47 Z" fill="#ffe082" />
        <path d="M50 100 L47 95 L53 95 Z" fill="#ffe082" />
        <path d="M0 50 L5 47 L5 53 Z" fill="#ffe082" />
      </svg>
    </div>
  );
};
