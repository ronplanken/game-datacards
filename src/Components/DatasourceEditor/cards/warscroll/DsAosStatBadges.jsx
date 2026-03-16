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

const badgeClassName = (base, field) => {
  return field.width === "fit" ? `${base} fit-content` : base;
};

const VERTICAL_POSITIONS = ["right", "above", "below"];

/**
 * Schema-driven left stat badges for AoS warscrolls.
 * Renders stat fields with position "left" (or no position) as a 2-column grid
 * in the stat-display-area.
 */
export const DsAosLeftStats = ({ stats, statFields, grandAlliance }) => {
  const leftFields = (statFields || []).filter((f) => !VERTICAL_POSITIONS.includes(f.position));

  if (leftFields.length === 0) return null;

  return (
    <div className="stat-badges-wrapper" data-testid="ds-aos-left-stats">
      <div className="ds-aos-left-grid">
        {leftFields.map((field) => {
          const value = resolveStatValue(stats?.[field.key], field);
          const badgeStyle = field.color ? { background: field.color } : undefined;
          return (
            <div className={badgeClassName("core-stat-badge", field)} key={field.key} style={badgeStyle}>
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
      <div className={badgeClassName("stat-badge", field)} key={field.key} style={badgeStyle}>
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

/**
 * Schema-driven "above" stat badges for AoS warscrolls.
 * Renders stat fields with position "above" in the header area, above the unit name.
 * Uses the same core-stat-badge styling as left stats, respecting color and special.
 */
export const DsAosAboveStats = ({ stats, statFields }) => {
  const aboveFields = (statFields || []).filter((f) => f.position === "above");

  if (aboveFields.length === 0) return null;

  const visibleFields = aboveFields.filter((field) => {
    if (field.special && field.hideWhenEmpty) {
      const val = stats?.[field.key];
      return val !== undefined && val !== null && val !== "";
    }
    return true;
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="ds-aos-above-stats" data-testid="ds-aos-above-stats">
      {visibleFields.map((field) => {
        const value = resolveStatValue(stats?.[field.key], field);
        const badgeStyle = {};
        if (field.special && field.specialColor) {
          badgeStyle.background = field.specialColor;
        } else if (field.color) {
          badgeStyle.background = field.color;
        }
        return (
          <div
            className={badgeClassName("core-stat-badge", field)}
            key={field.key}
            style={Object.keys(badgeStyle).length ? badgeStyle : undefined}>
            <span className="badge-value">{value}</span>
            <span className="badge-label">{field.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Schema-driven "below" stat badges for AoS warscrolls.
 * Renders stat fields with position "below" centered beneath the header/name block.
 * Uses core-stat-badge styling, respecting color and special.
 */
export const DsAosBelowStats = ({ stats, statFields }) => {
  const belowFields = (statFields || []).filter((f) => f.position === "below");

  if (belowFields.length === 0) return null;

  const visibleFields = belowFields.filter((field) => {
    if (field.special && field.hideWhenEmpty) {
      const val = stats?.[field.key];
      return val !== undefined && val !== null && val !== "";
    }
    return true;
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="ds-aos-below-stats" data-testid="ds-aos-below-stats">
      {visibleFields.map((field) => {
        const value = resolveStatValue(stats?.[field.key], field);
        const badgeStyle = {};
        if (field.special && field.specialColor) {
          badgeStyle.background = field.specialColor;
        } else if (field.color) {
          badgeStyle.background = field.color;
        }
        return (
          <div
            className={badgeClassName("core-stat-badge", field)}
            key={field.key}
            style={Object.keys(badgeStyle).length ? badgeStyle : undefined}>
            <span className="badge-value">{value}</span>
            <span className="badge-label">{field.label}</span>
          </div>
        );
      })}
    </div>
  );
};
