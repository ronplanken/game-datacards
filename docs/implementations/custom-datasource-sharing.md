# Custom Datasource Sharing & Upload Feature

## Overview

Enable Premium/Creator tier users to upload, share, and subscribe to community-created datasources with version tracking and automatic updates.

**Key Behaviors:**
- **Read-only subscriptions** - Users subscribe to datasources (auto-updates from author)
- **Simple version tracking** - Version number with "update available" notifications
- **Featured + categories browse** - Popular, New, By Game System sections + search
- **Download counts** - Track popularity via download counts

---

## 1. Database Schema

### 1.1 Extend `user_datasources` Table

The existing table has: `id`, `user_id`, `datasource_id`, `name`, `data`, `display_format`, `version`, `is_public`, `share_code`, `downloads`, `created_at`, `updated_at`

**New columns needed:**

```sql
-- Migration: 009_datasource_sharing.sql

ALTER TABLE public.user_datasources
  ADD COLUMN IF NOT EXISTS author_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS game_system TEXT CHECK (game_system IN ('40k-10e', '40k', 'aos', 'necromunda', 'basic', 'other')),
  ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Indexes for browsing
CREATE INDEX IF NOT EXISTS idx_user_datasources_public ON public.user_datasources(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_datasources_game_system ON public.user_datasources(game_system) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_datasources_downloads ON public.user_datasources(downloads DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_datasources_featured ON public.user_datasources(featured) WHERE featured = true;
```

### 1.2 New `datasource_subscriptions` Table

Tracks which users are subscribed to which public datasources:

```sql
CREATE TABLE IF NOT EXISTS public.datasource_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  datasource_id UUID REFERENCES public.user_datasources(id) ON DELETE CASCADE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_version INTEGER DEFAULT 0,  -- Version user has locally
  last_synced_at TIMESTAMPTZ,
  CONSTRAINT unique_subscription UNIQUE(user_id, datasource_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.datasource_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_datasource_id ON public.datasource_subscriptions(datasource_id);
```

### 1.3 Subscriber Count Trigger

```sql
CREATE OR REPLACE FUNCTION update_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_datasources SET subscriber_count = subscriber_count + 1 WHERE id = NEW.datasource_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_datasources SET subscriber_count = subscriber_count - 1 WHERE id = OLD.datasource_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_subscriber_count
  AFTER INSERT OR DELETE ON public.datasource_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriber_count();
```

### 1.4 RLS Policies

