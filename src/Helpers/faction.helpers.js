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
