/**
 * Builds an array of unique filenames (without extension) from an array of cards.
 *
 * Uses the card's `subname` or `extra` field to disambiguate cards with the same name.
 * If duplicates still remain after that, appends `_1`, `_2`, etc.
 *
 * @param {Array<{name?: string, subname?: string, extra?: string}>} cards
 * @returns {string[]} Array of unique filename strings (no extension)
 */
export const buildUniqueFilenames = (cards) => {
  const baseNames = cards.map((card, index) => {
    const name = card?.name || `card-${index}`;
    const sub = card?.subname || card?.extra || "";
    const baseName = sub ? `${name}_${sub}` : name;
    return baseName.replaceAll(" ", "_").replaceAll("&", "and").toLowerCase();
  });

  const totalCounts = {};
  baseNames.forEach((name) => {
    totalCounts[name] = (totalCounts[name] || 0) + 1;
  });

  const seenCounts = {};
  return baseNames.map((name) => {
    if (totalCounts[name] === 1) return name;
    seenCounts[name] = (seenCounts[name] || 0) + 1;
    return `${name}_${seenCounts[name]}`;
  });
};
