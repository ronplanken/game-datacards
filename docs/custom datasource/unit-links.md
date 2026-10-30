---
title: Unit Links
description: Link a unit card in a custom datasource to other unit cards, for example the units a Leader can lead or a Support unit can support. Links are clickable on every renderer and editable in the desktop, datasource and mobile editors.
category: custom-datasource
tags: [unit-links, leader, support, attached-units, 40k-10e, 40k-11e, aos, starcraft-tmg, custom-datasource]
related:
  - datasource-schema-architecture.md
  - ../custom-datasource-format.md
file_locations:
  helpers: src/Helpers/unitLinks.helpers.js
  presets_and_validation: src/Helpers/customSchema.helpers.js
  schema_editor: src/Components/DatasourceEditor/editors/UnitLinksSchemaEditor.jsx
  renderer: src/Components/DatasourceEditor/cards/shared/DsUnitLinks.jsx
  navigation_context: src/Components/DatasourceEditor/cards/shared/UnitLinkContext.jsx
  mobile_editor: src/Components/Viewer/MobileEditor/sections/UnitLinksSection.jsx
  wizard: src/Components/DatasourceWizard/steps/StepUnitMetadata.jsx
  premium_editor: ../gdc-premium/src/Components/CustomCardEditor/editors/index.jsx
---

# Unit Links

## Table of Contents

- [Overview](#overview)
- [Schema](#schema)
- [Card data](#card-data)
- [Where links show up](#where-links-show-up)
- [Where links are edited](#where-links-are-edited)
- [Navigation](#navigation)
- [Deleted and renamed cards](#deleted-and-renamed-cards)

## Overview

A unit card type can define one or more link groups. Each group has a heading (for example "Leader" or "Support") and an optional description. On each card, the author picks other unit cards from the same datasource for every group. The card shows the groups with the linked unit names, and clicking a name opens that card.

The groups are generic. A datasource can use them for leaders, support units, "Led by" lists, transports or anything else that points at other units.

## Schema

Groups are defined per unit card type under `schema.unitLinks`:

```js
unitLinks: {
  groups: [
    { key: "leads", label: "Leader", description: "This unit can lead the following units:" },
    { key: "supports", label: "Support", description: "This unit can support the following units:" },
  ],
}
```

- `key` must be unique within the card type. It is the key the card data is stored under.
- `label` is required.
- `description` is optional.

`validateSchema` checks these rules. `unitLinks` is a reserved key, so it cannot be used for a custom unit field.

Presets:

| Base system | Seeded groups |
|-------------|---------------|
| `40k-10e` | Leader (`leads`) |
| `40k-11e` | Leader (`leads`), Support (`supports`) |
| `aos`, `starcraft-tmg`, `blank` | none |

Groups can be added, renamed, reordered and removed in the **Unit Links** section of the card type editor, and toggled in the Unit Metadata step of the datasource wizard.

## Card data

Entries are stored on the card as `card.unitLinks[groupKey]`:

```js
unitLinks: {
  leads: [{ cardId: "3f2a…", name: "Blood Claws" }, { name: "Wulfen" }],
}
```

- With `cardId`: a link to the card with that `id` anywhere in the datasource (any faction).
- Without `cardId`: a free-text unit name that is shown but not clickable.
- `name` is kept as a fallback for when the linked card cannot be found.
- Plain strings are accepted and read as free-text names.

`card.showUnitLinks[groupKey] = false` hides that group on the card. The desktop card editor sets this with the switch on each group panel.

Only unit cards can be linked. A card cannot link to itself.

## Where links show up

`DsUnitLinks` renders the groups and is used by every unit renderer:

| Renderer | Layout |
|----------|--------|
| `Ds40kUnitCard` (40k-10e, 40k-11e) | Heading bar plus bullet list in the abilities column, in the same style as the built-in Leader / Led by block |
| `DsAosWarscrollCard` | Ability-style box per group |
| `DsStarcraftUnitCard` | Inline phase row per group |
| `CustomUnitCard` (blank / fallback) | Ability row per group |

Cards rendered through a Designer template do not show unit links.

## Where links are edited

- **Datasource editor and desktop editor** (premium `CustomUnitEditor`): one collapsible panel per group with a searchable card picker, an "Other (type a name)" option for free text, drag-and-drop reordering and a visibility switch.
- **Mobile editor**: one section per group with a card picker and a free-text option.

"Add unit" picks the first unit card that is not linked in that group yet.

## Navigation

The renderers read the datasource and a navigation handler from `UnitLinkContext`:

| Surface | Provider | Click behaviour |
|---------|----------|-----------------|
| Datasource editor preview | `DatasourceCardPreview` | Selects the linked card in the editor. The left panel follows to the card's faction and card type. |
| Desktop viewer and editor | `CustomCardDisplay` | Opens `/viewer/<faction>/<card>` |
| Mobile viewer | `CustomCardDisplay` | Opens `/mobile/<faction>/<card>` |
| Print | `CustomCardDisplay` with `type="print"` | Names only, not clickable |

## Deleted and renamed cards

A link resolves the target card by `id` every time it renders, so a renamed card shows its new name. When the target card is deleted, the stored name is shown struck through and is not clickable. The editors show such an entry as a free-text name, which can then be pointed at another card or removed.
