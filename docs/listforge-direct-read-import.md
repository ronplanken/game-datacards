---
title: ListForge Direct-Read Import
description: Import mode that builds cards directly from ListForge/NewRecruit export data without datasource matching
category: features
tags: [import, listforge, newrecruit, roster, direct-read]
related:
  - card-data-formats.md
  - custom-datasource-format.md
file_locations:
  helpers: src/Helpers/listforgeImport.helpers.js
  tests: src/Helpers/__tests__/listforgeImport.helpers.test.js
  review_panel: src/Components/Importer/ImportReviewPanel.jsx
  tab: src/Components/Importer/tabs/ListForgeTab.jsx
  importer: src/Components/Importer/Importer.jsx
---

# ListForge Direct-Read Import

## Table of Contents

- [Overview](#overview)
- [ListForge Export Format](#listforge-export-format)
- [Format Mapping](#format-mapping)
  - [Unit Stats](#unit-stats)
  - [Weapons](#weapons)
  - [Abilities](#abilities)
  - [Rules](#rules)
  - [Keywords](#keywords)
  - [Faction Theming](#faction-theming)
- [Deduplication](#deduplication)
- [Text Sanitization](#text-sanitization)
- [Data Nesting Diagram](#data-nesting-diagram)
- [Limitations](#limitations)

## Overview

The ListForge import supports two modes:

- **Match mode** (default): Units are matched by name to datasheets in the app's internal datasource. Card data (stats, weapons, abilities) comes from the datasource.
- **Direct mode**: Cards are built directly from the export data. No datasource matching is needed. Useful when the datasource is outdated, missing units, or for quick imports.

Users can switch between modes using the segmented toggle in the import review panel.

Supported export sources (validated via `generatedBy` field):
- `"List Forge"`
- `"https://newrecruit.eu"`

## ListForge Export Format

ListForge (and NewRecruit) exports follow a hierarchical structure:

```
roster
  forces[]
    force
      catalogueName          -> faction name
      selections[]
        selection (unit)
          name               -> unit name
          type               -> "unit" | "model"
          costs[]            -> points
          categories[]       -> keywords, faction keywords
          rules[]            -> core/faction rules
          profiles[]         -> abilities, invulnerable save
          selections[]       -> sub-selections
            selection (model)
              type: "model"
              profiles[]     -> unit stats (typeName: "Unit")
              selections[]
                selection (weapon)
                  profiles[] -> weapon stats (typeName: "Ranged/Melee Weapons")
```

## Format Mapping

### Unit Stats

| ListForge Path | Internal Field |
|---|---|
| `selection > model sub-selections > profiles[typeName="Unit"] > characteristics` | `card.stats[]` |

| ListForge Characteristic | Internal Field |
|---|---|
| M | m |
| T | t |
| SV | sv |
| W | w |
| LD | ld |
| OC | oc |

Stats live on `type: "model"` sub-selections, not the top-level unit selection. For single-model units (type: "model"), stats are on the selection itself.

When multiple unique stat lines exist (after deduplication), `showName` is set to `true` on all of them. See [Deduplication](#deduplication) for how identical stat lines are collapsed.

### Weapons

| ListForge Path | Internal Field |
|---|---|
| `profiles[typeName="Ranged Weapons"]` | `card.rangedWeapons[].profiles[]` |
| `profiles[typeName="Melee Weapons"]` | `card.meleeWeapons[].profiles[]` |

| ListForge Characteristic | Internal Field |
|---|---|
| Range | range |
| A | attacks |
| BS (ranged) / WS (melee) | skill |
| S | strength |
| AP | ap |
| D | damage |
| Keywords | keywords (split by ", ") |

Weapons are found by recursively traversing all nested selections. All weapon profiles for a type are collected into a single weapon group.

### Abilities

| ListForge Path | Internal Field |
|---|---|
| `profiles[typeName="Abilities"]` | `card.abilities.other[]` |
| Ability named "Invulnerable Save X+" | `card.abilities.invul` |

Abilities are extracted from the unit-level profiles only (not recursing into model sub-selections). Invulnerable saves are detected by name pattern matching (`/^Invulnerable Save (\d+\+)/i`). Invulnerable saves are shown at the top of the card by default (`showAtTop: true`).

### Rules

| ListForge Path | Internal Field |
|---|---|
| `selection.rules[]` | `card.abilities.core[]` or `card.abilities.faction[]` |

Rules are classified as core or faction by looking up the rule name against the app's datasource. The `buildCoreAbilitySet()` function scans all datasheets across all factions in the datasource and collects every ability name that appears in `abilities.core[]`. This set is then used for case-insensitive matching when classifying rules from the export.

This approach ensures the classification always matches what the datasource considers "core" without maintaining a hardcoded list. If no datasource is available, all rules are classified as faction.

### Keywords

| ListForge Path | Internal Field |
|---|---|
| Non-primary categories without "Faction:" prefix | `card.keywords[]` |
| Categories with "Faction: " prefix | `card.factions[]` |

The "Warlord" category is filtered out. All other categories (including "Epic Hero") are included as keywords.

### Faction Theming

In direct mode, the importer matches the parsed faction name against the datasource to resolve a `faction_id` (e.g., `"CSM"` for Chaos Space Marines). This ID is set on each card via `buildCardFromSelection` and controls faction-specific theming (icon, colors) on the rendered card. If no match is found, the card defaults to `"basic"`.

The faction match also resolves the detachment for the imported category.

### Hidden Sections

Unit composition, loadout, and wargear options sections are hidden on direct-read cards (`showComposition: false`, `showLoadout: false`, `showWargear: false`) since ListForge exports do not contain this data.

## Deduplication

ListForge exports repeat profiles across each model in a unit. A unit with 4 models may carry 4 identical stat lines and 4 copies of each weapon. The importer deduplicates these after collection.

### Stat Deduplication

Stat lines are deduplicated by comparing all stat values (`m`, `t`, `sv`, `w`, `ld`, `oc`) — the profile name is **not** included in the key. If multiple models share identical stats, they collapse to a single line and the name is replaced with `"X models"` (e.g., `"4 models"`). Unique stat lines keep their original name.

When multiple unique stat lines remain after deduplication, `showName` is set to `true` on all of them.

### Weapon Deduplication

Ranged and melee weapon profiles are deduplicated independently. Two weapon profiles are considered duplicates if all values match: `name`, `range`, `attacks`, `skill`, `strength`, `ap`, `damage`, and `keywords`. Only the first occurrence is kept.

## Text Sanitization

ListForge exports may contain `^^` markup tags (e.g., `^^Damned^^`) in characteristic text. These are stripped by the `getCharacteristic()` helper before any text is returned.

## Data Nesting Diagram

```
Unit Selection (type: "unit" or "model")
  |
  +-- profiles[]
  |     +-- typeName: "Abilities"     -> abilities.other[] / abilities.invul
  |     +-- typeName: "Unit"          -> stats[] (single-model units only)
  |
  +-- rules[]                         -> abilities.core[] / abilities.faction[]
  |
  +-- categories[]                    -> keywords[] / factions[]
  |
  +-- selections[] (sub-selections)
        |
        +-- type: "model" (model sub-selection)
        |     +-- profiles[]
        |     |     +-- typeName: "Unit"  -> stats[]
        |     +-- selections[]
        |           +-- type: "upgrade" (weapon)
        |                 +-- profiles[]
        |                       +-- typeName: "Ranged Weapons"  -> rangedWeapons[]
        |                       +-- typeName: "Melee Weapons"   -> meleeWeapons[]
        |
        +-- type: "upgrade" (weapon, at unit level)
              +-- profiles[]
                    +-- typeName: "Ranged Weapons"  -> rangedWeapons[]
                    +-- typeName: "Melee Weapons"   -> meleeWeapons[]
```

## Limitations

The following data is **not available** in ListForge exports and will be empty/missing on direct-read cards (composition, loadout, and wargear sections are hidden by default):

- **Artwork/images**: No unit artwork
- **Composition text**: Hidden; no "1 Captain" style composition descriptions
- **Loadout text**: Hidden; no default equipment descriptions
- **Wargear options**: Hidden; no wargear option text
- **Leader info**: No leader attachment rules (though the "Leader" ability description may contain this)
- **Transport info**: No transport capacity data
- **Damaged profile**: No wounded stat modifications
- **Wargear abilities**: Wargear-specific abilities are not separated from other abilities
