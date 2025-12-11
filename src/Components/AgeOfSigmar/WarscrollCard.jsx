import React from "react";
import { WarscrollStatWheel } from "./WarscrollCard/WarscrollStatWheel";
import { WarscrollHeader } from "./WarscrollCard/WarscrollHeader";
import { WarscrollWeapons } from "./WarscrollCard/WarscrollWeapons";
import { WarscrollAbilities } from "./WarscrollCard/WarscrollAbilities";
import { WarscrollKeywords } from "./WarscrollCard/WarscrollKeywords";

export const WarscrollCard = ({
  warscroll,
  faction,
  grandAlliance = "order",
  headerColour,
  bannerColour,
  isPrint = false,
}) => {
  if (!warscroll) return null;

  const hasRangedWeapons = warscroll.weapons?.ranged?.length > 0;
  const hasMeleeWeapons = warscroll.weapons?.melee?.length > 0;
  const hasAbilities = warscroll.abilities?.length > 0;

  return (
    <div className={`data-aos ${grandAlliance}`}>
      <div className="warscroll">
        {/* Stat Wheel - Absolutely positioned in top-left corner */}
        <WarscrollStatWheel stats={warscroll.stats} grandAlliance={grandAlliance} />

        {/* Header with faction banner and unit name */}
        <WarscrollHeader warscroll={warscroll} faction={faction} grandAlliance={grandAlliance} />

        {/* Body */}
        <div className="warscroll-body">
          {/* Weapons Section */}
          {hasRangedWeapons && warscroll.showWeapons?.ranged !== false && (
            <WarscrollWeapons weapons={warscroll.weapons.ranged} type="ranged" grandAlliance={grandAlliance} />
          )}
          {hasMeleeWeapons && warscroll.showWeapons?.melee !== false && (
            <WarscrollWeapons weapons={warscroll.weapons.melee} type="melee" grandAlliance={grandAlliance} />
          )}

          {/* Abilities Section */}
          {hasAbilities && <WarscrollAbilities abilities={warscroll.abilities} grandAlliance={grandAlliance} />}

          {/* Optional Image Area */}
          {warscroll.imageUrl && (
            <div className="warscroll-image-area">
              <img src={warscroll.imageUrl} alt={warscroll.name} />
            </div>
          )}

          {/* Spacer to push footer down */}
          <div style={{ flexGrow: 1 }}></div>

          {/* Keywords Footer */}
          <WarscrollKeywords
            keywords={warscroll.keywords}
            factionKeywords={warscroll.factionKeywords}
            grandAlliance={grandAlliance}
          />
        </div>
      </div>
    </div>
  );
};
