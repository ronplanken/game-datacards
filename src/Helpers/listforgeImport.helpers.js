import Fuse from "fuse.js";
import { v4 as uuidv4 } from "uuid";
import { getDetachmentName } from "./faction.helpers";

const SUPPORTED_GENERATORS = ["List Forge", "https://newrecruit.eu"];

/**
 * Validate that a parsed JSON object is a Listforge-compatible export.
 * Checks for a supported `generatedBy` value and required structural fields.
 * @param {Object} data - The parsed JSON object
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateListforgeJson = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Invalid JSON data"] };
  }

  if (!SUPPORTED_GENERATORS.includes(data.generatedBy)) {
    errors.push('Not a supported export (missing or incorrect "generatedBy" field)');
  }

  if (!data.roster || typeof data.roster !== "object") {
    errors.push("Missing roster data");
  } else if (!Array.isArray(data.roster.forces) || data.roster.forces.length === 0) {
    errors.push("Roster contains no forces");
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Sum points from a Listforge costs array.
 * Finds entries where name matches "pts" (case-insensitive) and sums their values.
 * @param {Array<{ name: string, typeId: string, value: string|number }>} costs
 * @returns {number} Total points
 */
export const extractCostsAsPoints = (costs) => {
  if (!Array.isArray(costs)) return 0;

  return costs.reduce((total, cost) => {
    if (cost.name && cost.name.toLowerCase() === "pts") {
      const value = typeof cost.value === "string" ? parseFloat(cost.value) : cost.value;
      return total + (isNaN(value) ? 0 : value);
    }
    return total;
  }, 0);
};

/**
 * Map a Listforge primary category name to the internal section header format.
 * @param {Array<{ id: string, name: string, primary: boolean }>} categories
 * @returns {string|null} Mapped section name or null
 */
export const mapCategoryToSection = (categories) => {
  if (!Array.isArray(categories)) return null;

  const primary = categories.find((cat) => cat.primary);
  if (!primary?.name) return null;

  const name = primary.name.trim();

  const sectionMap = {
    character: "CHARACTERS",
    characters: "CHARACTERS",
    battleline: "BATTLELINE",
    "dedicated transport": "DEDICATED TRANSPORTS",
    "dedicated transports": "DEDICATED TRANSPORTS",
    "other datasheets": "OTHER DATASHEETS",
    other: "OTHER DATASHEETS",
    "allied units": "ALLIED UNITS",
    allied: "ALLIED UNITS",
    epic_hero: "CHARACTERS",
    "epic hero": "CHARACTERS",
  };

  return sectionMap[name.toLowerCase()] || name.toUpperCase();
};

/**
 * Recursively extract weapon names from a selection and its nested sub-selections.
 * Identifies weapons by checking profiles with typeName containing "Weapons".
 * @param {Object} selection - A Listforge selection node
 * @returns {string[]} Array of weapon names
 */
export const extractWeaponsFromSelection = (selection) => {
  const weapons = [];

  // Check profiles for weapon types
  if (Array.isArray(selection.profiles)) {
    for (const profile of selection.profiles) {
      if (profile.typeName && /weapons?/i.test(profile.typeName) && !profile.hidden) {
        weapons.push(profile.name);
      }
    }
  }

  // If this selection has no weapon profiles but has a name and appears to be a weapon
  // (no sub-selections that are models), add it directly
  if (weapons.length === 0 && selection.name && selection.type === "upgrade") {
    // Check if any of its non-hidden profiles are weapon-like
    const hasVisibleWeaponProfile =
      Array.isArray(selection.profiles) && selection.profiles.some((p) => /weapons?/i.test(p.typeName) && !p.hidden);
    if (hasVisibleWeaponProfile) {
      weapons.push(selection.name);
    }
  }

  // Recurse into sub-selections
  if (Array.isArray(selection.selections)) {
    for (const sub of selection.selections) {
      weapons.push(...extractWeaponsFromSelection(sub));
    }
  }

  return weapons;
};

/**
 * Extract enhancement info from nested selections of a unit.
 * Looks for selections that have a category or type indicating "Enhancement".
 * @param {Object} selection - A top-level unit selection
 * @returns {{ name: string, cost: number } | null}
 */
