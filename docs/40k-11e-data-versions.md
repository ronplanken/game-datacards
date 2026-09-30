---
title: 40k 11th Edition Data Versions
description: How users pin the 11th edition datasource to an older data version, the versions.json manifest in the datasources repo, and how the local cache follows the selection
category: features
tags: [40k-11e, datasource, data-version, settings, cache]
related:
  - warhammer-40k-11e-format.md
file_locations:
  manifest: game-datacards/datasources 11th/versions.json
  fetch: src/Helpers/external.helpers.js
  helpers: src/Helpers/dataVersion11e.helpers.js
  hook: src/Hooks/use11eDataVersions.js
  cache: src/Hooks/useDataSourceStorage.jsx
  settings: src/Hooks/useSettingsStorage.jsx
  desktop_ui: src/Components/SettingsModal.jsx
  mobile_ui: src/Components/Viewer/MobileSettings40k.jsx
---

# 40k 11th Edition Data Versions

## Table of Contents

- [Overview](#overview)
- [The versions manifest](#the-versions-manifest)
- [Adding a version after a data update](#adding-a-version-after-a-data-update)
- [Settings](#settings)
- [Loading and caching](#loading-and-caching)
- [Limitations](#limitations)

## Overview

By default the 11th edition datasource loads the latest data from the `main`
branch of the datasources repo. Users can pin an older data version instead,
for example for an event that still runs on the previous points and rules.
The selector is shown in desktop Settings (Datasources tab) and in the mobile
settings menu when the 11th edition datasource is active.

## The versions manifest

The list of older versions lives in the datasources repo at
`11th/versions.json`, one level above the `11th/gdc` folder the app loads data
from. The app derives the manifest URL from `VITE_DATASOURCE_11TH_URL`.

```json
{
  "versions": [
    {
      "version": 946,
      "url": "https://raw.githubusercontent.com/game-datacards/datasources/<commit>/11th/gdc"
    }
  ]
}
```

- `version` is the data version number (the `compatibleDataVersion` in the data files).
- `url` is the base URL for that version. It points at a fixed commit, so the
  files never change after they are listed.
- The latest version is not listed. "Latest" always means the `main` branch.

Entries with a non-integer `version` or an empty `url` are ignored. The app
sorts entries newest first.

## Adding a version after a data update

When a new data version lands on `main`, add the version it replaces:

1. Find the last commit before the "Update data version to <new>" commit. That
   commit holds the final data for the previous version.
2. Add an entry with that version number and a raw URL on that commit.

Use the last commit of a version, not the `11e-<version>` tag. The tags mark
the first commit of each version, and several versions received more data
commits after their tag.

## Settings

The selection is stored in `settings.dataVersion11e`:

- `null` means Latest.
- `{ version, url }` pins a version. The URL is stored with the version so the
  app can load the pinned data without fetching the manifest first.

If the manifest cannot be fetched, the selector still lists Latest and the
pinned version.

## Loading and caching

`get40k11eData(language, dataVersion)` loads all faction files,
`keywords.json` and `core.json` from the pinned URL, or from
`VITE_DATASOURCE_11TH_URL` when nothing is pinned. The result records:

- `dataVersion`: the pinned version number, or `null` for Latest.
- `compatibleDataVersion`: the data version of the loaded files. Settings shows it
  under the datasource details, marked "(pinned)" when a version is pinned.

`useDataSourceStorage` reuses the `40k-11e` cache only when both the language
and `dataVersion` match the settings. Changing the selection triggers a refetch.
"Check for updates" reloads the pinned version while one is selected.

## Limitations

- Older data may lack fields that newer app features use. Versions before 963
  have only the single `forceDisposition` per detachment, so the list builder
  shows one force disposition per detachment for them.
- Cards already saved to categories are copies and do not change when the data
  version changes.
