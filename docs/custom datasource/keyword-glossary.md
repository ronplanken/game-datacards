---
title: Keyword Glossary
description: Datasource-level mapping from keyword tags to their rule explanations. Each entry declares the render scopes (weapons, abilities, …) it applies to so a single glossary feeds every renderer across 40k-10e, AoS, and Starcraft TMG.
category: custom-datasource
tags: [keywords, glossary, rendering, 40k-10e, aos, starcraft-tmg, weapons, abilities]
related:
  - datasource-schema-architecture.md
  - custom-datasource-format.md
  - ../starcraft-tmg.md
file_locations:
  defaults: src/Helpers/keywordGlossaryDefaults.js
  helpers: src/Helpers/customSchema.helpers.js
  editor: src/Components/DatasourceEditor/editors/KeywordGlossaryEditor.jsx
  shared_renderer: src/Components/DatasourceEditor/cards/shared/GlossaryKeywords.jsx
  renderer_40k: src/Components/DatasourceEditor/cards/units/Ds40kUnitWeapons.jsx
  renderer_aos: src/Components/DatasourceEditor/cards/warscroll/DsAosWeapons.jsx
  renderer_tmg: src/Components/DatasourceEditor/cards/starcraft/StarcraftWeaponTable.jsx
  premium_editor: ../gdc-premium/src/Components/CustomCardEditor/editors/index.jsx
---

# Keyword Glossary

The built-in Warhammer 40K 10th edition data cards render a short explanation line below each weapon profile for every keyword on the weapon — for example, the inline `[One Shot]` tag on a Hunter-killer Missile is accompanied by `[ONE SHOT] - The bearer can only shoot with this weapon once per battle.` directly below the profile row.

Custom datasources get the same behavior — and the same mechanism extends to other keyword sites on a card (ability text, the unit keywords bar, etc.) — through a **datasource-level glossary**. Define a keyword name, description, and the scopes it applies to once, and every renderer that consumes that scope auto-renders the explanation.

The glossary is **base-system agnostic**: the `40k-10e`, `aos`, and `starcraft-tmg` datasource renderers all read the same `keywordGlossary` array and share the render logic in `src/Components/DatasourceEditor/cards/shared/GlossaryKeywords.jsx`.

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
| `displayMode` | string   | no       | Weapons-only. `"explanation"` (default) renders an explanation row under the profile; `"tooltip"` shows the description on hover over the inline keyword tag and skips the row. Other scopes ignore this field. |

The validator rejects entries with a missing/empty `appliesTo`, duplicate keys, or scopes outside the allow-list.

## Scopes

`VALID_GLOSSARY_SCOPES` ships with these six identifiers:

| Scope            | Where it applies |
|------------------|------------------|
| `weapons`        | Weapon profile keyword tags + explanation rows. Rendered by `Ds40kUnitWeapons` (40k), `DsAosWeapons` (AoS), and `StarcraftWeaponTable` (TMG). |
| `abilities`      | Ability descriptions — `displayMode: "tooltip"` entries get an underline + hover tooltip. Rendered by `Ds40kUnitExtra` (40k), `DsAosAbilities` (AoS), and `StarcraftAbility` (TMG). |
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
- **Applies to** multi-select dropdown (one option per scope; new entries default to `weapons` selected)
- **Display mode** select (`Explanation row` / `Hover tooltip`) — only shown when the entry applies to weapons
- Multi-line description textarea
- Trash button

The section header has a "+" button to add a blank entry. 40k-10e datasources also get a "Restore defaults" button that replaces the glossary with the seeded set.

The **premium `SchemaWeaponsEditor`** uses glossary entries whose `appliesTo` includes `"weapons"` to populate an `AutoComplete` dropdown when editing a weapon's keywords. Users can still type any free-form keyword — the autocomplete is a hint, not a constraint.

## Rendering

Every base-system card renderer receives the glossary via the `keywordGlossary` prop, threaded from `DatasourceCardPreview` / `CustomCardDisplay` (`schema.keywordGlossary`). The renderers then split into a 40K-specific path and a shared path used by AoS and Starcraft TMG.

### Shared components (`shared/GlossaryKeywords.jsx`)

