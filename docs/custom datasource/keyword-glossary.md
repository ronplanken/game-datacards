---
title: Keyword Glossary
description: Datasource-level mapping from keyword tags to their rule explanations. Each entry declares the render scopes (weapons, abilities, …) it applies to so a single glossary feeds every renderer.
category: custom-datasource
tags: [keywords, glossary, rendering, 40k-10e, weapons, abilities]
related:
  - datasource-schema-architecture.md
  - custom-datasource-format.md
file_locations:
  defaults: src/Helpers/keywordGlossaryDefaults.js
  helpers: src/Helpers/customSchema.helpers.js
  editor: src/Components/DatasourceEditor/editors/KeywordGlossaryEditor.jsx
  renderer: src/Components/DatasourceEditor/cards/units/Ds40kUnitWeapons.jsx
  premium_editor: ../gdc-premium/src/Components/CustomCardEditor/editors/index.jsx
---

# Keyword Glossary

The built-in Warhammer 40K 10th edition data cards render a short explanation line below each weapon profile for every keyword on the weapon — for example, the inline `[One Shot]` tag on a Hunter-killer Missile is accompanied by `[ONE SHOT] - The bearer can only shoot with this weapon once per battle.` directly below the profile row.

Custom datasources get the same behavior — and the same mechanism extends to other keyword sites on a card (ability text, the unit keywords bar, etc.) — through a **datasource-level glossary**. Define a keyword name, description, and the scopes it applies to once, and every renderer that consumes that scope auto-renders the explanation.

## Table of Contents

