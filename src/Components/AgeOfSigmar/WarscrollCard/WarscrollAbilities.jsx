import React from "react";
import { WarscrollAbility } from "./WarscrollAbility";

export const WarscrollAbilities = ({ abilities, grandAlliance }) => {
  if (!abilities || abilities.length === 0) return null;

  return (
    <div className={`abilities-container ${grandAlliance}`}>
      {abilities.map((ability, index) => (
        <WarscrollAbility key={ability.id || index} ability={ability} grandAlliance={grandAlliance} />
      ))}
    </div>
  );
};
