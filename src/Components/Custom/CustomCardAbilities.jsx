import { InvulnShieldSvg } from "../Icons/InvulnShield";
import { DamagedIcon } from "../Icons/WeaponTypeIcon";

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
 * Renders the invulnerable save section with shield icon and value.
 *
 * @param {Object} props
 * @param {Object} props.invul - Invulnerable save data (value, info, showInvulnerableSave, showInfo)
 */
const CustomInvulSave = ({ invul }) => {
  if (!invul?.showInvulnerableSave) return null;

  return (
    <div className="invul_container">
      <div className="invul">
        <div className="title">Invulnerable save {invul.showInfo && "*"}</div>
        <div className="value_container">
          <InvulnShieldSvg fill="var(--banner-colour)" className="invul-shield-outer" />
          <div className="value">
            <InvulnShieldSvg fill="white" className="invul-shield-inner" />
            <span className="value-text">{invul?.value}</span>
          </div>
        </div>
      </div>
      {invul?.info && invul.showInfo && <div className="info">{invul?.info}</div>}
    </div>
  );
};

/**
 * Renders the damaged ability section with icon, range, and description.
 *
 * @param {Object} props
 * @param {Object} props.damaged - Damaged ability data (range, description, showDamagedAbility, showDescription)
 */
const CustomDamagedAbility = ({ damaged }) => {
  if (!damaged?.showDamagedAbility) return null;

  return (
    <div className="damaged">
      <div className="heading">
        <div className="damaged-icon">
          <DamagedIcon color="white" />
        </div>
        <div className="title">Damaged: {damaged?.range}</div>
      </div>
      {damaged.showDescription && <div className="description">{damaged?.description}</div>}
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
 * Also renders invulnerable save and damaged ability sections based on schema flags.
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data containing abilities
 * @param {Object} props.abilitiesSchema - The abilities schema definition (categories, hasInvulnerableSave, hasDamagedAbility)
 */
export const CustomCardAbilities = ({ unit, abilitiesSchema }) => {
  if (!abilitiesSchema) return null;

  const categories = abilitiesSchema.categories || [];
  const hasInvulnerableSave = abilitiesSchema.hasInvulnerableSave;
  const hasDamagedAbility = abilitiesSchema.hasDamagedAbility;

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

            if (category.format === "name-only") {
              return (
                <AbilityNameOnly
                  categoryLabel={category.label}
                  abilities={abilities}
                  key={`category-${category.key}`}
                />
              );
            }

            return (
              <div className="category-abilities" key={`category-${category.key}`} data-category={category.key}>
                <AbilityNameDescription abilities={abilities} />
              </div>
            );
          })}
        </div>
      )}
      {hasDamagedAbility && <CustomDamagedAbility damaged={unit.abilities?.damaged} />}
      {hasInvulnerableSave && <CustomInvulSave invul={unit.abilities?.invul} />}
    </>
  );
};
