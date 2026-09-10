-- =====================================================
-- Game Datacards - Soft Delete for Categories
-- Migration 030: Deleting a synced category now sets a
-- deleted flag instead of removing the row, matching the
-- soft-delete behavior of user_datasources (migration 012).
--
-- Apply after gdc-premium migrations 014/017: this file
-- redefines validate_category_limit, get_subscription_usage
-- and check_subscription_limit on top of those versions
-- (sub-categories exempt, templates included).
-- =====================================================

-- =====================================================
-- 1. Add soft delete columns
-- =====================================================

ALTER TABLE public.user_categories
  ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index for filtering out deleted categories efficiently
CREATE INDEX IF NOT EXISTS idx_user_categories_not_deleted
  ON public.user_categories(user_id) WHERE deleted = false;

COMMENT ON COLUMN public.user_categories.deleted IS 'Soft delete flag - true means category is deleted but retained for admin/recovery';
COMMENT ON COLUMN public.user_categories.deleted_at IS 'Timestamp when category was soft deleted';

-- =====================================================
-- 2. delete_category RPC (soft delete)
-- =====================================================

CREATE OR REPLACE FUNCTION delete_category(p_uuid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE public.user_categories
  SET
    deleted = true,
    deleted_at = NOW(),
    last_modified = NOW()
  WHERE user_id = v_user_id AND uuid = p_uuid AND deleted = false
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Category not found');
  END IF;

  RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_category(TEXT) TO authenticated;

-- =====================================================
-- 3. sync_category: restore soft-deleted rows on re-sync
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
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing RECORD;
  v_result_id UUID;
  v_cloud_version INTEGER;
  v_tier TEXT;
  v_tier_limits JSONB;
  v_limit INTEGER;
  v_current INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Restore path: re-syncing a soft-deleted uuid revives the row.
  -- The BEFORE INSERT limit trigger skips existing (user_id, uuid) rows,
  -- so the tier limit for restores must be enforced here.
  SELECT * INTO v_existing
  FROM public.user_categories
  WHERE user_id = v_user_id AND uuid = p_uuid;

  IF v_existing.id IS NOT NULL AND v_existing.deleted THEN
    -- Only top-level categories count against the tier limit
    IF p_parent_id IS NULL THEN
      v_tier        := get_effective_tier(v_user_id);
      v_tier_limits := get_tier_limits(v_tier);
      v_limit       := (v_tier_limits->>'categories')::INTEGER;

      SELECT COUNT(*) INTO v_current
      FROM public.user_categories
      WHERE user_id = v_user_id AND parent_id IS NULL AND deleted = false;

      IF v_current >= v_limit THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', format('SUBSCRIPTION_LIMIT_EXCEEDED:categories:%s:%s;%s', v_current, v_limit, v_tier)
        );
      END IF;
    END IF;

    UPDATE public.user_categories
    SET
      name = p_name,
      type = p_type,
      parent_id = p_parent_id,
      cards = p_cards,
      closed = p_closed,
      version = p_version,
      device_id = p_device_id,
      deleted = false,
      deleted_at = NULL,
      last_modified = NOW()
    WHERE id = v_existing.id;

    RETURN jsonb_build_object('success', true, 'id', v_existing.id, 'version', p_version, 'restored', true);
  END IF;

  -- Atomic upsert with version guard in the ON CONFLICT WHERE clause.
  -- New inserts always succeed (tier limits enforced by existing trigger).
  -- Updates only proceed if our version >= cloud version, or same/unknown device.
  -- A row soft-deleted between the SELECT above and this INSERT is always
  -- overwritable (restore semantics beat the version guard).
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
    deleted = false,
    deleted_at = NULL,
    last_modified = NOW()
  WHERE
    public.user_categories.deleted = true
    OR public.user_categories.version <= EXCLUDED.version
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
$$;

-- =====================================================
-- 4. Limit checking excludes soft-deleted categories
--    (based on the gdc-premium 014/017 versions: sub-
--    categories exempt, templates included; also restores
--    the deleted=false datasource filter from migration 012
--    that those versions dropped)
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_category_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier        TEXT;
  v_limit       INTEGER;
  v_current     INTEGER;
  v_tier_limits JSONB;
BEGIN
  -- Sub-category inserts are exempt from the category limit.
  IF NEW.parent_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Upsert guard: if the row already exists (soft-deleted or not), this
  -- INSERT will resolve to an UPDATE via ON CONFLICT and must not be
  -- blocked here. Restores of soft-deleted rows are limit-checked inside
  -- sync_category instead.
  IF EXISTS (
    SELECT 1 FROM public.user_categories
    WHERE user_id = NEW.user_id AND uuid = NEW.uuid
  ) THEN
    RETURN NEW;
  END IF;

  v_tier        := public.get_effective_tier(NEW.user_id);
  v_tier_limits := public.get_tier_limits(v_tier);
  v_limit       := (v_tier_limits->>'categories')::INTEGER;

  SELECT COUNT(*)
    INTO v_current
    FROM public.user_categories
   WHERE user_id = NEW.user_id
     AND parent_id IS NULL
     AND deleted = false;

  IF v_current >= v_limit THEN
    RAISE EXCEPTION
      'SUBSCRIPTION_LIMIT_EXCEEDED:categories:%:%;%',
      v_current, v_limit, v_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade your subscription to add more categories';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.validate_category_limit() IS
  'Enforces category limit per subscription tier. Sub-categories and soft-deleted '
  'categories are exempt from the count; upsert-updates on existing (user_id, uuid) '
  'rows skip the limit check so sync_category can update rows for users at their cap.';

