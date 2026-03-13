import { UnitAbility } from "../../../Warhammer40k-10e/UnitCard/UnitAbility";
import { UnitAbilityDescription } from "../../../Warhammer40k-10e/UnitCard/UnitAbilityDescription";
import { UnitInvul } from "../../../Warhammer40k-10e/UnitCard/UnitInvul";

/**
 * Gets abilities for a given category from the card data.
 * Supports both flat array with category field and object keyed by category.
 */
const getAbilitiesForCategory = (abilities, categoryKey) => {
  if (!abilities) return [];

  if (Array.isArray(abilities)) {
    return abilities.filter((a) => a.category === categoryKey);
  }

  const categoryAbilities = abilities[categoryKey];
  if (!categoryAbilities) return [];

  if (Array.isArray(categoryAbilities) && typeof categoryAbilities[0] === "string") {
    return categoryAbilities.map((name) => ({ name, showAbility: true }));
  }

  return Array.isArray(categoryAbilities) ? categoryAbilities : [];
};

/**
 * Schema-driven abilities/extras renderer using native 40K CSS structure.
 * Reads ability categories from schema.abilities.categories[] instead of
 * hardcoded core/faction/other/wargear/damaged/special.
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data
 * @param {Object} props.abilitiesSchema - The abilities schema definition
 */
export const Ds40kUnitExtra = ({ unit, abilitiesSchema }) => {
  const categories = abilitiesSchema?.categories || [];

  const hasAnyAbilities = categories.some((cat) => {
    const abilities = getAbilitiesForCategory(unit.abilities, cat.key);
    return abilities.filter((a) => a.showAbility !== false).length > 0;
  });

  // Check for invulnerable save in abilities (supports both flat and nested format)
  const invul = Array.isArray(unit.abilities) ? null : unit.abilities?.invul;
  const damaged = Array.isArray(unit.abilities) ? null : unit.abilities?.damaged;

  return (
    <div className="extra">
      {hasAnyAbilities && (
        <div className="abilities">
          <div className="heading">
            <div className="title">{abilitiesSchema?.label || "Abilities"}</div>
          </div>
          {categories.map((category) => {
            const abilities = getAbilitiesForCategory(unit.abilities, category.key);
            if (!abilities.length) return null;

            const showCategory = unit.showAbilities?.[category.key] !== false;
            if (!showCategory) return null;

            let content;
            if (category.format === "name-only") {
              const visibleAbilities = abilities.filter((a) => a.showAbility !== false);
              if (!visibleAbilities.length) return null;
              content = (
                <UnitAbility
                  key={`cat-${category.key}`}
                  name={category.label}
                  value={visibleAbilities.map((a) => a.name).join(", ")}
                />
              );
            } else {
              content = abilities
                .filter((a) => a.showAbility !== false)
                .map((ability, index) => (
                  <UnitAbilityDescription
                    key={`ability-${category.key}-${index}`}
                    name={ability.name}
                    description={ability.description}
                    showDescription={ability.showDescription}
                  />
                ));
            }

            if (category.header) {
              return (
                <div className="damaged" key={`header-cat-${category.key}`}>
                  <div className="heading">
                    <div className="title">{category.header}</div>
                  </div>
                  {content}
                </div>
              );
            }

            return content;
          })}
        </div>
      )}
      {invul?.showInvulnerableSave && !invul?.showAtTop && <UnitInvul invul={invul} />}
      {damaged?.showDamagedAbility && (
        <div className="damaged">
          <div className="heading">
            <div className="title">Damaged: {damaged.range}</div>
          </div>
          {damaged.showDescription && <div className="description">{damaged.description}</div>}
        </div>
      )}
    </div>
  );
};
