---
title: Editing Warhammer 40K 11th Edition cards
description: How the 11th edition card editor edits language-keyed fields in place for the active card language, which fields stay plain, and how the optional show/hide flags work.
category: Features
tags: [40k-11e, editor, multi-language, i18n, localization]
related:
  - warhammer-40k-11e-format.md
  - card-data-formats.md
file_locations:
  - src/Components/Warhammer40k-11e/CardEditor.jsx
  - src/Components/Warhammer40k-11e/UnitCardEditor.jsx
  - src/Components/Warhammer40k-11e/UnitCardEditor/
  - src/Components/Warhammer40k-11e/usePanelVisibility.js
  - src/Helpers/localization.helpers.js
---

# Editing Warhammer 40K 11th Edition cards

11th edition cards (`40k-11e`) are fully editable in the right-hand editor panel,
with feature parity to the 10th edition editor (unit front/back/full, stratagem,
enhancement and rule editors). The editor is wired in `src/App.jsx` and routed by
`src/Components/Warhammer40k-11e/CardEditor.jsx`, mirroring the 10e routing
(`showCardsAsDoubleSided` / `variant === "full"` / `cardType` / `print_side`).

The data format differs from 10e (see
[warhammer-40k-11e-format.md](warhammer-40k-11e-format.md)), so the editor adapts
how it reads and writes every field.

## Table of contents

- [Edit-the-active-language model](#edit-the-active-language-model)
- [Plain vs language-keyed fields](#plain-vs-language-keyed-fields)
- [The localisation helpers](#the-localisation-helpers)
- [Optional show/hide flags](#optional-showhide-flags)
- [Markup in text fields](#markup-in-text-fields)

## Edit-the-active-language model

11e text fields are language-keyed objects (`{ en, de, fr, … }`). The editor
edits **one language at a time**: the user picks a card language in Settings
(`settings.language`), and every edit is written into that language key while the
other languages are preserved untouched.

- **Reads** resolve through `localize(value, settings.language)` (requested
  language → English → first available).
- **Writes** go through `setLocalizedField(existing, language, newValue)`, which
  merges into `existing[language]` and keeps the other languages.

All edits funnel through `updateActiveCard` (the same persistence hook the 10e
editor uses); nothing else in the storage/sync layer changed.

## Plain vs language-keyed fields

A few fields are **plain** and must never become objects, because renderers read
them raw (and some are concatenated into `data-*` attributes):

- Unit `name` and `subname` (the loader resolves the top-level unit name to a
  plain string; the renderer reads both raw).
- `factions[]` entries (joined as plain strings), weapon profile `keywords[]`,
  stratagem `phase[]` / `turn` / `cost`, enhancement `cost`, rule `ruleType`,
  stat values `m/t/sv/w/ld/oc`, weapon `range/attacks/skill/strength/ap/damage`,
  `abilities.invul.value`, point `models/cost/keyword`, and all `styling.*`
  numbers and `show*` booleans.

Everything else is **language-keyed** and edited in place: stat profile `name`;
weapon profile `name`; `abilities.core[].name` / `faction[].name` /
`other[].name` / `other[].description`; `abilities.damaged.range` /
`description`; `composition[]`, `loadout`, `leader`, `wargear[]`; unit
`keywords[]`; **stratagem** `name`/`when`/`target`/`effect`/`detachment`/`type`;
**enhancement** `name`/`description`/`detachment`; **rule**
`name`/`detachment`/`rules[].title`/`rules[].text`.

> Note the asymmetry: a **unit's** top-level `name` is plain, but
> **stratagem / enhancement / rule** names are language-keyed.

## The localisation helpers

`src/Helpers/localization.helpers.js` provides the read/write pair used
throughout the editor:

- `localize(value, language)` — resolve a (possibly language-keyed) value to a
  string, with per-field English fallback.
- `setLocalizedField(existing, language, newValue)` — shape-preserving write: if
  `existing` is an object, merge into `existing[language]`; if it is a plain
  string (or nullish), return `newValue` as a plain string (so plain fields stay
  plain).
- `setLocalizedArrayItem(arr, index, language, newValue)` — the same
  shape-preserving update for one entry of an array of localized values
  (keywords, composition lines, wargear options).

## Optional show/hide flags

The editor's panel toggles introduce optional visibility flags on the card so a
section can be hidden without deleting its data:

- `showWeapons: { rangedWeapons, meleeWeapons }`
- `showAbilities: { core, faction, other }`
- top-level booleans: `showDamaged`, `showInvul`, `showWargear`,
  `showComposition`, `showLoadout`, `showLeader`.

The 11e renderers honour these with **absent = shown** semantics (gated with
`!== false`), so cards created before this feature — which have none of these
flags — render exactly as before. The damaged/invul flags are kept at the top
level (rather than nested inside `abilities`) so the `abilities` object keeps the
exact shape the loader produces.

Panel visibility is managed by `src/Components/Warhammer40k-11e/usePanelVisibility.js`.

## Markup in text fields

Language-keyed description fields are edited with the shared markdown editor
(`CustomMarkdownEditor`) and rendered through the 11e markup engine. Authors can
use `<k>keyword</k>` for highlighted keywords, `<b>bold</b>`,
`<ul><li>…</li></ul>` lists, line breaks and `■` bullets (leader text). This is
the 11e markup described in [warhammer-40k-11e-format.md](warhammer-40k-11e-format.md),
not the 10e bracket/keyword-dictionary syntax.
