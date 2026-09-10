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
//
// A handful of 11e datasheets also charge for wargear: `wargearOptions` groups
// of `{ instruction, options: [{ name, cost }] }`. Most options are free, but
// e.g. a Redemptor Dreadnought's macro plasma incinerator costs 10. What the
// user picked is stored on the card as `selectedWargear`, see getCardWargearCost.

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

/** A wargear group's identity: its instruction plus the options it offers. */
const wargearGroupKey = (instruction, options) =>
  `${localize(instruction, "en")}::${options.map((option) => `${localize(option.name, "en")}@${option.cost}`).join("|")}`;

/**
 * Every wargear choice a card offers, free ones included, ready to show on the
 * card back and in the editor.
 *
 * The 11e data repeats an identical option group once per model in the unit (a
 * Terminator Assault Squad lists the same thunder hammer swap twice), which
 * reads as noise on a card, so identical groups — same instruction, same
 * options at the same prices — are collapsed into one.
 *
 * Groups that offer nothing are dropped; a bare instruction has nothing to
 * choose from.
 *
 * @param {Object} card
 * @returns {Array<{ instruction: string|Object, options: Array<{ name: string|Object, cost: number }> }>}
 *   `instruction` and `name` keep their stored (possibly language-keyed) shape
 *   so callers can localise them; `cost` is normalised to a number (0 when the
 *   data has none).
 */
export const getWargearOptionGroups = (card) => {
  const groups = Array.isArray(card?.wargearOptions) ? card.wargearOptions : [];
  const seen = new Set();
  const result = [];

  for (const group of groups) {
    const options = (Array.isArray(group?.options) ? group.options : []).map((option) => {
      const cost = Number(option?.cost);
      return { name: option?.name, cost: Number.isFinite(cost) ? cost : 0 };
    });
    if (options.length === 0) continue;

    // Matched in English, the one language every entry is guaranteed to have.
    const key = wargearGroupKey(group?.instruction, options);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ instruction: group?.instruction, options });
  }

  return result;
};

/**
 * The wargear options a card charges points for, ready to offer in the list
 * builder. Free options (cost 0, the overwhelming majority) are dropped as
 * noise — they change the model's loadout, not its price.
 *
 * On top of the group-level deduplication of getWargearOptionGroups, options
 * are deduplicated by name + cost. That also collapses the same paid item
 * offered under two different instructions — for pricing purposes they are one
 * choice with a quantity.
 *
 * @param {Object} card
 * @returns {Array<{ name: string|Object, cost: number }>} `name` keeps its
 *   stored (possibly language-keyed) shape so callers can localise it.
 */
export const getPaidWargearOptions = (card) => {
  const seen = new Set();
  const paid = [];

  for (const group of getWargearOptionGroups(card)) {
    for (const option of group.options) {
      if (option.cost <= 0) continue;
      const key = `${localize(option.name, "en")}::${option.cost}`;
      if (seen.has(key)) continue;
      seen.add(key);
      paid.push({ name: option.name, cost: option.cost });
    }
  }

  return paid;
};

/** Identity of a wargear selection: its English name paired with its price. */
const wargearKey = (entry) => `${localize(entry?.name, "en")}::${Number(entry?.cost)}`;

/**
 * How many of `option` the current selection holds.
 *
 * @param {Array|undefined} selected - a card's `selectedWargear`
 * @param {Object} option - an entry from getPaidWargearOptions
 * @returns {number} 0 when the option is not taken
 */
