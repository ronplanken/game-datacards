// Localisation helpers for multi-language datasources (e.g. Warhammer 40K 11th
// Edition). In these datasources every displayable string is stored as a
// language-keyed object, for example: { en: "Leader", de: "Anführer", ... }.
//
// Coverage is uneven across the data (some fields only have "en"), so resolving
// a value must always fall back to English, and then to whatever is available,
// before giving up. Plain strings are passed through unchanged so the same
// helpers can be used on already-resolved or legacy single-language data.

// Languages supported by the 11th edition data dump.
export const SUPPORTED_LANGUAGES = ["en", "de", "es", "fr", "it", "ja", "ko", "zh"];

// Human readable labels for the language picker (shown in the user's language).
export const LANGUAGE_LABELS = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
};

/**
 * Resolve a possibly language-keyed value to a plain string for the requested
 * language, falling back to English and then to the first available language.
 *
 * @param {string|Object|null|undefined} value - A plain string, a
 *   `{ [lang]: string }` object, or nullish.
 * @param {string} [language="en"] - The preferred language code.
 * @returns {string} The resolved string, or "" when nothing is available.
 */
export function localize(value, language = "en") {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value[language] != null) return value[language];
    if (value.en != null) return value.en;
    const firstAvailable = Object.values(value).find((v) => typeof v === "string");
    return firstAvailable ?? "";
  }
  return String(value);
}

/**
 * Convenience wrapper to resolve a card's display name.
 *
 * @param {Object} card - A card object whose `name` may be a string or a
 *   language-keyed object.
 * @param {string} [language="en"] - The preferred language code.
 * @returns {string} The resolved card name.
 */
export const getCardName = (card, language = "en") => localize(card?.name, language);
