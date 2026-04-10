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

const resolveBadgeBase = (defaultBase, field) => {
  if (field.size === "small") return "stat-badge";
  if (field.size === "large") return "core-stat-badge";
  return defaultBase;
};

const badgeClassName = (defaultBase, field) => {
  const base = resolveBadgeBase(defaultBase, field);
  return field.width === "fit" ? `${base} fit-content` : base;
};

const resolveBadgeStyle = (field) => {
  if (field.special && field.specialColor) return { background: field.specialColor };
  if (field.color) return { background: field.color };
  return undefined;
};

const filterVisible = (fields, stats) =>
  fields.filter((field) => {
    if (field.special && field.hideWhenEmpty) {
      const val = stats?.[field.key];
      return val !== undefined && val !== null && val !== "";
    }
    return true;
  });

const VERTICAL_POSITIONS = ["right", "above", "below"];

/**
 * Renders a list of stat badge elements.
 */
const renderBadges = (fields, stats, defaultBadgeClass) =>
  fields.map((field) => {
    const value = resolveStatValue(stats?.[field.key], field);
    return (
      <div className={badgeClassName(defaultBadgeClass, field)} key={field.key} style={resolveBadgeStyle(field)}>
        <span className="badge-value">{value}</span>
        <span className="badge-label">{field.label}</span>
      </div>
    );
  });

/**
 * Schema-driven left stat badges for AoS warscrolls.
 * Renders stat fields with position "left" (or no position) as a 2-column grid
 * in the stat-display-area.
 */
export const DsAosLeftStats = ({ stats, statFields, grandAlliance }) => {
  const leftFields = (statFields || []).filter((f) => !VERTICAL_POSITIONS.includes(f.position));
  const visibleFields = filterVisible(leftFields, stats);

  if (visibleFields.length === 0) return null;

  return (
    <div className="stat-badges-wrapper" data-testid="ds-aos-left-stats">
      <div className="ds-aos-left-grid">{renderBadges(visibleFields, stats, "core-stat-badge")}</div>
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

  const badges = renderBadges(visibleFields, stats, "stat-badge");

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
  const visibleFields = filterVisible(aboveFields, stats);

  if (visibleFields.length === 0) return null;

  return (
    <div className="ds-aos-above-stats" data-testid="ds-aos-above-stats">
      {renderBadges(visibleFields, stats, "core-stat-badge")}
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
  const visibleFields = filterVisible(belowFields, stats);

  if (visibleFields.length === 0) return null;

  return (
    <div className="ds-aos-below-stats" data-testid="ds-aos-below-stats">
      {renderBadges(visibleFields, stats, "core-stat-badge")}
    </div>
  );
};
