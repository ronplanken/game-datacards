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
 * Schema-driven abilities renderer for AoS warscrolls.
 * Supports both custom datasource abilities (with description) and
 * native-style abilities (with phase/declare/effect/castingValue/chantValue).
 * Phase tag and strip color use per-ability phase with fallback to category settings.
 */
export const DsAosAbilities = ({ card, abilitiesSchema, grandAlliance }) => {
  const categories = abilitiesSchema?.categories || [];

  if (categories.length === 0) return null;

  const renderedAbilities = [];

  categories.forEach((category) => {
    const abilities = getAbilitiesForCategory(card.abilities, category.key);
    if (abilities.length === 0) return;

    const showCategory = card.showAbilities?.[category.key] !== false;
    if (!showCategory) return;

    abilities.forEach((ability, index) => {
      if (typeof ability === "string") {
        // name-only format
        renderedAbilities.push(
          <div className={`ability-wrapper ${grandAlliance}`} key={`${category.key}-${index}`}>
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
          </div>,
        );
        return;
      }

      if (!ability || ability.showAbility === false) return;

      const tagText = getTagText(ability, category);
      // Per-ability color on the name strip only (set in card data, enabled by category.hasColor)
      const stripStyle = ability.color ? { backgroundColor: ability.color } : undefined;

      renderedAbilities.push(
        <div className={`ability-wrapper ${grandAlliance}`} key={`${category.key}-${index}`}>
          {/* Phase Tag */}
          {tagText && (
            <div className="ability-phase-tag">
              <span>{tagText}</span>
            </div>
          )}

          {/* Ability Card */}
          <div className={`ability-box ${grandAlliance}`}>
            {/* Strip Header with optional per-ability color */}
            <div className="ability-strip" style={stripStyle}>
              <span className="ability-name">{ability.name}</span>
              {ability.castingValue && <span className="ability-casting-badge">{ability.castingValue}+</span>}
              {ability.chantValue && <span className="ability-chant-badge">{ability.chantValue}+</span>}
            </div>

            {/* Ability Text — supports description, declare/effect, and lore */}
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

            {/* Keywords Bar */}
            {ability.keywords && ability.keywords.length > 0 && (
              <div className="ability-keywords-bar">
                <span className="ability-keywords-label">Keywords</span>
                <span className="ability-keywords-list">{ability.keywords.join(", ")}</span>
              </div>
            )}
          </div>
        </div>,
      );
    });
  });

  if (renderedAbilities.length === 0) return null;

  return (
    <div data-testid="ds-aos-abilities" className="ds-aos-abilities-list">
      {renderedAbilities}
    </div>
  );
};
