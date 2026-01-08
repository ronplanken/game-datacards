# Cloud Sync Feature - Technical Documentation

> This document is intended for LLM consumption. It describes the cloud synchronization feature architecture, data flow, and key implementation details.

## Overview

The cloud sync feature enables users to synchronize their card categories across devices using Supabase as the backend. It provides:

- **Real-time synchronization** via Supabase Realtime subscriptions
- **Conflict detection and resolution** for multi-device editing
- **Offline support** with pending changes queue
- **Version tracking** for optimistic concurrency control
- **User ownership tracking** to handle account switching

## Architecture

### Key Components

```
src/
├── config/
│   └── supabase.js              # Supabase client configuration
├── Hooks/
│   ├── useAuth.jsx              # Authentication context and methods
│   ├── useSync.jsx              # Core sync logic and state (SyncProvider)
│   └── useCardStorage.jsx       # Local storage with sync field support
├── Helpers/
│   └── cardstorage.helpers.js   # Storage parsing and sync field migration
└── Components/Sync/
    ├── SyncStatusIndicator.jsx  # Global sync status in header
    ├── CategorySyncIcon.jsx     # Per-category sync toggle icon
    ├── SyncConflictModal.jsx    # Conflict resolution UI
    └── SyncClaimModal.jsx       # Account ownership transfer dialog
```

### Database Schema (Supabase)

Located in `supabase/migrations/`

#### Primary Tables

**`user_categories`** - Cloud storage for synced categories
```sql
CREATE TABLE user_categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uuid TEXT NOT NULL,              -- Client-side category UUID
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('category', 'list')),
  parent_id TEXT,                  -- Parent category UUID (sub-categories)
  cards JSONB DEFAULT '[]',        -- Array of card objects
  closed BOOLEAN DEFAULT false,
  last_modified TIMESTAMPTZ,
  version INTEGER DEFAULT 1,       -- Optimistic concurrency version
  device_id TEXT,                  -- For realtime self-change filtering
  created_at TIMESTAMPTZ,
  CONSTRAINT unique_user_category UNIQUE(user_id, uuid)
);
```

**`sync_metadata`** - Per-user sync tracking
```sql
CREATE TABLE sync_metadata (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  last_sync_at TIMESTAMPTZ,
  device_id TEXT,
  sync_version INTEGER DEFAULT 1
);
```

#### Row Level Security (RLS)

All tables have RLS enabled. Key policies:
- Users can only SELECT/INSERT/UPDATE/DELETE their own categories
- `auth.uid() = user_id` enforced on all operations

#### Realtime Configuration (Migration 007)

```sql
-- Enable full row data in DELETE events
ALTER TABLE user_categories REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_categories;
```

---

## Core Hook: `useSync` (src/Hooks/useSync.jsx)

### State

```javascript
const [isSyncing, setIsSyncing] = useState(false);
const [lastSyncTime, setLastSyncTime] = useState(null);
const [conflicts, setConflicts] = useState([]);
const [isOnline, setIsOnline] = useState(navigator.onLine);
```

### Computed State

```javascript
globalSyncStatus: 'idle' | 'offline' | 'syncing' | 'synced' | 'pending' | 'error' | 'conflict'
syncedCount: number    // Categories with syncEnabled=true
pendingCount: number   // Categories with syncStatus='pending'
errorCount: number     // Categories with syncStatus='error'
conflictCount: number  // Length of conflicts array
```

### Key Functions

#### `enableSync(categoryUuid, forceOverride?)`
Enables cloud sync for a category.
1. Checks if category was previously synced to a different user
2. If `syncedToUserId !== user.id` and `!forceOverride`, returns `{ requiresConfirmation: true }`
3. Calls `setCategorySyncEnabled(uuid, true, user.id)`
4. Uploads category to cloud via `uploadCategory()`

#### `uploadCategory(category, skipVersionCheck?)`
Uploads a single category to Supabase.
1. Sets `syncStatus` to 'syncing'
2. Checks cloud version against local `cloudVersion` (unless `skipVersionCheck`)
3. If cloud has newer version, returns conflict error
4. Performs upsert to `user_categories` table
5. Updates local category with `cloudVersion`, `cloudId`, `lastSyncedAt`

#### `downloadCategories()`
Fetches all categories for current user from cloud.
Returns array transformed via `transformCloudToLocal()`.

#### `checkConflicts()`
Compares local and cloud versions to detect conflicts.
1. Downloads all cloud categories
2. For each cloud category:
   - If local has newer version AND cloud has newer version = **conflict**
   - If cloud is newer, no local changes = **auto-update from cloud**
