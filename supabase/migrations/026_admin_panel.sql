-- =====================================================
-- Game Datacards - Admin Panel
-- Migration 026: Admin helper, RLS policies, audit log, and RPC functions
-- =====================================================

-- =====================================================
-- 1. Admin helper function (replaces the one from migration 021)
-- =====================================================
-- Zero-arg only to avoid overload ambiguity with the existing is_admin().
-- SECURITY DEFINER so it can read user_profiles regardless of caller's RLS context.
-- Adds SET search_path = public to the existing definition.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = (SELECT auth.uid())
      AND subscription_tier = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- =====================================================
-- 2. Admin RLS policies (additive, read-only)
-- =====================================================
-- These SELECT policies OR-combine with existing per-user policies.
-- They do NOT replace or weaken existing policies.

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all categories"
  ON public.user_categories
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all datasources"
  ON public.user_datasources
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all templates"
  ON public.user_templates
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can view all sync metadata"
  ON public.sync_metadata
  FOR SELECT
  USING (public.is_admin());

-- =====================================================
-- 3. Audit log table
-- =====================================================

CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs. No direct INSERT/UPDATE/DELETE policies;
-- inserts happen inside SECURITY DEFINER RPC functions only.
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_log
  FOR SELECT
  USING (public.is_admin());

CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);

-- =====================================================
-- 4. Admin RPC functions
-- =====================================================
-- All SECURITY DEFINER, all verify is_admin() before proceeding.

