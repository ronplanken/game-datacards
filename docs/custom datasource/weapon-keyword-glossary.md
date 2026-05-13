---
title: Weapon Keyword Glossary
description: Datasource-level mapping from weapon keyword tags to their rule explanations, rendered as a line below the weapon profile in custom 40k-10e cards.
category: custom-datasource
tags: [weapons, keywords, glossary, rendering, 40k-10e]
related:
  - datasource-schema-architecture.md
  - custom-datasource-format.md
file_locations:
  defaults: src/Helpers/weaponKeywordDefaults.js
  helpers: src/Helpers/customSchema.helpers.js
  editor: src/Components/DatasourceEditor/editors/WeaponKeywordGlossaryEditor.jsx
  renderer: src/Components/DatasourceEditor/cards/units/Ds40kUnitWeapons.jsx
  premium_editor: ../gdc-premium/src/Components/CustomCardEditor/editors/index.jsx
---

# Weapon Keyword Glossary

The built-in Warhammer 40K 10th edition data cards render a short explanation line below each weapon profile for every keyword on the weapon — for example, the inline `[One Shot]` tag on a Hunter-killer Missile is accompanied by `[ONE SHOT] - The bearer can only shoot with this weapon once per battle.` directly below the profile row.

Custom datasources get the same behavior through a **datasource-level glossary**: define the keyword name and description once, and any weapon profile that carries that keyword auto-renders the explanation line.

## Table of Contents

- [Schema](#schema)
- [Match resolution](#match-resolution)
- [Default seed for 40k-10e](#default-seed-for-40k-10e)
- [Editor UI](#editor-ui)
- [Rendering](#rendering)

## Schema

The `weaponKeywordGlossary` array lives at the schema root (alongside `cardTypes`):

```js
schema: {
  version: "1.0.0",
  baseSystem: "40k-10e",
  cardTypes: [/* ... */],
  weaponKeywordGlossary: [
    { key: "one-shot", name: "One Shot", description: "The bearer can only shoot with this weapon once per battle.", matchType: "exact" },
    { key: "anti", name: "Anti-", description: "An unmodified Wound roll of 'x+' against a target with the matching keyword scores a Critical Wound.", matchType: "prefix" },
  ],
}
```

| Property      | Type   | Default   | Description |
|---------------|--------|-----------|-------------|
| `key`         | string | required  | Stable storage key, unique within the glossary. |
| `name`        | string | required  | Keyword name as it appears on weapons. |
| `description` | string | required  | Explanation text rendered under the weapon profile. |
| `matchType`   | string | `"exact"` | `"exact"` matches the full tag case-insensitively; `"prefix"` matches case-insensitive `startsWith` (used for parametrised keywords like `Anti-Infantry 4+`). |

## Match resolution

The renderer resolves each weapon keyword tag to at most one glossary entry via `resolveWeaponKeywordEntry` in `customSchema.helpers.js`:

- `exact` entries compare via case-insensitive equality on the keyword tag.
- `prefix` entries match when the keyword tag starts with the entry name (case-insensitive).
- When multiple entries match the same tag, the entry with the **longest `name`** wins. This lets a specific entry like `Power Fist` win over a generic prefix `Power`.

Within one weapon type section, the same glossary entry is only rendered once even if multiple weapons share the keyword — explanation rows are deduplicated by entry key.

## Default seed for 40k-10e

When the Datasource Wizard creates a datasource with `baseSystem: "40k-10e"`, the schema is pre-seeded with the official 10e weapon keyword set from `src/Helpers/weaponKeywordDefaults.js`. The list mirrors the keywords explained in the built-in `KeywordTooltip` component: `One Shot`, `Devastating Wounds`, `Sustained Hits`, `Lethal Hits`, `Anti-`, `Twin-linked`, `Heavy`, `Pistol`, `Rapid Fire`, `Assault`, `Blast`, `Hazardous`, `Indirect Fire`, `Melta`, `Precision`, `Torrent`, `Lance`, `Ignores Cover`, `Feel No Pain`, `Psychic`, `Extra Attacks`, `Plasma Warhead`, `Linked Fire`.

Other base systems (`aos`, `starcraft-tmg`, `blank`) start with an empty glossary. The seed call is `getDefaultWeaponKeywordGlossary(baseSystem)`.

## Editor UI

The glossary editor lives in the Datasource Editor right panel, under the datasource node (above the Factions section). Each row exposes:

- Keyword name input
- Match type select (`Exact` / `Prefix`)
- Auto-generated storage key (editable for advanced users)
- Multi-line description textarea
- Trash button

The section header has a "+" button to add a blank entry, and 40k-10e datasources also get a "Restore defaults" button that replaces the glossary with the seeded set.

The **premium `SchemaWeaponsEditor`** uses the glossary names to populate an `AutoComplete` dropdown when editing a weapon's keywords. Users can still type any free-form keyword — the autocomplete is a hint, not a constraint.

## Rendering

`Ds40kUnitWeapons` reads `schema.weaponKeywordGlossary` via the `weaponKeywordGlossary` prop (threaded by `Ds40kUnitCard` from `DatasourceCardPreview` / `CustomCardDisplay`). For each weapon type section it:

1. Collects every keyword across active weapon profiles in that section.
2. Resolves the keywords via `collectWeaponKeywordExplanations`.
3. Renders a `<div class="special">` block per matched entry, with `[NAME]` as the heading and the description via `UnitAbilityDescription` — matching the existing per-weapon `abilities` blocks already used by the renderer.

Description text can include newlines and bullet markers (`• `) which `UnitAbilityDescription` renders verbatim.

## Verification checklist

- Create a new datasource with `baseSystem: "40k-10e"` → glossary section in the editor is pre-populated with the 10e defaults.
- Open a unit card, add a weapon with keyword `One Shot` → card preview shows the inline tag *and* the explanation row below the profile.
- Add a weapon with keyword `Anti-Infantry 4+` → prefix match resolves to the `Anti-` glossary entry and renders its explanation.
- Delete the `One Shot` entry → existing weapons keep the inline tag but the explanation row disappears.
- Click "Restore defaults" → the 10e set comes back.
- Create a `blank`-base datasource → glossary starts empty; manually-added entries still resolve and render.
