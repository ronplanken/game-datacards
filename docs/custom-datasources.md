# Custom Datasources Feature Documentation

This document explains how the custom datasources feature works in the game-datacards application. It is written for LLM consumption to provide context when working on this codebase.

## Overview

Custom datasources allow users to import their own JSON data files containing faction/game data that can be used alongside or instead of the built-in game system datasources (Warhammer 40k, Age of Sigmar, Necromunda, etc.).

## Key Differences: Custom vs Built-in vs Subscribed Datasources

| Aspect | Built-in Datasources | Custom Datasources | Subscribed Datasources |
|--------|---------------------|-------------------|------------------------|
| Source | Pre-configured, fetched from hardcoded URLs | User-imported via URL or file upload | Community shared via cloud |
| Storage Key | `40k`, `40k-10e`, `aos`, `necromunda`, `basic` | `custom-{uuid}` | `subscribed-{cloudId}` |
| Management | Fixed, cannot be removed | Can be added, removed, updated by user | Subscribe/unsubscribe |
| Updates | Manual app updates | Version checking for URL sources | Auto-check from cloud |
| Editable | No | Yes | No (read-only) |

## Architecture

### Storage Layers

The feature uses a three-tier storage system:

```
Browser Storage:
├── localStorage
│   └── settings (JSON object)
│       ├── customDatasources: Array<RegistryEntry>  // Metadata only (includes custom + subscribed)
│       ├── selectedDataSource: string               // Current selection
│       └── selectedFactionIndex: Record<string, number>
│
└── IndexedDB (via localForage, instance name: "data")
    ├── 40k, 40k-10e, aos, necromunda, basic  // Built-in data
    ├── custom-{uuid}                          // User-imported custom datasource data
    └── subscribed-{cloudId}                   // Subscribed community datasource data
```

### Registry Entry Structure

Each custom or subscribed datasource has a lightweight registry entry stored in `settings.customDatasources`:

```typescript
interface RegistryEntry {
  id: string;              // "custom-{uuid}" or "subscribed-{cloudId}"
  name: string;            // Display name
  version: string;         // Semantic version
  cardCount: number;       // Total cards across all factions
  sourceType: "url" | "local" | "subscription";
  sourceUrl?: string;      // Only for URL-sourced datasources
  author?: string;
  lastUpdated: string;     // ISO timestamp
  lastCheckedForUpdate?: string;  // ISO timestamp

  // Subscription-specific fields (sourceType === "subscription")
  cloudId?: string;        // Cloud database ID
  isSubscribed?: boolean;  // True for subscribed datasources
  authorId?: string;       // Publisher's user ID
  authorName?: string;     // Publisher's display name
  lastCloudVersion?: number; // Cloud version number for sync
  isReadOnly?: boolean;    // True for subscribed (can't edit)

  // Upload-specific fields (for owned datasources uploaded to cloud)
  isUploaded?: boolean;    // True if uploaded to cloud
}
```

## File Structure

### Core Files

| File Path | Purpose |
|-----------|---------|
| `src/Hooks/useDataSourceStorage.jsx` | Main hook for datasource operations |
| `src/Hooks/useSettingsStorage.jsx` | Settings persistence including registry |
| `src/Hooks/useDatasourceSharing.jsx` | Cloud sharing, subscribing, publishing |
| `src/Hooks/useSync.jsx` | Category syncing to cloud |
| `src/Helpers/customDatasource.helpers.js` | Validation, transformation, utilities |
| `src/Components/CustomDatasource/CustomDatasourceModal.jsx` | Import URL/file modal |
| `src/Components/CustomDatasource/ExportDatasourceModal.jsx` | Export cards as datasource |
| `src/Components/CustomDatasource/ConvertToDatasourceModal.jsx` | Convert category to datasource |
| `src/Components/CustomDatasource/EditDatasourceMetadataModal.jsx` | Edit datasource metadata |
| `src/Components/DatasourceBrowser/DatasourceBrowserModal.jsx` | Browse community datasources |
| `src/Components/DatasourceBrowser/DatasourceCard.jsx` | Datasource card in browser |
| `src/Components/DatasourceBrowser/DatasourceDetailModal.jsx` | Datasource detail view |
| `src/Components/DatasourcePublish/PublishDatasourceModal.jsx` | Publish datasource modal |
| `src/Components/SettingsModal/CustomDatasourceCard.jsx` | Datasource management card |
| `src/Components/DatasourceSelector/DatasourceSelector.jsx` | Header dropdown selector |

