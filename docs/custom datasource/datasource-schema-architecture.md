# Custom Datasource Schema Architecture

## Overview

The schema defines the **shape** of cards in a custom datasource -- what card types exist, what fields they have, and how they are displayed. It does not contain card data itself.

For the full datasource JSON format (including card data and faction structure), see [custom-datasource-format.md](../custom-datasource-format.md).

## Schema Object

The `schema` property sits inside a datasource's top-level structure.

```js
{
  version: "1.0.0",
  baseSystem: "40k-10e" | "aos" | "starcraft-tmg" | "blank",
  colours: {
    header: string,      // hex colour for card headers (default: "#1a1a2e")
    banner: string,      // hex colour for card banners (default: "#16213e")
  },
  cardTypes: [CardTypeDefinition],
  keywordGlossary: [KeywordGlossaryEntry], // optional, see below
}
```

| Field             | Type   | Description |
|-------------------|--------|-------------|
| `version`         | string | Schema version string. |
| `baseSystem`      | string | Determines available editor features and default presets. |
| `colours`         | object | Default faction colours, propagated to each faction's `colours` object. |
| `cardTypes`       | array  | Card type definitions (see below). |
| `keywordGlossary` | array  | Optional. Definitions for keywords used anywhere on a card. Each entry declares the render scopes (weapons, abilities, …) where it applies. |

### Colours

Colours control the visual theming of card headers and banners. The Datasource Editor exposes these as "Main" (header) and "Accent" (banner) colour pickers. Changes propagate to every faction's `colours` object automatically. Similarly, renaming the datasource propagates the new name to every faction.

## Keyword Glossary

The optional `keywordGlossary` array at the schema root pairs a keyword tag (e.g. `One Shot`, `Anti-`) with a description and declares the render contexts in which it applies. It is shared by every base system — the `40k-10e`, `aos`, and `starcraft-tmg` datasource renderers all consume the same glossary. When a weapons renderer encounters a weapon profile keyword that resolves to a glossary entry scoped to `"weapons"`, it renders an explanation row below the weapon table — matching how the built-in 10th edition cards display `[ONE SHOT] - The bearer can only shoot with this weapon once per battle.`

Each base system wires the glossary through its own card renderer:

| Base system | Weapons renderer | Abilities renderer | Keyword storage |
|-------------|------------------|--------------------|-----------------|
| `40k-10e` | `Ds40kUnitWeapons` | `Ds40kUnitExtra` | `profile.keywords` array |
| `aos` | `DsAosWeapons` | `DsAosAbilities` | `profile.keywords` array |
| `starcraft-tmg` | `StarcraftWeaponTable` | `StarcraftAbility` | comma-separated string column whose key is `keyword`/`keywords` |

The abilities renderers scan ability descriptions for glossary entry names scoped to `"abilities"` with `displayMode: "tooltip"` and wrap each match with an underline + hover tooltip. Custom datasource cards parse ability text against the glossary **only** — the built-in 40K keyword dictionary (bracket tags, hard-coded rule/weapon keywords) is skipped for them. The shared render logic lives in `src/Components/DatasourceEditor/cards/shared/GlossaryKeywords.jsx` (`GlossaryKeywordTags`, `GlossaryExplanationRows`, `GlossaryText`).

```js
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
    matchType: "parameterized",
    appliesTo: ["weapons"],
    style: { casing: "uppercase", brackets: "square", weight: "bold" },
  },
],
```