```sql
-- Subscriptions table RLS
ALTER TABLE public.datasource_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.datasource_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can subscribe to public datasources" ON public.datasource_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.user_datasources WHERE id = datasource_id AND is_public = true)
  );

CREATE POLICY "Users can update own subscriptions" ON public.datasource_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can unsubscribe" ON public.datasource_subscriptions
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 2. RPC Functions

### 2.1 Browse Public Datasources

```sql
CREATE OR REPLACE FUNCTION browse_public_datasources(
  p_game_system TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'popular',  -- 'popular', 'new', 'subscribers'
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, name TEXT, description TEXT, author_name TEXT, author_id UUID,
  game_system TEXT, version TEXT, version_number INTEGER, downloads INTEGER,
  subscriber_count INTEGER, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  is_subscribed BOOLEAN, is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id, d.name, d.description, d.author_name, d.user_id,
    d.game_system, d.version, d.version_number, d.downloads,
    d.subscriber_count, d.created_at, d.updated_at,
    EXISTS (SELECT 1 FROM public.datasource_subscriptions s WHERE s.datasource_id = d.id AND s.user_id = auth.uid()),
    d.featured
  FROM public.user_datasources d
  WHERE d.is_public = true
    AND (p_game_system IS NULL OR d.game_system = p_game_system)
    AND (p_search_query IS NULL OR d.name ILIKE '%' || p_search_query || '%' OR d.description ILIKE '%' || p_search_query || '%')
  ORDER BY
    CASE WHEN p_sort_by = 'popular' THEN d.downloads END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'subscribers' THEN d.subscriber_count END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'new' THEN d.published_at END DESC NULLS LAST,
    d.featured DESC, d.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 2.2 Subscribe to Datasource

```sql
CREATE OR REPLACE FUNCTION subscribe_to_datasource(p_datasource_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_datasource RECORD;
BEGIN
  SELECT * INTO v_datasource FROM public.user_datasources WHERE id = p_datasource_id AND is_public = true;
  IF v_datasource IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Not found or private'); END IF;
  IF v_datasource.user_id = auth.uid() THEN RETURN jsonb_build_object('success', false, 'error', 'Cannot subscribe to own'); END IF;

  INSERT INTO public.datasource_subscriptions (user_id, datasource_id, last_synced_version)
  VALUES (auth.uid(), p_datasource_id, v_datasource.version_number)
  ON CONFLICT (user_id, datasource_id) DO UPDATE SET subscribed_at = NOW(), last_synced_version = v_datasource.version_number;

  -- Increment download count on first subscribe
  UPDATE public.user_datasources SET downloads = downloads + 1 WHERE id = p_datasource_id;

  RETURN jsonb_build_object('success', true, 'version_number', v_datasource.version_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.3 Unsubscribe from Datasource

```sql
CREATE OR REPLACE FUNCTION unsubscribe_from_datasource(p_datasource_id UUID)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM public.datasource_subscriptions
  WHERE user_id = auth.uid() AND datasource_id = p_datasource_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.4 Get Subscription Updates

```sql
CREATE OR REPLACE FUNCTION get_subscription_updates()
RETURNS TABLE (
  subscription_id UUID, datasource_id UUID, datasource_name TEXT,
  current_version INTEGER, subscribed_version INTEGER, updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, d.id, d.name, d.version_number, s.last_synced_version, d.updated_at
  FROM public.datasource_subscriptions s
  JOIN public.user_datasources d ON d.id = s.datasource_id
  WHERE s.user_id = auth.uid() AND d.version_number > s.last_synced_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 2.5 Mark Subscription Synced

```sql
CREATE OR REPLACE FUNCTION mark_subscription_synced(p_subscription_id UUID, p_version INTEGER)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.datasource_subscriptions
  SET last_synced_version = p_version, last_synced_at = NOW()
  WHERE id = p_subscription_id AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.6 Publish Datasource

```sql
CREATE OR REPLACE FUNCTION publish_datasource(
  p_datasource_db_id UUID,
  p_description TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_share_code TEXT;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM public.user_datasources WHERE id = p_datasource_db_id AND user_id = auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not found or not owner');
  END IF;

  -- Generate share code
  v_share_code := public.generate_share_code(8);
  WHILE EXISTS (SELECT 1 FROM public.user_datasources WHERE share_code = v_share_code) LOOP
    v_share_code := public.generate_share_code(8);
  END LOOP;

  UPDATE public.user_datasources SET
    is_public = true, share_code = v_share_code,
    description = COALESCE(p_description, description),
    game_system = COALESCE(p_game_system, game_system),
    published_at = COALESCE(published_at, NOW())
  WHERE id = p_datasource_db_id AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true, 'share_code', v_share_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.7 Unpublish Datasource

```sql
CREATE OR REPLACE FUNCTION unpublish_datasource(p_datasource_db_id UUID)
RETURNS JSONB AS $$
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM public.user_datasources WHERE id = p_datasource_db_id AND user_id = auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not found or not owner');
  END IF;

  -- Remove all subscriptions first
  DELETE FROM public.datasource_subscriptions WHERE datasource_id = p_datasource_db_id;

  -- Mark as private
  UPDATE public.user_datasources SET is_public = false
  WHERE id = p_datasource_db_id AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.8 Update Published Datasource

```sql
CREATE OR REPLACE FUNCTION update_published_datasource(
  p_datasource_db_id UUID,
  p_data JSONB,
  p_version TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_old_version INTEGER;
BEGIN
  -- Get current version
  SELECT version_number INTO v_old_version
  FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = auth.uid();

  IF v_old_version IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not found or not owner');
  END IF;

  -- Update with incremented version
  UPDATE public.user_datasources SET
    data = p_data,
    version = p_version,
    version_number = v_old_version + 1,
    updated_at = NOW()
  WHERE id = p_datasource_db_id AND user_id = auth.uid();

  RETURN jsonb_build_object('success', true, 'new_version_number', v_old_version + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.9 Get Datasource by Share Code

```sql
CREATE OR REPLACE FUNCTION get_datasource_by_share_code(p_share_code TEXT)
RETURNS TABLE (
  id UUID, name TEXT, description TEXT, author_name TEXT,
  game_system TEXT, version TEXT, version_number INTEGER,
  downloads INTEGER, subscriber_count INTEGER, data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.name, d.description, d.author_name,
    d.game_system, d.version, d.version_number,
    d.downloads, d.subscriber_count, d.data
  FROM public.user_datasources d
  WHERE d.share_code = p_share_code AND d.is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

---

## 3. Client-Side Architecture

### 3.1 New Hook: `useDatasourceSharing`

**File:** `/src/Hooks/useDatasourceSharing.jsx`

**State:**
```javascript
{
  // Browse state
  publicDatasources: [],
  isLoadingPublic: false,
  browseFilters: { gameSystem: null, search: '', sortBy: 'popular' },
  pagination: { offset: 0, hasMore: true },

  // Subscriptions state
  subscriptions: [],           // User's active subscriptions
  availableUpdates: [],        // Subscriptions with newer versions
  isLoadingSubscriptions: false,

  // My published datasources
  myPublishedDatasources: [],
  isLoadingMine: false,

  // Upload state
  isUploading: false,
}
```

**Key Functions:**

```javascript
// ============ BROWSING ============

/**
 * Browse public datasources with filters and pagination
 */
async function browsePublicDatasources(filters = {}) {
  const { gameSystem, search, sortBy, offset = 0, limit = 20 } = { ...browseFilters, ...filters };
  const { data } = await supabase.rpc('browse_public_datasources', {
    p_game_system: gameSystem,
    p_search_query: search || null,
    p_sort_by: sortBy,
    p_limit: limit,
    p_offset: offset
  });
  return data;
}

/**
 * Get featured datasources for homepage section
 */
async function getFeaturedDatasources() {
  return browsePublicDatasources({ sortBy: 'popular', limit: 6 });
}

// ============ SUBSCRIPTIONS ============

/**
 * Subscribe to a public datasource
 * Downloads the data and stores it locally as read-only
 */
async function subscribeToDatasource(datasourceId) {
  // 1. Call RPC to create subscription
  const { data: result } = await supabase.rpc('subscribe_to_datasource', {
    p_datasource_id: datasourceId
  });

  // 2. Download full datasource data
  const { data: datasource } = await supabase
    .from('user_datasources')
    .select('*')
    .eq('id', datasourceId)
    .single();

  // 3. Import to local storage as read-only
  await importFromSubscription(datasource);

  return result;
}

/**
 * Unsubscribe from a datasource
 * Optionally removes local copy
 */
async function unsubscribeFromDatasource(datasourceId, removeLocal = true) {
  await supabase.rpc('unsubscribe_from_datasource', { p_datasource_id: datasourceId });
  if (removeLocal) {
    await removeSubscribedDatasource(datasourceId);
  }
}

/**
 * Check for available updates on subscribed datasources
 */
async function checkForUpdates() {
  const { data } = await supabase.rpc('get_subscription_updates');
  setAvailableUpdates(data || []);
  return data;
}

/**
 * Sync a single subscription to get the latest version
 */
async function syncSubscription(subscriptionId, datasourceId) {
  // 1. Download latest data
  const { data: datasource } = await supabase
    .from('user_datasources')
    .select('*')
    .eq('id', datasourceId)
    .single();

  // 2. Update local storage
  await updateSubscribedDatasource(datasource);

  // 3. Mark as synced in database
  await supabase.rpc('mark_subscription_synced', {
    p_subscription_id: subscriptionId,
    p_version: datasource.version_number
  });
}

/**
 * Sync all subscriptions with available updates
 */
async function syncAllSubscriptions() {
  for (const update of availableUpdates) {
    await syncSubscription(update.subscription_id, update.datasource_id);
  }
  await checkForUpdates(); // Refresh list
}

// ============ PUBLISHING ============

/**
 * Upload a local datasource to the cloud
 */
async function uploadDatasource(datasourceData, metadata) {
  const { name, version, authorName, displayFormat } = metadata;

  const { data, error } = await supabase
    .from('user_datasources')
    .insert({
      datasource_id: datasourceData.id,
      name,
      data: datasourceData,
      version,
      author_name: authorName,
      display_format: displayFormat,
      is_public: false
    })
    .select()
    .single();

  if (error) throw error;

  // Update local registry with cloudId
  await updateLocalDatasourceRegistry(datasourceData.id, { cloudId: data.id });

  return data;
}

/**
 * Publish an uploaded datasource (make public)
 */
async function publishDatasource(datasourceDbId, options = {}) {
  const { description, gameSystem } = options;

  const { data } = await supabase.rpc('publish_datasource', {
    p_datasource_db_id: datasourceDbId,
    p_description: description,
    p_game_system: gameSystem
  });

  return data;
}

/**
 * Unpublish a datasource (make private, remove subscribers)
 */
async function unpublishDatasource(datasourceDbId) {
  return supabase.rpc('unpublish_datasource', { p_datasource_db_id: datasourceDbId });
}

/**
 * Update a published datasource (increments version)
 */
async function updatePublishedDatasource(datasourceDbId, newData) {
  return supabase.rpc('update_published_datasource', {
    p_datasource_db_id: datasourceDbId,
    p_data: newData,
    p_version: newData.version
  });
}

/**
 * Delete an uploaded datasource entirely
 */
async function deleteDatasource(datasourceDbId) {
  return supabase.from('user_datasources').delete().eq('id', datasourceDbId);
}

// ============ MY DATASOURCES ============

/**
 * Fetch user's own uploaded/published datasources
 */
async function fetchMyDatasources() {
  const { data } = await supabase
    .from('user_datasources')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  setMyPublishedDatasources(data || []);
  return data;
}
```

### 3.2 Extend `useDataSourceStorage.jsx`

Add new functions:

```javascript
/**
 * Import a subscribed datasource as read-only
 */
async function importFromSubscription(subscriptionData) {
  const { id, name, data, version, version_number, author_name, user_id } = subscriptionData;

  // Generate local ID for storage
  const localId = `subscribed-${id}`;

  // Prepare datasource with subscription metadata
  const prepared = {
    ...data,
    id: localId,
  };

  // Store in IndexedDB
  await dataStore.setItem(localId, prepared);

  // Create registry entry with subscription info
  const registryEntry = {
    id: localId,
    name,
    cardCount: countCards(data),
    sourceType: 'subscription',
    version,
    author: author_name,
    lastUpdated: new Date().toISOString(),
    // Subscription-specific fields
    cloudId: id,
    isSubscribed: true,
    authorId: user_id,
    authorName: author_name,
    lastCloudVersion: version_number,
    isReadOnly: true,
  };

  updateSettings({
    customDatasources: [...settings.customDatasources, registryEntry]
  });
}

/**
 * Update a subscribed datasource with new version
 */
async function updateSubscribedDatasource(subscriptionData) {
  const localId = `subscribed-${subscriptionData.id}`;

  // Update IndexedDB
  await dataStore.setItem(localId, { ...subscriptionData.data, id: localId });

  // Update registry entry
  const updated = settings.customDatasources.map(ds =>
    ds.cloudId === subscriptionData.id
      ? { ...ds, version: subscriptionData.version, lastCloudVersion: subscriptionData.version_number, lastUpdated: new Date().toISOString() }
      : ds
  );

  updateSettings({ customDatasources: updated });
}

/**
 * Remove a subscribed datasource from local storage
 */
async function removeSubscribedDatasource(cloudId) {
  const entry = settings.customDatasources.find(ds => ds.cloudId === cloudId);
  if (!entry) return;

  // Remove from IndexedDB
  await dataStore.removeItem(entry.id);

  // Remove from registry
  updateSettings({
    customDatasources: settings.customDatasources.filter(ds => ds.cloudId !== cloudId)
  });
}

/**
 * Get all subscribed datasources
 */
function getSubscribedDatasources() {
  return settings.customDatasources.filter(ds => ds.isSubscribed);
}
```

### 3.3 Realtime Subscriptions

Follow the pattern from `useSync.jsx`:

```javascript
// In useDatasourceSharing hook

useEffect(() => {
  if (!user) return;

  // Get list of datasource IDs user is subscribed to
  const subscribedIds = subscriptions.map(s => s.datasource_id);
  if (subscribedIds.length === 0) return;

  // Subscribe to updates on those datasources
  const channel = supabase
    .channel(`datasource-updates-${user.id}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_datasources',
      filter: `id=in.(${subscribedIds.join(',')})`
    }, handleDatasourceUpdate)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user, subscriptions]);