const extractEnhancementFromSelection = (selection) => {
  if (!Array.isArray(selection.selections)) return null;

  for (const sub of selection.selections) {
    // Check categories for "Enhancement" type
    const isEnhancement = Array.isArray(sub.categories) && sub.categories.some((cat) => /enhancement/i.test(cat.name));

    if (isEnhancement && sub.name) {
      return {
        name: sub.name,
        cost: extractCostsAsPoints(sub.costs),
      };
    }

    // Recurse into sub-selections
    if (Array.isArray(sub.selections)) {
      const nested = extractEnhancementFromSelection(sub);
      if (nested) return nested;
    }
  }

  return null;
};

/**
 * Check if a unit selection has the Warlord designation.
 * Looks in rules, categories, and nested selections.
 * @param {Object} selection - A unit selection
 * @returns {boolean}
 */
const isWarlordSelection = (selection) => {
  // Check rules
  if (Array.isArray(selection.rules)) {
    if (selection.rules.some((rule) => /warlord/i.test(rule.name))) return true;
  }

  // Check categories
  if (Array.isArray(selection.categories)) {
    if (selection.categories.some((cat) => /warlord/i.test(cat.name))) return true;
  }

  // Check nested selections for warlord markers
  if (Array.isArray(selection.selections)) {
    for (const sub of selection.selections) {
      if (/warlord/i.test(sub.name)) return true;
      if (isWarlordSelection(sub)) return true;
    }
  }

  return false;
};

/**
 * Calculate the model count for a selection.
 * Uses the selection's `number` field, or counts model-type sub-selections.
 * @param {Object} selection - A unit selection
 * @returns {number} Model count (minimum 1)
 */
const calculateModelCount = (selection) => {
  // If the selection has sub-selections of type "model", sum their numbers
  if (Array.isArray(selection.selections)) {
    const modelSubs = selection.selections.filter((sub) => sub.type === "model");
    if (modelSubs.length > 0) {
      return modelSubs.reduce((sum, sub) => sum + (sub.number || 1), 0);
    }
  }

  // Otherwise use the selection's own number, defaulting to 1
  return selection.number || 1;
};

/**
 * Determine whether a selection represents an actual unit (as opposed to a
 * configuration entry such as "Show/Hide Options", "Battle Size", or "Detachment").
 * NewRecruit exports include these configuration entries as top-level selections
 * alongside real units.
 * @param {Object} selection - A Listforge/NewRecruit selection node
 * @returns {boolean}
 */
export const isUnitSelection = (selection) => {
  if (!selection || typeof selection !== "object") return false;

  // Explicit unit/model types are always units
  if (selection.type === "unit" || selection.type === "model") return true;

  // Selections whose primary category is "Configuration" are not units
  if (Array.isArray(selection.categories)) {
    const primary = selection.categories.find((cat) => cat.primary);
    if (primary?.name && primary.name.toLowerCase() === "configuration") return false;
  }

  // Everything else is treated as a unit for backward compatibility
  return true;
};

/**
 * Extract the detachment name from a NewRecruit-style Configuration selection.
 * NewRecruit stores the detachment as: a selection named "Detachment" with primary
 * category "Configuration", whose first sub-selection's name is the actual detachment
 * (e.g. "Gate Warden Lance").
 * @param {Array} selections - The selections array from a force
 * @returns {string|null} The detachment name, or null if not found
 */
export const extractDetachmentFromSelections = (selections) => {
  if (!Array.isArray(selections)) return null;

  const detachmentSelection = selections.find((sel) => {
    if (sel.name !== "Detachment") return false;
    if (!Array.isArray(sel.categories)) return false;
    const primary = sel.categories.find((cat) => cat.primary);
    return primary?.name?.toLowerCase() === "configuration";
  });

  if (!detachmentSelection) return null;

  if (Array.isArray(detachmentSelection.selections) && detachmentSelection.selections.length > 0) {
    return detachmentSelection.selections[0].name || null;
  }

  return null;
};

/**
 * Process top-level selections from a force into unit objects.
 * Each top-level selection becomes a unit in the same shape as gwAppImport units.
 * @param {Array} selections - The selections array from a Listforge force
 * @returns {Array} Array of unit objects ready for datasheet matching
 */
