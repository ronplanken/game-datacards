import React from "react";

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
      </div>

      {/* Ability Text */}
      <div className="ability-text">
        {ability.declare && (
          <>
            <strong>Declare:</strong> {ability.declare}
            <br />
          </>
        )}
        {ability.effect && (
          <>
            <strong>Effect:</strong> {ability.effect}
          </>
        )}
        {!ability.declare && !ability.effect && ability.lore && <>{ability.lore}</>}
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
