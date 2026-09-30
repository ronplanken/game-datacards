import { getBrowsableEnhancements } from "./faction.helpers";
import { SUPPORTED_LANGUAGES, localize } from "./localization.helpers";
import { filterPointsTiersForArmy, getSelectablePointsTiers, isSamePointsTier } from "./listPoints.helpers";

export const INSTANCE_FIELDS = [
  "uuid",
  "isCustom",
  "nonBase",
  "allied",
  "unitSize",
  "selectedEnhancement",
  "selectedWargear",
  "isWarlord",
  "attachedTo",
  "leadBy",
  "print_side",
  "variant",
  "styling",
  "templateId",
  "width",
  "height",
  "background",
  "customHeaderColour",
  "customBannerColour",
  "imageUrl",
  "externalImage",
  "hasLocalImage",
  "imagePositionX",
  "imagePositionY",
  "imageScale",
  "imageOpacity",
  "imageZIndex",
  "hasCustomFactionSymbol",
  "externalFactionSymbol",
  "factionSymbolScale",
  "factionSymbolPositionX",
  "factionSymbolPositionY",
  "factionSymbolUpdatedAt",
  "keepFactionSymbolColours",
  "showWeapons",
  "showAbilities",
  "showPhases",
  "showKeywords",
  "showSections",
  "showPoints",
  "showPointsModels",
  "showAllPoints",
  "wrapKeywords",
];

export const DISPLAY_FLAGS = [
  "active",
  "showAbility",
  "showDescription",
  "showDamagedMarker",
  "showDamagedAbility",
  "showName",
  "showInfo",
  "showInvulnerableSave",
  "showAtTop",
];

export const CARD_UPDATE_STATUS = {
  CHANGED: "changed",
  UP_TO_DATE: "up-to-date",
  NOT_FOUND: "not-found",
  UNAVAILABLE: "unavailable",
};

const FIELD_LABELS = {
  id: "Datasource id",
  name: "Name",
  stats: "Stats",
  rangedWeapons: "Ranged weapons",
  meleeWeapons: "Melee weapons",
  weapons: "Weapons",
  abilities: "Abilities",
  keywords: "Keywords",
  factions: "Faction keywords",
  factionKeywords: "Faction keywords",
  points: "Points",
  composition: "Composition",
  loadout: "Loadout",
  wargear: "Wargear",
  wargearOptions: "Wargear options",
  leader: "Leader",
  leads: "Leads",
  transport: "Transport",
  fluff: "Description",
  description: "Description",
  cost: "Cost",
  when: "When",
  target: "Target",
  effect: "Effect",
  restrictions: "Restrictions",
  additionalCost: "Additional cost",
  baseSize: "Base size",
};

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const isLanguageMap = (value) => {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.length > 0 &&
    keys.every((key) => SUPPORTED_LANGUAGES.includes(key) && (typeof value[key] === "string" || value[key] == null))
  );
};

const isLeaf = (value) => !Array.isArray(value) && (!isPlainObject(value) || isLanguageMap(value));

const stableKey = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableKey).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableKey(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
};

const itemLabel = (item) => {
  if (!isPlainObject(item)) return null;
  const name = localize(item.name);
  if (name) return name;
  const profileName = Array.isArray(item.profiles) ? localize(item.profiles[0]?.name) : "";
  if (profileName) return profileName;
  if (item.models !== undefined && item.cost !== undefined) {
    const keyword = localize(item.keyword);
    const restriction = localize(item.detachment) || localize(item.faction);
    return [`${item.models} models`, keyword, restriction].filter(Boolean).join(" - ");
  }
  return null;
};

const matchKey = (item) => {
  const label = itemLabel(item);
  return label ? label.trim().toLowerCase() : null;
};

const uniqueLabels = (items) => {
  const labels = items.map(matchKey);
  if (labels.some((label) => !label)) return null;
  return new Set(labels).size === labels.length ? labels : null;
};

