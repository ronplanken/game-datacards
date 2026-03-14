import React, { useState, useEffect } from "react";
import { UnitFactions } from "../../Warhammer40k-10e/UnitCard/UnitFactions";
import { UnitFactionSymbol } from "../../Warhammer40k-10e/UnitCard/UnitFactionSymbol";
import { UnitInvulTop } from "../../Warhammer40k-10e/UnitCard/UnitInvulTop";
import { UnitKeywords } from "../../Warhammer40k-10e/UnitCard/UnitKeywords";
import { UnitName } from "../../Warhammer40k-10e/UnitCard/UnitName";
import { Ds40kUnitStats } from "./units/Ds40kUnitStats";
import { Ds40kUnitWeapons } from "./units/Ds40kUnitWeapons";
import { Ds40kUnitExtra } from "./units/Ds40kUnitExtra";
import { useIndexedDBImages } from "../../../Hooks/useIndexedDBImages";

/**
 * Datasource-native 40K Unit card renderer.
 * Uses the same CSS class structure as the built-in UnitCardFront
 * but reads stats/weapons/abilities from the schema definition.
 *
 * Sub-components reused directly (data shape compatible):
 *   UnitName, UnitKeywords, UnitFactions, UnitFactionSymbol
 *
 * Sub-components adapted for schema-driven data:
 *   Ds40kUnitStats, Ds40kUnitWeapons, Ds40kUnitExtra
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides
 */
export const Ds40kUnitCard = ({ card, cardTypeDef, cardStyle }) => {
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

  // Support invulnerable save from both flat and nested abilities format
  const invul = Array.isArray(card.abilities) ? null : card.abilities?.invul;

  return (
    <div className="data-40k-10e" data-testid="ds-40k-unit">
      <div className="unit-card-front-wrapper" style={cardStyle}>
        <div className="unit front" data-name={card.name} data-fullname={`${card.name} ${card.subname || ""}`}>
          <div className="header">
            <UnitName
              name={card.name || "Untitled Unit"}
              subname={card.subname}
              points={card.points}
              legends={card.legends}
              combatPatrol={card.combatPatrol}
              externalImage={card.externalImage}
              localImageUrl={localImageUrl}
              imageZIndex={card.imageZIndex}
              imagePositionX={card.imagePositionX}
              imagePositionY={card.imagePositionY}
              showAllPoints={card.showAllPoints}
              showPointsModels={card.showPointsModels}
            />
            <Ds40kUnitStats stats={card.stats} statFields={statFields} />
            <div className="stats_container" key="stat-line-invul">
              {invul?.showInvulnerableSave && invul?.showAtTop && <UnitInvulTop invul={invul} />}
            </div>
          </div>
          <div className="data_container">
            <div className="data">
              <Ds40kUnitWeapons unit={card} weaponTypes={schema.weaponTypes} sectionsSchema={schema.sections} />
              <Ds40kUnitExtra unit={card} abilitiesSchema={schema.abilities} />
            </div>
          </div>
          <div className="footer">
            {schema.metadata?.hasKeywords !== false && <UnitKeywords keywords={card.keywords} />}
            {schema.metadata?.hasFactionKeywords !== false && <UnitFactions factions={card.factions} />}
          </div>
          <UnitFactionSymbol unit={card} />
        </div>
      </div>
    </div>
  );
};
