/**
 * Assign a rendered card node into its faction's ref bucket, creating the
 * bucket on first use. Safe for any faction id, including ones not seen before.
 *
 * The Image Generator keeps one bucket of card DOM nodes per faction so they
 * can be captured to PNG. Faction ids are data-driven (they come from the
 * loaded datasource), so buckets must be created on demand rather than seeded
 * from a fixed list: a missing id (e.g. Adeptus Titanicus / "AT", or any newly
 * added faction/edition) would otherwise dereference an undefined bucket and
 * crash the page ("can't access property N, ... is undefined").
 *
 * @param {Record<string, any[]>} buckets - the ref `.current` object, keyed by faction id
 * @param {string} factionId - the faction the card belongs to
 * @param {number} index - the card's index within the faction
 * @param {any} el - the DOM node (or null on unmount)
 */
export const assignBucketRef = (buckets, factionId, index, el) => {
  if (!buckets || factionId == null) return;
  if (!buckets[factionId]) {
    buckets[factionId] = [];
  }
  buckets[factionId][index] = el;
};

// Editions the Image Generator can render. Both share the 40K card structure,
// so the same faction-grouped export (datasheets front/back, stratagems by
// detachment) works for either. Ordered newest-first for the edition picker.
export const IMAGE_GENERATOR_EDITIONS = [
  { id: "40k-11e", title: "40k 11th Edition" },
  { id: "40k-10e", title: "40k 10th Edition" },
];

/**
 * Pick the datasource the generator should start on: keep the user's current
 * selection when it is a supported 40K edition, otherwise fall back to the
 * default (10th edition) so the faction list and renderers always match.
 *
 * @param {string|undefined} selectedDataSource - settings.selectedDataSource
 * @returns {string} a supported edition id
 */
export const resolveInitialEdition = (selectedDataSource) => {
  const isSupported = IMAGE_GENERATOR_EDITIONS.some((e) => e.id === selectedDataSource);
  return isSupported ? selectedDataSource : "40k-10e";
};