const matchArrayItems = (before, after) => {
  const beforeLabels = uniqueLabels(before);
  const afterLabels = uniqueLabels(after);
  if (beforeLabels && afterLabels) {
    const pairs = [];
    beforeLabels.forEach((key, index) => {
      const afterIndex = afterLabels.indexOf(key);
      pairs.push({
        label: itemLabel(afterIndex === -1 ? before[index] : after[afterIndex]),
        before: before[index],
        after: afterIndex === -1 ? undefined : after[afterIndex],
      });
    });
    afterLabels.forEach((key, index) => {
      if (!beforeLabels.includes(key))
        pairs.push({ label: itemLabel(after[index]), before: undefined, after: after[index] });
    });
    return pairs;
  }
  const length = Math.max(before.length, after.length);
  return Array.from({ length }, (_, index) => ({
    label: itemLabel(before[index]) || itemLabel(after[index]) || `#${index + 1}`,
    before: before[index],
    after: after[index],
  }));
};

const pushChange = (out, path, before, after) => {
  if (before === undefined) {
    out.push({ kind: "added", path, after });
  } else if (after === undefined) {
    out.push({ kind: "removed", path, before });
  } else {
    out.push({ kind: "changed", path, before, after });
  }
};

const leafKey = (value, language) =>
  isLanguageMap(value) ? JSON.stringify(localize(value, language)) : stableKey(value);

const diffValue = (before, after, path, out, language) => {
  if (before === undefined && after === undefined) return;

  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.every(isLeaf) && after.every(isLeaf)) {
      const beforeKeys = before.map((value) => leafKey(value, language));
      const afterKeys = after.map((value) => leafKey(value, language));
      before.forEach((value, index) => {
        if (!afterKeys.includes(beforeKeys[index])) out.push({ kind: "removed", path, before: value });
      });
      after.forEach((value, index) => {
        if (!beforeKeys.includes(afterKeys[index])) out.push({ kind: "added", path, after: value });
      });
      return;
    }
    matchArrayItems(before, after).forEach((pair) => {
      if (pair.before === undefined || pair.after === undefined) {
        pushChange(out, [...path, pair.label], pair.before, pair.after);
      } else {
        diffValue(pair.before, pair.after, [...path, pair.label], out, language);
      }
    });
    return;
  }

  if (isPlainObject(before) && isPlainObject(after) && !isLanguageMap(before) && !isLanguageMap(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
      (key) => !DISPLAY_FLAGS.includes(key),
    );
    keys.forEach((key) => diffValue(before[key], after[key], [...path, key], out, language));
    return;
  }

  if (leafKey(before, language) !== leafKey(after, language)) {
    pushChange(out, path, before, after);
  }
};

export const diffCardContent = (savedCard, sourceCard, language = "en") => {
  const changes = [];
  if (!savedCard || !sourceCard) return changes;
  const keys = [...new Set([...Object.keys(savedCard), ...Object.keys(sourceCard)])].filter(
    (key) => !INSTANCE_FIELDS.includes(key) && !DISPLAY_FLAGS.includes(key),
  );
  keys.forEach((key) => diffValue(savedCard[key], sourceCard[key], [key], changes, language));
  return changes;
};

const withSource = (items, extra) => (Array.isArray(items) ? items.map((item) => ({ ...item, ...extra(item) })) : []);

const collectRuleCards = (faction, ruleSource) => {
  if (Array.isArray(faction?.rules)) return faction.rules;
  const army = Array.isArray(faction?.rules?.army) ? faction.rules.army : [];
  const detachment = Array.isArray(faction?.rules?.detachment) ? faction.rules.detachment : [];
  const armyCards = army.map((rule) => ({
    ...rule,
    id: `army-rule-${rule.name}`,
    cardType: "rule",
    ruleType: "army",
    faction_id: faction.id,
    source: ruleSource,
  }));
  const detachmentCards = detachment.flatMap((group) =>
    Array.isArray(group?.rules)
      ? group.rules.map((rule) => ({
          ...rule,
          id: `detachment-rule-${group.detachment}-${rule.name}`,
          cardType: "rule",
          ruleType: "detachment",
          detachment: group.detachment,
          faction_id: faction.id,
          source: ruleSource,
        }))
      : [],
  );
  return [...armyCards, ...detachmentCards];
};

const collectLoreSpells = (lores, spellType, factionId) =>
  (Array.isArray(lores) ? lores : []).flatMap((lore) =>
    (Array.isArray(lore?.spells) ? lore.spells : []).map((spell) => ({
      ...spell,
      cardType: "spell",
      spellType,
      loreName: lore.name,
      source: "aos",
      faction_id: spellType === "manifestation" ? lore.faction_id || factionId : factionId,
    })),
  );