AoS and Starcraft TMG render glossary keywords through three system-neutral components that emit `ds-kw-*` CSS classes (themed per base system in `aos.less` / `starcraft-tmg.less`):

- **`GlossaryKeywordTags`** — inline keyword tags. Each tag's caps/brackets/weight come from its glossary entry's `style` (`resolveKeywordStyle`). `displayMode: "tooltip"` entries get a hover tooltip and the `ds-kw-tag--has-info` dotted underline; everything else renders as a plain tag.
- **`GlossaryExplanationRows`** — the "explanation line" treatment: one `name: description` row per resolved entry. Fed by `getKeywordExplanations(keywords, glossary, scope)`, which resolves + dedupes the keywords and drops `displayMode: "tooltip"` entries (those show on hover only).
- **`GlossaryText`** — free text with inline tooltips: wraps every `findGlossaryMatchesInText` hit (abilities-scoped, `displayMode: "tooltip"`) in an underline + hover tooltip. Returns the raw string untouched when nothing matches.

`splitKeywordString` turns a comma-separated keyword cell (`"Target (Ground), Long Range (18\")"`) into individual tags, ignoring commas inside parentheses — used by Starcraft TMG, which stores weapon keywords as a string column rather than an array.

### Per-system wiring

| Base system | Weapons | Abilities |
|-------------|---------|-----------|
| `40k-10e` | `Ds40kUnitWeapons` → `Ds40kWeaponKeywords` (inline tags) + a `<div class="special">` of `.ability` rows. Uses the 40K-native components rather than the shared ones. | `Ds40kUnitExtra` → `UnitAbilityDescription` (`glossaryOnly`). |
| `aos` | `DsAosWeapons` → `GlossaryKeywordTags` replaces the plain `weapon-ability-badge` pills (desktop + mobile); `GlossaryExplanationRows` renders below the weapon table. Falls back to plain badges when no glossary is present. | `DsAosAbilities` → `GlossaryText` on `ability.description`, but only when there is an actual abilities-scoped tooltip match (otherwise the normal `MarkdownDisplay` path is kept so formatting survives). |
| `starcraft-tmg` | `StarcraftWeaponTable` → the keyword column (any column whose `key` is `keyword`/`keywords`) is split with `splitKeywordString` and rendered via `GlossaryKeywordTags`; `GlossaryExplanationRows` renders below the table (desktop + mobile). | `StarcraftAbility` → `GlossaryText` on `ability.description`. |

Description text can include newlines and bullet markers (`• `) which the 40K `UnitAbilityDescription` renders verbatim; the shared `GlossaryText` renders plain text plus tooltip spans.

## Verification checklist

- Create a new datasource with `baseSystem: "40k-10e"` → glossary section in the editor is pre-populated with the 10e defaults, each row with the `Weapons` chip checked.
- Open a unit card, add a weapon with keyword `One Shot` → card preview shows the inline tag *and* the explanation row below the profile.
- Add a weapon with keyword `Anti-Infantry 4+` → prefix match resolves to the `Anti-` glossary entry and renders its explanation.
- Toggle `Weapons` off on the `One Shot` entry → existing weapons keep the inline tag but the explanation row disappears.
- Set a `Weapons` entry's display mode to `Hover tooltip` → the inline tag gets a dotted underline and shows the description on hover; the explanation row disappears.
- Delete the `One Shot` entry → no explanation row anywhere; inline tag remains on the weapon.
- Click "Restore defaults" → the 10e set comes back, all scoped to `Weapons`.
- Create a `blank`-base datasource → glossary starts empty; manually-added entries with `Weapons` selected render correctly.
- **AoS:** on an `aos` datasource, add a glossary entry scoped to `Weapons`, then add that keyword to a warscroll weapon profile → the keyword tag is styled and (explanation mode) an explanation row renders below the weapon table.
- **Starcraft TMG:** on a `starcraft-tmg` datasource, add a glossary entry whose name matches a token in a weapon's `Keyword` column (e.g. `Target (Ground)` exact, or `Long Range` prefix) → the column splits into styled tags and explanation rows render below the table.
- **Abilities (AoS / TMG):** add an entry scoped to `Abilities` with display mode `Hover tooltip`, reference its name in an ability description → the name gets a dotted underline + hover tooltip in the rendered card.
