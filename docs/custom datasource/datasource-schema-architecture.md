# Custom Datasource Schema Architecture

## Overview

A custom datasource defines the structure and format of cards for a game system. It does **not** contain card data itself -- it describes the **shape** of the data that cards of each type will hold.

## Root Schema

```js
{
  name: string,            // e.g. "Warhammer 40K 10th Edition"
  version: string,         // e.g. "1.2.0"
  id: string,              // unique identifier
  author: string,
  lastUpdated: string,     // ISO 8601 date
  schema: {
    version: "1.0.0",
    baseSystem: "40k-10e" | "aos" | "blank",
    colours: {
      header: string,      // hex colour for card headers (default: "#1a1a2e")
      banner: string,      // hex colour for card banners (default: "#16213e")
    },
    cardTypes: [CardTypeDefinition],
  },
}
```

### Datasource Colours

Colours are defined at the schema level and automatically propagated to every faction's `colours` object when edited. They control the visual theming of card headers and banners. The `DatasourceMetadataEditor` exposes these as "Main" (header) and "Accent" (banner) colour pickers.

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
  key: string,       // unique key within this datasource, e.g. "infantry"
  label: string,     // human-readable label, e.g. "Infantry"
  baseType: string,  // discriminator: "unit" | "rule" | "enhancement" | "stratagem"
  schema: object,    // shape depends on baseType (see below)
}
```

The `schema` object is **not** freeform. Its allowed structure is strictly determined by `baseType`. Consumers of this schema (editors, renderers, validators) should switch on `baseType` to determine how to interpret `schema`.

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
| `metadata`    | Flags for keywords, faction keywords, and points configuration.         |

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
| `position` | string | `"left"` or `"right"` — controls which side of the card the stat badge appears on. |
| `color`    | string | Hex colour for the stat badge background.                      |

### Ability category properties

Each ability category supports these properties:

| Property  | Type    | Description                                                          |
|-----------|---------|----------------------------------------------------------------------|
| `key`     | string  | Unique identifier for this category.                                 |
| `label`   | string  | Display label.                                                       |
| `format`  | string  | `"name-only"` or `"name-description"`.                               |
| `header`  | string  | Optional header text displayed above the category.                   |

#### AoS-specific ability properties

When `baseSystem` is not `"40k-10e"`, ability categories gain additional toggles:

| Property   | Type    | Description                                                  |
|------------|---------|--------------------------------------------------------------|
| `hasPhase` | boolean | Enables a phase text field on each ability in this category. |
| `hasColor` | boolean | Enables a colour strip on each ability in this category.     |

### Sections

Sections are optional content blocks rendered below weapons on unit cards. Each section has a key, label, and format.

| Property | Type   | Description                                          |
|----------|--------|------------------------------------------------------|
| `key`    | string | Unique identifier for this section.                  |
| `label`  | string | Display label.                                       |
| `format` | string | `"list"` (bullet list of items) or `"richtext"` (freeform HTML/markup). |

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
