import { Fragment } from "react";
import { Button } from "antd";
import { UnitAbilityDescription, replaceKeywords } from "../../../Warhammer40k-10e/UnitCard/UnitAbilityDescription";
import { UnitInvul } from "../../../Warhammer40k-10e/UnitCard/UnitInvul";
import { tooltipProps as ruleTooltipProps } from "../../../Warhammer40k-10e/UnitCard/RuleTooltip";
import { Tooltip } from "../../../Tooltip/Tooltip";
import { resolveKeywordEntry } from "../../../../Helpers/customSchema.helpers";

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
 * One ability name in a `name-only` category (e.g. "Support"). Names that
 * resolve to a datasource glossary entry scoped to "abilities" get a hover
 * tooltip with that entry's description. Anything else falls back to the
 * built-in 40K keyword dictionary so 10e datasources keep their hardcoded
 * Leader/Stealth/Deep Strike tooltips.
 */
const NameOnlyAbility = ({ name, glossary }) => {
  const entry = resolveKeywordEntry(name, glossary, "abilities");
  if (entry?.description) {
    return (
      <span className="rule">
        <Tooltip {...ruleTooltipProps} content={entry.description}>
          <Button type="text" size="small" className="rule-button">{`${name}`}</Button>
        </Tooltip>
      </span>
    );
  }
  return replaceKeywords(name);
};

/**
 * Schema-driven abilities/extras renderer using native 40K CSS structure.
 * Reads ability categories from schema.abilities.categories[] instead of
 * hardcoded core/faction/other/wargear/damaged/special.
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data
 * @param {Object} props.abilitiesSchema - The abilities schema definition
 * @param {Array} [props.keywordGlossary] - Datasource-level keyword glossary; ability
 *   descriptions underline + tooltip glossary entries scoped to "abilities".
 */
export const Ds40kUnitExtra = ({ unit, abilitiesSchema, keywordGlossary }) => {
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
                <div className="ability" key={`cat-${category.key}`} data-name={category.label}>
                  <span className="title">{category.label}</span>
                  <span className="value">
                    {visibleAbilities.map((ability, index) => (
                      <Fragment key={`ability-${category.key}-${index}`}>
                        {index > 0 && ", "}
                        <NameOnlyAbility name={ability.name} glossary={keywordGlossary} />
                      </Fragment>
                    ))}
                  </span>
                </div>
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
                    keywordGlossary={keywordGlossary}
                    glossaryOnly
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