export const getWargearQuantity = (selected, option) => {
  const list = Array.isArray(selected) ? selected : [];
  const match = list.find((entry) => wargearKey(entry) === wargearKey(option));
  const quantity = Number(match?.quantity);
  if (!match) return 0;
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

/**
 * Set how many of `option` the selection holds, returning a new array. A
 * quantity of 0 (or less) drops the entry entirely rather than storing a zero,
 * so a card that takes no paid wargear saves an empty list.
 *
 * Existing entries keep their position so the section does not reshuffle while
 * the user clicks the stepper.
 *
 * @param {Array|undefined} selected - a card's `selectedWargear`
 * @param {Object} option - an entry from getPaidWargearOptions
 * @param {number} quantity
 * @returns {Array}
 */
export const setWargearQuantity = (selected, option, quantity) => {
  const next = Array.isArray(selected) ? [...selected] : [];
  const index = next.findIndex((entry) => wargearKey(entry) === wargearKey(option));
  const count = Number(quantity);

  if (!Number.isFinite(count) || count <= 0) {
    if (index >= 0) next.splice(index, 1);
    return next;
  }

  const entry = { name: option?.name, cost: Number(option?.cost), quantity: count };
  if (index >= 0) next[index] = entry;
  else next.push(entry);
  return next;
};

// Ceiling for wargear quantities when the chosen size tier does not say how many
// models the unit has. Generous enough not to block any real unit, low enough to
// keep an accidental click from inflating a list.
const WARGEAR_QUANTITY_FALLBACK_MAX = 10;

/**
 * The most copies of one wargear option a unit can take: its model count, since
 * instructions like "any number of models can each have..." are per model.
 *
 * @param {Object|undefined} unitSize - the selected points tier
 * @returns {number}
 */
export const getWargearQuantityMax = (unitSize) => {
  const models = Number(unitSize?.models);
  return Number.isFinite(models) && models > 0 ? models : WARGEAR_QUANTITY_FALLBACK_MAX;
};

/**
 * Cap every selected quantity at what the given size tier allows, so switching
 * to a smaller tier after picking wargear cannot leave a selection that prices
 * more models than the unit has.
 *
 * Returns the original array when nothing needed capping, so callers can store
 * the result without triggering a needless re-render.
 *
 * @param {Array|undefined} selected - a card's `selectedWargear`
 * @param {Object|undefined} unitSize - the selected points tier
 * @returns {Array}
 */
export const clampWargearQuantities = (selected, unitSize) => {
  const list = Array.isArray(selected) ? selected : [];
  const max = getWargearQuantityMax(unitSize);
  let capped = false;

  const next = list.map((entry) => {
    const quantity = Number(entry?.quantity);
    const current = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    if (current <= max) return entry;
    capped = true;
    return { ...entry, quantity: max };
  });

  return capped ? next : list;
};

/**
 * The points a card's selected wargear adds. An entry without a usable quantity
 * counts once, so a selection saved before quantities existed still prices.
 *
 * @param {Object} card
 * @returns {number}
 */
export const getCardWargearCost = (card) => {
  const selected = Array.isArray(card?.selectedWargear) ? card.selectedWargear : [];

  return selected.reduce((sum, entry) => {
    const cost = Number(entry?.cost);
    if (!Number.isFinite(cost)) return sum;
    const quantity = Number(entry?.quantity);
    return sum + cost * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
  }, 0);
};

/** Datasheet identity used to group duplicate selections. */
const datasheetKey = (card) => `${card?.source ?? ""}::${card?.id ?? card?.name ?? ""}`;

/** Whether two list entries are the same card (by uuid, else by reference). */
const isSameCard = (a, b) => (a?.uuid != null && b?.uuid != null ? a.uuid === b.uuid : a === b);

/**
 * The points a single card contributes to its list: its base cost, its
 * enhancement, its paid wargear, and — for the copies beyond
 * `additionalCost.afterSelections` — that datasheet's roster surcharge.
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

  cost += getCardWargearCost(card);

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
 * + enhancements + paid wargear) and the roster surcharge from duplicated
 * datasheets that carry an `additionalCost`. Duplicates are grouped by datasheet
 * identity (`id` + `source`).
 *
 * The base total must stay in step with getCardDisplayCost: together they are
 * what makes the displayed rows add up to the list total.
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

    base += getCardWargearCost(card);

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
