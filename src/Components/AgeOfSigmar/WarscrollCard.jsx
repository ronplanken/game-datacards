import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { WarscrollStatWheel } from "./WarscrollCard/WarscrollStatWheel";
import { WarscrollStatBadges } from "./WarscrollCard/WarscrollStatBadges";
import { WarscrollHeader } from "./WarscrollCard/WarscrollHeader";
import { WarscrollWeapons } from "./WarscrollCard/WarscrollWeapons";
import { WarscrollAbilities } from "./WarscrollCard/WarscrollAbilities";
import { WarscrollKeywords } from "./WarscrollCard/WarscrollKeywords";
import { useIndexedDBImages } from "../../Hooks/useIndexedDBImages";

export const WarscrollCard = ({
  warscroll,
  faction,
  grandAlliance = "order",
  isMobile = false,
  statDisplayMode = "wheel",
  onViewSpell,
  onBack,
}) => {
  const { getImageUrl, isReady } = useIndexedDBImages();
  const [localImageUrl, setLocalImageUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadLocalImage = async () => {
      if (warscroll?.hasLocalImage && warscroll?.uuid && isReady) {
        try {
          const url = await getImageUrl(warscroll.uuid);
          if (isMounted && url) {
            objectUrl = url;
            setLocalImageUrl(objectUrl);
          }
        } catch (error) {
          console.error("[WarscrollCard] Failed to load local image:", error);
        }
      } else {
        if (isMounted) {
          setLocalImageUrl(null);
        }
      }
    };

    loadLocalImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [warscroll?.uuid, warscroll?.hasLocalImage, isReady]);

  if (!warscroll) return null;

  const hasRangedWeapons = warscroll.weapons?.ranged?.length > 0;
  const hasMeleeWeapons = warscroll.weapons?.melee?.length > 0;
  const hasAbilities = warscroll.abilities?.length > 0;

  const showBadges = statDisplayMode === "badges";

  return (
    <div className="warscroll">
      {/* Stat Display Area - includes back button on mobile */}
      <div className="stat-display-area">
        {isMobile && onBack && (
          <button className="warscroll-back-button" onClick={onBack} type="button">
            <ArrowLeft size={20} />
          </button>
        )}
        {showBadges ? (
          <WarscrollStatBadges stats={warscroll.stats} />
        ) : (
          <WarscrollStatWheel stats={warscroll.stats} grandAlliance={grandAlliance} />
        )}
      </div>

      {/* Header with faction banner and unit name */}
      <WarscrollHeader
        warscroll={warscroll}
        faction={faction}
        grandAlliance={grandAlliance}
        imageUrl={localImageUrl || warscroll.imageUrl}
        imageOpacity={warscroll.imageOpacity}
        imagePositionX={warscroll.imagePositionX}
        imagePositionY={warscroll.imagePositionY}
        imageScale={warscroll.imageScale}
        isMobile={isMobile}
      />

      {/* Body */}
      <div className="warscroll-body">
        {/* Summoned By Button */}
        {warscroll.summonedBy && onViewSpell && (
          <button className="summoned-by-button" onClick={() => onViewSpell(warscroll.summonedBy.spell)}>
            <span className="summoned-by-label">Summoned by:</span>
            <span className="summoned-by-spell">{warscroll.summonedBy.spell}</span>
            {warscroll.summonedBy.castingValue && (
              <div className="summoned-by-casting-value">
                <span className="casting-value-number">{warscroll.summonedBy.castingValue}</span>
                <span className="casting-value-plus">+</span>
              </div>
            )}
            <ChevronRight size={18} />
          </button>
        )}

        {/* Weapons Section */}
        {hasRangedWeapons && warscroll.showWeapons?.ranged !== false && (
          <WarscrollWeapons
            weapons={warscroll.weapons.ranged}
            type="ranged"
            grandAlliance={grandAlliance}
            isMobile={isMobile}
          />
        )}
        {hasMeleeWeapons && warscroll.showWeapons?.melee !== false && (
          <WarscrollWeapons
            weapons={warscroll.weapons.melee}
            type="melee"
            grandAlliance={grandAlliance}
            isMobile={isMobile}
          />
        )}

        {/* Abilities Section */}
        {hasAbilities && <WarscrollAbilities abilities={warscroll.abilities} grandAlliance={grandAlliance} />}

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
  );
};
