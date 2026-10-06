/**
 * Shared helpers for schema-driven stat-field rendering across the
 * Ds*UnitCard renderers.
 */

export const sortStatFields = (fields) =>
  [...(fields || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

/**
 * A `special` stat field with `hideWhenEmpty` set is hidden when every active
 * stat profile has an empty value for it. Non-special fields and fields
 * without `hideWhenEmpty` always render.
 */
export const shouldHideField = (field, stats) => {
  if (!field.special || !field.hideWhenEmpty) return false;
  const activeStats = (stats || []).filter((s) => s.active !== false);
  return activeStats.every((s) => !s[field.key]);
};
