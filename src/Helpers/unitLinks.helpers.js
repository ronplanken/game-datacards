import { FACTION_CARD_COLLECTION_KEYS } from "./customDatasource.helpers";
import { UNIT_LINK_PRESETS } from "./customSchema.helpers";

export { UNIT_LINK_PRESETS };

const LEGACY_UNIT_CARD_TYPES = ["DataCard", "datasheet"];

export const getUnitLinkGroups = (cardTypeDef) => {
  const groups = cardTypeDef?.schema?.unitLinks?.groups;
  return Array.isArray(groups) ? groups.filter((group) => group?.key) : [];
};

export const createUnitLinkGroup = (existingGroups = []) => {
  const usedKeys = new Set(existingGroups.map((group) => group?.key));
  const preset = UNIT_LINK_PRESETS.find((p) => !usedKeys.has(p.key));
  if (preset) return { ...preset };

  let index = existingGroups.length + 1;
  while (usedKeys.has(`links_${index}`)) index++;
  return { key: `links_${index}`, label: `Linked units ${index}`, description: "" };
};

export const normalizeUnitLinkEntry = (entry) => {
  if (typeof entry === "string") return { name: entry };
  if (!entry || typeof entry !== "object") return { name: "" };
  const normalized = { name: typeof entry.name === "string" ? entry.name : "" };
  if (entry.cardId) normalized.cardId = entry.cardId;
  return normalized;
};

export const getUnitLinkEntries = (card, groupKey) => {
  const entries = card?.unitLinks?.[groupKey];
  return Array.isArray(entries) ? entries.map(normalizeUnitLinkEntry) : [];
};

export const setUnitLinkEntries = (card, groupKey, entries) => ({
  ...card,
  unitLinks: { ...(card?.unitLinks || {}), [groupKey]: entries },
});

export const findCardInFactions = (factions, cardId) => {
  if (!cardId || !Array.isArray(factions)) return null;
  for (const faction of factions) {
    for (const arrayName of FACTION_CARD_COLLECTION_KEYS) {
      const cards = faction?.[arrayName];
      if (!Array.isArray(cards)) continue;
      const card = cards.find((c) => c?.id === cardId);
      if (card) return { card, faction };
    }
  }
  return null;
};

export const resolveUnitLink = (entry, factions) => {
  const normalized = normalizeUnitLinkEntry(entry);
  if (!normalized.cardId) {
    return { ...normalized, card: null, faction: null, missing: false };
  }
  const match = findCardInFactions(factions, normalized.cardId);
  if (!match) {
    return { ...normalized, card: null, faction: null, missing: true };
  }
  return {
    ...normalized,
    name: match.card.name || normalized.name,
    card: match.card,
    faction: match.faction,
    missing: false,
  };
};

const getUnitCardTypeKeys = (schema) => {
  const keys = new Set(LEGACY_UNIT_CARD_TYPES);
  (schema?.cardTypes || []).forEach((cardType) => {
    if (cardType?.baseType === "unit") {
      keys.add(cardType.key);
      keys.add(cardType.baseType);
    }
  });
  return keys;
};

export const collectLinkableUnitCards = (factions, schema, excludeCardId) => {
  if (!Array.isArray(factions)) return [];
  const unitKeys = getUnitCardTypeKeys(schema);
  const result = [];
  const seen = new Set();

  factions.forEach((faction) => {
    FACTION_CARD_COLLECTION_KEYS.forEach((arrayName) => {
      const cards = faction?.[arrayName];
      if (!Array.isArray(cards)) return;
      cards.forEach((card) => {
        if (!card?.id || card.id === excludeCardId || seen.has(card.id)) return;
        if (!unitKeys.has(card.cardType)) return;
        seen.add(card.id);
        result.push({
          id: card.id,
          name: card.name || "Untitled",
          factionId: faction.id,
          factionName: faction.name || faction.id,
        });
      });
    });
  });

  return result.sort(
    (a, b) => (a.factionName || "").localeCompare(b.factionName || "") || a.name.localeCompare(b.name),
  );
};

export const pickNextLinkableCard = (linkableCards, entries = []) => {
  const linkedIds = new Set(entries.map((entry) => entry?.cardId).filter(Boolean));
  return linkableCards.find((card) => !linkedIds.has(card.id)) || null;
};

export const toCardSlug = (name) => (name || "").replaceAll(" ", "-").toLowerCase();

export const getUnitLinkViewerPath = (resolved, { mobile = false } = {}) => {
  if (!resolved?.card || !resolved?.faction?.name) return null;
  const factionSlug = toCardSlug(resolved.faction.name);
  const cardSlug = toCardSlug(resolved.card.name);
  if (!factionSlug || !cardSlug) return null;
  return mobile ? `/mobile/${factionSlug}/${cardSlug}` : `/viewer/${factionSlug}/${cardSlug}`;
};
