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
 * Schema-driven weapon table for AoS warscrolls.
 * Reads column definitions from the weapon type schema instead of hardcoding.
 * Data layout matches 40K: each weapon has a profiles[] array with column values.
 */
export const DsAosWeapons = ({ weapons, weaponTypeDef, grandAlliance, maxColumns, isMobile }) => {
  if (!weapons || weapons.length === 0 || !weaponTypeDef) return null;

  const activeWeapons = weapons.filter((w) => w.active !== false);
  if (activeWeapons.length === 0) return null;

  const columns = weaponTypeDef.columns || [];

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
              {columns.map((col) => (
                <div className="weapon-card-stat" key={col.key}>
                  <span className="stat-label">{col.label}</span>
                  <span className="stat-value">{resolveColumnValue(profile[col.key], col)}</span>
                </div>
              ))}
            </div>
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

  const colCount = maxColumns || columns.length;

  return (
    <div
      className={`section-block ${weaponTypeDef.key} ${grandAlliance}`}
      data-testid={`ds-aos-weapons-${weaponTypeDef.key}`}
      style={{ "--ds-weapon-columns": colCount }}>
      <div className="section-title-banner">{weaponTypeDef.label}</div>

      {/* Header Row */}
      <div className="weapon-row header-row">
        <span className="w-name">Weapon</span>
        {columns.map((col) => (
          <span className="w-stat" key={col.key}>
            {col.label}
          </span>
        ))}
      </div>

      {/* Weapon Profile Rows */}
      {rows.map((profile, index) => (
        <div key={profile.id || index} className={`weapon-row ${index % 2 === 1 ? "alt-bg" : ""}`}>
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
          {columns.map((col) => (
            <span className="w-stat" key={col.key}>
              {resolveColumnValue(profile[col.key], col)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
