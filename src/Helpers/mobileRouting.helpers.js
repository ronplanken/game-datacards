// Keep route segments in sync with src/index.jsx; unlisted types use the bare card route.
const MOBILE_CARD_ROUTE_SEGMENTS = {
  stratagem: "stratagem",
  enhancement: "enhancement",
  rule: "rule",
  spell: "spell-lore",
  manifestation: "manifestation-lore",
};

export const getMobileCardPath = (factionSlug, cardSlug, cardType) => {
  const segment = MOBILE_CARD_ROUTE_SEGMENTS[cardType];
  return segment ? `/mobile/${factionSlug}/${segment}/${cardSlug}` : `/mobile/${factionSlug}/${cardSlug}`;
};
