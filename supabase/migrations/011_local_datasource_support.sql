-- =====================================================
-- Game Datacards - Local Datasource Support
-- Migration 011: Schema Changes for Edit/Publish Workflow
-- =====================================================

-- =====================================================
-- Extend user_datasources Table
-- =====================================================

-- Add columns for edit/publish workflow
ALTER TABLE public.user_datasources
  ADD COLUMN IF NOT EXISTS edit_data JSONB,
  ADD COLUMN IF NOT EXISTS published_data JSONB,
  ADD COLUMN IF NOT EXISTS is_uploaded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS edit_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_edit_sync TIMESTAMPTZ;

-- Add index for finding uploaded but not public datasources
CREATE INDEX IF NOT EXISTS idx_user_datasources_uploaded
  ON public.user_datasources(is_uploaded) WHERE is_uploaded = true AND is_public = false;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON COLUMN public.user_datasources.edit_data IS 'Owner working copy of datasource data (syncs like categories)';
COMMENT ON COLUMN public.user_datasources.published_data IS 'Public version for subscribers (snapshot at time of publish)';
COMMENT ON COLUMN public.user_datasources.is_uploaded IS 'Whether datasource has been uploaded to cloud (may not be public)';
COMMENT ON COLUMN public.user_datasources.edit_version IS 'Version counter for edit_data (increments on each sync)';
COMMENT ON COLUMN public.user_datasources.last_edit_sync IS 'Timestamp of last edit_data sync';

-- =====================================================
-- Sync Local Datasource Edit Data
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
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if datasource already exists for this user
  SELECT * INTO v_existing
  FROM public.user_datasources
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  IF v_existing IS NOT NULL THEN
    -- Check for version conflict
    IF v_existing.edit_version > p_edit_version AND v_existing.device_id != p_device_id THEN
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

GRANT EXECUTE ON FUNCTION sync_local_datasource(TEXT, TEXT, JSONB, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- Publish Local Datasource (Copy edit_data to published_data)
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

GRANT EXECUTE ON FUNCTION publish_local_datasource(UUID, TEXT, TEXT) TO authenticated;

-- =====================================================
-- Push Datasource Update (Update published_data from edit_data)
-- =====================================================

CREATE OR REPLACE FUNCTION push_datasource_update(
  p_datasource_db_id UUID,
  p_new_version TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_datasource RECORD;
  v_new_version_number INTEGER;
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

  -- Must be published to push update
  IF NOT v_datasource.is_public THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource is not published');
  END IF;

  -- Check if edit_data exists
  IF v_datasource.edit_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No edit data to push');
  END IF;

  -- Increment version number
  v_new_version_number := COALESCE(v_datasource.version_number, 1) + 1;

  -- Copy edit_data to published_data and data
  UPDATE public.user_datasources
  SET
    published_data = edit_data,
    data = edit_data,
    version = COALESCE(p_new_version, version),
    version_number = v_new_version_number,
    updated_at = NOW()
  WHERE id = p_datasource_db_id;

  RETURN jsonb_build_object(
    'success', true,
    'version_number', v_new_version_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION push_datasource_update(UUID, TEXT) TO authenticated;

-- =====================================================
-- Get Local Datasource Edit Data
-- =====================================================

CREATE OR REPLACE FUNCTION get_local_datasource_edit(p_datasource_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_datasource RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_datasource
  FROM public.user_datasources
  WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

  IF v_datasource IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_datasource.id,
    'datasource_id', v_datasource.datasource_id,
    'name', v_datasource.name,
    'edit_data', v_datasource.edit_data,
    'edit_version', v_datasource.edit_version,
    'version', v_datasource.version,
    'is_public', v_datasource.is_public,
    'is_uploaded', v_datasource.is_uploaded,
    'share_code', v_datasource.share_code,
    'version_number', v_datasource.version_number,
    'last_edit_sync', v_datasource.last_edit_sync
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_local_datasource_edit(TEXT) TO authenticated;

-- =====================================================
-- Delete Local Datasource from Cloud
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
    WHERE id = p_datasource_db_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Datasource not found or not owned by user');
  END IF;

  -- Count subscriptions that will be removed
  SELECT COUNT(*) INTO v_sub_count
  FROM public.datasource_subscriptions
  WHERE datasource_id = p_datasource_db_id;

  -- Delete the datasource (subscriptions cascade delete)
  DELETE FROM public.user_datasources
  WHERE id = p_datasource_db_id AND user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'removed_subscriptions', v_sub_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_local_datasource(UUID) TO authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION sync_local_datasource IS 'Sync local datasource edit_data to cloud with conflict detection';
COMMENT ON FUNCTION publish_local_datasource IS 'Publish local datasource by copying edit_data to published_data';
COMMENT ON FUNCTION push_datasource_update IS 'Push update to published datasource from edit_data';
COMMENT ON FUNCTION get_local_datasource_edit IS 'Get local datasource edit data for owner';
COMMENT ON FUNCTION delete_local_datasource IS 'Delete a local datasource from cloud';