function handleDatasourceUpdate(payload) {
  const updated = payload.new;

  // Check if this update affects user's subscriptions
  const subscription = subscriptions.find(s => s.datasource_id === updated.id);
  if (!subscription) return;

  // Check if there's a new version
  if (updated.version_number > subscription.last_synced_version) {
    // Add to available updates (will trigger notification)
    setAvailableUpdates(prev => {
      if (prev.some(u => u.datasource_id === updated.id)) return prev;
      return [...prev, {
        subscription_id: subscription.id,
        datasource_id: updated.id,
        datasource_name: updated.name,
        current_version: updated.version_number,
        subscribed_version: subscription.last_synced_version,
        updated_at: updated.updated_at
      }];
    });
  }
}
```

---

## 4. UI Components

### 4.1 New Component Structure

```
src/Components/
├── DatasourceBrowser/
│   ├── DatasourceBrowserModal.jsx      # Main browse modal
│   ├── DatasourceBrowserModal.css
│   ├── DatasourceCard.jsx              # Card in browse grid
│   ├── DatasourceCard.css
│   ├── DatasourceFilters.jsx           # Game system, sort, search
│   ├── DatasourceFilters.css
│   ├── DatasourceDetailModal.jsx       # Full details + subscribe
│   ├── DatasourceDetailModal.css
│   ├── FeaturedSection.jsx             # Featured datasources row
│   └── index.js
├── DatasourcePublish/
│   ├── PublishDatasourceModal.jsx      # Publish form
│   ├── PublishDatasourceModal.css
│   ├── UpdateDatasourceModal.jsx       # Update existing published
│   ├── MyPublishedDatasources.jsx      # Author's published list
│   ├── MyPublishedDatasources.css
│   ├── DatasourceMetadataForm.jsx      # Shared form fields
│   └── index.js
└── Subscription/
    ├── DatasourceUpdateBadge.jsx       # "X updates available" badge
    └── DatasourceUpdateBadge.css