export const extractUnitsFromSelections = (selections) => {
  if (!Array.isArray(selections)) return [];

  return selections
    .filter((selection) => !selection.hidden && isUnitSelection(selection))
    .map((selection) => {
      const points = extractCostsAsPoints(selection.costs);
      const models = calculateModelCount(selection);
      const section = mapCategoryToSection(selection.categories);
      const weapons = extractWeaponsFromSelection(selection);
      const enhancement = extractEnhancementFromSelection(selection);
      const isWarlord = isWarlordSelection(selection);

      return {
        originalName: selection.name,
        points: points || null,
        models,
        section,
        isWarlord,
        enhancement,
        weapons,
        matchStatus: null,
        matchedCard: null,
        alternatives: [],
        skipped: false,
        _selection: selection,
      };
    });
};

/**
 * Main parser: extract structured data from a Listforge JSON export.
 * Uses the first force for faction/detachment.
 * @param {Object} data - Validated Listforge JSON export
 * @returns {{ rosterName: string, gameSystemName: string, totalPoints: number, factionName: string|null, detachmentName: string|null, units: Array, error: string|null }}
 */
export const parseListforgeRoster = (data) => {
  if (!data?.roster?.forces?.length) {
    return {
      rosterName: null,
      gameSystemName: null,
      totalPoints: null,
      factionName: null,
      detachmentName: null,
      units: [],
      error: "No forces found in roster",
    };
  }

  const rosterName = data.name || data.roster.name || null;
  const gameSystemName = data.gameSystemName || null;
  const totalPoints = extractCostsAsPoints(data.roster.costs);

  // Use the first force
  const force = data.roster.forces[0];
  // Strip alliance prefix (e.g. "Imperium - Imperial Knights" → "Imperial Knights")
  const rawFactionName = force.catalogueName || null;
  const factionName = rawFactionName?.includes(" - ")
    ? rawFactionName.split(" - ").slice(1).join(" - ")
    : rawFactionName;
  const detachmentName = extractDetachmentFromSelections(force.selections) || force.name || null;

  const units = extractUnitsFromSelections(force.selections);

  if (!factionName) {
    return {
      rosterName,
      gameSystemName,
      totalPoints,
      factionName: null,
      detachmentName,
      units: [],
      error: "Could not identify faction name from force catalogue",
    };
  }

  return {
    rosterName,
    gameSystemName,
    totalPoints,
    factionName,
    detachmentName,
    units,
    error: null,
  };
};

/**
 * Build a set of known core ability names from the datasource.
 * Scans all factions' datasheets and collects every name that appears in abilities.core.
 * Used to classify rules as core vs faction in direct-read mode.
 * @param {Array} factions - The datasource factions array (dataSource.data)
 * @returns {Set<string>} Set of core ability names (lowercase for case-insensitive matching)
 */
export const buildCoreAbilitySet = (factions) => {
  const coreNames = new Set();
  if (!Array.isArray(factions)) return coreNames;

  for (const faction of factions) {
    if (!Array.isArray(faction.datasheets)) continue;
    for (const sheet of faction.datasheets) {
      if (Array.isArray(sheet.abilities?.core)) {
        for (const name of sheet.abilities.core) {
          coreNames.add(name.toLowerCase());
        }
      }
    }
  }

  return coreNames;
};

/**
 * Get a characteristic value by name (case-insensitive) from a profile's characteristics array.
 * @param {Array} characteristics - Profile characteristics array
 * @param {string} name - Characteristic name to find
 * @returns {string} The $text value or ""
 */
const getCharacteristic = (characteristics, name) => {
  if (!Array.isArray(characteristics)) return "";
  const found = characteristics.find((c) => c.name && c.name.toLowerCase() === name.toLowerCase());
  const text = found?.$text || "";
  return text.replace(/\^\^/g, "");
};

/**
 * Extract unit stat lines from a selection.
 * Stats live on type:"model" sub-selections (or on the selection itself for single-model units)
 * in profiles with typeName "Unit".
 * @param {Object} selection - A Listforge unit selection
 * @returns {Array} Array of stat objects: { name, active, showName, showDamagedMarker, m, t, sv, w, ld, oc }
 */
