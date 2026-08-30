---
title: Mobile card editor
description: How the mobile card editor resolves a card into editor sections, and how it edits multi-language (40k-11e) cards by projecting them into the active card language and folding each change back without touching the other languages.
category: Components
tags: [mobile, editor, 40k-11e, multi-language, i18n, localization]
related:
  - 40k-11e-card-editing.md
  - warhammer-40k-11e-format.md
  - card-data-formats.md
file_locations:
  - src/Components/Viewer/MobileEditor/MobileCardEditor.jsx
  - src/Components/Viewer/MobileEditor/editorSchemaResolvers.js
  - src/Components/Viewer/MobileEditor/localizedCard.js
  - src/Components/Viewer/MobileEditor/sections/
  - src/Components/Viewer/MobileEditor/weapons/
  - src/Components/Viewer/MobileEditor/shared/nameObjects.js
  - src/Pages/ViewerMobile.jsx
---

# Mobile card editor

The mobile viewer edits cards that live in a list or a cloud category. Tapping
**Edit** on such a card opens `MobileCardEditor`, a full-screen sheet of
collapsible sections, and every change is written straight back to the stored
card through `useMobileList().updateCardData`.

Cards browsed from the datasource are not editable — only a card that was added
to a list or a cloud category has somewhere to save to. `ViewerMobile` decides
this from the router state it was navigated with (`listCard` / `cloudCard`).

## Table of contents

- [Section resolution](#section-resolution)
- [Editing multi-language cards](#editing-multi-language-cards)
  - [Why a projection](#why-a-projection)
  - [The `__i18n` sidecar](#the-__i18n-sidecar)
  - [Untouched fields stay untouched](#untouched-fields-stay-untouched)
  - [What the spec covers](#what-the-spec-covers)
- [Shape differences between editions](#shape-differences-between-editions)

## Section resolution

`resolveEditorSections(card, gameSystem, schema)` turns a card into an array of
section descriptors — `{ key, label, type, config }` — and `MobileCardEditor`
renders each one with the component registered for its `type`. Weapons are the
exception: their section is a summary row that drills down into a weapon list and
then a profile editor.

There is one resolver per base system (`40k-10e`, `40k-11e`, `aos`, custom
schemas, plus a generic fallback). A resolver only emits a section when the card
actually has that data, so a stratagem gets a Details section and a unit gets
stats, weapons and abilities.

The section components are shared across all systems. Where a system's data
differs in **shape** rather than in kind, the resolver says so in the section's
`config` instead of the component branching on the game system — see
[Shape differences between editions](#shape-differences-between-editions).

## Editing multi-language cards

11th edition (`40k-11e`) stores every displayable string as a language-keyed
object: `{ en: "Leader", de: "Anführer", … }`. See
[40k-11e-card-editing.md](40k-11e-card-editing.md) for the format and for how the
desktop editor handles it.

The mobile editor edits **one language at a time** — the card language picked in
mobile Settings (`settings.language`) — exactly like the desktop editor. It gets
there differently, though: rather than teaching every section component to read
through `localize` and write through `setLocalizedField`, the editor works on a
*projection* of the card, in `src/Components/Viewer/MobileEditor/localizedCard.js`:

```
projectCard(card, spec, language)   ->  every localized field resolved to a plain
                                        string in the active language
mergeCard(view, spec, language)     ->  that view folded back into language-keyed
                                        shape, other languages untouched
```

`MobileCardEditor` projects the card once when it opens, hands the projection to
the sections, and merges on every save and on close. `getLocalizationSpec`
returns `null` for every single-language source, and then both calls are
pass-throughs — 10e, AoS and custom datasources take exactly the path they did
before.

### Why a projection

The sections all read and write plain strings. Feeding them a language-keyed
object directly would render `[object Object]` and, worse, save a plain string
over the whole language map — which is why 11e cards used to have no Edit button
on mobile at all.

### The `__i18n` sidecar

A merge cannot simply walk the view and the original card side by side: sections
add, remove and reorder array items, so the *n*th entry of the edited view is not
necessarily the *n*th entry of the card. Merging by index would fold one
keyword's text into another keyword's translations.

So the projection carries each field's original language map along with it, in an
`__i18n` key on the object that owns the field:

```js
// card                                  // projection (language: "de")
{ name: { en: "Bolt rifle",              { name: "Boltgewehr",
          de: "Boltgewehr" },              range: "24",
  range: "24" }                            __i18n: { name: { en: …, de: … } } }
```

Sections copy objects wholesale when they edit them (`{ ...item, name: value }`),
so the sidecar travels with its entry through deletions and reorders. On merge,
each field is written back with `setLocalizedFieldSeeded(sidecar, language,
value)`; an item that has no sidecar is one the user just added, and is seeded as
`{ [language]: value }` so it is multilingual from its first edit.

Arrays whose *entries* are themselves localized strings (unit `keywords`,
`composition`, `wargear`) have no object to hang a sidecar on, so they project as
`{ name }` objects instead — a shape `StringListSection` already accepts, and
that `nameObjects.js` converts to and from plain chips for the keyword editor.

The merge strips every `__i18n` key, so nothing ever reaches storage.

### Untouched fields stay untouched

Language coverage in the 11e data is uneven: a field that only has English
projects as its English fallback. Writing that back would stamp a copy of the
English text into the active language on every save, for every field the user
never opened. So a field whose edited text still equals its projection is
restored exactly as it came in, and only genuinely changed fields are written.

Two related rules keep the saved card in the shape the datasource ships:

- A field the datasource omits (a stratagem's `restrictions`, a new ability's
  `description`) stays omitted until it actually has text.
- A points tier's `detachment` / `faction` restriction clears back to `null`,
  which is what the points helpers test for.

### What the spec covers

The spec lists which fields are language-keyed, per 11e card type. Anything not
in it passes through both directions untouched, which is how the plain fields
stay plain — a unit's `name` and `subname`, `factions[]`, weapon keywords and
numeric stats, `abilities.invul.value`, and an enhancement's `keywords` /
`excludes` (matched in English by the list builder).

The spec mirrors the field table in
[40k-11e-card-editing.md](40k-11e-card-editing.md#plain-vs-language-keyed-fields);
the one deliberate difference is that top-level `name` is absent for **every**
card type, because the datasource loader (`get40k11eData`) already resolves it to
a plain string before a card is ever stored.

## Shape differences between editions

11e is close to 10e but not identical, and the differences are passed to the
shared sections as config rather than branched on inside them:

| Difference | Config |
|---|---|
| No `active` flag on stat profiles, weapons or weapon profiles | `newProfileDefaults`, `newWeaponDefaults`, `hasActiveFlag` |
| Core / faction abilities are `{ name }` objects, not bare strings | `itemShape: "object"` on the ability category |
| Unit keywords are objects too (they are language-keyed) | `keywordsAreObjects` |
| No per-ability `showAbility` / `showDescription` flags | `newAbilityDefaults`, `hasShowToggle` |
| Invulnerable save is a bare value with no info line | `valueOnly` |
| Points are tiers with detachment / faction restrictions and a per-copy surcharge | `hasActive`, `hasRestrictions`, `hasAdditionalCost` |
| Weapons can carry their own named abilities (Overcharge, …) | `hasWeaponAbilities` |

Wargear is the one place the editor picks between two fields: a card's structured
`wargearOptions` groups win when it has any, and the free-form `wargear`
sentences are edited only when it has none — the same rule the card renderer and
the desktop panel follow, so the editor always edits the wargear that reaches the
card.
