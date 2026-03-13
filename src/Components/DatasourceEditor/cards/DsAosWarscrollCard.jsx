import React, { useState, useEffect } from "react";
import { WarscrollStatWheel } from "../../AgeOfSigmar/WarscrollCard/WarscrollStatWheel";
import { WarscrollStatBadges } from "../../AgeOfSigmar/WarscrollCard/WarscrollStatBadges";
import { WarscrollHeader } from "../../AgeOfSigmar/WarscrollCard/WarscrollHeader";
import { WarscrollWeapons } from "../../AgeOfSigmar/WarscrollCard/WarscrollWeapons";
import { WarscrollAbilities } from "../../AgeOfSigmar/WarscrollCard/WarscrollAbilities";
import { WarscrollKeywords } from "../../AgeOfSigmar/WarscrollCard/WarscrollKeywords";
import { useIndexedDBImages } from "../../../Hooks/useIndexedDBImages";

/**
 * Builds a stats object for the AoS stat wheel/badges from schema-driven data.
 * Maps schema stat fields to the native stat keys (move, save, control, health, ward, wizard, priest).
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
  // and map field keys to values
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
 * Builds weapon arrays for the AoS warscroll from schema-driven data.
 */
const buildAosWeapons = (card, weaponTypes) => {
  if (!weaponTypes?.types?.length) {
    return card.weapons || {};
  }

  // If weapons is already an object with ranged/melee keys, use directly
  if (card.weapons && !Array.isArray(card.weapons)) {
    return card.weapons;
  }

  // Build from schema weapon types
  const result = {};
  weaponTypes.types.forEach((wt) => {
    const weapons = card[wt.key] || card[`${wt.key}Weapons`] || [];
    // Map weapon profiles to flat format expected by AoS WarscrollWeapons
    result[wt.key] = weapons.flatMap((w) => {
      if (w.profiles?.length) {
        return w.profiles
          .filter((p) => p.active !== false)
          .map((p) => ({
            ...p,
            abilities: p.keywords || [],
          }));
      }
      return [w];
    });
  });
  return result;
};

/**
 * Builds abilities array for AoS warscroll from schema-driven data.
 */
const buildAosAbilities = (card, abilitiesSchema) => {
  if (!abilitiesSchema?.categories?.length) {
    return card.abilities || [];
  }

  // If abilities is already an array, use directly
  if (Array.isArray(card.abilities)) {
    return card.abilities;
  }

  // Flatten from nested object format
  const result = [];
  abilitiesSchema.categories.forEach((cat) => {
    const catAbilities = card.abilities?.[cat.key];
    if (Array.isArray(catAbilities)) {
      catAbilities.forEach((a) => {
        if (typeof a === "string") {
          result.push({ name: a, category: cat.key });
        } else if (a.showAbility !== false) {
          result.push({ ...a, category: cat.key });
        }
      });
    }
  });
  return result;
};

/**
 * Datasource-native AoS Warscroll card renderer.
 * Uses the same CSS class structure as the built-in WarscrollCard
 * but reads data from the schema definition.
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
  const weapons = buildAosWeapons(card, schema.weaponTypes);
  const abilities = buildAosAbilities(card, schema.abilities);

  const hasRangedWeapons = weapons.ranged?.length > 0;
  const hasMeleeWeapons = weapons.melee?.length > 0;
  const hasAbilities = abilities?.length > 0;

  // Use badges for schema-driven stats unless the schema fields match native AoS stat keys
  const nativeStatKeys = ["move", "save", "control", "health"];
  const hasNativeStatKeys = nativeStatKeys.every((key) => statFields.some((f) => f.key === key));
  const showWheel = hasNativeStatKeys || !statFields.length;

  return (
    <div className={`data-aos ${grandAlliance}`} data-testid="ds-aos-warscroll" style={cardStyle}>
      <div className="warscroll">
        <div className="stat-display-area">
          {showWheel ? (
            <WarscrollStatWheel stats={stats} grandAlliance={grandAlliance} />
          ) : (
            <WarscrollStatBadges stats={stats} />
          )}
        </div>

        <WarscrollHeader
          warscroll={{ ...card, name: card.name || "Untitled Warscroll", stats }}
          faction={faction}
          grandAlliance={grandAlliance}
          imageUrl={localImageUrl || card.imageUrl || card.externalImage}
          imageOpacity={card.imageOpacity}
          imagePositionX={card.imagePositionX}
          imagePositionY={card.imagePositionY}
          imageScale={card.imageScale}
        />

        <div className="warscroll-body">
          {hasRangedWeapons && card.showWeapons?.ranged !== false && (
            <WarscrollWeapons weapons={weapons.ranged} type="ranged" grandAlliance={grandAlliance} />
          )}
          {hasMeleeWeapons && card.showWeapons?.melee !== false && (
            <WarscrollWeapons weapons={weapons.melee} type="melee" grandAlliance={grandAlliance} />
          )}

          {hasAbilities && <WarscrollAbilities abilities={abilities} grandAlliance={grandAlliance} />}

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