```

### 4.2 DatasourceBrowserModal

Main entry point for browsing community datasources.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Browse Community Datasources                            [X] │
├─────────────────────────────────────────────────────────────┤
│ [Search...                      ] [Game System ▼] [Sort ▼] │
├─────────────────────────────────────────────────────────────┤
│ FEATURED                                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│ │  Card 1  │ │  Card 2  │ │  Card 3  │                     │
│ └──────────┘ └──────────┘ └──────────┘                     │
├─────────────────────────────────────────────────────────────┤
│ ALL DATASOURCES                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │  Card    │ │  Card    │ │  Card    │ │  Card    │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │  Card    │ │  Card    │ │  Card    │ │  Card    │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│                     [Load More]                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 DatasourceCard

Card component for displaying a datasource in the browse grid.

**Elements:**
- Name (prominent)
- Author name
- Game system badge (40k, AoS, etc.)
- Download count icon + number
- Subscribe button (or "Subscribed" badge if already subscribed)

### 4.4 DatasourceDetailModal

Full detail view when clicking on a datasource card.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back] Datasource Name                                [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ by AuthorName                     [Game System] [v1.2.0]   │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ Description text goes here. This is a longer description   │
│ that explains what this datasource contains and who it's   │
│ intended for.                                               │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ 📊 Downloads: 1,234    👥 Subscribers: 567                 │
│                                                             │
│ CONTENTS                                                    │
│ • Faction Name 1 (45 datasheets, 12 stratagems)           │
│ • Faction Name 2 (32 datasheets, 8 stratagems)            │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│                    [ Subscribe ]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 PublishDatasourceModal

Form for publishing an uploaded datasource.

**Fields:**
- Description (textarea)
- Game System (dropdown: 40k-10e, 40k, AoS, Necromunda, Basic, Other)
- Preview of datasource info

### 4.6 DatasourceUpdateBadge

Badge shown in header when updates are available.

**Behavior:**
- Shows count bubble with number of available updates
- Click opens dropdown with list of datasources that have updates
- "Update" button per item or "Update All" at bottom

---

## 5. Integration Points

### 5.1 AppHeader.jsx

Add new elements:

```jsx
// Near sync indicator
{user && (
  <>
    <button onClick={() => setShowBrowseModal(true)} title="Browse Community Datasources">
      <GlobeIcon />
    </button>
    <DatasourceUpdateBadge />
  </>
)}
```

### 5.2 SettingsModal.jsx

Add new sections to Datasources tab:

```jsx
// After existing Custom Datasources section
{user && subscription?.tier !== 'free' && (
  <section className="settings-section">
    <h3>My Published Datasources</h3>
    <MyPublishedDatasources />
  </section>
)}

