-- =====================================================
-- Game Datacards - Harden Datasource Sync
-- Migration 021: Fix sync issues from audit report
-- =====================================================

-- =====================================================
-- A1. is_admin() helper function
-- Used by RLS policies to restrict hard deletes to admins
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = (select auth.uid()) AND subscription_tier = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =====================================================
-- A2. RLS policy changes: restrict hard deletes to admins
-- =====================================================

-- Drop the existing policy that lets any user hard-delete
DROP POLICY IF EXISTS "Users can delete own datasources" ON public.user_datasources;

-- Only admins can hard-delete (regular users must use soft-delete RPC)
CREATE POLICY "Only admins can hard delete datasources" ON public.user_datasources
  FOR DELETE USING ((select auth.uid()) = user_id AND is_admin());

-- Update view policy so admins can also see soft-deleted rows
DROP POLICY IF EXISTS "Users can view own datasources" ON public.user_datasources;
CREATE POLICY "Users can view own datasources" ON public.user_datasources
  FOR SELECT USING (
    (user_id = (select auth.uid()) AND deleted = false)
    OR (user_id = (select auth.uid()) AND is_admin())
  );

-- =====================================================
-- A3. Fix sync_local_datasource RPC
-- - Handle soft-deleted rows (un-soft-delete with tier check)
-- - Fix NULL device_id comparison
-- =====================================================