### Provider Hierarchy

```
SettingsStorageProviderComponent
  └── AuthProvider
      └── SubscriptionProvider
          └── UserProviderComponent
              └── FirebaseProviderComponent
                  └── DataSourceStorageProviderComponent
                      └── DatasourceSharingProvider
                          └── CardStorageProviderComponent
                              └── SyncProvider
                                  └── App
```

## Data Format

### Custom Datasource JSON Schema

```json
{
  "id": "my-custom-faction",
  "name": "My Custom Faction",
  "version": "1.0.0",
  "author": "Optional Author Name",
  "lastUpdated": "2025-01-08T12:00:00.000Z",
  "data": [
    {
      "id": "faction-id",
      "name": "Faction Name",
      "colours": {
        "header": "#1a1a1a",
        "banner": "#4a4a4a"
      },
      "datasheets": [],
      "stratagems": [],
      "enhancements": [],
      "warscrolls": [],
      "manifestationLores": [],
      "psychicpowers": [],
      "secondaries": [],
      "rules": []
    }
  ]
}
```

### Card Type Mappings

Cards are organized into specific arrays within each faction:

| Card Type | Array Name |
|-----------|------------|
| `DataCard`, `datasheet` | `datasheets` |
| `stratagem` | `stratagems` |
| `enhancement` | `enhancements` |
| `warscroll` | `warscrolls` |
| `spell` | `manifestationLores` |
| `psychic` | `psychicpowers` |
| `secondary` | `secondaries` |
| `rule` | `rules` |
| `ganger`, `vehicle` | `datasheets` |

### Validation Constants

Defined in `src/Helpers/customDatasource.helpers.js`:

```javascript
VALID_DISPLAY_FORMATS: ["40k-10e", "40k", "basic", "necromunda", "aos"]
MAX_FACTION_COUNT: 10
MAX_CARD_COUNT: 2000
MAX_NAME_LENGTH: 200
MAX_VERSION_LENGTH: 50
MAX_STRING_LENGTH: 10000  // For any string field
```

## Key Functions

### useDataSourceStorage Hook

Location: `src/Hooks/useDataSourceStorage.jsx`

| Function | Description |
|----------|-------------|
| `importCustomDatasource(datasource)` | Import validated datasource JSON |
| `removeCustomDatasource(id)` | Delete a custom datasource |
| `checkCustomDatasourceUpdate(id)` | Check URL source for newer version |
| `applyCustomDatasourceUpdate(id, newData)` | Apply downloaded update |
| `getCustomDatasourceData(id)` | Retrieve full datasource from IndexedDB |

### customDatasource.helpers.js

| Function | Description |
|----------|-------------|
| `validateCustomDatasource(data)` | Validates JSON structure, returns `{valid, errors}` |
| `prepareDatasourceForImport(datasource, sourceType, sourceUrl)` | Adds `custom-{uuid}` ID and metadata |
| `createRegistryEntry(datasource)` | Creates lightweight metadata entry |
| `compareVersions(v1, v2)` | Returns -1, 0, or 1 for version comparison |
| `createDatasourceExport(options)` | Creates export JSON from cards |
| `generateDatasourceFilename(name)` | Sanitizes name for filename |
| `generateIdFromName(name)` | Creates kebab-case ID from name |
| `countCardsByType(cards)` | Returns `Record<cardType, count>` |
| `formatCardBreakdown(counts)` | Human-readable card count string |
| `mapCardsToFactionStructure(cards, factionInfo)` | Groups cards into faction arrays |
| `countDatasourceCards(datasource)` | Total card count across all factions |
| `extractCardsFromFaction(faction)` | Extracts cards from faction arrays to flat array |

