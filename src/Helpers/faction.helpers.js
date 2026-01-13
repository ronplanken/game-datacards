/**
 * Default factions to show for Space Marines when showNonDefaultFactions is false
 * These are the core factions that should always be visible
 * Special chapters (Blood Angels, Dark Angels, Space Wolves, Black Templars) are hidden by default
 */
export const DEFAULT_SPACE_MARINE_FACTIONS = [
  "Adeptus Astartes",
  "Ultramarines",
  "Imperial Fists",
  "Iron Hands",
  "Raven Guard",
  "Salamanders",
  "White Scars",
  "Deathwatch",
];

/**
 * Get the name from a detachment (handles both old string format and new object format)
 * @param {string|object} detachment - Detachment as string or object with name/faction
 * @returns {string} The detachment name
 */
export const getDetachmentName = (detachment) => {
  if (typeof detachment === "string") {
    return detachment;
  }
  return detachment?.name || "";
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
 * Check if a detachment should be visible based on settings
 * @param {string|object} detachment - Detachment as string or object with name/faction
 * @param {boolean} showNonDefaultFactions - Whether to show all factions or only defaults
 * @returns {boolean} Whether the detachment should be shown
 */
export const isDetachmentVisible = (detachment, showNonDefaultFactions) => {
  // If showing all factions, always visible
  if (showNonDefaultFactions) {
    return true;
  }

  // If it's a string (old format), always show
  if (typeof detachment === "string") {
    return true;
  }

  const faction = detachment?.faction;
  // If no faction specified, show by default
  if (!faction) {
    return true;
  }

  // Check if faction is in the default list
  return DEFAULT_SPACE_MARINE_FACTIONS.includes(faction);
};

/**
 * Filter detachments based on visibility settings
 * @param {Array<string|object>} detachments - Array of detachments
 * @param {boolean} showNonDefaultFactions - Whether to show all factions
 * @returns {Array<string|object>} Filtered detachments
 */
export const filterDetachments = (detachments, showNonDefaultFactions) => {
  if (!detachments) return [];
  return detachments.filter((detachment) => isDetachmentVisible(detachment, showNonDefaultFactions));
};

/**
 * Check if an item (stratagem, enhancement, rule) should be visible based on its detachment_faction
 * @param {object} item - Item with detachment_faction field
 * @param {boolean} showNonDefaultFactions - Whether to show all factions
 * @returns {boolean} Whether the item should be shown
 */
export const isItemVisibleByDetachmentFaction = (item, showNonDefaultFactions) => {
  // If showing all factions, always visible
  if (showNonDefaultFactions) {
    return true;
  }

  const detachmentFaction = item?.detachment_faction;

  // If no detachment_faction specified, show by default
  if (!detachmentFaction) {
    return true;
  }

  // Check if faction is in the default list
  return DEFAULT_SPACE_MARINE_FACTIONS.includes(detachmentFaction);
};

/**
 * Filter stratagems based on detachment faction visibility
 * @param {Array<object>} stratagems - Array of stratagems
 * @param {boolean} showNonDefaultFactions - Whether to show all factions
 * @returns {Array<object>} Filtered stratagems
 */
export const filterStratagemsByFaction = (stratagems, showNonDefaultFactions) => {
  if (!stratagems) return [];
  return stratagems.filter((stratagem) => isItemVisibleByDetachmentFaction(stratagem, showNonDefaultFactions));
};

/**
 * Filter enhancements based on detachment faction visibility
 * @param {Array<object>} enhancements - Array of enhancements
 * @param {boolean} showNonDefaultFactions - Whether to show all factions
 * @returns {Array<object>} Filtered enhancements
 */
export const filterEnhancementsByFaction = (enhancements, showNonDefaultFactions) => {
  if (!enhancements) return [];
  return enhancements.filter((enhancement) => isItemVisibleByDetachmentFaction(enhancement, showNonDefaultFactions));
};

/**
 * Filter detachment rules based on faction visibility
 * @param {Array<object>} detachmentRules - Array of detachment rule objects with faction field
 * @param {boolean} showNonDefaultFactions - Whether to show all factions
 * @returns {Array<object>} Filtered detachment rules
 */
export const filterDetachmentRulesByFaction = (detachmentRules, showNonDefaultFactions) => {
  if (!detachmentRules) return [];
  if (showNonDefaultFactions) return detachmentRules;

  return detachmentRules.filter((rule) => {
    const faction = rule?.faction;
    if (!faction) return true;
    return DEFAULT_SPACE_MARINE_FACTIONS.includes(faction);
  });
};
