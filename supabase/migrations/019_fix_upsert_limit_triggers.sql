-- =====================================================
-- Game Datacards - Fix Upsert Limit Triggers
-- Migration 019: Skip limit check when row already exists
-- =====================================================
-- PostgreSQL fires BEFORE INSERT triggers before conflict resolution,
-- so upserts on existing rows hit the limit check even though they
-- will resolve to an UPDATE. Adding an early-return EXISTS check
-- lets upsert-updates pass through without triggering the limit.
-- =====================================================

-- =====================================================
-- 1. Fix validate_category_limit - check (user_id, uuid)
-- =====================================================

CREATE OR REPLACE FUNCTION validate_category_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_effective_tier TEXT;
  v_limits JSONB;
  v_max_categories INT;
  v_current_count INT;
BEGIN
  -- Skip limit check if this row already exists (upsert will resolve to UPDATE)
  IF EXISTS (
    SELECT 1 FROM public.user_categories
    WHERE user_id = NEW.user_id AND uuid = NEW.uuid
  ) THEN
    RETURN NEW;
  END IF;

  -- Get effective tier (accounts for expiry)
  v_effective_tier := get_effective_tier(NEW.user_id);

  -- Get limits for this tier
  v_limits := get_tier_limits(v_effective_tier);
  v_max_categories := (v_limits->>'categories')::INT;

  -- Count existing categories for this user
  SELECT COUNT(*) INTO v_current_count
  FROM public.user_categories
  WHERE user_id = NEW.user_id;

  -- Check if limit would be exceeded
  IF v_current_count >= v_max_categories THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:categories:%:%;%',
      v_current_count,
      v_max_categories,
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade your subscription to add more categories';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. Fix validate_datasource_limit - check (user_id, datasource_id)
-- =====================================================

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

-- =====================================================
-- 3. Fix validate_template_limit - check (user_id, uuid)
-- =====================================================

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

  -- Free tier cannot sync any templates
  IF v_max_templates = 0 THEN
    RAISE EXCEPTION 'SUBSCRIPTION_LIMIT_EXCEEDED:templates:0:0;%',
      v_effective_tier
    USING ERRCODE = 'P0001',
          HINT = 'Upgrade to Premium or Creator tier to sync templates';
  END IF;

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
-- 4. Comments
-- =====================================================

COMMENT ON FUNCTION validate_category_limit() IS
  'Trigger function that enforces category limits based on subscription tier. Skips check for upsert-updates on existing rows.';

COMMENT ON FUNCTION validate_datasource_limit() IS
  'Trigger function that enforces datasource limits based on subscription tier. Skips check for upsert-updates on existing rows.';

COMMENT ON FUNCTION validate_template_limit() IS
  'Trigger function that enforces template limits based on subscription tier. Skips check for upsert-updates on existing rows.';