{user && (
  <section className="settings-section">
    <h3>Subscribed Datasources</h3>
    {subscribedDatasources.length === 0 ? (
      <p className="empty-state">No subscribed datasources. Browse the community to find some!</p>
    ) : (
      subscribedDatasources.map(ds => (
        <SubscribedDatasourceCard key={ds.id} datasource={ds} />
      ))
    )}
  </section>
)}
```

### 5.3 DatasourceSelector.jsx

Add browse option and subscribed indicators:

```jsx
// At bottom of datasource list
<div className="datasource-option browse-option" onClick={openBrowseModal}>
  <GlobeIcon />
  <span>Browse Community Datasources</span>
</div>

// For subscribed datasources, show badge
{datasource.isSubscribed && (
  <span className="subscribed-badge" title="Subscribed - Read Only">
    <LinkIcon />
  </span>
)}
```

### 5.4 CustomDatasourceCard.jsx

Add upload/publish buttons:

```jsx
// For local datasources without cloudId
{!datasource.cloudId && canPublish && (
  <button onClick={() => handleUpload(datasource)}>
    Upload to Cloud
  </button>
)}

// For uploaded but not published
{datasource.cloudId && !datasource.isPublished && (
  <button onClick={() => setShowPublishModal(true)}>
    Publish
  </button>
)}