3. Checks for local categories deleted from cloud = `deleted_from_cloud` conflict

#### `resolveConflict(categoryUuid, choice)`
Resolves a sync conflict.

| Choice | Action |
|--------|--------|
| `'local'` | Overwrite cloud with local (increments version) |
| `'cloud'` | Replace local with cloud version |
| `'both'` | Keep cloud version, create local copy with new UUID |
| `'keep_local'` | For deleted conflicts: disable sync, keep local |
| `'delete_local'` | For deleted conflicts: delete local category |

#### `disableSync(categoryUuid, deleteFromCloud?)`
Disables sync for a category. Optionally deletes from cloud.

---

## Local Storage Integration: `useCardStorage`

### Sync Fields on Categories

Each category has these sync-related fields:

```javascript
{
  syncEnabled: boolean,          // Is cloud sync active
  syncStatus: 'local' | 'synced' | 'pending' | 'syncing' | 'error' | 'conflict',
  lastSyncedAt: string | null,   // ISO timestamp of last successful sync
  localVersion: number,          // Increments on each local change
  cloudVersion: number | null,   // Version last synced from cloud
  cloudId: string | null,        // Database row ID (for realtime DELETE matching)
  syncError: string | null,      // Error message if syncStatus='error'
  syncedToUserId: string | null  // User ID this category is synced to
}
```

### Automatic Version Incrementing

All category-modifying functions (`saveActiveCard`, `saveCard`, `addCardToCategory`, `renameCategory`, `removeCardFromCategory`) automatically:
1. Increment `localVersion` if `syncEnabled`
2. Set `syncStatus` to `'pending'`
3. Clear `syncError`

### Key Functions

- `updateCategorySyncStatus(uuid, status, additionalFields)` - Updates sync state
- `setCategorySyncEnabled(uuid, enabled, userId)` - Toggles sync, sets `syncedToUserId`
- `bulkUpdateCategories(cloudCategories)` - Imports categories from cloud

---

## Realtime Synchronization

### Subscription Setup (in `useSync`)

```javascript
supabase
  .channel(`user-categories-${user.id}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'user_categories',
    filter: `user_id=eq.${user.id}`
  }, handleRealtimeChange)
  .subscribe();
```

### Device ID Filtering

Each device generates a unique ID stored in `localStorage`:
```javascript
const deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem("deviceId", deviceId);
```

Changes from the same device are ignored in `handleRealtimeChange` by comparing `newRecord?.device_id`.

### Realtime Event Handling (`handleRealtimeChange`)

| Event | Condition | Action |
|-------|-----------|--------|
| DELETE | Local exists & syncEnabled | Add `deleted_from_cloud` conflict |
| INSERT | No local exists | Import via `bulkUpdateCategories()` |
| UPDATE | No pending local changes | Auto-update from cloud |
| UPDATE | Local changes + card overlap | Create conflict for user resolution |
| UPDATE | Local changes + no overlap | Auto-update (cloud wins for metadata) |

---

## Auto-Sync Behavior

### Debounced Sync

When categories become `pending`, auto-sync triggers after 2 seconds:

```javascript
const SYNC_DEBOUNCE_DELAY = 2000;

