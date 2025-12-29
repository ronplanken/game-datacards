import Fuse from "fuse.js";

// All valid section headers
const SECTION_HEADERS = [
  "CHARACTERS",
  "BATTLELINE",
  "DEDICATED TRANSPORTS",
  "OTHER DATASHEETS",
  "OTHER",
  "ALLIED UNITS",
];

// Space Marine chapters that appear as subfactions
const SPACE_MARINE_CHAPTERS = [
  "Blood Angels",
  "Dark Angels",
  "Space Wolves",
  "Deathwatch",
  "Black Templars",
  "Ultramarines",
  "Imperial Fists",
  "Salamanders",
  "Iron Hands",
  "Raven Guard",
  "White Scars",
];

// Battle size keywords
const BATTLE_SIZE_KEYWORDS = ["Strike Force", "Incursion", "Onslaught", "Combat Patrol"];

// Bullet point patterns
const BULLET_PATTERN = /^[•\-\*◦]\s*/;

// Points pattern - matches both "pts" and "Points"
const POINTS_PATTERN = /\((\d+)\s*(?:pts?|points?)\)$/i;

// Match score thresholds for fuzzy matching classification
const MATCH_THRESHOLD_CONFIDENT = 0.2;
const MATCH_THRESHOLD_AMBIGUOUS = 0.4;

/**
 * Check if a line starts with a battle size keyword
 * @param {string} line - The line to check
 * @returns {boolean} True if the line starts with a battle size keyword
 */
const isBattleSizeLine = (line) => {
  return BATTLE_SIZE_KEYWORDS.some((keyword) => line.startsWith(keyword));
};

/**
 * Parse enhancement name and cost from text like "Master-Crafted Weapon (+10 pts)"
 * @param {string} text - The enhancement text to parse
 * @returns {{name: string, cost: number}} Object with enhancement name and cost
 */
const parseEnhancement = (text) => {
  const costMatch = text.match(/\(\+?(\d+)\s*(?:pts?|points?)\)$/i);
  if (costMatch) {
    const cost = parseInt(costMatch[1], 10);
    const name = text.replace(costMatch[0], "").trim();
    return { name, cost };
  }
  return { name: text.trim(), cost: 0 };
};

/**
 * Analyzes bullet indentation structure to determine model count
 * Based on 40k-ez implementation:
 * - If bullets have nested structure (multiple indent levels): count first-level bullets only
 * - If bullets are all at same level (flat structure): it's a single-model unit, return 1
 * - Special case: if ALL bullets have quantity 1, treat as equipment list (handles inconsistent formatting)
 * @param {Array<{indent: number, quantity: number, text: string}>} bulletLines - Parsed bullet lines with indentation
 * @returns {{modelCount: number, modelIndentLevel: number|null}} Object with model count and indent level
 */
const analyzeModelCount = (bulletLines) => {
  if (bulletLines.length === 0) {
    return { modelCount: 1, modelIndentLevel: null };
  }

  // Special case: if all bullets have quantity 1, it's likely all equipment/weapons
  // This handles cases like vehicles where GW app has inconsistent indentation
  const allQuantityOne = bulletLines.every((b) => b.quantity === 1);
  if (allQuantityOne) {
    return { modelCount: 1, modelIndentLevel: null };
  }

  // Get all unique indentation levels
  const indentLevels = [...new Set(bulletLines.map((b) => b.indent))].sort((a, b) => a - b);

  if (indentLevels.length === 1) {
    // All bullets at same indentation level = single-model unit with weapon list
    return { modelCount: 1, modelIndentLevel: null };
  }

  // Multiple indentation levels = first level is models, deeper levels are weapons
  const firstIndentLevel = indentLevels[0];
  const modelCount = bulletLines.filter((b) => b.indent === firstIndentLevel).reduce((sum, b) => sum + b.quantity, 0);

  return { modelCount: modelCount > 0 ? modelCount : 1, modelIndentLevel: firstIndentLevel };
};

/**
 * Remove invisible Unicode characters that can interfere with parsing
 * Includes: Word Joiner, Zero Width Space, BOM, etc.
 * @param {string} text - The text to clean
 * @returns {string} Text with invisible characters removed
 */
const removeInvisibleChars = (text) => {
  return text.replace(/[\u2060\u200B\uFEFF\u200C\u200D]/g, "");
};

/**
 * Parse the full GW App text format into structured data
 * Based on 40k-ez implementation
 * @param {string} text - The raw text copied from GW App
 * @returns {{listName: string|null, totalPoints: number|null, factionName: string|null, battleSize: string|null, detachment: string|null, subfaction: string|null, units: Array, error: string|null}} Parsed list data
 */
