import React from "react";
import { MarkdownDisplay } from "../../MarkdownDisplay";

export const WarscrollAbility = ({ ability, grandAlliance }) => {
  if (!ability) return null;

  // Determine phase class for styling based on ability.phase
  const getPhaseClass = () => {
    const phase = (ability.phase || "").toLowerCase();

    if (phase.includes("start") || phase.includes("deployment")) return "phase-start";
    if (phase.includes("hero")) return "phase-hero";
    if (phase.includes("movement") || phase.includes("move")) return "phase-movement";
    if (phase.includes("shooting") || phase.includes("shoot")) return "phase-shooting";
    if (phase.includes("charge")) return "phase-charge";
    if (phase.includes("combat")) return "phase-combat";
    if (phase.includes("end")) return "phase-end";
    if (ability.isReaction) return "phase-combat"; // Default reactions to combat
    return "phase-passive"; // Default/passive
  };

  // Build the tag text - only show phaseDetails
  const getTagText = () => {
    if (ability.phaseDetails) {
      return ability.phaseDetails.toUpperCase();
    }
    // Fallback to phase or PASSIVE
    if (ability.phase && ability.phase.toLowerCase() !== "passive") {
      return ability.phase.toUpperCase();
    }
    return "PASSIVE";
  };

  const phaseClass = getPhaseClass();
  const tagText = getTagText();

  return (
    <div className={`ability-box ${grandAlliance}`}>
      {/* Ability Strip Header */}
      <div className={`ability-strip ${phaseClass}`}>
        <span className="ability-tag">{tagText}</span>
        <span className="ability-name">{ability.name}</span>
        {ability.castingValue && <span className="ability-casting-badge">{ability.castingValue}+</span>}
        {ability.chantValue && <span className="ability-chant-badge">{ability.chantValue}+</span>}
      </div>

      {/* Ability Text */}
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
        {!ability.declare && !ability.effect && ability.lore && <MarkdownDisplay content={ability.lore} />}
      </div>

      {/* Keywords Bar */}
      {ability.keywords && ability.keywords.length > 0 && (
        <div className="ability-keywords-bar">
          <span className="ability-keywords-label">Keywords</span>
          <span className="ability-keywords-list">{ability.keywords.join(", ")}</span>
        </div>
      )}
    </div>
  );
};
