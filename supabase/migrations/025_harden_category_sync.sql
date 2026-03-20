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
  v_existing RECORD;
  v_new_id UUID;
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_categories INT;
  v_current_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Advisory lock serializes concurrent sync calls for the same (user, category)
  -- Prevents race between SELECT and INSERT that causes unique_violation
  PERFORM pg_advisory_xact_lock(hashtext(v_user_id::text || ':' || p_uuid));

  SELECT * INTO v_existing
  FROM public.user_categories
  WHERE user_id = v_user_id AND uuid = p_uuid;

  IF v_existing IS NOT NULL THEN
    -- Existing record: check version guard
    IF v_existing.version > p_version
       AND (v_existing.device_id IS NULL OR v_existing.device_id != p_device_id) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'version_conflict',
        'cloud_version', v_existing.version,
        'local_version', p_version
      );
    END IF;

    UPDATE public.user_categories
    SET name = p_name,
        type = p_type,
        parent_id = p_parent_id,
        cards = p_cards,
        closed = p_closed,
        version = p_version,
        device_id = p_device_id,
        last_modified = NOW()
    WHERE id = v_existing.id;

    RETURN jsonb_build_object('success', true, 'id', v_existing.id, 'version', p_version);
  ELSE
    -- New record: check tier limits before inserting
    v_effective_tier := get_effective_tier(v_user_id);
    v_limits := get_tier_limits(v_effective_tier);
    v_max_categories := (v_limits->>'categories')::INT;

    SELECT COUNT(*) INTO v_current_count
    FROM public.user_categories
    WHERE user_id = v_user_id;

    IF v_current_count >= v_max_categories THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('SUBSCRIPTION_LIMIT_EXCEEDED:categories:%s:%s;%s', v_current_count, v_max_categories, v_effective_tier)
      );
    END IF;

    INSERT INTO public.user_categories (
      user_id, uuid, name, type, parent_id, cards, closed, version, device_id, last_modified
    ) VALUES (
      v_user_id, p_uuid, p_name, p_type, p_parent_id, p_cards, p_closed,
      p_version, p_device_id, NOW()
    ) RETURNING id INTO v_new_id;

    RETURN jsonb_build_object('success', true, 'id', v_new_id, 'version', p_version);
  END IF;
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
