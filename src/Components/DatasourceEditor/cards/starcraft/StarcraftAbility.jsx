import React from "react";
import { VALID_ABILITY_TYPES } from "../../../../Helpers/customSchema.helpers";

const renderCostChips = (costs) => {
  if (!Array.isArray(costs) || costs.length === 0) return null;
  return costs.map((cost, idx) => {
    if (!cost || cost.amount === "" || cost.amount === null || cost.amount === undefined) return null;
    const unit = (cost.unit || "").toUpperCase();
    const chipClass = ["CP", "BM"].includes(unit) ? `sc-chip-${unit}` : "sc-chip-generic";
    return (
      <span key={`${idx}-${unit}`} className={`sc-chip ${chipClass}`}>
        {cost.amount} {unit}
      </span>
    );
  });
};

const renderTypePill = (type) => {
  if (!type) return null;
  const upper = String(type).toUpperCase();
  if (!VALID_ABILITY_TYPES.includes(upper)) return null;
  return <span className={`sc-pill sc-pill-${upper}`}>{upper}</span>;
};

/**
 * Renders a single Starcraft TMG ability with optional up-arrow glyph (shown
 * when the ability is `triggered` or `upgrade`), name, PASSIVE/ACTIVE/REACTION
 * pill, cost chips, and description.
 *
 * @param {boolean} props.inline - When true, render as inline flow (used by
 *   movement-style phase rows where abilities are part of a paragraph rather
 *   than discrete cells in a grid).
 */
export const StarcraftAbility = ({ ability, category, inline = false }) => {
  if (!ability) return null;
  const showUpIcon = !!category?.hasTriggerIcon && (ability.triggered || ability.upgrade);
  const showType = !!category?.hasType;
  const showCost = !!category?.hasCost;

  const Wrapper = inline ? "span" : "div";

  return (
    <Wrapper className={inline ? "sc-ability-inline" : "sc-ability"}>
      {showUpIcon && <span className="sc-up-ico" aria-hidden="true" />}
      {ability.name && <span className="sc-ability-name">{ability.name}:</span>}{" "}
      {showType && renderTypePill(ability.type)}
      {showCost && renderCostChips(ability.costs)}
      {ability.description && <span className="sc-ability-description">{ability.description}</span>}
    </Wrapper>
  );
};
