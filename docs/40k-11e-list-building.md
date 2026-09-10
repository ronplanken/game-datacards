---
title: 11th Edition list building
description: How 11e army lists work — the main faction, battle size and Detachment Points, detachment selection, enhancements and Upgrades, leader/support attachment, and how detachment- and faction-scoped points are resolved and repriced.
category: Features
tags: [40k-11e, lists, detachments, enhancements, points, leaders]
related:
  - warhammer-40k-11e-format.md
  - listforge-direct-read-import.md
file_locations:
  - src/Helpers/listRoster.helpers.js
  - src/Helpers/listPoints.helpers.js
  - src/Helpers/listCategories.helpers.js
  - src/Helpers/listAttachments.helpers.js
  - src/Components/Viewer/useMobileList.jsx
  - src/Components/Viewer/ListCreator/
  - src/Components/Viewer/Mobile/ArmyRosterSheet.jsx
  - src/Components/TreeView/TreeCategory.jsx
  - src/Components/TreeView/ArmyRosterModal.jsx
  - src/Components/TreeView/UnitConfigModal.jsx
---

# 11th Edition list building

11e army lists are ordinary card storage categories (`type: "list"`) with a few
extra army-wide fields. Everything below applies to lists whose datasource is
`40k-11e`; 10e and AoS lists are unaffected.

## Table of contents

- [What a list stores](#what-a-list-stores)
- [The main faction](#the-main-faction)
- [Battle size and Detachment Points](#battle-size-and-detachment-points)
- [Points: detachment- and faction-scoped tiers](#points-detachment--and-faction-scoped-tiers)
- [Repricing when the detachments change](#repricing-when-the-detachments-change)
- [Enhancements and Upgrades](#enhancements-and-upgrades)
- [Leaders and Support units](#leaders-and-support-units)
- [Where it is wired in](#where-it-is-wired-in)

## What a list stores

| Field | Meaning |
|-------|---------|
| `factionId` | The faction the list is built for (its "main" faction) |
| `battleSize` | `"incursion"` or `"strikeForce"` (defaults to Strike Force) |
| `detachments` | The detachment objects the army has bought with its DP |
| `cards[].unitSize` | The chosen `points` tier for that card |
| `cards[].selectedEnhancement` | The enhancement/Upgrade given to that card |
| `cards[].attachedTo` | The `uuid` of the squad a leader/support unit joins |

## The main faction

A new list records the faction that was selected when it was created, so its
detachments (and faction-scoped prices) are available **before the first unit is
added**. Mobile does this in `createList(name, { factionId })` from
`ListSelector`; desktop in `addCategory(name, "list", dataSource, { factionId })`
from the toolbar's "Start a new army list" button.

`getListFactionId(category)` resolves it, falling back to the first card that
carries a `faction_id` so lists created before this existed (and imported ones)
keep working. A list with neither falls back to the faction being browsed, and
that faction is written onto the list the first time its detachments are set.

## Battle size and Detachment Points

From the core rules' Select Battle Size table (`BATTLE_SIZES`):

| Battle size | Points | DP | Enhancements | Units per datasheet |
|-------------|--------|----|--------------|---------------------|
| Incursion | 1000 | 2 | 2 | 2 |
| Strike Force | 2000 | 3 | 4 | 3 |

An army buys several detachments with its DP budget; each detachment costs
1-3 DP (`detachmentPoints`) and grants its own force disposition, rules,
enhancements and stratagems. The same detachment cannot be taken twice.

One exception is implemented: at Incursion a 3 DP detachment may be taken as the
army's **only** detachment (`allowsSoloOverBudgetDetachment`). Once taken it
fills the budget, so nothing else can be added.

The picker shows unaffordable detachments as disabled rather than hiding them,
so the budget is visible. Mobile uses `ArmyRosterSheet` (opened from the roster
row at the top of the list overview, which is shown even when the list is still
empty); desktop uses `ArmyRosterModal`, opened from the roster row rendered
under an expanded 11e list in the category tree.

## Points: detachment- and faction-scoped tiers

An 11e size tier may be restricted to one of two axes
(`getPointsTierRestriction`):

- `detachment` — e.g. the C'tan Shards cost more in Pantheon of Woe.
- `faction` — a faction keyword: Assault Intercessors are 75 for 5, but 80 in a
  Blood Angels army.

`filterPointsTiersForArmy(tiers, army)` narrows the tiers to what the army can
actually take. Within each tier — same `models` + `keyword` — a restricted entry
**replaces** the generic one when the army matches, and is hidden otherwise. A
tier that would end up with nothing left is kept as-is, so a datasheet priced
only under a restriction never becomes unselectable.

The army context comes from `getArmyContext(category, faction)`:

- `detachments` — English names of the list's detachments.
- `factions` — the list's own faction name plus every `factions` keyword on its
  cards, so a Blood Angels list prices correctly from its very first unit
  instead of only once a chapter-specific card is added.

## Repricing when the detachments change

Choosing or removing a detachment can change what units already in the list
cost. `repriceListCards(cards, army)` re-resolves every configured card's chosen
size against the new army context: the card keeps its size (same models +
keyword) and only the priced entry swaps between the generic and the restricted
one. Cards whose price is unaffected are returned untouched, and cards with no
`unitSize` yet are left alone.

The changed rows come back as `{ name, from, to }` and are summarised by
`describeRepricedCards` into the toast that explains the movement. The
detachment change and the repriced cards are written in a **single** category
update — `updateCategory` replaces the whole category, so two chained writes
would make the second overwrite the first.

## Enhancements and Upgrades

- Only `Character` units can be given enhancements; `Epic Hero` models can be
  given none.
- An army cannot include more than one of the same enhancement.
- Enhancements tagged as **Upgrades** (`equipableByNonCharacter`) can be given
  to non-Character units, and up to three of the same Upgrade can be included
  (`MAX_UPGRADE_COPIES`). The second and third do not count towards the army's
  enhancement total (`getEnhancementUsage`), but their points are paid each
  time.
- Enhancements from **any** selected detachment are offered
  (`isEnhancementInDetachments`); enhancements with no detachment are always
  available.

## Leaders and Support units

11e datasheets carry `attachesTo: { type, requiresDetachment, excludesDetachment,
requiresKeyword }`:

- `leader` — may join an eligible squad, but can also stand alone.
- `support` — **must** be attached; the config UI blocks saving until a squad is
  chosen and the list overview flags an unattached one.

`canAttachTo` honours the detachment/keyword restrictions, `getEligibleSquads`
lists the valid squads already in the list, and `groupListForDisplay` nests
attached units under their squad.

## Where it is wired in

- Army/roster helpers: `src/Helpers/listRoster.helpers.js`.
- Points maths and tier filtering: `src/Helpers/listPoints.helpers.js`.
- Sections, keyword checks and Upgrade limits: `src/Helpers/listCategories.helpers.js`.
- Attachment rules: `src/Helpers/listAttachments.helpers.js`.
- Mobile: `src/Components/Viewer/useMobileList.jsx`,
  `src/Components/Viewer/ListCreator/` (`ListOverview`, `ListSelector`,
  `ListAdd`, `ListEditCard`), `src/Components/Viewer/Mobile/ArmyRosterSheet.jsx`.
- Desktop: `src/Components/TreeView/TreeCategory.jsx`,
  `src/Components/TreeView/ArmyRosterModal.jsx`,
  `src/Components/TreeView/UnitConfigModal.jsx`,
  `src/Components/Toolbar/Toolbar.jsx`.
