import { ReactFitty } from "react-fitty";
import { DamagedIcon } from "../../../Icons/WeaponTypeIcon";

/**
 * Sorts stat fields by displayOrder for consistent column ordering.
 */
const sortStatFields = (fields) => {
  return [...(fields || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
};

/**
 * Checks if a special field with hideWhenEmpty should be hidden.
 * Returns true when all active stat lines have an empty/falsy value for the field.
 */
const shouldHideField = (field, stats) => {
  if (!field.special || !field.hideWhenEmpty) return false;
  const activeStats = (stats || []).filter((s) => s.active !== false);
  return activeStats.every((s) => !s[field.key]);
};

/**
 * Schema-driven unit stats that uses the native 40K CSS structure.
 * Reads stat column headers from schema.stats.fields[] instead of hardcoded M/T/SV/W/LD/OC.
 *
 * Each stat line renders captions inline with values so that when the grid
 * wraps (>6 columns), the caption stays paired with its value.
 */
export const Ds40kUnitStats = ({ stats, statFields }) => {
  const sortedFields = sortStatFields(statFields);
  const visibleFields = sortedFields.filter((field) => !shouldHideField(field, stats));

  return (
    <>
      {stats
        ?.filter((stat) => stat.active !== false)
        ?.map((stat, index) => (
          <div className="stats_container" key={`stat-line-${index}`}>
            {visibleFields.map((field) => {
              const displayValue =
                field.type === "boolean"
                  ? stat[field.key]
                    ? field.onValue || "Yes"
                    : field.offValue || "No"
                  : stat[field.key] || "-";
              const containerStyle =
                field.special && field.specialColor ? { background: field.specialColor } : undefined;
              return (
                <div className="stat" key={`${field.key}-${index}`}>
                  <div className="caption">{field.label}</div>
                  <div className="value_container" style={containerStyle}>
                    <div className="value">{displayValue}</div>
                  </div>
                  {field.key === "w" && stat.showDamagedMarker && (
                    <div className="damageTable">
                      <DamagedIcon color="white" />
                    </div>
                  )}
                </div>
              );
            })}
            {stat.showName && (
              <div className="name">
                <ReactFitty maxSize={16} minSize={10}>
                  {stat.name}
                </ReactFitty>
              </div>
            )}
          </div>
        ))}
    </>
  );
};