CREATE OR REPLACE FUNCTION public.get_subscription_usage()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id            UUID := auth.uid();
  v_tier               TEXT;
  v_tier_limits        JSONB;
  v_categories_current INTEGER;
  v_categories_limit   INTEGER;
  v_datasources_current INTEGER;
  v_datasources_limit  INTEGER;
  v_templates_current  INTEGER;
  v_templates_limit    INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_tier        := public.get_effective_tier(v_user_id);
  v_tier_limits := public.get_tier_limits(v_tier);

  v_categories_limit  := (v_tier_limits->>'categories')::INTEGER;
  v_datasources_limit := (v_tier_limits->>'datasources')::INTEGER;
  v_templates_limit   := COALESCE((v_tier_limits->>'templates')::INTEGER, 0);

  SELECT COUNT(*)
    INTO v_categories_current
    FROM public.user_categories
   WHERE user_id = v_user_id
     AND parent_id IS NULL
     AND deleted = false;

  SELECT COUNT(*)
    INTO v_datasources_current
    FROM public.user_datasources
   WHERE user_id = v_user_id
     AND deleted = false;

  SELECT COUNT(*)
    INTO v_templates_current
    FROM public.user_templates
   WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'tier', v_tier,
    'categories', jsonb_build_object(
      'current',   v_categories_current,
      'limit',     v_categories_limit,
      'remaining', GREATEST(0, v_categories_limit - v_categories_current)
    ),
    'datasources', jsonb_build_object(
      'current',   v_datasources_current,
      'limit',     v_datasources_limit,
      'remaining', GREATEST(0, v_datasources_limit - v_datasources_current)
    ),
    'templates', jsonb_build_object(
      'current',   v_templates_current,
      'limit',     v_templates_limit,
      'remaining', GREATEST(0, v_templates_limit - v_templates_current)
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_subscription_limit(p_resource TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     UUID := auth.uid();
  v_tier        TEXT;
  v_tier_limits JSONB;
  v_current     INTEGER;
  v_limit       INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_tier        := public.get_effective_tier(v_user_id);
  v_tier_limits := public.get_tier_limits(v_tier);

  IF p_resource = 'categories' THEN
    v_limit := (v_tier_limits->>'categories')::INTEGER;
    SELECT COUNT(*)
      INTO v_current
      FROM public.user_categories
     WHERE user_id = v_user_id
       AND parent_id IS NULL
       AND deleted = false;
  ELSIF p_resource = 'datasources' THEN
    v_limit := (v_tier_limits->>'datasources')::INTEGER;
    SELECT COUNT(*)
      INTO v_current
      FROM public.user_datasources
     WHERE user_id = v_user_id
       AND deleted = false;
  ELSIF p_resource = 'templates' THEN
    v_limit := COALESCE((v_tier_limits->>'templates')::INTEGER, 0);
    SELECT COUNT(*)
      INTO v_current
      FROM public.user_templates
     WHERE user_id = v_user_id;
  ELSE
    RAISE EXCEPTION 'Unknown resource: %', p_resource;
  END IF;

  RETURN jsonb_build_object(
    'resource',  p_resource,
    'tier',      v_tier,
    'current',   v_current,
    'limit',     v_limit,
    'remaining', GREATEST(0, v_limit - v_current),
    'canAdd',    v_current < v_limit
  );
END;
$$;

-- =====================================================
-- 5. RLS: users cannot see soft-deleted categories,
--    and can no longer hard-delete rows at all
-- =====================================================

DROP POLICY IF EXISTS "Users can view own categories" ON public.user_categories;
CREATE POLICY "Users can view own categories"
  ON public.user_categories
  FOR SELECT
  USING ((select auth.uid()) = user_id AND deleted = false);

-- Deletes must go through the delete_category RPC (soft delete).
-- Without a DELETE policy, client-issued hard deletes affect zero rows.
DROP POLICY IF EXISTS "Users can delete own categories" ON public.user_categories;

-- The "Admins can view all categories" policy from migration 026 is
-- unchanged, so admins retain visibility of soft-deleted rows.

-- =====================================================
-- 6. Admin function to view deleted categories
-- =====================================================

CREATE OR REPLACE FUNCTION admin_get_deleted_categories(
  p_user_id UUID DEFAULT NULL
)
RETURNS SETOF public.user_categories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Note: Caller should verify admin status before calling this
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT *
    FROM public.user_categories
    WHERE user_id = p_user_id AND deleted = true
    ORDER BY deleted_at DESC;
  ELSE
    RETURN QUERY
    SELECT *
    FROM public.user_categories
    WHERE deleted = true
    ORDER BY deleted_at DESC;
  END IF;
END;
$$;

-- Only grant to service role (admin)
REVOKE ALL ON FUNCTION admin_get_deleted_categories(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_get_deleted_categories(UUID) FROM authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION delete_category IS 'Soft deletes a category (sets deleted=true) instead of removing it from the database';
COMMENT ON FUNCTION sync_category IS 'Sync category with atomic upsert, soft-delete restoration, and version guard';
COMMENT ON FUNCTION admin_get_deleted_categories IS 'Admin-only function to view soft-deleted categories';