const HANDLED_KEYS = ["enhancements", "rules", "warscrolls", "lores", "manifestationLores"];

export const collectFactionCards = (faction, fallbackSource) => {
  if (!faction || typeof faction !== "object") return [];
  const isAoSFaction = Boolean(faction.warscrolls);
  const cards = [];

  Object.entries(faction).forEach(([key, value]) => {
    if (HANDLED_KEYS.includes(key) || !Array.isArray(value)) return;
    value.forEach((item) => {
      if (isPlainObject(item) && item.id !== undefined && item.cardType) cards.push(item);
    });
  });

  cards.push(
    ...getBrowsableEnhancements(faction).map((enhancement) => ({
      ...enhancement,
      cardType: "enhancement",
      source: isAoSFaction ? "aos" : (enhancement.source ?? faction.source ?? fallbackSource ?? "40k-10e"),
    })),
  );
  cards.push(...collectRuleCards(faction, faction.source ?? fallbackSource ?? "40k-10e"));
  cards.push(
    ...withSource(faction.warscrolls, (warscroll) => ({
      cardType: "warscroll",
      source: "aos",
      faction_id: warscroll.faction_id || faction.id,
    })),
  );
  cards.push(...collectLoreSpells(faction.manifestationLores, "manifestation", faction.id));
  cards.push(...collectLoreSpells(faction.lores, "spell", faction.id));

  return cards.filter((card) => card.id !== undefined && card.cardType);
};

const cardKey = (card) => `${card.cardType}::${card.id}`;

const nameKey = (card) => {
  const name = localize(card?.name).trim().toLowerCase();
  return name ? `${card.cardType}::${name}` : null;
};

const isSameSource = (candidate, card) => !candidate.source || !card.source || candidate.source === card.source;

export const buildDatasourceCardIndex = (dataSource, selectedDataSource) => {
  const byKey = new Map();
  const byName = new Map();
  const sources = new Set();
  const factions = Array.isArray(dataSource?.data) ? [...dataSource.data] : [];
  if (dataSource?.genericData) factions.push({ id: "GENERIC", ...dataSource.genericData });

  factions.forEach((faction) => {
    collectFactionCards(faction, selectedDataSource).forEach((card) => {
      const key = cardKey(card);
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(card);
      const name = nameKey(card);
      if (name) {
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name).push(card);
      }
      if (card.source) sources.add(card.source);
    });
  });

  return { byKey, byName, sources };
};

export const findSourceCard = (card, index) => {
  if (!card || card.id === undefined || !card.cardType || !index) return undefined;
  const candidates = (index.byKey.get(cardKey(card)) || []).filter((candidate) => isSameSource(candidate, card));
  if (candidates.length === 0) return undefined;
  return candidates.find((candidate) => candidate.faction_id === card.faction_id) || candidates[0];
};

export const findSourceCardByName = (card, index) => {
  const key = nameKey(card);
  if (!key || !index?.byName) return undefined;
  const candidates = (index.byName.get(key) || []).filter((candidate) => isSameSource(candidate, card));
  const sameFaction = candidates.filter((candidate) => candidate.faction_id === card.faction_id);
  const pool = sameFaction.length > 0 ? sameFaction : candidates;
  return pool.length === 1 ? pool[0] : undefined;
};

export const getCardUpdateStatus = (card, index, language = "en") => {
  if (!card || card.id === undefined || !card.cardType || !index) {
    return { status: CARD_UPDATE_STATUS.UNAVAILABLE, changes: [] };
  }
  if (card.source && !index.sources.has(card.source)) {
    return { status: CARD_UPDATE_STATUS.UNAVAILABLE, changes: [] };
  }
  const byId = findSourceCard(card, index);
  const sourceCard = byId || findSourceCardByName(card, index);
  if (!sourceCard) {
    return { status: CARD_UPDATE_STATUS.NOT_FOUND, changes: [] };
  }
  const changes = diffCardContent(card, sourceCard, language);
  return {
    status: changes.length > 0 ? CARD_UPDATE_STATUS.CHANGED : CARD_UPDATE_STATUS.UP_TO_DATE,
    matchedBy: byId ? "id" : "name",
    sourceCard,
    changes,
  };
};

