---
title: Card Data Formats
description: JSON object schemas for all built-in card types across game systems
category: data-formats
tags: [cards, json, 40k, age-of-sigmar, necromunda, schema]
related:
  - custom-datasource-format.md
---

# Card Data Formats

JSON object schemas for built-in card types in Game Datacards. Covers all supported game systems.

All text fields support Markdown formatting unless noted otherwise.

## Table of Contents

- [Warhammer 40k 10th Edition](#warhammer-40k-10th-edition)
  - [DataCard (Unit Datasheet)](#datacard-unit-datasheet)
  - [Stratagem](#stratagem)
  - [Enhancement](#enhancement)
  - [Rule](#rule)
- [Age of Sigmar](#age-of-sigmar)
  - [Warscroll](#warscroll)
  - [Spell](#spell)
- [Warhammer 40k 9th Edition](#warhammer-40k-9th-edition)
  - [Datasheets (9th)](#datasheets-9th)
  - [Stratagems (9th)](#stratagems-9th)
  - [Secondaries (9th)](#secondaries-9th)
  - [Psychic Powers (9th)](#psychic-powers-9th)
- [Necromunda](#necromunda)
  - [Gangers](#gangers)
  - [Vehicles](#vehicles)
- [Basic Cards](#basic-cards)
- [Key Differences Between Systems](#key-differences-between-systems)

---

## Warhammer 40k 10th Edition

Source identifier: `"40k-10e"`

### Card Types

There are four `cardType` values:

| cardType | Description |
|----------|-------------|
| `"DataCard"` | Unit datasheet |
| `"stratagem"` | Stratagem card |
| `"enhancement"` | Enhancement card |
| `"rule"` | Army/detachment rule card |

---

### DataCard (Unit Datasheet)

```jsonc
{
  // Identity
  "cardType": "DataCard",
  "uuid": "string",           // v4 UUID
  "name": "string",
  "subname": "string",        // Subtitle (e.g. "Ancient", "Officer")
  "faction_id": "string",
  "source": "40k-10e",

  // Layout
  "variant": "full" | "double",   // Full card or double-sided
  "print_side": "front" | "back", // Which side to print (double-sided only)
  "legends": false,                // Legends unit flag
  "combatPatrol": false,           // Combat Patrol unit flag
  "templateId": null,              // Custom designer template ID

  // Stats - array of stat lines (multi-profile units have multiple entries)
  // NOTE: all stat field names are LOWERCASE
  "stats": [
    {
      "name": "string",       // Profile name
      "active": true,         // Show this stat line
      "m": "6\"",             // Movement
      "t": "4",               // Toughness
      "sv": "3+",             // Save
      "w": "5",               // Wounds
      "ld": "6+",             // Leadership
      "oc": "1"               // Objective Control
    }
  ],

  // Points - array of point configurations
  "points": [
    {
      "active": true,
      "primary": true,         // Default display cost
      "models": 5,             // Model count (number or string)
      "cost": 90,              // Points cost (number or string)
      "keyword": ""            // Optional label (e.g. "Strike Force")
    }
  ],
  "showAllPoints": false,      // Display all point tiers on card
  "showPointsModels": false,   // Show model count alongside points

  // Weapons - ranged and melee share the same structure
  "rangedWeapons": [
    {
      "active": true,
      "profiles": [
        {
          "active": true,
          "name": "Bolt rifle",
          "range": "24\"",
          "attacks": "2",
          "skill": "3+",       // BS for ranged, WS for melee
          "strength": "4",
          "ap": "-1",
          "damage": "1",
          "keywords": ["Assault", "Heavy"]  // Weapon keywords
        }
      ],
      "abilities": [           // Per-weapon-group abilities (optional)
        {
          "name": "string",
          "description": "string",
          "showAbility": true,
          "showDescription": true
        }
      ]
    }
  ],
  "meleeWeapons": [/* same structure as rangedWeapons */],
  "showWeapons": {
    "rangedWeapons": true,
    "meleeWeapons": true
  },

  // Abilities
  "abilities": {
    "core": ["Fights First", "Deep Strike"],     // Array of strings
    "faction": ["Oath of Moment"],                // Array of strings
    "other": [                                     // Array of ability objects
      {
        "name": "string",
        "description": "string",
        "showAbility": true,
        "showDescription": true
      }
    ],
    "wargear": [/* same shape as other */],
    "special": [/* same shape as other */],
    "damaged": {
      "showDamagedAbility": false,
      "showDescription": true,
      "range": "1-4 WOUNDS REMAINING",
      "description": "string"
    },
    "invul": {
      "showInvulnerableSave": false,
      "showAtTop": false,       // Position: above stats vs below abilities
      "value": "4+",            // Invulnerable save value
      "showInfo": false,        // Show extra info text
      "info": "string"          // Extra info (e.g. "Against ranged attacks only")
    }
  },
  "showAbilities": {
    "core": true,
    "faction": true,
    "other": true,
    "wargear": true,
    "special": true
  },

  // Back-of-card content
  "loadout": "string",          // Default wargear loadout (Markdown)
  "showLoadout": true,
  "transport": "string",        // Transport capacity (Markdown)
  "composition": ["string"],    // Unit composition options (Markdown per entry)
  "showComposition": true,
  "leads": {                    // Leader attachment info
    "units": [                  // Units this leader can join
      { "name": "string" }     // Or plain string for legacy data
    ],
    "extra": "string"           // Additional leader info (Markdown)
  },
  "leadBy": [                   // Leaders that can attach to this unit
    { "name": "string" }       // Or plain string for legacy data
  ],

  // Keywords
  "keywords": ["Infantry", "Imperium"],  // Unit keywords
  "factions": ["Adeptus Astartes"],       // Faction keywords

  // Image
  "externalImage": null,       // URL string or null
  "hasLocalImage": false,      // Uses IndexedDB-stored image
  "imageZIndex": 0,
  "imagePositionX": 0,
  "imagePositionY": 0,

  // Custom colours
  "useCustomColours": false,
  "customHeaderColour": "#000000",
  "customBannerColour": "#000000"
}
```

**Key notes:**
- Stat field names are **lowercase**: `m`, `t`, `sv`, `w`, `ld`, `oc` (not uppercase).
- `abilities.core` and `abilities.faction` are string arrays (just names), not objects.
- `abilities.other`, `abilities.wargear`, and `abilities.special` are arrays of `{ name, description, showAbility, showDescription }` objects.
- Weapons have a two-level structure: weapon groups contain `profiles` (for multi-profile weapons like "Combi-weapon") and optional `abilities`.

---

### Stratagem

```jsonc
{
  "cardType": "stratagem",
  "uuid": "string",
  "name": "string",
  "faction_id": "string",
  "source": "40k-10e",

  "turn": "your" | "either" | "opponents",
  "detachment": "string",     // Detachment name
  "type": "string",           // Stratagem type (e.g. "Battle Tactic")
  "cost": "1",                // CP cost (string)
  "phase": ["command", "movement", "shooting", "charge", "fight", "any"],

  // Content sections (all Markdown)
  "when": "string",
  "target": "string",
  "effect": "string",
  "restrictions": "string",

  // Card sizing
  "styling": {
    "width": 260,
    "height": 458,
    "textSize": 16,
    "lineHeight": 1
  }
}
```

**Phase values:** `"any"`, `"command"`, `"movement"`, `"shooting"`, `"charge"`, `"fight"`

---

### Enhancement

```jsonc
{
  "cardType": "enhancement",
  "uuid": "string",
  "name": "string",
  "faction_id": "string",
  "source": "40k-10e",

  "detachment": "string",
  "cost": "string",            // Points cost
  "description": "string",    // Markdown

  "styling": {
    "width": 260,
    "height": 458,
    "textSize": 16,
    "lineHeight": 1
  }
}
```

---

### Rule

```jsonc
{
  "cardType": "rule",
  "uuid": "string",
  "name": "string",
  "faction_id": "string",
  "source": "40k-10e",

  "ruleType": "army" | "detachment",
  "detachment": "string",     // Only used when ruleType is "detachment"

  "rules": [                  // Ordered array of content parts
    {
      "type": "header" | "text" | "accordion",
      "text": "string",       // Content (Markdown for text/accordion, plain for header)
      "title": "string",      // Title (accordion type only)
      "order": 0              // Sort order
    }
  ],

  "styling": {
    "width": 460,
    "height": 620,
    "textSize": 14,
    "autoHeight": true         // Auto-size card height to content
  }
}
```

---

## Age of Sigmar

Source identifier: `"aos"`

### Card Types

| cardType | Description |
|----------|-------------|
| `"warscroll"` | Unit warscroll |
| `"spell"` | Spell/prayer card |

---

### Warscroll

```jsonc
{
  "cardType": "warscroll",
  "uuid": "string",
  "name": "string",
  "subname": "string",
  "faction_id": "string",
  "source": "aos",

  "points": 140,              // Number
  "modelCount": "3-6",        // String (supports ranges)
  "baseSize": "50x50",        // Base size in mm
  "legends": false,

  // Stats
  "stats": {
    "move": "8\"",
    "save": "4+",
    "control": "10",
    "health": "5",
    "ward": "5+",             // Optional
    "wizard": "1",            // Optional - wizard level
    "priest": "1"             // Optional - priest level
  },

  // Weapons
  "weapons": {
    "ranged": [
      {
        "id": "string",       // UUID
        "name": "string",
        "active": true,
        "range": "12\"",
        "attacks": "3",
        "hit": "3+",
        "wound": "4+",
        "rend": "-1",
        "damage": "2",
        "abilities": ["Crit (Mortal)", "Anti-Infantry"]  // String array
      }
    ],
    "melee": [
      {
        "id": "string",
        "name": "string",
        "active": true,
        // No "range" field for melee
        "attacks": "3",
        "hit": "3+",
        "wound": "4+",
        "rend": "-1",
        "damage": "2",
        "abilities": []
      }
    ]
  },
  "showWeapons": {
    "ranged": true,
    "melee": true
  },

  // Abilities - flat array (not categorized like 40k)
  "abilities": [
    {
      "id": "string",
      "name": "string",
      "phase": "string",       // See phase values below
      "phaseDetails": "string", // Additional phase context (shown as tag)
      "icon": "offensive" | "defensive" | "special" | "movement" | "shooting" | "control",
      "lore": "string",        // General ability text (used if no declare/effect)
      "declare": "string",     // "Declare" section
      "effect": "string",      // "Effect" section
      "keywords": ["string"],
      "castingValue": 7,       // For wizard abilities (optional)
      "chantValue": 4,         // For priest abilities (optional)
      "isReaction": false
    }
  ],

  // Summoning (optional)
  "summonedBy": {
    "spell": "string",         // Summoning spell name
    "castingValue": 7          // Optional
  },

  // Keywords
  "keywords": ["Daemon", "Infantry"],
  "factionKeywords": ["Khorne", "Chaos"],

  // Image
  "imageUrl": "string",        // External image URL
  "hasLocalImage": false,
  "imageOpacity": 30,          // 0-100
  "imagePositionX": 0,         // -200 to 200
  "imagePositionY": 0,         // -200 to 200
  "imageScale": 100,           // 50-300 (percentage)

  // Custom colours
  "useCustomColours": false,
  "customHeaderColour": "#000000",
  "customBannerColour": "#000000"
}
```

**Ability phase values:** `"Passive"`, `"Your Hero Phase"`, `"Enemy Hero Phase"`, `"Movement Phase"`, `"Shooting Phase"`, `"Charge Phase"`, `"Combat Phase"`, `"Any Charge Phase"`, `"Any Combat Phase"`, `"End of Turn"`, `"Start of Turn"`, `"Deployment Phase"`

---

### Spell

```jsonc
{
  "cardType": "spell",
  "uuid": "string",
  "name": "string",
  "faction_id": "string",
  "source": "aos",

  "castingValue": 7,
  "declare": "string",         // Markdown
  "effect": "string",          // Markdown
  "keywords": ["Spell"],
  "linkedWarscroll": "string"  // Name of summoned unit (optional)
}
```

Spells are grouped into lores within the faction data:
```jsonc
{
  "name": "Lore of Light",
  "spells": [/* spell objects */]
}
```

---

## Warhammer 40k 9th Edition

Source identifier: `"40k"`

### Datasheets (9th)

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

Key differences from 10th Edition:
- Stats use uppercase field names: `M`, `WS`, `BS`, `S`, `T`, `W`, `A`, `Ld`, `Sv`
- Stats are in the `datasheet` array (not `stats`)
- Weapons are in a single `wargear` array with `type` to distinguish ranged vs melee
- Weapon profiles use `type` (e.g., `"Rapid Fire 1"`) instead of separate `attacks`/`skill` fields
- Keywords are objects with `keyword`, `active`, and `is_faction_keyword` fields

### Stratagems (9th)

```json
{
  "name": "Stratagem Name",
  "cardType": "stratagem",
  "source": "40k",
  "faction_id": "my-faction",
  "id": "001",
  "cp_cost": "1 CP",
  "type": "Battle Tactic Stratagem",
  "description": "Description text."
}
```

9th edition stratagems use `cp_cost` (includes "CP" suffix) instead of the numeric `cost` field in 10th edition.

### Secondaries (9th)

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
  "description": "Description text."
}
```

### Psychic Powers (9th)

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
  "description": "Description text."
}
```

---

## Necromunda

Source identifier: `"necromunda"`

### Gangers

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
    { "name": "Rule Name", "description": "Rule description.", "active": true }
  ],
  "skills": [
    { "name": "Skill Name", "description": "Skill description.", "active": true }
  ],
  "wargear": [
    { "name": "Gear Name", "description": "Gear description.", "active": true }
  ]
}
```

**Ganger stat fields:** `M` (Movement), `WS`, `BS`, `S`, `T`, `W`, `I` (Initiative), `A`, `LD`, `CL` (Cool), `WIL` (Willpower), `INT` (Intelligence), `EXP` (Experience, optional).

**Weapon profile fields:** `S` (Short range accuracy), `L` (Long range accuracy), `S2` (Short range distance), `L2` (Long range distance), `STR`, `AP`, `D`, `AM` (Ammo), `traits` (array of weapon trait objects).

### Vehicles

Vehicles use `cardType: "vehicle"` with a different stat block:

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

**Vehicle stat fields:** `M`, `FRONT`/`SIDE`/`REAR` (armour), `HP`, `HND` (Handling), `SV`, `BS`, `LD`, `CL`, `WIL`, `INT`.

Vehicles share the same `weapons`, `rules`, `skills`, and `wargear` structure as gangers.

---

## Basic Cards

Source identifier: `"basic"`

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

Basic datasources can also include `stratagems`, `secondaries`, and `psychicpowers` using the 9th edition format.

---

## Key Differences Between Systems

| Aspect | 40k 10e | Age of Sigmar |
|--------|---------|---------------|
| Source ID | `"40k-10e"` | `"aos"` |
| Stats | Array of stat line objects (`m`, `t`, `sv`, `w`, `ld`, `oc` - lowercase) | Single stats object (`move`, `save`, `control`, `health` + optional `ward`/`wizard`/`priest`) |
| Weapons | Grouped with `profiles` array per weapon group | Flat array per type, no sub-profiles |
| Weapon stats | `range`, `attacks`, `skill`, `strength`, `ap`, `damage` | `range`, `attacks`, `hit`, `wound`, `rend`, `damage` |
| Abilities | Categorized object (`core`, `faction`, `other`, `wargear`, `special`, `damaged`, `invul`) | Flat array with `phase` and `icon` properties |
| Points | Array of point tiers with model counts | Single number |
| Secondary cards | Stratagems, Enhancements, Rules | Spells |
| Back-of-card | Loadout, composition, transport, leader info | N/A |
