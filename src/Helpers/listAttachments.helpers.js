// Leader / support attachment helpers for the 11th edition list builder.
//
// 11e datasheets with the Leader (or support) ability declare which units they
// can join via `attachesTo`: an array of { type: "leader"|"support", target:
// "<English datasheet name>", targetType: "datasheet" }. In a list, such a unit
// can be attached to an eligible squad that is already in the list; the two stay
// separate list entries (so points still sum normally) but display grouped.
//
// Matching is by English datasheet name: attachesTo targets are English, and the
// 11e loader keeps `nameEn` alongside the localised `name`, so attachment works
// regardless of the user's card language.

import { localize } from "./localization.helpers";
import { cardHasKeyword } from "./listCategories.helpers";

const norm = (value) => localize(value, "en").trim().toLowerCase();

/** The canonical English name used to match a card against attachesTo targets. */
export const cardEnglishName = (card) => card?.nameEn || localize(card?.name, "en");

/** True when a card can be attached to another unit (it declares attachesTo targets). */
export const isAttachableLeader = (card) => Array.isArray(card?.attachesTo) && card.attachesTo.length > 0;

/**
 * The kind of attachment a unit provides: "leader", "support", or null.
 *
 * Leaders MAY be attached to a bodyguard unit; support units (11e's Support
 * ability) MUST be attached — they cannot be fielded on their own. A datasheet's
 * attachesTo entries are all one type in the current data.
 */
export const getAttachmentType = (card) => {
  if (!isAttachableLeader(card)) return null;
  return card.attachesTo.some((a) => a?.type === "support") ? "support" : "leader";
};

/** True when a unit must be attached to another unit to be legal (Support). */
export const requiresAttachment = (card) => getAttachmentType(card) === "support";

/** English target datasheet names this unit can attach to. */
export const getAttachTargetNames = (leaderCard) =>
  (leaderCard?.attachesTo || [])
    .filter((a) => a?.target && (a.targetType ?? "datasheet") === "datasheet")
    .map((a) => a.target);

/**
 * Whether a single attachesTo entry applies, given the army detachment and the
 * target squad. Entries can be qualified by:
 *   requiresDetachment  - only when the army uses that detachment
 *   excludesDetachment  - not when the army uses that detachment
 *   requiresKeyword     - the target squad must have that keyword
 * Detachment qualifiers are ignored when the army detachment is unknown, so the
 * builder stays permissive until a detachment is chosen.
 */
const entryApplies = (entry, squadCard, detachmentName) => {
  const detachment = norm(detachmentName);
  if (detachment) {
    if (entry.requiresDetachment && norm(entry.requiresDetachment) !== detachment) return false;
    if (entry.excludesDetachment && norm(entry.excludesDetachment) === detachment) return false;
  }
  if (entry.requiresKeyword && !cardHasKeyword(squadCard, localize(entry.requiresKeyword, "en"))) return false;
  return true;
};

/**
 * Can `leaderCard` attach to `squadCard`? Matches by English datasheet name and
 * honours each entry's detachment/keyword qualifiers.
 *
 * @param {Object} leaderCard
 * @param {Object} squadCard
 * @param {Object} [options]
 * @param {string} [options.detachment] - the army's detachment name, if chosen
 */
export const canAttachTo = (leaderCard, squadCard, { detachment } = {}) => {
  if (!isAttachableLeader(leaderCard) || !squadCard) return false;
  if (leaderCard.uuid && squadCard.uuid && leaderCard.uuid === squadCard.uuid) return false;
  const squadName = norm(cardEnglishName(squadCard));
  if (!squadName) return false;
  return (leaderCard.attachesTo || []).some(
    (entry) =>
      entry?.target &&
      (entry.targetType ?? "datasheet") === "datasheet" &&
      norm(entry.target) === squadName &&
      entryApplies(entry, squadCard, detachment),
  );
};

/**
 * Squads already in the list that `leaderCard` may join. `listCards` are the
 * cards of the current list (excludes the leader itself).
 */
export const getEligibleSquads = (leaderCard, listCards, options = {}) =>
  (listCards || []).filter((card) => card?.uuid !== leaderCard?.uuid && canAttachTo(leaderCard, card, options));

/**
 * Support units in a list that are not attached to a squad (or whose squad is
 * gone). These are illegal selections and should be flagged to the user.
 */
export const getUnattachedSupportCards = (listCards) => {
  const cards = listCards || [];
  const uuids = new Set(cards.map((c) => c?.uuid));
  return cards.filter((card) => requiresAttachment(card) && (!card.attachedTo || !uuids.has(card.attachedTo)));
};

/** Resolve the squad a leader is attached to, from the list's cards. */
export const getAttachedSquad = (leaderCard, listCards) => {
  if (!leaderCard?.attachedTo) return null;
  return (listCards || []).find((card) => card?.uuid === leaderCard.attachedTo) || null;
};

/**
 * Group a list's cards for display: each squad that hosts attached leaders is
 * returned with its leaders; leaders are removed from the flat list so they are
 * not shown twice. Cards keep their original order. A leader whose `attachedTo`
 * squad is no longer in the list is treated as standalone (stale reference).
 *
 * @returns {Array<{ card, attachedLeaders: Array }>} ordered display rows
 */
export const groupListForDisplay = (listCards) => {
  const cards = listCards || [];
  const byUuid = new Map(cards.map((c) => [c.uuid, c]));
  const attachedBySquad = new Map();
  const attachedLeaderUuids = new Set();

  cards.forEach((card) => {
    if (card?.attachedTo && byUuid.has(card.attachedTo)) {
      attachedLeaderUuids.add(card.uuid);
      const list = attachedBySquad.get(card.attachedTo) || [];
      list.push(card);
      attachedBySquad.set(card.attachedTo, list);
    }
  });

  return cards
    .filter((card) => !attachedLeaderUuids.has(card.uuid))
    .map((card) => ({ card, attachedLeaders: attachedBySquad.get(card.uuid) || [] }));
};
