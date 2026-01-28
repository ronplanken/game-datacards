-- =====================================================
-- Game Datacards - Soft Delete for Datasources
-- Migration 012: Add soft delete support for admin visibility
-- =====================================================

-- =====================================================
-- 1. Add soft delete columns
-- =====================================================

ALTER TABLE public.user_datasources
  ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index for filtering out deleted datasources efficiently
CREATE INDEX IF NOT EXISTS idx_user_datasources_not_deleted
  ON public.user_datasources(user_id) WHERE deleted = false;

COMMENT ON COLUMN public.user_datasources.deleted IS 'Soft delete flag - true means datasource is deleted but retained for admin';
COMMENT ON COLUMN public.user_datasources.deleted_at IS 'Timestamp when datasource was soft deleted';

-- =====================================================
-- 2. Update delete_local_datasource to soft delete
-- =====================================================

CREATE OR REPLACE FUNCTION delete_local_datasource(p_datasource_db_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub_count INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.user_datasources
    WHERE id = p_datasource_db_id AND user_id = v_user_id AND deleted = false
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  -- Count subscriptions that will be affected
  SELECT COUNT(*) INTO v_sub_count
  FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  -- Soft delete: set deleted flag instead of actually deleting
  UPDATE public.user_datasources
  SET
    deleted = true,
    deleted_at = NOW(),
    is_public = false,  -- Unpublish when deleted
    updated_at = NOW()
  WHERE id = p_datasource_db_id AND user_id = v_user_id;

  -- Delete subscriptions (subscribers lose access)
  DELETE FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'removed_subscriptions', v_sub_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. Update limit checking to exclude deleted datasources
-- =====================================================

-- Update validate_datasource_limit trigger function
CREATE OR REPLACE FUNCTION validate_datasource_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_datasources INT;
  v_current_count INT;
BEGIN
  -- Get effective tier (accounts for expiry)
  v_effective_tier := get_effective_tier(NEW.user_id);

  -- Get limits for this tier
  v_limits := get_tier_limits(v_effective_tier);
  v_max_datasources := (v_limits->>'datasources')::INT;

  -- Free tier cannot upload any datasources
  IF v_max_datasources = 0 THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:datasources:0:0;%',
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade to Premium or Creator tier to upload custom datasources';
  END IF;

  -- Count existing NON-DELETED datasources for this user
  SELECT COUNT(*) INTO v_current_count
  FROM public.user_datasources
  WHERE user_id = NEW.user_id AND deleted = false;

  -- Check if limit would be exceeded
  IF v_current_count >= v_max_datasources THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:datasources:%:%;%',
      v_current_count,
      v_max_datasources,
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade your subscription to upload more datasources';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update check_subscription_limit to exclude deleted
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_resource TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_count INT;
  v_current_count INT;
BEGIN
  -- Validate resource type
  IF p_resource NOT IN ('categories', 'datasources') THEN
    RETURN jsonb_build_object(
      'error', 'Invalid resource type. Use ''categories'' or ''datasources'''
    );
  END IF;

  -- Get effective tier
  v_effective_tier := get_effective_tier(p_user_id);

  -- Get limits
  v_limits := get_tier_limits(v_effective_tier);
  v_max_count := (v_limits->>p_resource)::INT;

  -- Get current count (exclude deleted for datasources)
  IF p_resource = 'categories' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_categories
    WHERE user_id = p_user_id;
  ELSE
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_datasources
    WHERE user_id = p_user_id AND deleted = false;
  END IF;

  RETURN jsonb_build_object(
    'resource', p_resource,
    'tier', v_effective_tier,
    'current', v_current_count,
    'limit', v_max_count,
    'remaining', GREATEST(0, v_max_count - v_current_count),
    'canAdd', v_current_count < v_max_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update get_subscription_usage to exclude deleted
CREATE OR REPLACE FUNCTION get_subscription_usage(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_category_count INT;
  v_datasource_count INT;
BEGIN
  -- Get effective tier
  v_effective_tier := get_effective_tier(p_user_id);

  -- Get limits
  v_limits := get_tier_limits(v_effective_tier);

  -- Get counts (exclude deleted for datasources)
  SELECT COUNT(*) INTO v_category_count
  FROM public.user_categories
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_datasource_count
  FROM public.user_datasources
  WHERE user_id = p_user_id AND deleted = false;

  RETURN jsonb_build_object(
    'tier', v_effective_tier,
    'categories', jsonb_build_object(
      'current', v_category_count,
      'limit', (v_limits->>'categories')::INT,
      'remaining', GREATEST(0, (v_limits->>'categories')::INT - v_category_count)
    ),
    'datasources', jsonb_build_object(
      'current', v_datasource_count,
      'limit', (v_limits->>'datasources')::INT,
      'remaining', GREATEST(0, (v_limits->>'datasources')::INT - v_datasource_count)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 4. Update browsing/fetching functions to exclude deleted
-- =====================================================

-- Drop existing functions first (return type may differ)
DROP FUNCTION IF EXISTS get_my_datasources();
DROP FUNCTION IF EXISTS browse_public_datasources(TEXT, TEXT, TEXT, INT, INT);

-- Update get_my_datasources to exclude deleted
CREATE OR REPLACE FUNCTION get_my_datasources()
RETURNS SETOF public.user_datasources AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.user_datasources
  WHERE user_id = auth.uid() AND deleted = false
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update browse_public_datasources to exclude deleted
CREATE OR REPLACE FUNCTION browse_public_datasources(
  p_game_system TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'popular',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_name TEXT,
  game_system TEXT,
  display_format TEXT,
  version TEXT,
  version_number INT,
  downloads INT,
  subscriber_count BIGINT,
  share_code TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_subscribed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.description,
    d.author_name,
    d.game_system,
    d.display_format,
    d.version,
    d.version_number,
    d.downloads,
    (SELECT COUNT(*) FROM public.datasource_subscriptions WHERE datasource_id = d.id) as subscriber_count,
    d.share_code,
    d.created_at,
    d.updated_at,
    EXISTS (
      SELECT 1 FROM public.datasource_subscriptions
      WHERE datasource_id = d.id AND user_id = auth.uid()
    ) as is_subscribed
  FROM public.user_datasources d
  WHERE
    d.is_public = true
    AND d.deleted = false
    AND (p_game_system IS NULL OR d.game_system = p_game_system)
    AND (p_search_query IS NULL OR d.name ILIKE '%' || p_search_query || '%' OR d.description ILIKE '%' || p_search_query || '%')
  ORDER BY
    CASE WHEN p_sort_by = 'popular' THEN d.downloads END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'new' THEN d.created_at END DESC,
    CASE WHEN p_sort_by = 'subscribers' THEN (SELECT COUNT(*) FROM public.datasource_subscriptions WHERE datasource_id = d.id) END DESC NULLS LAST,
    d.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions on recreated functions
GRANT EXECUTE ON FUNCTION get_my_datasources() TO authenticated;
GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INT, INT) TO anon;

-- =====================================================
-- 5. RLS policy update - users cannot see deleted datasources
-- =====================================================

-- Drop and recreate RLS policy for user_datasources select
DROP POLICY IF EXISTS "Users can view own datasources" ON public.user_datasources;
CREATE POLICY "Users can view own datasources" ON public.user_datasources
  FOR SELECT USING (
    user_id = auth.uid() AND deleted = false
  );

-- Public datasources policy also excludes deleted
DROP POLICY IF EXISTS "Anyone can view public datasources" ON public.user_datasources;
CREATE POLICY "Anyone can view public datasources" ON public.user_datasources
  FOR SELECT USING (
    is_public = true AND deleted = false
  );

-- =====================================================
-- 6. Admin function to view deleted datasources
-- =====================================================

-- This function is for admin use only - check user role before calling
CREATE OR REPLACE FUNCTION admin_get_deleted_datasources(
  p_user_id UUID DEFAULT NULL
)
RETURNS SETOF public.user_datasources AS $$
BEGIN
  -- Note: Caller should verify admin status before calling this
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT *
    FROM public.user_datasources
    WHERE user_id = p_user_id AND deleted = true
    ORDER BY deleted_at DESC;
  ELSE
    RETURN QUERY
    SELECT *
    FROM public.user_datasources
    WHERE deleted = true
    ORDER BY deleted_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Only grant to service role (admin)
REVOKE ALL ON FUNCTION admin_get_deleted_datasources(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_get_deleted_datasources(UUID) FROM authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION delete_local_datasource IS 'Soft deletes a datasource (sets deleted=true) instead of removing from database';
COMMENT ON FUNCTION admin_get_deleted_datasources IS 'Admin-only function to view soft-deleted datasources';