### useDatasourceSharing Hook

Location: `src/Hooks/useDatasourceSharing.jsx`

This hook manages cloud-based datasource sharing, including browsing, subscribing, publishing, and syncing.

#### Browsing Functions

| Function | Description |
|----------|-------------|
| `browsePublicDatasources(filters, reset)` | Browse community datasources with search/filter/pagination |
| `getFeaturedDatasources()` | Get featured/popular datasources |
| `getDatasourceByShareCode(code)` | Fetch datasource details by share code |

#### Subscription Functions

| Function | Description |
|----------|-------------|
| `fetchMySubscriptions()` | Fetch user's current subscriptions |
| `subscribeToDatasource(id)` | Subscribe to a community datasource |
| `unsubscribeFromDatasource(id, removeLocal)` | Unsubscribe and optionally remove local data |
| `checkForUpdates()` | Check all subscriptions for available updates |
| `syncSubscription(subId, dsId)` | Download latest version of a subscription |
| `syncAllSubscriptions()` | Sync all subscriptions with available updates |
| `getSubscribedDatasources()` | Get all subscribed datasources from registry |

#### Publishing Functions

| Function | Description |
|----------|-------------|
| `fetchMyDatasources()` | Fetch user's uploaded/published datasources |
| `uploadDatasource(data, metadata)` | Upload local datasource to cloud (private) |
| `publishDatasource(dbId, options)` | Make uploaded datasource public |
| `unpublishDatasource(dbId)` | Make datasource private again |
| `updatePublishedDatasource(dbId, newData)` | Push update to subscribers |
| `publishLocalDatasource(cloudId, options)` | Publish a local/synced datasource |
| `pushDatasourceUpdate(cloudId)` | Push changes to subscribers |

#### Local Storage Functions

| Function | Description |
|----------|-------------|
| `importFromSubscription(subscriptionData)` | Import subscribed datasource as read-only |
| `updateSubscribedDatasource(subscriptionData)` | Update local subscription with new version |
| `removeSubscribedDatasource(cloudId)` | Remove subscribed datasource from local storage |

## User Flows

### Import via URL

1. User clicks "Add external datasource" in DatasourceSelector or Settings
2. `CustomDatasourceModal` opens with URL tab active
3. User enters URL, clicks "Fetch"
4. Modal fetches JSON, handles CORS errors with user-friendly message
5. `validateCustomDatasource()` validates structure
6. Preview shows name, version, first faction
7. User clicks "Import"
8. `prepareDatasourceForImport()` adds `custom-{uuid}` ID and metadata
9. Full data saved to IndexedDB via `importCustomDatasource()`
10. Registry entry added to `settings.customDatasources`

### Import via File

1. User clicks "Add external datasource"
2. Switches to "Import File" tab
3. Drags file or clicks to browse, selects `.json` file
4. File read via FileReader, parsed as JSON
5. Validation and import same as URL flow (steps 5-10)

### Export Category as Datasource

1. User right-clicks a category in TreeView
2. Selects "Export as Datasource"
3. `ExportDatasourceModal` opens with form fields:
   - Name (required)
   - Version (default: "1.0.0")
   - Author (optional)
   - ID (auto-generated from name)
   - Faction colors (header/banner color pickers)
4. Preview shows card breakdown
5. User clicks "Export"
6. `createDatasourceExport()` generates JSON
7. File downloaded as `{sanitized-name}.json`

### Update Checking (URL Sources Only)

1. User clicks "Check for updates" in Settings or DatasourceSelector
2. `checkCustomDatasourceUpdate(id)` fetches current URL
3. Compares versions using `compareVersions()`
4. If newer version available:
   - Confirmation dialog shows current vs new version
   - User confirms update
   - `applyCustomDatasourceUpdate()` replaces data in IndexedDB
   - Registry entry updated with new metadata

### Delete Custom Datasource

1. User clicks delete button on CustomDatasourceCard (only visible when not active)
2. Confirmation dialog shown
3. `removeCustomDatasource(id)` called:
   - Removes from IndexedDB
   - Removes from `settings.customDatasources` array
   - If was selected, switches to default datasource

