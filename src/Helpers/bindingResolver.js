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
    .replace(/<\/?b(\s[^<>]*)?>/gi, "**")
    .replace(/<\/?i(\s[^<>]*)?>/gi, "*")
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

export const BINDING_FILTERS = [
  { name: "upper", takesArg: false },
  { name: "lower", takesArg: false },
  { name: "title", takesArg: false },
  { name: "trim", takesArg: false },
  { name: "join", takesArg: true, defaultArg: ", " },
  { name: "prefix", takesArg: true, defaultArg: "" },
  { name: "suffix", takesArg: true, defaultArg: "" },
  { name: "default", takesArg: true, defaultArg: "" },
  { name: "truncate", takesArg: true, defaultArg: "20" },
  { name: "first", takesArg: false },
  { name: "count", takesArg: false },
];

const FILTER_NAMES = new Set(BINDING_FILTERS.map((filter) => filter.name));

const splitExpressionSegments = (text) => {
  const segments = [];
  let current = "";
  let quote = null;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (char === "\\" && index + 1 < text.length) {
        current += char + text[index + 1];
        index += 1;
        continue;
      }
      if (char === quote) quote = null;
      current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "|") {
      segments.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  segments.push(current);
  return segments;
};

const unquoteArg = (raw) => {
  const trimmed = raw.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' || first === "'") && last === first) {
      return trimmed
        .slice(1, -1)
        .replace(/\\(["'\\])/g, "$1")
        .replace(/\\n/g, "\n");
    }
  }
  return trimmed;
};

export const parseBindingExpression = (expressionText) => {
  const text = typeof expressionText === "string" ? expressionText : "";
  const segments = splitExpressionSegments(text);
  const path = segments.shift()?.trim() || "";
  const filters = [];

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (trimmed === "") continue;

    const colon = trimmed.indexOf(":");
    const name = (colon === -1 ? trimmed : trimmed.slice(0, colon)).trim();
    if (name === "") continue;

    const filter = { name };
    if (colon !== -1) filter.arg = unquoteArg(trimmed.slice(colon + 1));
    filters.push(filter);
  }

  return { path, filters };
};

const quoteArg = (arg) => {
  const text = String(arg).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${text}"`;
};

export const formatBindingExpression = (expression) => {
  const path = expression?.path ? String(expression.path).trim() : "";
  const filters = Array.isArray(expression?.filters) ? expression.filters : [];
  const parts = [path];

  for (const filter of filters) {
    if (!filter?.name) continue;
    parts.push(
      filter.arg === undefined || filter.arg === null ? filter.name : `${filter.name}:${quoteArg(filter.arg)}`,
    );
  }

  return parts.join(" | ");
};

const stateText = (state, language) => (state.text != null ? state.text : formatBindingValue(state.value, language));

const toTitleCase = (text) =>
  text.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const applyFilter = (state, filter, language) => {
  switch (filter.name) {
    case "upper":
      return { text: stateText(state, language).toUpperCase() };
    case "lower":
      return { text: stateText(state, language).toLowerCase() };
    case "title":
      return { text: toTitleCase(stateText(state, language)) };
    case "trim":
      return { text: stateText(state, language).trim() };
    case "join": {
      const separator = filter.arg === undefined ? ", " : filter.arg;
      if (!Array.isArray(state.value) || state.text != null) {
        return { text: stateText(state, language) };
      }
      return {
        text: state.value
          .map((entry) => formatBindingValue(entry, language))
          .filter((entry) => entry !== "")
          .join(separator),
      };
    }
    case "prefix": {
      const text = stateText(state, language);
      return { text: text === "" ? "" : `${filter.arg ?? ""}${text}` };
    }
    case "suffix": {
      const text = stateText(state, language);
      return { text: text === "" ? "" : `${text}${filter.arg ?? ""}` };
    }
    case "default": {
      const text = stateText(state, language);
      return text === "" ? { text: filter.arg ?? "" } : state;
    }
    case "truncate": {
      const limit = parseInt(filter.arg, 10);
      const text = stateText(state, language);
      if (!Number.isFinite(limit) || limit < 0) return { text };
      return { text: text.length <= limit ? text : `${text.slice(0, limit)}...` };
    }
    case "first":
      if (Array.isArray(state.value) && state.text == null) {
        return { value: state.value[0] };
      }
      return state;
    case "count": {
      if (Array.isArray(state.value) && state.text == null) {
        return { text: String(state.value.length) };
      }
      return { text: stateText(state, language) === "" ? "0" : "1" };
    }
    default:
      return state;
  }
};

export const resolveExpression = (context, expressionText, options = {}) => {
  const language = options.language || "en";
  const parsed =
    expressionText && typeof expressionText === "object" ? expressionText : parseBindingExpression(expressionText);

  let state = { value: getNestedValue(context, parsed.path), text: null };

  for (const filter of parsed.filters || []) {
    if (!FILTER_NAMES.has(filter.name)) continue;
    const next = applyFilter(state, filter, language);
    state = { value: next.value, text: next.text ?? null };
  }

  return stateText(state, language);
};

export const resolveTemplate = (template, context, options = {}) => {
  if (typeof template !== "string" || template === "") return template;
  if (!context) return template;

  const language = options.language || "en";

  return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
    try {
      return resolveExpression(context, expression, { language });
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

export const parseBindings = (template) =>
  extractBindings(template).map((expression) => {
    const { path, filters } = parseBindingExpression(expression);
    return { expression, path, filters };
  });

export const areBindingsEmpty = (template, context, options = {}) => {
  const expressions = extractBindings(template);
  if (expressions.length === 0) return false;
  if (!context) return false;

  return expressions.every((expression) => {
    try {
      return resolveExpression(context, expression, options) === "";
    } catch {
      return true;
    }
  });
};
