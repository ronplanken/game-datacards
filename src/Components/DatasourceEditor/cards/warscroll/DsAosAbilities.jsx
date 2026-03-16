import React from "react";
import { MarkdownDisplay } from "../../../MarkdownDisplay";

/**
 * Build the phase tag text for an ability.
 * Priority: ability.phaseDetails > ability.phase > category.header > nothing.
 */
const getTagText = (ability, category) => {
  if (ability.phaseDetails) return ability.phaseDetails.toUpperCase();
  if (ability.phase && ability.phase.toLowerCase() !== "passive") return ability.phase.toUpperCase();
  if (category.header) return category.header.toUpperCase();
  return "";
};

/**
 * Gets abilities for a category, supporting both object-keyed and flat array formats.
 */
const getAbilitiesForCategory = (abilities, categoryKey) => {
  if (!abilities) return [];

  if (Array.isArray(abilities)) {
    return abilities.filter((a) => a.category === categoryKey);
  }

  const categoryAbilities = abilities[categoryKey];
  if (!categoryAbilities) return [];

  if (Array.isArray(categoryAbilities) && categoryAbilities.length > 0 && typeof categoryAbilities[0] === "string") {
    return categoryAbilities.map((name) => ({ name, showAbility: true }));
  }

  return Array.isArray(categoryAbilities) ? categoryAbilities : [];
};

/**
 * Maps layout value to CSS class.
 */
const LAYOUT_CLASS = {
  full: "ds-aos-abilities-layout-full",
  half: "ds-aos-abilities-layout-half",
  third: "ds-aos-abilities-layout-third",
  quarter: "ds-aos-abilities-layout-quarter",
};

/**
 * Renders a single ability item.
 */
const AbilityItem = ({ ability, category, grandAlliance, itemKey }) => {
  if (typeof ability === "string") {
    return (
      <div className={`ability-wrapper ${grandAlliance}`} key={itemKey}>
        {category.header && (
          <div className="ability-phase-tag">
            <span>{category.header.toUpperCase()}</span>
          </div>
        )}
        <div className={`ability-box ${grandAlliance}`}>
          <div className="ability-strip">
            <span className="ability-name">{ability}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ability || ability.showAbility === false) return null;

  const tagText = getTagText(ability, category);
  const stripStyle = ability.color ? { backgroundColor: ability.color } : undefined;
  const isNameOnly = category.format === "name-only";

  return (
    <div className={`ability-wrapper ${grandAlliance}`} key={itemKey}>
      {tagText && (
        <div className="ability-phase-tag">
          <span>{tagText}</span>
        </div>
      )}

      <div className={`ability-box ${grandAlliance}`}>
        <div className="ability-strip" style={stripStyle}>
          <span className="ability-name">{ability.name}</span>
          {ability.castingValue && <span className="ability-casting-badge">{ability.castingValue}+</span>}
          {ability.chantValue && <span className="ability-chant-badge">{ability.chantValue}+</span>}
        </div>

        {!isNameOnly && (
          <div className="ability-text">
            {ability.declare && (
              <p className="ability-declare">
                <MarkdownDisplay content={`**Declare:** ${ability.declare}`} />
              </p>
            )}
            {ability.effect && (
              <p className="ability-effect">
                <MarkdownDisplay content={`**Effect:** ${ability.effect}`} />
              </p>
            )}
            {!ability.declare && !ability.effect && ability.description && (
              <MarkdownDisplay content={ability.description} />
            )}
            {!ability.declare && !ability.effect && !ability.description && ability.lore && (
              <MarkdownDisplay content={ability.lore} />
            )}
          </div>
        )}

        {ability.keywords && ability.keywords.length > 0 && (
          <div className="ability-keywords-bar">
            <span className="ability-keywords-label">Keywords</span>
            <span className="ability-keywords-list">{ability.keywords.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Schema-driven abilities renderer for AoS warscrolls.
 * Supports both custom datasource abilities (with description) and
 * native-style abilities (with phase/declare/effect/castingValue/chantValue).
 * Phase tag and strip color use per-ability phase with fallback to category settings.
 *
 * Each category supports a `layout` property:
 * - "full" (default): One ability per row
 * - "half": Two abilities per row (50%)
 * - "third": Three per row (33%)
 * - "quarter": Four per row (25%)
 */
export const DsAosAbilities = ({ card, abilitiesSchema, grandAlliance }) => {
  const categories = abilitiesSchema?.categories || [];

  if (categories.length === 0) return null;

  const renderedGroups = [];

  categories.forEach((category) => {
    const abilities = getAbilitiesForCategory(card.abilities, category.key);
    if (abilities.length === 0) return;

    const showCategory = card.showAbilities?.[category.key] !== false;
    if (!showCategory) return;

    const items = abilities
      .map((ability, index) => (
        <AbilityItem
          key={`${category.key}-${index}`}
          ability={ability}
          category={category}
          grandAlliance={grandAlliance}
          itemKey={`${category.key}-${index}`}
        />
      ))
      .filter(Boolean);

    if (items.length === 0) return;

    const layout = category.layout || "full";
    const layoutClass = LAYOUT_CLASS[layout] || LAYOUT_CLASS.full;

    renderedGroups.push(
      <div
        key={category.key}
        className={`ds-aos-abilities-group ${layoutClass}`}
        data-testid={`abilities-group-${category.key}`}>
        {items}
      </div>,
    );
  });

  if (renderedGroups.length === 0) return null;

  return (
    <div data-testid="ds-aos-abilities" className="ds-aos-abilities-list">
      {renderedGroups}
    </div>
  );
};
