---
title: GW App List Import
description: How a Warhammer 40,000 app list export is read into a list, for both 10th and 11th edition, including the shared parser and the 11e army roster it restores
category: features
tags: [import, gw-app, 40k-10e, 40k-11e, parser, detachments, battle-size]
related:
  - 40k-11e-list-building.md
  - listforge-direct-read-import.md
  - card-data-formats.md
file_locations:
  parser: src/Helpers/armyListParser.helpers.js
  parser_tests: src/Helpers/__tests__/armyListParser.helpers.test.js
  parser_fixtures: src/Helpers/__tests__/armyListParser.fixtures.js
  importer_helpers: src/Helpers/gwAppImport.helpers.js
  importer_tests: src/Helpers/__tests__/gwAppImport.roster.test.js
  mobile_importer: src/Components/Viewer/MobileImporter/MobileGwImporter.jsx
  desktop_tab: src/Components/Importer/tabs/GwAppTab.jsx
  list_overview: src/Components/Viewer/ListCreator/ListOverview.jsx
---

# GW App List Import

## Table of Contents

- [Overview](#overview)
- [Where the import is offered](#where-the-import-is-offered)
- [The parser](#the-parser)
  - [Export shapes it reads](#export-shapes-it-reads)
  - [What it produces](#what-it-produces)
  - [Local additions to the shared parser](#local-additions-to-the-shared-parser)
  - [Keeping it in step with upstream](#keeping-it-in-step-with-upstream)
- [From parsed list to cards](#from-parsed-list-to-cards)
  - [Faction and unit matching](#faction-and-unit-matching)
  - [Size tiers](#size-tiers)
  - [Enhancements](#enhancements)
- [The 11th edition army roster](#the-11th-edition-army-roster)
  - [Battle size](#battle-size)
  - [Detachments](#detachments)
- [Export](#export)

## Overview

A player builds a list in the official Warhammer 40,000 app, copies it as text,
and pastes it into Game Datacards. The import reads that text, matches every unit
to a datasheet in the loaded datasource, and creates a list.

Both 40k editions export from the same app in the same formats, so one parser
serves `40k-10e` and `40k-11e`. What differs is the army around the units: an
11th edition list also carries a battle size, a Detachment Points budget and the
detachments bought with it, all of which the export states and the import
restores.

## Where the import is offered

| Surface | Component | Available for |
|---------|-----------|---------------|
| Mobile — Lists sheet | `ListOverview` → `MobileGwImporter` | `40k-10e`, `40k-11e` |
| Desktop — Import modal | `Importer` → `GwAppTab` | `40k-10e`, `40k-11e` |
| Desktop — Export modal | `Exporter` (GW app text) | `40k-10e`, `40k-11e` |

The List Forge import stays 10th edition only: it builds its cards itself, tagged
`40k-10e`, rather than matching them against the loaded datasource.

## The parser

`src/Helpers/armyListParser.helpers.js` exports one function:

```js
parseArmyList(text) -> ArmyList
```

It is a JavaScript port of `src/lib/army-list/parse.ts` from the
`wargaming-streamer-saas` repository, where the same module is shared with the
40k-ez app. The port keeps the upstream structure, names and comments so a fix
made there can be transplanted here line for line.

### Export shapes it reads

| Shape | Header | Units |
|-------|--------|-------|
| Title format | `<name> (<pts> Points)`, then faction, chapter, detachment, disposition, battle size | Section headers (`CHARACTERS`, `BATTLELINE`, `ATTACHED UNITS`, …), `<name> (<pts> points)`, bullet sub-lines for models and wargear |
| WTC / `+++` | A `+ FACTION KEYWORD:` / `+ DETACHMENT:` / `+ TOTAL ARMY POINTS:` block | Either the same section headers, or units listed straight after the block with a `CharN:` roster slot |

The two are routinely stacked — a WTC block pasted on top of an ordinary app
export — so both are read rather than one being chosen.

The parser is deliberately tolerant of what real exports do to these shapes:
comma, dot and four widths of space as a thousands separator; a `*` footnote on a
unit that also has the Battleline keyword; player annotations in brackets or after
a dash; theme-song links in the header; a detachment whose points fall onto the
next line; lost indentation in a unit's bullets.

### What it produces

```js
{
  name, faction, subfaction,
  detachment, detachmentPoints, disposition, battleSize,
  points,
  units: [{
    id, name, points, models,
    category,       // "characters" | "battleline" | "transports" | "other"
    section,        // the raw section header, e.g. "ALLIED UNITS"
    isWarlord,
    enhancement, enhancementCost,
    wargear,        // deduplicated, counts stripped
    leaders,        // the characters that joined this unit
    attachment,     // { group, role } for a unit in an attached block
  }]
}
```

Attached units are folded into the army: the leader reads as a character, its
bodyguard as battleline or other, and each character's name is written onto the
unit it joined (`leaders`), so the list reads as one clean army rather than as
blocks.

### Local additions to the shared parser

Four things this app needs are added on top of the upstream parser. All are
additive — no field upstream produces changes meaning — and each is marked in the
source:

| Addition | Why |
|----------|-----|
| `unit.section` | The raw section header, so `ALLIED UNITS` can be routed to allied factions during matching. Upstream buckets it into `other` with everything else. |
| `list.battleSize` | The battle size by name, which an 11th edition list stores to get its Detachment Points budget. Upstream reads the line only for the army total. |
| `unit.enhancementCost` | The `(+20 pts)` an export annotates an enhancement with, subtracted from the unit's points to get the datasheet's own cost. Upstream strips the annotation and keeps only the name. |
| The 10th edition detachment line | 11e writes the detachment with its DP cost, which upstream reads. 10e writes it as a bare line under the battle size, and this app matches enhancements against it. |

### Keeping it in step with upstream

`armyListParser.helpers.js`, `__tests__/armyListParser.helpers.test.js` and
`__tests__/armyListParser.fixtures.js` are ports of the three upstream files. The
test file is the upstream suite verbatim above a fenced block of tests for the
four additions above; keep that fence, so the upstream half can still be diffed
against the source. A parser fix made upstream should arrive here with the test
that proves it.

## From parsed list to cards

`parseGwAppText` (in `gwAppImport.helpers.js`) wraps `parseArmyList` in the shape
the importers consume, then the units go through matching:

### Faction and unit matching

1. `matchFaction` resolves the export's faction name against the datasource.
2. `matchUnitsToDatasheets` matches each unit name to a datasheet — exact first,
   then the parent faction for a subfaction, then allied factions for units under
   an `ALLIED UNITS` header, then a Fuse.js fuzzy pass whose score classifies the
   match as exact / confident / ambiguous / none.
3. The review step shows every unit with its match, and lets the user re-pick or
   skip any of them.

### Size tiers

`getImportUnitSize(card, unit, army)` decides what a unit costs.

11th edition prices a datasheet per size tier, and the list builder matches a
card's `unitSize` against the entries in `card.points` — for repricing when a
detachment changes, and in the unit config modal. A tier invented from the pasted
points would match none of them, so the export's numbers pick one of the card's
own tiers instead:

1. the tier whose size **and** price both match,
2. else the tier whose price matches (the parser can miscount the models of a
   squad whose export lost its indentation),
3. else the tier whose size matches,
4. else the pasted cost, which is what a 10th edition card — no tiers of its own —
   always gets.

The army context (`getArmyContext`) is passed in, so a price scoped to a
detachment or a faction keyword wins over the generic one.

### Enhancements

The parsed enhancement is matched to the faction's own by name and detachment
(`matchEnhancementsToFaction`), which supplies its cost when the export annotated
it only as an `(Upgrade)`. Its points are subtracted from the unit's before a size
tier is picked, so the datasheet lands on its own price.

## The 11th edition army roster

`getImportRoster(parsed, faction)` returns `{ battleSize, detachments }`, which
the importer sets on the list it creates, alongside `factionId`. Both are empty
for an export that states neither and for a faction with no detachments of its
own (10th edition data), so callers can apply it unconditionally.

### Battle size

`matchBattleSize` maps the export's name onto a key of `BATTLE_SIZES`
(`listRoster.helpers.js`) — `Incursion` at 2 DP or `Strike Force` at 3 DP.
A size this edition does not have reads as `null`.

### Detachments

An 11e army holds several detachments and the export writes them as one line
joined by `and` or `+`:

```
Ironstorm Spearhead and Marshal's Household (3 Detachment Points)
```

That line cannot be split on the joiner, because a detachment's own name may
contain one — `Legends of Saga and Song and Saga of the Beastslayer` is two
detachments, not three. So `matchDetachmentsToFaction` searches the faction's own
detachment names inside the line, longest first, each match claiming its words so
a shorter name cannot take them again. The matches are returned in the order the
export names them, capped by `canAddDetachment` at what the battle size can pay
for, so an import can never build a roster the list builder itself would refuse.

## Export

The GW app text export (`Exporter.jsx`) is edition-agnostic — sections, points,
warlord and enhancements — and produces a shape this parser reads back, so a list
round-trips. It does not yet write the 11e header lines (battle size, detachment
and its DP, force disposition), so those are lost on a round trip through the
exported text.
