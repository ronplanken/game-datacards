# Custom Datasources Feature Documentation

This document explains how the custom datasources feature works in the game-datacards application. It is written for LLM consumption to provide context when working on this codebase.

## Overview

Custom datasources allow users to import their own JSON data files containing faction/game data that can be used alongside or instead of the built-in game system datasources (Warhammer 40k, Age of Sigmar, Necromunda, etc.).

## Key Differences: Custom vs Built-in Datasources

| Aspect | Built-in Datasources | Custom Datasources |
|--------|---------------------|-------------------|
| Source | Pre-configured, fetched from hardcoded URLs | User-imported via URL or file upload |
| Storage Key | `40k`, `40k-10e`, `aos`, `necromunda`, `basic` | `custom-{uuid}` |
| Management | Fixed, cannot be removed | Can be added, removed, updated by user |
| Updates | Manual app updates | Version checking for URL sources |

## Architecture

### Storage Layers

The feature uses a three-tier storage system:

```
Browser Storage:
├── localStorage
│   └── settings (JSON object)
│       ├── customDatasources: Array<RegistryEntry>  // Metadata only
│       ├── selectedDataSource: string               // Current selection
│       └── selectedFactionIndex: Record<string, number>
│
└── IndexedDB (via localForage, instance name: "data")
    ├── 40k, 40k-10e, aos, necromunda, basic  // Built-in data
    └── custom-{uuid}                          // Full custom datasource data
```

### Registry Entry Structure

Each custom datasource has a lightweight registry entry stored in `settings.customDatasources`:

```typescript
interface RegistryEntry {
  id: string;              // "custom-{uuid}"
  name: string;            // Display name
  version: string;         // Semantic version
  cardCount: number;       // Total cards across all factions
  sourceType: "url" | "local";
  sourceUrl?: string;      // Only for URL-sourced datasources
  author?: string;
  lastUpdated: string;     // ISO timestamp
  lastCheckedForUpdate?: string;  // ISO timestamp
}
```

## File Structure

### Core Files

| File Path | Purpose |
|-----------|---------|
| `src/Hooks/useDataSourceStorage.jsx` | Main hook for datasource operations |
| `src/Hooks/useSettingsStorage.jsx` | Settings persistence including registry |
| `src/Helpers/customDatasource.helpers.js` | Validation, transformation, utilities |
| `src/Components/CustomDatasource/CustomDatasourceModal.jsx` | Import UI modal |
| `src/Components/CustomDatasource/ExportDatasourceModal.jsx` | Export categories as datasource |
| `src/Components/SettingsModal/CustomDatasourceCard.jsx` | Datasource management card |
| `src/Components/DatasourceSelector/DatasourceSelector.jsx` | Header dropdown selector |

### Provider Hierarchy

```
SettingsStorageProviderComponent
  └── AuthProvider
      └── DataSourceStorageProviderComponent
          └── CardStorageProviderComponent
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
  - "Check for updates" (URL sources only)
  - Delete button (when not active)

### DatasourceSelector

- **Location**: `src/Components/DatasourceSelector/DatasourceSelector.jsx`
- **Features**:
  - Dropdown showing current datasource
  - Update available indicator dot
  - Sections: Check Updates | Built-in | Custom | Add New
  - Portal-rendered for proper z-index

### Settings Modal Integration

- **Tab**: "Datasources" (`activeTab === "datasources"`)
- **Sections**:
  1. Active Datasource - current selection card
  2. Custom Datasources - list with Add button
  3. Other Datasources - built-in options

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
