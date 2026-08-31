import Fuse from "fuse.js";
import { v4 as uuidv4 } from "uuid";
import { parseArmyList } from "./armyListParser.helpers";
import { localize } from "./localization.helpers";
import { BATTLE_SIZES, canAddDetachment } from "./listRoster.helpers";
import { filterPointsTiersForArmy, getSelectablePointsTiers } from "./listPoints.helpers";

// Match score thresholds for fuzzy matching classification
const MATCH_THRESHOLD_CONFIDENT = 0.2;
const MATCH_THRESHOLD_AMBIGUOUS = 0.4;

// The section a unit is reported under, per bucket the parser puts it in. An
// export that states its own section header keeps that header verbatim; these
// are only for the shapes that carry none (a compact WTC export), so a caller
// grouping by section still gets something sensible.
const SECTION_BY_CATEGORY = {
  characters: "CHARACTERS",
  battleline: "BATTLELINE",
  transports: "DEDICATED TRANSPORTS",
  other: "OTHER DATASHEETS",
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
 * Parse the full GW App text format into structured data.
 *
 * The reading itself is done by `parseArmyList` (see armyListParser.helpers.js),
 * the parser shared with the streamer app, which handles both the app's title
 * format and the WTC "+++" format across 10th and 11th edition. This wraps it in
 * the shape the importers consume: units carry an `originalName` to match
 * against datasheets, an enhancement split into name and cost, and a section.
 *
 * @param {string} text - The raw text copied from GW App
 * @returns {{listName: string|null, totalPoints: number|null, factionName: string|null, battleSize: string|null, detachment: string|null, detachmentPoints: number|null, disposition: string|null, subfaction: string|null, units: Array, error: string|null}} Parsed list data
 */
export const parseGwAppText = (text) => {
  const empty = {
    listName: null,
    totalPoints: null,
    factionName: null,
    battleSize: null,
    detachment: null,
    detachmentPoints: null,
    disposition: null,
    subfaction: null,
    units: [],
    error: null,
  };

  if (!text || !text.trim()) {
    return { ...empty, error: "No text provided" };
  }

  const list = parseArmyList(removeInvisibleChars(text));

  const parsed = {
    listName: list.name,
    totalPoints: list.points,
    factionName: list.faction,
    battleSize: list.battleSize,
    detachment: list.detachment,
    detachmentPoints: list.detachmentPoints,
    disposition: list.disposition,
    subfaction: list.subfaction,
    units: list.units.map((unit) => ({
      originalName: unit.name,
      points: unit.points ?? 0,
      models: unit.models ?? 1,
      section: unit.section || SECTION_BY_CATEGORY[unit.category] || null,
      category: unit.category,
      isWarlord: unit.isWarlord,
      // The importer subtracts the cost from the unit's points to get the
      // datasheet's own cost. An export that annotates the enhancement only as
      // an "(Upgrade)" states no cost, so it stays 0 here and the faction data
      // prices it in matchEnhancementsToFaction.
      enhancement: unit.enhancement ? { name: unit.enhancement, cost: unit.enhancementCost ?? 0 } : null,
      weapons: unit.wargear,
      // The characters attached to this unit, and the block it was listed in.
      leaders: unit.leaders,
      attachment: unit.attachment,
      matchStatus: null,
      matchedCard: null,
      alternatives: [],
      skipped: false,
    })),
    error: null,
  };

  if (!parsed.factionName) {
    return { ...parsed, units: [], error: "Could not identify faction name" };
  }

  return parsed;
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
          })),
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
        })),
      );
    }
  });

  return alliedSheets;
};

/**
 * Get datasheets from parent faction (for subfactions)
 * @param {Object} faction - The subfaction object
 * @param {Array} allFactions - All available factions
 * @returns {Array} Array of parent faction datasheets with metadata
 */
const getParentDatasheets = (faction, allFactions) => {
  if (!faction?.is_subfaction || !faction?.parent_id || !allFactions?.length) {
    return [];
  }

  const parentFaction = allFactions.find((f) => f.id === faction.parent_id);
  if (!parentFaction?.datasheets) return [];

  // Filter to only include datasheets that belong to the parent keyword
  const filteredDatasheets = parentFaction.datasheets.filter(
    (val) => val.factions?.length === 1 && val.factions?.includes(faction.parent_keyword),
  );

  return filteredDatasheets.map((sheet) => ({
    ...sheet,
    _isAllied: true,
    _alliedFactionId: parentFaction.id,
    _alliedFactionName: parentFaction.name,
    _isParent: true,
  }));
};

