import { ReactFitty } from "react-fitty";

/**
 * Sorts stat fields by displayOrder for consistent column ordering.
 * @param {Array} fields - Schema stat field definitions
 * @returns {Array} Sorted copy of fields
 */
export const sortStatFields = (fields) => {
  return [...(fields || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
};

/**
 * CustomCardStats - Renders dynamic stat headers and values based on schema field definitions.
 * Unlike the hardcoded UnitStats (M/T/SV/W/LD/OC), this iterates schema.stats.fields
 * to render columns dynamically for any game system.
 *
 * @param {Object} props
 * @param {Array} props.stats - Array of stat line objects from card data
 * @param {Array} props.statFields - Field definitions from schema.stats.fields
 */
export const CustomCardStats = ({ stats, statFields }) => {
  const sortedFields = sortStatFields(statFields);

  return (
    <>
      <div className="stats_container">
        {sortedFields.map((field) => (
          <div className="stat" key={field.key}>
            <div className="caption">{field.label}</div>
          </div>
        ))}
      </div>
      {stats
        ?.filter((stat) => stat.active)
        ?.map((stat, index) => (
          <div className="stats_container" key={`stat-line-${index}`}>
            {sortedFields.map((field) => (
              <div className="stat" key={`${field.key}-${index}`}>
                <div className="value_container">
                  <div className="value">{stat[field.key] || "-"}</div>
                </div>
              </div>
            ))}
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