export const parseGwAppText = (text) => {
  if (!text || !text.trim()) {
    return {
      listName: null,
      totalPoints: null,
      factionName: null,
      battleSize: null,
      detachment: null,
      subfaction: null,
      units: [],
      error: "No text provided",
    };
  }

  // Clean invisible characters before parsing
  const cleanedText = removeInvisibleChars(text);
  const lines = cleanedText.split("\n");
  const units = [];
  let listName = null;
  let factionName = null;
  let battleSize = null;
  let detachment = null;
  let subfaction = null;
  let totalPoints = null;

  let currentUnit = null;
  let bulletLines = [];
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    // Calculate indentation level
    const indentation = line.length - line.trimStart().length;

    // Parse header lines (first few lines before sections)
    if (i === 0) {
      // Line 1: List name and total points "My List (2000 Points)"
      const line1Match = trimmed.match(/^(.+?)\s*\((\d+)\s*(?:pts?|points?)\)$/i);
      if (line1Match) {
        listName = line1Match[1].trim();
        totalPoints = parseInt(line1Match[2], 10);
      }
      continue;
    }

    if (i === 2) {
      // Line 3: Faction name (line index 2, after empty line)
      factionName = trimmed;
      continue;
    }

    if (i === 3) {
      if (factionName === "Space Marines") {
        // Line 4 for Space Marines: Subfaction (keep faction as "Space Marines")
        subfaction = trimmed;
      } else {
        // Line 4 for non-Space Marines: Could be Detachment or Battle size
        if (isBattleSizeLine(trimmed)) {
          battleSize = trimmed;
        } else {
          detachment = trimmed;
        }
      }
      continue;
    }

    if (i === 4) {
      if (subfaction) {
        // Line 5 for Space Marines: Battle size
        battleSize = trimmed;
      } else {
        // Line 5 for non-Space Marines: Could be Detachment or Battle size
        if (!battleSize && isBattleSizeLine(trimmed)) {
          battleSize = trimmed;
        } else if (!detachment) {
          detachment = trimmed;
        }
      }
      continue;
    }

    if (i === 5) {
      if (subfaction) {
        // Line 6 for Space Marines: Detachment
        detachment = trimmed;
      }
      continue;
    }

    // Track section headers
    const upperTrimmed = trimmed.toUpperCase();
    if (SECTION_HEADERS.includes(upperTrimmed)) {
      // Save previous unit if exists
      if (currentUnit) {
        const { modelCount, modelIndentLevel } = analyzeModelCount(bulletLines);
        const weapons = [];
        if (modelIndentLevel !== null) {
          for (const bullet of bulletLines) {
            if (bullet.indent > modelIndentLevel) {
              weapons.push(bullet.text);
            }
          }
        } else {
          for (const bullet of bulletLines) {
            if (!bullet.text.toLowerCase().includes("warlord") && !bullet.text.toLowerCase().includes("enhancement")) {
              weapons.push(bullet.text);
            }
          }
        }

        units.push({
          ...currentUnit,
          models: modelCount,
          weapons,
        });
        currentUnit = null;
        bulletLines = [];
      }

      currentSection = upperTrimmed;
      continue;
    }

    // Parse enhancement lines
    const enhancementMatch = trimmed.match(/^[•\-\*◦]?\s*Enhancements?:\s*(.+)$/i);
    if (enhancementMatch && currentUnit) {
      currentUnit.enhancement = parseEnhancement(enhancementMatch[1]);
      continue;
    }

    // Skip special lines
    if (/^(Warlord|Exported with|Created with)/i.test(trimmed)) {
      if (/^Warlord$/i.test(trimmed) && currentUnit) {
        currentUnit.isWarlord = true;
      }
      continue;
    }

    // Check if this is a unit header line (has points in parentheses)
    const unitHeaderMatch = trimmed.match(/^(.+?)\s*\((\d+)\s*(?:pts?|points?)\)$/i);
    if (unitHeaderMatch) {
      // Save previous unit if exists
      if (currentUnit) {
        const { modelCount, modelIndentLevel } = analyzeModelCount(bulletLines);
        const weapons = [];
        if (modelIndentLevel !== null) {
          for (const bullet of bulletLines) {
            if (bullet.indent > modelIndentLevel) {
              weapons.push(bullet.text);
            }
          }
        } else {
          for (const bullet of bulletLines) {
            if (!bullet.text.toLowerCase().includes("warlord") && !bullet.text.toLowerCase().includes("enhancement")) {
              weapons.push(bullet.text);
            }
          }
        }

        units.push({
          ...currentUnit,
          models: modelCount,
          weapons,
        });
      }

      // Start new unit
      currentUnit = {
        originalName: unitHeaderMatch[1].trim(),
        points: parseInt(unitHeaderMatch[2], 10),
        models: 1,
        section: currentSection,
        isWarlord: false,
        enhancement: null,
        weapons: [],
        matchStatus: null,
        matchedCard: null,
        alternatives: [],
        skipped: false,
      };
      bulletLines = [];
      continue;
    }

    // Parse model composition lines (bullet points with quantities)
    const modelMatch = trimmed.match(/^[•\-\*◦]\s*(\d+)x\s+(.+)/);
    if (modelMatch && currentUnit) {
      const quantity = parseInt(modelMatch[1], 10);
      const text = modelMatch[2].trim();
      bulletLines.push({ indent: indentation, quantity, text });
      continue;
    }

    // Parse simple bullet lines (warlord, enhancement, weapons without quantity)
    if (BULLET_PATTERN.test(trimmed) && currentUnit) {
      const cleanText = trimmed.replace(BULLET_PATTERN, "").trim();

      // Check for warlord
      if (/^Warlord$/i.test(cleanText)) {
        currentUnit.isWarlord = true;
        continue;
      }

      // Check for enhancement
      const enhMatch = cleanText.match(/^Enhancements?:\s*(.+)$/i);
      if (enhMatch) {
        currentUnit.enhancement = parseEnhancement(enhMatch[1]);
        continue;
      }

      // Otherwise it's equipment/weapons
      bulletLines.push({ indent: indentation, quantity: 1, text: cleanText });
    }
  }

  // Save last unit
  if (currentUnit) {
    const { modelCount, modelIndentLevel } = analyzeModelCount(bulletLines);
    const weapons = [];
    if (modelIndentLevel !== null) {
      for (const bullet of bulletLines) {
        if (bullet.indent > modelIndentLevel) {
          weapons.push(bullet.text);
        }
      }
    } else {
      for (const bullet of bulletLines) {
        if (!bullet.text.toLowerCase().includes("warlord") && !bullet.text.toLowerCase().includes("enhancement")) {
          weapons.push(bullet.text);
        }
      }
    }

    units.push({
      ...currentUnit,
      models: modelCount,
      weapons,
    });
  }

  if (!factionName) {
    return {
      listName,
      totalPoints,
      factionName: null,
      battleSize,
      detachment,
      subfaction,
      units: [],
      error: "Could not identify faction name",
    };
  }

  return {
    listName,
    totalPoints,
    factionName,
    battleSize,
    detachment,
    subfaction,
    units,
    error: null,
  };
};

