import React from "react";
import {
  GlossaryExplanationRows,
  GlossaryKeywordTags,
  getKeywordExplanations,
  splitKeywordString,
} from "../shared/GlossaryKeywords";

/**
 * Renders the weapon list for a single Starcraft TMG phase (Assault or Combat).
 * Supports both single-line weapons and weapons with multiple named profiles.
 *
 * `weaponTypeDef.profileRelation`:
 * - "parent-child" (default for Starcraft TMG) — profiles[0] is the base row,
 *   profiles[1..n] render indented behind a ↳ arrow gutter
 * - "equal"                                     — all profiles render flat
 *   without an indent arrow (used by 40k / AoS-style siblings)
 *
 * `isMobile` switches the markup from a column table to per-weapon stacked
 * cards: each weapon gets a name banner and a stat grid with column labels
 * inline, so the data stays scannable on a narrow screen.
 *
 * When a `glossary` is supplied, the keyword column (a comma-separated string
 * cell whose key is `keyword`/`keywords`) renders glossary-styled tags with
 * hover tooltips, and matching explanation-mode entries render as explanation
 * rows below the table.
 */
export const StarcraftWeaponTable = ({ weapons, weaponTypeDef, isLast, isMobile, glossary }) => {
  const columns = weaponTypeDef?.columns || [];
  const relation = weaponTypeDef?.profileRelation || "parent-child";
  const indentSubProfiles = relation === "parent-child";
  if (!weapons?.length) return null;

  const hasGlossary = Array.isArray(glossary) && glossary.length > 0;
  const isKeywordColumn = (col) => /^keywords?$/i.test(col?.key || "");

  const cellValue = (source, field) => {
    if (!source) return "-";
    const raw = source[field.key];
    if (raw === undefined || raw === null || raw === "") return "-";
    if (field.type === "boolean") {
      return raw ? field.onValue || "Yes" : field.offValue || "No";
    }
    return String(raw);
  };

  // Flatten weapons into displayable rows: each row is one profile (or the
  // single-line weapon itself), tagged with the indent/upgrade flags so both
  // the desktop table and the mobile card path can render the same data.
  const rows = [];
  weapons.forEach((weapon, idx) => {
    const profiles = weapon.profiles;
    if (Array.isArray(profiles) && profiles.length > 0) {
      profiles
        .filter((p) => p?.active !== false)
        .forEach((profile, pIdx) => {
          rows.push({
            key: `${idx}-${pIdx}`,
            name: profile.name || weapon.name,
            indent: pIdx > 0 && indentSubProfiles,
            upgrade: Boolean(profile.upgrade || (pIdx === 0 && weapon.upgrade)),
            data: profile,
          });
        });
    } else {
      rows.push({
        key: String(idx),
        name: weapon.name,
        indent: false,
        upgrade: Boolean(weapon.upgrade),
        data: weapon,
      });
    }
  });

  if (!rows.length) return null;

  // Parse each keyword cell once (TMG stores keywords as a comma-separated
  // string column): row data object → { [colKey]: tags }. Both the
  // explanation rows and the per-cell render read from this.
  const keywordColumns = columns.filter(isKeywordColumn);
  const keywordTagsByRow = new Map();
  if (hasGlossary) {
    rows.forEach((row) => {
      const byCol = {};
      keywordColumns.forEach((col) => {
        byCol[col.key] = splitKeywordString(row.data?.[col.key]);
      });
      keywordTagsByRow.set(row.data, byCol);
    });
  }

  const explanationEntries = hasGlossary
    ? getKeywordExplanations(
        rows.flatMap((row) => keywordColumns.flatMap((col) => keywordTagsByRow.get(row.data)[col.key])),
        glossary,
        "weapons",
      )
    : [];

  // Keyword columns render as glossary-styled tags; every other column stays plain text.
  const renderCell = (data, col) => {
    if (hasGlossary && isKeywordColumn(col)) {
      const tags = keywordTagsByRow.get(data)?.[col.key] || [];
      if (tags.length > 0) {
        return <GlossaryKeywordTags keywords={tags} glossary={glossary} scope="weapons" />;
      }
    }
    return cellValue(data, col);
  };

  if (isMobile) {
    // Split columns into compact stat tiles vs long-text rows. A column is
    // treated as "wide" if any of its values exceeds ~12 chars — cells that
    // hold short tokens like "3+" or "D3+1" stay in the compact stat grid,
    // while sentence-length columns like Keyword get their own full-width
    // row below so the text isn't squeezed into a 64px tile.
    const WIDE_THRESHOLD = 12;
    const isWideColumn = (col) =>
      rows.some((row) => {
        const value = cellValue(row.data, col);
        return typeof value === "string" && value !== "-" && value.length > WIDE_THRESHOLD;
      });
    const compactColumns = columns.filter((col) => !isWideColumn(col));
    const wideColumns = columns.filter((col) => isWideColumn(col));

    return (
      <div className={`sc-weapon-cards${isLast ? " is-last" : ""}`}>
        {rows.map((row) => (
          <div key={row.key} className={`sc-weapon-card${row.indent ? " indent" : ""}`}>
            <div className="sc-weapon-card-name">
              {row.indent && (
                <span className="sc-weapon-card-indent" aria-hidden="true">
                  ↳
                </span>
              )}
              {row.upgrade && <span className="sc-up-ico" aria-hidden="true" />}
              <span className="sc-weapon-card-name-text">{row.name || "-"}</span>
            </div>
            {compactColumns.length > 0 && (
              <div className="sc-weapon-card-stats" style={{ "--sc-weapon-col-count": compactColumns.length }}>
                {compactColumns.map((col) => (
                  <div key={col.key} className="sc-weapon-card-stat">
                    <span className="sc-weapon-card-stat-label">{col.label}</span>
                    <span className="sc-weapon-card-stat-value">{renderCell(row.data, col)}</span>
                  </div>
                ))}
              </div>
            )}
            {wideColumns.map((col) => {
              const value = cellValue(row.data, col);
              if (value === "-") return null;
              return (
                <div key={col.key} className="sc-weapon-card-wide">
                  <span className="sc-weapon-card-wide-label">{col.label}</span>
                  <span className="sc-weapon-card-wide-value">{renderCell(row.data, col)}</span>
                </div>
              );
            })}
          </div>
        ))}
        <GlossaryExplanationRows entries={explanationEntries} />
      </div>
    );
  }

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
    <>
      <table className={`sc-weapon-table${isLast && explanationEntries.length === 0 ? " is-last" : ""}`}>
        <thead>
          <tr>
            <th>Name</th>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={row.indent ? "sc-weapon-profile" : "sc-weapon-row"}>
              {renderNameCell(row.name, { indent: row.indent, upgrade: row.upgrade })}
              {columns.map((col) => (
                <td key={col.key}>{renderCell(row.data, col)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <GlossaryExplanationRows entries={explanationEntries} />
    </>
  );
};