// For published datasources
{datasource.isPublished && (
  <div className="publish-stats">
    <span>{datasource.downloads} downloads</span>
    <span>{datasource.subscriberCount} subscribers</span>
    <button onClick={() => setShowUpdateModal(true)}>Update</button>
  </div>
)}

// For subscribed datasources (read-only variant)
{datasource.isSubscribed && (
  <div className="subscribed-info">
    <span className="author">by {datasource.authorName}</span>
    <span className="read-only-badge">Read Only</span>
    <button onClick={() => handleUnsubscribe(datasource)}>Unsubscribe</button>
  </div>
)}
```

### 5.5 Provider Hierarchy Update (index.js)

```jsx
<AuthProvider>
  <SubscriptionProvider>
    <DataSourceStorageProviderComponent>
      <DatasourceSharingProvider>  {/* NEW */}
        <CardStorageProviderComponent>
          <SyncProvider>
            <RouterProvider router={router} />
          </SyncProvider>
        </CardStorageProviderComponent>
      </DatasourceSharingProvider>
    </DataSourceStorageProviderComponent>
  </SubscriptionProvider>
</AuthProvider>
```

---

## 6. Data Flow Diagrams

### 6.1 Upload & Publish Flow

```
User has local custom datasource
        │
        ▼
Click "Upload to Cloud" in CustomDatasourceCard
        │
        ▼
Validate: Premium/Creator tier? ──No──▶ Show upgrade modal
        │
       Yes
        │
        ▼
supabase.insert('user_datasources') with is_public: false
        │
        ▼
Update local registry with { cloudId: newId }
        │
        ▼
Optional: Click "Publish" button
        │
        ▼
Open PublishDatasourceModal
        │
        ▼
Enter description, select game system
        │
        ▼
RPC publish_datasource() → generate share_code, set is_public: true
        │
        ▼
Show share link: game-datacards.eu/d/{shareCode}
```

### 6.2 Subscribe Flow

```
User opens DatasourceBrowserModal
        │
        ▼
Browse/search/filter datasources
        │
        ▼
Click on DatasourceCard
        │
        ▼
Open DatasourceDetailModal
        │
        ▼
Click "Subscribe"
        │
        ▼