### Browse Community Datasources

1. User opens DatasourceBrowser via selector dropdown or settings
2. `DatasourceBrowserModal` opens showing public datasources
3. User can filter by game system, search by name, or sort by popularity
4. Views datasource cards showing name, author, subscriber count
5. Clicks datasource for detail modal with preview
6. Clicks "Subscribe" to add to local datasources

### Subscribe to Datasource

1. User finds datasource in browser or via share code
2. Clicks "Subscribe" (requires authentication)
3. `subscribeToDatasource()` creates server subscription record
4. Full datasource data downloaded from cloud
5. `importFromSubscription()` stores locally with `isReadOnly: true`
6. Registry entry added with `sourceType: "subscription"`
7. Datasource appears in DatasourceSelector under "Subscribed"

### Check for Subscription Updates

1. App periodically calls `checkForUpdates()` on subscriptions
2. Server compares local version with cloud version
3. If newer version available:
   - Update indicator shown on DatasourceSelector
   - Update badge shown on subscription card
4. User clicks "Update" on subscription card
5. `syncSubscription()` downloads new version from cloud
6. Local data replaced in IndexedDB
7. Registry entry updated with new version info

### Unsubscribe from Datasource

1. User clicks unsubscribe on subscription card
2. Confirmation dialog shown
3. `unsubscribeFromDatasource(id)` called:
   - Removes subscription record from server
   - Removes from local IndexedDB
   - Removes from `settings.customDatasources` registry
   - If was selected, switches to default datasource

### Upload Datasource to Cloud

1. User clicks "Upload to cloud" on custom datasource card
2. Requires premium/creator subscription tier
3. `uploadDatasource()` validates and uploads data to Supabase
4. Creates cloud record with `is_public: false`
5. Local registry updated with `cloudId` and `isUploaded: true`
6. Datasource can now be published

### Publish Datasource

1. User uploads datasource first (see above)
2. Clicks "Publish" on uploaded datasource
3. `PublishDatasourceModal` opens for description/game system
4. `publishDatasource()` makes datasource public
5. Share code generated for direct linking
6. Datasource appears in community browser
7. Other users can now subscribe

### Push Update to Subscribers

1. User makes changes to published datasource locally
2. Clicks "Push update" on datasource card
3. `pushDatasourceUpdate()` copies changes to published version
4. Version number incremented automatically
5. Subscribers notified of available update

## UI Components

### CustomDatasourceModal

- **Location**: `src/Components/CustomDatasource/CustomDatasourceModal.jsx`
- **Trigger**: "Add external datasource" button
- **Tabs**: "Import URL" | "Import File"
- **URL Tab Features**:
  - URL input with HTTP/HTTPS validation
  - Fetch button with loading state
  - CORS error handling with explanation
  - Preview card (name, version, first faction)
- **File Tab Features**:
  - Drag & drop zone
  - Click to browse
  - File info display (name, size)
  - Same preview as URL tab

### CustomDatasourceCard

- **Location**: `src/Components/SettingsModal/CustomDatasourceCard.jsx`
- **Displays**: Name, card count, version, author, updated date, source type icon
- **Actions**:
  - Toggle to activate/deactivate
  - "Check for updates" (URL sources only, when active)
  - Delete button (when not active and not subscribed)
  - "Upload to cloud" (with subscription permission check)
  - "Publish" (when uploaded but not published)
  - "Push update" (when published)

### DatasourceBrowserModal

- **Location**: `src/Components/DatasourceBrowser/DatasourceBrowserModal.jsx`
- **Trigger**: "Browse community" button in DatasourceSelector
- **Features**:
  - Game system filter dropdown
  - Search input for name/author
  - Sort by: Most Popular | Newest | Most Subscribers
  - Paginated grid of DatasourceCards
  - Featured datasources section

### DatasourceCard (Browser)

- **Location**: `src/Components/DatasourceBrowser/DatasourceCard.jsx`
- **Displays**: Name, author, game system, subscriber count, description preview
- **Actions**:
  - Click to open DatasourceDetailModal

