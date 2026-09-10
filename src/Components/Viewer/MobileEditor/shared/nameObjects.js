/**
 * Helpers for chip lists whose entries are `{ name }` objects instead of bare
 * strings.
 *
 * 11th edition core / faction abilities and unit keywords are objects because
 * their text is language-keyed; the language projection resolves the text but
 * keeps the object so it can carry its `__i18n` sidecar (see localizedCard.js).
 * The chip editor works in plain strings, so these two helpers convert in both
 * directions.
 */

export const nameObjectLabel = (item) => (typeof item === "string" ? item : (item?.name ?? ""));

/**
 * Map an edited chip list back onto the original entries so each survivor keeps
 * everything else it carries — above all its language map.
 *
 * The chip editor only ever removes an entry or appends one, never renames in
 * place, so matching the remaining labels in order is enough to tell a survivor
 * from a newly typed chip.
 */
export const alignNameObjects = (items, labels) => {
  const remaining = [...items];
  return labels.map((label) => {
    const index = remaining.findIndex((item) => nameObjectLabel(item) === label);
    if (index === -1) return { name: label };
    return remaining.splice(index, 1)[0];
  });
};
