/**
 * Renders a single ability in "name-only" format (comma-separated list).
 *
 * @param {Object} props
 * @param {string} props.categoryLabel - The category heading (e.g. "Core")
 * @param {Array} props.abilities - Array of ability objects with name field
 */
const AbilityNameOnly = ({ categoryLabel, abilities }) => {
  const visibleAbilities = abilities?.filter((a) => a.showAbility !== false) || [];
  if (!visibleAbilities.length) return null;

  return (
    <div className="ability" data-name={categoryLabel}>
      <span className="title">{categoryLabel}</span>
      <span className="value">{visibleAbilities.map((a) => a.name).join(", ")}</span>
    </div>
  );
};

/**
 * Renders abilities in "name-description" format (each ability with name and description).
 *
 * @param {Object} props
 * @param {Array} props.abilities - Array of ability objects with name and description fields
 */
const AbilityNameDescription = ({ abilities }) => {
  const visibleAbilities = abilities?.filter((a) => a.showAbility !== false) || [];
  if (!visibleAbilities.length) return null;

  return (
    <>
      {visibleAbilities.map((ability, index) => (
        <div className="ability" key={`ability-desc-${index}`} data-name={ability.name}>
          <span className="name">{ability.name}</span>
          {ability.showDescription !== false && ability.description && (
            <span className="description">{ability.description}</span>
          )}
        </div>
      ))}
    </>
  );
};

/**
 * Renders a "boolean" format ability category — a toggle/flag indicator.
 * Shows or hides art/content on a datacard based on a boolean value.
 *
 * @param {Object} props
 * @param {string} props.categoryLabel - The category heading
 * @param {Array} props.abilities - Array of ability objects with name and optionally value fields
 */
const AbilityBoolean = ({ categoryLabel, abilities }) => {
  const visibleAbilities = abilities?.filter((a) => a.showAbility !== false) || [];
  if (!visibleAbilities.length) return null;

  return (
    <div className="ability ability-boolean" data-name={categoryLabel}>
      <span className="title">{categoryLabel}</span>
      <span className="value">{visibleAbilities.map((a) => a.name || a.value).join(", ")}</span>
    </div>
  );
};

/**
 * CustomCardAbilities - Renders abilities grouped by category with format from schema.
 * Unlike the hardcoded 40K abilities (core/faction/other/wargear/special), this iterates
 * schema.abilities.categories to render dynamic ability groups.
 *
 * Each category has a `format`:
 * - "name-only": abilities shown as comma-separated list (e.g. Core: "Deep Strike, Scouts")
 * - "name-description": each ability shown with name and description block
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data containing abilities
 * @param {Object} props.abilitiesSchema - The abilities schema definition (categories)
 */
export const CustomCardAbilities = ({ unit, abilitiesSchema }) => {
  if (!abilitiesSchema) return null;

  const categories = abilitiesSchema.categories || [];

  // Get abilities data from unit - support both flat array with category field and per-category objects
  const getAbilitiesForCategory = (categoryKey) => {
    if (!unit.abilities) return [];

    // If abilities is an array, filter by category field
    if (Array.isArray(unit.abilities)) {
      return unit.abilities.filter((a) => a.category === categoryKey);
    }

    // If abilities is an object keyed by category (like 40K format)
    const categoryAbilities = unit.abilities[categoryKey];
    if (!categoryAbilities) return [];

    // If it's an array of strings (like 40K core/faction), convert to objects
    if (Array.isArray(categoryAbilities) && typeof categoryAbilities[0] === "string") {
      return categoryAbilities.map((name) => ({ name, showAbility: true }));
    }

    return Array.isArray(categoryAbilities) ? categoryAbilities : [];
  };

  // Check if any category has visible abilities
  const hasAnyAbilities = categories.some((cat) => {
    const abilities = getAbilitiesForCategory(cat.key);
    return abilities.filter((a) => a.showAbility !== false).length > 0;
  });

  return (
    <>
      {hasAnyAbilities && (
        <div className="abilities" data-testid="custom-abilities">
          <div className="heading">
            <div className="title">{abilitiesSchema.label || "Abilities"}</div>
          </div>
          {categories.map((category) => {
            const abilities = getAbilitiesForCategory(category.key);
            if (!abilities.length) return null;

            const showCategory = unit.showAbilities?.[category.key] !== false;
            if (!showCategory) return null;

            return (
              <div className="category-abilities" key={`category-${category.key}`} data-category={category.key}>
                {category.header && <div className="category-header">{category.header}</div>}
                {category.format === "name-only" && (
                  <AbilityNameOnly categoryLabel={category.label} abilities={abilities} />
                )}
                {category.format === "boolean" && (
                  <AbilityBoolean categoryLabel={category.label} abilities={abilities} />
                )}
                {category.format === "name-description" && <AbilityNameDescription abilities={abilities} />}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