useEffect(() => {
  const pendingCategories = cardStorage.categories.filter(
    cat => cat.syncEnabled && cat.syncStatus === 'pending'
  );

  if (hasNewPending && pendingCategories.length > 0) {
    syncTimeoutRef.current = setTimeout(() => {
      syncAll();
    }, SYNC_DEBOUNCE_DELAY);
  }
}, [cardStorage.categories]);
```

### Initial Sync on Login

Runs once per session when user authenticates:
```javascript
if (user && isOnline && !initialSyncCheckDoneRef.current) {
  initialSyncCheckDoneRef.current = true;
  checkConflicts();
}
```

### Offline Recovery

When transitioning from offline to online:
```javascript
if (isOnline && wasOfflineRef.current && user) {
  checkConflicts();
}
```

---

## UI Components

### `SyncStatusIndicator` (Header)
Global sync status icon with dropdown showing:
- Number of synced categories
- Pending/error/conflict counts
- Last sync time
- "Sync Now" button

States: `syncing` (spinning), `synced` (green), `pending` (orange badge), `error` (red), `conflict` (yellow), `offline` (gray)

### `CategorySyncIcon` (Per-Category)
Click behavior:
- Not synced: Enable sync (may show `SyncClaimModal` if owned by other user)
- Conflict: Trigger `checkConflicts()` to show modal
- Error/Pending: Retry upload

### `SyncConflictModal`
Displays conflict details and resolution options:
- Version comparison (local vs cloud)
- Card counts
- Keep Local / Keep Cloud / Keep Both buttons
- For `deleted_from_cloud`: Keep Locally / Delete

### `SyncClaimModal`
Shown when enabling sync on a category previously synced to another user.
Confirms transferring ownership to current user.

---

## Data Transformations

### Cloud to Local (`transformCloudToLocal`)

```javascript
const transformCloudToLocal = (cloudRecord) => ({
  uuid: cloudRecord.uuid,
  name: cloudRecord.name,
  type: cloudRecord.type,
  parentId: cloudRecord.parent_id,
  cards: cloudRecord.cards || [],
  closed: cloudRecord.closed || false,
  syncEnabled: true,
  syncStatus: 'synced',
  lastSyncedAt: cloudRecord.last_modified,
  localVersion: cloudRecord.version,
  cloudVersion: cloudRecord.version,
  cloudId: cloudRecord.id,
  syncError: null,
  syncedToUserId: cloudRecord.user_id
});
```

### Local to Cloud (in `uploadCategory`)

```javascript
{
  user_id: user.id,
  uuid: category.uuid,
  name: category.name,
  type: category.type || 'category',
  parent_id: category.parentId || null,
  cards: category.cards || [],
  closed: category.closed || false,
  version: category.localVersion || 1,
  last_modified: new Date().toISOString(),
  device_id: getDeviceId()
}
```

---

## Version Conflict Detection

Conflict occurs when:
```
cloudVersion > lastSyncedCloudVersion AND localVersion > lastSyncedCloudVersion
```

Where:
- `cloudVersion` = version from cloud
- `localVersion` = local version counter
- `lastSyncedCloudVersion` = category's `cloudVersion` field (what we last knew about cloud)

This detects divergent edits since last sync.

---

## Migration Support

### Storage Migration (`cardstorage.helpers.js`)

`addSyncFieldsToCategories()` adds sync fields to categories that don't have them:

```javascript
const addSyncFieldsToCategories = (storage) => {
  return {
    ...storage,
    categories: storage.categories.map(cat => ({
      ...cat,
      syncEnabled: cat.syncEnabled ?? false,
      syncStatus: cat.syncStatus ?? 'local',
      lastSyncedAt: cat.lastSyncedAt ?? null,
      localVersion: cat.localVersion ?? 1,
      cloudVersion: cat.cloudVersion ?? null,
      syncError: cat.syncError ?? null,
    }))
  };
};
```

This runs on every `parseStorageJson()` call to ensure backwards compatibility.

---

## Provider Hierarchy

```jsx
<AuthProvider>
  <CardStorageProviderComponent>
    <SyncProvider>
      {/* App content */}
    </SyncProvider>
  </CardStorageProviderComponent>
</AuthProvider>
```

`SyncProvider` requires both `useAuth()` and `useCardStorage()` contexts.

---

## Error Handling

- Network errors set `syncStatus: 'error'` with `syncError` message
- User can retry via `CategorySyncIcon` click or "Sync Now" button
- Offline state tracked via `navigator.onLine` and window events
- Pending changes queued locally until online

---

## Security Considerations

1. **RLS Policies**: All database operations restricted to authenticated user's own data
2. **User ID Tracking**: `syncedToUserId` prevents cross-account data leakage
3. **Device ID**: Only used for realtime filtering, not security
4. **No Service Key on Client**: Only anon key used; service key restricted to edge functions

---

## File Reference Summary

| File | Purpose |
|------|---------|
| `src/Hooks/useSync.jsx` | Core sync logic, SyncProvider, realtime subscriptions |
| `src/Hooks/useCardStorage.jsx` | Local storage with sync field support |
| `src/Hooks/useAuth.jsx` | Authentication state and methods |
| `src/config/supabase.js` | Supabase client initialization |
| `src/Helpers/cardstorage.helpers.js` | Storage parsing, sync field migration |
| `src/Components/Sync/SyncStatusIndicator.jsx` | Global sync status UI |
| `src/Components/Sync/CategorySyncIcon.jsx` | Per-category sync toggle |
| `src/Components/Sync/SyncConflictModal.jsx` | Conflict resolution dialog |
| `src/Components/Sync/SyncClaimModal.jsx` | Account ownership transfer dialog |
| `supabase/migrations/001_initial_schema.sql` | Database tables |
| `supabase/migrations/002_rls_policies.sql` | Row Level Security |
| `supabase/migrations/003_indexes.sql` | Performance indexes |
| `supabase/migrations/007_realtime_setup.sql` | Realtime configuration |
