---
title: Conditional Card Content
description: Per-card toggles on custom unit cards and how the Card Designer uses them to show, hide or extend parts of a card (visibility rules, if/unless binding filters, frame text fitting)
category: features
tags: [custom-datasource, designer, bindings, visibility, templates]
related:
  - custom datasource/datasource-schema-architecture.md
file_locations:
  rules: src/Helpers/visibilityRules.js
  filters: src/Helpers/bindingResolver.js
  unit-fields-validation: src/Helpers/customSchema.helpers.js
  unit-fields-defaults: src/Helpers/customSchemaBindings.js
  unit-fields-schema-editor: src/Components/DatasourceEditor/editors/UnitFieldsSchemaEditor.jsx
  mobile-editor: src/Components/Viewer/MobileEditor/sections/NameSection.jsx
  premium-layout: ../gdc-premium/src/Components/Designer/templateLayout.js
  premium-visibility: ../gdc-premium/src/Components/Designer/visibility.js
  premium-panel: ../gdc-premium/src/Components/Designer/PropertiesPanel/sections/VisibilitySection.jsx
---

# Conditional Card Content

## Table of contents

- [Overview](#overview)
- [Extra unit fields](#extra-unit-fields)
- [Raw values and display values](#raw-values-and-display-values)
- [Visibility rules](#visibility-rules)
- [The if and unless filters](#the-if-and-unless-filters)
- [Scaling text to fit a frame](#scaling-text-to-fit-a-frame)
- [Example: combat role after the unit name](#example-combat-role-after-the-unit-name)

## Overview

A custom datasource can give unit cards extra per-card fields, such as a toggle. A Card Designer template can then use those values to decide what to show. Three tools work together:

1. Extra unit fields (community) store a per-card value.
2. Visibility rules (premium designer) hide any element based on a value.
3. Frame text fitting (premium designer) scales all texts in a frame by the same factor so they fit.

The `if` and `unless` binding filters cover the case where a value should be added to or left out of a single text.

## Extra unit fields

Defined in `schema.metadata.fields` of a unit card type. See the schema reference for the full field format and validation rules. The Datasource Editor edits them in the "Extra Fields" section of the unit schema. Values are stored flat on the card (`card.showRoleInName`), edited in the Basic information panel on desktop and in the name section on mobile, and listed under "Basic Info" in the designer binding picker.

`hasCombatRole`, `hasArmySlot` and `hasSubcategory` values are now listed in the binding picker as well (`combatRole`, `armySlot`, `subcategory`), together with `subname`.

## Raw values and display values

Before a custom card reaches the Card Designer renderer, `applyBooleanDisplayValues` replaces booleans that define `onValue` / `offValue` with that text. Stats, weapon columns and extra unit fields are affected. A rule that checks "is on" would then see a string such as `"Yes"`.

To avoid that, `CustomCardDisplay`, `DatasourceCardPreview` and the designer sample pass both cards to `TemplateRenderer`: `card` (display values) and `rawCard` (raw values, with extra field defaults filled in). Visibility rules read from `rawCard`. Inside a repeater, the row is matched to the raw array item by `source` and index.

## Visibility rules

Stored on any template element as:

```js
visibleWhen: {
  match: "all" | "any",
  rules: [{ path: "showRoleInName", op: "on" }, { path: "combatRole", op: "notEmpty" }],
}
```

Operators (`VISIBILITY_OPERATORS` in `visibilityRules.js`): `on`, `off`, `equals`, `notEquals`, `contains`, `notContains`, `greaterThan`, `lessThan`, `empty`, `notEmpty`. Text compares ignore case. `contains` on an array matches a whole entry. A rule without a path, or with an unknown operator, passes. An element without rules is always shown.

Paths resolve against the same context as bindings (`normalizeCardForBinding`), so `keywords`, flattened weapon paths and repeater item fields work. Inside a repeater frame the rules are checked per row.

Hidden elements behave like `hideWhenEmpty`. Inside a frame they no longer push later children down, but their design space stays. In a frame with fit text and auto layout, the remaining children close the gap. At the root of the card a hidden element keeps its space.

## The if and unless filters

`{{combatRole | if:"showRoleInName" | prefix:" "}}` resolves to an empty string unless `showRoleInName` is on. `unless` is the inverse. Without a path both filters leave the value unchanged. The "on" test is `isOnValue` from `visibilityRules.js`. These filters read the binding context, which holds display values, so point them at fields without `onValue` / `offValue`.

## Scaling text to fit a frame

A frame with `fitText: true` and at least one fixed axis scales every text child by one shared factor of its own font size until the content fits the frame, down to `minTextScale` (default 0.3). Sizes are rounded down to half points. Frames with horizontal or vertical auto layout are laid out again at render time with the measured text sizes, so a shorter or longer value moves the next text along. Hidden children are removed before fitting. A text's own Shrink setting is ignored inside a fitting frame.

## Example: combat role after the unit name

1. In the Datasource Editor, enable Combat Role and add an extra Toggle field with key `showRoleInName`, default on.
2. In the Card Designer, make a frame with horizontal auto layout and a fixed width. Turn on "Scale text down to fit the frame".
3. Put a `{{name}}` text and a `{{combatRole}}` text in the frame, both set to auto width.
4. Give the role text a visibility rule: `showRoleInName` is on.

When the user switches the toggle off on a card, the role text disappears and the name scales back up to its own size.
