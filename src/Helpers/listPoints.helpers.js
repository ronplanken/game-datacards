import { localize } from "./localization.helpers";

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
 * What a points tier is restricted to, resolved to English (the language both
 * axes are matched in), or empty for the generic tiers.
 *
 * 11th edition scopes a price two ways:
 *   `detachment` — the C'tan Shards cost more in Pantheon of Woe.
 *   `faction`    — a faction keyword: Assault Intercessors are 75 for 5, but 80
 *                  in a Blood Angels army.
 * A tier carries at most one of them.
 *
 * @param {Object} tier
 * @returns {{ axis: "detachment"|"faction"|null, name: string }}
 */
export const getPointsTierRestriction = (tier) => {
  const detachment = localize(tier?.detachment, "en");
  if (detachment) return { axis: "detachment", name: detachment };
  const faction = localize(tier?.faction, "en");
  if (faction) return { axis: "faction", name: faction };
  return { axis: null, name: "" };
};

/** The restriction label to show under a tier, in the reader's language. */
export const getPointsTierRestrictionLabel = (tier, language) =>
  localize(tier?.detachment, language) || localize(tier?.faction, language) || "";

/** Tier identity for grouping: the same pair isSamePointsTier compares. */
const tierKey = (tier) => `${tier?.models ?? ""}::${localize(tier?.keyword)}`;

const lower = (values) =>
  (Array.isArray(values) ? values : []).filter(Boolean).map((value) => String(value).toLowerCase());

/**
 * Narrow size tiers to the ones this army can actually take.
 *
 * Within each tier — same models + keyword — a restricted entry replaces the
 * generic one when the army matches its restriction, and is hidden otherwise.
 * So a Blood Angels list sees only the 80 pt entry for 5 Assault Intercessors
 * and everyone else only the 75 pt one.
 *
 * Filtering per tier rather than across the whole list means matching a
 * restriction can never remove an unrelated size option. A tier that would end
 * up with nothing left is kept as-is, so a datasheet priced *only* under a
 * restriction never becomes unselectable.
 *
 * @param {Array} tiers - tiers from getSelectablePointsTiers
 * @param {{ detachments?: Array<string>, factions?: Array<string> }} army
 *   English detachment names and faction keywords the army has
 * @returns {Array}
 */
export const filterPointsTiersForArmy = (tiers, army = {}) => {
  const list = Array.isArray(tiers) ? tiers : [];
  if (!list.some((tier) => getPointsTierRestriction(tier).axis)) return list;

  const pools = { detachment: lower(army.detachments), faction: lower(army.factions) };
  const matchesArmy = (tier) => {
    const { axis, name } = getPointsTierRestriction(tier);
    if (!axis) return true;
    return pools[axis].includes(name.toLowerCase());
  };

  const groups = new Map();
  for (const tier of list) {
    const key = tierKey(tier);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(tier);
  }

  return list.filter((tier) => {
    const available = groups.get(tierKey(tier)).filter(matchesArmy);
    if (available.length === 0) return true;
    // A matched restriction's price wins over the generic one for this tier.
    const restricted = available.filter((entry) => getPointsTierRestriction(entry).axis);
    return (restricted.length > 0 ? restricted : available).includes(tier);
  });
};

/**
 * Whether two size tiers describe the same option. Compared by value, not by
 * reference: a card's saved `unitSize` is a different object instance from the
 * entries in `card.points` once the card round-trips through storage, and 11e
 * tier keywords are language-keyed objects, so both are normalised first.
 *
 * @param {Object|undefined} a
 * @param {Object|undefined} b
 * @returns {boolean}
 */
export const isSamePointsTier = (a, b) => {
  if (!a || !b) return false;
  return a.models === b.models && localize(a.keyword) === localize(b.keyword);
};

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

/** Datasheet identity used to group duplicate selections. */
const datasheetKey = (card) => `${card?.source ?? ""}::${card?.id ?? card?.name ?? ""}`;

/** Whether two list entries are the same card (by uuid, else by reference). */
const isSameCard = (a, b) => (a?.uuid != null && b?.uuid != null ? a.uuid === b.uuid : a === b);

/**
 * The points a single card contributes to its list: its base cost, its
 * enhancement, and — for the copies beyond `additionalCost.afterSelections` —
 * that datasheet's roster surcharge.
 *
 * The surcharge is an army-level rule, but it has to be attributed to a row so
 * the displayed unit costs add up to the list total (e.g. two Knight Castellans
 * at 400 with "+20 for each copy beyond 1" read as 400 and 420, totalling 820).
 * Copies are ordered as they appear in the list, so the surcharge lands on the
 * later ones.
 *
 * @param {Object} card
 * @param {Array} cards - every card in the list (for duplicate detection)
 * @returns {number}
 */
export const getCardDisplayCost = (card, cards) => {
  let cost = getCardBaseCost(card);

  const enhancement = Number(card?.selectedEnhancement?.cost);
  if (Number.isFinite(enhancement)) cost += enhancement;

  const additional = card?.additionalCost;
  if (additional?.cost != null && Array.isArray(cards)) {
    const key = datasheetKey(card);
    const copies = cards.filter((entry) => entry?.additionalCost?.cost != null && datasheetKey(entry) === key);
    const position = copies.findIndex((entry) => isSameCard(entry, card));
    const afterSelections = Number(additional.afterSelections) || 0;
    if (position >= afterSelections) cost += Number(additional.cost) || 0;
  }

  return cost;
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
      const key = datasheetKey(card);
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
