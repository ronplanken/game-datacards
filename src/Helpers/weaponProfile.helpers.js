/**
 * Helpers for weapon profile data that both the community app and the premium
 * card editor consume. Kept dependency-free so gdc-premium can import it
 * through the shared-helpers resolver.
 */

/**
 * Field names the weapon profile data model owns. A schema column may not use
 * one of these as its `key`: the generic column editors would render a plain
 * text input over the reserved field and overwrite its real (array/boolean)
 * value with a string, corrupting the card.
 *
 * - `name`     — profile name (rendered separately from the columns)
 * - `active`   — per-profile visibility toggle
 * - `keywords` — array of weapon keyword tags
 * - `upgrade`  — marks a parent-child child profile
 */
export const RESERVED_WEAPON_PROFILE_KEYS = ["name", "active", "keywords", "upgrade"];

/**
 * Whether a schema column key collides with a reserved weapon profile field.
 * Comparison is case-insensitive and trims surrounding whitespace.
 *
 * @param {string} key
 * @returns {boolean}
 */
export const isReservedWeaponProfileKey = (key) =>
  typeof key === "string" && RESERVED_WEAPON_PROFILE_KEYS.includes(key.trim().toLowerCase());

/**
 * Coerces a weapon profile's `keywords` value into an array.
 *
 * Saved cards can carry a plain string here — a schema column keyed `keywords`
 * used to render a text input over the array, so a single keystroke replaced
 * `["Assault"]` with `"A"`. Every consumer used `(profile.keywords || []).map`,
 * and `"A" || []` is `"A"`, so rendering threw and the editor white-screened.
 * Normalising on read heals those cards: the stray characters surface as one
 * ordinary keyword tag the user can delete.
 *
 * @param {*} value - Raw `keywords` value off a weapon profile
 * @returns {Array} The value if it is already an array, `[value]` for a
 *   non-empty string, otherwise an empty array
 */
export const normalizeKeywords = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};
