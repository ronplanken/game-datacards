---
title: ListForge URL Payload Import
description: One-click import of ListForge rosters via URL hash fragment containing gzip-compressed JSON
category: Features
tags: [listforge, import, url, gzip, base64]
related: [listforge-direct-read-import.md]
file_locations:
  - src/Helpers/listforgeUrl.helpers.js
  - src/index.jsx (ListForgeUrlHandler)
  - src/Components/Importer/Importer.jsx
  - src/Components/Importer/tabs/ListForgeTab.jsx
  - src/Components/Viewer/MobileImporter/MobileListForgeImporter.jsx
  - src/Components/Viewer/ListCreator/ListOverview.jsx
---

# ListForge URL Payload Import

## Table of Contents

- [Overview](#overview)
- [URL Format](#url-format)
- [Why Hash Fragments](#why-hash-fragments)
- [Encoding Pipeline](#encoding-pipeline)
- [Decoding Pipeline](#decoding-pipeline)
- [Payload Schema](#payload-schema)
- [Quick Validity Check](#quick-validity-check)
- [Payload Size](#payload-size)
- [Implementation Details](#implementation-details)
- [Code Samples](#code-samples)
- [Testing](#testing)
- [Error Handling](#error-handling)

## Overview

ListForge can open army lists directly in Game Datacards via a URL. When a user clicks a link from ListForge, the app decodes the embedded roster data and opens the import flow with the data pre-loaded, skipping the file upload step.

## URL Format

```
https://game-datacards.eu/#/listforge/{BASE64_PAYLOAD}
```

Where `{BASE64_PAYLOAD}` is a base64-encoded, gzip-compressed JSON roster.

Example:
```
https://game-datacards.eu/#/listforge/H4sIAAAAAAAAA6tWKkktLlGyUlAqS8wpTtVRSs7PS8nMS1eqBQBFNBLiHAAAAA==
```

## Why Hash Fragments

The payload is placed in the URL hash fragment (`#`) rather than as a query parameter or path segment for several reasons:

1. **Never sent to server**: Hash fragments are client-side only. The server/CDN never sees the payload, so no Cloudflare Pages configuration is needed.
2. **Preserved across SPA redirects**: When React Router redirects `/` to `/mobile` for mobile devices, the hash fragment is preserved automatically.
3. **No URL rewriting needed**: The server always serves `index.html` for `/` regardless of the hash content.
4. **No route conflicts**: The app uses `createBrowserRouter` (HTML5 History API) which reads `pathname` and ignores `hash`. The hash is invisible to the router.

## Encoding Pipeline

ListForge generates the URL with this pipeline:

```
JSON object -> JSON.stringify() -> gzip compress -> base64 encode -> URL hash
```

## Decoding Pipeline

Game Datacards decodes the payload with:

```
URL hash -> extract base64 after prefix -> atob() -> Uint8Array -> fflate.decompressSync() -> TextDecoder -> JSON.parse()
```

The decoding is implemented in `src/Helpers/listforgeUrl.helpers.js`.

## Payload Schema

The payload follows the standard ListForge JSON roster format. See [listforge-direct-read-import.md](listforge-direct-read-import.md) for the full schema reference.

Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Roster identifier |
| `name` | string | Roster name |
| `generatedBy` | string | Must be `"List Forge"` or `"https://newrecruit.eu"` |
| `roster.forces` | array | Array of forces containing selections |
| `roster.costs` | array | Points costs |

## Quick Validity Check

Before attempting full decoding, check that the base64 payload starts with `H4sI`. This is the base64 encoding of the gzip magic number and compression method bytes (`1f 8b 08`). The remaining header bytes (flags, timestamp) may vary.

## Payload Size

| Metric | Range |
|--------|-------|
| Uncompressed JSON | 10-100 KB |
| Gzip compressed | 3-20 KB |
| Base64 encoded | 4-27 KB |
| Browser URL limit | 64 KB+ (modern browsers) |

## Implementation Details

### Handler Component (`ListForgeUrlHandler`)

Located in `src/index.jsx`, renders alongside `CheckoutSuccessHandler` in `RootLayout`. On mount:

1. Reads `window.location.hash`
2. Checks for `#/listforge/` prefix
3. Cleans hash immediately via `history.replaceState()` (prevents re-trigger on refresh)
4. Decodes the payload using `decodeListForgeUrlPayload()`
5. Validates with `validateListforgeJson()`
6. Navigates to the appropriate view with `{ listForgePayload: data }` in router state

### Datasource Handling

The importer opens with the currently-active datasource. The tab components (`ListForgeTab`, `MobileListForgeImporter`) guard on `dataSource?.data?.length > 1` before processing `initialData`, showing a loading indicator while the datasource data loads.

### Mobile Flow

1. `ListForgeUrlHandler` navigates to `/mobile` with payload in router state
2. `ListOverview` reads `location.state.listForgePayload`
3. Opens `MobileListForgeImporter` immediately with `initialData` prop
4. Importer shows loading indicator while datasource loads, then auto-advances to review

### Desktop Flow

1. `ListForgeUrlHandler` navigates to `/` with payload in router state
2. `Importer` component reads `location.state.listForgePayload`
3. Opens the import modal immediately with ListForge tab active
4. `ListForgeTab` receives `initialData` prop, shows loading indicator while datasource loads, then auto-advances to review

## Code Samples

### JavaScript: Encode a Roster for URL (ListForge side)

```javascript
import { compressSync, strToU8 } from "fflate";

function encodeRosterForUrl(roster) {
  const json = JSON.stringify(roster);
  const compressed = compressSync(strToU8(json));

  // Uint8Array -> base64
  let binary = "";
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  const base64 = btoa(binary);

  return `https://game-datacards.eu/#/listforge/${base64}`;
}
```

### JavaScript: Generate a Test URL

```javascript
import { compressSync, strToU8 } from "fflate";

const testRoster = {
  id: "test-1",
  name: "Test Roster",
  generatedBy: "List Forge",
  gameSystemId: "sys-40k",
  gameSystemName: "Warhammer 40,000",
  roster: {
    name: "Blood Angels 2000pts",
    costs: [{ name: "pts", typeId: "points", value: 2000 }],
    forces: [{
      id: "force-1",
      name: "Gladius Task Force",
      entryId: "force-1",
      catalogueId: "cat-ba",
      catalogueName: "Blood Angels",
      selections: []
    }]
  }
};

const compressed = compressSync(strToU8(JSON.stringify(testRoster)));
let binary = "";
for (let i = 0; i < compressed.length; i++) {
  binary += String.fromCharCode(compressed[i]);
}
const url = `http://localhost:3000/#/listforge/${btoa(binary)}`;
console.log(url);
```

## Testing

### Unit Tests

Run `yarn test:ci` to execute the decoder tests in `src/Helpers/__tests__/listforgeUrl.helpers.test.js`.

Test cases cover:
- Valid payload decoding
- Invalid base64
- Valid base64 but invalid gzip
- Valid gzip but invalid JSON
- Hash without prefix (returns null, no error)
- Empty payload
- Gzip header prefix check

### Manual Testing

1. Generate a test URL using the code sample above
2. Navigate to the URL in a browser
3. Verify the import modal opens with pre-loaded data
4. After import, refresh and verify the hash is clean (no re-trigger)

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Corrupted base64 | Error toast: "Invalid payload: malformed base64" |
| Valid base64, invalid gzip | Error toast: "Invalid payload: decompression failed" |
| Valid gzip, invalid JSON | Error toast: "Invalid payload: malformed JSON" |
| Valid JSON, invalid roster | Error toast with validation errors |
| Non-gzip payload | Error toast: "Invalid payload: not a gzip-compressed stream" |
| Empty payload | Error toast: "Empty payload" |

All errors are tracked via Umami analytics with `import-listforge-url-error` event.