/**
 * Match parsed units to datasheets in the faction
 * For subfactions, also searches parent faction datasheets as fallback
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
  // Get parent faction datasheets for subfaction fallback
  const parentDatasheets = getParentDatasheets(faction, allFactions);

  return units.map((unit) => {
    const isAlliedUnit = unit.section === "ALLIED UNITS";

    // PASS 1: Search in selected faction's datasheets first
    const exactMatch = faction.datasheets.find((d) => d.name.toLowerCase() === unit.originalName.toLowerCase());

    if (exactMatch) {
      return {
        ...unit,
        matchStatus: "exact",
        matchedCard: exactMatch,
        alternatives: [],
        alliedFactionId: null,
        alliedFactionName: null,
      };
    }

    // PASS 2: For subfactions, try parent faction datasheets
    if (parentDatasheets.length > 0) {
      const parentMatch = parentDatasheets.find((d) => d.name.toLowerCase() === unit.originalName.toLowerCase());
      if (parentMatch) {
        return {
          ...unit,
          matchStatus: "exact",
          matchedCard: parentMatch,
          alternatives: [],
          alliedFactionId: parentMatch._alliedFactionId,
          alliedFactionName: parentMatch._alliedFactionName,
        };
      }
    }

    // PASS 3: For ALLIED UNITS section, try allied faction datasheets
    if (isAlliedUnit && alliedDatasheets.length > 0) {
      const alliedMatch = alliedDatasheets.find((d) => d.name.toLowerCase() === unit.originalName.toLowerCase());
      if (alliedMatch) {
        return {
          ...unit,
          matchStatus: "exact",
          matchedCard: alliedMatch,
          alternatives: [],
          alliedFactionId: alliedMatch._alliedFactionId,
          alliedFactionName: alliedMatch._alliedFactionName,
        };
      }
    }

    // FUZZY SEARCH: Build searchable sheets with priority ordering
    // Selected faction first, then parent (for subfactions), then allied (for ALLIED UNITS)
    let searchableSheets = [...faction.datasheets];
    if (parentDatasheets.length > 0) {
      searchableSheets = [...searchableSheets, ...parentDatasheets];
    }
    if (isAlliedUnit) {
      searchableSheets = [...searchableSheets, ...alliedDatasheets];
    }

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
        alternatives: searchableSheets.slice(0, 10),
        alliedFactionId: null,
        alliedFactionName: null,
      };
    }

    const bestMatch = results[0];
    const status = classifyMatchScore(bestMatch.score);
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
    { ready: 0, needsReview: 0, notMatched: 0, skipped: 0 },
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
    .replace(/^➤\s*/, "") // "➤ Hellforged weapons - strike" -> "Hellforged weapons - strike"
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

// Fuzzy match threshold for weapon names (tighter than unit matching to avoid false positives)
const WEAPON_FUZZY_THRESHOLD = 0.3;

/**
 * Check if a datasheet weapon profile matches any imported weapon, using fuzzy search as fallback.
 * Tries deterministic matching first (exact, variant, parent), then falls back to Fuse.js fuzzy match.
 * @param {string} profileName - Weapon profile name from the datasheet
 * @param {string[]} importedWeapons - Array of imported weapon names
 * @param {Fuse|null} weaponFuse - Pre-built Fuse index over normalized imported weapon names
 * @returns {boolean} True if the profile matches any imported weapon
 */
