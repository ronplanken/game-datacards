import { capitalizeSentence } from "./external.helpers";
import { getCardBaseCost, getCardWargearCost } from "./listPoints.helpers";
import { localize } from "./localization.helpers";

// ===========================================
// Keyword helpers (edition-agnostic)
// ===========================================
// 10th edition stores keywords as plain strings ("Character"); 11th edition
// stores them as language-keyed objects ({ en: "Character", de: ... }). Matching
// against the canonical English keyword via localize() therefore works for both,
// so list logic (categorisation, character/enhancement eligibility) does not
// silently break on 11e object-keywords.

/**
 * True when a card carries the given keyword, comparing against the canonical
 * English form (case-insensitive). Works for 10e string keywords and 11e
 * language-keyed object keywords.
 * @param {Object} card - card with a `keywords` array
 * @param {string} keyword - English keyword to test (e.g. "Character")
 */
export const cardHasKeyword = (card, keyword) => {
  if (!card?.keywords || !keyword) return false;
  const target = String(keyword).toLowerCase();
  return card.keywords.some((k) => localize(k, "en").toLowerCase() === target);
};

/**
 * True when a card carries the given token as a keyword or a faction. Enhancement
 * eligibility keys off either (an enhancement's `keywords` can name a faction).
 * The token may be a plain string or a language-keyed object; array/empty tokens
 * never match (preserves the legacy no-op for oddly-shaped exclude entries).
 * @param {Object} card - card with `keywords` and/or `factions`
 * @param {string|Object} token - English keyword or faction name (or {lang} object)
 */
export const cardHasKeywordOrFaction = (card, token) => {
  const name = localize(token, "en");
  if (!name) return false;
  if (cardHasKeyword(card, name)) return true;
  const target = name.toLowerCase();
  return (card?.factions || []).some((f) => localize(f, "en").toLowerCase() === target);
};

/**
 * Whether a unit may take a given enhancement/upgrade, ignoring detachment
 * (the caller applies the selected-detachment filter separately).
 *
 * - Epic Heroes take neither enhancements nor upgrades.
 * - Characters take regular enhancements; non-character units take only
 *   enhancements flagged `equipableByNonCharacter` (11e "(Upgrade)" entries).
 * - The enhancement's `keywords` must match one of the unit's keywords/factions
 *   and its `excludes` must not.
 *
 * @param {Object} card - the unit
 * @param {Object} enhancement - the enhancement/upgrade
 */
/** How many copies of the same Upgrade an army may include (core rules). */
export const MAX_UPGRADE_COPIES = 3;

/**
 * Whether an enhancement is an "Upgrade" — the tagged subset that, unlike other
 * enhancements, may be given to non-Character units and taken up to three times.
 *
 * @param {Object} enhancement
 */
export const isUpgradeEnhancement = (enhancement) => Boolean(enhancement?.equipableByNonCharacter);

/**
 * How many copies of this enhancement the army may include: one for a regular
 * enhancement ("your army cannot include more than one of the same enhancement"),
 * three for an Upgrade.
 *
 * @param {Object} enhancement
 */
export const getEnhancementCopyLimit = (enhancement) => (isUpgradeEnhancement(enhancement) ? MAX_UPGRADE_COPIES : 1);

/**
 * Whether the army already holds as many copies of this enhancement as the rules
 * allow, so it cannot be given to another unit.
 *
 * @param {Object} enhancement
 * @param {Array} cards - the list's cards
 * @param {string} [excludeUuid] - card being edited, so its own copy is not counted
 */
export const isEnhancementAtCopyLimit = (enhancement, cards, excludeUuid) => {
  if (!enhancement?.name) return false;
  const used = (cards || []).filter(
    (card) => card?.uuid !== excludeUuid && card?.selectedEnhancement?.name === enhancement.name,
  ).length;
  return used >= getEnhancementCopyLimit(enhancement);
};