| Property      | Type     | Description |
|---------------|----------|-------------|
| `key`         | string   | Stable storage key, unique within the glossary. |
| `name`        | string   | The keyword name as it appears on cards (e.g. `One Shot`, `Anti-`). |
| `description` | string   | Explanation text rendered by consuming renderers. |
| `matchType`   | string   | `"exact"` (default, case-insensitive equality), `"prefix"` (case-insensitive `startsWith`), or `"parameterized"` (entry name plus an optional value such as `Sustained Hits 2`, `Feel No Pain 5+`, `Melta D6+2`, or `Anti-Vehicle 4+`). |
| `appliesTo`   | string[] | **Required, non-empty.** Scopes in which the entry can render. One entry may declare multiple scopes (e.g. a `Lethal Hits` keyword that applies both to weapons and to ability-text tooltips). |
| `displayMode` | string   | Weapons-only. `"explanation"` (default) renders the description as an explanation row below the weapon table. `"tooltip"` renders the description as a hover tooltip on the inline keyword tag and skips the explanation row. Other scopes ignore this field today. |
| `style`       | object   | Optional. Per-keyword presentation of the inline keyword tag. Modelled as string enums so more options can be added later. `casing`: `"uppercase"` (default) or `"normal"`. `brackets`: `"square"` (default) or `"none"`. `weight`: `"bold"` (default) or `"normal"`. Missing or unknown values fall back to the default, so existing entries keep the original look. |

**Valid scopes** (`VALID_GLOSSARY_SCOPES`):

| Scope            | Where it renders |
|------------------|------------------|
| `weapons`        | Inline weapon keyword tags (styled + hover tooltip for `displayMode: "tooltip"`) and explanation rows below the weapon table. Rendered by `40k-10e`, `aos`, and `starcraft-tmg`. |
| `abilities`      | Inside ability descriptions — `displayMode: "tooltip"` entries get an underline + hover tooltip on each name match. Rendered by `40k-10e`, `aos`, and `starcraft-tmg`. |
| `unit-keywords`  | Tooltips on the unit-level keywords bar at the bottom of a card (future renderer). |
| `rules`          | Rule cards (future renderer). |
| `stratagems`     | Stratagem cards (future renderer). |
| `enhancements`   | Enhancement cards (future renderer). |

**Resolution rules:**

- Each keyword tag is resolved to **at most one** glossary entry within a given scope.
- A glossary entry only matters in a renderer if its `appliesTo` array contains that renderer's scope.
- When multiple in-scope entries match the same keyword, the entry with the **longest `name`** wins, so specific entries (e.g. `Power Fist`) take precedence over shorter prefixes (e.g. `Power`).
- Within a single renderer section, explanation rows are deduplicated — the same keyword across multiple weapons only renders one description block.
- Datasources with `baseSystem: "40k-10e"` created via the wizard are pre-seeded with the official 10e keyword set (`One Shot`, `Devastating Wounds`, `Sustained Hits`, `Anti-`, etc.), each scoped to `["weapons"]`. The seed lives in `src/Helpers/keywordGlossaryDefaults.js`. The schema editor also exposes a "Restore defaults" button for 40k-10e datasources.
- The Datasource Editor's premium `SchemaWeaponsEditor` uses glossary entries whose `appliesTo` includes `"weapons"` to populate an autocomplete dropdown when adding keywords to a weapon. Users can still free-type any value.

## Discriminated Union: `cardTypes`

Each entry in `cardTypes` uses a **discriminated union** on the `baseType` field. The value of `baseType` determines which fields are valid inside `schema`.

```
baseType ──┬── "unit"        → UnitSchema
            ├── "rule"        → RuleSchema
            ├── "enhancement" → EnhancementSchema
            └── "stratagem"   → StratagemSchema
```

Every `CardTypeDefinition` shares these common fields:

```js
{
  key: string,       // unique key within this datasource, e.g. "unit"
  label: string,     // human-readable label, e.g. "Infantry"
  baseType: string,  // discriminator: "unit" | "rule" | "enhancement" | "stratagem"
  schema: object,    // shape depends on baseType (see below)
}
```

