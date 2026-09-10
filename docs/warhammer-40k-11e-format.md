---
title: Warhammer 40K 11th Edition data format
description: Multi-language 11th edition (40k-11e) datasource format, language resolution, the dedicated renderset, and how it is wired into the app as a built-in datasource.
category: Data Formats
tags: [40k-11e, datasource, multi-language, i18n, localization, renderset]
related:
  - card-data-formats.md
  - custom-datasource-format.md
  - 40k-11e-card-editing.md
file_locations:
  - src/Helpers/localization.helpers.js
  - src/Helpers/external.helpers.js
  - src/Helpers/customSchema.helpers.js
  - src/Helpers/listPoints.helpers.js
  - src/Hooks/useDataSourceStorage.jsx
  - src/Hooks/use11eKeywordGlossary.js
  - src/Components/Warhammer40k-11e/
  - src/Components/Viewer/useMobileList.jsx
  - src/styles/40k-11e.less
---

# Warhammer 40K 11th Edition (`40k-11e`)

11th edition ships as a **built-in** datasource (like `40k-10e` and `aos`),
fetched at runtime from the `game-datacards/datasources` repo (`11th/gdc/`). The
card layout and look & feel are identical to 10th edition, but the data format
changed in three important ways:

1. **Every displayable string is a language-keyed object** — `{ "en": "...",
"de": "...", ... }` — in up to eight languages: `en, de, es, fr, it, ja, ko,
zh`. Translation coverage is uneven (core rules and enhancements are fully
   translated; datasheets are currently English-only; stratagems are mixed), so
   resolution **always falls back to English per field**.
2. **Abilities are objects, not flagged arrays.** The UI flags 10e used
   (`active`, `showAbility`, `showDescription`, `showAtTop`, …) are gone;
   everything present is shown. Invulnerable saves are simply `{ "value": "4+" }`.
3. **Rich-text markup** in descriptions: `<k>keyword</k>`, `<b>bold</b>`,
   `<ul><li>…</li></ul>`, `\r` line breaks and `■` bullets.

`faction_id`/`detachment_id` are UUIDs (not the short codes 10e used), and each
faction file contains everything (datasheets, stratagems, enhancements,
detachments, rules).

## Table of contents

