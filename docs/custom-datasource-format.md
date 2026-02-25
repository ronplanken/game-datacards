# Custom Datasource Format

This document describes the JSON format for custom datasources in Game Datacards. Custom datasources allow you to create and share your own card collections that can be imported into the app.

## Importing a Custom Datasource

There are two ways to import a custom datasource:

- **URL import**: Provide a URL to a hosted JSON file. URL-based datasources support automatic update checking via version comparison.
- **File upload**: Upload a `.json` file from your computer. Local files cannot be updated automatically.

## Supported Game Systems

Each card in a datasource specifies its game system via the `source` field. The following systems are supported:

| Source value  | Game system                    |
|---------------|--------------------------------|
| `40k-10e`     | Warhammer 40,000 10th Edition  |
| `40k`         | Warhammer 40,000 9th Edition   |
| `aos`         | Age of Sigmar                  |
| `necromunda`  | Necromunda                     |
| `basic`       | Basic/custom cards (9th style) |

A single datasource can contain cards from different game systems. Each card is rendered using the renderer matching its `source` field.

## Top-Level Datasource Structure

```json
{
  "name": "My Custom Army",
  "version": "1.0.0",
  "id": "my-custom-army",
  "author": "Your Name",
  "lastUpdated": "2025-01-15T12:00:00.000Z",
  "data": []
}
```

| Field         | Type   | Required | Description |
|---------------|--------|----------|-------------|
| `name`        | string | Yes      | Display name for the datasource (max 200 characters) |
| `version`     | string | Yes      | Version string, semver recommended (max 50 characters) |
| `id`          | string | No       | Slug identifier used for update matching (e.g., `my-custom-army`) |
| `author`      | string | No       | Author name |
| `lastUpdated` | string | No       | ISO 8601 date string |
| `data`        | array  | Yes      | Array of faction objects (at least one, max 10) |

## Faction Object Structure

Each entry in the `data` array is a faction object containing metadata and arrays of cards.

```json
{
  "id": "my-faction",
  "name": "My Faction",
  "colours": {
    "header": "#1a1a1a",
    "banner": "#4a4a4a"
  },
  "datasheets": [],
  "stratagems": [],
  "enhancements": [],
  "warscrolls": [],
  "manifestationLores": [],
  "psychicpowers": [],
  "secondaries": [],
  "rules": []
}
```

| Field              | Type   | Required | Description |
|--------------------|--------|----------|-------------|
| `id`               | string | Yes      | Faction identifier |
| `name`             | string | Yes      | Faction display name |
| `colours.header`   | string | Yes      | Hex colour for card headers (e.g., `#1a1a1a`) |
| `colours.banner`   | string | Yes      | Hex colour for card banners (e.g., `#4a4a4a`) |
| `datasheets`       | array  | No       | Datasheet cards (40k 9th/10th, basic, necromunda gangers/vehicles) |
| `stratagems`       | array  | No       | Stratagem cards |
| `enhancements`     | array  | No       | Enhancement cards (40k 10th) |
| `warscrolls`       | array  | No       | Warscroll cards (Age of Sigmar) |
| `manifestationLores` | array | No     | Manifestation/spell cards (Age of Sigmar) |
| `psychicpowers`    | array  | No       | Psychic power cards (40k 9th) |
| `secondaries`      | array  | No       | Secondary objective cards (40k 9th) |
| `rules`            | array  | No       | Rule cards |

## Card Type to Array Mapping

Each card has a `cardType` field that determines which faction array it belongs to during import and export.

| `cardType` value | Target array       | Description |
|------------------|--------------------|-------------|
| `DataCard`       | `datasheets`       | Generic datasheet |
| `datasheet`      | `datasheets`       | 40k datasheet |
| `ganger`         | `datasheets`       | Necromunda fighter |
| `vehicle`        | `datasheets`       | Necromunda vehicle |
| `stratagem`      | `stratagems`       | Stratagem card |
| `enhancement`    | `enhancements`     | Enhancement card |
| `warscroll`      | `warscrolls`       | Age of Sigmar warscroll |
| `spell`          | `manifestationLores` | Age of Sigmar spell |
| `psychic`        | `psychicpowers`    | Psychic power (9th) |
| `secondary`      | `secondaries`      | Secondary objective (9th) |
| `rule`           | `rules`            | Rule card |

