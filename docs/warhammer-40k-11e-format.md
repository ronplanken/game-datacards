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
  - src/Helpers/keyword11eGlossary.helpers.js
  - src/Hooks/useDataSourceStorage.jsx
  - src/Hooks/use11eKeywordGlossary.js
  - src/Components/Warhammer40k-11e/
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
- [Rich-text markup](#rich-text-markup)
- [Keyword glossary (tooltips)](#keyword-glossary-tooltips)
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
  pipeline) and stamps `source: "40k-11e"`.
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

## Rich-text markup

`UnitCard/UnitAbilityDescription.jsx` exports `normalize11eMarkup` and
`MarkupText`. `normalize11eMarkup` converts `<k>…</k>` → `<span
class="gdc-keyword">`, normalises `\r` to `\n`, and puts `■` bullets on their own
line; `MarkupText` then renders it through ReactMarkdown (with `rehype-raw` +
sanitisation allowing `span[class]`, `strong`, `ul`, `li`). No keyword dictionary
is needed for this **highlighting** because keywords are already explicitly
tagged in the data. Hover **explanations** for keywords and core abilities come
from a separate glossary file — see [Keyword glossary](#keyword-glossary-tooltips).

## Keyword glossary (tooltips)

The 11e datasource ships a shared keyword glossary as `11th/gdc/keywords.json` (a
card object: `{ source, cardType: "keywords", compatibleDataVersion, keywords: [] }`).
Each entry is multilingual and tagged with a category:

```json
{
  "key": "rapid-fire",
  "category": "weapon",
  "name": { "en": "Rapid Fire" },
  "description": { "en": "Increase the Attacks characteristic by X when targeting units within half range." }
}
```

- **Categories:** `weapon` (weapon-profile keywords such as `Assault`, `Rapid
  Fire`, `Anti`) and `core` (unit core abilities such as `Deep Strike`, `Feel No
  Pain`, `Scouts`).
- **Fetch:** `get40k11eData` loads `keywords.json` alongside the faction files and
  attaches it to the datasource as `keywordGlossary`. A failed fetch (e.g. an
  older datasource that predates the file) degrades to an empty glossary.
- **Delivery:** components read it through `use11eKeywordGlossary()`, a
  non-throwing accessor over the data-source context, so a card rendered outside
  the provider (or for a different datasource) simply shows no tooltips.
- **Matching:** `resolve11eKeywordEntry(tag, glossary, category)` matches a card
  tag against each entry's canonical **English** name (card tags are English
  regardless of the selected card language). It accepts an optional trailing
  parameter value (`Rapid Fire 1`, `Deadly Demise D3`, `Feel No Pain 5+`,
  `Scouts 6"`) and the hyphenated `Anti-X` form, preferring the longest matching
  name when several entries match.
- **Rendering:** matched weapon keywords (`UnitWeaponKeyword.jsx`) and core
  abilities (`UnitCoreAbilities.jsx`) get a dotted-underline affordance and a
  hover tooltip whose **localised** description is rendered with the 11e
  `MarkupText`/`LocalizedMarkup` engine (so `<k>`/`<b>` markup and the selected
  card language are respected). Unmatched tags render plain, exactly as before.

## Rule cards

Rule cards are built from each faction's `rules: { army, detachment }` object —
the same structure 10e uses (`useDataSourceItems.js`). The only differences are
that `name`/`text` are language-keyed (resolved/localised by `RuleCard11e`) and
the card `source` is stamped from the active datasource so it routes to the 11e
renderer.

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
