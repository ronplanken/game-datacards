// Points maths for lists/categories.
//
// A card's base cost is the selected size tier (`unitSize`, chosen via the unit
// config modal). 11th edition cards that have not been configured yet fall back
// to their cheapest `points` tier so they still count in list totals (single-tier
// units — e.g. Knights — have only one option anyway).
//
// 11th edition also introduces a datasheet-level roster surcharge: `additionalCost`
// = `{ cost, afterSelections }`. Each copy of that datasheet beyond
// `afterSelections` selections adds `cost` to the list total (independent of the
// unit's size), e.g. Cerastus Knight Atrapos is 405 for the first, +20 for each
// after that.

/**
 * The size tiers a user can pick for a card in a list. 10e tiers carry an
 * explicit `active` flag (inactive tiers are hidden); 11e tiers carry no flag at
 * all, so only an explicit `active: false` excludes a tier.
 *
 * @param {Object} card
 * @returns {Array} The selectable entries of `card.points`
 */
export const getSelectablePointsTiers = (card) =>
  Array.isArray(card?.points) ? card.points.filter((tier) => tier?.active !== false) : [];

/**
 * The base points cost of a single card (excluding enhancements and the roster
 * surcharge).
 *
 * @param {Object} card
 * @returns {number}
 */
export const getCardBaseCost = (card) => {
  const chosen = Number(card?.unitSize?.cost);
  if (Number.isFinite(chosen)) return chosen;

  // 11e cards without a chosen size default to their cheapest tier.
  if (card?.source === "40k-11e" && Array.isArray(card?.points)) {
    const costs = card.points.map((tier) => Number(tier?.cost)).filter((n) => Number.isFinite(n));
    if (costs.length > 0) return Math.min(...costs);
  }
  return 0;
};

/**
 * Total points for a set of cards, split into the base total (sum of unit sizes
 * + enhancements) and the roster surcharge from duplicated datasheets that carry
 * an `additionalCost`. Duplicates are grouped by datasheet identity (`id` +
 * `source`).
 *
 * @param {Array} cards
 * @returns {{ base: number, surcharge: number, total: number }}
 */
export const computeCategoryPoints = (cards) => {
  const list = Array.isArray(cards) ? cards : [];
  let base = 0;
  const groups = new Map();

  for (const card of list) {
    base += getCardBaseCost(card);

    const enhancement = Number(card?.selectedEnhancement?.cost);
    if (Number.isFinite(enhancement)) base += enhancement;

    const additional = card?.additionalCost;
    if (additional && additional.cost != null) {
      const key = `${card?.source ?? ""}::${card?.id ?? card?.name ?? ""}`;
      const group = groups.get(key);
      if (group) {
        group.count += 1;
      } else {
        groups.set(key, {
          count: 1,
          cost: Number(additional.cost) || 0,
          afterSelections: Number(additional.afterSelections) || 0,
        });
      }
    }
  }

  let surcharge = 0;
  for (const group of groups.values()) {
    surcharge += Math.max(0, group.count - group.afterSelections) * group.cost;
  }

  return { base, surcharge, total: base + surcharge };
};

/**
 * Convenience accessor for the grand total.
 *
 * @param {Array} cards
 * @returns {number}
 */
export const getCategoryPointsTotal = (cards) => computeCategoryPoints(cards).total;