- [Card-content language (i18n scope)](#card-content-language-i18n-scope)
- [Language resolution](#language-resolution)
- [Data pipeline](#data-pipeline)
- [The dedicated renderset](#the-dedicated-renderset)
- [Datasheet column layout](#datasheet-column-layout)
- [Rich-text markup](#rich-text-markup)
- [Keyword glossary (tooltips)](#keyword-glossary-tooltips)
- [Weapons](#weapons)
- [Stratagems](#stratagems)
- [Enhancements](#enhancements)
- [Points, unit sizes and roster surcharge](#points-unit-sizes-and-roster-surcharge)
- [Wargear options](#wargear-options)
- [Rule cards](#rule-cards)
- [Faction colours and symbols](#faction-colours-and-symbols)
- [Scope and limitations](#scope-and-limitations)
- [Where it is wired in](#where-it-is-wired-in)

## Card-content language (i18n scope)

The language selector only changes **card content**. The app UI/chrome stays in
English. The preference lives in settings as `language` (default `"en"`) and is
chosen via a "Card language" dropdown in **Settings → Datasources** (shown when
the active datasource is `40k-11e`).

## Language resolution

`src/Helpers/localization.helpers.js`:

- `SUPPORTED_LANGUAGES` / `LANGUAGE_LABELS` — the eight languages and their labels.
- `localize(value, language)` — returns `value[language]`, then `value.en`, then
  the first available language, then `""`. Plain strings pass through unchanged,
  so the same helper is safe on 10e (single-language) data.
- `getCardName(card, language)` — convenience for `card.name`.

## Data pipeline

- **Fetch:** `get40k11eData(language)` in `src/Helpers/external.helpers.js`
  fetches the 29 faction files, injects the missing `cardType` (`DataCard` for
  datasheets, `stratagem`, `enhancement`, leaves rule cards to the rules
  pipeline) and stamps `source: "40k-11e"`. Alongside them it fetches the two
  shared files: `keywords.json` (keyword glossary, see below) and `core.json` —
  the core stratagems (Command Re-roll, Fire Overwatch, …), which are exposed on
  every faction as `basicStratagems` and rendered under the "Basic stratagems"
  header in the stratagem list, mirroring the 10e core.json flow. Both degrade
  to empty when the datasource predates the file.
- **Names resolved at load:** only each card's top-level `name` is resolved to a
  string for the selected language. Dozens of non-renderer consumers (faction
  tree, card list, tabs, search, sort, export filenames) read `card.name` as a
  string, so resolving just the name keeps that whole stack untouched. Body
  fields stay multilingual and are localised at render time.
- **Cache:** `useDataSourceStorage.jsx` caches the result in localForage under
  `40k-11e` and records the `language` it was built for. Switching language
  refetches (the load effect depends on `settings.language`).

## The dedicated renderset

`src/Components/Warhammer40k-11e/` mirrors the 10e renderset but reads the 11e
shape directly via `localize(...)`. It emits a `data-40k-11e` style scope. The
card visual language is shared: `src/styles/40k-10e.less` applies its scoped
block to both `.data-40k-10e` and `.data-40k-11e`; `src/styles/40k-11e.less`
only adds the keyword/list bits for the new markup.

## Datasheet column layout

The unit card splits into a wide left column (`UnitCard/UnitWeapons.jsx`) and a
narrow abilities column (`UnitCard/UnitExtra.jsx`). Three blocks render in the
left column, in this order:

1. The ranged and melee weapon tables.
2. **Primarch abilities** (`UnitCard/UnitPrimarchAbilities.jsx`) — groups of
   named sub-abilities from `abilities.primarch`, rendered as a `.special`
   block. They sit here rather than in the abilities column (matching 10e)
   because the grouped rule text needs the extra width.
3. The **list-selected enhancement**
   (`UnitCard/UnitSelectedEnhancement.jsx`), described below.

Everything else — core/faction/other/wargear/special abilities and the damaged
profile — stays in the abilities column.

### The list-selected enhancement

An enhancement picked in the list builder is stored on the *list card* as
`selectedEnhancement` (written by `addDatacard` / `updateDatacard` in
`src/Components/Viewer/useMobileList.jsx`), alongside `unitSize` and
`isWarlord`. It is never merged into the datasheet's `abilities`, so it has no
editor panel and no show/hide flag.

Because every display path (tree preview, print, viewer) passes the list card
object straight to the renderer, `UnitSelectedEnhancement` can read the field
directly and render it read-only, reusing the primarch block styling with an
extra `.selected-enhancement` class. The enhancement name is the block heading —
Upgrade names already carry their "(Upgrade)" suffix in the datasource, so no
extra label is added. Cards outside a list have no `selectedEnhancement` and the
component renders nothing.

Note the shape asymmetry: `get40k11eData` resolves each enhancement's top-level
`name` to a plain string at load time while `description` stays language-keyed,
so the component localises both through `localize(...)`.

## Rich-text markup

`UnitCard/UnitAbilityDescription.jsx` exports `normalize11eMarkup` and
`MarkupText`. `normalize11eMarkup` converts `<k>…</k>` → `<span
class="gdc-keyword">`, normalises `\r` to `\n`, and puts `■` bullets on their own
line; `MarkupText` then renders it through ReactMarkdown (with `rehype-raw` +
sanitisation allowing `span[class]`, `span[style]`, `strong`, `ul`, `li`). Of the
styles only `color` is applied — that is what the shared editor's colour picker
writes — matching the 10e renderer. No keyword dictionary
is needed for this **highlighting** because keywords are already explicitly
tagged in the data. Hover **explanations** for keywords and core abilities come
from a separate glossary file — see [Keyword glossary](#keyword-glossary-tooltips).

## Keyword glossary (tooltips)

The 11e datasource ships a shared keyword glossary as `11th/gdc/keywords.json` (a
card object: `{ source, cardType: "keywords", compatibleDataVersion, keywords: [] }`).
Entries use the **custom-datasource glossary shape** (`key`, `name`,
`description`, `matchType`, `appliesTo`) so the same matcher serves both 11e and
custom datasources. `name`/`description` are English strings; translated entries
add `nameLoc`/`descriptionLoc` language maps:

```json
{
  "key": "rapid-fire",
  "name": "Rapid Fire",
  "description": "Increase the Attacks characteristic by X when targeting units within half range.",
  "matchType": "parameterized",
  "appliesTo": ["weapons"]
}
```

- **Scopes (`appliesTo`):** `weapons` (weapon-profile keywords such as `Assault`,
  `Rapid Fire`, `Anti-`) and `abilities` (unit core abilities such as `Deep
  Strike`, `Feel No Pain`, `Scouts`). `matchType` is `exact` or `parameterized`.
- **Fetch:** `get40k11eData` loads `keywords.json` alongside the faction files and
  attaches it to the datasource as `keywordGlossary`. A failed fetch (e.g. an
  older datasource that predates the file) degrades to an empty glossary.
- **Delivery:** components read it through `use11eKeywordGlossary()`, a
  non-throwing accessor over the data-source context, so a card rendered outside
  the provider (or for a different datasource) simply shows no tooltips.
- **Matching:** delegated to the shared `resolveKeywordEntry(tag, glossary, scope)`
  in `customSchema.helpers.js`, which honours `matchType`/`appliesTo`, the
  parameterized trailing value (`Rapid Fire 1`, `Deadly Demise D6+2`, `Feel No
  Pain 5+`, `Scouts 6"`) and the hyphenated `Anti-` form, preferring the longest
  matching name. Weapon keywords resolve against scope `weapons`; core abilities
  against `abilities` (matched on their canonical English name, which is what the
  card carries regardless of display language).
- **Rendering:** matched weapon keywords (`UnitWeaponKeyword.jsx`) and core
  abilities (`UnitCoreAbilities.jsx`) get a dotted-underline affordance and a
  hover tooltip whose description is localised (`descriptionLoc[lang]`, falling
  back to the English `description`) and rendered with the 11e
  `MarkupText`/`LocalizedMarkup` engine. Unmatched tags render plain.

## Weapons

A weapon is `{ profiles: [...], abilities?: [...] }`. Each profile carries the
language-keyed `name` plus the plain `range/attacks/skill/strength/ap/damage` and
`keywords`. The optional `abilities` are named rules that belong to the **whole
weapon** rather than to one profile (Overcharge on a transmatter inverter,
Conversion on an SP conversion beamer) — `{ name, description }`, both
language-keyed. `UnitCard/UnitWeapon.jsx` renders them as a full-width row under
the weapon's profiles, through the same markup engine as ability text, and
`UnitCardEditor/UnitWeapon.jsx` edits them per weapon. Weapons that have none
carry no `abilities` key at all, which the editor restores when the last one is
deleted.

## Stratagems

Beyond `when` / `target` / `effect`, a stratagem may carry `restrictions` — the
"cannot be used more than once per battle" style clause — which the card renders
as a fourth section. Only some stratagems have it (2 of the 11 core stratagems),
so it is an optional language-keyed field; see
[the editing doc](40k-11e-card-editing.md#fields-the-datasource-omits) for how
the editor adds and removes it. `fluff` (flavour text) is carried in the data but
not rendered, matching the 10e cards.

## Enhancements

Alongside `name`/`description`/`detachment`/`cost`, an enhancement carries the
fields that decide which units may take it in the list builder: `keywords` (a
unit must have one of them), `excludes` (it must have none of them) and
`equipableByNonCharacter`, which marks the "(Upgrade)" entries a non-Character
unit may take (up to three times). These are plain English strings — matching in
`listCategories.helpers.js` localises to English — and are edited in the
enhancement editor's "List eligibility" panel. They are not printed on the card.

## Points, unit sizes and roster surcharge

Each datasheet's `points` is an array of size tiers —
`{ cost, models, keyword, faction, detachment }` — plus (11e-only) an optional
`additionalCost: { cost, afterSelections }`.

- **Unit size (base cost):** in a list, a card's base cost is the chosen tier
  (`card.unitSize`, picked via the desktop unit config modal or the mobile
  add/edit sheets; single-tier datasheets auto-select). The pickers list tiers via
  `getSelectablePointsTiers` — only an explicit `active: false` hides a tier,
  because 11e tiers carry no `active` flag at all (10e tiers do). Tier `keyword`
  is language-keyed in 11e and localised for display. 11e cards that have not
  been configured default to their **cheapest** tier so they always count.
- **Roster surcharge (`additionalCost`):** a per-datasheet army-building
  surcharge — _not_ a per-model cost. Each copy of a datasheet beyond
  `afterSelections` selections adds `cost` to the list total. Example: Cerastus
  Knight Atrapos is `405` for the first and `+20` for each additional
  (`{ cost: "20", afterSelections: 1 }`).
- **Where it is applied:** `computeCategoryPoints(cards)` in `listPoints.helpers.js`
  sums base costs (+ enhancements) and adds the surcharge, grouping duplicates by
  datasheet identity (`id` + `source`). It backs the tree category badge, the list
  overview total (which shows the surcharge on its own line) and the text export,
  so all three agree. 10e lists are unaffected (they carry no `additionalCost`).
- **Restricted tiers (`faction` / `detachment`):** a tier can be priced for one
  faction keyword or one detachment, never both — 5 Assault Intercessors are 75,
  but 80 in a Blood Angels army. Both are language-keyed, and `null` means
  unrestricted. `getPointsTierRestriction` / `getPointsTierRestrictionLabel`
  resolve them; how a list narrows its tiers is covered in
  [40k-11e list building](40k-11e-list-building.md).
- **Where it is shown:** the card's points popover / all-points row
  (`UnitCard/UnitPoints.jsx`) — which names a tier's restriction next to it, as
  a sub-label in the popover table and in parentheses on the chips — the size
  pickers (desktop config modal, mobile add/edit sheets) as a note under the
  tier options, and the card editor (`UnitCardEditor/UnitPoints.jsx`), which can
  also edit the surcharge and each tier's faction or detachment.

## Wargear options

11e datasheets carry their wargear twice, with the same content in both:

- `wargearOptions` — the structured groups the datasheet offers:
  `{ instruction, options: [{ name, cost }] }`, with `instruction` and `name`
  language-keyed and `cost` a string (mostly `"0"`).
- `wargear` — an array of language-keyed sentences: the same instructions
  flattened, with their options appended as `◦` bullets, or just `"None"` on the
  datasheets that offer nothing.

Every datasheet in the shipped data that has real wargear has it as groups
(the handful without groups — Drop Pod, Aegis Defence Line, Spore Mines and so
on — have `wargear: ["None"]`), so **the groups are the source of truth and the
sentences are only a fallback**. Rendering both printed every instruction
twice.

The data repeats an identical group once per model in the unit, so
`getWargearOptionGroups(card)` (`listPoints.helpers.js`) collapses groups that
are identical in instruction and in options-at-prices. `getPaidWargearOptions`
builds on it for the list builder, keeping only the options that cost points.

`UnitCard/UnitWargear.jsx` renders the groups, appending `(+N pts)` to an option
that costs points, and falls back to the sentences (minus a lone `"None"`) only
when a card has no groups at all — hand-made cards and older imports. When
neither has anything to say the section disappears; `showWargear === false`
hides it outright. `UnitCardEditor/UnitWargearOptions.jsx` follows the same
rule in the one "Wargear Options" panel: the group editor while the card has
groups, the sentence editor otherwise, plus an "Add wargear option" button so a
text-only card can move up to structured options (and deleting the last group
brings the sentences back). Costs stay strings — the shape the datasource uses
and the points helpers coerce.

## Rule cards

Rule cards are built from each faction's `rules: { army, detachment }` object —
the same structure 10e uses (`useDataSourceItems.js`). The only differences are
that `name`/`text` are language-keyed (resolved/localised by `RuleCard11e`) and
the card `source` is stamped from the active datasource so it routes to the 11e
renderer.

Each rule part has a `type`: `text`, `header` and `accordion` render on the card;
`quote` and `textItalic` are rulebook examples the renderer skips. The editor
lists all five so a skipped part keeps its type when its card is edited.

## Faction colours and symbols

- **Colours:** 11e faction files now carry `colours: { banner, header }` (ported
  from the 10e files in the datasources repo), so the renderer's existing
  `cardFaction.colours` lookup works unchanged.
- **Symbols:** `faction_id` is a UUID, so `UnitFactionSymbol`/`RuleCard` resolve
  the symbol from the human-readable faction name via a name→code map (reusing
  the codes from `FactionSelect.jsx`), falling back to no symbol when unknown.

## Scope and limitations

- **v1 is display/print/export/share only.** 11e cards are read-only in the
  editor panel (the 10e editor mutates flag fields the 11e data does not have).
  Cards can still be added to a category and printed/shared.
- **New 11e-only content is out of scope for v1:** the full core rulebook,
  mission/objective cards and battlefield deployment layout maps.
- 11e is **built-in only**; it is not offered as a base system in the custom
  Datasource Editor/Wizard yet.

## Where it is wired in

- Config/fetch: `.env.example` (`VITE_DATASOURCE_11TH_URL`),
  `src/Helpers/external.helpers.js`, `src/Hooks/useDataSourceStorage.jsx`,
  `src/Hooks/useSettingsStorage.jsx`.
- Source-routing (`case "40k-11e"`): `src/App.jsx`, `src/Pages/Viewer.jsx`,
  `src/Components/Print/CardRenderer.jsx`, `src/Components/MiddlePanel/CardView.jsx`,
  `src/Components/Shared/SharedCardDisplay.jsx`,
  `src/Components/Viewer/ViewerCardDisplay.jsx`,
  `src/Components/Viewer/mobileDatasourceConfig.jsx`,
  `src/Components/Viewer/mobileGameSystems.js`, `src/Components/Viewer/MobileFaction.jsx`.
- Selectors: `src/Components/DatasourceSelector/DatasourceSelector.jsx`,
  `src/Components/SettingsModal.jsx` (datasource lists + language picker).
