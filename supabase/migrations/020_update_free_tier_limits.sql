-- =====================================================
-- Game Datacards - Update Free Tier Limits
-- Migration 020: Align database tier limits with frontend constants
-- =====================================================
-- The frontend (src/Premium/constants.js) gives free users 2 templates
-- and 1 datasource, but the database still returned 0 for both.
-- The BEFORE INSERT triggers rejected inserts when the limit was 0,
-- so free users were blocked server-side despite the frontend allowing it.
-- This migration also bumps premium templates to 4 and creator templates
-- to 10 to match the frontend.
-- =====================================================

-- =====================================================
-- 1. Update get_tier_limits to match frontend constants
-- =====================================================

CREATE OR REPLACE FUNCTION get_tier_limits(p_tier TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE p_tier
    WHEN 'lifetime' THEN
      RETURN jsonb_build_object(
        'categories', 999,
        'datasources', 99,
        'templates', 99
      );
    WHEN 'admin' THEN
      RETURN jsonb_build_object(
        'categories', 999,
        'datasources', 99,
        'templates', 99
      );
    WHEN 'creator' THEN
      RETURN jsonb_build_object(
        'categories', 250,
        'datasources', 10,
        'templates', 10
      );
    WHEN 'premium' THEN
      RETURN jsonb_build_object(
        'categories', 50,
        'datasources', 2,
        'templates', 4
      );
    ELSE -- 'free' or any other value
      RETURN jsonb_build_object(
        'categories', 2,
        'datasources', 1,
        'templates', 2
      );
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 2. Remove hard-block-at-zero from validate_datasource_limit
-- =====================================================
-- Free tier now has a non-zero limit, so the normal count-based
-- check handles enforcement. Also ensure soft-deleted rows are
-- excluded from the count (carried forward from migration 019).

CREATE OR REPLACE FUNCTION validate_datasource_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_datasources INT;
  v_current_count INT;
BEGIN
  -- Skip limit check if this row already exists (upsert will resolve to UPDATE)
  IF EXISTS (
    SELECT 1 FROM public.user_datasources
    WHERE user_id = NEW.user_id AND datasource_id = NEW.datasource_id
  ) THEN
    RETURN NEW;
  END IF;

  -- Get effective tier (accounts for expiry)
  v_effective_tier := get_effective_tier(NEW.user_id);

  -- Get limits for this tier
  v_limits := get_tier_limits(v_effective_tier);
  v_max_datasources := (v_limits->>'datasources')::INT;

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

-- =====================================================
-- 3. Remove hard-block-at-zero from validate_template_limit
-- =====================================================
-- Free tier now has a non-zero limit, so the normal count-based
-- check handles enforcement (carried forward from migration 019).

CREATE OR REPLACE FUNCTION validate_template_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_templates INT;
  v_current_count INT;
BEGIN
  -- Skip limit check if this row already exists (upsert will resolve to UPDATE)
  IF EXISTS (
    SELECT 1 FROM public.user_templates
    WHERE user_id = NEW.user_id AND uuid = NEW.uuid
  ) THEN
    RETURN NEW;
  END IF;

  -- Get effective tier (accounts for expiry)
  v_effective_tier := get_effective_tier(NEW.user_id);

  -- Get limits for this tier
  v_limits := get_tier_limits(v_effective_tier);
  v_max_templates := (v_limits->>'templates')::INT;

  -- Count existing templates for this user
  SELECT COUNT(*) INTO v_current_count
  FROM public.user_templates
  WHERE user_id = NEW.user_id;

  -- Check if limit would be exceeded
  IF v_current_count >= v_max_templates THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:templates:%:%;%',
      v_current_count,
      v_max_templates,
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade your subscription to sync more templates';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Update check_subscription_limit to exclude soft-deleted datasources
-- =====================================================

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
  IF p_resource NOT IN ('categories', 'datasources', 'templates') THEN
    RETURN jsonb_build_object(
      'error', 'Invalid resource type. Use ''categories'', ''datasources'', or ''templates'''
    );
  END IF;

  -- Get effective tier
  v_effective_tier := get_effective_tier(p_user_id);

  -- Get limits
  v_limits := get_tier_limits(v_effective_tier);
  v_max_count := (v_limits->>p_resource)::INT;

  -- Get current count
  IF p_resource = 'categories' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_categories
    WHERE user_id = p_user_id;
  ELSIF p_resource = 'datasources' THEN
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_datasources
    WHERE user_id = p_user_id AND deleted = false;
  ELSE -- templates
    SELECT COUNT(*) INTO v_current_count
    FROM public.user_templates
    WHERE user_id = p_user_id;
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

-- =====================================================
-- 5. Update get_subscription_usage to exclude soft-deleted datasources
-- =====================================================

CREATE OR REPLACE FUNCTION get_subscription_usage(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_category_count INT;
  v_datasource_count INT;
  v_template_count INT;
BEGIN
  -- Get effective tier
  v_effective_tier := get_effective_tier(p_user_id);

  -- Get limits
  v_limits := get_tier_limits(v_effective_tier);

  -- Get counts
  SELECT COUNT(*) INTO v_category_count
  FROM public.user_categories
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_datasource_count
  FROM public.user_datasources
  WHERE user_id = p_user_id AND deleted = false;

  SELECT COUNT(*) INTO v_template_count
  FROM public.user_templates
  WHERE user_id = p_user_id;

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
    ),
    'templates', jsonb_build_object(
      'current', v_template_count,
      'limit', (v_limits->>'templates')::INT,
      'remaining', GREATEST(0, (v_limits->>'templates')::INT - v_template_count)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 6. Update comments
-- =====================================================

COMMENT ON FUNCTION get_tier_limits(TEXT) IS
  'Returns the resource limits for a given subscription tier as JSONB. Free: 2/1/2, Premium: 50/2/4, Creator: 250/10/10, Lifetime/Admin: 999/99/99';

COMMENT ON FUNCTION validate_datasource_limit() IS
  'Trigger function that enforces datasource limits based on subscription tier. Skips check for upsert-updates on existing rows. Excludes soft-deleted rows from count.';

COMMENT ON FUNCTION validate_template_limit() IS
  'Trigger function that enforces template limits based on subscription tier. Skips check for upsert-updates on existing rows.';

COMMENT ON TABLE public.user_templates IS
  'Designer templates synced to cloud (2 for free, 4 for premium, 10 for creator, 99 for lifetime/admin)';