RPC subscribe_to_datasource() → creates subscription record
        │
        ▼
Downloads increment on datasource
        │
        ▼
Fetch full datasource data
        │
        ▼
importFromSubscription() → store in IndexedDB with isReadOnly: true
        │
        ▼
Registry updated with subscription info
        │
        ▼
Datasource appears in selector with "subscribed" badge
```

### 6.3 Update Notification Flow

```
Author updates their published datasource
        │
        ▼
version_number increments, updated_at changes
        │
        ▼
Supabase Realtime fires UPDATE event
        │
        ▼
handleDatasourceUpdate() in useDatasourceSharing
        │
        ▼
Check: version_number > last_synced_version?
        │
       Yes
        │
        ▼
Add to availableUpdates state
        │
        ▼
DatasourceUpdateBadge shows count
        │
        ▼
User clicks badge → sees update list
        │
        ▼
Click "Update" (single) or "Update All"
        │
        ▼
syncSubscription() → fetch latest data
        │
        ▼
updateSubscribedDatasource() → update local IndexedDB
        │
        ▼
RPC mark_subscription_synced() → update last_synced_version
        │
        ▼
Remove from availableUpdates
```

---

## 7. Files to Modify/Create

### New Files

| File | Purpose |
|------|---------|
| `supabase/migrations/009_datasource_sharing.sql` | Schema changes + RLS |
| `supabase/migrations/010_datasource_rpc.sql` | All RPC functions |
| `src/Hooks/useDatasourceSharing.jsx` | Main sharing hook + provider |
| `src/Components/DatasourceBrowser/DatasourceBrowserModal.jsx` | Browse modal container |
| `src/Components/DatasourceBrowser/DatasourceBrowserModal.css` | Browse modal styles |
| `src/Components/DatasourceBrowser/DatasourceCard.jsx` | Card in browse grid |
| `src/Components/DatasourceBrowser/DatasourceCard.css` | Card styles |
| `src/Components/DatasourceBrowser/DatasourceDetailModal.jsx` | Full detail view |
| `src/Components/DatasourceBrowser/DatasourceDetailModal.css` | Detail styles |
| `src/Components/DatasourceBrowser/DatasourceFilters.jsx` | Filter controls |
| `src/Components/DatasourceBrowser/DatasourceFilters.css` | Filter styles |
| `src/Components/DatasourceBrowser/FeaturedSection.jsx` | Featured row |
| `src/Components/DatasourceBrowser/index.js` | Barrel export |
| `src/Components/DatasourcePublish/PublishDatasourceModal.jsx` | Publish form |
| `src/Components/DatasourcePublish/PublishDatasourceModal.css` | Publish styles |
| `src/Components/DatasourcePublish/UpdateDatasourceModal.jsx` | Update form |
| `src/Components/DatasourcePublish/MyPublishedDatasources.jsx` | Author's list |
| `src/Components/DatasourcePublish/MyPublishedDatasources.css` | List styles |
| `src/Components/DatasourcePublish/index.js` | Barrel export |
| `src/Components/Subscription/DatasourceUpdateBadge.jsx` | Update badge |
| `src/Components/Subscription/DatasourceUpdateBadge.css` | Badge styles |

### Files to Modify

| File | Changes |
|------|---------|
| `src/Hooks/useDataSourceStorage.jsx` | Add `importFromSubscription`, `updateSubscribedDatasource`, `removeSubscribedDatasource`, `getSubscribedDatasources` |
| `src/Components/AppHeader.jsx` | Add browse button, DatasourceUpdateBadge |
| `src/Components/SettingsModal.jsx` | Add "My Published" and "Subscribed" sections |
| `src/Components/DatasourceSelector/DatasourceSelector.jsx` | Add "Browse Community" option, subscribed badges |
| `src/Components/SettingsModal/CustomDatasourceCard.jsx` | Add upload/publish buttons, subscribed variant |
| `src/index.js` | Add DatasourceSharingProvider to hierarchy |

---

## 8. Implementation Phases

### Phase 1: Database & Infrastructure
- [ ] Create migration `009_datasource_sharing.sql`
- [ ] Create migration `010_datasource_rpc.sql`
- [ ] Apply migrations to local Supabase
- [ ] Test RPC functions in Supabase dashboard
- [ ] Verify RLS policies work correctly

### Phase 2: Upload & Publish
- [ ] Create `useDatasourceSharing` hook with upload/publish functions
- [ ] Create DatasourceSharingProvider
- [ ] Add to provider hierarchy in index.js
- [ ] Add "Upload to Cloud" button to CustomDatasourceCard
- [ ] Create PublishDatasourceModal component
- [ ] Create MyPublishedDatasources component
- [ ] Add "My Published" section to SettingsModal
- [ ] Test upload and publish flow end-to-end

### Phase 3: Browse & Subscribe
- [ ] Implement browse functions in hook
- [ ] Create DatasourceBrowserModal
- [ ] Create DatasourceCard component
- [ ] Create DatasourceFilters component
- [ ] Create DatasourceDetailModal
- [ ] Create FeaturedSection component
- [ ] Add "Browse Community" to AppHeader
- [ ] Add "Browse Community" to DatasourceSelector
- [ ] Extend useDataSourceStorage with subscription functions
- [ ] Implement subscribe flow
- [ ] Implement unsubscribe flow
- [ ] Add "Subscribed" section to SettingsModal
- [ ] Test browse and subscribe flow end-to-end

### Phase 4: Update Notifications
- [ ] Add realtime subscription in hook
- [ ] Implement handleDatasourceUpdate
- [ ] Create DatasourceUpdateBadge component
- [ ] Add badge to AppHeader
- [ ] Implement syncSubscription
- [ ] Implement syncAllSubscriptions
- [ ] Test full update notification flow

### Phase 5: Polish
- [ ] Add loading states to all async operations
- [ ] Add error handling with user-friendly messages
- [ ] Add empty states for browse (no results, no subscriptions)
- [ ] Test offline scenarios
- [ ] Verify tier limit enforcement (free users cannot upload)
- [ ] Add read-only styling for subscribed datasources
- [ ] Prevent editing subscribed datasources in UI

---

## 9. Verification Plan

### Database Testing
- [ ] `browse_public_datasources` returns only public datasources
- [ ] `browse_public_datasources` filters by game_system correctly
- [ ] `browse_public_datasources` search works on name and description
- [ ] `browse_public_datasources` sorting options work
- [ ] `subscribe_to_datasource` creates subscription record
- [ ] `subscribe_to_datasource` increments download count
- [ ] `subscribe_to_datasource` prevents subscribing to own datasource
- [ ] `subscribe_to_datasource` prevents subscribing to private datasource
- [ ] `unsubscribe_from_datasource` removes subscription
- [ ] `unsubscribe_from_datasource` decrements subscriber_count
- [ ] `publish_datasource` generates unique share_code
- [ ] `publish_datasource` only works for owner
- [ ] `update_published_datasource` increments version_number
- [ ] `get_subscription_updates` returns only outdated subscriptions
- [ ] RLS prevents users from viewing other users' private datasources
- [ ] RLS prevents users from modifying other users' datasources

### Client Testing
- [ ] Upload datasource to cloud works (Premium/Creator only)
- [ ] Free users see upgrade modal when trying to upload
- [ ] Publish datasource generates share link
- [ ] Unpublish removes from public browse
- [ ] Browse modal loads and displays datasources
- [ ] Search filters results correctly
- [ ] Game system filter works
- [ ] Sorting options work
- [ ] Subscribe downloads datasource and stores locally
- [ ] Subscribed datasources appear in selector with badge
- [ ] Subscribed datasources cannot be edited (read-only enforced)
- [ ] Unsubscribe removes from subscriptions and optionally local storage
- [ ] Update notification appears when author publishes new version
- [ ] "Update" downloads new version and updates local copy
- [ ] "Update All" syncs all outdated subscriptions
- [ ] Realtime updates work across browser tabs/devices

### Edge Cases
- [ ] Free users cannot upload datasources
- [ ] Author cannot subscribe to own datasource
- [ ] Deleting published datasource removes all subscriptions
- [ ] Unsubscribing from deleted datasource handles gracefully
- [ ] Offline handling for subscription operations
- [ ] Large datasource upload (near 2000 card limit)
- [ ] Concurrent update while user is syncing
- [ ] Share code collision handling (regenerate)