-- 4a. List users with search, filtering, and pagination
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search TEXT DEFAULT NULL,
  p_tier_filter TEXT DEFAULT NULL,
  p_status_filter TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_dir TEXT DEFAULT 'desc',
  p_limit INTEGER DEFAULT 25,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_total INTEGER;
  v_users JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING HINT = 'Only admin users can perform this action';
  END IF;

  -- Count total matching users
  SELECT COUNT(*)
  INTO v_total
  FROM public.user_profiles p
  WHERE (p_search IS NULL OR p.email ILIKE '%' || p_search || '%')
    AND (p_tier_filter IS NULL OR p.subscription_tier = p_tier_filter)
    AND (p_status_filter IS NULL OR p.subscription_status = p_status_filter);

  -- Fetch paginated results with usage counts.
  -- The subquery handles filtering, sorting, and pagination.
  -- The outer jsonb_agg uses sub.created_at/sub.email for deterministic array order.
  SELECT COALESCE(jsonb_agg(row_data ORDER BY
    CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'desc' THEN sub.created_at END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'asc' THEN sub.created_at END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'email' AND p_sort_dir = 'desc' THEN sub.email END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'email' AND p_sort_dir = 'asc' THEN sub.email END ASC NULLS LAST
  ), '[]'::jsonb)
  INTO v_users
  FROM (
    SELECT jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'subscription_tier', p.subscription_tier,
      'subscription_status', p.subscription_status,
      'subscription_expires_at', p.subscription_expires_at,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'effective_tier', public.get_effective_tier(p.id),
      'categories_count', (SELECT COUNT(*) FROM public.user_categories c WHERE c.user_id = p.id),
      'datasources_count', (SELECT COUNT(*) FROM public.user_datasources d WHERE d.user_id = p.id AND d.deleted = false),
      'templates_count', (SELECT COUNT(*) FROM public.user_templates t WHERE t.user_id = p.id)
    ) AS row_data,
    p.created_at,
    p.email
    FROM public.user_profiles p
    WHERE (p_search IS NULL OR p.email ILIKE '%' || p_search || '%')
      AND (p_tier_filter IS NULL OR p.subscription_tier = p_tier_filter)
      AND (p_status_filter IS NULL OR p.subscription_status = p_status_filter)
    ORDER BY
      CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'desc' THEN p.created_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'created_at' AND p_sort_dir = 'asc' THEN p.created_at END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'email' AND p_sort_dir = 'desc' THEN p.email END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'email' AND p_sort_dir = 'asc' THEN p.email END ASC NULLS LAST
    LIMIT p_limit OFFSET p_offset
  ) sub;

  RETURN jsonb_build_object(
    'data', v_users,
    'total', v_total,
    'limit', p_limit,
    'offset', p_offset
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 4b. Get detailed user information
CREATE OR REPLACE FUNCTION public.admin_get_user_detail(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING HINT = 'Only admin users can perform this action';
  END IF;

  SELECT jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'subscription_tier', p.subscription_tier,
    'subscription_status', p.subscription_status,
    'subscription_expires_at', p.subscription_expires_at,
    'creem_product_id', p.creem_product_id,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'effective_tier', public.get_effective_tier(p.id),
    'usage', jsonb_build_object(
      'categories', (SELECT COUNT(*) FROM public.user_categories c WHERE c.user_id = p.id),
      'datasources', (SELECT COUNT(*) FROM public.user_datasources d WHERE d.user_id = p.id AND d.deleted = false),
      'templates', (SELECT COUNT(*) FROM public.user_templates t WHERE t.user_id = p.id),
      'published_datasources', (SELECT COUNT(*) FROM public.user_datasources d WHERE d.user_id = p.id AND d.is_public = true),
      'published_templates', (SELECT COUNT(*) FROM public.user_templates t WHERE t.user_id = p.id AND t.is_public = true),
      'shared_categories', (SELECT COUNT(*) FROM public.category_shares s WHERE s.user_id = p.id)
    ),
    'tier_limits', public.get_tier_limits(public.get_effective_tier(p.id))
  )
  INTO v_result
  FROM public.user_profiles p
  WHERE p.id = p_user_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND' USING HINT = 'No user found with the given ID';
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 4c. Update a user's subscription tier
CREATE OR REPLACE FUNCTION public.admin_update_user_tier(
  p_user_id UUID,
  p_new_tier TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_old_tier TEXT;
  v_admin_id UUID := auth.uid();
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING HINT = 'Only admin users can perform this action';
  END IF;

  -- Validate tier value
  IF p_new_tier NOT IN ('free', 'premium', 'creator', 'lifetime', 'admin') THEN
    RAISE EXCEPTION 'INVALID_TIER: %', p_new_tier USING HINT = 'Tier must be one of: free, premium, creator, lifetime, admin';
  END IF;

  -- Prevent self-demotion (safety check)
  IF p_user_id = v_admin_id AND p_new_tier != 'admin' THEN
    RAISE EXCEPTION 'CANNOT_DEMOTE_SELF' USING HINT = 'Admins cannot change their own tier';
  END IF;

  -- Get current tier
  SELECT subscription_tier INTO v_old_tier
  FROM public.user_profiles WHERE id = p_user_id;

  IF v_old_tier IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND' USING HINT = 'No user found with the given ID';
  END IF;

  -- Update tier
  UPDATE public.user_profiles
  SET subscription_tier = p_new_tier,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'update_tier', p_user_id, jsonb_build_object(
    'old_tier', v_old_tier,
    'new_tier', p_new_tier
  ));

  RETURN jsonb_build_object(
    'success', true,
    'old_tier', v_old_tier,
    'new_tier', p_new_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4d. Update a user's subscription status
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  p_user_id UUID,
  p_new_status TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_old_status TEXT;
  v_admin_id UUID := auth.uid();
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING HINT = 'Only admin users can perform this action';
  END IF;

  -- Validate status value
  IF p_new_status NOT IN ('active', 'cancelled', 'expired', 'trialing') THEN
    RAISE EXCEPTION 'INVALID_STATUS: %', p_new_status USING HINT = 'Status must be one of: active, cancelled, expired, trialing';
  END IF;

  -- Get current status
  SELECT subscription_status INTO v_old_status
  FROM public.user_profiles WHERE id = p_user_id;

  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND' USING HINT = 'No user found with the given ID';
  END IF;

  -- Update status
  UPDATE public.user_profiles
  SET subscription_status = p_new_status,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Audit log
  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'update_status', p_user_id, jsonb_build_object(
    'old_status', v_old_status,
    'new_status', p_new_status
  ));

  RETURN jsonb_build_object(
    'success', true,
    'old_status', v_old_status,
    'new_status', p_new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4e. Get platform-wide statistics
CREATE OR REPLACE FUNCTION public.admin_get_platform_stats()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING HINT = 'Only admin users can perform this action';
  END IF;

  SELECT jsonb_build_object(
    'users', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM public.user_profiles),
      'by_tier', (
        SELECT jsonb_object_agg(tier, cnt)
        FROM (
          SELECT subscription_tier AS tier, COUNT(*) AS cnt
          FROM public.user_profiles
          GROUP BY subscription_tier
        ) t
      ),
      'by_status', (
        SELECT jsonb_object_agg(status, cnt)
        FROM (
          SELECT subscription_status AS status, COUNT(*) AS cnt
          FROM public.user_profiles
          GROUP BY subscription_status
        ) s
      ),
      'recent_signups_7d', (
        SELECT COUNT(*) FROM public.user_profiles
        WHERE created_at >= NOW() - INTERVAL '7 days'
      ),
      'recent_signups_30d', (
        SELECT COUNT(*) FROM public.user_profiles
        WHERE created_at >= NOW() - INTERVAL '30 days'
      )
    ),
    'content', jsonb_build_object(
      'categories', (SELECT COUNT(*) FROM public.user_categories),
      'datasources', (SELECT COUNT(*) FROM public.user_datasources WHERE deleted = false),
      'templates', (SELECT COUNT(*) FROM public.user_templates),
      'published_datasources', (SELECT COUNT(*) FROM public.user_datasources WHERE is_public = true),
      'published_templates', (SELECT COUNT(*) FROM public.user_templates WHERE is_public = true),
      'shared_categories', (SELECT COUNT(*) FROM public.category_shares)
    )
  )
  INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 4f. Get paginated audit log
