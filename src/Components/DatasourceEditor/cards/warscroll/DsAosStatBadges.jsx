import React from "react";

/**
 * Resolves display value for a stat field, handling booleans.
 */
const resolveStatValue = (value, field) => {
  if (field.type === "boolean") {
    return value ? field.onValue || "Yes" : field.offValue || "-";
  }
  return value || "-";
};

/**
 * Schema-driven left stat badges for AoS warscrolls.
 * Renders stat fields with position "left" (or no position) as a 2-column grid
 * in the stat-display-area.
 */
export const DsAosLeftStats = ({ stats, statFields, grandAlliance }) => {
  const leftFields = (statFields || []).filter((f) => f.position !== "right");

  if (leftFields.length === 0) return null;

  return (
    <div className="stat-badges-wrapper" data-testid="ds-aos-left-stats">
      <div className="ds-aos-left-grid">
        {leftFields.map((field) => {
          const value = resolveStatValue(stats?.[field.key], field);
          const badgeStyle = field.color ? { background: field.color } : undefined;
          return (
            <div className="core-stat-badge" key={field.key} style={badgeStyle}>
              <span className="badge-value">{value}</span>
              <span className="badge-label">{field.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Schema-driven right stat badges for AoS warscrolls.
 * Renders stat fields with position "right" as header badges.
 * Only renders fields that have a non-empty value.
 *
 * When `inline` is true, renders badges as a fragment (for embedding
 * inside an existing container like DsAosHeader's desktop-badges div).
 */
export const DsAosRightStats = ({ stats, statFields, grandAlliance, inline, flat }) => {
  const rightFields = (statFields || []).filter((f) => f.position === "right");

  if (rightFields.length === 0) return null;

  const visibleFields = rightFields.filter((field) => {
    const val = stats?.[field.key];
    return val !== undefined && val !== null && val !== "";
  });

  if (visibleFields.length === 0) return null;

  const badges = visibleFields.map((field) => {
    const value = resolveStatValue(stats?.[field.key], field);
    const badgeStyle = field.color ? { background: field.color } : undefined;
    return (
      <div className="stat-badge" key={field.key} style={badgeStyle}>
        <span className="badge-value">{value}</span>
        <span className="badge-label">{field.label}</span>
      </div>
    );
  });

  if (flat) {
    return <>{badges}</>;
  }

  if (inline) {
    return <div className="ds-aos-right-grid">{badges}</div>;
  }

  return (
    <div className="desktop-badges" data-testid="ds-aos-right-stats">
      <div className="ds-aos-right-grid">{badges}</div>
    </div>
  );
};
