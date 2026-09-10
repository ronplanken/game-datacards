import React from "react";
import { isReservedWeaponProfileKey, normalizeKeywords } from "../../../../Helpers/weaponProfile.helpers";
import {
  GlossaryExplanationRows,
  GlossaryKeywordTags,
  getKeywordExplanations,
  splitKeywordString,
} from "../shared/GlossaryKeywords";

/**
 * Column key of the synthesised keywords column. It is not a schema column:
 * weapon keywords live on the profile itself (`profile.keywords`), so the
 * column exists only to give those tags a header and a cell to render in.
 */
const PROFILE_KEYWORDS_KEY = "__profileKeywords";

const isKeywordColumnKey = (key) => /^keywords?$/i.test(key || "");

/**
 * The keyword tags a weapon profile carries, normalised to an array (saved
 * cards can hold a bare string here). Falls back to the parent weapon's own
 * keywords when the profile has none.
 */
const profileKeywords = (profile, weapon) => {
  const own = normalizeKeywords(profile?.keywords);
  return own.length > 0 ? own : normalizeKeywords(weapon?.keywords);
};

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
 * Keywords reach the table through two routes, and both resolve against the
 * datasource glossary:
 * - a schema column keyed `keyword` holding a comma-separated string cell
 * - `profile.keywords`, the array the card editors write when the weapon type
 *   has `hasKeywords` enabled — rendered in a trailing "Keywords" column
 *
 * When a `glossary` is supplied those tags get their glossary styling and
 * hover tooltips, and matching explanation-mode entries render as explanation
 * rows below the table.
 */
export const StarcraftWeaponTable = ({ weapons, weaponTypeDef, isLast, isMobile, glossary }) => {
  const schemaColumns = weaponTypeDef?.columns || [];
  const relation = weaponTypeDef?.profileRelation || "parent-child";
  const indentSubProfiles = relation === "parent-child";
  if (!weapons?.length) return null;

  const hasGlossary = Array.isArray(glossary) && glossary.length > 0;

  // A column keyed after a reserved profile field (`keywords`, `name`, …) is
  // not a real column — the data model owns that field, and the card editors
  // never write a plain cell value to it. Rendering it would dump the raw
  // value (an array of keywords stringifies to "Repeating,testing"), so drop
  // it here and let the synthesised keywords column below do the work.
  const columns = schemaColumns.filter((col) => !isReservedWeaponProfileKey(col?.key));
  const reservedKeywordColumn = schemaColumns.find(
    (col) => isReservedWeaponProfileKey(col?.key) && isKeywordColumnKey(col?.key),
  );

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
            // Saved cards can carry the keywords on the weapon rather than on
            // each profile, so the profile value falls back to the parent's.
            keywords: profileKeywords(profile, weapon),
          });
        });
    } else {
      rows.push({
        key: String(idx),
        name: weapon.name,
        indent: false,
        upgrade: Boolean(weapon.upgrade),
        data: weapon,
        keywords: profileKeywords(weapon, weapon),
      });
    }
  });

  if (!rows.length) return null;

  // The profile keyword array only gets a column when the weapon type allows
  // keywords and something actually carries one. `!== false` rather than
  // `=== true` on purpose: keywords default to on when the field is unset, the
  // same reading `CustomCardWeapons` and the premium weapons editor use, so a
  // schema predating the field still renders the keywords its cards hold.
  const showProfileKeywords = weaponTypeDef?.hasKeywords !== false && rows.some((row) => row.keywords.length > 0);
  const renderedColumns = showProfileKeywords
    ? [...columns, { key: PROFILE_KEYWORDS_KEY, label: reservedKeywordColumn?.label || "Keywords", type: "string" }]
    : columns;

  const isKeywordColumn = (col) => col?.key === PROFILE_KEYWORDS_KEY || isKeywordColumnKey(col?.key);

  // Resolve each row's keyword tags once: row key → { [colKey]: tags }. Both
  // the explanation rows and the per-cell render read from this.
  const keywordColumns = renderedColumns.filter(isKeywordColumn);
  const keywordTagsByRow = new Map();
  rows.forEach((row) => {
    const byCol = {};
    keywordColumns.forEach((col) => {
      byCol[col.key] = col.key === PROFILE_KEYWORDS_KEY ? row.keywords : splitKeywordString(row.data?.[col.key]);
    });
    keywordTagsByRow.set(row.key, byCol);
  });

  const keywordTags = (row, col) => keywordTagsByRow.get(row.key)?.[col.key] || [];

  const explanationEntries = hasGlossary
    ? getKeywordExplanations(
        rows.flatMap((row) => keywordColumns.flatMap((col) => keywordTags(row, col))),
        glossary,
        "weapons",
      )
    : [];

  // Plain-text value of a cell, used for the mobile wide/compact split and as
  // the fallback whenever a keyword cell has no glossary to resolve against.
  const columnText = (row, col) => {
    if (col.key === PROFILE_KEYWORDS_KEY) {
      const tags = keywordTags(row, col);
      return tags.length > 0 ? tags.join(", ") : "-";
    }
    return cellValue(row.data, col);
  };

  // Keyword columns render as glossary-styled tags; every other column stays plain text.
  const renderCell = (row, col) => {
    if (hasGlossary && isKeywordColumn(col)) {
      const tags = keywordTags(row, col);
      if (tags.length > 0) {
        return <GlossaryKeywordTags keywords={tags} glossary={glossary} scope="weapons" />;
      }
    }
    return columnText(row, col);
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
        const value = columnText(row, col);
        return typeof value === "string" && value !== "-" && value.length > WIDE_THRESHOLD;
      });
    const compactColumns = renderedColumns.filter((col) => !isWideColumn(col));
    const wideColumns = renderedColumns.filter((col) => isWideColumn(col));

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
                    <span className="sc-weapon-card-stat-value">{renderCell(row, col)}</span>
                  </div>
                ))}
              </div>
            )}
            {wideColumns.map((col) => {
              if (columnText(row, col) === "-") return null;
              return (
                <div key={col.key} className="sc-weapon-card-wide">
                  <span className="sc-weapon-card-wide-label">{col.label}</span>
                  <span className="sc-weapon-card-wide-value">{renderCell(row, col)}</span>
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
            {renderedColumns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={row.indent ? "sc-weapon-profile" : "sc-weapon-row"}>
              {renderNameCell(row.name, { indent: row.indent, upgrade: row.upgrade })}
              {renderedColumns.map((col) => (
                <td key={col.key}>{renderCell(row, col)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <GlossaryExplanationRows entries={explanationEntries} />
    </>
  );
};
