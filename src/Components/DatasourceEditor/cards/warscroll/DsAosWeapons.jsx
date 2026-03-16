import React from "react";

/**
 * Resolves display value for a weapon column, handling booleans.
 */
const resolveColumnValue = (value, column) => {
  if (column.type === "boolean") {
    return value ? column.onValue || "Yes" : column.offValue || "-";
  }
  return value || "-";
};

/**
 * Renders a row-display column's value.
 * - visual "badge": renders each item as a badge
 * - visual "text" (default): renders items as comma-separated plain text
 */
const RowFieldValues = ({ items, visual }) => {
  if (visual === "badge") {
    return (
      <div className="weapon-row-field-badges">
        {items.map((item, i) => (
          <span key={i} className="weapon-ability-badge">
            {item}
          </span>
        ))}
      </div>
    );
  }
  return <span className="weapon-row-field-text">{items.join(", ")}</span>;
};

/**
 * Renders row-display columns for a single weapon profile.
 */
const RowFields = ({ profile, rowCols, altBg, withTestId }) => {
  return rowCols.map((col) => {
    const value = profile[col.key];
    const items = Array.isArray(value) ? value : value ? [value] : [];
    if (items.length === 0) return null;
    const showLabel = col.displayLabel !== false;
    const visual = col.visual || "text";
    return (
      <div
        key={col.key}
        className={`weapon-row-field ${altBg ? "alt-bg" : ""}`}
        data-testid={withTestId ? `weapon-row-field-${col.key}` : undefined}>
        {showLabel && <span className="weapon-row-field-label">{col.label}:</span>}
        <RowFieldValues items={items} visual={visual} />
      </div>
    );
  });
};

/**
 * Schema-driven weapon table for AoS warscrolls.
 * Reads column definitions from the weapon type schema instead of hardcoding.
 * Data layout matches 40K: each weapon has a profiles[] array with column values.
 *
 * Each column supports a `display` property:
 * - "column" (default): Rendered as a table column in the header and each row
 * - "row": Rendered as a full-width row below the table columns
 *   - `displayLabel`: Label shown before the values (defaults to column label)
 *   - `visual`: "text" (default, comma-separated) or "badge" (styled badges)
 */
export const DsAosWeapons = ({ weapons, weaponTypeDef, grandAlliance, maxColumns, isMobile }) => {
  if (!weapons || weapons.length === 0 || !weaponTypeDef) return null;

  const activeWeapons = weapons.filter((w) => w.active !== false);
  if (activeWeapons.length === 0) return null;

  const allColumns = weaponTypeDef.columns || [];
  const columnCols = allColumns.filter((col) => (col.display || "column") === "column");
  const rowCols = allColumns.filter((col) => col.display === "row");

  // Flatten weapons into profile rows (same data layout as Ds40kUnitWeapons)
  const rows = [];
  activeWeapons.forEach((weapon) => {
    if (weapon.profiles?.length) {
      weapon.profiles
        .filter((p) => p.active !== false)
        .forEach((profile) => {
          rows.push({ ...profile, keywords: profile.keywords || weapon.keywords });
        });
    }
  });

  if (rows.length === 0) return null;

  if (isMobile) {
    return (
      <div
        className={`section-block ${weaponTypeDef.key} ${grandAlliance}`}
        data-testid={`ds-aos-weapons-${weaponTypeDef.key}`}>
        <div className="section-title-banner">{weaponTypeDef.label}</div>
        {rows.map((profile, index) => (
          <div key={profile.id || index} className={`weapon-card ${index % 2 === 1 ? "alt-bg" : ""}`}>
            <div className="weapon-card-name">{profile.name}</div>
            <div className="weapon-card-stats">
              {columnCols.map((col) => (
                <div className="weapon-card-stat" key={col.key}>
                  <span className="stat-label">{col.label}</span>
                  <span className="stat-value">{resolveColumnValue(profile[col.key], col)}</span>
                </div>
              ))}
            </div>
            <RowFields profile={profile} rowCols={rowCols} altBg={false} />
            {profile.keywords?.length > 0 && (
              <div className="weapon-card-abilities">
                {profile.keywords.map((kw, i) => (
                  <span key={i} className="weapon-ability-badge">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const colCount = maxColumns || columnCols.length;

  return (
    <div
      className={`section-block ${weaponTypeDef.key} ${grandAlliance}`}
      data-testid={`ds-aos-weapons-${weaponTypeDef.key}`}
      style={{ "--ds-weapon-columns": colCount }}>
      <div className="section-title-banner">{weaponTypeDef.label}</div>

      {/* Header Row - only column-display columns */}
      <div className="weapon-row header-row">
        <span className="w-name">Weapon</span>
        {columnCols.map((col) => (
          <span className="w-stat" key={col.key}>
            {col.label}
          </span>
        ))}
      </div>

      {/* Weapon Profile Rows */}
      {rows.map((profile, index) => (
        <React.Fragment key={profile.id || index}>
          <div className={`weapon-row ${index % 2 === 1 ? "alt-bg" : ""}`}>
            <span className="w-name">
              {profile.name}
              {profile.keywords?.length > 0 && (
                <div className="weapon-abilities-list">
                  {profile.keywords.map((kw, i) => (
                    <span key={i} className="weapon-ability-badge">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </span>
            {columnCols.map((col) => (
              <span className="w-stat" key={col.key}>
                {resolveColumnValue(profile[col.key], col)}
              </span>
            ))}
          </div>
          <RowFields profile={profile} rowCols={rowCols} altBg={index % 2 === 1} withTestId />
        </React.Fragment>
      ))}
    </div>
  );
};
