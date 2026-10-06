---
title: Faction Browser Grouping
description: How the datasheet and stratagem lists in the faction browser are grouped by role, faction and detachment, and why keyword matching has to be edition-agnostic
category: Features
tags: [datasheets, stratagems, grouping, 40k-10e, 40k-11e, faction-settings]
related:
  - warhammer-40k-11e-format.md
  - card-data-formats.md
file_locations:
  - src/Helpers/browseList.helpers.js
  - src/Components/LeftPanel/useDataSourceItems.js
  - src/Helpers/cardstorage.helpers.js
  - src/Components/FactionSettingsModal.jsx
---

# Faction Browser Grouping

The faction browser is the searchable card list under the faction picker. It
appears twice — in the editor's left panel and in the viewer's left panel — and
both build their rows from the same helpers so a grouping setting behaves the
same in either place.

## Contents

- [Where the rows come from](#where-the-rows-come-from)
- [Row shapes](#row-shapes)
- [Datasheet grouping](#datasheet-grouping)
- [Stratagem grouping](#stratagem-grouping)
- [Edition-agnostic keyword matching](#edition-agnostic-keyword-matching)
- [Settings](#settings)

## Where the rows come from

| Surface | Entry point | Datasheet rows |
|---------|-------------|----------------|
| Editor left panel | `useDataSourceItems(contentType, searchText)` | `buildFactionDatasheetList` |
| Viewer left panel, mobile drawer | `useDataSourceType(searchText)` | `buildFactionDatasheetList` |
| Mobile faction units screen | `useCombinedDatasheets` | its own grouping |

`buildFactionDatasheetList` runs for every 40k datasource — `40k-10e`,
`40k-10e-cp` and `40k-11e` — which `is40kBrowseSource` decides. Other systems
(AoS warscrolls, Necromunda, custom datasources) keep their own branches.

## Row shapes

The list is flat; grouping is expressed with separator rows the renderers know
how to draw.

| `type` | Meaning | Collapsible |
|--------|---------|-------------|
| _(none)_ | A card | — |
| `category` | Faction heading (own or parent faction) | yes, via `settings.mobile.closedFactions` |
| `allied` | Allied faction heading | yes, via `settings.mobile.closedFactions` |
| `role` | Role or detachment heading | yes, via `settings.mobile.closedRoles` keyed on `roleKey` |
| `header` | Plain, non-collapsible heading | no |

Cards under a `role` separator carry a matching `role` field, which the "Add all
items to..." context action selects on.

Collapsed sections are tracked in one shared `settings.mobile.closedRoles` list,
across datasheet roles and stratagem detachments alike. Both can produce a
section called "Other", so the list stores a namespaced key (`role:Other`,
`detachment:Other`) rather than the display name, carried on both the separator
and its cards as `roleKey`. Read it through `getSectionKey(separator)` and
`getCardSectionKey(card)`, which fall back to the display name for rows built
without one.

Searching filters the cards, then `dropEmptySections` removes any separator the
search left with no cards under it.

## Datasheet grouping

Two independent settings shape the datasheet list:

- `groupByFaction` — keeps the faction/parent/allied `category` rows and their
  order. Off, everything is re-sorted into one alphabetical run.
- `groupByRole` — replaces the faction sections with four role sections, in the
  order GW prints them on a roster: **Character**, **Battleline**,
  **Dedicated Transport**, **Other**. Allied factions are still appended after
  the role sections, since they are a separate list of their own.

Parent (`combineParentFactions`) and allied (`combineAlliedFactions`) sections
depend on `is_subfaction` / `parent_keyword` / `allied_factions` in the data.
The 11th edition datasource ships none of those yet, so those toggles are not
offered there.

## Stratagem grouping

A 40k faction ships around six stratagems per detachment, so a faction's flat
list runs to 60+ entries. `groupStratagemsByDetachment` splits the faction
stratagems into one collapsible `role` section per detachment, in the order the
datasource lists them; stratagems with no detachment collect in a trailing
**Other** section. Core stratagems stay flat under the **Basic stratagems**
header, since they belong to no detachment.

When the list is grouped this way, the per-row detachment subtitle is dropped —
the section heading already says it.

## Edition-agnostic keyword matching

10th edition stores keywords as plain strings:

```json
"keywords": ["Infantry", "Character", "Psyker"]
```

11th edition stores them as language-keyed objects:

```json
"keywords": [{ "en": "Infantry" }, { "en": "Character", "de": "Charaktermodell" }]
```

Anything that groups or filters on a keyword must therefore compare against the
canonical English form rather than test string equality. Use
`cardHasKeyword(card, "Character")` from `listCategories.helpers.js`; a plain
`card.keywords.includes("Character")` silently matches nothing on 11e data and
drops every unit into **Other**.

## Settings

All of these live in the faction settings modal (the gear next to the faction
picker) and are stored globally, not per faction.

| Setting | Tab | Datasources |
|---------|-----|-------------|
| `groupByRole` | Datasheets | 40k-10e, 40k-10e-cp, 40k-11e |
| `showPointsInListview` | Datasheets | 40k-10e, 40k-10e-cp, 40k-11e |
| `showCardsAsDoubleSided` | Datasheets | 40k-10e, 40k-10e-cp, 40k-11e |
| `showLegends`, `combineParentFactions`, `combineAlliedFactions` | Datasheets | 40k-10e |
| `splitDatasheetsByRole` | Datasheets | datasources without `noDatasheetByRole` |
| `hideBasicStratagems` | Stratagems | all with stratagems |
| `groupStratagemsByDetachment` | Stratagems | 40k-10e, 40k-10e-cp, 40k-11e |
