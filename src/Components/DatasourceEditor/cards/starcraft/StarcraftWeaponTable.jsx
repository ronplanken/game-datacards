import React from "react";

/**
 * Renders the weapon list for a single Starcraft phase (Assault or Combat).
 * Supports both single-line weapons and weapons with multiple named profiles.
 *
 * `weaponTypeDef.profileRelation`:
 * - "parent-child" (default for Starcraft TCG) — profiles[0] is the base row,
 *   profiles[1..n] render indented behind a ↳ arrow gutter
 * - "equal"                                     — all profiles render flat
 *   without an indent arrow (used by 40k / AoS-style siblings)
 */
export const StarcraftWeaponTable = ({ weapons, weaponTypeDef, isLast }) => {
  const columns = weaponTypeDef?.columns || [];
  const relation = weaponTypeDef?.profileRelation || "parent-child";
  const indentSubProfiles = relation === "parent-child";
  if (!weapons?.length) return null;

  const cellValue = (source, field) => {
    if (!source) return "-";
    const raw = source[field.key];
    if (raw === undefined || raw === null || raw === "") return "-";
    if (field.type === "boolean") {
      return raw ? field.onValue || "Yes" : field.offValue || "No";
    }
    return String(raw);
  };

  const renderNameCell = (label, { indent = false, upgrade = false } = {}) => (
    <td className={`sc-weapon-name${indent ? " indent" : ""}`}>
      {indent && (
        <span className="sc-weapon-name-icon">
          <span aria-hidden="true">↳</span>
        </span>
      )}
      <span className="sc-weapon-name-text">
        {upgrade && <span className="sc-up-ico" aria-hidden="true" />}
        {label || "-"}
      </span>
    </td>
  );

  return (
    <table className={`sc-weapon-table${isLast ? " is-last" : ""}`}>
      <thead>
        <tr>
          <th>Name</th>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weapons.map((weapon, idx) => {
          const profiles = weapon.profiles;
          if (Array.isArray(profiles) && profiles.length > 0) {
            return profiles
              .filter((p) => p?.active !== false)
              .map((profile, pIdx) => (
                <tr key={`${idx}-${pIdx}`} className={pIdx > 0 ? "sc-weapon-profile" : "sc-weapon-row"}>
                  {renderNameCell(profile.name || weapon.name, {
                    indent: pIdx > 0 && indentSubProfiles,
                    upgrade: Boolean(profile.upgrade || (pIdx === 0 && weapon.upgrade)),
                  })}
                  {columns.map((col) => (
                    <td key={col.key}>{cellValue(profile, col)}</td>
                  ))}
                </tr>
              ));
          }
          return (
            <tr key={idx} className="sc-weapon-row">
              {renderNameCell(weapon.name, { upgrade: Boolean(weapon.upgrade) })}
              {columns.map((col) => (
                <td key={col.key}>{cellValue(weapon, col)}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
