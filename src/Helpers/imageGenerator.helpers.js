/**
 * Helpers for the bulk Image Generator page.
 *
 * The generator keeps one ref bucket per faction, each holding the rendered
 * card DOM nodes so they can be captured to PNG. Faction ids are data-driven
 * (they come from the loaded datasource), so the buckets must NOT be a fixed,
 * hardcoded list: any faction whose id is missing (e.g. Adeptus Titanicus /
 * "AT", or any newly added faction/edition) would otherwise dereference an
 * undefined bucket and crash the page ("can't access property N, ... is
 * undefined").
 */

/**
 * Assign a rendered card node into a faction bucket, creating the bucket on
 * first use. Safe for any faction id, including ones not seen before.
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
