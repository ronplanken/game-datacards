import { localize } from "./localization.helpers";

/**
 * Matching/lookup helpers for the shared Warhammer 40K 11th edition keyword
 * glossary (`11th/gdc/keywords.json`, fetched by `get40k11eData`). Each glossary
 * entry has the shape:
 *
 *   { key, category: "weapon" | "core", name: { <lang>: string }, description: { <lang>: string } }
 *
 * Cards print keyword/ability tags in their canonical English form regardless of
 * the selected card language (e.g. a weapon profile lists "Rapid Fire 1", a unit
 * lists the core ability "Scouts 6\""). Matching is therefore done against each
 * entry's English name; the matched entry's multilingual `description` is then
 * localised at render time via the 11e markup renderer.
 */

// Trailing parameter value on a keyword tag — a dice expression ("D6", "2D6",
// "D3+1"), a save/roll ("5+"), or a plain integer, each optionally followed by an
// inch mark. Mirrors the 10e parameterized glossary value pattern so tags such as
// "Rapid Fire 1", "Deadly Demise D3", "Feel No Pain 5+" and "Scouts 6\"" resolve
// to their bare-named entry.
const PARAMETER_VALUE = String.raw`(?:(?:\d+D\d+|D\d+)(?:\+\d+)?|\d+\+|\d+(?:\+\d+)?)"?`;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A tag matches an entry name when it is the name, optionally extended by
// hyphenated qualifier words (e.g. "Anti" → "Anti-Vehicle") and/or a trailing
// parameter value (e.g. "4+"). Case-insensitive.
const buildNameRegex = (name) => {
  const escaped = escapeRegExp(name.toLowerCase().trim());
  return new RegExp(String.raw`^${escaped}(?:-[a-z]+)*(?:\s+${PARAMETER_VALUE})?$`, "i");
};

/**
 * Resolve a keyword/ability tag to its 11e glossary entry, if any.
 *
 * When several entries match the same tag, the entry with the longest name wins
 * so a specific entry (e.g. "Sustained Hits") beats a shorter one that is a
 * prefix of the same tag.
 *
 * @param {string} tag - The keyword/ability tag as printed on the card
 * @param {Array} glossary - The 11e keyword glossary array
 * @param {string} [category] - Restrict to a category ("weapon" | "core")
 * @returns {object|null} The matching glossary entry, or null
 */
export const resolve11eKeywordEntry = (tag, glossary, category) => {
  if (typeof tag !== "string" || !tag.trim() || !Array.isArray(glossary) || glossary.length === 0) {
    return null;
  }
  let best = null;
  let bestLength = 0;
  for (const entry of glossary) {
    if (category && entry?.category !== category) continue;
    const name = localize(entry?.name, "en");
    if (!name) continue;
    if (buildNameRegex(name).test(tag.trim()) && name.length > bestLength) {
      best = entry;
      bestLength = name.length;
    }
  }
  return best;
};

/**
 * Deduplicated glossary entries matched by a list of keyword/ability tags,
 * preserving first-seen order. Useful for explanation rows or a glossary view.
 *
 * @param {string[]} tags - Keyword/ability tags
 * @param {Array} glossary - The 11e keyword glossary array
 * @param {string} [category] - Restrict to a category ("weapon" | "core")
 * @returns {object[]} Deduplicated matching glossary entries
 */
export const collect11eKeywordEntries = (tags, glossary, category) => {
  if (!Array.isArray(tags) || !Array.isArray(glossary) || glossary.length === 0) {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const tag of tags) {
    const entry = resolve11eKeywordEntry(tag, glossary, category);
    if (entry && !seen.has(entry.key)) {
      seen.add(entry.key);
      out.push(entry);
    }
  }
  return out;
};
