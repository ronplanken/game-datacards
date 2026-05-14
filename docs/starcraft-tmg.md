---
title: Starcraft Tabletop Miniatures Game Datasheets
description: First-class base system for Starcraft TMG datasheets, including schema preset, card renderer, and starter datasource
category: Data Formats
tags: [starcraft-tmg, datasource, schema, renderer, unit]
related:
  - custom datasource/datasource-schema-architecture.md
  - custom-datasource-format.md
file_locations:
  - src/Helpers/customSchema.helpers.js
  - src/Components/DatasourceEditor/cards/DsStarcraftUnitCard.jsx
  - src/Components/DatasourceEditor/cards/starcraft/
  - src/styles/starcraft-tmg.less
  - src/data/starcraft-tmg.json
---

# Starcraft TMG Datasheets

Starcraft TMG is a first-class base system alongside `40k-10e` and `aos`. It provides a single
`unit` card type that mirrors the printed Starcraft datasheets: stat hex pills in the faction-coloured
header, tiered Models / Supply, phase-grouped abilities with badges, and Assault / Combat weapon tables.

## Table of Contents

1. [Base system identifier](#base-system-identifier)
2. [Unit schema](#unit-schema)
3. [Ability badges and cost chips](#ability-badges-and-cost-chips)
4. [Models / Supply tiers](#models--supply-tiers)
5. [Weapon tables](#weapon-tables)
6. [Faction colours](#faction-colours)
7. [Starter datasource](#starter-datasource)
8. [Wizard flow](#wizard-flow)

## Base system identifier

`baseSystem: "starcraft-tmg"` — added to `VALID_BASE_SYSTEMS` in `src/Helpers/customSchema.helpers.js`.
The wizard (`StepBaseSystem.jsx`) exposes it alongside the 40K and AoS options with a Rocket icon and
purple accent, and `resolveDatasourceRenderer("starcraft-tmg", "unit")` returns `DsStarcraftUnitCard`.

## Unit schema

The preset (`createStarcraftTmgPreset()`) defines one card type with `baseType: "unit"`.

| Section | Keys | Notes |
|---|---|---|
| `stats` | `speed`, `evade`, `armour`, `hitPoints`, `size` | Rendered as hex-shaped pills in the header |
| `weaponTypes` | `assault`, `combat` | Shared column set: RNG, RoA, Hit, Surge type, S Dice, Dmg, Keyword. The `keyword` column (comma-separated string) resolves against the [keyword glossary](custom%20datasource/keyword-glossary.md) — matching tokens render as styled tags with hover tooltips / explanation rows. |
| `abilities` | `special`, `movement`, `assault`, `combat` | Each category sets `hasType`, `hasCost`, `hasTriggerIcon`, `phaseStyle` |
| `sections` | `modelsSupply` | Format `modelsSupplyTiers` — tiered Models × Supply pairs |
| `metadata` | `hasKeywords`, `hasFactionKeywords` | `hasPoints: false` — Supply is the cost mechanic |

## Ability badges and cost chips

`AbilityCategoryDefinition` gained three optional flags (additive; default-false and ignored by 40K / AoS):

- **`hasType`** — when true, abilities render a pill coloured by `ability.type`:
  `PASSIVE` (red), `ACTIVE` (green), `REACTION` (amber).
- **`hasCost`** — when true, abilities render cost chips from `ability.costs`:
  `[{ amount: "1", unit: "CP" }]` → blue `1 CP` chip; `BM` → purple; any other unit → neutral grey.
- **`hasTriggerIcon`** — when true, abilities with `triggered: true` render an up-arrow glyph before the name.

Example ability data:

```json
{
  "category": "movement",
  "name": "Stimpack",
  "type": "ACTIVE",
  "costs": [{ "amount": "1", "unit": "CP" }],
  "description": "Gain Non-lethal Damage (3). This unit gains Buff Speed (2)..."
}
```

## Models / Supply tiers

Stored on the card as `modelsSupply: [{ models, supply }, ...]` and rendered in the header via a dedicated
component. Any number of tiers is supported; the printed reference uses up to three
(for example `1-3 / 0`, `4-6 / 1`, `7-9 / 2`). The section type `modelsSupplyTiers` is whitelisted in
`VALID_SECTION_FORMATS` so `validateSchema()` accepts it.

## Weapon tables

Weapons are stored per phase key:

```json
"weapons": {
  "assault": [{ "name": "C-14 Rifle", "profiles": [{ "name": "Standard", "rng": "12", "roa": "2", "hit": "3+", ... }] }],
  "combat":  [{ "name": "Strike", "profiles": [...] }]
}
```

Multiple profiles per weapon are supported (`hasProfiles: true`); additional profiles render indented
on their own row, mirroring the printed AGG-12 / Bayonet layout.

## Faction colours

Each faction in the datasource specifies `colours.header` and `colours.banner`. `DsStarcraftUnitCard`
maps those into CSS variables:

- `--sc-header-colour` ← `colours.header` — main header gradient start, image block top
- `--sc-header-dark` ← `colours.banner` — gradient end, borders, faction-pill underlay
- `--sc-accent` ← `colours.accent` (or `colours.banner` if absent) — faction tag pill

Defaults in `src/styles/starcraft-tmg.less` keep cards legible when colours are missing.

## Starter datasource

`src/data/starcraft-tmg.json` ships as a reference datasource with Terran, Zerg, and Protoss factions
and two fully-populated cards (Marine, Roach). Import via the standard custom-datasource import flow
to see every schema feature exercised end-to-end.

## Wizard flow

Selecting **Starcraft TMG** in the wizard's base-system step seeds the type-specific step data via
`getPresetStepDefaults("starcraft-tmg", "unit")`. Stats, weapons, abilities, sections, and metadata
arrive pre-filled; users can customise any of it before review.
