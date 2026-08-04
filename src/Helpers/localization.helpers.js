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

/**
 * Write a new value into a possibly language-keyed field for the active card
 * language, preserving the other languages and the field's shape.
 *
 * The 11th edition editor edits one language at a time: the user picks a card
 * language in Settings and edits the text for that language only. This helper
 * implements that "edit the active language in place" behaviour while keeping
 * the data shape intact:
 *
 * - When `existing` is a language-keyed object it merges the new value into
 *   `existing[language]` and keeps every other language untouched.
 * - When `existing` is a plain string (or nullish) it returns the new value as
 *   a plain string. This keeps fields that the loader already resolved to a
 *   plain string (e.g. a unit's top-level `name`, which renderers read raw)
 *   from being turned into an object.
 *
 * @param {string|Object|null|undefined} existing - The current field value.
 * @param {string} [language="en"] - The active card language code.
 * @param {string} [newValue=""] - The value to store for `language`.
 * @returns {string|Object} The updated field value, shape preserved.
 */
export function setLocalizedField(existing, language = "en", newValue = "") {
  if (existing != null && typeof existing === "object" && !Array.isArray(existing)) {
    return { ...existing, [language]: newValue };
  }
  return newValue;
}

/**
 * Shape-preserving update of a single entry in an array of localized values
 * (e.g. keywords, unit composition lines, wargear options). Each entry may be a
 * plain string or a language-keyed object; the entry's shape is preserved via
 * {@link setLocalizedField}.
 *
 * @param {Array<string|Object>} arr - The current array (nullish becomes []).
 * @param {number} index - Index of the entry to update.
 * @param {string} language - The active card language code.
 * @param {string} newValue - The value to store for `language`.
 * @returns {Array<string|Object>} A new array with the entry updated.
 */
export function setLocalizedArrayItem(arr, index, language, newValue) {
  const next = Array.isArray(arr) ? [...arr] : [];
  next[index] = setLocalizedField(next[index], language, newValue);
  return next;
}
