---
title: Comparing saved cards with the datasource
description: How cards saved in categories and lists are matched back to the loaded datasource, how the difference is computed, and what an update replaces and keeps.
category: Features
tags: [categories, lists, datasource, diff, update]
related:
  - card-data-formats.md
  - 40k-11e-list-building.md
file_locations:
  - src/Helpers/cardUpdates.helpers.js
  - src/Components/TreeView/DatasourceUpdatesModal.jsx
  - src/Components/TreeView/DatasourceUpdatesDialog.jsx
  - src/Components/TreeView/TreeCategory.jsx
  - src/Components/TreeView/TreeItem.jsx
---

# Comparing saved cards with the datasource

## Table of contents

- [What it does](#what-it-does)
- [How a saved card is matched](#how-a-saved-card-is-matched)
- [Card statuses](#card-statuses)
- [How the difference is computed](#how-the-difference-is-computed)
- [What an update keeps](#what-an-update-keeps)
- [Where it is wired in](#where-it-is-wired-in)
- [Limitations](#limitations)

## What it does

A card added to a category or list is a full copy of the datasource card. When
the datasource is updated later (new points, changed weapons, reworded
abilities), the saved copy does not change. On desktop, right-click a category,
list or single card and choose **Compare with datasource**. The dialog lists
every card that differs from the loaded datasource, shows each change, and lets
the user update the cards they select.

## How a saved card is matched

Adding a card gives the copy a new `uuid`, but the copy keeps the datasource
card's `id`, `cardType`, `source` and `faction_id`. A saved card is matched on:

| Field             | Rule                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `cardType` + `id` | Must be equal                                                                                                                    |
| `source`          | Must be equal when both cards carry one. 10th and 11th edition share many ids, so this stops a 10e card matching an 11e card.    |
| `faction_id`      | Used to pick between candidates. The same datasheet can ship in several faction files; the one from the card's own faction wins. |

`buildDatasourceCardIndex(dataSource, selectedDataSource)` walks every faction
of the loaded datasource (and AoS `genericData`) and builds the cards in the
same shape the browse list adds them in (`useDataSourceItems`):

- Any faction array whose items have `id` and `cardType` (datasheets,
  stratagems, basic stratagems, Starcraft units, custom datasource cards).
- Enhancements through `getBrowsableEnhancements`, with `cardType` and `source`
  set as the browse list does.
- 40K army and detachment rules, with the synthesised `army-rule-<name>` and
  `detachment-rule-<detachment>-<name>` ids.
- AoS warscrolls and spells from `lores` and `manifestationLores`.

## Card statuses

| Status        | Meaning                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `changed`     | Matched, and the content differs                                                                                           |
| `up-to-date`  | Matched, and the content is the same                                                                                       |
| `not-found`   | The card's source is loaded, but no card with that id exists. It was removed, got a new id, or was made by hand.           |
| `unavailable` | The card has no `id`/`cardType`, or its `source` is not in the loaded datasource. The user has to switch datasource first. |

## How the difference is computed

`diffCardContent(savedCard, sourceCard)` compares every top-level field except
the instance fields listed below. It returns a flat list of
`{ kind, path, before, after }` entries where `kind` is `changed`, `added` or
`removed`.

- Arrays of named objects (weapons, profiles, abilities) are matched by name,
  so a reordered list is not reported. Points tiers are matched by models,
  keyword and restriction. Arrays without unique names are compared by index.
- Arrays of plain values and language maps (keywords) are compared as sets.
  Only additions and removals are reported.
- Language-keyed values (`{ en, de, ... }`) are compared as one value and shown
  in the user's card language.
- Display toggles at any depth are ignored: `active`, `showAbility`,
  `showDescription`, `showDamagedMarker`, `showDamagedAbility`, `showName`,
  `showInfo`, `showInvulnerableSave`, `showAtTop`.

## What an update keeps

`applySourceUpdate(savedCard, sourceCard, army)` starts from a copy of the
datasource card and then:

1. Copies the display toggles above from the saved card, matched with the same
   rules as the diff. Hidden weapons and abilities stay hidden.
2. Copies these instance fields from the saved card (and drops them when the
   saved card has none): `uuid`, `isCustom`, `nonBase`, `allied`, `unitSize`,
   `selectedEnhancement`, `selectedWargear`, `isWarlord`, `attachedTo`,
   `leadBy`, `print_side`, `variant`, `styling`, `templateId`, `width`,
   `height`, `background`, custom colours, card image fields, faction symbol
   fields, and the `show*` section toggles.
3. Re-resolves `unitSize` against the new `points`, using the list's army
   context (`getArmyContext`). The chosen size keeps its models and keyword;
   only the price follows the datasource. A size that no longer exists is kept
   as it was.

Everything else comes from the datasource, so content edits the user made to
that card (a renamed card, edited stats) are replaced. The dialog says so.

## Where it is wired in

- `TreeCategory.jsx`: category and list context menu, checks all cards in that
  category (not its sub-categories).
- `TreeItem.jsx`: card context menu, checks one card.
- `DatasourceUpdatesDialog.jsx`: mounted only while open. It reads the loaded
  datasource and settings, applies the update with one `updateCategory` write,
  marks the category pending for sync, and refreshes the active card when it
  was updated.
- `DatasourceUpdatesModal.jsx`: the presentational dialog.

## Limitations

- Only the loaded datasource is checked. Cards from another datasource are
  reported as unavailable.
- The stored `selectedEnhancement` is not refreshed from the datasource.
- 40K rule card ids are built from the rule name. For 11th edition the name is
  localised, so after switching card language rule cards show as not found.
- Mobile lists do not have the action yet. The helpers are shared and can be
  reused there.
