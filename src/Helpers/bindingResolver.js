import { SUPPORTED_LANGUAGES, localize } from "./localization.helpers";

const LANGUAGE_KEYS = new Set(SUPPORTED_LANGUAGES);

const WEAPON_ARRAY_KEYS = ["rangedWeapons", "meleeWeapons"];

const NAME_ABILITY_KEYS = ["core", "faction"];

const BUILT_IN_40K_FORMATS = new Set(["40k-10e", "40k-11e"]);

const cardCache = new WeakMap();
const itemCache = new WeakMap();

export const isLanguageKeyedObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (entries.length === 0) return false;
  return entries.every(([key, entry]) => LANGUAGE_KEYS.has(key) && (entry == null || typeof entry === "string"));
};

const localizeDeep = (value, language) => {
  if (Array.isArray(value)) return value.map((entry) => localizeDeep(entry, language));
  if (value && typeof value === "object") {
    if (isLanguageKeyedObject(value)) return localize(value, language);
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = localizeDeep(entry, language);
    }
    return result;
  }
  return value;
};

export const toDisplayString = (value, language = "en") => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.map((entry) => toDisplayString(entry, language)).join(", ");
  if (typeof value === "object") {
    if (isLanguageKeyedObject(value)) return localize(value, language);
    if (typeof value.keyword === "string") return value.keyword;
    if (isLanguageKeyedObject(value.keyword)) return localize(value.keyword, language);
    if (typeof value.name === "string") return value.name;
    if (isLanguageKeyedObject(value.name)) return localize(value.name, language);
    return "";
  }
  return String(value);
};

const flattenWeaponItem = (item) => {
  if (!item || typeof item !== "object" || Array.isArray(item)) return item;
  const profiles = Array.isArray(item.profiles) ? item.profiles : null;
  if (!profiles || profiles.length === 0) return item;
  const first = profiles[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) return item;
  return { ...item, ...first, profiles };
};

const flattenWeaponList = (list) => (Array.isArray(list) ? list.map(flattenWeaponItem) : list);

const toStringList = (list, language) => {
  if (!Array.isArray(list)) return list;
  return list.map((entry) => toDisplayString(entry, language));
};

const isNameOnlyAbility = (entry) => {
  if (typeof entry === "string") return true;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
  if (typeof entry.name !== "string") return false;
  return entry.description == null && entry.effect == null;
};

const groupAbilitiesByCategory = (abilities) => {
  const groups = {};
  for (const ability of abilities) {
    if (!ability || typeof ability !== "object") continue;
    const category = typeof ability.category === "string" ? ability.category : null;
    if (!category) continue;
    if (!groups[category]) groups[category] = [];
    groups[category].push(ability);
  }
  return groups;
};

const normalizeAbilities = (abilities, language, collapseNameLists) => {
  if (Array.isArray(abilities)) {
    const hasCategories = abilities.some((entry) => entry && typeof entry.category === "string" && entry.category);
    return hasCategories ? groupAbilitiesByCategory(abilities) : abilities;
  }
  if (!abilities || typeof abilities !== "object") return abilities;
  if (!collapseNameLists) return abilities;

  const result = { ...abilities };
  for (const key of NAME_ABILITY_KEYS) {
    const list = result[key];
    if (!Array.isArray(list) || list.length === 0) continue;
    if (!list.every(isNameOnlyAbility)) continue;
    result[key] = list.map((entry) => toDisplayString(entry, language));
  }
  return result;
};

const buildNormalizedCard = (card, language, format) => {
  const localized = localizeDeep(card, language);
  const result = { ...localized };

  for (const key of WEAPON_ARRAY_KEYS) {
    if (Array.isArray(result[key])) result[key] = flattenWeaponList(result[key]);
  }

  if (Array.isArray(result.weapons)) {
    result.weapons = flattenWeaponList(result.weapons);
  } else if (result.weapons && typeof result.weapons === "object") {
    const weapons = {};
    for (const [key, list] of Object.entries(result.weapons)) {
      weapons[key] = flattenWeaponList(list);
    }
    result.weapons = weapons;
  }

  for (const key of ["keywords", "factions", "factionKeywords"]) {
    if (Array.isArray(result[key])) result[key] = toStringList(result[key], language);
  }

  if (result.abilities != null) {
    result.abilities = normalizeAbilities(result.abilities, language, BUILT_IN_40K_FORMATS.has(format));
  }

  return result;
};

export const normalizeCardForBinding = (card, options = {}) => {
  if (!card || typeof card !== "object" || Array.isArray(card)) return card;

  const language = options.language || "en";
  const format = options.format || card.source || "";
  const cacheKey = `${language}|${format}`;

  let byKey = cardCache.get(card);
  if (byKey) {
    const cached = byKey.get(cacheKey);
    if (cached) return cached;
  } else {
    byKey = new Map();
    cardCache.set(card, byKey);
  }

  const normalized = buildNormalizedCard(card, language, format);
  byKey.set(cacheKey, normalized);
  return normalized;
};

export const normalizeBindingItem = (item, options = {}) => {
  if (!item || typeof item !== "object" || Array.isArray(item)) return item;

  const language = options.language || "en";
  let byLanguage = itemCache.get(item);
  if (byLanguage) {
    const cached = byLanguage.get(language);
    if (cached) return cached;
  } else {
    byLanguage = new Map();
    itemCache.set(item, byLanguage);
  }

  const normalized = flattenWeaponItem(localizeDeep(item, language));
  byLanguage.set(language, normalized);
  return normalized;
};

export const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;

  let current = obj;
  for (const segment of String(path).split(".")) {
    if (current === undefined || current === null) return undefined;

    const match = segment.match(/^([^[\]]*)((?:\[\d+\])*)$/);
    if (!match) return undefined;

    const [, key, indices] = match;
    if (key) {
      if (typeof current !== "object") return undefined;
      current = current[key];
    }

    if (indices) {
      for (const index of indices.match(/\d+/g) || []) {
        if (!Array.isArray(current)) return undefined;
        current = current[Number(index)];
      }
    }
  }

  return current;
};

const HTML_TAG = /<\/?[a-zA-Z][a-zA-Z0-9-]*(\s[^<>]*)?>/g;

export const stripMarkup = (text) => {
  if (typeof text !== "string" || text === "") return typeof text === "string" ? text : "";

  return text
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li(\s[^<>]*)?>/gi, "\n- ")
    .replace(/<\/li\s*>/gi, "")
    .replace(/<(ul|ol)(\s[^<>]*)?>/gi, "")
    .replace(/<\/(ul|ol)\s*>/gi, "\n")
    .replace(HTML_TAG, "")
    .replace(/[ \t]*■[ \t]*/g, "\n■ ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const formatBindingValue = (value, language = "en") => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) {
    return value
      .map((entry) => stripMarkup(toDisplayString(entry, language)))
      .filter((entry) => entry !== "")
      .join(", ");
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return stripMarkup(toDisplayString(value, language));
};

export const resolveTemplate = (template, context, options = {}) => {
  if (typeof template !== "string" || template === "") return template;
  if (!context) return template;

  const language = options.language || "en";

  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    try {
      return formatBindingValue(getNestedValue(context, path.trim()), language);
    } catch {
      return "";
    }
  });
};

export const hasBindings = (text) => {
  if (!text) return false;
  return /\{\{[^}]+\}\}/.test(text);
};

export const extractBindings = (template) => {
  if (!template) return [];
  const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map((match) => match.slice(2, -2).trim());
};
