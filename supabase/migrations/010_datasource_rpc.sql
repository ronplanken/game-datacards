-- =====================================================
-- Game Datacards - Custom Datasource Sharing
-- Migration 010: RPC Functions for Sharing Feature
-- =====================================================

-- =====================================================
-- Browse Public Datasources
-- =====================================================

CREATE OR REPLACE FUNCTION browse_public_datasources(
  p_game_system TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'popular',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_name TEXT,
  author_id UUID,
  game_system TEXT,
  version TEXT,
  version_number INTEGER,
  downloads INTEGER,
  subscriber_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_subscribed BOOLEAN,
  is_featured BOOLEAN,
  share_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.description,
    d.author_name,
    d.user_id AS author_id,
    d.game_system,
    d.version,
    d.version_number,
    d.downloads,
    d.subscriber_count,
    d.created_at,
    d.updated_at,
    EXISTS (
      SELECT 1 FROM public.datasource_subscriptions s
      WHERE s.datasource_id = d.id AND s.user_id = auth.uid()
    ) AS is_subscribed,
    d.featured AS is_featured,
    d.share_code
  FROM public.user_datasources d
  WHERE
    d.is_public = true
    AND (p_game_system IS NULL OR d.game_system = p_game_system)
    AND (
      p_search_query IS NULL
      OR d.name ILIKE '%' || p_search_query || '%'
      OR d.description ILIKE '%' || p_search_query || '%'
      OR d.author_name ILIKE '%' || p_search_query || '%'
    )
  ORDER BY
    CASE WHEN p_sort_by = 'popular' THEN d.downloads END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'subscribers' THEN d.subscriber_count END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'new' THEN d.published_at END DESC NULLS LAST,
    d.featured DESC,
    d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant access to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO anon;

-- =====================================================
-- Get Datasource by Share Code
-- =====================================================

CREATE OR REPLACE FUNCTION get_datasource_by_share_code(p_share_code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_name TEXT,
  author_id UUID,
  game_system TEXT,
  version TEXT,
  version_number INTEGER,
  downloads INTEGER,
  subscriber_count INTEGER,
  data JSONB,
  is_subscribed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.description,
    d.author_name,
    d.user_id AS author_id,
    d.game_system,
    d.version,
    d.version_number,
    d.downloads,
    d.subscriber_count,
    d.data,
    EXISTS (
      SELECT 1 FROM public.datasource_subscriptions s
      WHERE s.datasource_id = d.id AND s.user_id = auth.uid()
    ) AS is_subscribed
  FROM public.user_datasources d
  WHERE d.share_code = p_share_code AND d.is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_datasource_by_share_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_datasource_by_share_code(TEXT) TO anon;

-- =====================================================
-- Subscribe to Datasource
-- =====================================================

CREATE OR REPLACE FUNCTION subscribe_to_datasource(p_datasource_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_datasource RECORD;
  v_existing_sub RECORD;
BEGIN
  -- Check authentication
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get datasource info
  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE id = p_datasource_id AND is_public = true;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not public');
  END IF;

  -- Prevent subscribing to own datasource
  IF v_datasource.user_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot subscribe to your own datasource');
  END IF;

  -- Check if already subscribed
  SELECT * INTO v_existing_sub
  FROM public.datasource_subscriptions
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  IF v_existing_sub IS NOT NULL THEN
    -- Already subscribed, just update the sync time
    UPDATE public.datasource_subscriptions
    SET last_synced_version = v_datasource.version_number,
        last_synced_at = NOW()
    WHERE id = v_existing_sub.id;

    RETURN jsonb_build_object(
      'success', true,
      'datasource_id', p_datasource_id,
      'version_number', v_datasource.version_number,
      'already_subscribed', true
    );
  END IF;

  -- Insert new subscription
  INSERT INTO public.datasource_subscriptions (user_id, datasource_id, last_synced_version, last_synced_at)
  VALUES (v_user_id, p_datasource_id, v_datasource.version_number, NOW());

  -- Increment download count
  UPDATE public.user_datasources
  SET downloads = downloads + 1
  WHERE id = p_datasource_id;

  RETURN jsonb_build_object(
    'success', true,
    'datasource_id', p_datasource_id,
    'version_number', v_datasource.version_number,
    'already_subscribed', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION subscribe_to_datasource(UUID) TO authenticated;

-- =====================================================
-- Unsubscribe from Datasource
-- =====================================================

CREATE OR REPLACE FUNCTION unsubscribe_from_datasource(p_datasource_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  DELETE FROM public.datasource_subscriptions
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unsubscribe_from_datasource(UUID) TO authenticated;

-- =====================================================
-- Get User's Subscriptions
-- =====================================================

CREATE OR REPLACE FUNCTION get_my_subscriptions()
RETURNS TABLE (
  subscription_id UUID,
  datasource_id UUID,
  datasource_name TEXT,
  author_name TEXT,
  game_system TEXT,
  version TEXT,
  current_version INTEGER,
  subscribed_version INTEGER,
  has_update BOOLEAN,
  subscribed_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS subscription_id,
    d.id AS datasource_id,
    d.name AS datasource_name,
    d.author_name,
    d.game_system,
    d.version,
    d.version_number AS current_version,
    s.last_synced_version AS subscribed_version,
    (d.version_number > s.last_synced_version) AS has_update,
    s.subscribed_at,
    s.last_synced_at
  FROM public.datasource_subscriptions s
  JOIN public.user_datasources d ON d.id = s.datasource_id
  WHERE s.user_id = auth.uid()
  ORDER BY s.subscribed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_my_subscriptions() TO authenticated;

-- =====================================================
-- Get Subscription Updates
-- =====================================================

CREATE OR REPLACE FUNCTION get_subscription_updates()
RETURNS TABLE (
  subscription_id UUID,
  datasource_id UUID,
  datasource_name TEXT,
  current_version INTEGER,
  subscribed_version INTEGER,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS subscription_id,
    d.id AS datasource_id,
    d.name AS datasource_name,
    d.version_number AS current_version,
    s.last_synced_version AS subscribed_version,
    d.updated_at
  FROM public.datasource_subscriptions s
  JOIN public.user_datasources d ON d.id = s.datasource_id
  WHERE
    s.user_id = auth.uid()
    AND d.version_number > s.last_synced_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_subscription_updates() TO authenticated;

-- =====================================================
-- Mark Subscription Synced
-- =====================================================

CREATE OR REPLACE FUNCTION mark_subscription_synced(
  p_subscription_id UUID,
  p_version INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE public.datasource_subscriptions
  SET last_synced_version = p_version,
      last_synced_at = NOW()
  WHERE id = p_subscription_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Subscription not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_subscription_synced(UUID, INTEGER) TO authenticated;

-- =====================================================
-- Publish Datasource
-- =====================================================

CREATE OR REPLACE FUNCTION publish_datasource(
  p_datasource_db_id UUID,
  p_description TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_share_code TEXT;
  v_datasource RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get datasource and verify ownership
  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = v_user_id;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  -- Use existing share code or generate new one
  IF v_datasource.share_code IS NOT NULL THEN
    v_share_code := v_datasource.share_code;
  ELSE
    -- Generate unique share code
    v_share_code := public.generate_share_code(8);
    WHILE EXISTS (SELECT 1 FROM public.user_datasources WHERE share_code = v_share_code) LOOP
      v_share_code := public.generate_share_code(8);
    END LOOP;
  END IF;

  -- Update datasource
  UPDATE public.user_datasources
  SET
    is_public = true,
    share_code = v_share_code,
    description = COALESCE(p_description, description),
    game_system = COALESCE(p_game_system, game_system),
    published_at = COALESCE(published_at, NOW())
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'share_code', v_share_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION publish_datasource(UUID, TEXT, TEXT) TO authenticated;

-- =====================================================
-- Unpublish Datasource
-- =====================================================

CREATE OR REPLACE FUNCTION unpublish_datasource(p_datasource_db_id UUID)
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
    WHERE id = p_datasource_db_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  -- Count subscriptions that will be removed
  SELECT COUNT(*) INTO v_sub_count
  FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  -- Remove all subscriptions
  DELETE FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  -- Mark as private (keep share_code for potential republish)
  UPDATE public.user_datasources
  SET is_public = false,
      subscriber_count = 0
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'removed_subscriptions', v_sub_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unpublish_datasource(UUID) TO authenticated;

-- =====================================================
-- Update Published Datasource
-- =====================================================

CREATE OR REPLACE FUNCTION update_published_datasource(
  p_datasource_db_id UUID,
  p_data JSONB,
  p_version TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_old_version INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get current version and verify ownership
  SELECT version_number INTO v_old_version
  FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = v_user_id;

  IF v_old_version IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  -- Update with incremented version
  UPDATE public.user_datasources
  SET
    data = p_data,
    version = p_version,
    version_number = v_old_version + 1,
    updated_at = NOW()
  WHERE id = p_datasource_db_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_version_number', v_old_version + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_published_datasource(UUID, JSONB, TEXT) TO authenticated;

-- =====================================================
-- Get My Published Datasources
-- =====================================================

CREATE OR REPLACE FUNCTION get_my_datasources()
RETURNS TABLE (
  id UUID,
  datasource_id TEXT,
  name TEXT,
  description TEXT,
  game_system TEXT,
  version TEXT,
  version_number INTEGER,
  is_public BOOLEAN,
  share_code TEXT,
  downloads INTEGER,
  subscriber_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.datasource_id,
    d.name,
    d.description,
    d.game_system,
    d.version,
    d.version_number,
    d.is_public,
    d.share_code,
    d.downloads,
    d.subscriber_count,
    d.created_at,
    d.updated_at,
    d.published_at
  FROM public.user_datasources d
  WHERE d.user_id = auth.uid()
  ORDER BY d.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_my_datasources() TO authenticated;

-- =====================================================
-- Get Featured Datasources
-- =====================================================

CREATE OR REPLACE FUNCTION get_featured_datasources(p_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  author_name TEXT,
  game_system TEXT,
  downloads INTEGER,
  subscriber_count INTEGER,
  share_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.description,
    d.author_name,
    d.game_system,
    d.downloads,
    d.subscriber_count,
    d.share_code
  FROM public.user_datasources d
  WHERE d.is_public = true AND d.featured = true
  ORDER BY d.downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_featured_datasources(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_featured_datasources(INTEGER) TO anon;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION browse_public_datasources IS 'Browse public datasources with filtering, sorting, and pagination';
COMMENT ON FUNCTION get_datasource_by_share_code IS 'Get a public datasource by its share code';
COMMENT ON FUNCTION subscribe_to_datasource IS 'Subscribe to a public datasource (increments download count)';
COMMENT ON FUNCTION unsubscribe_from_datasource IS 'Unsubscribe from a datasource';
COMMENT ON FUNCTION get_my_subscriptions IS 'Get all datasources the user is subscribed to';
COMMENT ON FUNCTION get_subscription_updates IS 'Get subscriptions that have newer versions available';
COMMENT ON FUNCTION mark_subscription_synced IS 'Mark a subscription as synced to a specific version';
COMMENT ON FUNCTION publish_datasource IS 'Make a datasource public with share code';
COMMENT ON FUNCTION unpublish_datasource IS 'Make a datasource private and remove all subscriptions';
COMMENT ON FUNCTION update_published_datasource IS 'Update datasource data and increment version';
COMMENT ON FUNCTION get_my_datasources IS 'Get all datasources owned by the current user';
COMMENT ON FUNCTION get_featured_datasources IS 'Get featured datasources for homepage display';