export const isUnitEnhancementEligible = (card, enhancement) => {
  if (!enhancement) return false;
  if (cardHasKeyword(card, "Epic Hero")) return false;
  if (!cardHasKeyword(card, "Character") && !enhancement.equipableByNonCharacter) return false;
  const included = (enhancement.keywords || []).some((kw) => cardHasKeywordOrFaction(card, kw));
  const excluded = (enhancement.excludes || []).some((ex) => cardHasKeywordOrFaction(card, ex));
  return included && !excluded;
};

// ===========================================
// 40K-10e Section Configuration
// ===========================================
export const SECTIONS_40K = [
  { key: "characters", label: "Characters", clipboardLabel: "CHARACTERS" },
  { key: "battleline", label: "Battleline", clipboardLabel: "BATTLELINE" },
  { key: "transports", label: "Dedicated Transports", clipboardLabel: "DEDICATED TRANSPORTS" },
  { key: "other", label: "Other Datasheets", clipboardLabel: "OTHER DATASHEETS" },
  { key: "allied", label: "Allied Units", clipboardLabel: "ALLIED UNITS" },
];

// ===========================================
// AoS Section Configuration
// ===========================================
export const SECTIONS_AOS = [
  { key: "heroes", label: "Heroes", clipboardLabel: "HEROES" },
  { key: "battleline", label: "Battleline", clipboardLabel: "BATTLELINE" },
  { key: "monsters", label: "Monsters", clipboardLabel: "MONSTERS" },
  { key: "cavalry", label: "Cavalry", clipboardLabel: "CAVALRY" },
  { key: "infantry", label: "Infantry", clipboardLabel: "INFANTRY" },
  { key: "warMachines", label: "War Machines", clipboardLabel: "WAR MACHINES" },
  { key: "terrain", label: "Faction Terrain", clipboardLabel: "FACTION TERRAIN" },
  { key: "manifestations", label: "Manifestations", clipboardLabel: "MANIFESTATIONS" },
  { key: "other", label: "Other", clipboardLabel: "OTHER" },
];

// ===========================================
// 40K-10e Categorization
// ===========================================

/**
 * Categorize 40K-10e datacards by unit type (Character, Battleline, Transport, etc.)
 * @param {Array} datacards - Array of datacard objects with card.keywords
 * @returns {{characters: Array, battleline: Array, transports: Array, other: Array, allied: Array}} Categorized datacards
 */
export const categorize40kUnits = (datacards) => {
  return datacards?.reduce(
    (cats, card) => {
      // Allied units go to their own section (check first!)
      if (card?._isAllied) {
        cats.allied.push(card);
      } else if (cardHasKeyword(card, "Character")) {
        cats.characters.push(card);
      } else if (cardHasKeyword(card, "Battleline")) {
        cats.battleline.push(card);
      } else if (cardHasKeyword(card, "Dedicated Transport")) {
        cats.transports.push(card);
      } else {
        cats.other.push(card);
      }
      return cats;
    },
    { characters: [], battleline: [], transports: [], other: [], allied: [] },
  );
};

// ===========================================
// AoS Categorization (hierarchical - first match wins)
// ===========================================

/**
 * Categorize Age of Sigmar datacards by unit type (Hero, Battleline, Monster, etc.)
 * Uses hierarchical matching where first keyword match wins
 * @param {Array} datacards - Array of datacard objects with card.keywords
 * @returns {Object} Categorized datacards with keys: heroes, battleline, monsters, cavalry, infantry, warMachines, terrain, manifestations, other
 */