## Card Types by Game System

### Warhammer 40k 10th Edition (`source: "40k-10e"`)

#### Datasheets

```json
{
  "name": "Intercessor Squad",
  "subname": "",
  "id": 1,
  "faction_id": "my-faction",
  "cardType": "DataCard",
  "source": "40k-10e",
  "variant": "full",
  "print_side": "front",
  "legends": false,
  "stats": [
    {
      "name": "",
      "active": true,
      "showName": false,
      "showDamagedMarker": false,
      "m": "6\"",
      "t": "4",
      "sv": "3+",
      "w": "2",
      "ld": "6+",
      "oc": "2"
    }
  ],
  "rangedWeapons": [
    {
      "profiles": [
        {
          "active": true,
          "name": "Bolt rifle",
          "range": "24\"",
          "attacks": "2",
          "skill": "3+",
          "strength": "4",
          "ap": "-1",
          "damage": "1",
          "keywords": ["Assault", "Heavy"]
        }
      ],
      "abilities": []
    }
  ],
  "meleeWeapons": [
    {
      "profiles": [
        {
          "active": true,
          "name": "Close combat weapon",
          "range": "Melee",
          "attacks": "3",
          "skill": "3+",
          "strength": "4",
          "ap": "0",
          "damage": "1",
          "keywords": []
        }
      ],
      "abilities": []
    }
  ],
  "abilities": {
    "core": ["Scouts 6\""],
    "faction": ["Oath of Moment"],
    "other": [
      {
        "name": "Ability Name",
        "showAbility": true,
        "showDescription": true,
        "description": "Ability description text."
      }
    ],
    "wargear": [
      {
        "name": "Wargear Ability",
        "showAbility": true,
        "showDescription": true,
        "description": "Description text."
      }
    ],
    "special": [],
    "invul": {
      "showInvulnerableSave": false,
      "showAtTop": false,
      "showInfo": false,
      "value": "4+",
      "info": ""
    },
    "damaged": {
      "showDamagedAbility": false,
      "showDescription": true,
      "range": "1-4 wounds remaining",
      "description": ""
    },
    "primarch": [
      {
        "showAbility": false,
        "name": "Primarch Ability",
        "abilities": [
          {
            "name": "Sub-ability",
            "showAbility": true,
            "showDescription": true,
            "description": "Description."
          }
        ]
      }
    ]
  },
  "keywords": ["Infantry", "Battleline", "Intercessor Squad"],
  "factions": ["Adeptus Astartes"],
  "points": [
    {
      "active": true,
      "primary": true,
      "models": "5",
      "cost": "90"
    },
    {
      "active": true,
      "primary": false,
      "models": "10",
      "cost": "180"
    }
  ],
  "composition": ["5-10 Intercessors"],
  "loadout": "Every model is equipped with: bolt rifle; close combat weapon.",
  "wargear": ["Any number of models can replace bolt rifle with auto bolt rifle."],
  "transport": "",
  "leads": {
    "units": ["Assault Intercessor Squad"],
    "extra": ""
  },
  "leadBy": ["Captain"]
}
```

**Key fields:**

| Field | Description |
|-------|-------------|
| `stats` | Array of stat line objects. Each has `m`, `t`, `sv`, `w`, `ld`, `oc`. |
| `rangedWeapons` | Array of weapon groups, each with a `profiles` array. Profile fields: `name`, `range`, `attacks`, `skill` (BS), `strength`, `ap`, `damage`, `keywords`. |
| `meleeWeapons` | Same structure as `rangedWeapons`. `skill` represents WS for melee. |
| `abilities.core` | Array of core ability name strings. |
| `abilities.faction` | Array of faction ability name strings. |
| `abilities.other` | Array of ability objects (`name`, `description`, `showAbility`, `showDescription`). |
| `abilities.wargear` | Array of wargear ability objects (same shape as `other`). |
| `abilities.special` | Array of special ability objects (same shape as `other`). |
| `abilities.invul` | Invulnerable save config. |
| `abilities.damaged` | Damaged profile config. |
| `abilities.primarch` | Array of primarch ability groups, each with nested `abilities` array. |
| `keywords` | Array of unit keyword strings. |
| `factions` | Array of faction keyword strings. |
| `points` | Array of point cost options with `models`, `cost`, `primary`, `active`. |
| `variant` | Card layout: `"full"` (single card), `"double"` (front/back), or `"basic"`. |
| `print_side` | Which side to display for double-sided cards: `"front"` or `"back"`. |

