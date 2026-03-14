import React, { useState, useEffect } from "react";
import { WarscrollKeywords } from "../../AgeOfSigmar/WarscrollCard/WarscrollKeywords";
import { DsAosLeftStats } from "./warscroll/DsAosStatBadges";
import { DsAosHeader } from "./warscroll/DsAosHeader";
import { DsAosWeapons } from "./warscroll/DsAosWeapons";
import { DsAosAbilities } from "./warscroll/DsAosAbilities";
import { DsAosSections } from "./warscroll/DsAosSections";
import { useIndexedDBImages } from "../../../Hooks/useIndexedDBImages";

/**
 * Builds a stats object for the AoS card from schema-driven data.
 * Maps schema stat fields to a flat key-value object.
 */
const buildAosStats = (card, statFields) => {
  if (!statFields?.length) {
    return card.stats || {};
  }

  // If stats is already an object (native format), use it directly
  if (card.stats && !Array.isArray(card.stats)) {
    return card.stats;
  }

  // If stats is an array of stat lines (schema format), take the first active line
  if (Array.isArray(card.stats)) {
    const activeStat = card.stats.find((s) => s.active !== false) || card.stats[0];
    if (activeStat) {
      const result = {};
      statFields.forEach((field) => {
        result[field.key] = activeStat[field.key];
      });
      return result;
    }
  }

  return {};
};

/**
 * Datasource-native AoS Warscroll card renderer.
 * Uses schema-driven sub-components for stats, weapons, abilities, and sections.
 * No dependency on native WarscrollHeader — uses DsAosHeader instead so that
 * right-position stats are fully schema-driven.
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides
 * @param {Object} props.faction - The faction data
 */
export const DsAosWarscrollCard = ({ card, cardTypeDef, cardStyle, faction }) => {
  const schema = cardTypeDef?.schema || {};
  const statFields = schema.stats?.fields || [];
  const { getImageUrl, isReady } = useIndexedDBImages();
  const [localImageUrl, setLocalImageUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadLocalImage = async () => {
      if (card?.hasLocalImage && card?.uuid && isReady) {
        try {
          const url = await getImageUrl(card.uuid);
          if (isMounted && url) {
            objectUrl = url;
            setLocalImageUrl(objectUrl);
          }
        } catch (error) {
          // Failed to load local image
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
  }, [card?.uuid, card?.hasLocalImage, isReady]);

  const grandAlliance = card.grandAlliance || faction?.grandAlliance || "order";
  const stats = buildAosStats(card, statFields);

  return (
    <div className={`data-aos ds-warscroll ${grandAlliance}`} data-testid="ds-aos-warscroll" style={cardStyle}>
      <div className="warscroll">
        <div className="stat-display-area">
          <DsAosLeftStats stats={stats} statFields={statFields} grandAlliance={grandAlliance} />
        </div>

        <DsAosHeader
          card={card}
          faction={faction}
          grandAlliance={grandAlliance}
          stats={stats}
          statFields={statFields}
          imageUrl={localImageUrl || card.imageUrl || card.externalImage}
          imageOpacity={card.imageOpacity}
          imagePositionX={card.imagePositionX}
          imagePositionY={card.imagePositionY}
          imageScale={card.imageScale}
        />

        <div className="warscroll-body">
          {(() => {
            const types = schema.weaponTypes?.types || [];
            const maxColumns = Math.max(0, ...types.map((wt) => (wt.columns || []).length));
            return types.map((wt) => {
              const weapons = card.weapons?.[wt.key] || card[wt.key] || card[`${wt.key}Weapons`] || [];
              if (weapons.length === 0 || card.showWeapons?.[wt.key] === false) return null;
              return (
                <DsAosWeapons
                  key={wt.key}
                  weapons={weapons}
                  weaponTypeDef={wt}
                  grandAlliance={grandAlliance}
                  maxColumns={maxColumns}
                />
              );
            });
          })()}

          <DsAosAbilities card={card} abilitiesSchema={schema.abilities} grandAlliance={grandAlliance} />

          <DsAosSections card={card} sectionsSchema={schema.sections} grandAlliance={grandAlliance} />

          <div style={{ flexGrow: 1 }}></div>

          <WarscrollKeywords
            keywords={card.keywords}
            factionKeywords={card.factionKeywords || card.factions}
            grandAlliance={grandAlliance}
          />
        </div>
      </div>
    </div>
  );
};