export const categorizeAoSUnits = (datacards) => {
  const hasKeyword = (card, keyword) => {
    return card?.keywords?.some((k) => k.toLowerCase() === keyword.toLowerCase());
  };

  return datacards?.reduce(
    (cats, card) => {
      if (hasKeyword(card, "Hero")) {
        cats.heroes.push(card);
      } else if (hasKeyword(card, "Battleline")) {
        cats.battleline.push(card);
      } else if (hasKeyword(card, "Monster")) {
        cats.monsters.push(card);
      } else if (hasKeyword(card, "Cavalry")) {
        cats.cavalry.push(card);
      } else if (hasKeyword(card, "Infantry")) {
        cats.infantry.push(card);
      } else if (hasKeyword(card, "War Machine")) {
        cats.warMachines.push(card);
      } else if (hasKeyword(card, "Faction Terrain")) {
        cats.terrain.push(card);
      } else if (hasKeyword(card, "Manifestation")) {
        cats.manifestations.push(card);
      } else {
        cats.other.push(card);
      }
      return cats;
    },
    {
      heroes: [],
      battleline: [],
      monsters: [],
      cavalry: [],
      infantry: [],
      warMachines: [],
      terrain: [],
      manifestations: [],
      other: [],
    },
  );
};

// ===========================================
// Sort cards (warlord/general first, then alphabetical)
// ===========================================

/**
 * Sort cards with warlord/general first, then alphabetically by name
 * @param {Array} cards - Array of card objects with warlord property and card.name
 * @returns {Array} Sorted array of cards
 */
export const sortCards = (cards) =>
  cards.toSorted((a, b) => {
    if (a.isWarlord) return -1;
    if (b.isWarlord) return 1;
    return a.name.localeCompare(b.name);
  });

// ===========================================
// 40K Clipboard Format
// ===========================================

/**
 * Format 40K list as text for clipboard export
 * @param {Object} sortedCards - Cards organized by section keys (characters, battleline, etc.)
 * @param {Array<{key: string, clipboardLabel: string}>} sections - Section configuration
 * @returns {string} Formatted list text for clipboard
 */
export const format40kListText = (sortedCards, sections) => {
  let listText = "Warhammer 40K List";

  const addSection = (clipboardLabel, cards) => {
    if (cards.length === 0) return;
    listText += `\n\n${clipboardLabel}`;
    sortCards(cards).forEach((val) => {
      const totalCost =
        getCardBaseCost(val) + (Number(val.selectedEnhancement?.cost) || 0) + getCardWargearCost(val) || "?";
      listText += `\n\n${val.name} ${val.unitSize?.models > 1 ? val.unitSize?.models + "x" : ""} (${totalCost} pts)`;
      if (val.isWarlord) {
        listText += `\n   • Warlord`;
      }
      if (val.selectedEnhancement) {
        listText += `\n   • Enhancements: ${capitalizeSentence(val.selectedEnhancement?.name)} (+${val.selectedEnhancement?.cost} pts)`;
      }
      (val.selectedWargear || []).forEach((entry) => {
        const quantity = Number(entry?.quantity) > 1 ? `${entry.quantity}x ` : "";
        listText += `\n   • Wargear: ${quantity}${localize(entry?.name)} (+${getCardWargearCost({ selectedWargear: [entry] })} pts)`;
      });
    });
  };

  sections.forEach((section) => {
    addSection(section.clipboardLabel, sortedCards[section.key] || []);
  });

  listText += "\n\nCreated with https://game-datacards.eu";
  return listText;
};

// ===========================================
// AoS Clipboard Format
// ===========================================

/**
 * Format Age of Sigmar list as text for clipboard export
 * @param {Object} sortedCards - Cards organized by section keys (heroes, battleline, etc.)
 * @param {Array<{key: string, clipboardLabel: string}>} sections - Section configuration
 * @returns {string} Formatted list text for clipboard
 */
export const formatAoSListText = (sortedCards, sections) => {
  let listText = "Age of Sigmar List";

  const addSection = (clipboardLabel, cards) => {
    if (cards.length === 0) return;
    listText += `\n\n${clipboardLabel}`;
    sortCards(cards).forEach((val) => {
      const cost = val?.unitSize?.cost || "?";
      listText += `\n\n${val.name} (${cost} pts)`;
      if (val.isWarlord) {
        listText += `\n   • General`;
      }
    });
  };

  sections.forEach((section) => {
    addSection(section.clipboardLabel, sortedCards[section.key] || []);
  });

  listText += "\n\nCreated with https://game-datacards.eu";
  return listText;
};