/**
 * Classify match score into status
 * @param {number} score - The fuzzy match score (0 = exact match, higher = worse)
 * @returns {"exact"|"confident"|"ambiguous"|"none"} Match status classification
 */
export const classifyMatchScore = (score) => {
  if (score === 0) return "exact";
  if (score < MATCH_THRESHOLD_CONFIDENT) return "confident";
  if (score < MATCH_THRESHOLD_AMBIGUOUS) return "ambiguous";
  return "none";
};

/**
 * Find the best matching faction from the datasource
 * @param {string} factionName - The faction name to match
 * @param {Array<{id: string, name: string}>} factions - Available factions to search
 * @returns {{matchedFaction: Object|null, alternatives: Array, matchStatus: string}} Match result with alternatives
 */
export const matchFaction = (factionName, factions) => {
  if (!factionName || !factions?.length) {
    return { matchedFaction: null, alternatives: [], matchStatus: "none" };
  }

  // First try exact match (case-insensitive)
  const exactMatch = factions.find((f) => f.name.toLowerCase() === factionName.toLowerCase());

  if (exactMatch) {
    return { matchedFaction: exactMatch, alternatives: [], matchStatus: "exact" };
  }

  // Use fuzzy search
  const fuse = new Fuse(factions, {
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
  });

  const results = fuse.search(factionName);

  if (results.length === 0) {
    return { matchedFaction: null, alternatives: factions, matchStatus: "none" };
  }

  const bestMatch = results[0];
  const status = classifyMatchScore(bestMatch.score);

  return {
    matchedFaction: bestMatch.item,
    alternatives: results.slice(1, 5).map((r) => r.item),
    matchStatus: status,
  };
};

/**
 * Get datasheets from allied factions and subfactions
 * Searches both:
 * 1. Factions listed in allied_factions array
 * 2. Factions where parent_id matches the main faction's id (subfactions)
 * @param {Object} faction - The main faction object
 * @param {Array} allFactions - All available factions
 * @returns {Array} Array of datasheets from allied factions with metadata
 */