export const extractStatsFromSelection = (selection) => {
  const stats = [];

  const collectUnitProfiles = (sel) => {
    if (Array.isArray(sel.profiles)) {
      for (const profile of sel.profiles) {
        if (profile.typeName === "Unit" && !profile.hidden) {
          stats.push({
            name: profile.name,
            active: true,
            showName: false,
            showDamagedMarker: false,
            m: getCharacteristic(profile.characteristics, "M"),
            t: getCharacteristic(profile.characteristics, "T"),
            sv: getCharacteristic(profile.characteristics, "SV"),
            w: getCharacteristic(profile.characteristics, "W"),
            ld: getCharacteristic(profile.characteristics, "LD"),
            oc: getCharacteristic(profile.characteristics, "OC"),
          });
        }
      }
    }
    if (Array.isArray(sel.selections)) {
      for (const sub of sel.selections) {
        collectUnitProfiles(sub);
      }
    }
  };

  collectUnitProfiles(selection);

  // Deduplicate identical stat lines, counting how many models share each profile
  const statCounts = new Map();
  for (const s of stats) {
    const key = `${s.m}|${s.t}|${s.sv}|${s.w}|${s.ld}|${s.oc}`;
    statCounts.set(key, (statCounts.get(key) || 0) + 1);
  }

  const seenStats = new Set();
  const uniqueStats = stats.filter((s) => {
    const key = `${s.m}|${s.t}|${s.sv}|${s.w}|${s.ld}|${s.oc}`;
    if (seenStats.has(key)) return false;
    seenStats.add(key);
    // Label collapsed profiles with the model count
    const count = statCounts.get(key);
    if (count > 1) {
      s.name = `${count} models`;
    }
    return true;
  });

  // Show name when there are multiple different stat lines
  if (uniqueStats.length > 1) {
    uniqueStats.forEach((s) => {
      s.showName = true;
    });
  }

  return uniqueStats;
};

/**
 * Extract full weapon profiles (with stats) from a selection, recursively.
 * Groups results into ranged and melee arrays, each with a profiles sub-array.
 * @param {Object} selection - A Listforge unit selection
 * @returns {{ rangedWeapons: Array, meleeWeapons: Array }}
 */