#### Stratagems (10th Edition)

```json
{
  "name": "Armour of Contempt",
  "cardType": "stratagem",
  "source": "40k-10e",
  "faction_id": "my-faction",
  "cp_cost": "1",
  "type": "Battle Tactic",
  "when": "Your opponent's Shooting phase or the Fight phase.",
  "target": "One Adeptus Astartes unit.",
  "effect": "Until the end of the phase, improve the AP of attacks against the target by 1.",
  "restrictions": ""
}
```

#### Enhancements (10th Edition)

```json
{
  "name": "The Honour Vehement",
  "cardType": "enhancement",
  "source": "40k-10e",
  "faction_id": "my-faction",
  "cost": "15",
  "description": "Add 1 to the Attacks characteristic of melee weapons equipped by the bearer.",
  "detachment": "Gladius Task Force"
}
```

### Warhammer 40k 9th Edition (`source: "40k"`)

#### Datasheets (9th Edition)

```json
{
  "name": "Basic Card",
  "cardType": "datasheet",
  "source": "40k",
  "faction_id": "my-faction",
  "id": "001",
  "role": "Troops",
  "unit_composition": "Unit description text.",
  "datasheet": [
    {
      "name": "Model Name",
      "active": true,
      "M": "6\"",
      "WS": "3+",
      "BS": "3+",
      "S": "4",
      "T": "4",
      "W": "2",
      "A": "2",
      "Ld": "7",
      "Sv": "3+"
    }
  ],
  "wargear": [
    {
      "name": "Bolt Rifle",
      "active": true,
      "type": "Ranged Weapons",
      "profiles": [
        {
          "name": "Bolt Rifle",
          "type": "Rapid Fire 1",
          "Range": "30\"",
          "S": "4",
          "AP": "-1",
          "D": "1",
          "abilities": ""
        }
      ]
    }
  ],
  "abilities": [
    {
      "name": "Angels of Death",
      "description": "This unit has the following abilities...",
      "type": "Abilities",
      "showAbility": true,
      "showDescription": false
    }
  ],
  "keywords": [
    {
      "keyword": "Infantry",
      "active": true,
      "is_faction_keyword": "false"
    }
  ]
}
```

**Key differences from 10th Edition:**
- Stats use uppercase field names: `M`, `WS`, `BS`, `S`, `T`, `W`, `A`, `Ld`, `Sv`
- Stats are in the `datasheet` array (not `stats`)
- Weapons are in a single `wargear` array with `type` to distinguish ranged vs melee
- Weapon profiles use `type` (e.g., `"Rapid Fire 1"`) instead of separate `attacks`/`skill` fields
- Keywords are objects with `keyword`, `active`, and `is_faction_keyword` fields

#### Stratagems (9th Edition)

```json
{
  "name": "Stratagem Name",
  "cardType": "stratagem",
  "source": "40k",
  "faction_id": "my-faction",
  "id": "001",
  "cp_cost": "1 CP",
  "type": "Battle Tactic Stratagem",
  "description": "Description text. Supports _markdown_."
}
```

#### Secondaries (9th Edition)

```json
{
  "name": "Secondary Name",
  "cardType": "secondary",
  "source": "40k",
  "faction_id": "my-faction",
  "id": "001",
  "category": "Shadow Operations",
  "type": "Progressive Objective",
  "game": "Arks of Omen: Grand Tournament",
  "description": "Description text. Supports _markdown_."
}
```

#### Psychic Powers (9th Edition)

```json
{
  "name": "Smite",
  "cardType": "psychic",
  "source": "40k",
  "faction_id": "my-faction",
  "id": "001",
  "roll": "5",
  "warpcharge": 5,
  "type": "Discipline Name",
  "description": "Description text. Supports _markdown_."
}
```

### Age of Sigmar (`source: "aos"`)

#### Warscrolls