const getAlliedDatasheets = (faction, allFactions) => {
  if (!allFactions?.length) return [];

  const alliedSheets = [];

  // 1. From allied_factions array
  if (faction?.allied_factions) {
    faction.allied_factions.forEach((alliedId) => {
      const alliedFaction = allFactions.find((f) => f.id === alliedId);
      if (alliedFaction?.datasheets) {
        alliedSheets.push(
          ...alliedFaction.datasheets.map((sheet) => ({
            ...sheet,
            _isAllied: true,
            _alliedFactionId: alliedId,
            _alliedFactionName: alliedFaction.name,
          }))
        );
      }
    });
  }

  // 2. From subfactions (factions with parent_id matching main faction)
  const subfactions = allFactions.filter((f) => f.parent_id === faction?.id);
  subfactions.forEach((subfaction) => {
    if (subfaction?.datasheets) {
      alliedSheets.push(
        ...subfaction.datasheets.map((sheet) => ({
          ...sheet,
          _isAllied: true,
          _alliedFactionId: subfaction.id,
          _alliedFactionName: subfaction.name,
          _isSubfaction: true,
        }))
      );
    }
  });

  return alliedSheets;
};

/**
 * Match parsed units to datasheets in the faction
 * For units in ALLIED UNITS section, also searches allied faction datasheets
 * @param {Array} units - Parsed units from GW App text
 * @param {Object} faction - The matched faction object with datasheets
 * @param {Array} allFactions - All available factions (for allied unit matching)
 * @returns {Array} Units with match status, matched cards, and alternatives
 */
export const matchUnitsToDatasheets = (units, faction, allFactions = []) => {
  if (!units?.length || !faction?.datasheets?.length) {
    return units.map((u) => ({ ...u, matchStatus: "none", matchedCard: null, alternatives: [] }));
  }

  // Get allied datasheets for ALLIED UNITS section matching
  const alliedDatasheets = getAlliedDatasheets(faction, allFactions);

  return units.map((unit) => {
    // For ALLIED UNITS section, include allied faction datasheets in search
    const isAlliedUnit = unit.section === "ALLIED UNITS";
    const searchableSheets = isAlliedUnit ? [...faction.datasheets, ...alliedDatasheets] : faction.datasheets;

    // First try exact match
    const exactMatch = searchableSheets.find((d) => d.name.toLowerCase() === unit.originalName.toLowerCase());

    if (exactMatch) {
      return {
        ...unit,
        matchStatus: "exact",
        matchedCard: exactMatch,
        alternatives: [],
        alliedFactionId: exactMatch._alliedFactionId || null,
        alliedFactionName: exactMatch._alliedFactionName || null,
      };
    }

    // Fuzzy search
    const fuse = new Fuse(searchableSheets, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: true,
    });

    const results = fuse.search(unit.originalName);

    if (results.length === 0) {
      return {
        ...unit,
        matchStatus: "none",
        matchedCard: null,
        alternatives: searchableSheets.slice(0, 10), // Show first 10 as options
        alliedFactionId: null,
        alliedFactionName: null,
      };
    }

    const bestMatch = results[0];
    const status = classifyMatchScore(bestMatch.score);

    // For ambiguous matches, include alternatives
    const alternatives = status === "ambiguous" ? results.slice(1, 5).map((r) => r.item) : [];

    return {
      ...unit,
      matchStatus: status,
      matchedCard: bestMatch.item,
      alternatives,
      alliedFactionId: bestMatch.item._alliedFactionId || null,
      alliedFactionName: bestMatch.item._alliedFactionName || null,
    };
  });
};

/**
 * Count units by match status
 * @param {Array} units - Units with matchStatus property
 * @returns {{ready: number, needsReview: number, notMatched: number, skipped: number}} Counts by status
 */
export const countMatchStatuses = (units) => {
  return units.reduce(
    (counts, unit) => {
      if (unit.skipped) {
        counts.skipped++;
      } else if (unit.matchStatus === "exact" || unit.matchStatus === "confident") {
        counts.ready++;
      } else if (unit.matchStatus === "ambiguous") {
        counts.needsReview++;
      } else {
        counts.notMatched++;
      }
      return counts;
    },
    { ready: 0, needsReview: 0, notMatched: 0, skipped: 0 }
  );
};

/**
 * Get importable units (matched and not skipped)
 * @param {Array} units - Units with matchedCard and skipped properties
 * @returns {Array} Filtered array of units ready for import
 */
