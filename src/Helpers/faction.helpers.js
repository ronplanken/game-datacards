import { localize } from "./localization.helpers";

/**
 * Get the name from a detachment (handles the old string format, the object
 * format, and the 11th edition format where `name` is a language-keyed object)
 * @param {string|object} detachment - Detachment as string or object with name/faction
 * @returns {string} The detachment name
 */
export const getDetachmentName = (detachment) => {
  if (typeof detachment === "string") {
    return detachment;
  }
  return localize(detachment?.name) || "";
};

/**
 * Get the faction from a detachment (handles both old string format and new object format)
 * @param {string|object} detachment - Detachment as string or object with name/faction
 * @returns {string|null} The faction name or null if not available
 */
export const getDetachmentFaction = (detachment) => {
  if (typeof detachment === "string") {
    return null;
  }
  return detachment?.faction || null;
};

/**
 * Display labels for the groups an Age of Sigmar faction sorts its enhancements
 * into. Unknown group keys fall back to a humanised form of the key itself, so
 * a datasource that adds a group still lists it.
 */
const AOS_ENHANCEMENT_GROUPS = {
  artefacts: "Artefacts of Power",
  heroicTraits: "Heroic Traits",
  other: "Other Enhancements",
};

const humaniseGroupKey = (key) =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

/**
 * Every enhancement a faction has, flattened for browsing and search, each
 * tagged with the group it came from.
 *
 * 40K factions keep a flat array and have no groups. Age of Sigmar factions
 * keep an object of group-keyed arrays (`{ artefacts, heroicTraits, other }`);
 * those are flattened in group order so the list reads the way the battletome
 * presents it.
 *
 * This is the browsing view. List building uses `getFactionEnhancements` from
 * `listCategories.helpers`, which deliberately only accepts the 40K array shape
 * because the enhancement picker cannot price or validate AoS entries.
 *
 * @param {Object} faction - faction from the datasource
 * @returns {Array} enhancements, each with an `enhancementGroup` label when grouped
 */
export const getBrowsableEnhancements = (faction) => {
  const enhancements = faction?.enhancements;
  if (Array.isArray(enhancements)) return enhancements;
  if (!enhancements || typeof enhancements !== "object") return [];

  return Object.entries(enhancements).flatMap(([key, group]) =>
    (Array.isArray(group) ? group : []).map((enhancement) => ({
      ...enhancement,
      enhancementGroup: AOS_ENHANCEMENT_GROUPS[key] || humaniseGroupKey(key),
    })),
  );
};