- [Schema](#schema)
- [Scopes](#scopes)
- [Match resolution](#match-resolution)
- [Default seed for 40k-10e](#default-seed-for-40k-10e)
- [Editor UI](#editor-ui)
- [Rendering](#rendering)

## Schema

The `keywordGlossary` array lives at the schema root (alongside `cardTypes`):

```js
schema: {
  version: "1.0.0",
  baseSystem: "40k-10e",
  cardTypes: [/* ... */],
  keywordGlossary: [
    {
      key: "one-shot",
      name: "One Shot",
      description: "The bearer can only shoot with this weapon once per battle.",
      matchType: "exact",
      appliesTo: ["weapons"],
    },
    {
      key: "anti",
      name: "Anti-",
      description: "An unmodified Wound roll of 'x+' against a target with the matching keyword scores a Critical Wound.",
      matchType: "prefix",
      appliesTo: ["weapons"],
    },
  ],
}
```

| Property      | Type     | Required | Description |
|---------------|----------|----------|-------------|
| `key`         | string   | yes      | Stable storage key, unique within the glossary. |
| `name`        | string   | yes      | Keyword name as it appears on cards. |
| `description` | string   | yes      | Explanation text rendered by consuming renderers. |
| `matchType`   | string   | no       | `"exact"` (default, case-insensitive equality) or `"prefix"` (case-insensitive `startsWith`). |
| `appliesTo`   | string[] | yes      | Non-empty array of scopes from `VALID_GLOSSARY_SCOPES`. |

The validator rejects entries with a missing/empty `appliesTo`, duplicate keys, or scopes outside the allow-list.

## Scopes

`VALID_GLOSSARY_SCOPES` ships with these six identifiers:

| Scope            | Where it applies |
|------------------|------------------|
| `weapons`        | Weapon profile keyword tags (rendered today by `Ds40kUnitWeapons`). |
| `abilities`      | Ability descriptions / titles. Future renderer. |
| `unit-keywords`  | The unit keywords bar at the bottom of a card. Future renderer. |
| `rules`          | Rule card content. Future renderer. |
| `stratagems`     | Stratagem card content. Future renderer. |
| `enhancements`   | Enhancement card content. Future renderer. |

A single entry may declare multiple scopes when the same name appears in more than one place. For example, `Lethal Hits` is a weapon keyword *and* commonly referenced in ability descriptions — one entry with `appliesTo: ["weapons", "abilities"]` covers both without duplication.

Adding a new scope is a two-step change: append the identifier to `VALID_GLOSSARY_SCOPES` (and the editor's `SCOPE_LABELS` map), then ship a renderer that calls `collectKeywordExplanations(keywords, glossary, "<scope>")`.

## Match resolution

The renderer resolves each keyword tag to at most one glossary entry via `resolveKeywordEntry(keyword, glossary, scope)` in `customSchema.helpers.js`:

1. Filter the glossary down to entries whose `appliesTo` includes the renderer's scope.
2. `exact` entries compare via case-insensitive equality on the keyword tag.
3. `prefix` entries match when the keyword tag starts with the entry name (case-insensitive).
4. When multiple in-scope entries match the same tag, the entry with the **longest `name`** wins. This lets a specific entry like `Power Fist` win over a generic prefix `Power`.

Within one renderer section, the same glossary entry is only rendered once even if multiple weapons share the keyword — explanation rows are deduplicated by entry key.

## Default seed for 40k-10e

When the Datasource Wizard creates a datasource with `baseSystem: "40k-10e"`, the schema is pre-seeded with the official 10e weapon keyword set from `src/Helpers/keywordGlossaryDefaults.js`. The list mirrors the keywords explained in the built-in `KeywordTooltip` component: `One Shot`, `Devastating Wounds`, `Sustained Hits`, `Lethal Hits`, `Anti-`, `Twin-linked`, `Heavy`, `Pistol`, `Rapid Fire`, `Assault`, `Blast`, `Hazardous`, `Indirect Fire`, `Melta`, `Precision`, `Torrent`, `Lance`, `Ignores Cover`, `Feel No Pain`, `Psychic`, `Extra Attacks`, `Plasma Warhead`, `Linked Fire`. Every seeded entry has `appliesTo: ["weapons"]`.

Other base systems (`aos`, `starcraft-tmg`, `blank`) start with an empty glossary. The seed call is `getDefaultKeywordGlossary(baseSystem)`.

## Editor UI

The glossary editor lives in the Datasource Editor right panel, under the datasource node (above the Factions section). Each row exposes:

- Keyword name input
- Match type select (`Exact` / `Prefix`)
- Auto-generated storage key (editable for advanced users)
- **Applies to** checkbox row (one chip per scope; new entries default to `weapons` selected)
- Multi-line description textarea
- Trash button

The section header has a "+" button to add a blank entry. 40k-10e datasources also get a "Restore defaults" button that replaces the glossary with the seeded set.

The **premium `SchemaWeaponsEditor`** uses glossary entries whose `appliesTo` includes `"weapons"` to populate an `AutoComplete` dropdown when editing a weapon's keywords. Users can still type any free-form keyword — the autocomplete is a hint, not a constraint.

## Rendering

`Ds40kUnitWeapons` receives the glossary via the `keywordGlossary` prop (threaded by `Ds40kUnitCard` from `DatasourceCardPreview` / `CustomCardDisplay`). For each weapon type section it:

1. Collects every keyword across active weapon profiles in that section.
2. Resolves them via `collectKeywordExplanations(keywords, glossary, "weapons")` — entries without `weapons` in `appliesTo` are skipped.
3. Renders a `<div class="special">` block per matched entry, with `[NAME]` as the heading and the description via `UnitAbilityDescription` — matching the existing per-weapon `abilities` blocks already used by the renderer.

Description text can include newlines and bullet markers (`• `) which `UnitAbilityDescription` renders verbatim.

## Verification checklist

- Create a new datasource with `baseSystem: "40k-10e"` → glossary section in the editor is pre-populated with the 10e defaults, each row with the `Weapons` chip checked.
- Open a unit card, add a weapon with keyword `One Shot` → card preview shows the inline tag *and* the explanation row below the profile.
- Add a weapon with keyword `Anti-Infantry 4+` → prefix match resolves to the `Anti-` glossary entry and renders its explanation.
- Toggle `Weapons` off on the `One Shot` entry → existing weapons keep the inline tag but the explanation row disappears.
- Toggle `Abilities` on (in addition to `Weapons`) → no visible change today (no ability renderer yet); the data round-trips through export/import.
- Delete the `One Shot` entry → no explanation row anywhere; inline tag remains on the weapon.
- Click "Restore defaults" → the 10e set comes back, all scoped to `Weapons`.
- Create a `blank`-base datasource → glossary starts empty; manually-added entries with `Weapons` selected render correctly.
