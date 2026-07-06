/**
 * Maps a card type to its mobile route segment. Types absent from this map
 * (e.g. "unit") have no segment and use the bare `/mobile/:faction/:unit` route.
 *
 * Keep in sync with the mobile routes defined in `src/index.jsx`.
 */
const MOBILE_CARD_ROUTE_SEGMENTS = {
  stratagem: "stratagem",
  enhancement: "enhancement",
  rule: "rule",
  spell: "spell-lore",
  manifestation: "manifestation-lore",
};

/**
 * Builds the mobile viewer path for a card, inserting the type segment when the
 * card type requires one. Unit and unknown types fall back to the bare
 * `/mobile/:faction/:card` route.
 *
 * @param {string} factionSlug - URL-safe faction name
 * @param {string} cardSlug - URL-safe card name
 * @param {string} [cardType] - Card type or base type (e.g. "stratagem", "rule")
 * @returns {string} The mobile route path
 */
export const getMobileCardPath = (factionSlug, cardSlug, cardType) => {
  const segment = MOBILE_CARD_ROUTE_SEGMENTS[cardType];
  return segment ? `/mobile/${factionSlug}/${segment}/${cardSlug}` : `/mobile/${factionSlug}/${cardSlug}`;
};
