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
export const categorize40kUnits = (datacards) => {
  return datacards?.reduce(
    (cats, card) => {
      // Allied units go to their own section (check first!)
      if (card?.card?._isAllied) {
        cats.allied.push(card);
      } else if (card?.card?.keywords?.includes("Character")) {
        cats.characters.push(card);
      } else if (card?.card?.keywords?.includes("Battleline")) {
        cats.battleline.push(card);
      } else if (card?.card?.keywords?.includes("Dedicated Transport")) {
        cats.transports.push(card);
      } else {
        cats.other.push(card);
      }
      return cats;
    },
    { characters: [], battleline: [], transports: [], other: [], allied: [] }
  );
};

// ===========================================
// AoS Categorization (hierarchical - first match wins)
// ===========================================
export const categorizeAoSUnits = (datacards) => {
  const hasKeyword = (card, keyword) => {
    return card?.card?.keywords?.some((k) => k.toLowerCase() === keyword.toLowerCase());
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
    }
  );
};

// ===========================================
// Sort cards (warlord/general first, then alphabetical)
// ===========================================
export const sortCards = (cards) =>
  cards.toSorted((a, b) => {
    if (a.warlord) return -1;
    if (b.warlord) return 1;
    return a.card.name.localeCompare(b.card.name);
  });

// ===========================================
// 40K Clipboard Format
// ===========================================
export const format40kListText = (sortedCards, sections) => {
  let listText = "Warhammer 40K List";

  const addSection = (clipboardLabel, cards) => {
    if (cards.length === 0) return;
    listText += `\n\n${clipboardLabel}`;
    sortCards(cards).forEach((val) => {
      const totalCost = Number(val?.points?.cost) + (Number(val.enhancement?.cost) || 0) || "?";
      listText += `\n\n${val.card.name} ${val.points?.models > 1 ? val.points?.models + "x" : ""} (${totalCost} pts)`;
      if (val.warlord) {
        listText += `\n   • Warlord`;
      }
      if (val.enhancement) {
        listText += `\n   • Enhancements: ${capitalizeSentence(val.enhancement?.name)} (+${val.enhancement?.cost} pts)`;
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
export const formatAoSListText = (sortedCards, sections) => {
  let listText = "Age of Sigmar List";

  const addSection = (clipboardLabel, cards) => {
    if (cards.length === 0) return;
    listText += `\n\n${clipboardLabel}`;
    sortCards(cards).forEach((val) => {
      const cost = val?.points?.cost || "?";
      listText += `\n\n${val.card.name} (${cost} pts)`;
      if (val.warlord) {
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
