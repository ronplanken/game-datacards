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

const norm = (value) => localize(value, "en").trim().toLowerCase();

/** The canonical English name used to match a card against attachesTo targets. */
export const cardEnglishName = (card) => card?.nameEn || localize(card?.name, "en");

/** True when a card can be attached to another unit (it declares attachesTo targets). */
export const isAttachableLeader = (card) => Array.isArray(card?.attachesTo) && card.attachesTo.length > 0;

/** English target datasheet names this unit can attach to. */
export const getAttachTargetNames = (leaderCard) =>
  (leaderCard?.attachesTo || [])
    .filter((a) => a?.target && (a.targetType ?? "datasheet") === "datasheet")
    .map((a) => a.target);

/** Can `leaderCard` attach to `squadCard` (by English datasheet name)? */
export const canAttachTo = (leaderCard, squadCard) => {
  if (!isAttachableLeader(leaderCard) || !squadCard) return false;
  if (leaderCard.uuid && squadCard.uuid && leaderCard.uuid === squadCard.uuid) return false;
  const squadName = norm(cardEnglishName(squadCard));
  if (!squadName) return false;
  return getAttachTargetNames(leaderCard).some((target) => norm(target) === squadName);
};

/**
 * Squads already in the list that `leaderCard` may join. `listCards` are the
 * cards of the current list (excludes the leader itself).
 */
export const getEligibleSquads = (leaderCard, listCards) =>
  (listCards || []).filter((card) => card?.uuid !== leaderCard?.uuid && canAttachTo(leaderCard, card));

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
