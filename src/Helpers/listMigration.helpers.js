import { v4 as uuidv4 } from "uuid";

/**
 * Converts old mobile list data (from localStorage "lists" key) into
 * category objects compatible with useCardStorage.importCategory().
 *
 * @param {*} oldData - Parsed JSON from localStorage("lists").
 *   Can be:
 *   - Object: { "40k-10e": [{ name, datacards }], "aos": [...] }
 *   - Array (legacy): [{ name, datacards }] (treated as "40k-10e")
 *   - null/undefined/malformed
 * @returns {Array} Array of category objects ready for importCategory()
 */
export function migrateListsToCategories(oldData) {
  if (!oldData) return [];

  let perDataSource;

  if (Array.isArray(oldData)) {
    // Legacy array format — treat as 40k-10e
    perDataSource = { "40k-10e": oldData };
  } else if (typeof oldData === "object") {
    perDataSource = oldData;
  } else {
    return [];
  }

  const categories = [];

  for (const [dataSource, lists] of Object.entries(perDataSource)) {
    if (!Array.isArray(lists)) continue;

    for (const list of lists) {
      if (!list || typeof list !== "object") continue;

      const name = list.name || "Imported List";
      const rawCards = Array.isArray(list.datacards) ? list.datacards : [];

      categories.push({
        uuid: uuidv4(),
        name,
        type: "list",
        dataSource,
        cards: rawCards.map((dc) => ({
          ...dc.card,
          unitSize: dc.points,
          selectedEnhancement: dc.enhancement,
          isWarlord: dc.warlord,
          uuid: dc.id || uuidv4(),
          isCustom: true,
        })),
      });
    }
  }

  return categories;
}