export const getImportableUnits = (units) => {
  return units.filter((unit) => !unit.skipped && unit.matchedCard);
};

/**
 * Normalize a weapon name for comparison:
 * - Remove quantity prefixes like "2x " or " x2"
 * - Convert to lowercase
 * - Trim whitespace
 * @param {string} name - The weapon name to normalize
 * @returns {string} Normalized weapon name
 */
const normalizeWeaponName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/^\d+x\s+/i, "") // "2x Storm bolter" -> "Storm bolter"
    .replace(/\s+x\d+$/i, "") // "Storm bolter x2" -> "Storm bolter"
    .trim();
};

/**
 * Normalize dashes in text (en-dash, em-dash -> hyphen)
 * @param {string} text - Text containing various dash characters
 * @returns {string} Text with all dashes normalized to hyphens
 */
const normalizeDashes = (text) => {
  return text.replace(/[–—]/g, "-"); // en-dash and em-dash to hyphen
};

/**
 * Check if an imported weapon string matches a datasheet weapon profile name
 * Handles: case, quantities, weapon variants (e.g., "Bolt rifle - rapid fire", "Blastmaster – Single frequency")
 * @param {string} importedWeapon - Weapon name from import
 * @param {string} profileName - Weapon profile name from datasheet
 * @returns {boolean} True if weapons match
 */
const doesWeaponMatch = (importedWeapon, profileName) => {
  const normalizedImport = normalizeDashes(normalizeWeaponName(importedWeapon));
  const normalizedProfile = normalizeDashes(normalizeWeaponName(profileName));

  // Exact match
  if (normalizedProfile === normalizedImport) return true;

  // Variant match: "Bolt rifle" matches "Bolt rifle - rapid fire"
  if (normalizedProfile.startsWith(normalizedImport + " -")) return true;
  if (normalizedProfile.startsWith(normalizedImport + " (")) return true;

  // Parent match: "Bolt rifle - rapid fire" matches "Bolt rifle"
  const profileBase = normalizedProfile.split(" - ")[0].split(" (")[0].trim();
  if (profileBase === normalizedImport) return true;

  return false;
};

/**
 * Filter weapons on a card based on imported weapon list
 * Sets active: false on weapon profiles NOT in the import list
 * Hides entire sections if no weapons are active
 *
 * @param {Object} card - The datasheet card to filter
 * @param {string[]} importedWeapons - Array of weapon strings from import
 * @returns {Object} - Card with filtered weapons
 */
export const filterCardWeapons = (card, importedWeapons) => {
  if (!importedWeapons?.length) {
    // No weapons imported = no filtering (keep all weapons)
    return card;
  }

  const filteredCard = { ...card };
  filteredCard.showWeapons = { ...card.showWeapons };

  // Filter ranged weapons
  if (card.rangedWeapons?.length) {
    filteredCard.rangedWeapons = card.rangedWeapons.map((weapon) => ({
      ...weapon,
      profiles: weapon.profiles?.map((profile) => ({
        ...profile,
        active: importedWeapons.some((w) => doesWeaponMatch(w, profile.name)),
      })),
    }));

    // Hide section if no ranged weapons are active
    const hasActiveRanged = filteredCard.rangedWeapons.some((weapon) =>
      weapon.profiles?.some((profile) => profile.active)
    );
    if (!hasActiveRanged) {
      filteredCard.showWeapons.rangedWeapons = false;
    }
  }

  // Filter melee weapons
  if (card.meleeWeapons?.length) {
    filteredCard.meleeWeapons = card.meleeWeapons.map((weapon) => ({
      ...weapon,
      profiles: weapon.profiles?.map((profile) => ({
        ...profile,
        active: importedWeapons.some((w) => doesWeaponMatch(w, profile.name)),
      })),
    }));

    // Hide section if no melee weapons are active
    const hasActiveMelee = filteredCard.meleeWeapons.some((weapon) =>
      weapon.profiles?.some((profile) => profile.active)
    );
    if (!hasActiveMelee) {
      filteredCard.showWeapons.meleeWeapons = false;
    }
  }

  // Filter wargear - keep entries that mention any imported weapon
  if (card.wargear?.length) {
    filteredCard.wargear = card.wargear.filter((wargearText) => {
      const lowerText = wargearText.toLowerCase();
      return importedWeapons.some((w) => lowerText.includes(normalizeWeaponName(w)));
    });
    // If no wargear matches, hide the section entirely
    if (filteredCard.wargear.length === 0) {
      filteredCard.showWargear = false;
    }
  }

  return filteredCard;
};