export const checkCardsForUpdates = (cards, index, language = "en") =>
  (Array.isArray(cards) ? cards : []).map((card) => ({ card, ...getCardUpdateStatus(card, index, language) }));

const carryDisplayFlags = (saved, updated) => {
  if (Array.isArray(saved) && Array.isArray(updated)) {
    if (saved.every(isLeaf) || updated.every(isLeaf)) return updated;
    const savedLabels = uniqueLabels(saved);
    const updatedLabels = uniqueLabels(updated);
    return updated.map((item, index) => {
      let match;
      if (savedLabels && updatedLabels) {
        const savedIndex = savedLabels.indexOf(updatedLabels[index]);
        match = savedIndex === -1 ? undefined : saved[savedIndex];
      } else {
        match = saved[index];
      }
      return match === undefined ? item : carryDisplayFlags(match, item);
    });
  }
  if (isPlainObject(saved) && isPlainObject(updated) && !isLanguageMap(updated)) {
    const result = { ...updated };
    Object.keys(updated).forEach((key) => {
      if (!DISPLAY_FLAGS.includes(key)) result[key] = carryDisplayFlags(saved[key], updated[key]);
    });
    DISPLAY_FLAGS.forEach((flag) => {
      if (flag in saved && flag in updated) result[flag] = saved[flag];
    });
    return result;
  }
  return updated;
};

const resolveUnitSize = (unitSize, updatedCard, army) => {
  if (!unitSize || !Array.isArray(updatedCard?.points)) return unitSize;
  const tiers = filterPointsTiersForArmy(getSelectablePointsTiers(updatedCard), army);
  const match = tiers.find((tier) => isSamePointsTier(tier, unitSize));
  return match ? { ...match } : unitSize;
};

export const applySourceUpdate = (savedCard, sourceCard, army) => {
  if (!savedCard || !sourceCard) return savedCard;
  const updated = carryDisplayFlags(savedCard, JSON.parse(JSON.stringify(sourceCard)));
  INSTANCE_FIELDS.forEach((field) => {
    if (field in savedCard) {
      updated[field] = savedCard[field];
    } else {
      delete updated[field];
    }
  });
  if (savedCard.unitSize) {
    updated.unitSize = resolveUnitSize(savedCard.unitSize, updated, army);
  }
  return updated;
};

export const applyCardUpdates = (cards, results, selectedUuids, army) => {
  const selected = new Set(selectedUuids);
  const byUuid = new Map(
    (results || [])
      .filter((result) => result.status === CARD_UPDATE_STATUS.CHANGED && result.sourceCard)
      .map((result) => [result.card.uuid, result.sourceCard]),
  );
  const updatedUuids = [];
  const nextCards = (cards || []).map((card) => {
    if (!selected.has(card.uuid) || !byUuid.has(card.uuid)) return card;
    updatedUuids.push(card.uuid);
    return applySourceUpdate(card, byUuid.get(card.uuid), army);
  });
  return { cards: nextCards, updatedUuids };
};

const humanise = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

const PATH_CONTAINERS = ["profiles"];

const isDataKey = (segment) => /^[a-z][A-Za-z0-9_]*$/.test(segment);

const formatSegment = (segment) => {
  if (!isDataKey(segment)) return segment;
  if (segment.length <= 3) return segment.toUpperCase();
  return FIELD_LABELS[segment] || humanise(segment);
};

export const formatChangePath = (path) => {
  const labels = [];
  (path || []).forEach((raw, index) => {
    const segment = String(raw);
    if (index > 0 && PATH_CONTAINERS.includes(segment)) return;
    const label = index === 0 ? FIELD_LABELS[segment] || humanise(segment) : formatSegment(segment);
    const previous = labels[labels.length - 1];
    if (previous && previous.toLowerCase() === label.toLowerCase()) return;
    labels.push(label);
  });
  return labels.join(" > ");
};

export const formatChangeValue = (value, language = "en") => {
  if (value === undefined || value === null || value === "") return "(empty)";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (isLanguageMap(value)) return localize(value, language);
  const label = itemLabel(value);
  if (label) return label;
  const text = JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
};
