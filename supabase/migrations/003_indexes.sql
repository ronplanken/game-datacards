-- =====================================================
-- Game Datacards - User Accounts & Online Backup
-- Migration 003: Performance Indexes
-- =====================================================

-- =====================================================
-- User Profiles Indexes
-- =====================================================

-- Index for lookup by polar customer/subscription ID
CREATE INDEX IF NOT EXISTS idx_user_profiles_polar_customer_id
  ON public.user_profiles(polar_customer_id)
  WHERE polar_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_polar_subscription_id
  ON public.user_profiles(polar_subscription_id)
  WHERE polar_subscription_id IS NOT NULL;

-- Index for subscription tier queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier
  ON public.user_profiles(subscription_tier);

-- Index for expired subscriptions (for background jobs)
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expires
  ON public.user_profiles(subscription_expires_at)
  WHERE subscription_expires_at IS NOT NULL;

-- =====================================================
-- User Categories Indexes
-- =====================================================

-- Primary lookup by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id
  ON public.user_categories(user_id);

-- Composite index for user_id + last_modified (for sync queries)
CREATE INDEX IF NOT EXISTS idx_user_categories_user_last_modified
  ON public.user_categories(user_id, last_modified DESC);

-- Index for category UUID lookup (for conflict detection)
CREATE INDEX IF NOT EXISTS idx_user_categories_uuid
  ON public.user_categories(uuid);

-- Composite index for user_id + uuid (unique constraint already creates this, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_user_categories_user_uuid
  ON public.user_categories(user_id, uuid);

-- Index for parent_id (for sub-category queries)
CREATE INDEX IF NOT EXISTS idx_user_categories_parent_id
  ON public.user_categories(parent_id)
  WHERE parent_id IS NOT NULL;

-- =====================================================
-- User Datasources Indexes
-- =====================================================

-- Primary lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_datasources_user_id
  ON public.user_datasources(user_id);

-- Index for public datasources (for browse/discovery)
CREATE INDEX IF NOT EXISTS idx_user_datasources_public
  ON public.user_datasources(is_public, created_at DESC)
  WHERE is_public = true;

-- Index for share_code lookup (for public sharing URLs)
CREATE INDEX IF NOT EXISTS idx_user_datasources_share_code
  ON public.user_datasources(share_code)
  WHERE share_code IS NOT NULL;

-- Composite index for user_id + datasource_id (for client sync)
CREATE INDEX IF NOT EXISTS idx_user_datasources_user_datasource_id
  ON public.user_datasources(user_id, datasource_id);

-- Index for popular datasources (by downloads)
CREATE INDEX IF NOT EXISTS idx_user_datasources_downloads
  ON public.user_datasources(downloads DESC)
  WHERE is_public = true;

-- =====================================================
-- Category Shares Indexes
-- =====================================================

-- Index for share_id lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_category_shares_share_id
  ON public.category_shares(share_id);

-- Index for user_id (to show user's shares)
CREATE INDEX IF NOT EXISTS idx_category_shares_user_id
  ON public.category_shares(user_id)
  WHERE user_id IS NOT NULL;

-- Index for popular shares (by views)
CREATE INDEX IF NOT EXISTS idx_category_shares_views
  ON public.category_shares(views DESC);

-- Index for recent shares
CREATE INDEX IF NOT EXISTS idx_category_shares_created_at
  ON public.category_shares(created_at DESC);

-- =====================================================
-- Sync Metadata Indexes
-- =====================================================

-- Primary key already indexes user_id, but explicit index for clarity
CREATE INDEX IF NOT EXISTS idx_sync_metadata_user_id
  ON public.sync_metadata(user_id);

-- Index for last_sync_at (for finding stale syncs)
CREATE INDEX IF NOT EXISTS idx_sync_metadata_last_sync
  ON public.sync_metadata(last_sync_at DESC)
  WHERE last_sync_at IS NOT NULL;

-- =====================================================
-- GIN Indexes for JSONB Columns (Optional - Add if needed)
-- =====================================================

-- Uncomment if you need to query inside category JSONB
-- CREATE INDEX IF NOT EXISTS idx_user_categories_cards_gin
--   ON public.user_categories USING gin(cards);

-- Uncomment if you need to query inside datasource data JSONB
-- CREATE INDEX IF NOT EXISTS idx_user_datasources_data_gin
--   ON public.user_datasources USING gin(data);

-- Uncomment if you need to query inside category shares JSONB
-- CREATE INDEX IF NOT EXISTS idx_category_shares_category_gin
--   ON public.category_shares USING gin(category);

-- =====================================================
-- Statistics and Maintenance
-- =====================================================

-- Analyze tables to update statistics for query planner
ANALYZE public.user_profiles;
ANALYZE public.user_categories;
ANALYZE public.user_datasources;
ANALYZE public.category_shares;
ANALYZE public.sync_metadata;
