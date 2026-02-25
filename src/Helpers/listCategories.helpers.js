import { capitalizeSentence } from "./external.helpers";

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
      } else if (card?.keywords?.includes("Character")) {
        cats.characters.push(card);
      } else if (card?.keywords?.includes("Battleline")) {
        cats.battleline.push(card);
      } else if (card?.keywords?.includes("Dedicated Transport")) {
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
      const totalCost = Number(val?.unitSize?.cost) + (Number(val.selectedEnhancement?.cost) || 0) || "?";
      listText += `\n\n${val.name} ${val.unitSize?.models > 1 ? val.unitSize?.models + "x" : ""} (${totalCost} pts)`;
      if (val.isWarlord) {
        listText += `\n   • Warlord`;
      }
      if (val.selectedEnhancement) {
        listText += `\n   • Enhancements: ${capitalizeSentence(val.selectedEnhancement?.name)} (+${val.selectedEnhancement?.cost} pts)`;
      }
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