export const extractWeaponProfilesFromSelection = (selection) => {
  const ranged = [];
  const melee = [];

  const collectWeapons = (sel) => {
    if (Array.isArray(sel.profiles)) {
      for (const profile of sel.profiles) {
        if (profile.hidden) continue;
        const typeName = profile.typeName || "";

        if (typeName === "Ranged Weapons" || typeName === "Melee Weapons") {
          const chars = profile.characteristics;
          const keywordsRaw = getCharacteristic(chars, "Keywords");
          const keywords =
            keywordsRaw && keywordsRaw !== "-"
              ? keywordsRaw
                  .split(", ")
                  .map((k) => k.trim())
                  .filter((k) => k && k !== "-")
              : [];

          const weaponProfile = {
            name: profile.name,
            active: true,
            range: getCharacteristic(chars, "Range"),
            attacks: getCharacteristic(chars, "A"),
            skill: typeName === "Ranged Weapons" ? getCharacteristic(chars, "BS") : getCharacteristic(chars, "WS"),
            strength: getCharacteristic(chars, "S"),
            ap: getCharacteristic(chars, "AP"),
            damage: getCharacteristic(chars, "D"),
            keywords,
          };

          if (typeName === "Ranged Weapons") {
            ranged.push(weaponProfile);
          } else {
            melee.push(weaponProfile);
          }
        }
      }
    }
    if (Array.isArray(sel.selections)) {
      for (const sub of sel.selections) {
        collectWeapons(sub);
      }
    }
  };

  collectWeapons(selection);

  // Deduplicate identical weapon profiles
  const dedupWeapons = (profiles) => {
    const seen = new Set();
    return profiles.filter((p) => {
      const key = `${p.name}|${p.range}|${p.attacks}|${p.skill}|${p.strength}|${p.ap}|${p.damage}|${p.keywords.join(",")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const uniqueRanged = dedupWeapons(ranged);
  const uniqueMelee = dedupWeapons(melee);

  return {
    rangedWeapons: uniqueRanged.length > 0 ? [{ profiles: uniqueRanged }] : [],
    meleeWeapons: uniqueMelee.length > 0 ? [{ profiles: uniqueMelee }] : [],
  };
};

/**
 * Parse a Leader ability description into a leads object.
 * Extracts unit names from bullet-point lists in two known formats:
 *   - Markdown: "- ^^**Unit Name^^**" or "- **Unit Name**"
 *   - Square bullet: "■ UNIT NAME"
 * @param {string} description - The Leader ability description text
 * @returns {{ units: Array<{name: string}>, extra: string }}
 */
const parseLeaderDescription = (description) => {
  if (!description) return { units: [], extra: "" };

  const units = [];
  const lines = description.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Match "- ^^**Unit Name^^**" or "- **Unit Name**" (strip markdown formatting)
    const dashMatch = trimmed.match(/^-\s+(.+)/);
    if (dashMatch) {
      const name = dashMatch[1].replace(/[\^*\u00a0]/g, "").trim();
      if (name) units.push({ name });
      continue;
    }

    // Match "■ UNIT NAME" (square bullet format, title-case the name)
    const bulletMatch = trimmed.match(/^■\s+(.+)/);
    if (bulletMatch) {
      const raw = bulletMatch[1].trim();
      const name = raw.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      if (name) units.push({ name });
      continue;
    }
  }

  return { units, extra: "" };
};

/**
 * Extract abilities, invulnerable save, and rules from a selection.
 * Abilities and invul come from the selection's own profiles (not recursing into models).
 * Rules come from selection.rules[].
 * Core vs faction classification uses a set of known core ability names from the datasource.
 * @param {Object} selection - A Listforge unit selection
 * @param {Set<string>} [coreAbilityNames] - Set of lowercase core ability names from the datasource
 * @returns {Object} Abilities object matching the rendering layer shape
 */
export const extractAbilitiesFromSelection = (selection, coreAbilityNames) => {
  const core = [];
  const faction = [];
  const other = [];
  const special = [];
  const wargear = [];
  let invul = null;
  let damaged = null;
  let leads = null;

  // Extract from profiles at the unit level (not recursing into model sub-selections)
  if (Array.isArray(selection.profiles)) {
    for (const profile of selection.profiles) {
      if (profile.typeName !== "Abilities" || profile.hidden) continue;

      const invulMatch = profile.name.match(/^Invulnerable Save (\d+\+)/i);
      if (invulMatch) {
        invul = {
          value: invulMatch[1],
          info: "",
          showInvulnerableSave: true,
          showAtTop: true,
          showInfo: false,
        };
        continue;
      }

      const damagedMatch = profile.name.match(/^Damaged:\s*(.+)/i);
      if (damagedMatch) {
        const description = getCharacteristic(profile.characteristics, "Description");
        damaged = {
          showDamagedAbility: true,
          showDescription: true,
          range: damagedMatch[1],
          description,
        };
        continue;
      }

      if (profile.name.toLowerCase() === "leader") {
        const description = getCharacteristic(profile.characteristics, "Description");
        leads = parseLeaderDescription(description);
        continue;
      }

      if (profile.name.toLowerCase() === "attached unit") {
        const description = getCharacteristic(profile.characteristics, "Description");
        special.push({ name: profile.name, description, showAbility: true, showDescription: true });
        continue;
      }

      const description = getCharacteristic(profile.characteristics, "Description");
      other.push({
        name: profile.name,
        description,
        showAbility: true,
        showDescription: true,
      });
    }
  }

  // Extract wargear abilities from upgrade sub-selections
  const collectWargear = (selections) => {
    if (!Array.isArray(selections)) return;
    for (const sub of selections) {
      if (sub.type === "upgrade" && Array.isArray(sub.profiles)) {
        for (const profile of sub.profiles) {
          if (profile.typeName !== "Abilities" || profile.hidden) continue;
          const description = getCharacteristic(profile.characteristics, "Description");
          wargear.push({ name: profile.name, description, showAbility: true, showDescription: true });
        }
      }
      collectWargear(sub.selections);
    }
  };
  collectWargear(selection.selections);

  // Extract from rules — classify using datasource core set when available
  if (Array.isArray(selection.rules)) {
    for (const rule of selection.rules) {
      if (rule.hidden) continue;
      const isCoreRule = coreAbilityNames?.has(rule.name.toLowerCase()) ?? false;
      if (isCoreRule) {
        core.push(rule.name);
      } else {
        faction.push(rule.name);
      }
    }
  }

  return {
    core,
    faction,
    other,
    wargear,
    special,
    primarch: [],
    invul: invul || { value: "", info: "", showInvulnerableSave: false, showAtTop: false, showInfo: false },
    damaged: damaged || { range: "", description: "", showDamagedAbility: false, showDescription: false },
    leads: leads || { units: [], extra: "" },
  };
};

/**
 * Extract keywords and faction keywords from a selection's categories.
 * Categories with "Faction: " prefix become faction keywords; other non-primary
 * categories become regular keywords (filtering out metadata).
 * @param {Object} selection - A Listforge unit selection
 * @returns {{ keywords: string[], factions: string[] }}
 */
export const extractKeywordsFromSelection = (selection) => {
  const primaryKeywords = [];
  const otherKeywords = [];
  const factions = [];
  const skipPatterns = [/^Warlord$/i];

  if (!Array.isArray(selection.categories)) {
    return { keywords: [], factions };
  }

  for (const cat of selection.categories) {
    const name = cat.name || "";

    // Skip metadata categories
    if (skipPatterns.some((p) => p.test(name))) continue;

    if (name.startsWith("Faction: ")) {
      factions.push(name.replace("Faction: ", ""));
    } else if (cat.primary) {
      primaryKeywords.push(name);
    } else {
      otherKeywords.push(name);
    }
  }

  return { keywords: [...primaryKeywords, ...otherKeywords], factions };
};

/**
 * Build a complete rendering-ready card from a Listforge selection.
 * Used in direct-read import mode where no datasource matching is needed.
 * @param {Object} selection - The raw Listforge selection
 * @param {Object} unitData - Parsed unit data (points, models, etc.)
 * @param {Set<string>} [coreAbilityNames] - Set of lowercase core ability names from the datasource
 * @param {string} [factionId] - Datasource faction ID for card theming (e.g. "CSM")
 * @returns {Object} Card object ready for rendering
 */
export const buildCardFromSelection = (selection, unitData, coreAbilityNames, factionId) => {
  const stats = extractStatsFromSelection(selection);
  const { rangedWeapons, meleeWeapons } = extractWeaponProfilesFromSelection(selection);
  const abilities = extractAbilitiesFromSelection(selection, coreAbilityNames);
  const { leads, ...abilitiesWithoutLeads } = abilities;
  const { keywords, factions } = extractKeywordsFromSelection(selection);

  return {
    id: uuidv4(),
    uuid: uuidv4(),
    name: selection.name,
    cardType: "DataCard",
    source: "40k-10e",
    isCustom: true,
    _directRead: true,
    faction_id: factionId || "basic",
    stats,
    rangedWeapons,
    meleeWeapons,
    abilities: abilitiesWithoutLeads,
    keywords,
    factions,
    leads: leads.units.length > 0 ? leads : undefined,
    points: [
      {
        active: true,
        primary: true,
        cost: unitData.points || 0,
        models: unitData.models || 1,
      },
    ],
    showWeapons: {
      rangedWeapons: rangedWeapons.length > 0,
      meleeWeapons: meleeWeapons.length > 0,
    },
    showAbilities: {
      core: true,
      faction: true,
      other: true,
      wargear: true,
      special: true,
    },
    showComposition: false,
    showLoadout: false,
    showWargear: false,
    wargear: [],
    composition: [],
    loadout: "",
  };
};

/**
 * Fuzzy-match a detachment name from Listforge to a faction's detachments array.
 * @param {string} detachmentName - Detachment name from Listforge export
 * @param {Array} detachments - The faction's detachments array (can be strings or objects)
 * @returns {{ matchedDetachment: string|null, matchStatus: string }}
 */
export const matchDetachment = (detachmentName, detachments) => {
  if (!detachmentName || !Array.isArray(detachments) || detachments.length === 0) {
    return { matchedDetachment: null, matchStatus: "none" };
  }

  // Normalize detachments to objects with a name field for searching
  const normalizedDetachments = detachments.map((d) => ({
    original: d,
    name: getDetachmentName(d),
  }));

  // Exact match first (case-insensitive)
  const exactMatch = normalizedDetachments.find((d) => d.name.toLowerCase() === detachmentName.toLowerCase());
  if (exactMatch) {
    return { matchedDetachment: exactMatch.name, matchStatus: "exact" };
  }

  // Fuzzy search
  const fuse = new Fuse(normalizedDetachments, {
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
  });

  const results = fuse.search(detachmentName);
  if (results.length > 0 && results[0].score < 0.4) {
    return { matchedDetachment: results[0].item.name, matchStatus: "confident" };
  }

  return { matchedDetachment: null, matchStatus: "none" };
};
