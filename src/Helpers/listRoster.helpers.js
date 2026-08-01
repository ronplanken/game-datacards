// Army roster helpers for the 11th edition list builder: battle size, Detachment
// Points (DP) and the army-wide detachment selection.
//
// 11e replaces 10e's single detachment choice with a DP budget: the battle size
// grants a number of Detachment Points, each detachment costs 1-3 DP, and an
// army can hold several detachments at once (each granting its own force
// disposition, rules, enhancements and stratagems). The same detachment cannot
// be selected twice. Source: core rules "Select Battle Size" (25.03) and
// "Select Detachments" (25.04).

import { localize } from "./localization.helpers";
import { isUpgradeEnhancement } from "./listCategories.helpers";

/**
 * Battle sizes for 11th edition. `points` is the army points total, `dp` the
 * Detachment Points budget, `enhancementLimit` how many enhancements the army
 * may include and `unitLimit` how many units may share a datasheet name
 * (doubled for Battleline / Dedicated Transport; Epic Heroes are always 1).
 */
export const BATTLE_SIZES = [
  {
    key: "incursion",
    label: "Incursion",
    points: 1000,
    dp: 2,
    enhancementLimit: 2,
    unitLimit: 2,
    // "If you are playing an Incursion battle, you can select a 3DP detachment
    // as your only detachment" — the one case where a detachment may cost more
    // than the DP budget.
    allowsSoloOverBudgetDetachment: true,
  },
  { key: "strikeForce", label: "Strike Force", points: 2000, dp: 3, enhancementLimit: 4, unitLimit: 3 },
];

export const DEFAULT_BATTLE_SIZE = "strikeForce";

/** Look up a battle size by key, falling back to the default. */
export const getBattleSize = (key) =>
  BATTLE_SIZES.find((size) => size.key === key) || BATTLE_SIZES.find((size) => size.key === DEFAULT_BATTLE_SIZE);

/** DP cost of a single detachment (defaults to 1 when the data omits it). */
export const getDetachmentCost = (detachment) => {
  const cost = Number(detachment?.detachmentPoints);
  return Number.isFinite(cost) && cost > 0 ? cost : 1;
};

/** Combined DP cost of the selected detachments. */
export const getSpentDetachmentPoints = (detachments) =>
  (detachments || []).reduce((total, detachment) => total + getDetachmentCost(detachment), 0);

/** Stable identity for a detachment (id when present, else its English name). */
export const getDetachmentKey = (detachment) => detachment?.id || localize(detachment?.name, "en");

/** Is this detachment already in the army? */
export const isDetachmentSelected = (detachments, detachment) =>
  (detachments || []).some((d) => getDetachmentKey(d) === getDetachmentKey(detachment));

/**
 * Whether a detachment can be added: not already selected (the same detachment
 * cannot be taken twice) and its cost fits the remaining DP budget.
 *
 * Exception from the core rules: at a battle size that allows it (Incursion),
 * a detachment costing more than the whole budget may still be taken as the
 * army's *only* detachment. Once taken it fills the budget, so nothing else
 * can be added.
 */
export const canAddDetachment = (detachments, detachment, battleSizeKey) => {
  if (!detachment) return false;
  if (isDetachmentSelected(detachments, detachment)) return false;
  const battleSize = getBattleSize(battleSizeKey);
  const spent = getSpentDetachmentPoints(detachments);
  if (spent + getDetachmentCost(detachment) <= battleSize.dp) return true;
  return spent === 0 && Boolean(battleSize.allowsSoloOverBudgetDetachment);
};

/** Add or remove a detachment, respecting the DP budget. Returns a new array. */
export const toggleDetachment = (detachments, detachment, battleSizeKey) => {
  const current = detachments || [];
  if (isDetachmentSelected(current, detachment)) {
    return current.filter((d) => getDetachmentKey(d) !== getDetachmentKey(detachment));
  }
  if (!canAddDetachment(current, detachment, battleSizeKey)) return current;
  return [...current, detachment];
};

/**
 * The force dispositions the army has access to — one per selected detachment.
 * @returns {Array<{ detachment: string, disposition: string }>} localized pairs
 */
export const getForceDispositions = (detachments, language = "en") =>
  (detachments || [])
    .filter((d) => d?.forceDisposition)
    .map((d) => ({
      detachment: localize(d.name, language),
      disposition: localize(d.forceDisposition?.name, language),
    }));

/**
 * English names of the army's detachments, used to match enhancements (whose
 * `detachment` field is a plain English string).
 */
export const getDetachmentNamesEn = (detachments) =>
  (detachments || []).map((d) => localize(d?.name, "en")).filter(Boolean);

/**
 * Whether an enhancement belongs to one of the army's detachments. Enhancements
 * with no detachment are always available. When the army has no detachments yet,
 * `fallbackDetachment` (the legacy single-detachment selection) is used so 10e
 * and part-built 11e lists keep working.
 */
export const isEnhancementInDetachments = (enhancement, detachments, fallbackDetachment) => {
  const required = enhancement?.detachment;
  if (!required) return true;
  const names = getDetachmentNamesEn(detachments);
  const pool = names.length > 0 ? names : [fallbackDetachment].filter(Boolean);
  if (pool.length === 0) return true;
  return pool.some((name) => String(name).toLowerCase() === String(required).toLowerCase());
};

/**
 * How many enhancements the army currently uses, and whether that exceeds the
 * battle size's limit.
 *
 * Upgrades count only once each: "the second and third instances of the same
 * Upgrade do not count towards the total number of enhancements in your army"
 * (their points are still paid every time — see computeCategoryPoints).
 */
export const getEnhancementUsage = (cards, battleSizeKey) => {
  const countedUpgrades = new Set();
  let used = 0;

  for (const card of cards || []) {
    const enhancement = card?.selectedEnhancement;
    if (!enhancement) continue;
    if (isUpgradeEnhancement(enhancement)) {
      if (countedUpgrades.has(enhancement.name)) continue;
      countedUpgrades.add(enhancement.name);
    }
    used += 1;
  }

  const limit = getBattleSize(battleSizeKey).enhancementLimit;
  return { used, limit, exceeded: used > limit };
};
