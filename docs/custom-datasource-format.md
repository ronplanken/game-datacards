---
title: Custom Datasource Format
description: JSON format for custom datasources created through the Datasource Editor
category: data-formats
tags: [datasource, json, import, export, validation, schema]
related:
  - card-data-formats.md
  - custom datasource/datasource-schema-architecture.md
file_locations:
  validator: src/Helpers/customDatasource.helpers.js
  schema_helpers: src/Helpers/customSchema.helpers.js
  storage: src/Hooks/useDataSourceStorage.jsx
  editor: src/Pages/DatasourceEditor.jsx
---

# Custom Datasource Format

Custom datasources are created through the Datasource Editor (`/datasources`). Each datasource is a JSON file containing card data grouped by faction, and optionally a schema that defines the card structure.

For schema definitions, see [datasource-schema-architecture.md](custom%20datasource/datasource-schema-architecture.md).

## Table of Contents

- [Importing](#importing)
- [Top-Level Structure](#top-level-structure)
- [Faction Object](#faction-object)
- [Card Type to Array Mapping](#card-type-to-array-mapping)
- [Common Card Fields](#common-card-fields)
- [Card Data by Base Type](#card-data-by-base-type)
  - [Unit Cards](#unit-cards)
  - [Rule Cards](#rule-cards)
  - [Enhancement Cards](#enhancement-cards)
  - [Stratagem Cards](#stratagem-cards)
- [Schema Object](#schema-object)
- [Validation Rules](#validation-rules)
- [Hosting and Updates](#hosting-and-updates)
- [Examples](#examples)

## Importing

- **File upload** -- Upload a `.json` file through Settings > Custom Datasources > Add. Local imports cannot check for updates.
- **URL import** -- Provide a URL to a hosted JSON file. The app stores the URL and supports version-based update checking.

## Top-Level Structure

```json
{
  "name": "My Datasource",
  "version": "1.0.0",
  "author": "Author Name",
  "lastUpdated": "2026-03-16T00:00:00.000Z",
  "schema": {},
  "data": []
}
```

| Field         | Type   | Required | Description |
|---------------|--------|----------|-------------|
| `name`        | string | Yes      | Display name (max 200 characters) |
| `version`     | string | Yes      | Semver version string (max 50 characters) |
| `author`      | string | No       | Author name |
| `lastUpdated` | string | No       | ISO 8601 timestamp |
| `schema`      | object | No       | Schema definition (see [Schema Object](#schema-object)) |
| `data`        | array  | Yes      | Array of faction objects (1 to 10 factions) |

## Faction Object

Each entry in `data` is a faction containing metadata and typed card arrays.

```json
{
  "id": "my-faction",
  "name": "My Faction",
  "colours": {
    "header": "#1a1a2e",
    "banner": "#16213e"
  },
  "datasheets": [],
  "stratagems": [],
  "enhancements": [],
  "rules": []
}
```

| Field            | Type   | Required | Description |
|------------------|--------|----------|-------------|
| `id`             | string | Yes      | Unique faction identifier |
| `name`           | string | Yes      | Faction display name |
| `colours.header` | string | Yes      | Hex colour for card headers |
| `colours.banner` | string | Yes      | Hex colour for card accent/banners |
| `datasheets`     | array  | No       | Cards with `baseType: "unit"` |
| `stratagems`     | array  | No       | Cards with `baseType: "stratagem"` |
| `enhancements`   | array  | No       | Cards with `baseType: "enhancement"` |
| `rules`          | array  | No       | Cards with `baseType: "rule"` |

## Card Type to Array Mapping

Each card has a `cardType` field that determines which faction array it belongs to.

| `cardType` value | Target array         |
|------------------|----------------------|
| `datasheet`      | `datasheets`         |
| `DataCard`       | `datasheets`         |
| `ganger`         | `datasheets`         |
| `vehicle`        | `datasheets`         |
| `stratagem`      | `stratagems`         |
| `enhancement`    | `enhancements`       |
| `rule`           | `rules`              |
| `warscroll`      | `warscrolls`         |
| `spell`          | `manifestationLores` |
| *(anything else)*| `datasheets`         |

When defining card types in a schema, choose a `key` that matches this table so cards end up in the correct array. For example, a card type with `baseType: "rule"` should use `key: "rule"` so its cards are placed in the `rules` array.

## Common Card Fields

Every card requires these fields regardless of its base type.

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| `id`         | string | Yes      | Unique card identifier (UUID recommended) |
| `name`       | string | Yes      | Card display name (max 10,000 characters) |
| `cardType`   | string | Yes      | Must match a card type `key` from the schema |
| `source`     | string | Yes      | Datasource name, used for renderer selection |
| `faction_id` | string | Yes      | Must match the parent faction's `id` |

## Card Data by Base Type

The remaining fields on a card depend on its `baseType` as defined in the schema.

### Unit Cards

`baseType: "unit"` -- stored in the `datasheets` array.

```json
{
  "id": "uuid",
  "name": "Unit Name",
  "cardType": "unit",
  "source": "my-datasource-id",
  "faction_id": "my-faction-id",
  "stats": [
    {
      "name": "Model Name",
      "m": "4",
      "ws": "4",
      "bs": "3",
      "s": "4",
      "t": "4",
      "w": "1"
    }
  ],
  "weapons": {
    "melee": [
      {
        "name": "Hand Weapon",
        "range": "Combat",
        "strength": "As User",
        "ap": "-",
        "specialRules": "-"
      }
    ],
    "ranged": []
  },
  "abilities": {
    "special-rules": [
      {
        "name": "Ability Name",
        "description": "Ability description text.",
        "showAbility": true
      }
    ]
  },
  "sections": {},
  "keywords": ["Infantry"],
  "factionKeywords": ["My Faction"],
  "points": [
    { "models": 5, "cost": 60, "active": true }
  ]
}
```

| Field            | Description |
|------------------|-------------|
| `stats`          | Array of stat profile objects. Keys match the schema's `stats.fields[].key` values. |
| `weapons`        | Object keyed by weapon type key (from `schema.weaponTypes.types[].key`). Each value is an array of weapon objects whose fields match the weapon type's `columns[].key` values. |
| `abilities`      | Object keyed by ability category key (from `schema.abilities.categories[].key`). Each value is an array of `{ name, description, showAbility }` objects. A legacy flat array format (`[{ category, name, description }]`) is also accepted and converted to nested object format on edit. |
| `sections`       | Object keyed by section key (from `schema.sections.sections[].key`). Each value is an array of items. |
| `keywords`       | Array of keyword strings. Present when `schema.metadata.hasKeywords` is true. |
| `factionKeywords`| Array of faction keyword strings. Present when `schema.metadata.hasFactionKeywords` is true. |
| `points`         | Array of `{ models, cost, active }` objects. Present when `schema.metadata.hasPoints` is true. |

### Rule Cards

`baseType: "rule"` -- stored in the `rules` array.

```json
{
  "id": "uuid",
  "name": "Rule Name",
  "cardType": "rule",
  "source": "my-datasource-id",
  "faction_id": "my-faction-id",
  "fields": {
    "name": "Rule Name",
    "ruleType": "Category",
    "description": "Rule description text."
  },
  "rules": []
}
```

| Field    | Description |
|----------|-------------|
| `fields` | Object with keys matching `schema.fields[].key`. Values are strings or rich text. |
| `rules`  | Array of sub-rule objects. Present when the schema defines a `rules` collection. Each sub-rule has keys matching `schema.rules.fields[].key`. |

### Enhancement Cards

`baseType: "enhancement"` -- stored in the `enhancements` array.

```json
{
  "id": "uuid",
  "name": "Enhancement Name",
  "cardType": "enhancement",
  "source": "my-datasource-id",
  "faction_id": "my-faction-id",
  "fields": {
    "name": "Enhancement Name",
    "cost": "25",
    "description": "Enhancement description text."
  },
  "keywords": ["Keyword1", "Keyword2"]
}
```

| Field      | Description |
|------------|-------------|
| `fields`   | Object with keys matching `schema.fields[].key`. |
| `keywords` | Array of keyword strings. Present when the schema defines a `keywords` collection. |

### Stratagem Cards

`baseType: "stratagem"` -- stored in the `stratagems` array.

```json
{
  "id": "uuid",
  "name": "Stratagem Name",
  "cardType": "stratagem",
  "source": "my-datasource-id",
  "faction_id": "my-faction-id",
  "fields": {
    "name": "Stratagem Name",
    "cost": "1",
    "phase": "command",
    "type": "Battle Tactic",
    "description": "Stratagem description text."
  }
}
```

| Field    | Description |
|----------|-------------|
| `fields` | Object with keys matching `schema.fields[].key`. |

## Schema Object

The `schema` field is optional. When present, the Datasource Editor uses it for structured card editing and rendering.

```json
{
  "version": "1.0.0",
  "baseSystem": "40k-10e",
  "colours": {
    "header": "#1a1a2e",
    "banner": "#16213e"
  },
  "cardTypes": []
}
```

| Field        | Type   | Description |
|--------------|--------|-------------|
| `version`    | string | Schema version |
| `baseSystem` | string | `"40k-10e"`, `"aos"`, or `"blank"` -- determines available editor features |
| `colours`    | object | Default faction colours (`header` and `banner` hex values) |
| `cardTypes`  | array  | Card type definitions (see [datasource-schema-architecture.md](custom%20datasource/datasource-schema-architecture.md)) |

## Validation Rules

The following limits are enforced during import:

| Limit | Value |
|-------|-------|
| Datasource name length | max 200 characters |
| Version string length | max 50 characters |
| Number of factions | 1 to 10 |
| Total cards across all factions | max 2,000 |
| Individual string field length | max 10,000 characters |

Required structure:
- `name` must be a non-empty string
- `version` must be a non-empty string
- `data` must be a non-empty array
- Each faction must have `id` (string), `name` (string), and `colours` with both `header` and `banner` fields
- If `schema` is present, it is validated separately (see [datasource-schema-architecture.md](custom%20datasource/datasource-schema-architecture.md))

## Hosting and Updates

### URL-Based Datasources

When imported via URL, the app stores the source URL and supports update checking:

1. The app fetches the URL and compares the `version` field using semver
2. If the remote version is newer, the user is prompted to apply the update
3. The `id` field is used to match datasources across updates

### CORS Requirements

Hosted JSON files must allow cross-origin requests. The server needs:

```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

Compatible hosts: GitHub raw files, GitHub Pages, any static host with CORS headers.

## Examples

### Minimal Valid Datasource

```json
{
  "name": "My Datasource",
  "version": "1.0.0",
  "data": [
    {
      "id": "my-faction",
      "name": "My Faction",
      "colours": {
        "header": "#1a1a2e",
        "banner": "#16213e"
      }
    }
  ]
}
```

### Datasource With Schema and Cards

```json
{
  "name": "The Old World - Chaos Dwarfs",
  "version": "1.0.0",
  "author": "Game Datacards",
  "lastUpdated": "2026-03-16T00:00:00.000Z",
  "data": [
    {
      "id": "chaos-dwarfs",
      "name": "Chaos Dwarfs",
      "colours": {
        "header": "#2d1b0e",
        "banner": "#8b4513"
      },
      "datasheets": [
        {
          "id": "4ebad77f-17e5-544a-bd04-16627bc8d3b2",
          "name": "Black Orc Mob",
          "cardType": "unit",
          "source": "The Old World - Chaos Dwarfs",
          "faction_id": "chaos-dwarfs",
          "stats": [
            {
              "name": "Black orc",
              "m": "4",
              "ws": "4",
              "bs": "3",
              "s": "4",
              "t": "4",
              "w": "1"
            }
          ],
          "weapons": {
            "melee": [
              {
                "name": "Hand Weapon",
                "range": "Combat",
                "strength": "As User",
                "ap": "-",
                "specialRules": "-"
              }
            ],
            "ranged": []
          },
          "abilities": {
            "special-rules": [
              {
                "name": "Choppas",
                "description": "Re-roll To Wound rolls of 1 on the turn this unit charged.",
                "showAbility": true
              }
            ]
          },
          "keywords": ["Core", "Heavy Infantry"],
          "factionKeywords": ["Chaos Dwarfs"],
          "points": [{ "models": 5, "cost": 60, "active": true }]
        }
      ],
      "rules": [
        {
          "id": "2bdb4315-3fc1-5d4c-8c61-1b9c9811b32e",
          "name": "Backstab",
          "cardType": "rule",
          "source": "The Old World - Chaos Dwarfs",
          "faction_id": "chaos-dwarfs",
          "fields": {
            "name": "Backstab",
            "ruleType": "Chaos Dwarfs",
            "description": "Re-roll failed To Hit rolls when engaged in the flank or rear."
          },
          "rules": []
        }
      ]
    }
  ],
  "schema": {
    "version": "1.0.0",
    "baseSystem": "blank",
    "colours": {
      "header": "#2d1b0e",
      "banner": "#8b4513"
    },
    "cardTypes": [
      {
        "key": "unit",
        "label": "Unit",
        "baseType": "unit",
        "schema": {
          "stats": {
            "label": "Stat Profiles",
            "allowMultipleProfiles": true,
            "fields": [
              { "key": "m", "label": "M", "type": "string", "displayOrder": 1 },
              { "key": "ws", "label": "WS", "type": "string", "displayOrder": 2 },
              { "key": "bs", "label": "BS", "type": "string", "displayOrder": 3 },
              { "key": "s", "label": "S", "type": "string", "displayOrder": 4 },
              { "key": "t", "label": "T", "type": "string", "displayOrder": 5 },
              { "key": "w", "label": "W", "type": "string", "displayOrder": 6 }
            ]
          },
          "weaponTypes": {
            "label": "Weapon Types",
            "types": [
              {
                "key": "melee",
                "label": "Melee Weapons",
                "columns": [
                  { "key": "range", "label": "Range", "type": "string" },
                  { "key": "strength", "label": "Strength", "type": "string" },
                  { "key": "ap", "label": "AP", "type": "string" },
                  { "key": "specialRules", "label": "Special Rules", "type": "string" }
                ]
              },
              {
                "key": "ranged",
                "label": "Ranged Weapons",
                "columns": [
                  { "key": "range", "label": "Range", "type": "string" },
                  { "key": "strength", "label": "Strength", "type": "string" },
                  { "key": "ap", "label": "AP", "type": "string" },
                  { "key": "specialRules", "label": "Special Rules", "type": "string" }
                ]
              }
            ]
          },
          "abilities": {
            "label": "Abilities",
            "categories": [
              { "key": "special-rules", "label": "Special Rules", "format": "name-description" }
            ]
          },
          "metadata": {
            "hasKeywords": true,
            "hasFactionKeywords": true,
            "hasPoints": true,
            "pointsFormat": "per-model"
          }
        }
      },
      {
        "key": "rule",
        "label": "Special Rule",
        "baseType": "rule",
        "schema": {
          "fields": [
            { "key": "name", "label": "Name", "type": "string" },
            { "key": "ruleType", "label": "Rule Type", "type": "string" },
            { "key": "description", "label": "Description", "type": "richtext" }
          ],
          "rules": {
            "label": "Rules",
            "allowMultiple": true,
            "fields": [
              { "key": "title", "label": "Title", "type": "string" },
              { "key": "description", "label": "Description", "type": "richtext" }
            ]
          }
        }
      }
    ]
  }
}
```

Note that the card type key `"rule"` maps to the `rules` faction array and `"unit"` defaults to `datasheets`. Choose card type keys that match the [Card Type to Array Mapping](#card-type-to-array-mapping) so cards are placed in the correct array.