```json
{
  "name": "Unit Name",
  "subname": "",
  "cardType": "warscroll",
  "source": "aos",
  "faction_id": "my-faction",
  "points": 150,
  "modelCount": "5",
  "baseSize": "32mm",
  "legends": false,
  "stats": {
    "move": "6\"",
    "save": "4+",
    "control": "1",
    "health": "5",
    "ward": ""
  },
  "weapons": {
    "ranged": [
      {
        "name": "Longbow",
        "active": true,
        "range": "18\"",
        "attacks": "2",
        "hit": "3+",
        "wound": "4+",
        "rend": "-1",
        "damage": "1",
        "abilities": ["Crit (Auto-wound)"]
      }
    ],
    "melee": [
      {
        "name": "Sword",
        "active": true,
        "attacks": "2",
        "hit": "3+",
        "wound": "4+",
        "rend": "-",
        "damage": "1",
        "abilities": []
      }
    ]
  },
  "abilities": [
    {
      "name": "Ability Name",
      "phase": "Passive",
      "phaseDetails": "",
      "icon": "defensive",
      "lore": "",
      "declare": "",
      "effect": "Effect description text.",
      "keywords": [],
      "isReaction": false
    }
  ],
  "keywords": ["Infantry", "Battleline"],
  "factionKeywords": ["Cities of Sigmar"]
}
```

**Key fields:**

| Field | Description |
|-------|-------------|
| `stats` | Object (not array) with `move`, `save`, `control`, `health`, `ward`. |
| `weapons.ranged` | Array of ranged weapons with `range`, `attacks`, `hit`, `wound`, `rend`, `damage`, `abilities`. |
| `weapons.melee` | Array of melee weapons (same fields, no `range`). |
| `abilities[].phase` | When the ability triggers: `"Passive"`, `"Your Hero Phase"`, `"Movement Phase"`, `"Shooting Phase"`, `"Charge Phase"`, `"Combat Phase"`, `"End of Turn"`, etc. |
| `abilities[].icon` | Visual indicator: `"offensive"`, `"defensive"`, `"special"`, `"movement"`, `"shooting"`, `"control"`. |
| `keywords` | Array of unit keyword strings. |
| `factionKeywords` | Array of faction keyword strings. |

#### Manifestation Lore Spells

```json
{
  "name": "Spell Name",
  "cardType": "spell",
  "source": "aos",
  "faction_id": "my-faction",
  "loreName": "Lore of Shadows",
  "spellType": "manifestation",
  "castingValue": 7,
  "declare": "Pick a visible enemy unit within 18\" of the caster.",
  "effect": "That unit suffers D3 mortal wounds.",
  "keywords": ["Spell"]
}
```

### Necromunda (`source: "necromunda"`)

#### Gangers (Fighters)

```json
{
  "name": "Fighter Name",
  "cardType": "ganger",
  "source": "necromunda",
  "faction_id": "my-faction",
  "id": "001",
  "type": "Leader",
  "role": "Leader",
  "cost": "100",
  "notes": "",
  "datasheet": {
    "M": "5",
    "WS": "3+",
    "BS": "4+",
    "S": "3",
    "T": "3",
    "W": "2",
    "I": "4+",
    "A": "2",
    "LD": "7+",
    "CL": "6+",
    "WIL": "7+",
    "INT": "7+",
    "EXP": "0"
  },
  "weapons": [
    {
      "name": "Autogun",
      "active": true,
      "profiles": [
        {
          "name": "Autogun",
          "S": "0",
          "L": "8",
          "S2": "24\"",
          "L2": "+1",
          "STR": "3",
          "AP": "-",
          "D": "1",
          "AM": "1",
          "traits": [
            { "name": "Rapid Fire (1)", "active": true }
          ]
        }
      ]
    }
  ],
  "rules": [
    {
      "name": "Rule Name",
      "description": "Rule description.",
      "active": true
    }
  ],
  "skills": [
    {
      "name": "Skill Name",
      "description": "Skill description.",
      "active": true
    }
  ],
  "wargear": [
    {
      "name": "Gear Name",
      "description": "Gear description.",
      "active": true
    }
  ]
}
```

**Ganger stats:**

| Field | Description |
|-------|-------------|
| `M`   | Movement |
| `WS`  | Weapon Skill |
| `BS`  | Ballistic Skill |
| `S`   | Strength |
| `T`   | Toughness |
| `W`   | Wounds |
| `I`   | Initiative |
| `A`   | Attacks |
| `LD`  | Leadership |
| `CL`  | Cool |
| `WIL` | Willpower |
| `INT` | Intelligence |
| `EXP` | Experience (optional) |