const doesWeaponMatchAny = (profileName, importedWeapons, weaponFuse) => {
  // Try deterministic matching first
  if (importedWeapons.some((w) => doesWeaponMatch(w, profileName))) return true;

  // Fallback: fuzzy match against imported weapon names
  if (weaponFuse) {
    const normalizedProfile = normalizeDashes(normalizeWeaponName(profileName));
    const results = weaponFuse.search(normalizedProfile);
    if (results.length > 0 && results[0].score <= WEAPON_FUZZY_THRESHOLD) return true;
  }

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

  // Build a Fuse index over normalized imported weapon names for fuzzy fallback
  const normalizedImports = importedWeapons.map((w) => ({ name: normalizeDashes(normalizeWeaponName(w)) }));
  const weaponFuse = new Fuse(normalizedImports, {
    keys: ["name"],
    threshold: WEAPON_FUZZY_THRESHOLD,
    includeScore: true,
  });

  const filteredCard = { ...card };
  filteredCard.showWeapons = { ...card.showWeapons };

  // Filter ranged weapons
  if (card.rangedWeapons?.length) {
    filteredCard.rangedWeapons = card.rangedWeapons.map((weapon) => ({
      ...weapon,
      profiles: weapon.profiles?.map((profile) => ({
        ...profile,
        active: doesWeaponMatchAny(profile.name, importedWeapons, weaponFuse),
      })),
    }));

    // Hide section if no ranged weapons are active
    const hasActiveRanged = filteredCard.rangedWeapons.some((weapon) =>
      weapon.profiles?.some((profile) => profile.active),
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
        active: doesWeaponMatchAny(profile.name, importedWeapons, weaponFuse),
      })),
    }));

    // Hide section if no melee weapons are active
    const hasActiveMelee = filteredCard.meleeWeapons.some((weapon) =>
      weapon.profiles?.some((profile) => profile.active),
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

/**
 * Match enhancement names from parsed units to faction enhancement data.
 * Tries: detachment-scoped exact match → name-only exact match → fuzzy match.
 * @param {Array} units - Parsed units with enhancement data
 * @param {Object} faction - The matched faction object with enhancements
 * @param {string} listDetachment - The list's detachment name for scoped matching
 * @returns {Array} Units with matched enhancement data
 */
export const matchEnhancementsToFaction = (units, faction, listDetachment) => {
  if (!faction?.enhancements?.length) return units;

  return units.map((unit) => {
    if (!unit.enhancement) return unit;

    const enhancements = faction.enhancements;
    let factionEnhancement = null;

    if (listDetachment) {
      factionEnhancement = enhancements.find(
        (e) =>
          e.name.toLowerCase() === unit.enhancement.name.toLowerCase() &&
          e.detachment?.toLowerCase() === listDetachment.toLowerCase(),
      );
    }

    if (!factionEnhancement) {
      factionEnhancement = enhancements.find((e) => e.name.toLowerCase() === unit.enhancement.name.toLowerCase());
    }

    if (!factionEnhancement) {
      const enhancementFuse = new Fuse(enhancements, {
        keys: ["name"],
        threshold: 0.4,
        includeScore: true,
      });
      const results = enhancementFuse.search(unit.enhancement.name);
      if (results.length > 0) {
        factionEnhancement = results[0].item;
      }
    }

    if (factionEnhancement) {
      return {
        ...unit,
        enhancement: {
          ...unit.enhancement,
          ...factionEnhancement,
          cost: unit.enhancement.cost || factionEnhancement.cost,
          matched: true,
        },
        detachment: factionEnhancement.detachment,
      };
    }

    return unit;
  });
};

/**
 * Build import-ready card objects from matched units.
 * Assigns UUIDs, sets points/models, applies enhancements, and filters weapons.
 * @param {Array} units - Units with matchedCard data
 * @param {{ detachments?: Array<string>, factions?: Array<string> }} [army] - the
 *   army the list is being built for, so 11th edition units land on the size tier
 *   that army pays (see getImportUnitSize)
 * @returns {Array} Array of card objects ready for import
 */
export const buildCardsFromUnits = (units, army = {}) => {
  return units.map((unit) => {
    let card = { ...unit.matchedCard };
    card.uuid = uuidv4();
    card.isCustom = true;

    if (unit.points) {
      card.unitSize = getImportUnitSize(card, unit, army);
    }

    if (unit.isWarlord) {
      card.isWarlord = true;
    }

    if (unit.enhancement) {
      card.selectedEnhancement = {
        name: unit.enhancement.name,
        cost: unit.enhancement.cost || 0,
        ...(unit.enhancement.matched ? unit.enhancement : {}),
      };
      if (unit.detachment) {
        card.detachment = unit.detachment;
      }
    }

    if (unit.weapons?.length && !card._directRead) {
      card = filterCardWeapons(card, unit.weapons);
    }

    return card;
  });
};

// 11th edition army roster.
//
// An 11e list is more than its units: the battle size sets the Detachment Points
// budget, and the army buys several detachments out of it. All three are in the
// export header, so an import can set up the whole roster instead of leaving the
// user to pick it again by hand.

/** Lowercased, punctuation-free words, for comparing names that are written loosely. */
const normalizeName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * The battle size an export names ("Strike Force"), as a key of BATTLE_SIZES.
 *
 * @param {string|null} name - the battle size as the export wrote it
 * @returns {string|null} the battle size key, or null when it names none this edition has
 */
export const matchBattleSize = (name) => {
  const wanted = normalizeName(name);
  if (!wanted) return null;
  return BATTLE_SIZES.find((size) => normalizeName(size.label) === wanted)?.key || null;
};

/**
 * The detachments an 11th edition export names, resolved against the faction's own.
 *
 * An 11e army holds several detachments and the export writes them as one line,
 * joined by "and" or "+" - "Ironstorm Spearhead and Marshal's Household". That
 * cannot be split on the joiner, because a detachment's own name may contain one
 * ("Legends of Saga and Song and Saga of the Beastslayer" is two detachments, not
 * three). So the faction's detachment names are searched for inside the line
 * instead, longest first, each match claiming its words so a shorter name cannot
 * take them again.
 *
 * The result is capped at what the battle size can pay for, in the order the
 * export lists them, so an import can never build a roster the list builder
 * itself would refuse.
 *
 * @param {string|null} text - the detachment line from the export
 * @param {Object} faction - the matched faction, with its `detachments`
 * @param {string|null} battleSizeKey - the battle size, for the DP budget
 * @returns {Array} the faction's own detachment objects, in the order named
 */
export const matchDetachmentsToFaction = (text, faction, battleSizeKey) => {
  const haystack = normalizeName(text);
  const detachments = faction?.detachments;
  if (!haystack || !Array.isArray(detachments) || detachments.length === 0) return [];

  // Longest name first, so "Legends of Saga and Song" claims its words before
  // the "Saga of the Beastslayer" that shares one with it gets to look.
  const candidates = detachments
    .map((detachment) => ({ detachment, name: normalizeName(localize(detachment?.name, "en")) }))
    .filter((entry) => entry.name.length > 0)
    .sort((a, b) => b.name.length - a.name.length);

  const found = [];
  // Claimed words are blanked out rather than removed, so the positions of the
  // names still to be matched do not shift.
  let remaining = haystack;
  for (const { detachment, name } of candidates) {
    const at = remaining.search(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`));
    if (at < 0) continue;
    found.push({ detachment, at });
    remaining = remaining.slice(0, at) + " ".repeat(name.length) + remaining.slice(at + name.length);
  }

  // In the order the export names them, and only as many as the budget allows.
  return found
    .sort((a, b) => a.at - b.at)
    .reduce((selected, { detachment }) => {
      if (!canAddDetachment(selected, detachment, battleSizeKey)) return selected;
      return [...selected, detachment];
    }, []);
};

/**
 * The army roster an import can set on the list it creates: the battle size and
 * the detachments, both resolved against the app's own data. Empty for an export
 * that states neither, and for a faction with no detachments of its own (10th
 * edition data), so the caller can apply it unconditionally.
 *
 * @param {Object} parsed - the result of parseGwAppText
 * @param {Object} faction - the matched faction
 * @returns {{battleSize: string|null, detachments: Array}}
 */
export const getImportRoster = (parsed, faction) => {
  const battleSize = matchBattleSize(parsed?.battleSize);
  return {
    battleSize,
    detachments: matchDetachmentsToFaction(parsed?.detachment, faction, battleSize),
  };
};

/**
 * The size tier an imported unit lands on.
 *
 * 11th edition prices a datasheet per size tier, and the list builder works on
 * those tiers: repricing when a detachment changes, and the unit config modal,
 * both match a card's `unitSize` against the entries in `card.points`. A tier
 * invented from the pasted points would match none of them, so the export's
 * numbers are used to pick one of the card's own tiers instead - by size and
 * price together, then by either on its own, because the parser can miscount the
 * models of a squad whose export lost its indentation.
 *
 * Falling back to the pasted cost keeps the list total the user pasted, which is
 * also what a 10th edition card (no tiers of its own) always gets.
 *
 * @param {Object} card - the matched datasheet
 * @param {Object} unit - the parsed unit, with its points, models and enhancement
 * @param {{ detachments?: Array<string>, factions?: Array<string> }} [army] - the
 *   army context, so a price scoped to a detachment or a faction keyword wins
 * @returns {Object} the tier to store as the card's `unitSize`
 */
export const getImportUnitSize = (card, unit, army = {}) => {
  const cost = (unit?.points ?? 0) - (unit?.enhancement?.cost || 0);
  const models = unit?.models || 1;
  const pasted = { ...(card?.unitSize || {}), cost, models };

  const tiers = filterPointsTiersForArmy(getSelectablePointsTiers(card), army);
  if (tiers.length === 0) return pasted;

  const sameSize = (tier) => Number(tier?.models) === models;
  const samePrice = (tier) => Number(tier?.cost) === cost;

  const tier = tiers.find((t) => sameSize(t) && samePrice(t)) || tiers.find(samePrice) || tiers.find(sameSize);
  return tier ? { ...tier } : pasted;
};
