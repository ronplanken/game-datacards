-- =====================================================
-- Migration 025: Harden category sync with RPC + restrict direct writes
-- =====================================================
-- Creates sync_category RPC with server-side version guard
-- Drops INSERT/UPDATE policies on user_categories and user_datasources
-- to force all writes through SECURITY DEFINER RPCs

-- =====================================================
-- sync_category RPC function
-- =====================================================
CREATE OR REPLACE FUNCTION sync_category(
  p_uuid TEXT,
  p_name TEXT,
  p_type TEXT,
  p_parent_id TEXT,
  p_cards JSONB,
  p_closed BOOLEAN,
  p_version INTEGER,
  p_device_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result_id UUID;
  v_cloud_version INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Atomic upsert with version guard in the ON CONFLICT WHERE clause.
  -- New inserts always succeed (tier limits enforced by existing trigger).
  -- Updates only proceed if our version >= cloud version, or same/unknown device.
  INSERT INTO public.user_categories (
    user_id, uuid, name, type, parent_id, cards, closed, version, device_id, last_modified
  ) VALUES (
    v_user_id, p_uuid, p_name, p_type, p_parent_id, p_cards, p_closed,
    p_version, p_device_id, NOW()
  )
  ON CONFLICT (user_id, uuid) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    parent_id = EXCLUDED.parent_id,
    cards = EXCLUDED.cards,
    closed = EXCLUDED.closed,
    version = EXCLUDED.version,
    device_id = EXCLUDED.device_id,
    last_modified = NOW()
  WHERE
    public.user_categories.version <= EXCLUDED.version
    OR public.user_categories.device_id IS NULL
    OR public.user_categories.device_id = EXCLUDED.device_id
  RETURNING id INTO v_result_id;

  IF v_result_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'id', v_result_id, 'version', p_version);
  END IF;

  -- No row returned: conflict row exists but version guard rejected the update
  SELECT version INTO v_cloud_version
  FROM public.user_categories
  WHERE user_id = v_user_id AND uuid = p_uuid;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'version_conflict',
    'cloud_version', v_cloud_version,
    'local_version', p_version
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION sync_category(TEXT, TEXT, TEXT, TEXT, JSONB, BOOLEAN, INTEGER, TEXT) TO authenticated;

-- =====================================================
-- Restrict direct INSERT/UPDATE on user_categories
-- All writes must go through sync_category RPC (SECURITY DEFINER)
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own categories" ON public.user_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.user_categories;

-- =====================================================
-- Restrict direct INSERT/UPDATE on user_datasources
-- All writes must go through sync_local_datasource / upsert_datasource RPCs (SECURITY DEFINER)
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own datasources" ON public.user_datasources;
DROP POLICY IF EXISTS "Users can update own datasources" ON public.user_datasources;

-- =====================================================
-- Fix sync_local_datasource: make INSERT branch atomic
-- Same race condition as sync_category - two concurrent calls
-- for a new datasource can both SELECT nothing, then both INSERT.
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
    -- Insert new datasource (atomic: ON CONFLICT handles race with concurrent insert)
    INSERT INTO public.user_datasources (
      user_id, datasource_id, name, edit_data, edit_version,
      version, author_name, display_format, game_system,
      device_id, last_edit_sync, is_uploaded, is_public
    ) VALUES (
      v_user_id, p_datasource_id, p_name, p_edit_data, p_edit_version,
      p_version, p_author_name, p_display_format, p_game_system,
      p_device_id, NOW(), true, false
    )
    ON CONFLICT (user_id, datasource_id) DO UPDATE SET
      name = EXCLUDED.name,
      edit_data = EXCLUDED.edit_data,
      edit_version = EXCLUDED.edit_version,
      version = EXCLUDED.version,
      author_name = COALESCE(EXCLUDED.author_name, public.user_datasources.author_name),
      display_format = COALESCE(EXCLUDED.display_format, public.user_datasources.display_format),
      game_system = COALESCE(EXCLUDED.game_system, public.user_datasources.game_system),
      device_id = EXCLUDED.device_id,
      last_edit_sync = NOW(),
      is_uploaded = true,
      updated_at = NOW()
    WHERE
      public.user_datasources.edit_version <= EXCLUDED.edit_version
      OR public.user_datasources.device_id IS NULL
      OR public.user_datasources.device_id = EXCLUDED.device_id
    RETURNING id INTO v_new_id;

    IF v_new_id IS NULL THEN
      -- Race: another request inserted first with a higher version
      SELECT edit_version INTO v_existing
      FROM public.user_datasources
      WHERE user_id = v_user_id AND datasource_id = p_datasource_id;

      RETURN jsonb_build_object(
        'success', false,
        'error', 'version_conflict',
        'cloud_version', v_existing.edit_version,
        'local_version', p_edit_version
      );
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'id', v_new_id,
      'edit_version', p_edit_version
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_local_datasource IS 'Sync local datasource with atomic upsert, soft-delete restoration, and version guard';