**Weapon profile fields:**

| Field   | Description |
|---------|-------------|
| `S`     | Short range accuracy modifier |
| `L`     | Long range accuracy modifier |
| `S2`    | Short range distance |
| `L2`    | Long range distance |
| `STR`   | Strength |
| `AP`    | Armour Penetration |
| `D`     | Damage |
| `AM`    | Ammo |
| `traits` | Array of weapon trait objects |

#### Vehicles

Vehicles use `cardType: "vehicle"` and have a different stat block:

```json
{
  "name": "Vehicle Name",
  "cardType": "vehicle",
  "source": "necromunda",
  "faction_id": "my-faction",
  "datasheet": {
    "M": "7",
    "FRONT": "5+",
    "SIDE": "5+",
    "REAR": "6+",
    "HP": "3",
    "HND": "7+",
    "SV": "5+",
    "BS": "4+",
    "LD": "8+",
    "CL": "7+",
    "WIL": "8+",
    "INT": "8+"
  }
}
```

**Vehicle stats:**

| Field   | Description |
|---------|-------------|
| `M`     | Movement |
| `FRONT` | Front armour |
| `SIDE`  | Side armour |
| `REAR`  | Rear armour |
| `HP`    | Hit Points |
| `HND`   | Handling |
| `SV`    | Save |
| `BS`    | Ballistic Skill |
| `LD`    | Leadership |
| `CL`    | Cool |
| `WIL`   | Willpower |
| `INT`   | Intelligence |

Vehicles share the same `weapons`, `rules`, `skills`, and `wargear` structure as gangers.

### Basic Cards (`source: "basic"`)

Basic cards use the 9th edition stat format and serve as general-purpose templates.

```json
{
  "name": "Custom Card",
  "cardType": "datasheet",
  "source": "basic",
  "faction_id": "my-faction",
  "id": "001",
  "role": "Troops",
  "unit_composition": "Description text.",
  "datasheet": [
    {
      "name": "Model Name",
      "active": true,
      "M": "6\"",
      "WS": "3+",
      "BS": "3+",
      "S": "4",
      "T": "4",
      "W": "2",
      "A": "2",
      "Ld": "7",
      "Sv": "3+"
    }
  ],
  "wargear": [],
  "abilities": [],
  "keywords": []
}
```

Basic datasources can also include `stratagems`, `secondaries`, and `psychicpowers` using the same format as 9th edition.

## Validation Limits

The following limits are enforced during import for security and performance:

| Limit | Value |
|-------|-------|
| Maximum datasource name length | 200 characters |
| Maximum version string length | 50 characters |
| Maximum number of factions | 10 |
| Maximum total cards (across all factions) | 2,000 |
| Maximum individual string field length | 10,000 characters |

Validation also requires:
- `name` must be a non-empty string
- `version` must be a non-empty string
- `data` must be a non-empty array
- Each faction must have `id` (string), `name` (string), and `colours` with `header` and `banner` fields

## Hosting and Updates

### URL-Based Datasources

When a datasource is imported via URL, the app stores the source URL and supports automatic update checking:

1. The app fetches the URL again and compares the `version` field using semantic versioning
2. If the remote version is newer, the user is prompted to apply the update
3. The `id` field is used to match datasources across updates

### CORS Requirements

If you host your datasource JSON on a web server, the server must allow cross-origin requests (CORS) from the domain where Game Datacards is running. Without proper CORS headers, the browser will block the fetch request.

Common hosting options that support CORS:
- GitHub raw files (`raw.githubusercontent.com`)
- GitHub Pages
- Any static file host with CORS headers configured

### Recommended CORS Headers

