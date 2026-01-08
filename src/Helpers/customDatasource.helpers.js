import { v4 as uuidv4 } from "uuid";

// Valid display formats that map to existing card renderers
export const VALID_DISPLAY_FORMATS = ["40k-10e", "40k", "basic", "necromunda", "aos"];

// Validation limits for security
const MAX_NAME_LENGTH = 200;
const MAX_VERSION_LENGTH = 50;
const MAX_FACTION_COUNT = 10;
const MAX_CARD_COUNT = 2000;
const MAX_STRING_FIELD_LENGTH = 10000;

// Map card types to faction array names
const CARD_TYPE_TO_ARRAY = {
  DataCard: "datasheets",
  datasheet: "datasheets",
  stratagem: "stratagems",
  enhancement: "enhancements",
  warscroll: "warscrolls",
  spell: "manifestationLores",
  psychic: "psychicpowers",
  secondary: "secondaries",
  rule: "rules",
  ganger: "datasheets",
  vehicle: "datasheets",
};

/**
 * Validates a custom datasource JSON structure
 * @param {Object} data - The datasource data to validate
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateCustomDatasource = (data) => {
  const errors = [];

  // Check required top-level fields
  if (!data) {
    errors.push("Invalid data: datasource is empty or undefined");
    return { isValid: false, errors };
  }

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push("Missing or invalid 'name' field");
  } else if (data.name.length > MAX_NAME_LENGTH) {
    errors.push(`Name exceeds maximum length of ${MAX_NAME_LENGTH} characters`);
  }

  if (!data.version || typeof data.version !== "string") {
    errors.push("Missing or invalid 'version' field");
  } else if (data.version.length > MAX_VERSION_LENGTH) {
    errors.push(`Version exceeds maximum length of ${MAX_VERSION_LENGTH} characters`);
  }

  // displayFormat is optional - cards have their own source property

  if (!data.data || !Array.isArray(data.data)) {
    errors.push("Missing or invalid 'data' array");
  } else if (data.data.length === 0) {
    errors.push("'data' array must contain at least one faction");
  } else if (data.data.length > MAX_FACTION_COUNT) {
    errors.push(`Too many factions (maximum ${MAX_FACTION_COUNT})`);
  } else {
    // Validate faction structure
    const faction = data.data[0];
    if (!faction.id || typeof faction.id !== "string") {
      errors.push("Faction missing 'id' field");
    }
    if (!faction.name || typeof faction.name !== "string") {
      errors.push("Faction missing 'name' field");
    }
    if (!faction.colours || typeof faction.colours !== "object") {
      errors.push("Faction missing 'colours' field");
    } else {
      if (!faction.colours.header) {
        errors.push("Faction colours missing 'header' field");
      }
      if (!faction.colours.banner) {
        errors.push("Faction colours missing 'banner' field");
      }
    }

    // Count total cards across all factions and validate
    let totalCards = 0;
    const cardArrays = Object.values(CARD_TYPE_TO_ARRAY);
    const uniqueArrays = [...new Set(cardArrays)];

    for (const factionData of data.data) {
      for (const arrayName of uniqueArrays) {
        if (factionData[arrayName] && Array.isArray(factionData[arrayName])) {
          totalCards += factionData[arrayName].length;

          // Validate individual card fields aren't excessively long
          for (const card of factionData[arrayName]) {
            if (card.name && typeof card.name === "string" && card.name.length > MAX_STRING_FIELD_LENGTH) {
              errors.push("Card name exceeds maximum allowed length");
              break;
            }
          }
        }
      }
    }

    if (totalCards > MAX_CARD_COUNT) {
      errors.push(`Too many cards (${totalCards}). Maximum allowed is ${MAX_CARD_COUNT}`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Generates a safe filename from a datasource name
 * @param {string} name - The datasource name
 * @returns {string} - A safe filename
 */
export const generateDatasourceFilename = (name) => {
  if (!name) return "untitled-datasource.json";
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  return `${safeName}-datasource.json`;
};

/**
 * Generates a slug ID from a name
 * @param {string} name - The name to convert
 * @returns {string} - A slug ID
 */