The `key` becomes the `cardType` value on each card. It must match an entry in the card type to array mapping (see [custom-datasource-format.md](../custom-datasource-format.md#card-type-to-array-mapping)) so cards are placed in the correct faction array. For example, use `key: "rule"` for a card type with `baseType: "rule"`.

The `schema` object is **not** freeform. Its structure is determined by `baseType`. Editors, renderers, and validators switch on `baseType` to interpret it.

---

## BaseType: `unit`

Units are the most complex card type. They define stat profiles, weapon tables, ability categories, and metadata.

```js
{
  key: "infantry",
  label: "Infantry",
  baseType: "unit",
  schema: {
    stats: {
      label: "Stat Profiles",
      allowMultipleProfiles: true,
      fields: [
        { key: "m", label: "M", type: "string", displayOrder: 1 },
        { key: "t", label: "T", type: "string", displayOrder: 2 },
        { key: "sv", label: "SV", type: "string", displayOrder: 3 },
        { key: "w", label: "W", type: "string", displayOrder: 4 },
        { key: "ld", label: "LD", type: "string", displayOrder: 5 },
        { key: "oc", label: "OC", type: "string", displayOrder: 6 },
        // AoS example: position, color, width, special
        // { key: "type", label: "Type", type: "string", displayOrder: 7,
        //   position: "above", color: "#374151", width: "fit",
        //   special: true, specialColor: "#374151", hideWhenEmpty: false },
      ],
    },
    weaponTypes: {
      label: "Weapon Types",
      allowMultiple: true,
      types: [
        {
          key: "ranged",
          label: "Ranged Weapons",
          hasKeywords: true,
          hasProfiles: true,
          columns: [
            { key: "range", label: "Range", type: "string" },
            { key: "a", label: "A", type: "string" },
            { key: "bs", label: "BS", type: "string" },
            { key: "s", label: "S", type: "string" },
            { key: "ap", label: "AP", type: "string" },
            { key: "d", label: "D", type: "string" },
            // display: "row" example — renders as a badge row instead of a table column
            // { key: "abilities", label: "Abilities", type: "string", display: "row" },
          ],
        },
        {
          key: "melee",
          label: "Melee Weapons",
          hasKeywords: true,
          hasProfiles: true,
          columns: [
            { key: "range", label: "Range", type: "string" },
            { key: "a", label: "A", type: "string" },
            { key: "ws", label: "WS", type: "string" },
            { key: "s", label: "S", type: "string" },
            { key: "ap", label: "AP", type: "string" },
            { key: "d", label: "D", type: "string" },
          ],
        },
      ],
    },
    abilities: {
      label: "Abilities",
      categories: [
        { key: "core", label: "Core", format: "name-only" },
        { key: "faction", label: "Faction", format: "name-description", header: "Faction Abilities" },
        { key: "unit", label: "Unit Abilities", format: "name-description" },
      ],
      hasInvulnerableSave: true,
      hasDamagedAbility: true,
    },
    sections: {
      label: "Sections",
      sections: [
        { key: "transport", label: "Transport", format: "list" },
        { key: "lore", label: "Lore", format: "richtext" },
      ],
    },
    metadata: {
      hasKeywords: true,
      hasFactionKeywords: true,
      hasPoints: true,
      pointsFormat: "per-model" | "per-unit",
      bannerType: "faction" | "custom" | "hidden",
      bannerCustomText: "WARSCROLL",
    },
  },
}
```

### Unit schema sub-objects

| Sub-object    | Purpose                                                                 |
|---------------|-------------------------------------------------------------------------|
| `stats`       | Defines the stat line columns and whether multi-profile is allowed.     |
| `weaponTypes` | Defines weapon categories, each with their own column definitions.      |
| `abilities`   | Defines ability groupings and their display format.                     |
| `sections`    | Defines optional content sections (e.g. transport, lore) with format.   |
| `metadata`    | Flags for keywords, faction keywords, points, and banner configuration. |

### Weapon type properties

Each weapon type in the `weaponTypes.types` array supports these properties:

| Property      | Type    | Description                                                          |
|---------------|---------|----------------------------------------------------------------------|
| `key`         | string  | Unique identifier for this weapon type.                              |
| `label`       | string  | Display label shown as the section banner.                           |
| `hasKeywords` | boolean | Enables keyword tags on individual weapons.                          |
| `hasProfiles` | boolean | Enables multiple profiles per weapon (e.g. standard and overcharge). |
| `columns`     | array   | Column definitions for the weapon table.                             |

### Weapon column properties

Each column in a weapon type's `columns` array supports the standard field properties (`key`, `label`, `type`, `options`, `onValue`, `offValue`) plus:

| Property       | Type    | Description                                                                    |
|----------------|---------|--------------------------------------------------------------------------------|
| `display`      | string  | `"column"` (default) or `"row"`. Controls how this column is rendered.         |
| `displayLabel` | boolean | Only applies when `display` is `"row"`. When `false`, hides the label before the row values. Defaults to `true` (label shown). |
| `visual`       | string  | Only applies when `display` is `"row"`. `"text"` (default) or `"badge"`.       |

**Display values:**

| Value    | Description                                                                  |
|----------|------------------------------------------------------------------------------|
| `column` | Default. Rendered as a table column in the header and each weapon row.       |
| `row`    | Rendered as a full-width row below the table columns. Useful for keywords, special rules, or other list-like data on a weapon profile. |

**Visual values (row display only):**

| Value   | Description                                                    |
|---------|----------------------------------------------------------------|
| `text`  | Default. Values are rendered as comma-separated plain text.    |
| `badge` | Values are rendered as styled badges.                          |

### Stat field properties

Stat fields support the following types: `string`, `enum`, `boolean`. Each field can have additional properties:

| Property         | Type    | Description                                                        |
|------------------|---------|--------------------------------------------------------------------|
| `key`            | string  | Unique identifier for this stat column.                            |
| `label`          | string  | Display label.                                                     |
| `type`           | string  | `"string"`, `"enum"`, or `"boolean"`.                              |
| `displayOrder`   | number  | Controls the column ordering.                                      |
| `special`        | boolean | Marks the stat as special (rendered with distinct styling).         |
| `specialColor`   | string  | Hex colour for the special stat badge (default: `"#5b21b6"`). Only applies when `special` is true. |
| `hideWhenEmpty`  | boolean | Hides the stat column when its value is empty. Only applies when `special` is true. |
| `options`        | array   | List of allowed values. Only applies when `type` is `"enum"`.      |
| `onValue`        | string  | Display text when the value is true. Only applies when `type` is `"boolean"`. |
| `offValue`       | string  | Display text when the value is false. Only applies when `type` is `"boolean"`. |

#### AoS-specific stat properties

When `baseSystem` is not `"40k-10e"` (i.e. AoS or blank), stat fields gain additional properties:

| Property   | Type   | Description                                                    |
|------------|--------|----------------------------------------------------------------|
| `position` | string | `"left"`, `"right"`, `"above"`, or `"below"` — controls where the stat badge appears on the card. |
| `size`     | string | `"large"` (default) or `"small"` — controls the badge rendering style. Large renders the full square block; small renders the compact inline badge. When omitted, defaults to large for left/above/below and small for right. |
| `color`    | string | Hex colour for the stat badge background.                      |
| `width`    | string | `"fixed"` (default) or `"fit"` — when `"fit"`, the badge expands to fit its content instead of using a fixed width. Only applies to `type: "string"` fields. |

**Position values:**

| Position | Renders                                                                 |
|----------|-------------------------------------------------------------------------|
| `left`   | Default. Stat badges in the top-left overlay grid.                      |
| `right`  | Header badges in the top-right corner (only shown when value is set).   |
| `above`  | Centered row inside the header, above the unit name. Pushes the name down. |
| `below`  | Centered row between the header and the card body.                      |

### Ability category properties

Each ability category supports these properties:

| Property  | Type    | Description                                                          |
|-----------|---------|----------------------------------------------------------------------|
| `key`     | string  | Unique identifier for this category.                                 |
| `label`   | string  | Display label.                                                       |
| `format`  | string  | `"name-only"` or `"name-description"`. When `"name-only"`, the ability text body is not rendered (AoS). |
| `layout`  | string  | `"full"` (default), `"half"`, `"third"`, or `"quarter"`. Controls how many abilities appear per row. |
| `header`  | string  | Optional header text displayed above the category.                   |

**Layout values:**

| Value     | Description                                        |
|-----------|----------------------------------------------------|
| `full`    | Default. One ability per row (full width).          |
| `half`    | Two abilities per row (50% width each).             |
| `third`   | Three abilities per row (33% width each).           |
| `quarter` | Four abilities per row (25% width each).            |

#### AoS-specific ability properties

When `baseSystem` is not `"40k-10e"`, ability categories gain additional toggles:

| Property   | Type    | Description                                                  |
|------------|---------|--------------------------------------------------------------|
| `hasPhase` | boolean | Enables a phase text field on each ability in this category. Phase text appears as a tag above the ability. |
| `hasColor` | boolean | Enables a per-ability banner colour on the ability name strip. When set, each ability can define a `color` hex value. |

#### Starcraft TMG-specific ability properties

When `baseSystem` is `"starcraft-tmg"`, ability categories gain these additional toggles
(additive; default-false; ignored by other systems):

| Property         | Type    | Description                                                                                                   |
|------------------|---------|---------------------------------------------------------------------------------------------------------------|
| `hasType`        | boolean | Render a `PASSIVE` / `ACTIVE` / `REACTION` pill from `ability.type`.                                          |
| `hasCost`        | boolean | Render cost chips from `ability.costs = [{ amount, unit }]`. Known units: `CP` (green), `BM` (blue), `VP` (purple), `PE` (Protoss gold). |
| `hasTriggerIcon` | boolean | Render an up-arrow glyph before the ability name when `ability.triggered === true`.                          |
| `phaseStyle`     | string  | Phase icon in the section heading: `"movement"`, `"assault"`, `"combat"`, or `"special"`.                    |

### Sections

Sections are optional content blocks rendered below weapons on unit cards. Each section has a key, label, and format.

| Property | Type   | Description                                          |
|----------|--------|------------------------------------------------------|
| `key`    | string | Unique identifier for this section.                  |
| `label`  | string | Display label.                                       |
| `format` | string | `"list"` (bullet list of items), `"richtext"` (freeform HTML/markup), or `"modelsSupplyTiers"` (Starcraft TMG — tiered `[{ models, supply }, …]` rows rendered natively in the header). |

### Metadata properties

| Property           | Type   | Description                                                              |
|--------------------|--------|--------------------------------------------------------------------------|
| `hasKeywords`      | boolean | Include a keywords bar at the bottom of the card.                       |
| `keywordsLabel`    | string  | Optional. Override the keywords bar label (defaults to `"Keywords"`).  |
| `hasFactionKeywords` | boolean | Include a faction keywords bar at the bottom of the card.            |
| `factionKeywordsLabel` | string | Optional. Override the faction keywords bar label (defaults to `"Faction"`). |
| `hasPoints`        | boolean | Include a points cost field on the card.                                |
| `pointsFormat`     | string  | `"per-model"` or `"per-unit"`. Only applies when `hasPoints` is true.  |
| `bannerType`       | string  | Controls the header banner text. Only applies when `baseSystem` is not `"40k-10e"`. |
| `bannerCustomText` | string  | Custom banner text. Only applies when `bannerType` is `"custom"`.       |
| `hasAutoResize`    | boolean | Starcraft TMG and 40k-10e only. Exposes a per-card "Auto-resize card" toggle in the Basic Information panel. When the card sets `styling.autoHeight = true`, the rendered card grows beyond its standard 714px frame to fit overflowing content. |

#### Banner type values (AoS / non-40k only)

| Value    | Description                                                          |
|----------|----------------------------------------------------------------------|
| `faction` | Default. Shows "• FACTION NAME WARSCROLL •" in the header banner.  |
| `custom` | Shows the text defined in `bannerCustomText`.                        |
| `hidden` | Hides the banner entirely.                                           |

---

## BaseType: `rule`

Rules are simpler cards that describe game rules, faction rules, or other textual rule blocks. They define top-level fields for the rule itself, and a repeatable `rules` collection for sub-rules.

```js
{
  key: "battle-rules",
  label: "Battle Rules",
  baseType: "rule",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "ruleType", label: "Rule Type", type: "string" },
      { key: "description", label: "Description", type: "richtext" },
    ],
    rules: {
      label: "Rules",
      allowMultiple: true,
      fields: [
        { key: "title", label: "Title", type: "string" },
        { key: "description", label: "Description", type: "richtext" },
        { key: "format", label: "Format", type: "enum", options: ["name-description", "name-only", "table"] },
      ],
    },
  },
}
```

---

## BaseType: `enhancement`

Enhancements are upgrades that can be applied to units. They have a cost, a descriptive effect, and a set of keywords that define eligibility or categorisation.

```js
{
  key: "warlord-trait",
  label: "Warlord Trait",
  baseType: "enhancement",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "cost", label: "Cost", type: "string" },
      { key: "description", label: "Description", type: "richtext" },
    ],
    keywords: {
      label: "Keywords",
      allowMultiple: true,
      fields: [
        { key: "keyword", label: "Keyword", type: "string" },
      ],
    },
  },
}
```

---

## BaseType: `stratagem`

Stratagems are tactical abilities used during specific phases of the game. They carry a cost, a phase restriction, and a descriptive effect.

```js
{
  key: "battle-tactic",
  label: "Battle Tactic",
  baseType: "stratagem",
  schema: {
    fields: [
      { key: "name", label: "Name", type: "string" },
      { key: "cost", label: "Cost", type: "string" },
      { key: "phase", label: "Phase", type: "enum", options: [
        "command", "movement", "shooting", "charge", "fight", "any"
      ]},
      { key: "type", label: "Stratagem Type", type: "string" },
      { key: "description", label: "Description", type: "richtext" },
    ],
  },
}
```

---

## Field Type Reference

These are the valid values for `type` on field definitions:

| Type       | Description                                                        | Available in                  |
|------------|--------------------------------------------------------------------|------------------------------ |
| `string`   | Plain text value.                                                  | Stats, Weapons, Fields        |
| `richtext` | Formatted text (HTML, depending on renderer).                      | Fields only                   |
| `enum`     | Constrained to one of the values listed in `options`.              | Stats, Weapons, Fields        |
| `boolean`  | True/false toggle. Stat booleans support `onValue`/`offValue`.     | Stats, Weapons, Fields        |

Note: `richtext` is not available in stat or weapon column definitions — only in top-level fields (rule, enhancement, stratagem card types).

### Section Format Reference

| Format     | Description                                          |
|------------|------------------------------------------------------|
| `list`     | Renders as a bullet list of items.                   |
| `richtext` | Renders as freeform HTML/markup content.             |

### Ability Format Reference

| Format             | Description                                      |
|--------------------|--------------------------------------------------|
| `name-only`        | Displays only the ability name (e.g. core abilities). |
| `name-description` | Displays both name and description text.         |

---

## Design Decisions

### Why a discriminated union?

Each `baseType` has fundamentally different data requirements. A unit card has stat lines, weapon tables, and ability groups. A stratagem has a phase and a cost. Forcing them into a single generic shape would either be too restrictive for complex types or too loose for simple ones. The discriminated union lets each type define exactly the fields it needs while sharing a common envelope (`key`, `label`, `baseType`).

### Schema describes shape, not content

The `schema` object defines **what fields exist and their types**. It does not contain actual card data. Card data lives in a separate data layer that conforms to the schema. This separation means:

- A single schema can validate many cards.
- Schema changes can be versioned independently of data.
- Editors and renderers can be built generically from schema definitions.

### Named sub-objects vs generic `fields[]`

The `unit` type uses named sub-objects (`stats`, `weaponTypes`, `abilities`, `metadata`) because its structure is deeply nested and each section has unique configuration (e.g. `allowMultipleProfiles`, `hasInvulnerableSave`). Simpler types like `rule`, `enhancement`, and `stratagem` use a flat `fields[]` array because their structure is straightforward.

Consumers should handle both patterns:
- If `schema` contains known sub-objects (`stats`, `weaponTypes`, etc.), use type-specific rendering.
- If `schema` contains a `fields[]` array, use generic field rendering.

This is an intentional trade-off: clarity and expressiveness for complex types, simplicity for straightforward ones.