```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

## Examples

### Minimal Valid Datasource

The smallest possible valid datasource with a single 10th edition datasheet:

```json
{
  "name": "My Army",
  "version": "1.0.0",
  "id": "my-army",
  "data": [
    {
      "id": "my-faction",
      "name": "My Faction",
      "colours": {
        "header": "#1a1a1a",
        "banner": "#4a4a4a"
      },
      "datasheets": [
        {
          "name": "Custom Unit",
          "id": 1,
          "faction_id": "my-faction",
          "cardType": "DataCard",
          "source": "40k-10e",
          "stats": [
            {
              "active": true,
              "m": "6\"",
              "t": "4",
              "sv": "3+",
              "w": "1",
              "ld": "6+",
              "oc": "1"
            }
          ],
          "rangedWeapons": [],
          "meleeWeapons": [],
          "abilities": {
            "core": [],
            "faction": [],
            "other": [],
            "wargear": [],
            "special": [],
            "invul": {
              "showInvulnerableSave": false,
              "value": "",
              "info": ""
            },
            "damaged": {
              "showDamagedAbility": false,
              "range": "",
              "description": ""
            },
            "primarch": []
          },
          "keywords": ["Infantry"],
          "factions": ["My Faction"]
        }
      ]
    }
  ]
}
```

### Multi-Card-Type Faction

A faction containing both a stratagem and an enhancement (10th edition):

```json
{
  "name": "Homebrew Detachment",
  "version": "1.0.0",
  "id": "homebrew-detachment",
  "data": [
    {
      "id": "homebrew",
      "name": "Homebrew Faction",
      "colours": {
        "header": "#2a0a0a",
        "banner": "#8b0000"
      },
      "datasheets": [
        {
          "name": "Custom Unit",
          "id": 1,
          "faction_id": "homebrew",
          "cardType": "DataCard",
          "source": "40k-10e",
          "stats": [
            {
              "active": true,
              "m": "10\"",
              "t": "5",
              "sv": "3+",
              "w": "3",
              "ld": "6+",
              "oc": "1"
            }
          ],
          "rangedWeapons": [
            {
              "profiles": [
                {
                  "active": true,
                  "name": "Plasma pistol - standard",
                  "range": "12\"",
                  "attacks": "1",
                  "skill": "3+",
                  "strength": "7",
                  "ap": "-2",
                  "damage": "1",
                  "keywords": ["Pistol"]
                },
                {
                  "active": true,
                  "name": "Plasma pistol - supercharge",
                  "range": "12\"",
                  "attacks": "1",
                  "skill": "3+",
                  "strength": "8",
                  "ap": "-3",
                  "damage": "2",
                  "keywords": ["Pistol", "Hazardous"]
                }
              ],
              "abilities": []
            }
          ],
          "meleeWeapons": [
            {
              "profiles": [
                {
                  "active": true,
                  "name": "Power sword",
                  "range": "Melee",
                  "attacks": "4",
                  "skill": "2+",
                  "strength": "5",
                  "ap": "-2",
                  "damage": "1",
                  "keywords": []
                }
              ],
              "abilities": []
            }
          ],
          "abilities": {
            "core": ["Leader", "Deep Strike"],
            "faction": ["Oath of Moment"],
            "other": [
              {
                "name": "Tactical Precision",
                "showAbility": true,
                "showDescription": true,
                "description": "While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability."
              }
            ],
            "wargear": [],
            "special": [],
            "invul": {
              "showInvulnerableSave": true,
              "showAtTop": false,
              "showInfo": false,
              "value": "4+",
              "info": ""
            },
            "damaged": {
              "showDamagedAbility": false,
              "range": "",
              "description": ""
            },
            "primarch": []
          },
          "keywords": ["Infantry", "Character", "Custom Unit"],
          "factions": ["Homebrew Faction"],
          "points": [
            { "active": true, "primary": true, "models": "1", "cost": "80" }
          ],
          "leads": {
            "units": ["Intercessor Squad", "Assault Intercessor Squad"],
            "extra": ""
          }
        }
      ],
      "stratagems": [
        {
          "name": "Devastating Charge",
          "cardType": "stratagem",
          "source": "40k-10e",
          "faction_id": "homebrew",
          "cp_cost": "1",
          "type": "Battle Tactic",
          "when": "Your Charge phase.",
          "target": "One Homebrew unit that made a charge move this phase.",
          "effect": "Until the end of the turn, melee weapons equipped by models in your unit have the [SUSTAINED HITS 1] ability.",
          "restrictions": ""
        }
      ],
      "enhancements": [
        {
          "name": "Blade of Fury",
          "cardType": "enhancement",
          "source": "40k-10e",
          "faction_id": "homebrew",
          "cost": "25",
          "description": "Add 2 to the Attacks characteristic of melee weapons equipped by the bearer.",
          "detachment": "Homebrew Detachment"
        }
      ]
    }
  ]
}
```