-- Paginates in a subquery first, then aggregates with deterministic ordering.
CREATE OR REPLACE FUNCTION public.admin_get_audit_log(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_admin_filter UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_total INTEGER;
  v_entries JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING HINT = 'Only admin users can perform this action';
  END IF;

  SELECT COUNT(*)
  INTO v_total
  FROM public.admin_audit_log a
  WHERE (p_admin_filter IS NULL OR a.admin_id = p_admin_filter);

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', sub.id,
    'admin_id', sub.admin_id,
    'admin_email', sub.email,
    'action', sub.action,
    'target_user_id', sub.target_user_id,
    'details', sub.details,
    'created_at', sub.created_at
  ) ORDER BY sub.created_at DESC), '[]'::jsonb)
  INTO v_entries
  FROM (
    SELECT a.id, a.admin_id, p.email, a.action,
           a.target_user_id, a.details, a.created_at
    FROM public.admin_audit_log a
    LEFT JOIN public.user_profiles p ON p.id = a.admin_id
    WHERE (p_admin_filter IS NULL OR a.admin_id = p_admin_filter)
    ORDER BY a.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;

  RETURN jsonb_build_object(
    'data', v_entries,
    'total', v_total,
    'limit', p_limit,
    'offset', p_offset
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- =====================================================
-- 5. Privilege restrictions
-- =====================================================
-- Revoke public access; only authenticated users can call admin RPCs.
-- The runtime is_admin() guard still rejects non-admin authenticated users.

REVOKE ALL ON FUNCTION public.admin_list_users(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_user_detail(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_user_tier(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_user_status(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_platform_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_audit_log(INTEGER, INTEGER, UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_users(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_detail(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_tier(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_audit_log(INTEGER, INTEGER, UUID) TO authenticated;

-- =====================================================
-- 6. Re-analyze affected tables
-- =====================================================

ANALYZE public.user_profiles;
ANALYZE public.admin_audit_log;