export const generateIdFromName = (name) => {
  if (!name) return "untitled";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

/**
 * Gets the target array name for a card type
 * @param {string} cardType - The card type
 * @returns {string} - The faction array name
 */
export const getTargetArray = (cardType) => {
  return CARD_TYPE_TO_ARRAY[cardType] || "datasheets";
};

/**
 * Maps cards from a category to faction structure for export
 * @param {Array} cards - Array of cards from the category
 * @param {Object} factionInfo - Faction metadata (id, name, colours)
 * @returns {Object} - Faction object with cards organized by type
 */
export const mapCardsToFactionStructure = (cards, factionInfo) => {
  const faction = {
    id: factionInfo.id,
    name: factionInfo.name,
    colours: factionInfo.colours,
  };

  // Group cards by their target arrays
  cards.forEach((card) => {
    const targetArray = getTargetArray(card.cardType);

    if (!faction[targetArray]) {
      faction[targetArray] = [];
    }

    // Clone card and preserve original source for correct rendering
    const exportCard = {
      ...card,
      faction_id: factionInfo.id,
    };

    // Remove category-specific fields that shouldn't be in datasource
    delete exportCard.uuid;
    delete exportCard.isCustom;

    faction[targetArray].push(exportCard);
  });

  return faction;
};

/**
 * Extracts all cards from a faction object back into a flat array
 * Reverses mapCardsToFactionStructure for download/editing
 * @param {Object} faction - Faction with typed arrays (datasheets, stratagems, etc.)
 * @returns {Array} - Flat array of all cards with uuid and isCustom restored
 */
export const extractCardsFromFaction = (faction) => {
  if (!faction) return [];

  const cards = [];
  const arrayNames = [...new Set(Object.values(CARD_TYPE_TO_ARRAY))];

  // Extract from all typed arrays
  arrayNames.forEach((arrayName) => {
    if (faction[arrayName] && Array.isArray(faction[arrayName])) {
      faction[arrayName].forEach((card) => {
        cards.push({
          ...card,
          uuid: card.uuid || uuidv4(), // Restore uuid for local editing
          isCustom: true,
        });
      });
    }
  });

  // Also check 'cards' array for backwards compatibility
  if (faction.cards && Array.isArray(faction.cards)) {
    faction.cards.forEach((card) => {
      cards.push({
        ...card,
        uuid: card.uuid || uuidv4(),
        isCustom: true,
      });
    });
  }

  return cards;
};

/**
 * Creates a complete datasource object for export
 * @param {Object} options - Export options
 * @param {string} options.name - Datasource name
 * @param {string} options.id - Datasource ID
 * @param {string} options.version - Version string
 * @param {string} options.author - Author name (optional)
 * @param {Array} options.cards - Cards to export
 * @param {string} options.factionName - Faction name
 * @param {Object} options.colours - Faction colors {header, banner}
 * @returns {Object} - Complete datasource object
 */
export const createDatasourceExport = (options) => {
  const { name, id, version, author, cards, factionName, colours } = options;

  const factionId = id || generateIdFromName(factionName);

  const faction = mapCardsToFactionStructure(cards, {
    id: factionId,
    name: factionName,
    colours,
  });

  const datasource = {
    id: factionId,
    name,
    version,
    lastUpdated: new Date().toISOString(),
    data: [faction],
  };

  if (author) {
    datasource.author = author;
  }

  return datasource;
};

/**
 * Prepares a datasource for import by generating storage ID
 * Card sources are preserved as-is to maintain correct rendering
 * @param {Object} datasource - The datasource to prepare
 * @param {string} sourceType - "url" or "local"
 * @param {string} sourceUrl - The source URL (for URL imports)
 * @returns {Object} - Prepared datasource with storage ID
 */
export const prepareDatasourceForImport = (datasource, sourceType, sourceUrl = null) => {
  const storageId = `custom-${uuidv4()}`;

  // Preserve card data as-is - each card has its own source property for rendering

  return {
    ...datasource,
    id: storageId,
    sourceType,
    sourceUrl,
    lastCheckedForUpdate: sourceType === "url" ? new Date().toISOString() : undefined,
  };
};

/**
 * Counts total cards in a datasource across all faction arrays
 * @param {Object} datasource - The datasource to count cards from
 * @returns {number} - Total card count
 */
export const countDatasourceCards = (datasource) => {
  let count = 0;
  const arrayNames = Object.values(CARD_TYPE_TO_ARRAY);
  const uniqueArrays = [...new Set(arrayNames)];

  datasource.data?.forEach((faction) => {
    uniqueArrays.forEach((arrayName) => {
      if (faction[arrayName] && Array.isArray(faction[arrayName])) {
        count += faction[arrayName].length;
      }
    });
  });

  return count;
};

/**
 * Creates a registry entry for a custom datasource
 * @param {Object} datasource - The prepared datasource
 * @returns {Object} - Registry entry for settings storage
 */
export const createRegistryEntry = (datasource) => {
  return {
    id: datasource.id,
    name: datasource.name,
    cardCount: countDatasourceCards(datasource),
    sourceType: datasource.sourceType,
    sourceUrl: datasource.sourceUrl || null,
    version: datasource.version,
    author: datasource.author || null,
    lastUpdated: datasource.lastUpdated,
    lastCheckedForUpdate: datasource.lastCheckedForUpdate || null,
  };
};

/**
 * Compares two semantic versions
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} - -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export const compareVersions = (v1, v2) => {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
};

/**
 * Counts cards by type in a category
 * @param {Array} cards - Array of cards
 * @returns {Object} - Object with card type counts and total
 */
export const countCardsByType = (cards) => {
  const counts = {};
  let total = 0;

  cards.forEach((card) => {
    const type = card.cardType || "unknown";
    counts[type] = (counts[type] || 0) + 1;
    total++;
  });

  return { counts, total };
};

/**
 * Formats card count breakdown as a string
 * @param {Object} counts - Card type counts
 * @returns {string} - Formatted string (e.g., "8 datasheets, 4 stratagems")
 */
export const formatCardBreakdown = (counts) => {
  const parts = [];

  Object.entries(counts).forEach(([type, count]) => {
    const label = type === "DataCard" ? "datasheet" : type;
    parts.push(`${count} ${label}${count !== 1 ? "s" : ""}`);
  });

  return parts.join(", ");
};
