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
    cardTypes: [CardTypeDefinition],
  },
}
```

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
            { key: "range", label: "Range", type: "string", required: true },
            { key: "a", label: "A", type: "string", required: true },
            { key: "bs", label: "BS", type: "string", required: true },
            { key: "s", label: "S", type: "string", required: true },
            { key: "ap", label: "AP", type: "string", required: true },
            { key: "d", label: "D", type: "string", required: true },
          ],
        },
        {
          key: "melee",
          label: "Melee Weapons",
          hasKeywords: true,
          hasProfiles: true,
          columns: [
            { key: "range", label: "Range", type: "string", required: true },
            { key: "a", label: "A", type: "string", required: true },
            { key: "ws", label: "WS", type: "string", required: true },
            { key: "s", label: "S", type: "string", required: true },
            { key: "ap", label: "AP", type: "string", required: true },
            { key: "d", label: "D", type: "string", required: true },
          ],
        },
      ],
    },
    abilities: {
      label: "Abilities",
      categories: [
        { key: "core", label: "Core", format: "name-only" },
        { key: "faction", label: "Faction", format: "name-description" },
        { key: "unit", label: "Unit Abilities", format: "name-description" },
      ],
      hasInvulnerableSave: true,
      hasDamagedAbility: true,
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
| `metadata`    | Flags for keywords, faction keywords, and points configuration.         |

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
      { key: "name", label: "Name", type: "string", required: true },
      { key: "ruleType", label: "Rule Type", type: "string", required: true },
      { key: "description", label: "Description", type: "richtext", required: false },
    ],
    rules: {
      label: "Rules",
      allowMultiple: true,
      fields: [
        { key: "title", label: "Title", type: "string", required: true },
        { key: "description", label: "Description", type: "richtext", required: true },
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
      { key: "name", label: "Name", type: "string", required: true },
      { key: "cost", label: "Cost", type: "string", required: true },
      { key: "description", label: "Description", type: "richtext", required: true },
    ],
    keywords: {
      label: "Keywords",
      allowMultiple: true,
      fields: [
        { key: "keyword", label: "Keyword", type: "string", required: true },
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
      { key: "name", label: "Name", type: "string", required: true },
      { key: "cost", label: "Cost", type: "string", required: true },
      { key: "phase", label: "Phase", type: "enum", required: true, options: [
        "command", "movement", "shooting", "charge", "fight", "any"
      ]},
      { key: "type", label: "Stratagem Type", type: "string", required: true },
      { key: "description", label: "Description", type: "richtext", required: true },
    ],
  },
}
```

---

## Field Type Reference

These are the valid values for `type` on any field definition:

| Type       | Description                                                        |
|------------|--------------------------------------------------------------------|
| `string`   | Plain text value.                                                  |
| `richtext` | Formatted text (markdown or HTML, depending on renderer).          |
| `enum`     | Constrained to one of the values listed in `options`.              |
| `boolean`  | True/false flag.                                                   |

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
