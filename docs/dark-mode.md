---
title: Dark Mode
description: Custom site-wide dark theme - theme preference, design tokens, antd overrides, how components opt in, and how datacards and print output stay light
category: features
tags: [theme, dark-mode, css, tokens, antd, accessibility]
related:
  - welcome-wizard-v2.md
  - release-notifications.md
file_locations:
  tokens: src/styles/theme.css
  antd_overrides: src/styles/antd-dark.css
  helpers: src/Helpers/theme.helpers.js
  hook: src/Hooks/useTheme.js
  prepaint_script: index.html
  settings_default: src/Hooks/useSettingsStorage.jsx
  desktop_setting: src/Components/SettingsModal.jsx
  mobile_setting: src/Components/Viewer/MobileMenu.jsx
  tests:
    - src/Helpers/__tests__/theme.helpers.test.js
    - src/Hooks/__tests__/useTheme.test.jsx
    - src/styles/__tests__/theme.tokens.test.js
---

# Dark Mode

## Table of Contents

- [Overview](#overview)
- [Theme preference](#theme-preference)
- [How the theme is applied](#how-the-theme-is-applied)
- [Design tokens](#design-tokens)
- [Ant Design overrides](#ant-design-overrides)
- [Styling a component for dark mode](#styling-a-component-for-dark-mode)
- [What stays light](#what-stays-light)
- [Premium package](#premium-package)
- [Verification](#verification)
- [Checklist for new UI](#checklist-for-new-ui)

## Overview

The app has a custom dark theme. It does not use the built-in Ant Design dark theme (`antd.dark.css`). Instead
it sets `data-theme="dark"` on `<html>`, defines a set of `--gdc-*` CSS custom properties for light and dark,
and restyles the Ant Design 4 components it uses with selectors scoped to that attribute.

Light mode is the default and is visually unchanged. Every dark rule is scoped to `html[data-theme="dark"]`, or
uses a token whose light value equals the colour it replaced.

## Theme preference

`settings.theme` in `localStorage.settings` holds `"light"`, `"dark"` or `"system"`. The default is `"light"`.
`"system"` follows `prefers-color-scheme` and reacts when the device setting changes.

| Where | Control |
|-------|---------|
| Desktop | Settings modal, Appearance tab (Light / Dark / System) |
| Mobile | Settings bottom sheet, Appearance section (select) |

Unknown values fall back to the default (`normalizeThemePreference`).

## How the theme is applied

1. `index.html` runs a small inline script before any CSS or React loads. It reads `settings.theme`, resolves
   `"system"` with `matchMedia`, and sets `data-theme` and `color-scheme` on `<html>`. This avoids a flash of the
   light theme on load. The logic mirrors `resolveTheme` and a test keeps them in sync.
2. `ThemeController` (from `src/Hooks/useTheme.js`) is mounted inside `SettingsStorageProviderComponent` in
   `src/index.jsx`. It applies the resolved theme whenever the preference or the system setting changes, and
   updates `<meta name="theme-color">`.
3. `useTheme()` returns `{ preference, theme, isDark, setPreference }` for components that need it.

## Design tokens

Defined in `src/styles/theme.css`. Light values on `:root`, dark values on `html[data-theme="dark"]`. The dark
palette is navy-tinted to match the existing `#001529` header.

| Token | Use | Light | Dark |
|-------|-----|-------|------|
| `--gdc-bg-app` | Page background | `#f0f2f5` | `#0b1220` |
| `--gdc-bg-surface` | Panels, cards | `#ffffff` | `#111a2b` |
| `--gdc-bg-surface-alt` | Headers, toolbars, zebra rows | `#fafafa` | `#152034` |
| `--gdc-bg-elevated` | Modals, dropdowns, popovers | `#ffffff` | `#18243a` |
| `--gdc-bg-sunken` | Wells, code blocks | `#f5f5f5` | `#0d1626` |
| `--gdc-bg-input` | Form controls | `#ffffff` | `#0d1626` |
| `--gdc-bg-hover` / `--gdc-bg-active` | Hover and selected rows | | |
| `--gdc-border` / `-strong` / `-subtle` | Borders and dividers | `#d9d9d9` | `#2b3a52` |
| `--gdc-text` | Body text | `rgba(0,0,0,0.88)` | `#e6ebf2` |
| `--gdc-text-secondary` | Secondary text | `rgba(0,0,0,0.65)` | `#b0bbcb` |
| `--gdc-text-tertiary` | Hints, placeholders | `rgba(0,0,0,0.45)` | `#8b98ab` |
| `--gdc-primary*`, `--gdc-link` | Brand blue | `#1677ff` | `#3c89e8` (text `#6aaeff`) |
| `--gdc-success*`, `--gdc-warning*`, `--gdc-danger*` | Status colours with `-bg`, `-border`, `-text` | | |
| `--gdc-shadow-sm` / `--gdc-shadow` / `--gdc-shadow-lg` | Shadows | | |

`src/styles/__tests__/theme.tokens.test.js` checks that both themes define the same tokens and that the dark
text tokens reach WCAG AA (4.5:1) on every dark surface.

## Ant Design overrides

`src/styles/antd-dark.css` restyles the antd 4 components in use: layout, typography, buttons, inputs, selects,
dropdowns, menus, modals, drawers, popovers, tooltips, cards, collapse, tabs, tree, table, list, checkbox, radio,
switch, slider, tags, badges, alerts, messages, notifications, spin, skeleton, progress, segmented, upload,
pagination, steps, descriptions and breadcrumb. Every selector starts with `html[data-theme="dark"]` (enforced by a
test), so it outranks the default antd rules without `!important` and has no effect in light mode. Base element
colours (`h1`-`h6`, `a`) use `:where(html[data-theme="dark"])` to keep their specificity at the antd level, so
component styles still win.

## Styling a component for dark mode

In order of preference:

1. Files with their own custom properties (`--wz-*`, `--designer-*`, `--ie-*`, `--help-*`, `--me-*`, `--wnw-*`,
   `--glass-*`, `--menu-*`, ...) redefine those properties under `html[data-theme="dark"] <scope>` and map them to
   `--gdc-*` tokens.
2. Hard-coded colours get a `html[data-theme="dark"] .selector { ... }` rule at the end of the same file, or are
   replaced with a `var(--gdc-*)` token when the token's light value is identical.
3. Inline JSX colours on app chrome move to a CSS class, or to a token with an identical light value.

## What stays light

- Datacards. The rendered game cards (40K, AoS, Necromunda, Starcraft, basic/custom, designer templates) are
  artwork that is printed and exported, so they keep their own colours. The `.data-40k-10e`, `.data-aos`, ...
  classes are game-system scopes that also wrap app UI (for example the mobile viewer), so dark styles cannot simply
  skip everything inside them; card styles set their colours explicitly instead.
- Print and export output. `.print-page` stays white, `@media print` resets the page background, and PNG export
  renders the cards as they look in light mode. Only the on-screen preview chrome around them is dark.
- `.gdc-light-scope` resets the tokens to their light values for any island that has to stay light.

## Premium package

The `@gdc/premium` components (auth, account, subscription, sync, sharing, admin, designer, community browser,
custom datasources) use the same tokens and the same `html[data-theme="dark"]` scoping. The designer canvas itself
is a datacard and stays unchanged.

## Verification

Each page, modal, drawer and wizard step was rendered with Playwright in both themes on desktop (1440x900) and on
a phone viewport (390x844). A contrast audit walked every visible text node, composited its background, and
flagged anything below WCAG AA (4.5:1, or 3:1 for large text), plus large surfaces that were still near-white in
dark mode. Light-mode screenshots were compared pixel by pixel with the pre-change baseline.

## Checklist for new UI

- Use `--gdc-*` tokens for new colours instead of literals.
- If a literal is unavoidable, add the dark counterpart in a `html[data-theme="dark"]` rule.
- Check the component in both themes, including hover, focus, selected and disabled states.
- Never apply dark tokens inside a datacard or on print output.
