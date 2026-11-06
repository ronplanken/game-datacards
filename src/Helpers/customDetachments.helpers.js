import { localize } from "./localization.helpers";
import { getDetachmentKey, getDetachmentForceDispositions } from "./listRoster.helpers";

const CUSTOM_ID_PREFIX = "custom:";

const norm = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const englishName = (value) => (localize(value, "en") || "").trim();

const getAllCards = (categories) =>
  (Array.isArray(categories) ? categories : []).flatMap((category) =>
    Array.isArray(category?.cards) ? category.cards : [],
  );

const isEleventhEditionCard = (card) => card?.source === "40k-11e";

export const isDetachmentRuleCard = (card) =>
  isEleventhEditionCard(card) && card?.cardType === "rule" && card?.ruleType === "detachment";

export const isCustomDetachment = (detachment) =>
  Boolean(detachment?.custom) || String(detachment?.id || "").startsWith(CUSTOM_ID_PREFIX);

export const getCustomDetachmentId = (factionId, name) => `${CUSTOM_ID_PREFIX}${factionId}:${norm(name)}`;

const getDetachmentPoints = (card) => {
  const value = Number(card?.detachmentPoints);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

export const collectCustomDetachments = (categories, faction) => {
  const factionId = faction?.id;
  if (!factionId) return [];

  const officialNames = new Set(
    (Array.isArray(faction?.detachments) ? faction.detachments : []).map((d) => norm(englishName(d?.name ?? d))),
  );

  const groups = new Map();
  for (const card of getAllCards(categories)) {
    if (!isDetachmentRuleCard(card) || card.faction_id !== factionId) continue;
    const name = englishName(card.detachment);
    if (!name || officialNames.has(norm(name))) continue;

    const key = norm(name);
    const group = groups.get(key) || { name: card.detachment, points: undefined, dispositions: [] };
    if (group.points === undefined) group.points = getDetachmentPoints(card);
    for (const entry of getDetachmentForceDispositions(card)) {
      const entryName = norm(localize(entry.name, "en"));
      if (!group.dispositions.some((existing) => norm(localize(existing.name, "en")) === entryName)) {
        group.dispositions.push(entry);
      }
    }
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const detachment = {
      id: getCustomDetachmentId(factionId, englishName(group.name)),
      name: group.name,
      detachmentPoints: group.points ?? 1,
      custom: true,
    };
    if (group.dispositions.length > 0) {
      detachment.forceDispositions = group.dispositions;
      detachment.forceDisposition = group.dispositions[0];
    }
    return detachment;
  });
};

export const collectCustomEnhancements = (categories, faction, customDetachments, language = "en") => {
  const factionId = faction?.id;
  if (!factionId) return [];

  const detachmentNames = new Set((customDetachments || []).map((d) => norm(englishName(d?.name))));
  if (detachmentNames.size === 0) return [];

  const official = new Set(
    (Array.isArray(faction?.enhancements) ? faction.enhancements : []).map((e) => norm(localize(e?.name, "en"))),
  );

  const seen = new Set();
  const enhancements = [];
  for (const card of getAllCards(categories)) {
    if (!isEleventhEditionCard(card) || card?.cardType !== "enhancement" || card.faction_id !== factionId) continue;
    const detachment = englishName(card.detachment);
    if (!detachmentNames.has(norm(detachment))) continue;

    const name = localize(card.name, language);
    const key = norm(localize(card.name, "en") || name);
    if (!name || official.has(key) || seen.has(key)) continue;
    seen.add(key);

    enhancements.push({
      id: card.id,
      name,
      description: card.description,
      detachment,
      cost: card.cost,
      keywords: card.keywords || [],
      excludes: card.excludes || [],
      equipableByNonCharacter: Boolean(card.equipableByNonCharacter),
      faction_id: card.faction_id,
      source: card.source,
      custom: true,
    });
  }
  return enhancements;
};

export const withCustomContent = (faction, categories, language = "en") => {
  if (!faction) return faction;
  const detachments = collectCustomDetachments(categories, faction);
  if (detachments.length === 0) return faction;

  const enhancements = collectCustomEnhancements(categories, faction, detachments, language);
  return {
    ...faction,
    detachments: [...(Array.isArray(faction.detachments) ? faction.detachments : []), ...detachments],
    enhancements: [...(Array.isArray(faction.enhancements) ? faction.enhancements : []), ...enhancements],
  };
};

export const refreshCustomDetachments = (selected, available) => {
  const list = Array.isArray(selected) ? selected : [];
  const byKey = new Map((available || []).filter(isCustomDetachment).map((d) => [getDetachmentKey(d), d]));
  let changed = false;
  const next = list.map((detachment) => {
    if (!isCustomDetachment(detachment)) return detachment;
    const fresh = byKey.get(getDetachmentKey(detachment));
    if (!fresh || fresh === detachment) return detachment;
    changed = true;
    return fresh;
  });
  return changed ? next : list;
};

export const splitRosterDetachments = (available, selected) => {
  const list = Array.isArray(available) ? available : [];
  const official = list.filter((d) => !isCustomDetachment(d));
  const custom = list.filter(isCustomDetachment);
  const keys = new Set(custom.map(getDetachmentKey));
  const orphaned = (selected || []).filter((d) => isCustomDetachment(d) && !keys.has(getDetachmentKey(d)));
  return { official, custom: [...custom, ...orphaned] };
};
