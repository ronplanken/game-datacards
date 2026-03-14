import { ReactFitty } from "react-fitty";
import { UnitStat } from "../../../Warhammer40k-10e/UnitCard/UnitStat";

/**
 * Sorts stat fields by displayOrder for consistent column ordering.
 */
const sortStatFields = (fields) => {
  return [...(fields || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
};

/**
 * Schema-driven unit stats that uses the native 40K CSS structure.
 * Reads stat column headers from schema.stats.fields[] instead of hardcoded M/T/SV/W/LD/OC.
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat line objects from card data
 * @param {Array} props.statFields - Field definitions from schema.stats.fields
 */
/**
 * Checks if a special field with hideWhenEmpty should be hidden.
 * Returns true when all active stat lines have an empty/falsy value for the field.
 */
const shouldHideField = (field, stats) => {
  if (!field.special || !field.hideWhenEmpty) return false;
  const activeStats = (stats || []).filter((s) => s.active !== false);
  return activeStats.every((s) => !s[field.key]);
};

export const Ds40kUnitStats = ({ stats, statFields }) => {
  const sortedFields = sortStatFields(statFields);
  const visibleFields = sortedFields.filter((field) => !shouldHideField(field, stats));

  return (
    <>
      <div className="stats_container">
        {visibleFields.map((field) => (
          <div className="stat" key={field.key}>
            <div className="caption">{field.label}</div>
          </div>
        ))}
      </div>
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
              return (
                <UnitStat
                  key={`${field.key}-${index}`}
                  value={displayValue}
                  showDamagedMarker={field.key === "w" && stat.showDamagedMarker}
                  specialColor={field.special ? field.specialColor : undefined}
                />
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