### DatasourceDetailModal

- **Location**: `src/Components/DatasourceBrowser/DatasourceDetailModal.jsx`
- **Displays**: Full description, faction preview, version info, author
- **Actions**:
  - Subscribe button (or "Already subscribed" indicator)
  - Share code copy

### PublishDatasourceModal

- **Location**: `src/Components/DatasourcePublish/PublishDatasourceModal.jsx`
- **Trigger**: "Publish" button on uploaded datasource
- **Fields**:
  - Description (optional)
  - Game system dropdown
- **Actions**:
  - Publish and generate share code

### DatasourceSelector

- **Location**: `src/Components/DatasourceSelector/DatasourceSelector.jsx`
- **Features**:
  - Dropdown showing current datasource
  - Update available indicator dot
  - Sections: Check Updates | Built-in | Subscribed | Custom | Add New | Browse Community
  - Portal-rendered for proper z-index

### Settings Modal Integration

- **Tab**: "Datasources" (`activeTab === "datasources"`)
- **Sections**:
  1. Active Datasource - current selection card
  2. Subscribed Datasources - list of subscriptions with update indicators
  3. Custom Datasources - list with Add/Upload/Publish buttons
  4. Other Datasources - built-in options

## Error Handling

### CORS Errors

When fetching URL datasources, CORS errors are detected and shown with user-friendly messaging explaining that the server doesn't allow cross-origin requests.

### Validation Errors

`validateCustomDatasource()` returns an array of error strings:
- Missing required fields (name, version, data)
- Empty data array
- Missing faction fields (id, name, colours)
- Card count exceeds limit
- String lengths exceed limits

## Integration Points

### With Card Storage

- Custom datasources provide the same data structure as built-in datasources
- Cards from custom datasources work in categories, printing, etc.
- Card `source` property determines rendering format

### With Faction Selector

- `selectedFactionIndex` in settings tracks per-datasource selection
- Switching datasources preserves faction selection when returning

### With Sync (Cloud Storage)

- Custom datasource registry is part of settings that can sync
- Full datasource data remains local (too large for sync)

## Cloud Integration

### Cloud Storage (Supabase)

The cloud sharing feature uses Supabase for backend storage and real-time subscriptions:

- **`user_datasources` table**: Stores uploaded datasource data, metadata, and publication status
- **`datasource_subscriptions` table**: Tracks user subscriptions with version info
- **RPC functions**: Handle complex operations (publish, subscribe, sync, version checking)
- **Real-time subscriptions**: Notify users of available updates

### Authentication Requirements

| Action | Auth Required | Subscription Tier |
|--------|---------------|-------------------|
| Browse public datasources | No | Free |
| Subscribe to datasource | Yes | Free |
| Upload datasource to cloud | Yes | Premium or Creator |
| Publish datasource publicly | Yes | Premium or Creator |
| Push updates to subscribers | Yes | Premium or Creator |

### Game System Options

Available game systems for categorizing published datasources:

```javascript
GAME_SYSTEMS = [
  "40k-10e",      // Warhammer 40k (10th Edition)
  "40k",          // Warhammer 40k (Legacy)
  "aos",          // Age of Sigmar
  "necromunda",   // Necromunda
  "horus-heresy", // Horus Heresy
  "basic",        // Basic/Generic
  "other"         // Other
]
```

### Version Management

- Subscribed datasources track `lastCloudVersion` (integer version number from server)
- `checkForUpdates()` compares local version with server version
- Updates increment version number automatically when pushed
- Semantic version string (`version`) is for display; integer `version_number` is for comparison

### Data Flow

```
Upload Flow:
Local Datasource → validateCustomDatasource() → uploadDatasource() → Supabase

Publish Flow:
Uploaded Datasource → publishDatasource() → Generate share code → Public listing

Subscribe Flow:
Browse/Share Code → subscribeToDatasource() → Download data → importFromSubscription() → Local storage

Update Flow:
Publisher pushes → Version incremented → checkForUpdates() detects → syncSubscription() downloads
```