CREATE OR REPLACE FUNCTION sync_local_datasource(
  p_datasource_id TEXT,
  p_name TEXT,
  p_edit_data JSONB,
  p_edit_version INTEGER,
  p_version TEXT,
  p_author_name TEXT DEFAULT NULL,
  p_display_format TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing RECORD;
  v_new_id UUID;
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_datasources INT;
  v_current_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if datasource already exists for this user (including soft-deleted)
  SELECT * INTO v_existing
  FROM public.user_datasources
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  IF v_existing IS NOT NULL THEN
    -- Handle soft-deleted row: restore it
    IF v_existing.deleted = true THEN
      -- Check tier limits before restoring
      v_effective_tier := get_effective_tier(v_user_id);
      v_limits := get_tier_limits(v_effective_tier);
      v_max_datasources := (v_limits->>'datasources')::INT;

      SELECT COUNT(*) INTO v_current_count
      FROM public.user_datasources
      WHERE user_id = v_user_id AND deleted = false;

      IF v_current_count >= v_max_datasources THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', format('SUBSCRIPTION_LIMIT_EXCEEDED:datasources:%s:%s;%s', v_current_count, v_max_datasources, v_effective_tier)
        );
      END IF;

      -- Restore and update
      UPDATE public.user_datasources
      SET
        name = p_name,
        edit_data = p_edit_data,
        edit_version = p_edit_version,
        version = p_version,
        author_name = COALESCE(p_author_name, author_name),
        display_format = COALESCE(p_display_format, display_format),
        game_system = COALESCE(p_game_system, game_system),
        device_id = p_device_id,
        last_edit_sync = NOW(),
        is_uploaded = true,
        deleted = false,
        deleted_at = NULL,
        updated_at = NOW()
      WHERE id = v_existing.id;

      RETURN jsonb_build_object(
        'success', true,
        'id', v_existing.id,
        'edit_version', p_edit_version,
        'restored', true
      );
    END IF;

    -- Check for version conflict (fix NULL device_id comparison)
    IF v_existing.edit_version > p_edit_version
       AND (v_existing.device_id IS NULL OR v_existing.device_id != p_device_id) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'version_conflict',
        'cloud_version', v_existing.edit_version,
        'local_version', p_edit_version,
        'cloud_data', v_existing.edit_data
      );
    END IF;

    -- Update existing datasource
    UPDATE public.user_datasources
    SET
      name = p_name,
      edit_data = p_edit_data,
      edit_version = p_edit_version,
      version = p_version,
      author_name = COALESCE(p_author_name, author_name),
      display_format = COALESCE(p_display_format, display_format),
      game_system = COALESCE(p_game_system, game_system),
      device_id = p_device_id,
      last_edit_sync = NOW(),
      is_uploaded = true,
      updated_at = NOW()
    WHERE id = v_existing.id;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_existing.id,
      'edit_version', p_edit_version
    );
  ELSE
    -- Insert new datasource
    INSERT INTO public.user_datasources (
      user_id,
      datasource_id,
      name,
      edit_data,
      edit_version,
      version,
      author_name,
      display_format,
      game_system,
      device_id,
      last_edit_sync,
      is_uploaded,
      is_public
    ) VALUES (
      v_user_id,
      p_datasource_id,
      p_name,
      p_edit_data,
      p_edit_version,
      p_version,
      p_author_name,
      p_display_format,
      p_game_system,
      p_device_id,
      NOW(),
      true,
      false
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_new_id,
      'edit_version', p_edit_version
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- A4. New upsert_datasource RPC
-- For useDatasourceSharing.uploadDatasource() which uses
-- the 'data' column (not edit_data)
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_datasource(
  p_datasource_id TEXT,
  p_name TEXT,
  p_data JSONB,
  p_version TEXT DEFAULT '1.0.0',
  p_author_name TEXT DEFAULT NULL,
  p_display_format TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing RECORD;
  v_new_id UUID;
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_datasources INT;
  v_current_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check for existing row (including soft-deleted)
  SELECT * INTO v_existing
  FROM public.user_datasources
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  IF v_existing IS NOT NULL AND v_existing.deleted = true THEN
    -- Soft-deleted: check tier limit before restoring
    v_effective_tier := get_effective_tier(v_user_id);
    v_limits := get_tier_limits(v_effective_tier);
    v_max_datasources := (v_limits->>'datasources')::INT;

    SELECT COUNT(*) INTO v_current_count
    FROM public.user_datasources
    WHERE user_id = v_user_id AND deleted = false;

    IF v_current_count >= v_max_datasources THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('SUBSCRIPTION_LIMIT_EXCEEDED:datasources:%s:%s;%s', v_current_count, v_max_datasources, v_effective_tier)
      );
    END IF;

    -- Restore and update
    UPDATE public.user_datasources
    SET
      name = p_name,
      data = p_data,
      version = p_version,
      author_name = COALESCE(p_author_name, author_name),
      display_format = COALESCE(p_display_format, display_format),
      deleted = false,
      deleted_at = NULL,
      is_public = false,
      updated_at = NOW()
    WHERE id = v_existing.id;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_existing.id,
      'restored', true
    );
  ELSIF v_existing IS NOT NULL THEN
    -- Existing non-deleted: update
    UPDATE public.user_datasources
    SET
      name = p_name,
      data = p_data,
      version = p_version,
      author_name = COALESCE(p_author_name, author_name),
      display_format = COALESCE(p_display_format, display_format),
      updated_at = NOW()
    WHERE id = v_existing.id;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_existing.id,
      'restored', false
    );
  ELSE
    -- Insert new (BEFORE INSERT trigger handles tier limit check)
    INSERT INTO public.user_datasources (
      user_id,
      datasource_id,
      name,
      data,
      version,
      author_name,
      display_format,
      is_public
    ) VALUES (
      v_user_id,
      p_datasource_id,
      p_name,
      p_data,
      p_version,
      p_author_name,
      p_display_format,
      false
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_new_id,
      'restored', false
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION upsert_datasource(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- A5. Fix subscribe_to_datasource TOCTOU race
-- Replace check-then-insert with INSERT ON CONFLICT
-- =====================================================

CREATE OR REPLACE FUNCTION subscribe_to_datasource(p_datasource_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_datasource RECORD;
  v_was_new BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get datasource info
  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE id = p_datasource_id AND is_public = true AND deleted = false;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not public');
  END IF;

  -- Prevent subscribing to own datasource
  IF v_datasource.user_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot subscribe to your own datasource');
  END IF;

  -- Atomic upsert: insert or update on conflict
  INSERT INTO public.datasource_subscriptions (user_id, datasource_id, last_synced_version, last_synced_at)
  VALUES (v_user_id, p_datasource_id, v_datasource.version_number, NOW())
  ON CONFLICT (user_id, datasource_id) DO UPDATE
  SET last_synced_version = EXCLUDED.last_synced_version,
      last_synced_at = EXCLUDED.last_synced_at
  RETURNING (xmax = 0) INTO v_was_new;

  -- Increment download count only for new subscriptions
  IF v_was_new THEN
    UPDATE public.user_datasources
    SET downloads = downloads + 1
    WHERE id = p_datasource_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'datasource_id', p_datasource_id,
    'version_number', v_datasource.version_number,
    'already_subscribed', NOT v_was_new
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- A6. Fix browse_public_datasources N+1 subscriber count
-- Replace correlated subquery with LEFT JOIN
-- =====================================================

DROP FUNCTION IF EXISTS browse_public_datasources(TEXT, TEXT, TEXT, INT, INT);

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
    COALESCE(sc.sub_count, 0) as subscriber_count,
    d.share_code,
    d.created_at,
    d.updated_at,
    EXISTS (
      SELECT 1 FROM public.datasource_subscriptions
      WHERE datasource_id = d.id AND user_id = (select auth.uid())
    ) as is_subscribed
  FROM public.user_datasources d
  LEFT JOIN (
    SELECT datasource_id, COUNT(*) as sub_count
    FROM public.datasource_subscriptions
    GROUP BY datasource_id
  ) sc ON sc.datasource_id = d.id
  WHERE
    d.is_public = true
    AND d.deleted = false
    AND (p_game_system IS NULL OR d.game_system = p_game_system)
    AND (p_search_query IS NULL OR d.name ILIKE '%' || p_search_query || '%' OR d.description ILIKE '%' || p_search_query || '%')
  ORDER BY
    CASE WHEN p_sort_by = 'popular' THEN d.downloads END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'new' THEN d.created_at END DESC,
    CASE WHEN p_sort_by = 'subscribers' THEN COALESCE(sc.sub_count, 0) END DESC NULLS LAST,
    d.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION browse_public_datasources(TEXT, TEXT, TEXT, INT, INT) TO anon;

-- =====================================================
-- A7. Add basic validation to publish_local_datasource
-- =====================================================

CREATE OR REPLACE FUNCTION publish_local_datasource(
  p_datasource_db_id UUID,
  p_description TEXT DEFAULT NULL,
  p_game_system TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_share_code TEXT;
  v_datasource RECORD;
  v_new_version INTEGER;
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

  -- Check if edit_data exists
  IF v_datasource.edit_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No edit data to publish');
  END IF;

  -- Basic validation of edit_data
  IF v_datasource.edit_data->>'name' IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource data missing required "name" field');
  END IF;

  IF jsonb_typeof(v_datasource.edit_data->'data') != 'array' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource data missing required "data" array');
  END IF;

  -- Calculate new version number
  v_new_version := COALESCE(v_datasource.version_number, 0) + 1;

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

  -- Copy edit_data to published_data and data (for backward compat)
  UPDATE public.user_datasources
  SET
    published_data = edit_data,
    data = edit_data,
    is_public = true,
    share_code = v_share_code,
    version_number = v_new_version,
    description = COALESCE(p_description, description),
    game_system = COALESCE(p_game_system, game_system),
    published_at = COALESCE(published_at, NOW()),
    updated_at = NOW()
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'share_code', v_share_code,
    'version_number', v_new_version
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION is_admin IS 'Check if the current user has admin subscription tier';
COMMENT ON FUNCTION upsert_datasource IS 'Insert or restore a datasource with tier limit enforcement';
COMMENT ON FUNCTION subscribe_to_datasource IS 'Atomically subscribe to a public datasource using upsert';
COMMENT ON FUNCTION browse_public_datasources IS 'Browse public datasources with optimized subscriber count join';
COMMENT ON FUNCTION publish_local_datasource IS 'Publish local datasource with basic data validation';
COMMENT ON FUNCTION sync_local_datasource IS 'Sync local datasource with soft-delete restoration and NULL device_id fix';
